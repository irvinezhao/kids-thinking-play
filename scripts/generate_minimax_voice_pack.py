#!/usr/bin/env python3
"""Generate local MiniMax T2A prompt audio and update the voice manifest."""

from __future__ import annotations

import argparse
import asyncio
import hashlib
import json
import os
import ssl
import subprocess
from pathlib import Path
from typing import Any

import websockets


ROOT = Path(__file__).resolve().parents[1]
MANIFEST_PATH = ROOT / "public" / "voice" / "manifest.json"
AUDIO_ROOT = ROOT / "public" / "voice" / "audio"
WS_URL = "wss://api.minimaxi.com/ws/v1/t2a_v2"
MODEL = "speech-2.8-hd"
FILE_FORMAT = "mp3"
VOICE_SPEED = 1.25
VOICE_LABELS = {
    "cute_boy": "可爱男童",
    "lovely_girl": "萌萌女童",
}
FEEDBACK_PROMPTS = {
    "answer-correct": "答对啦，真棒！",
    "answer-wrong": "再好好想想呢～",
}
SAMPLE_PROMPTS = [
    ("age2-choice-2000", "哪一个和小苹果一样？", "cute_boy"),
    ("age2-choice-2000", "哪一个和小苹果一样？", "lovely_girl"),
    ("age2-choice-2001", "哪一组香蕉更多？", "lovely_girl"),
]
QUESTION_EXPORT_SCRIPT = r"""
const fs = require('fs');
const path = require('path');
const ts = require('typescript');

const root = process.cwd();
const sourcePath = path.join(root, 'src', 'data', 'questionBank.ts');
const source = fs.readFileSync(sourcePath, 'utf8');
const output = ts.transpileModule(source, {
  compilerOptions: {
    module: ts.ModuleKind.CommonJS,
    target: ts.ScriptTarget.ES2020,
    esModuleInterop: true,
  },
  fileName: sourcePath,
}).outputText;

const moduleObject = { exports: {} };
const localRequire = (id) => {
  if (id === '../types') return {};
  return require(id);
};

new Function('exports', 'require', 'module', '__filename', '__dirname', output)(
  moduleObject.exports,
  localRequire,
  moduleObject,
  sourcePath,
  path.dirname(sourcePath),
);

const questions = moduleObject.exports.generatedQuestions
  .filter((question) => question.status === 'approved')
  .map((question) => ({ id: question.id, prompt: question.prompt }));

process.stdout.write(JSON.stringify(questions));
"""


def load_manifest() -> dict[str, Any]:
    if not MANIFEST_PATH.exists():
        return {"version": 2, "baseUrl": "./audio/", "entries": {}, "prompts": {}, "cloudTtsUrlTemplate": ""}
    return json.loads(MANIFEST_PATH.read_text(encoding="utf-8"))


def save_manifest(manifest: dict[str, Any]) -> None:
    MANIFEST_PATH.write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


async def synthesize_prompt(api_key: str, question_id: str, prompt: str, voice_id: str) -> bytes:
    ssl_context = ssl.create_default_context()
    headers = {"Authorization": f"Bearer {api_key}"}

    async with websockets.connect(WS_URL, additional_headers=headers, ssl=ssl_context) as websocket:
        connected = json.loads(await websocket.recv())
        if connected.get("event") != "connected_success":
            raise RuntimeError(f"MiniMax connection failed: {connected}")

        await websocket.send(
            json.dumps(
                {
                    "event": "task_start",
                    "model": MODEL,
                    "voice_setting": {
                        "voice_id": voice_id,
                        "speed": VOICE_SPEED,
                        "vol": 1,
                        "pitch": 0,
                        "english_normalization": False,
                    },
                    "audio_setting": {
                        "sample_rate": 32000,
                        "bitrate": 128000,
                        "format": FILE_FORMAT,
                        "channel": 1,
                    },
                },
                ensure_ascii=False,
            )
        )
        started = json.loads(await websocket.recv())
        if started.get("event") != "task_started":
            raise RuntimeError(f"MiniMax task start failed for {question_id}: {started}")

        await websocket.send(json.dumps({"event": "task_continue", "text": prompt}, ensure_ascii=False))
        audio = bytearray()
        while True:
            response = json.loads(await websocket.recv())
            chunk = response.get("data", {}).get("audio")
            if chunk:
                audio.extend(bytes.fromhex(chunk))
            if response.get("is_final"):
                break

        await websocket.send(json.dumps({"event": "task_finish"}))

    if not audio:
        raise RuntimeError(f"MiniMax returned empty audio for {question_id}")
    return bytes(audio)


def load_generated_question_prompts() -> list[tuple[str, str]]:
    result = subprocess.run(
        ["node", "-e", QUESTION_EXPORT_SCRIPT],
        cwd=ROOT,
        check=True,
        capture_output=True,
        text=True,
    )
    questions = json.loads(result.stdout)
    return [(item["id"], item["prompt"]) for item in questions]


def prompt_stem(prompt: str) -> str:
    return f"prompt-{hashlib.sha1(prompt.encode('utf-8')).hexdigest()[:12]}"


def update_manifest_entry(
    manifest: dict[str, Any],
    manifest_key: str,
    voice_id: str,
    relative_path: str,
    *,
    group: str = "entries",
) -> None:
    manifest["version"] = 2
    manifest["baseUrl"] = "./audio/"
    manifest.setdefault("entries", {})
    manifest.setdefault("prompts", {})
    manifest.setdefault("cloudTtsUrlTemplate", "")
    manifest.setdefault("feedback", {})
    manifest.setdefault("defaultVoice", "lovely_girl")
    voices = manifest.setdefault("voices", {})
    voice_pack = voices.setdefault(voice_id, {"label": VOICE_LABELS[voice_id], "entries": {}, "prompts": {}})
    voice_pack["label"] = VOICE_LABELS[voice_id]
    voice_pack.setdefault(group, {})[manifest_key] = relative_path
    if group == "feedback":
        manifest["feedback"].setdefault(voice_id, {})[manifest_key] = relative_path
    voice_pack.setdefault("prompts", {})


async def generate_items(
    api_key: str,
    items: list[tuple[str, str, str, str, str]],
    overwrite: bool,
    manifest: dict[str, Any],
    concurrency: int,
) -> list[str]:
    total = len(items)
    semaphore = asyncio.Semaphore(concurrency)
    errors: list[str] = []

    async def generate_one(index: int, item: tuple[str, str, str, str, str]) -> None:
        manifest_key, prompt, voice_id, group, file_stem = item
        if voice_id not in VOICE_LABELS:
            raise ValueError(f"Unsupported voice id: {voice_id}")
        output_dir = AUDIO_ROOT / voice_id / group
        output_dir.mkdir(parents=True, exist_ok=True)
        output_path = output_dir / f"{file_stem}.{FILE_FORMAT}"
        if output_path.exists() and not overwrite:
            print(f"[{index}/{total}] skip existing {output_path.relative_to(ROOT)}")
        else:
            async with semaphore:
                print(f"[{index}/{total}] generating {voice_id} {group} {file_stem}: {prompt}")
                last_error: Exception | None = None
                for attempt in range(1, 6):
                    try:
                        output_path.write_bytes(await synthesize_prompt(api_key, file_stem, prompt, voice_id))
                        last_error = None
                        break
                    except Exception as error:
                        last_error = error
                        if attempt < 5:
                            await asyncio.sleep(2.5 * attempt)
                if last_error:
                    errors.append(f"{voice_id}/{group}/{file_stem}: {last_error}")
                    print(f"[{index}/{total}] failed {voice_id} {group} {file_stem}: {last_error}")
                    return
        relative_path = f"{voice_id}/{group}/{output_path.name}"
        update_manifest_entry(manifest, manifest_key, voice_id, relative_path, group=group)

    await asyncio.gather(*(generate_one(index, item) for index, item in enumerate(items, start=1)))
    return errors


async def generate_samples(api_key: str, overwrite: bool) -> None:
    manifest = load_manifest()
    errors = await generate_items(
        api_key,
        [(qid, prompt, voice, "entries", qid) for qid, prompt, voice in SAMPLE_PROMPTS],
        overwrite,
        manifest,
        2,
    )
    save_manifest(manifest)
    if errors:
        raise RuntimeError("MiniMax generation failed for:\n" + "\n".join(errors[:20]))
    print(f"updated {MANIFEST_PATH.relative_to(ROOT)}")


async def generate_all(api_key: str, overwrite: bool, voices: list[str], concurrency: int) -> None:
    manifest = load_manifest()
    question_prompts = load_generated_question_prompts()
    unique_prompts = sorted({prompt for _, prompt in question_prompts})
    items: list[tuple[str, str, str, str, str]] = []
    for voice_id in voices:
        items.extend((prompt, prompt, voice_id, "prompts", prompt_stem(prompt)) for prompt in unique_prompts)
        items.extend(
            (feedback_id, prompt, voice_id, "feedback", feedback_id)
            for feedback_id, prompt in FEEDBACK_PROMPTS.items()
        )
    errors = await generate_items(api_key, items, overwrite, manifest, concurrency)
    save_manifest(manifest)
    print(f"covered {len(question_prompts)} questions using {len(unique_prompts)} unique prompts for {', '.join(voices)}")
    print(f"updated {MANIFEST_PATH.relative_to(ROOT)}")
    if errors:
        raise RuntimeError("MiniMax generation failed for:\n" + "\n".join(errors[:20]))


def main() -> None:
    parser = argparse.ArgumentParser(description="Generate MiniMax prompt voice files.")
    parser.add_argument(
        "--mode",
        choices=["test", "all"],
        default="test",
        help="Generate 3 sample prompts or all approved generated questions plus feedback voices.",
    )
    parser.add_argument(
        "--voice",
        action="append",
        choices=sorted(VOICE_LABELS),
        help="Voice id to generate in all mode. Repeat to select multiple voices. Defaults to both voices.",
    )
    parser.add_argument("--concurrency", type=int, default=4, help="Concurrent MiniMax websocket jobs in all mode.")
    parser.add_argument("--overwrite", action="store_true", help="Regenerate files even if they already exist.")
    args = parser.parse_args()

    api_key = os.getenv("MINIMAX_API_KEY")
    if not api_key:
        raise SystemExit("MINIMAX_API_KEY is required; keep it in your shell environment, not in the repo.")

    if args.mode == "test":
        asyncio.run(generate_samples(api_key, args.overwrite))
    else:
        voices = args.voice or sorted(VOICE_LABELS)
        asyncio.run(generate_all(api_key, args.overwrite, voices, max(1, args.concurrency)))


if __name__ == "__main__":
    main()
