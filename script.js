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
    const userInput = document.getElementById("answer").value.trim().toLowerCase();
    let correctAnswer = '';
    let isCorrect = false;
  
    if (currentLanguage === 'french_to_japanese') {
      const hira = current.hiragana?.trim();
      const kanji = current.kanji?.trim();
      isCorrect = userInput === hira || userInput === kanji;
      correctAnswer = `${hira} (${kanji || "no kanji"})`;
    } else {
      const answers = current.french.split('/').map(a => a.trim().toLowerCase());
  
      // Check for exact or substring match first
      isCorrect = answers.some(ans => ans.includes(userInput) || userInput.includes(ans));
  
      // If still incorrect, apply fuzzy logic
      if (!isCorrect) {
        isCorrect = answers.some(ans => fuzzball.ratio(ans, userInput) > 80);
      }
  
      correctAnswer = current.french;
    }
  
    if (isCorrect) {
      feedbackCorrect();
    } else {
      feedbackIncorrect(correctAnswer);
    }
}
  
  

function showAnswer() {
    if (!current) return;

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

function highlightAnswer(correctAnswer) {
    const input = document.getElementById("answer").value.trim().toLowerCase();
    const answers = correctAnswer.split('/').map(a => a.trim());
  
    for (let ans of answers) {
      const lowerAns = ans.toLowerCase();
      if (lowerAns.includes(input)) {
        // Highlight input inside answer
        const start = lowerAns.indexOf(input);
        const end = start + input.length;
        return `${ans.slice(0, start)}<b>${ans.slice(start, end)}</b>${ans.slice(end)}`;
      }
    }
  
    // No highlight match found
    return correctAnswer;
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

function feedbackCorrect() {
    document.getElementById("feedback").innerText = "✅ Correct!";
    score++;
    streak++;
    updateScore();
    showNextButton();
}
  
function feedbackIncorrect(correctAnswer) {
    document.getElementById("feedback").innerText = `❌ Wrong! Expected: ${highlightAnswer(correctAnswer)}`;
    document.getElementById("feedback").innerHTML = `❌ Wrong! Expected: ${highlightAnswer(correctAnswer)}`;
    streak = 0;
    updateScore();
    showRetryAndAccept();
}
  
function acceptAnswer() {
    feedbackCorrect();
}
  
function showRetryAndAccept() {
    document.getElementById("retry-button").style.display = "inline-block";
    document.getElementById("accept-button").style.display = "inline-block";
    document.getElementById("next-button").style.display = "none";
}
  
function showNextButton() {
    document.getElementById("next-button").style.display = "inline-block";
    document.getElementById("retry-button").style.display = "none";
    document.getElementById("accept-button").style.display = "none";
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
