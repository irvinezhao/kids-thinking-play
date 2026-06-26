# Voice Pack

`manifest.json` lets the app prefer recorded or cloud-generated human voice for question prompts and answer feedback.

Use one of these approaches:

- Put prompt MP3 files in `public/voice/audio/` and map question IDs in `entries`.
- Put per-voice prompt MP3 files under `public/voice/audio/lovely_girl/` or `public/voice/audio/cute_boy/` and map them in `voices.<voiceId>.entries`.
- Map repeated prompt text in `prompts` when several questions share the same recording.
- Map answer feedback in `voices.<voiceId>.feedback`, for example `answer-correct` and `answer-wrong`.
- Set `cloudTtsUrlTemplate` to a server-side TTS endpoint, for example `/api/tts?text={text}&id={id}`.

MiniMax test samples can be generated with:

```bash
MINIMAX_API_KEY=... npm run voice:minimax:test
```

Generate the full current question-bank voice pack and feedback voices with:

```bash
MINIMAX_API_KEY=... npm run voice:minimax:all -- --concurrency 1
```

Keep the API key in the shell environment only. Do not commit it to the repo.

The app falls back to browser Mandarin speech only when no recorded or cloud voice URL is available.
