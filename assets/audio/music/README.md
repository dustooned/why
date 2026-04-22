# Music Files

Put looping background tracks in this folder.

Current fallback file:

- `ambient.wav`

Expected per-question tracks:

- `room-shift-ambient.wav`
- `door-memory-ambient.wav`
- `sound-before-thought-ambient.wav`
- `answer-next-click-ambient.wav`
- `background-moving-ambient.wav`
- `sentence-chose-you-ambient.wav`
- `quiet-louder-ambient.wav`
- `happened-before-ambient.wav`

These files are resolved through `src/manifest.js`. `ambient.wav` is the fallback path in `AUDIO_SETTINGS.music.path` inside `src/sound.js`.
