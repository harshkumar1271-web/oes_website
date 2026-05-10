function loginUser(e) {
  e.preventDefault();
  const role = document.getElementById('role').value;
  if (role === 'admin') {
    window.location.href = 'admin.html';
  } else {
    window.location.href = 'student-dashboard.html';
  }
}

const questions = [
  {
    q: "Java is developed by?",
    a: ["Microsoft", "Oracle", "Sun Microsystems", "IBM"],
    correct: 2
  },
  {
    q: "Which one is not a Java feature?",
    a: ["Object-oriented", "Use of pointers", "Portable", "Secure"],
    correct: 1
  }
];

let current = 0, score = 0;

function loadQuestion() {
  if (current >= questions.length) {
    localStorage.setItem("score", score);
    window.location.href = "result.html";
    return;
  }
  const q = questions[current];
  document.getElementById("question").textContent = q.q;
  const optionsDiv = document.getElementById("options");
  optionsDiv.innerHTML = "";
  q.a.forEach((opt, i) => {
    const btn = document.createElement("button");
    btn.textContent = opt;
    btn.onclick = () => {
      if (i === q.correct) score++;
      nextQuestion();
    };
    optionsDiv.appendChild(btn);
  });
}

function nextQuestion() {
  current++;
  loadQuestion();
}

window.onload = () => {
  if (document.getElementById("question")) loadQuestion();
  const scoreEl = document.getElementById("score");
  if (scoreEl) scoreEl.textContent = "Your Score: " + (localStorage.getItem("score") || 0);
};
