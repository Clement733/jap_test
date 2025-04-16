let questions = [];
let current = null;

fetch('words.json')
  .then(res => res.json())
  .then(data => {
    questions = data.filter(q => q.french);
    nextQuestion();
  });

function nextQuestion() {
  if (questions.length === 0) {
    document.getElementById("question").innerText = "Quiz finished!";
    return;
  }
  const index = Math.floor(Math.random() * questions.length);
  current = questions.splice(index, 1)[0];
  document.getElementById("question").innerText = `Translate: ${current.french}`;
  document.getElementById("feedback").innerText = "";
  document.getElementById("answer").value = "";
}

function checkAnswer() {
  const userInput = document.getElementById("answer").value.trim();
  if (userInput === current.hiragana || userInput === current.kanji) {
    document.getElementById("feedback").innerText = "✅ Correct!";
  } else {
    document.getElementById("feedback").innerText = `❌ Wrong! Answer: ${current.hiragana} (${current.kanji})`;
  }
  setTimeout(nextQuestion, 2000);
}