// Copia el contenido (backend/app/content/*.json) al build estático en
// dist/content/, para que la versión de GitHub Pages lo sirva sin backend.
// Se ejecuta tras `vite build`. Es inofensivo en el build con backend
// (esos archivos simplemente no se usan).
import { cp, mkdir, access } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

const here = path.dirname(fileURLToPath(import.meta.url)); // frontend/scripts
const src = path.resolve(here, "../../backend/app/content");
const dst = path.resolve(here, "../dist/content");

try {
  await access(src);
} catch {
  console.warn("[copy-content] no se encontró", src, "— se omite.");
  process.exit(0);
}

await mkdir(dst, { recursive: true });
await cp(src, dst, { recursive: true });
console.log("[copy-content] contenido copiado ->", dst);
