document.addEventListener("DOMContentLoaded", function () {
  let currentQuestionIndex = null;
  const translationDirection = window.location.pathname.includes('french_to_japanese') ? 'french_to_japanese' : 'japanese_to_french';

  function showQuestion() {
      const questionContainer = document.getElementById('question-container');
      const kanjiContainer = document.getElementById('kanji-container');

      questionContainer.style.display = 'block';
      kanjiContainer.style.display = 'block';

      const currentQuestion = questions[currentQuestionIndex];
      console.log('Current Question:', currentQuestion);
      document.getElementById('question').innerText = `Translate "${currentQuestion.french}" to Hiragana:`;
      document.getElementById('kanji').innerText = `Translate "${currentQuestion.japanese}" to Hiragana:`;


      fetch(`/get_question/${translationDirection}`)
          .then(response => response.json())
          .then(data => {
              console.log('Fetched question:', data);
              currentQuestion = data.question;
              if (currentQuestion) {
                  if (translationDirection === 'french_to_japanese') {
                      document.getElementById('question').innerText = `Translate "${currentQuestion.french}" to Hiragana:`;
                  } else {
                      document.getElementById('kanji').innerText = `Translate "${currentQuestion.kanji}" in French?`;
                  }
              } else {
                  alert('Congratulations! You have completed the quiz.');
              }
          });
  }

  function showKanji() {
      const questionContainer = document.getElementById('question-container');
      const kanjiContainer = document.getElementById('kanji-container');

      questionContainer.style.display = 'none';
      kanjiContainer.style.display = 'block';

      const currentQuestion = questions[currentQuestionIndex];
      document.getElementById('kanji').innerText = `Translate "${currentQuestion.kanji}" in French?`;
      if (currentQuestion.kanji) {
          document.getElementById('kanji').innerText = `Translate "${currentQuestion.kanji}" in French?`;
      }
  }

  function checkAnswer() {
      const userAnswer = document.getElementById('user-input').value;
      // Implement logic to check user's answer for hiragana translation
      // Update the UI accordingly
  }

  function checkKanjiAnswer() {
      const userKanjiAnswer = document.getElementById('user-kanji-input').value;
      // Implement logic to check user's answer for kanji translation
      // Update the UI accordingly
  }

  function nextQuestion() {
      currentQuestionIndex++;
      if (currentQuestionIndex < questions.length) {
          if (translationDirection === 'french_to_japanese') {
              showQuestion();
          } else {
              showKanji();
          }
      } else {
          alert('Congratulations! You have completed the quiz.');
      }
  }

  showQuestion();
  showKanji();
});
