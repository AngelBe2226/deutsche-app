"""Voz alemana local con Piper (gratis, en este Mac), en MP3.

Modelos en scripts/audio/.models (no se suben a git). Voz por defecto:
de_DE-thorsten-high (dataset Thorsten-Voice, licencia CC0: uso comercial libre).

Uso como módulo:  from piper_tts import Voice; Voice("de_DE-thorsten-high").mp3("Guten Tag")
Uso por línea de comandos (lotes, lo usa el generador):
    .venv/bin/python piper_tts.py --model de_DE-thorsten-high --out DIR < lista.jsonl
  cada línea: {"id": "...", "text": "..."}  →  DIR/<id>.mp3
"""
import argparse
import json
import sys
from pathlib import Path

import lameenc
import numpy as np
from piper import PiperVoice, SynthesisConfig

HERE = Path(__file__).resolve().parent
MODELS = HERE / ".models"


class Voice:
    def __init__(self, model="de_DE-thorsten-high", speaker=None, length_scale=1.05, bitrate=48):
        self.voice = PiperVoice.load(str(MODELS / f"{model}.onnx"))
        self.rate = self.voice.config.sample_rate
        sid = None
        if speaker is not None:
            ids = self.voice.config.speaker_id_map or {}
            sid = ids.get(str(speaker), int(speaker) if str(speaker).isdigit() else None)
        self.cfg = SynthesisConfig(speaker_id=sid, length_scale=length_scale)
        self.bitrate = bitrate

    def samples(self, text):
        chunks = [c.audio_float_array for c in self.voice.synthesize(text, self.cfg)]
        if not chunks:
            return np.zeros(1, dtype=np.float32)
        # Pausa breve entre frases de un texto largo
        gap = np.zeros(int(0.25 * self.rate), dtype=np.float32)
        out = []
        for i, c in enumerate(chunks):
            if i:
                out.append(gap)
            out.append(c)
        return np.concatenate(out)

    def encode(self, audio):
        # Recorta el silencio de los extremos y deja un margen corto y uniforme.
        loud = np.where(np.abs(audio) > 0.01)[0]
        if len(loud):
            pad = int(0.08 * self.rate)
            audio = audio[max(0, loud[0] - pad) : loud[-1] + pad]
        pcm = (np.clip(audio, -1, 1) * 32767).astype(np.int16).tobytes()
        enc = lameenc.Encoder()
        enc.set_bit_rate(self.bitrate)
        enc.set_in_sample_rate(self.rate)
        enc.set_channels(1)
        enc.set_quality(2)
        return enc.encode(pcm) + enc.flush()

    def mp3(self, text):
        return self.encode(self.samples(text))


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--model", default="de_DE-thorsten-high")
    ap.add_argument("--speaker", default=None)
    ap.add_argument("--length-scale", type=float, default=1.05)
    ap.add_argument("--out", required=True)
    a = ap.parse_args()
    out = Path(a.out)
    out.mkdir(parents=True, exist_ok=True)
    v = Voice(a.model, a.speaker, a.length_scale)
    for line in sys.stdin:
        if not line.strip():
            continue
        item = json.loads(line)
        try:
            (out / f"{item['id']}.mp3").write_bytes(v.mp3(item["text"]))
            print(json.dumps({"id": item["id"], "ok": True}), flush=True)
        except Exception as e:  # noqa: BLE001 — se informa y se sigue con el resto
            print(json.dumps({"id": item["id"], "ok": False, "error": str(e)}), flush=True)


if __name__ == "__main__":
    main()
