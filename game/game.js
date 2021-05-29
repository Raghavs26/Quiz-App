/*jshint -W069 */

const question = document.querySelector("#question");
const choices = Array.from(document.querySelectorAll(".choice-text"));
const progressText = document.querySelector("#progressText");
const scoreText = document.querySelector("#score");
const progressBarFull = document.querySelector("#progressBarFull");
const loader = document.querySelector("#loader");
const game = document.querySelector("#game");

let currentQuestion = {};
let acceptingAnswers = false;
let score = 0;
let questionCount = 0;
let availableQuestions = [];

let questions = [];

fetch(
  "https://opentdb.com/api.php?amount=50&category=9&difficulty=easy&type=multiple"
)
  .then((res) => {
    return res.json();
  })
  .then((loadedQuestions) => {
    questions = loadedQuestions.results.map((loadedQuestion) => {
      const formattedQuestion = {
        question: loadedQuestion.question,
      };

      const answerChoices = [...loadedQuestion.incorrect_answers];
      formattedQuestion.answer = Math.floor(Math.random() * 3) + 1;
      answerChoices.splice(
        formattedQuestion.answer - 1,
        0,
        loadedQuestion.correct_answer
      );

      answerChoices.forEach((choice, index) => {
        formattedQuestion["choice" + (index + 1)] = choice;
      });

      return formattedQuestion;
    });
    game.classList.remove("hidden");
    loader.classList.add("hidden");
    startGame();
  })

  .catch((error) => {
    console.error(error);
  });

//CONSTANTS
const CORRECT_BONUS = 10;
const MAX_QUESTIONS = 15;

startGame = () => {
  questionCount = 0;
  score = 0;
  availableQuestions = [...questions];
  getNewQuestion();
};

getNewQuestion = () => {
  if (availableQuestions.length === 0 || questionCount >= MAX_QUESTIONS) {
    localStorage.setItem("mostRecentScore", score);
    //go to end page
    return window.location.assign("../end/end.html");
  }
  questionCount++;
  progressText.innerText = `Question: ${questionCount}/${MAX_QUESTIONS}`;
  //Update the progress bar

  progressBarFull.style.width = `${(questionCount / MAX_QUESTIONS) * 100}%`;

  const questionIndex = Math.floor(Math.random() * availableQuestions.length);
  currentQuestion = availableQuestions[questionIndex];
  question.innerText = currentQuestion.question;

  //to get choices for questions
  choices.forEach((choice) => {
    const num = choice.dataset["number"];
    choice.innerText = currentQuestion["choice" + num];
  });
  //remove question so that we won't get same question
  availableQuestions.splice(questionIndex, 1);

  acceptingAnswers = true;
};

choices.forEach((choice) => {
  choice.addEventListener("click", (evt) => {
    if (!acceptingAnswers) return;

    acceptingAnswers = false;
    const selectedChoice = evt.target;
    const selectedAnswer = selectedChoice.dataset["number"];
    let classToApply = "incorrect";
    if (selectedAnswer == currentQuestion.answer) {
      classToApply = "correct";
    }

    if (classToApply === "correct") {
      increaseScore(CORRECT_BONUS);
    }

    selectedChoice.parentElement.classList.add(classToApply);

    setTimeout(() => {
      selectedChoice.parentElement.classList.remove(classToApply);
      getNewQuestion();
    }, 1000);
  });
});

increaseScore = (num) => {
  score += num;
  scoreText.innerText = score;
};
