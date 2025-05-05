const urlParams = new URLSearchParams(window.location.search);
const quizMode = urlParams.get('mode') || 'mixed';
const wordLimit = parseInt(urlParams.get('limit'), 10) || Infinity;

if (quizMode === 'custom_mixed') {
  document.addEventListener("DOMContentLoaded", () => {
    const wrapper = document.getElementById("level-wrapper");
    if (wrapper) wrapper.remove();

    const levelBtn = document.getElementById("level-button");
    if (levelBtn) levelBtn.remove();
  });
}

let questions = [];
let current = null;
let currentLanguage = null;
let score = 0;
let streak = 0;
let correctFirstTry = 0;
let firstAttempt = true;
let allWords = [];

let seenFrenchPrompts = new Set();
let seenJapanesePrompts = new Set();

const sourceFile = quizMode === 'custom_mixed' ? 'quizz.json' : 'jlpt_french_words.json';

fetch(sourceFile)
  .then(res => res.json())
  .then(data => {
    allWords = data;

    if (quizMode === 'custom_mixed') {
      let filtered = data.filter(q => q.french && (q.hiragana || q.kanji));
      const limit = wordLimit || filtered.length;

      questions = shuffleArray(filtered).slice(0, limit);
      allWords = questions;
      nextQuestion();
    } else {
      applyLevelFilter();
    }    
  })
  .catch(err => {
    document.getElementById("question").innerText =
      "❌ Error loading questions.";
    console.error("Error loading words:", err);
});

function trackSeen() {
  if (quizMode !== 'custom_mixed' || !current) return;

  if (currentLanguage === 'french_to_japanese') {
    if (!seenFrenchPrompts.has(current.french)) seenFrenchPrompts.add(current.french);
  } else {
    const key = current.kanji || current.hiragana;
    if (!seenJapanesePrompts.has(key)) seenJapanesePrompts.add(key);
  }
  updateProgress();
}

function getSelectedLevels() {
  const select = document.getElementById("level-select");
  return Array.from(select.selectedOptions).map(opt => opt.value);
}

function applyLevelFilter() {
  const selectedLevels = getSelectedLevels();

  questions = allWords.filter(q => {
    const levelOk = selectedLevels.length === 0 || selectedLevels.includes(q.level);
    const hasFrench = q.french;
    const hasJapanese = q.hiragana || q.kanji;

    if (!levelOk || !hasFrench || !hasJapanese) return false;

    if (quizMode === 'french_to_japanese') {
      return q.french && hasJapanese;
    } else if (quizMode === 'japanese_to_french') {
      return hasJapanese;
    } else {
      return q.french && hasJapanese;
    }
  });

  if (questions.length === 0) {
    document.getElementById("question").innerText =
      "⚠️ No available questions for the selected level(s).";
    hideButtons();
    return;
  }

  nextQuestion();
}

function nextQuestion() {
  firstAttempt = true;
  if (quizMode !== 'custom_mixed') {
    pickStandardQuestion();
    return;
  }

  const directions = ['french_to_japanese', 'japanese_to_french'];
  currentLanguage = directions[Math.floor(Math.random() * directions.length)];

  let filtered = questions.filter(q => {
    if (currentLanguage === 'french_to_japanese') {
      return !seenFrenchPrompts.has(q.french);
    } else {
      return !seenJapanesePrompts.has(q.kanji || q.hiragana);
    }
  });

  if (filtered.length === 0) {
    const allSeen = seenFrenchPrompts.size + seenJapanesePrompts.size >= questions.length * 2;
    document.getElementById("question").innerText = "✅ All words seen in both directions!";
    hideButtons();
    document.getElementById("restart-button").style.display = "inline-block";
    return;
  }

  const index = Math.floor(Math.random() * filtered.length);
  current = filtered[index];

  if (currentLanguage === 'french_to_japanese') {
    seenFrenchPrompts.add(current.french);
  } else {
    seenJapanesePrompts.add(current.kanji || current.hiragana);
  }

  let questionText = currentLanguage === 'french_to_japanese'
    ? `Translate to Japanese: ${current.french}`
    : `Translate to English: ${current.kanji || current.hiragana}`;

  document.getElementById("question").innerText = questionText;
  document.getElementById("feedback").innerText = "";
  document.getElementById("answer").value = "";

  updateProgress();
  showCheckAndShowAnswer();
}

function shuffleArray(array) {
  return array
    .map(value => ({ value, sort: Math.random() }))
    .sort((a, b) => a.sort - b.sort)
    .map(({ value }) => value);
}

function pickStandardQuestion() {
  if (questions.length === 0) {
    document.getElementById("question").innerText = "Quiz finished!";
    hideButtons();
    return;
  }

  const index = Math.floor(Math.random() * questions.length);
  current = questions.splice(index, 1)[0];

  if (quizMode === 'mixed') {
    const directions = ['french_to_japanese', 'japanese_to_french'];
    currentLanguage = directions[Math.floor(Math.random() * directions.length)];
  } else {
    currentLanguage = quizMode;
  }

  let questionText = '';
  if (currentLanguage === 'french_to_japanese') {
    questionText = `Translate to Japanese: ${current.french}`;
  } else {
    questionText = `Translate to French: ${current.kanji || current.hiragana}`;
  }

  document.getElementById("question").innerText = questionText;
  document.getElementById("feedback").innerText = "";
  document.getElementById("answer").value = "";

  showCheckAndShowAnswer();
}

function updateProgress() {
  if (quizMode !== 'custom_mixed') return;
  const total = questions.length;
  const frSeen = seenFrenchPrompts.size;
  const jpSeen = seenJapanesePrompts.size;
  document.getElementById("progress").innerText =
    `Seen: ${frSeen}/${total} (EN→JP), ${jpSeen}/${total} (JP→EN)`;
}

function restartQuiz() {
  seenFrenchPrompts.clear();
  seenJapanesePrompts.clear();
  document.getElementById("restart-button").style.display = "none";
  document.getElementById("feedback").innerText = "";
  document.getElementById("answer").value = "";
  nextQuestion();
}  

function checkAnswer() {
  try {
    const rawInput = document.getElementById("answer").value.trim().toLowerCase();
    const userInput = rawInput.replace(/\s+/g, ' ');

    let isCorrect = false;
    let correctAnswer = '';

    if (currentLanguage === 'french_to_japanese') {
      const hira = current.hiragana?.trim();
      const kanji = current.kanji?.trim();
      isCorrect = userInput === hira || userInput === kanji;
      correctAnswer = `${hira} (${kanji || "no kanji"})`;
    } else {
      const answers = current.french
        .split('/')
        .map(a => a.trim().toLowerCase().replace(/\s+/g, ' '));
      isCorrect = answers.some(ans => isAnswerAcceptable(userInput, ans));
      correctAnswer = current.french;
    }

    if (isCorrect) {
      feedbackCorrect(correctAnswer);
    } else {
      feedbackIncorrect(correctAnswer);
    }

    document.querySelector("button[onclick='checkAnswer()']").disabled = true;
    document.querySelector("button[onclick='showAnswer()']").disabled = true;
  } catch (err) {
    console.error("❌ Error in checkAnswer():", err, current);
    alert("⚠️ A problem occurred while checking your answer. Check the console.");
  }
}

function feedbackCorrect(correctAnswer) {
  if (quizMode === 'custom_mixed') {
    trackSeen();
  }

  if (firstAttempt){
    correctFirstTry++;
    updateCorrectFirstTry();
  }

  document.getElementById("feedback").innerHTML = `✅ Correct! ${highlightAnswer(correctAnswer)}`;
  score++;
  streak++;
  updateScore();
  showNextButton();
}

function feedbackIncorrect(correctAnswer) {
  document.getElementById("feedback").innerHTML = `❌ Wrong! Expected: ${highlightAnswer(correctAnswer)}`;
  streak = 0;
  updateScore();
  showRetryAndAccept();
}

function showAnswer() {
  if (!current) return;

  let correct = '';
  if (currentLanguage === 'french_to_japanese') {
    correct = `${current.hiragana} (${current.kanji || "no kanji"})`;
  } else {
    correct = current.french;
  }

  document.getElementById("feedback").innerHTML = `💡 Answer: ${highlightAnswer(correct)}`;
  showNextButton();
  streak = 0;
  updateScore();
  document.querySelector("button[onclick='checkAnswer()']").disabled = true;
  document.querySelector("button[onclick='showAnswer()']").disabled = true;

}

function highlightAnswer(correctAnswer) {
  const rawInput = document.getElementById("answer").value.trim().toLowerCase();
  const userInput = rawInput.replace(/\s+/g, ' ');

  const answers = correctAnswer.split('/').map(a => a.trim());

  for (let ans of answers) {
    const lowerAns = ans.toLowerCase();
    const start = lowerAns.indexOf(userInput);
    if (start !== -1) {
      const end = start + userInput.length;
      return `${ans.slice(0, start)}<b>${ans.slice(start, end)}</b>${ans.slice(end)}`;
    }
  }

  return answers[0]; // fallback
}

function tryAgain() {
  firstAttempt = false;
  document.getElementById("feedback").innerText = "";
  document.getElementById("answer").value = "";
  showCheckAndShowAnswer();
  document.querySelector("button[onclick='checkAnswer()']").disabled = false;
  document.querySelector("button[onclick='showAnswer()']").disabled = false;
}

function acceptAnswer() {
  feedbackCorrect(correctAnswer);
}

function updateScore() {
  document.getElementById("score").innerText = score;
  document.getElementById("streak").innerText = streak;
}

function updateCorrectFirstTry() {
  document.getElementById("correct-first-try").innerText = correctFirstTry;
}

// UI Button State Handlers
function showNextButton() {
  document.getElementById("next-button").style.display = "inline-block";
  document.getElementById("retry-button").style.display = "none";
  document.getElementById("accept-button").style.display = "none";
  document.getElementById("answer").disabled = true;
}

function showRetryAndAccept() {
  document.getElementById("retry-button").style.display = "inline-block";
  document.getElementById("accept-button").style.display = "inline-block";
  document.getElementById("next-button").style.display = "none";
  document.getElementById("answer").disabled = false;
}

function showCheckAndShowAnswer() {
  document.getElementById("next-button").style.display = "none";
  document.getElementById("retry-button").style.display = "none";
  document.getElementById("accept-button").style.display = "none";
  document.getElementById("answer").disabled = false;
  document.querySelector("button[onclick='checkAnswer()']").disabled = false;
  document.querySelector("button[onclick='showAnswer()']").disabled = false;
}

function hideButtons() {
  document.getElementById("next-button").style.display = "none";
  document.getElementById("retry-button").style.display = "none";
  document.getElementById("accept-button").style.display = "none";
}

function tokenMatch(input, expected) {
  const inputWords = input.split(/\s+/);
  const expectedWords = expected.split(/\s+/);
  const matches = inputWords.filter(word => expectedWords.includes(word));
  return matches.length / expectedWords.length >= 0.6;
}

function levenshtein(a, b) {
  const matrix = Array.from({ length: a.length + 1 }, () => []);
  for (let i = 0; i <= a.length; i++) matrix[i][0] = i;
  for (let j = 0; j <= b.length; j++) matrix[0][j] = j;
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,
        matrix[i][j - 1] + 1,
        matrix[i - 1][j - 1] + cost
      );
    }
  }
  return matrix[a.length][b.length];
}

function isFuzzyMatch(a, b, threshold = 2) {
  return levenshtein(a, b) <= threshold;
}

function isAnswerAcceptable(userInput, correctAnswer) {
  return (
    userInput === correctAnswer ||
    userInput.includes(correctAnswer) ||
    correctAnswer.includes(userInput) ||
    tokenMatch(userInput, correctAnswer) ||
    isFuzzyMatch(userInput, correctAnswer)
  );
}
