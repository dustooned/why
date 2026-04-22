# Why

A small vanilla JavaScript experiment for clickable dialog, crawling text, pixel-style graphics, generated tones, question-specific voice clips, and per-question looping music.

## Start

Open [index.html](E:/2026/Dev/Experiment/Why/index.html) directly in the browser. The project is designed to run from `file:///` without a local dev server.

## Structure

- `src/manifest.js` is the single source of truth for per-question asset filenames.
- `src/questions.js` owns question content and no-repeat progression.
- `src/typewriter.js` owns the text crawl effect.
- `src/sound.js` owns generated tones, question voice clips, and looping music.
- `src/background.js` owns canvas rendering, image placement, and screen motion.
- `src/main.js` wires the experience together.

## Asset Layout

Per-question asset identity is defined in `src/manifest.js`. Each entry can declare:

- `voice`: the typewriter clip filename from `assets/audio/sfx/`
- `graphic`: the image filename from `assets/images/`
- `music`: the looping background track filename from `assets/audio/music/`

### Voice Clips

Put question voice clips in `assets/audio/sfx/`.

Expected files:

- `assets/audio/sfx/room-shift.wav`
- `assets/audio/sfx/door-memory.wav`
- `assets/audio/sfx/sound-before-thought.wav`
- `assets/audio/sfx/answer-next-click.wav`
- `assets/audio/sfx/background-moving.wav`
- `assets/audio/sfx/sentence-chose-you.wav`
- `assets/audio/sfx/quiet-louder.wav`
- `assets/audio/sfx/happened-before.wav`

### Music

Put looping background tracks in `assets/audio/music/`.

Expected files:

- `assets/audio/music/ambient.wav`
- `assets/audio/music/room-shift-ambient.wav`
- `assets/audio/music/door-memory-ambient.wav`
- `assets/audio/music/sound-before-thought-ambient.wav`
- `assets/audio/music/answer-next-click-ambient.wav`
- `assets/audio/music/background-moving-ambient.wav`
- `assets/audio/music/sentence-chose-you-ambient.wav`
- `assets/audio/music/quiet-louder-ambient.wav`
- `assets/audio/music/happened-before-ambient.wav`

`ambient.wav` remains the fallback music track if a manifest entry does not define `music`.

### Images

Put question graphics in `assets/images/` as `.png` files:

- `assets/images/room-shift.png`
- `assets/images/door-memory.png`
- `assets/images/sound-before-thought.png`
- `assets/images/answer-next-click.png`
- `assets/images/background-moving.png`
- `assets/images/sentence-chose-you.png`
- `assets/images/quiet-louder.png`
- `assets/images/happened-before.png`

## Tuning

### Background Graphics

Tune image behavior in `src/background.js` under `GRAPHIC_SETTINGS`:

- `sizeRatio`: image size relative to the shorter viewport side
- `xRatio` and `yRatio`: anchor position on the canvas
- `xOffset` and `yOffset`: pixel nudges from that anchor
- `floatXAmplitude` and `floatYAmplitude`: drift distance
- `floatXSpeed` and `floatYSpeed`: drift speed
- `rotationDegrees`: maximum rotation swing
- `rotationSpeed`: rotation motion speed
- `baseOpacity`: image opacity multiplier
- `fadeEasing`: fade-in easing for a new question image

### Audio

Tune audio behavior in `src/sound.js` under `AUDIO_SETTINGS`:

- `sfx.path`: folder for question voice clips
- `sfx.characterInterval`: how often the typewriter triggers a clip
- `sfx.characterVolume`: voice clip volume
- `sfx.characterPlaybackRate`: voice clip playback rate
- `sfx.toneVolumeScale`: generated question tone loudness
- `music.path`: fallback loop path
- `music.volume`: music volume
- `music.playbackRate`: music playback rate
- `music.loop`: loop toggle
- `music.fadeDurationMs`: crossfade duration between tracks

## Notes

- Browser-side testing is still manual.
- Asset filenames should stay in `src/manifest.js`, not in `src/questions.js`.
- The canvas currently renders images with `imageSmoothingEnabled = false` for sharper pixel edges when scaling.
