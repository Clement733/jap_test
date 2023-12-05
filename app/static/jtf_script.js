function extractWords(str) {
  const regex = /(?:[^\W_]+|\s+|['’-])/g;
  const matches = str.match(regex);
  return matches ? matches.map(match => match.trim().toLowerCase()) : [];
}

function stringSimilarity(str1, str2) {
  const maxLength = Math.max(str1.length, str2.length);
  let levenshteinDistance = Array.from({ length: str1.length + 1 }, (_, i) => i);

  for (let i = 1; i <= str2.length; i++) {
    let nextColumn = [i];

    for (let j = 1; j <= str1.length; j++) {
      const substitutionCost = str1[j - 1] === str2[i - 1] ? 0 : 1;
      nextColumn[j] = Math.min(
        levenshteinDistance[j - 1] + substitutionCost,
        levenshteinDistance[j] + 1,
        nextColumn[j - 1] + 1
      );
    }

    levenshteinDistance = nextColumn;
  }

  return 1 - levenshteinDistance[str1.length] / maxLength;
}

function checkKanjiAnswer() {
  const userAnswer = document.getElementById("user-kanji-input").value.toLowerCase();
  const currentWord = getCurrentKanji();

  const userWords = extractWords(userAnswer);

  const correctAnswers = currentWord.french.split('/').map(answer => extractWords(answer));

  const similarities = correctAnswers.map(correctWords =>
    Math.max(
      ...correctWords.map(correctWord =>
        Math.max(...userWords.map(userWord => stringSimilarity(correctWord, userWord)))
      )
    )
  );

  const maxSimilarity = Math.max(...similarities);

  const similarityThreshold = 0.8;

  const isPartialCorrect = correctAnswers.some(correctWords =>
    correctWords.some(correctWord =>
      userWords.some(userWord => stringSimilarity(correctWord, userWord) >= similarityThreshold)
    )
  );

  if (isPartialCorrect) {
    displayResult(
      `Bonne réponse ! C'était bien ${currentWord.french}<br>(Similarité : ${Math.round(maxSimilarity * 100)}%)`
    );
  } else {
    displayResult(`Mauvaise réponse ! La bonne réponse est : ${currentWord.french}`);
  }
}



document.getElementById("user-kanji-input").addEventListener("keypress", function (event) {
  if (event.key === "Enter") {
      checkKanjiAnswer();
  }
});

function getCurrentKanji() {
  const questionElement = document.getElementById("kanji");
  if (questionElement && questionElement.hasAttribute("data-word")) {
      const currentWord = JSON.parse(questionElement.getAttribute("data-word"));
      return currentWord;
  }
  return null;
}


function nextQuestionJapaneseToFrench() {
  fetch('/get_question/japanese_to_french')
      .then(response => response.json())
      .then(data => {
          const word = data.question;
          if (word) {
              showKanjiOnPage(word);
              document.getElementById("user-kanji-input").value = "";
              document.getElementById("result").textContent = "";
          } else {
              alert('Plus de vocabulaire disponible. Veuillez recharger la page.');
          }
      })
      .catch(error => console.error('Error fetching question:', error));
}

function showKanjiOnPage(word) {
  const kanjiElement = document.getElementById("kanji");
  kanjiElement.textContent = `Voici le mot à traduire : ${word.kanji}`;

  kanjiElement.setAttribute("data-word", JSON.stringify(word));
}

function displayResult(message) {
  const resultElement = document.getElementById("result");
  resultElement.innerHTML = message;
}
