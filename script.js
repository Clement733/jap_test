const urlParams = new URLSearchParams(window.location.search);
const quizMode = urlParams.get('mode') || 'mixed';

let questions = [];
let current = null;
let currentLanguage = null;
let score = 0;
let streak = 0;
let allWords = [];

const sourceFile = quizMode === 'custom_mixed' ? 'quizz.json' : 'jlpt_french_words.json';

fetch(sourceFile)
  .then(res => res.json())
  .then(data => {
    allWords = data;

    if (quizMode === 'custom_mixed') {
      // Skip level filtering for custom quizzes
      questions = allWords.filter(q => q.french && (q.hiragana || q.kanji));
      nextQuestion();
    } else {
      applyLevelFilter(); // JLPT modes use level filtering
    }
  })
  .catch(err => {
    document.getElementById("question").innerText =
      "❌ Error loading questions.";
    console.error("Error loading jlpt_french_words.json:", err);
});

function getSelectedLevels() {
  const select = document.getElementById("level-select");
  return Array.from(select.selectedOptions).map(opt => opt.value);
}

function applyLevelFilter() {
  const selectedLevels = getSelectedLevels();

  // Filter based on mode and levels
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
      return q.french && hasJapanese; // mixed
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
  

function checkAnswer() {
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
    feedbackCorrect();
  } else {
    feedbackIncorrect(correctAnswer);
  }
}

function feedbackCorrect() {
  document.getElementById("feedback").innerText = "✅ Correct!";
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
  document.getElementById("feedback").innerText = "";
  document.getElementById("answer").value = "";
  showCheckAndShowAnswer();
}

function acceptAnswer() {
  feedbackCorrect();
}

function updateScore() {
  document.getElementById("score").innerText = score;
  document.getElementById("streak").innerText = streak;
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
