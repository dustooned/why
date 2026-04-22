// 📚 WHERE: questions.js / modular prompt data
// WHAT: Stores each question as a reusable data object instead of plain text.
(function attachQuestionsModule() {
  const questionBank = [
    {
      id: "room-shift",
      text: "Why does the room feel different after the question is asked?",
      phase: "opening",
      mood: "uneasy",
      sound: "thud",
      visual: "ember",
      crawlSpeed: 26,
      weight: 2
    },
    {
      id: "door-memory",
      text: "Why do you remember the door but not what it opened into?",
      phase: "opening",
      mood: "hushed",
      sound: "hollow",
      visual: "drift",
      crawlSpeed: 30,
      weight: 2
    },
    {
      id: "sound-before-thought",
      text: "Why does the sound arrive before the thought?",
      phase: "opening",
      mood: "curious",
      sound: "glass",
      visual: "signal",
      crawlSpeed: 28,
      weight: 1
    },
    {
      id: "answer-next-click",
      text: "Why is the answer waiting behind the next click?",
      phase: "middle",
      mood: "playful",
      sound: "spark",
      visual: "pulse",
      crawlSpeed: 24,
      weight: 2
    },
    {
      id: "background-moving",
      text: "Why does the background keep moving when everything else stops?",
      phase: "middle",
      mood: "distant",
      sound: "hollow",
      visual: "drift",
      crawlSpeed: 29,
      weight: 1
    },
    {
      id: "sentence-chose-you",
      text: "Why did that sentence choose you?",
      phase: "middle",
      mood: "intimate",
      sound: "glass",
      visual: "veil",
      crawlSpeed: 31,
      weight: 1
    },
    {
      id: "quiet-louder",
      text: "Why is the quiet part getting louder?",
      phase: "late",
      mood: "uneasy",
      sound: "thud",
      visual: "pulse",
      crawlSpeed: 27,
      weight: 2
    },
    {
      id: "happened-before",
      text: "Why are you certain this has happened before?",
      phase: "late",
      mood: "haunting",
      sound: "hollow",
      visual: "signal",
      crawlSpeed: 33,
      weight: 1
    }
  ];

  // 🪜 WHERE: questions.js / phase order
  // WHAT: Defines how the experience opens, deepens, and gets stranger over time.
  const phaseOrder = ["opening", "middle", "late"];

  // ⏱️ WHERE: questions.js / phase lookup
  // WHAT: Chooses which phases are unlocked based on how many questions have been shown.
  function getUnlockedPhases(step) {
    if (step < 2) {
      return ["opening"];
    }

    if (step < 5) {
      return ["opening", "middle"];
    }

    return phaseOrder;
  }

  // 🎲 WHERE: questions.js / weighted picker
  // WHAT: Chooses one question from a pool while respecting each entry's weight.
  function pickWeightedQuestion(questions) {
    const totalWeight = questions.reduce((sum, question) => {
      return sum + Math.max(1, question.weight || 1);
    }, 0);

    let cursor = Math.random() * totalWeight;

    for (const question of questions) {
      cursor -= Math.max(1, question.weight || 1);

      if (cursor <= 0) {
        return question;
      }
    }

    return questions[questions.length - 1];
  }

  // 🧭 WHERE: questions.js / question flow controller
  // WHAT: Creates a no-repeat selector that unlocks later phases as the click count rises.
  function createQuestionFlow(questions = questionBank) {
    const usedQuestionIds = new Set();
    let step = 0;

    // 🔎 WHERE: questions.js / available pool
    // WHAT: Finds unused questions from the phases that are currently unlocked.
    function getAvailableQuestions() {
      const unlockedPhases = getUnlockedPhases(step);

      return questions.filter((question) => {
        return unlockedPhases.includes(question.phase) && !usedQuestionIds.has(question.id);
      });
    }

    // ♻️ WHERE: questions.js / pool reset
    // WHAT: Clears only the currently unlocked phase history when that pool runs dry.
    function refillUnlockedPool() {
      const unlockedPhases = getUnlockedPhases(step);

      questions.forEach((question) => {
        if (unlockedPhases.includes(question.phase)) {
          usedQuestionIds.delete(question.id);
        }
      });
    }

    return {
      // ❔ WHERE: questions.js / next question
      // WHAT: Returns the next question with phase-aware progression and no repeats until reset.
      nextQuestion() {
        let availableQuestions = getAvailableQuestions();

        if (availableQuestions.length === 0) {
          refillUnlockedPool();
          availableQuestions = getAvailableQuestions();
        }

        const question = pickWeightedQuestion(availableQuestions);
        usedQuestionIds.add(question.id);
        step += 1;

        return {
          ...question,
          step,
          unlockedPhases: getUnlockedPhases(step - 1)
        };
      }
    };
  }

  window.WhyQuestions = {
    questionBank,
    createQuestionFlow
  };
})();
