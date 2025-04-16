let questions = [];
let current = null;
let currentLanguage = null;
let score = 0;
let streak = 0;

fetch('words.json')
  .then(res => res.json())
  .then(data => {
    questions = data.filter(q => q.french && (q.hiragana || q.kanji));
    nextQuestion();
  });

function nextQuestion() {
  if (questions.length === 0) {
    document.getElementById("question").innerText = "Quiz finished!";
    hideButtons();
    return;
  }

  const index = Math.floor(Math.random() * questions.length);
  current = questions.splice(index, 1)[0];

  // Random direction
  const directions = ['french_to_japanese', 'japanese_to_french'];
  currentLanguage = directions[Math.floor(Math.random() * directions.length)];

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
  const userInput = document.getElementById("answer").value.trim();
  let correctAnswer = '';

  let isCorrect = false;
  if (currentLanguage === 'french_to_japanese') {
    isCorrect = userInput === current.hiragana || userInput === current.kanji;
    correctAnswer = `${current.hiragana} (${current.kanji || "no kanji"})`;
  } else {
    isCorrect = userInput.toLowerCase() === current.french.toLowerCase();
    correctAnswer = current.french;
  }

  if (isCorrect) {
    document.getElementById("feedback").innerText = "✅ Correct!";
    score++;
    streak++;
    updateScore();
    showNextButton();
  } else {
    document.getElementById("feedback").innerText = `❌ Wrong! Try again or show the answer.`;
    streak = 0;
    updateScore();
    showRetryButton();
  }
}

function showAnswer() {
  let correct = '';
  if (currentLanguage === 'french_to_japanese') {
    correct = `${current.hiragana} (${current.kanji || "no kanji"})`;
  } else {
    correct = current.french;
  }

  document.getElementById("feedback").innerText = `💡 Answer: ${correct}`;
  showNextButton();
  streak = 0;
  updateScore();
}

function tryAgain() {
  document.getElementById("feedback").innerText = "";
  document.getElementById("answer").value = "";
  showCheckAndShowAnswer();
}

function updateScore() {
  document.getElementById("score").innerText = score;
  document.getElementById("streak").innerText = streak;
}

function showNextButton() {
  document.getElementById("next-button").style.display = "inline-block";
  document.getElementById("retry-button").style.display = "none";
  document.getElementById("answer").disabled = true;
}

function showRetryButton() {
  document.getElementById("retry-button").style.display = "inline-block";
  document.getElementById("next-button").style.display = "none";
  document.getElementById("answer").disabled = false;
}

function showCheckAndShowAnswer() {
  document.getElementById("next-button").style.display = "none";
  document.getElementById("retry-button").style.display = "none";
  document.getElementById("answer").disabled = false;
}

function hideButtons() {
  document.getElementById("next-button").style.display = "none";
  document.getElementById("retry-button").style.display = "none";
}
