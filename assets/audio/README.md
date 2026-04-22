# Audio Files

Audio is split by role:

- `assets/audio/sfx/` contains question voice clips used by the typewriter.
- `assets/audio/music/` contains looping background tracks.

Voice and music filenames map directly from `src/manifest.js`.
The typewriter cadence is controlled by `AUDIO_SETTINGS.sfx.characterInterval` in `src/sound.js`.
`assets/audio/music/ambient.wav` is the fallback loop.
Each `*-ambient.wav` file is the question-specific background track for the matching question id.
