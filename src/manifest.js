// 🗂️ WHERE: manifest.js / asset manifest
// WHAT: Centralizes question metadata and asset filenames so other modules do not duplicate mappings.
(function attachManifestModule() {
  const QUESTION_MANIFEST = [
    {
      id: "room-shift",
      voice: "room-shift.wav",
      graphic: "room-shift.png",
      music: "room-shift-ambient.wav"
    },
    {
      id: "door-memory",
      voice: "door-memory.wav",
      graphic: "door-memory.png",
      music: "door-memory-ambient.wav"
    },
    {
      id: "sound-before-thought",
      voice: "sound-before-thought.wav",
      graphic: "sound-before-thought.png",
      music: "sound-before-thought-ambient.wav"
    },
    {
      id: "answer-next-click",
      voice: "answer-next-click.wav",
      graphic: "answer-next-click.png",
      music: "answer-next-click-ambient.wav"
    },
    {
      id: "background-moving",
      voice: "background-moving.wav",
      graphic: "background-moving.png",
      music: "background-moving-ambient.wav"
    },
    {
      id: "sentence-chose-you",
      voice: "sentence-chose-you.wav",
      graphic: "sentence-chose-you.png",
      music: "sentence-chose-you-ambient.wav"
    },
    {
      id: "quiet-louder",
      voice: "quiet-louder.wav",
      graphic: "quiet-louder.png",
      music: "quiet-louder-ambient.wav"
    },
    {
      id: "happened-before",
      voice: "happened-before.wav",
      graphic: "happened-before.png",
      music: "happened-before-ambient.wav"
    }
  ];

  // 🔎 WHERE: manifest.js / manifest lookup
  // WHAT: Creates a fast lookup table so modules can resolve filenames from a question id.
  const questionAssetsById = QUESTION_MANIFEST.reduce((lookup, entry) => {
    lookup[entry.id] = entry;
    return lookup;
  }, {});

  window.WhyManifest = {
    QUESTION_MANIFEST,
    questionAssetsById
  };
})();
