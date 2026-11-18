// Cliente mínimo de Cloudflare R2 (API compatible con S3) con firma SigV4,
// sin dependencias: subir (PUT), comprobar (HEAD) y listar objetos.
import crypto from "node:crypto";

const sha256 = (data) => crypto.createHash("sha256").update(data).digest("hex");
const hmac = (key, data) => crypto.createHmac("sha256", key).update(data).digest();
const enc = (s) => encodeURIComponent(s).replace(/[!'()*]/g, (c) => "%" + c.charCodeAt(0).toString(16).toUpperCase());

// Firma una petición S3. Exportada para poder probarla con los ejemplos de AWS.
export function signRequest({ method, host, path, query = {}, headers = {}, body = "", region, accessKeyId, secretAccessKey, date = new Date() }) {
  const amzDate = date.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
  const day = amzDate.slice(0, 8);
  const payloadHash = sha256(body);
  const all = { ...headers, host, "x-amz-content-sha256": payloadHash, "x-amz-date": amzDate };
  const names = Object.keys(all).map((h) => h.toLowerCase()).sort();
  const lower = Object.fromEntries(Object.entries(all).map(([k, v]) => [k.toLowerCase(), String(v).trim()]));
  const canonHeaders = names.map((n) => `${n}:${lower[n]}\n`).join("");
  const signed = names.join(";");
  const canonQuery = Object.keys(query)
    .sort()
    .map((k) => `${enc(k)}=${enc(query[k])}`)
    .join("&");
  const canonPath = path.split("/").map(enc).join("/");
  const canonical = [method, canonPath, canonQuery, canonHeaders, signed, payloadHash].join("\n");
  const scope = `${day}/${region}/s3/aws4_request`;
  const toSign = ["AWS4-HMAC-SHA256", amzDate, scope, sha256(canonical)].join("\n");
  const kSigning = hmac(hmac(hmac(hmac("AWS4" + secretAccessKey, day), region), "s3"), "aws4_request");
  const signature = crypto.createHmac("sha256", kSigning).update(toSign).digest("hex");
  return {
    url: `https://${host}${canonPath}${canonQuery ? "?" + canonQuery : ""}`,
    headers: {
      ...all,
      authorization: `AWS4-HMAC-SHA256 Credential=${accessKeyId}/${scope}, SignedHeaders=${signed}, Signature=${signature}`,
    },
    signature,
  };
}

export function r2Client({ accountId, accessKeyId, secretAccessKey, bucket }) {
  const host = `${accountId}.r2.cloudflarestorage.com`;
  const base = { host, region: "auto", accessKeyId, secretAccessKey };
  return {
    async put(key, body, contentType) {
      const req = signRequest({
        ...base,
        method: "PUT",
        path: `/${bucket}/${key}`,
        body,
        headers: { "content-type": contentType, "cache-control": "public, max-age=31536000, immutable" },
      });
      const res = await fetch(req.url, { method: "PUT", headers: req.headers, body });
      if (!res.ok) throw new Error(`R2 PUT ${res.status}: ${(await res.text()).slice(0, 300)}`);
    },
    // Todas las claves bajo un prefijo (para reconstruir el estado local).
    async list(prefix) {
      const keys = [];
      let token;
      do {
        const query = { "list-type": "2", prefix, "max-keys": "1000", ...(token ? { "continuation-token": token } : {}) };
        const req = signRequest({ ...base, method: "GET", path: `/${bucket}`, query });
        const res = await fetch(req.url, { headers: req.headers });
        const xml = await res.text();
        if (!res.ok) throw new Error(`R2 LIST ${res.status}: ${xml.slice(0, 300)}`);
        for (const m of xml.matchAll(/<Key>([^<]+)<\/Key>/g)) keys.push(m[1]);
        token = /<IsTruncated>true<\/IsTruncated>/.test(xml) ? xml.match(/<NextContinuationToken>([^<]+)</)?.[1] : null;
      } while (token);
      return keys;
    },
  };
}
