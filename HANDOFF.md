# Why Handoff

## Current Structure

- `src/manifest.js`
  - Single source of truth for per-question assets.
  - Maps each question `id` to:
    - `voice`
    - `graphic`
    - `music`

- `src/questions.js`
  - Owns question content and progression logic.
  - No-repeat flow with phases:
    - `opening`
    - `middle`
    - `late`

- `src/typewriter.js`
  - Owns crawl text behavior.
  - Plays character SFX through `WhySound`.

- `src/sound.js`
  - Owns generated tones, character voice playback, and per-question looping music.
  - Main tuning surface: `AUDIO_SETTINGS`

- `src/background.js`
  - Owns canvas background, mouse brightness, and per-question PNG drawing.
  - Main tuning surfaces:
    - `BRIGHTNESS_SETTINGS`
    - `GRAPHIC_SETTINGS`

- `src/main.js`
  - Wires the modules together.

## Asset Conventions

### Audio

Folders:

- `assets/audio/sfx/`
- `assets/audio/music/`

Expected question voice files:

- `room-shift.wav`
- `door-memory.wav`
- `sound-before-thought.wav`
- `answer-next-click.wav`
- `background-moving.wav`
- `sentence-chose-you.wav`
- `quiet-louder.wav`
- `happened-before.wav`

Fallback music track:

- `ambient.wav`

Expected per-question music tracks:

- `room-shift-ambient.wav`
- `door-memory-ambient.wav`
- `sound-before-thought-ambient.wav`
- `answer-next-click-ambient.wav`
- `background-moving-ambient.wav`
- `sentence-chose-you-ambient.wav`
- `quiet-louder-ambient.wav`
- `happened-before-ambient.wav`

### Images

Folder:

- `assets/images/`

Expected question graphic files:

- `room-shift.png`
- `door-memory.png`
- `sound-before-thought.png`
- `answer-next-click.png`
- `background-moving.png`
- `sentence-chose-you.png`
- `quiet-louder.png`
- `happened-before.png`

## Important Parameters

### Audio

In `src/sound.js` under `AUDIO_SETTINGS`:

- `sfx.path`
- `sfx.characterInterval`
- `sfx.characterVolume`
- `sfx.characterPlaybackRate`
- `sfx.toneVolumeScale`
- `music.path`
- `music.volume`
- `music.playbackRate`
- `music.loop`
- `music.fadeDurationMs`

### Graphics

In `src/background.js` under `GRAPHIC_SETTINGS`:

- `sizeRatio`
- `xRatio`
- `yRatio`
- `xOffset`
- `yOffset`
- `floatXAmplitude`
- `floatYAmplitude`
- `floatXSpeed`
- `floatYSpeed`
- `rotationDegrees`
- `rotationSpeed`
- `baseOpacity`
- `fadeEasing`

## Current Notes

- Project runs from `file:///` without needing a local server.
- Asset identity should stay in `src/manifest.js`.
- Question content should stay in `src/questions.js`.
- Browser-side testing has been manual only.
- Audio is now split by role:
  - `assets/audio/sfx` for question voice clips
  - `assets/audio/music` for looping tracks
- Image rendering currently disables smoothing for sharper scaled pixel edges.
- Local git repo is initialized and pushed to:
  - `https://github.com/dustooned/why`
- GitHub Pages was configured for `main` and `/ (root)`, but the public Pages URL was still returning `404` at last check:
  - `https://dustooned.github.io/why/`
- Current image sizing in `src/background.js` is driven by `GRAPHIC_SETTINGS.sizeRatio`, and the current value is aggressive enough that mobile/responsive behavior should be reviewed before more art tuning.

## Good Next Feature Directions

- Review mobile layout and auto-resize behavior:
  - make image scale and dialog layout behave predictably on smaller screens
  - check whether `sizeRatio`, text sizing, and dialog width need viewport-aware rules
- Add a visible phase indicator or mood indicator.
- Add punctuation-aware typewriter sound rules.
- Add per-question or per-mood image scale/opacity overrides.
- Add branching question groups instead of only weighted progression.
