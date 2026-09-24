// Quiz Data
const quizData = [
  {
    question: "Which storage mechanism keeps data after the browser is closed?",
    options: ["A. sessionStorage", "B. localStorage", "C. temporaryStorage", "D. memoryStorage"],
    answer: 1
  },
  {
    question: "Which HTTP method is used to fetch data from a REST API?",
    options: ["A. POST", "B. PUT", "C. GET", "D. DELETE"],
    answer: 2
  },
  {
    question: "Which keyword is used to declare an asynchronous function in JS?",
    options: ["A. await", "B. async", "C. promise", "D. defer"],
    answer: 1
  },
  {
    question: "What does API stand for?",
    options: ["A. Application Programming Interface", "B. Automated Program Integration", "C. Array Process Implementation", "D. Applied Protocol Interface"],
    answer: 0
  },
  {
    question: "Which method converts a JSON string into a JavaScript object?",
    options: ["A. JSON.stringify()", "B. JSON.parse()", "C. JSON.object()", "D. JSON.toObject()"],
    answer: 1
  }
];

let currentQuestionIndex = 0;
let score = 0;
let timeLeft = 30;
let timer;

const questionText = document.getElementById("question-text");
const optionsContainer = document.getElementById("options-container");
const questionCount = document.getElementById("question-count");
const timerCount = document.getElementById("timer-count");
const leaderboardList = document.getElementById("leaderboard-list");

// Load Quiz Question
function loadQuestion() {
  clearInterval(timer);
  timeLeft = 30;
  timerCount.textContent = timeLeft;

  timer = setInterval(() => {
    timeLeft--;
    timerCount.textContent = timeLeft;
    if (timeLeft <= 0) {
      clearInterval(timer);
      nextQuestion();
    }
  }, 1000);

  const currentQuiz = quizData[currentQuestionIndex];
  questionCount.textContent = `Question ${currentQuestionIndex + 1} of ${quizData.length}`;
  questionText.textContent = currentQuiz.question;

  optionsContainer.innerHTML = "";
  currentQuiz.options.forEach((option, index) => {
    const button = document.createElement("button");
    button.classList.add("option-btn");
    button.textContent = option;
    button.onclick = () => checkAnswer(index);
    optionsContainer.appendChild(button);
  });
}

function checkAnswer(selectedIndex) {
  if (selectedIndex === quizData[currentQuestionIndex].answer) {
    score++;
  }
  nextQuestion();
}

function nextQuestion() {
  currentQuestionIndex++;
  if (currentQuestionIndex < quizData.length) {
    loadQuestion();
  } else {
    finishQuiz();
  }
}

function finishQuiz() {
  clearInterval(timer);
  const username = prompt("Quiz Finished! Enter your name for the leaderboard:") || "Anonymous";
  saveScore(username, score);
  displayLeaderboard();
  
  questionText.textContent = `Quiz Completed! You scored ${score} out of ${quizData.length}`;
  optionsContainer.innerHTML = `<button class="option-btn" onclick="restartQuiz()">Try Again</button>`;
}

function restartQuiz() {
  currentQuestionIndex = 0;
  score = 0;
  loadQuestion();
}

// LocalStorage Leaderboard Management
function saveScore(name, score) {
  let leaderboard = JSON.parse(localStorage.getItem("quizLeaderboard")) || [];
  leaderboard.push({ name, score });
  localStorage.setItem("quizLeaderboard", JSON.stringify(leaderboard));
}

function displayLeaderboard() {
  let leaderboard = JSON.parse(localStorage.getItem("quizLeaderboard")) || [];
  leaderboardList.innerHTML = "";
  
  if (leaderboard.length === 0) {
    leaderboardList.innerHTML = `<div class="leaderboard-item"><span>1. sona</span><span>1/5</span></div>`;
    return;
  }

  leaderboard.slice(-5).reverse().forEach((entry, idx) => {
    const div = document.createElement("div");
    div.classList.add("leaderboard-item");
    div.innerHTML = `<span>${idx + 1}. ${entry.name}</span><span>${entry.score}/5</span>`;
    leaderboardList.appendChild(div);
  });
}

// Weather Search via Open-Meteo REST API
document.getElementById("search-btn").addEventListener("click", async () => {
  const city = document.getElementById("city-input").value;
  const resultDiv = document.getElementById("weather-result");

  if (!city) {
    resultDiv.innerHTML = "<p>Please enter a city name.</p>";
    return;
  }

  try {
    // Get Coordinates
    const geoRes = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${city}&count=1`);
    const geoData = await geoRes.json();

    if (!geoData.results || geoData.results.length === 0) {
      resultDiv.innerHTML = "<p>City not found.</p>";
      return;
    }

    const { latitude, longitude, name } = geoData.results[0];

    // Fetch Weather Data
    const weatherRes = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true`);
    const weatherData = await weatherRes.json();

    resultDiv.innerHTML = `
      <div style="margin-top: 15px; padding: 10px; background: #f0fdf4; border-radius: 6px;">
        <p><strong>City:</strong> ${name}</p>
        <p><strong>Temperature:</strong> ${weatherData.current_weather.temperature} °C</p>
        <p><strong>Windspeed:</strong> ${weatherData.current_weather.windspeed} km/h</p>
      </div>
    `;
  } catch (error) {
    resultDiv.innerHTML = "<p>Error fetching weather data.</p>";
  }
});

// Initial Setup
loadQuestion();
displayLeaderboard();
