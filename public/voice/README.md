# Voice Pack

`manifest.json` lets the app prefer recorded or cloud-generated human voice for question prompts.

Use one of these approaches:

- Put prompt MP3 files in `public/voice/audio/` and map question IDs in `entries`.
- Map repeated prompt text in `prompts` when several questions share the same recording.
- Set `cloudTtsUrlTemplate` to a server-side TTS endpoint, for example `/api/tts?text={text}&id={id}`.

The app falls back to browser Mandarin speech only when no recorded or cloud voice URL is available.
