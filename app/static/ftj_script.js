function checkAnswer() {
  const userInput = document.getElementById("user-input").value;
  const currentWord = getCurrentWord();

  if (userInput === currentWord.hiragana || userInput === currentWord.kanji) {
      displayResult("Bonne réponse !");
  } else {
      displayResult(`Mauvaise réponse ! La bonne réponse est ${currentWord.hiragana} / ${currentWord.kanji}`);
  }
}

document.getElementById("user-input").addEventListener("keypress", function (event) {
  if (event.key === "Enter") {
      checkAnswer();
  }
});

function getCurrentWord() {
  const questionElement = document.getElementById("question");
  const currentWord = JSON.parse(questionElement.getAttribute("data-word"));

  return currentWord;
}

function showWordOnPage(word) {
  const questionElement = document.getElementById("question");
  questionElement.textContent = `Translate: ${word.french}`;

  questionElement.setAttribute("data-word", JSON.stringify(word));
}

function nextQuestion() {
  const direction = window.location.pathname.includes('japanese_to_french') ? 'japanese_to_french' : 'french_to_japanese';
  fetch(`/get_question/${direction}`)
      .then(response => response.json())
      .then(data => {
          console.log('Received data from server:', data);
          const word = data.question;
          if (word) {
              if (direction === 'japanese_to_french') {
                  showKanjiOnPage(word);
                  document.getElementById("user-kanji-input").value = "";
              } else {
                  showWordOnPage(word);
                  document.getElementById("user-input").value = "";
              }
              document.getElementById("result").textContent = "";
          } else {
              alert('No more questions available.');
          }
      })
      .catch(error => console.error('Error fetching question:', error));
}

function displayResult(message) {
  const resultElement = document.getElementById("result");
  resultElement.textContent = message;
}
