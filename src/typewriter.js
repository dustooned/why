// 🧵 WHERE: typewriter.js / crawl state
// WHAT: Tracks the newest text crawl so older unfinished crawls can cancel themselves.
(function attachTypewriterModule() {
  let activeRun = 0;
  let visibleCharacterCount = 0;

  // ⌨️ WHERE: typewriter.js / dialog text effect
  // WHAT: Reveals text one character at a time inside the chosen element.
  function crawlText(element, text, options = {}) {
    const speed = options.speed || 28;
    const voice = options.voice || "default";
    activeRun += 1;
    const runId = activeRun;
    visibleCharacterCount = 0;
    element.textContent = "";

    [...text].forEach((character, index) => {
      window.setTimeout(() => {
        if (runId !== activeRun) {
          return;
        }

        element.textContent += character;

        if (!character.trim()) {
          return;
        }

        visibleCharacterCount += 1;

        if (window.WhySound.shouldPlayCharacterBlip(visibleCharacterCount)) {
          window.WhySound.playCharacterBlip(voice);
        }
      }, index * speed);
    });
  }

  window.WhyTypewriter = {
    crawlText
  };
})();
