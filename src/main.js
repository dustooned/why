// App wiring for questions, text crawl, sound, and background visuals.
(function attachMainModule() {
  const canvas = document.querySelector("#field");
  const dialogText = document.querySelector("#dialogText");
  const nextButton = document.querySelector("#nextButton");
  const entryGate = document.querySelector("#entryGate");
  const entryButton = document.querySelector("#entryButton");
  let lastQuestionAt = 0;
  const QUESTION_COOLDOWN_MS = 260;
  let hasStarted = false;

  if (!canvas || !dialogText || !nextButton || !entryGate || !entryButton) {
    throw new Error("Why failed to initialize because the required DOM elements were not found.");
  }

  const questionFlow = window.WhyQuestions.createQuestionFlow();
  const background = window.WhyBackground.createBackgroundController(canvas);

  function askQuestion(withSound = true) {
    const question = questionFlow.nextQuestion();
    window.WhySound.stopCharacterBlips();
    window.WhyTypewriter.crawlText(dialogText, question.text, {
      speed: question.crawlSpeed,
      voice: question.id
    });
    background.applyQuestionVisual(question);
    window.WhySound.startAmbientMusic(question.id);

    if (withSound) {
      window.WhySound.playQuestionTone(question.sound);
    }
  }

  async function startExperience() {
    if (hasStarted) {
      return;
    }

    hasStarted = true;
    entryButton.disabled = true;

    try {
      await window.WhySound.unlockAudio();
    } catch (error) {
      console.warn("Why could not fully unlock audio before starting.", error);
    }

    askQuestion(false);
    entryGate.classList.add("is-hidden");
  }

  entryButton.addEventListener("click", () => {
    startExperience();
  });

  nextButton.addEventListener("click", () => {
    if (!hasStarted) {
      return;
    }

    const now = performance.now();

    if (now - lastQuestionAt < QUESTION_COOLDOWN_MS) {
      return;
    }

    lastQuestionAt = now;
    askQuestion(true);
  });
})();
