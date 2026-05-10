// API Configuration
const API = (window.location.protocol === 'file:') ? "http://127.0.0.1:3000" : window.location.origin;

// Safety check for direct file opening
if (window.location.protocol === 'file:') {
    console.warn("Warning: You are opening the OES Website directly from a file. Please use http://localhost:3000 for full functionality.");
    setTimeout(() => {
        const msg = document.querySelector('.msg');
        if (msg) {
            msg.innerText = "NOTICE: Please open this site via http://localhost:3000 (Start server first)";
            msg.className = "msg warning";
        }
    }, 1000);
}

let answers = {};
let time = 60;
let timerInterval;

// DOM Utility
const el = (id) => document.getElementById(id);

function toggleAuthMode() {
  const loginSec = el('login-section');
  const signupSec = el('signup-section');
  if (loginSec.classList.contains('hidden')) {
    loginSec.classList.remove('hidden');
    signupSec.classList.add('hidden');
  } else {
    loginSec.classList.add('hidden');
    signupSec.classList.remove('hidden');
  }
}

function logout() {
  localStorage.clear();
  window.location = "Homepage.html"; // Redirect to Home Page
}

// LOGIN
function login(e) {
  const btn = e ? e.target : event.target;
  btn.innerText = "Logging in...";
  
  fetch(API + "/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: el("login-email").value,
      password: el("login-password").value
    })
  })
  .then(res => res.json().then(data => ({status: res.status, body: data})))
  .then(res => {
    btn.innerText = "Login to Account";
    if (res.status === 200) {
      localStorage.setItem("token", res.body.token);
      localStorage.setItem("role", res.body.role);
      if (res.body.role === "admin") {
        window.location = "admin.html";
      } else {
        window.location = "exam.html";
      }
    } else {
      el("login-msg").innerText = res.body.error || res.body.msg || "Login Failed";
      el("login-msg").className = "msg error";
    }
  }).catch(err => {
    console.error("Login error:", err);
    btn.innerText = "Login to Account";
    el("login-msg").innerText = "Network error (Check if server is running at " + API + ")";
    el("login-msg").className = "msg error";
  });
}

// SIGNUP
function signup(e) {
  const btn = e ? e.target : event.target;
  btn.innerText = "Creating...";

  fetch(API + "/signup", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: el("signup-name").value,
      email: el("signup-email").value,
      mobile: el("signup-mobile").value,
      password: el("signup-password").value
    })
  })
  .then(res => res.json().then(data => ({status: res.status, body: data})))
  .then(res => {
    btn.innerText = "Sign Up";
    if (res.status === 200) {
      el("signup-msg").innerText = "Success! Please switch to Login.";
      el("signup-msg").className = "msg success";
    } else {
      el("signup-msg").innerText = res.body.error || res.body.msg || "Signup Failed";
      el("signup-msg").className = "msg error";
    }
  }).catch(err => {
    console.error("Signup error:", err);
    btn.innerText = "Sign Up";
    el("signup-msg").innerText = "Network error (Check if server is running)";
    el("signup-msg").className = "msg error";
  });
}

// LOAD QUESTIONS (EXAM PAGE)
if (el("questions-loader")) {
  
  fetch(API + "/questions", {
    headers: {
      "Authorization": "Bearer " + localStorage.getItem("token")
    }
  })
  .then(res => {
    if (res.status === 401 || res.status === 403) {
      logout();
      throw new Error('Unauthorized');
    }
    return res.json();
  })
  .then(data => {
    if (!data) return;
    el("questions-loader").style.display = "none";
    const qDiv = el("questions");
    qDiv.style.display = "block";
    
    if (data.length === 0) {
      qDiv.innerHTML = `<div class="glass-panel" style="text-align:center; padding: 2rem;">
        <h3>No questions available in the database.</h3>
        <p style="color:var(--text-dim);">Please ask an admin to add some questions.</p>
      </div>`;
      el("submit-section").style.display = "none";
      if (timerInterval) clearInterval(timerInterval);
      el("timer-box").style.display = "none";
      return;
    }

    el("submit-section").style.display = "block";
    
    let html = "";
    data.forEach((q, index) => {
      html += `
      <div class="glass-panel question-card">
        <h3><span style="color:var(--primary-color);">Q${index + 1}.</span> ${q.question}</h3>
        
        <label class="option-label">
          <input type="radio" name="${q.id}" onclick="save('${q.id}', '${q.option1}')"> 
          ${q.option1}
        </label>
        <label class="option-label">
          <input type="radio" name="${q.id}" onclick="save('${q.id}', '${q.option2}')"> 
          ${q.option2}
        </label>
        <label class="option-label">
          <input type="radio" name="${q.id}" onclick="save('${q.id}', '${q.option3}')"> 
          ${q.option3}
        </label>
        <label class="option-label">
          <input type="radio" name="${q.id}" onclick="save('${q.id}', '${q.option4}')"> 
          ${q.option4}
        </label>
      </div>
      `;
    });
    qDiv.innerHTML = html;

    // Start Timer
    timerInterval = setInterval(() => {
      if (time > 0) {
        time--;
        el("timer").innerText = time;
      } else {
        clearInterval(timerInterval);
        submitExam();
      }
    }, 1000);
  })
  .catch(err => console.log(err));
}

// SAVE ANSWER
function save(id, value) {
  answers[id] = value;
}

// SUBMIT EXAM
function submitExam() {
  if (timerInterval) clearInterval(timerInterval);
  const btn = event ? event.target : el("submit-section").querySelector('button');
  if (btn) btn.innerText = "Submitting...";

  fetch(API + "/submit", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": "Bearer " + localStorage.getItem("token")
    },
    body: JSON.stringify(answers)
  })
  .then(res => res.json())
  .then(data => {
    localStorage.setItem("result", JSON.stringify(data));
    window.location = "result.html";
  });
}

// RESULT PAGE
if (el("result-ui")) {
  let result = JSON.parse(localStorage.getItem("result") || "{}");
  
  if (result.score !== undefined) {
    el("score-text").innerText = result.score + " / " + (result.total || result.score);
    el("percent-text").innerText = "You achieved " + result.percent + "% accuracy.";
    
    // Animate circular progress
    setTimeout(() => {
      el("result-ui").style.setProperty('--progress', result.percent + '%');
    }, 100);

    if (result.percent >= 50) {
      el("result-ui").style.background = `conic-gradient(var(--success) var(--progress), rgba(255,255,255,0.1) 0)`;
    } else {
      el("result-ui").style.background = `conic-gradient(var(--error) var(--progress), rgba(255,255,255,0.1) 0)`;
    }
  } else {
    el("score-text").innerText = "N/A";
    el("percent-text").innerText = "No results found.";
  }
}

// ADMIN FORM SUBMIT (ADD or EDIT)
function handleQuestionSubmit(e) {
  const editId = el("edit-id").value;
  if (editId) {
    updateQuestion(e, editId);
  } else {
    addQuestion(e);
  }
}

// ADMIN ADD QUESTION
function addQuestion(e) {
  const btn = e ? e.target : event.target;
  const originalText = btn.innerText;
  btn.innerText = "Adding...";

  fetch(API + "/admin/add-question", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": "Bearer " + localStorage.getItem("token")
    },
    body: JSON.stringify({
      question: el("q").value,
      option1: el("o1").value,
      option2: el("o2").value,
      option3: el("o3").value,
      option4: el("o4").value,
      answer: el("ans").value
    })
  })
  .then(res => res.json().then(data => ({status: res.status, body: data})))
  .then(res => {
    btn.innerText = originalText;
    if (res.status === 200) {
      el("msg").innerText = res.body.msg;
      el("msg").className = "msg success";
      resetForm();
    } else {
      el("msg").innerText = res.body.msg || "Failed to add";
      el("msg").className = "msg error";
    }
  })
  .catch(err => {
    console.error("Add question error:", err);
    btn.innerText = originalText;
    el("msg").innerText = "Network Error (Check server)";
    el("msg").className = "msg error";
  });
}

// ADMIN UPDATE QUESTION
function updateQuestion(e, id) {
  const btn = e ? e.target : event.target;
  btn.innerText = "Updating...";

  fetch(API + "/admin/questions/" + id, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "Authorization": "Bearer " + localStorage.getItem("token")
    },
    body: JSON.stringify({
      question: el("q").value,
      option1: el("o1").value,
      option2: el("o2").value,
      option3: el("o3").value,
      option4: el("o4").value,
      answer: el("ans").value
    })
  })
  .then(res => res.json())
  .then(data => {
    el("msg").innerText = data.msg;
    el("msg").className = "msg success";
    resetForm();
    // Refresh bank if visible
    if (el("q-list-tab").classList.contains('active')) {
      fetchAdminQuestions();
    }
  })
  .catch(err => {
    btn.innerText = "Update Question";
    el("msg").innerText = "Failed to update";
  });
}

// INIT EDIT
let adminQuestionsData = [];
function initEditQuestion(id) {
  const q = adminQuestionsData.find(item => item._id === id);
  if (!q) return;

  if (typeof showTab === 'function') {
    showTab('add-tab');
  }
  
  el("form-title").innerText = "Edit Question";
  el("edit-id").value = q._id;
  el("q").value = q.question;
  el("o1").value = q.option1;
  el("o2").value = q.option2;
  el("o3").value = q.option3;
  el("o4").value = q.option4;
  el("ans").value = q.answer;
  
  el("submit-btn").innerText = "Update Question";
  el("cancel-btn").classList.remove('hidden');
}

function cancelEdit() {
  resetForm();
}

function resetForm() {
  el("form-title").innerText = "Add New Question";
  el("edit-id").value = "";
  el("q").value = "";
  el("o1").value = "";
  el("o2").value = "";
  el("o3").value = "";
  el("o4").value = "";
  el("ans").value = "";
  el("submit-btn").innerText = "Add Question to Bank";
  el("cancel-btn").classList.add('hidden');
}

// ADMIN FETCH QUESTIONS
function fetchAdminQuestions() {
  const listDiv = el("admin-q-list");
  if (!listDiv) return;
  listDiv.innerHTML = "<p>Loading questions...</p>";

  fetch(API + "/admin/questions", {
    headers: { "Authorization": "Bearer " + localStorage.getItem("token") }
  })
  .then(res => res.json())
  .then(data => {
    adminQuestionsData = data;
    const qCountEl = el("q-count");
    if (qCountEl) qCountEl.innerText = data.length + " Questions";
    
    if (data.length === 0) {
      listDiv.innerHTML = "<p style='text-align:center; padding: 2rem; color: var(--text-dim);'>No questions found.</p>";
      return;
    }

    let html = "";
    data.forEach(q => {
      html += `
      <div class="admin-q-card">
        <div style="position: absolute; top: 1.5rem; right: 1.5rem; display: flex; gap: 0.5rem;">
          <button class="badge" onclick="initEditQuestion('${q._id}')" style="cursor: pointer; border: none; background: rgba(139, 92, 246, 0.2); color: #a78bfa;">Edit</button>
          <button class="delete-btn" style="position: static;" onclick="deleteQuestion('${q._id}')">Delete</button>
        </div>
        <h4>${q.question}</h4>
        <div class="options">
          <div>1. ${q.option1}</div>
          <div>2. ${q.option2}</div>
          <div>3. ${q.option3}</div>
          <div>4. ${q.option4}</div>
        </div>
        <div class="correct-ans">Correct: ${q.answer}</div>
      </div>
      `;
    });
    listDiv.innerHTML = html;
  })
  .catch(err => {
    console.error(err);
    listDiv.innerHTML = "<p class='msg error'>Failed to load questions.</p>";
  });
}

// ADMIN FETCH RESULTS
function fetchAdminResults() {
  const listBody = el("admin-res-list");
  if (!listBody) return;
  listBody.innerHTML = "<tr><td colspan='5' style='text-align:center;'>Loading results...</td></tr>";

  fetch(API + "/admin/results", {
    headers: { "Authorization": "Bearer " + localStorage.getItem("token") }
  })
  .then(res => res.json())
  .then(data => {
    const resCountEl = el("res-count");
    if (resCountEl) resCountEl.innerText = data.length + " Records";
    
    if (data.length === 0) {
      listBody.innerHTML = "<tr><td colspan='5' style='text-align:center; padding: 2rem; color: var(--text-dim);'>No results recorded yet.</td></tr>";
      return;
    }

    let html = "";
    data.forEach(r => {
      const date = new Date(r.date).toLocaleString();
      html += `
      <tr>
        <td>${r.user ? r.user.name : 'Deleted User'}</td>
        <td>${r.user ? r.user.email : '-'}</td>
        <td>${r.user ? r.user.mobile : '-'}</td>
        <td style="font-weight: 600;">${r.score} / ${r.total}</td>
        <td><span class="badge" style="background: ${parseFloat(r.percent) >= 50 ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)'}; color: ${parseFloat(r.percent) >= 50 ? '#10b981' : '#ef4444'};">${r.percent}%</span></td>
        <td style="color: var(--text-dim); font-size: 0.85rem;">${date}</td>
        <td>
            <button class="delete-btn" style="position: static;" onclick="deleteResult('${r._id}')">Delete</button>
        </td>
      </tr>
      `;
    });
    listBody.innerHTML = html;
  })
  .catch(err => {
    console.error(err);
    listBody.innerHTML = "<tr><td colspan='5' style='text-align:center;' class='msg error'>Failed to load results.</td></tr>";
  });
}

// DELETE QUESTION
function deleteQuestion(id) {
  if (!confirm("Are you sure you want to delete this question?")) return;

  fetch(API + "/admin/questions/" + id, {
    method: "DELETE",
    headers: { 
        "Content-Type": "application/json",
        "Authorization": "Bearer " + localStorage.getItem("token") 
    }
  })
  .then(res => res.json())
  .then(data => {
    fetchAdminQuestions();
  })
  .catch(err => alert("Failed to delete"));
}

// DELETE RESULT
function deleteResult(id) {
  if (!confirm("Are you sure you want to delete this student record?")) return;

  fetch(API + "/admin/results/" + id, {
    method: "DELETE",
    headers: { 
        "Content-Type": "application/json",
        "Authorization": "Bearer " + localStorage.getItem("token") 
    }
  })
  .then(res => res.json())
  .then(data => {
    fetchAdminResults();
  })
  .catch(err => alert("Failed to delete"));
}