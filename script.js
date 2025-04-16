let questions = [];
let current = null;
let currentLanguage = null;

fetch('words.json')
  .then(res => res.json())
  .then(data => {
    questions = data.filter(q => q.french && (q.hiragana || q.kanji));
    nextQuestion();
  });

function nextQuestion() {
  if (questions.length === 0) {
    document.getElementById("question").innerText = "Quiz finished!";
    return;
  }

  const index = Math.floor(Math.random() * questions.length);
  current = questions.splice(index, 1)[0];

  // Decide which direction to quiz
  const directions = ['french_to_japanese', 'japanese_to_french'];
  currentLanguage = directions[Math.floor(Math.random() * directions.length)];

  let questionText = '';

  if (currentLanguage === 'french_to_japanese') {
    questionText = `Translate to Japanese: ${current.french}`;
  } else {
    // Japanese to French → Prefer Kanji if available, else Hiragana
    if (current.kanji) {
      questionText = `Translate to French: ${current.kanji}`;
    } else {
      questionText = `Translate to French: ${current.hiragana}`;
    }
  }

  document.getElementById("question").innerText = questionText;
  document.getElementById("feedback").innerText = "";
  document.getElementById("answer").value = "";
}

function checkAnswer() {
  const userInput = document.getElementById("answer").value.trim();
  let isCorrect = false;

  if (currentLanguage === 'french_to_japanese') {
    isCorrect = userInput === current.hiragana || userInput === current.kanji;
    document.getElementById("feedback").innerText = isCorrect
      ? "✅ Correct!"
      : `❌ Wrong! Answer: ${current.hiragana} (${current.kanji || "no kanji"})`;
  } else {
    isCorrect = userInput.toLowerCase() === current.french.toLowerCase();
    document.getElementById("feedback").innerText = isCorrect
      ? "✅ Correct!"
      : `❌ Wrong! Answer: ${current.french}`;
  }

  setTimeout(nextQuestion, 2000);
}