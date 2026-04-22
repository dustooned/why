// App wiring for questions, text crawl, sound, and background visuals.
(function attachMainModule() {
  const canvas = document.querySelector("#field");
  const dialogText = document.querySelector("#dialogText");
  const nextButton = document.querySelector("#nextButton");
  let lastQuestionAt = 0;
  const QUESTION_COOLDOWN_MS = 260;

  if (!canvas || !dialogText || !nextButton) {
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

  askQuestion(false);

  nextButton.addEventListener("click", () => {
    const now = performance.now();

    if (now - lastQuestionAt < QUESTION_COOLDOWN_MS) {
      return;
    }

    lastQuestionAt = now;
    askQuestion(true);
  });
})();
