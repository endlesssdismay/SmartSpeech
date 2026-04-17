// ---------- UNIFIED LOGIN TAB SWITCHER ----------
function switchTab(role) {

  // Hide all forms
  ['student', 'teacher', 'admin'].forEach(r => {
    const form = document.getElementById(r + 'Form');
    if (form) form.style.display = 'none';
  });

  // Always reset student sub-view back to login when switching tabs
  const regForm = document.getElementById('studentRegisterForm');
  if (regForm) regForm.style.display = 'none';

  // Show the selected form
  const target = document.getElementById(role + 'Form');
  if (target) target.style.display = 'block';

  // Update active tab button styling
  const tabs = document.querySelectorAll('.tab-btn');
  const roles = ['student', 'teacher', 'admin'];
  tabs.forEach((btn, i) => {
    btn.classList.toggle('active', roles[i] === role);
  });
}

// ---------- ADMIN LOGIN ----------
function adminLogin(event) {
  event.preventDefault();

  const user = document.getElementById("adminUser").value;
  const pass = document.getElementById("adminPass").value;

  // SIMPLE HARDCODED ADMIN (you can change this)
  if (user === "admin" && pass === "1234") {

    localStorage.setItem("isAdmin", "true");
    showPage("adminPanel");
    loadAdminData();

  } else {
    alert("Invalid admin credentials!");
  }
}

// ---------- ADMIN LOGOUT ----------
function adminLogout() {
  localStorage.removeItem("isAdmin");
  showPage("user");
}

let adminData = [];
let adminMasterData = [];

// LOAD ADMIN DATA (UPDATED)
function loadAdminData() {

  let leaderboard = JSON.parse(localStorage.getItem("leaderboard")) || [];

  adminMasterData = leaderboard;
  adminData = [...leaderboard];

  document.getElementById("totalUsers").innerText = leaderboard.length;

  if (leaderboard.length > 0) {
    document.getElementById("topPlayer").innerText =
      leaderboard[0].name + " (" + leaderboard[0].score + "%)";
  } else {
    document.getElementById("topPlayer").innerText = "-";
  }

  loadAdminSections();
  renderAdminTable(adminData);
}

// RENDER ADMIN TABLE
function renderAdminTable(data = adminData) {

  const tbody = document.getElementById("adminTableBody");
  tbody.innerHTML = "";

  data.forEach((user, index) => {

    tbody.innerHTML += `
      <tr style="text-align:center; border-bottom:1px solid #ddd;">
        <td>${user.name}</td>
        <td>${user.section || "N/A"}</td>
        <td>${user.score}</td>
        <td>${user.practice}</td>
        <td>
          <button class="action-btn" onclick="deleteUser(${index})">Delete</button>
        </td>
      </tr>
    `;
  });
}

// ADMIN DELETE USER
function deleteUser(index) {

  if (!confirm("Delete this user?")) return;

  adminMasterData.splice(index, 1);

  localStorage.setItem("leaderboard", JSON.stringify(adminMasterData));

  loadAdminData();
}

// SECTION FILTER
function loadAdminSections() {

  let sections = [...new Set(adminData.map(u => u.section))];

  const dropdown = document.getElementById("adminSectionFilter");
  dropdown.innerHTML = `<option value="all">All Sections</option>`;

  sections.forEach(sec => {
    dropdown.innerHTML += `<option value="${sec}">${sec}</option>`;
  });
}

// SEARCH + FILTER FUNCTION
function filterAdmin() {

  const keyword = document.getElementById("adminSearch").value.toLowerCase();
  const selected = document.getElementById("adminSectionFilter").value;

  let filtered = adminMasterData;

  if (selected !== "all") {
    filtered = filtered.filter(u => u.section === selected);
  }

  if (keyword !== "") {
    filtered = filtered.filter(u =>
      (u.name || "").toLowerCase().includes(keyword)
    );
  }

  adminData = filtered;
  renderAdminTable(filtered);
}

// SORT FUNCTION
function sortAdmin(type) {

  if (type === "score") {
    adminData.sort((a, b) => b.score - a.score);
  }

  if (type === "practice") {
    adminData.sort((a, b) => b.practice - a.practice);
  }

  if (type === "name") {
    adminData.sort((a, b) => a.name.localeCompare(b.name));
  }

  renderAdminTable();
}

function showPage(page) {

  // ---------- ACCESS CONTROL ----------

  // Teacher protection
  if (page === "teacherDashboard") {
    const isTeacher = localStorage.getItem("isTeacher");
    if (!isTeacher) {
      alert("Access denied!");
      return;
    }
    loadTeacherData();
  }

  // Admin protection
  if (page === "adminPanel") {
    const isAdmin = localStorage.getItem("isAdmin");
    if (!isAdmin) {
      alert("Access denied!");
      return;
    }
    loadAdminData();
  }

  // ---------- PAGE SWITCH ----------
  document.querySelectorAll(".page").forEach(p => p.classList.remove("active"));
  document.getElementById(page).classList.add("active");

  // ---------- AUTO LOAD ----------
  if (page === "leaderboards") updateLeaderboards();
}

let teacherData = [];
let teacherMasterData = []; // ORIGINAL COPY

// ---------- TEACHER LOGIN ----------
function teacherLogin(event) {
  event.preventDefault();

  const user = document.getElementById("teacherUser").value;
  const pass = document.getElementById("teacherPass").value;

  // SIMPLE LOGIN
  if (user === "teacher" && pass === "1234") {

    localStorage.setItem("isTeacher", "true");
    showPage("teacherDashboard");
    loadTeacherData();

  } else {
    alert("Invalid teacher credentials!");
  }
}

// ---------- TEACHER LOGOUT ----------
function teacherLogout() {
  localStorage.removeItem("isTeacher");
  showPage("user");
}

// ---------- LOAD DATA ----------
function loadTeacherData() {

  let leaderboard = JSON.parse(localStorage.getItem("leaderboard")) || [];

  teacherMasterData = leaderboard; // SAVE ORIGINAL
  teacherData = [...leaderboard];  // WORKING COPY

  loadSections();
  renderTeacherTable(teacherData);
}

// ---------- RENDER TABLE ----------
function renderTeacherTable(data = teacherData) {

  const tbody = document.getElementById("teacherTableBody");
  tbody.innerHTML = "";

  data.forEach(user => {
    tbody.innerHTML += `
      <tr style="text-align:center; border-bottom:1px solid #ddd;">
        <td>${user.name}</td>
        <td>${user.score}</td>
        <td>${user.practice}</td>
      </tr>
    `;
  });
}

// ---------- SORT ----------
function sortTeacher(type) {

  let sorted = [...teacherData];

  if (type === "score") {
    sorted.sort((a, b) => b.score - a.score);
  }

  if (type === "practice") {
    sorted.sort((a, b) => b.practice - a.practice);
  }

  if (type === "name") {
    sorted.sort((a, b) => a.name.localeCompare(b.name));
  }

  teacherData = sorted;
  renderTeacherTable(sorted);
}

// ---------- SEARCH ----------
function filterStudents() {

  const keyword = document
    .getElementById("teacherSearch")
    .value
    .toLowerCase();

  const filtered = teacherMasterData.filter(user =>
    (user.name || "").toLowerCase().includes(keyword)
  );

  teacherData = filtered; // update current view
  renderTeacherTable(filtered);
}

function renderTeacherTable(data = teacherData) {

  const tbody = document.getElementById("teacherTableBody");
  tbody.innerHTML = "";

  data.forEach(user => {
    tbody.innerHTML += `
      <tr style="text-align:center; border-bottom:1px solid #ddd;">
        <td>${user.name}</td>
        <td>${user.section || "N/A"}</td>
        <td>${user.score}</td>
        <td>${user.practice}</td>
      </tr>
    `;
  });
}

function loadSections() {

  let sections = [...new Set(teacherData.map(u => u.section))];

  const dropdown = document.getElementById("sectionFilter");
  dropdown.innerHTML = `<option value="all">All Sections</option>`;

  sections.forEach(sec => {
    dropdown.innerHTML += `<option value="${sec}">${sec}</option>`;
  });
}

function filterBySection() {

  const selected = document.getElementById("sectionFilter").value;
  const keyword = document.getElementById("teacherSearch").value.toLowerCase();

  let filtered = teacherMasterData;

  // FILTER BY SECTION
  if (selected !== "all") {
    filtered = filtered.filter(u => u.section === selected);
  }

  // FILTER BY SEARCH
  if (keyword !== "") {
    filtered = filtered.filter(u =>
      (u.name || "").toLowerCase().includes(keyword)
    );
  }

  teacherData = filtered;
  renderTeacherTable(filtered);
}

console.log("Master:", teacherMasterData);
console.log("Current:", teacherData);

// ---------- Variables ----------
let level = 1;
let totalPractice = 0, totalScore = 0;

// ---------- USER STATS STORAGE ----------
function saveUserStats() {

  const username = localStorage.getItem("username");
  if (!username) return;

  const stats = {
    practice: totalPractice,
    score: totalScore
  };

  localStorage.setItem("stats_" + username, JSON.stringify(stats));
}

function loadUserStats() {

  const username = localStorage.getItem("username");
  if (!username) return;

  const stats = JSON.parse(localStorage.getItem("stats_" + username));

  if (stats) {
    totalPractice = stats.practice;
    totalScore = stats.score;
  } else {
    totalPractice = 0;
    totalScore = 0;
  }

  document.getElementById("totalPractice").innerText = totalPractice;
  document.getElementById("averageScore").innerText =
    totalPractice > 0 ? Math.floor(totalScore / totalPractice) + "%" : "0%";
}

// ---------- Level Texts ----------
const levelTexts = {
  1: ["Hello", "Good morning", "Thank you"],
  2: ["Practice speaking every day", "Learning languages is fun"],
  3: ["Technology helps us learn faster", "Speaking clearly improves communication"]
};

// ---------- Generate Practice ----------
function generateText() {
  let texts = levelTexts[level];
  let random = texts[Math.floor(Math.random() * texts.length)];
  document.getElementById("practiceTargetText").innerText = random;
}

// ---------- Select Level ----------
function selectLevel(l) {

  level = l;

  document.getElementById("currentLevel").innerText = l;
  showPage("practice");
}

// ---------- Mobile Menu Toggle ----------
function toggleMenu() {

  const navMenu = document.getElementById("navMenu");
  navMenu.classList.toggle("show");
}

// ---------- Menu Visibility ----------
function updateMenuVisibility() {

  const username = localStorage.getItem("username");
  const navMenu = document.getElementById("navMenu");
  const menuBtn = document.getElementById("menuBtn");

  if (username && username.trim() !== "") {
    menuBtn.style.display = "block";
    navMenu.classList.remove("show");
  } else {
    menuBtn.style.display = "none";
    navMenu.classList.remove("show");
  }
}

// ---------- Header Username ----------
function updateHeaderUsername() {

  const username = localStorage.getItem("username");
  const headerName = document.getElementById("headerUsername");

  if (username) headerName.innerText = " | " + username;
  else headerName.innerText = "";
}

// ---------- TOGGLE STUDENT LOGIN / REGISTER ----------
function toggleStudentView(view) {
  const loginForm = document.getElementById('studentForm');
  const registerForm = document.getElementById('studentRegisterForm');
  if (view === 'register') {
    loginForm.style.display = 'none';
    registerForm.style.display = 'block';
  } else {
    registerForm.style.display = 'none';
    loginForm.style.display = 'block';
  }
}

// ---------- REGISTER STUDENT ----------
async function registerStudent(event){
  event.preventDefault();
  const body={name:regName.value,section:regSection.value,password:regPassword.value};
  const r=await fetch('register.php',{method:'POST',body:JSON.stringify(body)});
  alert(await r.text());

  if (password !== confirm) {
    alert('Passwords do not match!');
    return;
  }

  if (password.length < 4) {
    alert('Password must be at least 4 characters.');
    return;
  }

  let students = JSON.parse(localStorage.getItem('studentAccounts')) || [];

  const exists = students.find(s => s.name.toLowerCase() === name.toLowerCase());
  if (exists) {
    alert('An account with this name already exists. Please login instead.');
    return;
  }

  students.push({ name, section, password });
  localStorage.setItem('studentAccounts', JSON.stringify(students));

  alert('Account created! You can now login.');
  // Pre-fill name and switch to login
  toggleStudentView('login');
  document.getElementById('loginName').value = name;
  document.getElementById('loginPassword').value = '';
  document.getElementById('regName').value = '';
  document.getElementById('regSection').value = '';
  document.getElementById('regPassword').value = '';
  document.getElementById('regConfirm').value = '';
}

// ---------- Login ----------
function loginUser(event) {

  event.preventDefault();

  const name     = document.getElementById('loginName').value.trim();
  const password = document.getElementById('loginPassword').value;

  if (!name || !password) {
    alert('Please enter your name and password.');
    return;
  }

  let students = JSON.parse(localStorage.getItem('studentAccounts')) || [];
  const student = students.find(s => s.name.toLowerCase() === name.toLowerCase());

  if (!student) {
    alert('No account found for that name. Please create one first.');
    return;
  }

  if (student.password !== password) {
    alert('Incorrect password. Please try again.');
    return;
  }

  localStorage.setItem('username', student.name);
  localStorage.setItem('section', student.section);

  updateMenuVisibility();
  updateHeaderUsername();
  loadUserStats();

  document.getElementById('aboutPopup').style.display = 'flex';
  startTeacherIntro();
}

// ---------- Logout ----------
function logoutUser() {

  localStorage.removeItem("username");

  totalPractice = 0;
  totalScore = 0;

  updateMenuVisibility();
  updateHeaderUsername();
  showPage("user");

  document.getElementById("loginName").value = "";
  document.getElementById("loginPassword").value = "";
  toggleStudentView('login');
  switchTab('student'); // Reset to student tab on logout
}

// ---------- Leaderboards ----------
function updateLeaderboards() {

  const container = document.getElementById("leaderboardContainer");
  const podium = document.getElementById("podium");

  let leaderboard = JSON.parse(localStorage.getItem("leaderboard")) || [];

  const username = localStorage.getItem("username");
  const avgScore = totalPractice > 0 ? Math.floor(totalScore / totalPractice) : 0;

  let existingUser = leaderboard.find(u => u.name === username);

  if (existingUser) {

    existingUser.practice = totalPractice;
    existingUser.score = avgScore;
    existingUser.section = section;

  } else {

    const section = localStorage.getItem("section") || "N/A";

    leaderboard.push({
      name: username,
      practice: totalPractice,
      score: avgScore,
      section: section
    });
  }

  leaderboard.sort((a, b) => b.score - a.score);

  localStorage.setItem("leaderboard", JSON.stringify(leaderboard));

  container.innerHTML = "";
  podium.innerHTML = "";

  // ---------- PODIUM TOP 3 ----------
  const top3 = leaderboard.slice(0, 3);

  top3.forEach((user, index) => {

    let medal = ["🥇", "🥈", "🥉"][index];

    podium.innerHTML += `
      <div class="podium-card podium-${index + 1}">
        <h2>${medal}</h2>
        <h3>${user.name}</h3>
        <p>${user.score}%</p>
      </div>
    `;
  });

  // ---------- OTHER PLAYERS ----------
  leaderboard.slice(3).forEach((user, index) => {

    container.innerHTML += `
      <div class="leaderboard-row">

        <div class="rank">#${index + 4}</div>

        <div class="player-info">
          <span class="player-name">${user.name}</span>
          <span class="player-practice">${user.practice} practices</span>
        </div>

        <div class="player-score">${user.score}%</div>

      </div>
    `;

  });
}

// ---------- Speech Recognition ----------
function startSpeechRecognition() {

  const micBtn = event.target;

  micBtn.classList.add('recording');

  const target = document.getElementById("practiceTargetText").innerText;
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

  if (!SpeechRecognition) {

    alert("Browser does not support Speech Recognition");
    micBtn.classList.remove('recording');
    return;
  }

  const recognition = new SpeechRecognition();

  recognition.lang = "en-US";
  recognition.start();
  recognition.onresult = function (event) {

    const speech = event.results[0][0].transcript;

    document.getElementById("speechResult").innerText = "You said: " + speech;

    let score = similarity(speech, target);

    updateScore(score);
    giveVoiceFeedback(score);
    wordFeedback(speech, target);
    updateStreak();

  }

  recognition.onend = function () {
    micBtn.classList.remove('recording');

  }
}

// ---------- Similarity ----------
function similarity(user, target) {

  user = user.toLowerCase().split(" ");
  target = target.toLowerCase().split(" ");

  let correct = 0;

  target.forEach((word, i) => {

    if (user[i] === word) correct++;
    else if (user[i] && levenshtein(user[i], word) <= 1)
      correct += 0.7;
  });

  return Math.floor((correct / target.length) * 100);
}

// ---------- Score ----------
function updateScore(score) {

  let bar = document.getElementById("progressBar");

  bar.style.width = score + "%";

  if (score >= 80) bar.style.background = "#58cc02";
  else if (score >= 50) bar.style.background = "#ffc800";
  else bar.style.background = "#ff4b4b";

  totalPractice++;
  totalScore += score;

  saveUserStats(); // SAVE USER STATS

  document.getElementById("totalPractice").innerText = totalPractice;

  document.getElementById("averageScore").innerText =
    Math.floor(totalScore / totalPractice) + "%";

  updateLeaderboards(); // UPDATE GLOBAL LEADERBOARD
}

// ---------- Speech Voice ----------
function speakText() {

  let text = document.getElementById("practiceTargetText").innerText;
  let speech = new SpeechSynthesisUtterance(text);

  speech.lang = "en-US";
  speech.rate = 0.9;
  speechSynthesis.speak(speech);
}

// ---------- Voice Feedback ----------
function giveVoiceFeedback(score) {

  let message = "";

  if (score >= 85) message = "Excellent pronunciation!";
  else if (score >= 60) message = "Good job. Try speaking clearer.";
  else message = "Let's try again. Listen carefully.";

  document.getElementById("accuracyText").innerText = "Accuracy: " + score + "%";

  let feedback = new SpeechSynthesisUtterance(message);

  speechSynthesis.speak(feedback);
}

// ---------- Word Feedback ----------
function wordFeedback(user, target) {

  let userWords = user.toLowerCase().split(" ");
  let targetWords = target.toLowerCase().split(" ");
  let result = "";

  for (let i = 0; i < targetWords.length; i++) {

    if (userWords[i] === targetWords[i])
      result += "<span class='correct'>" + targetWords[i] + "</span> ";
    else
      result += "<span class='wrong'>" + targetWords[i] + "</span> ";
  }
  document.getElementById("practiceWordFeedback").innerHTML = result;
}

// ---------- Streak ----------
function updateStreak() {

  let today = new Date().toDateString();
  let lastDay = localStorage.getItem("lastPractice");
  let streak = Number(localStorage.getItem("streak") || 0);

  if (lastDay !== today) {

    streak++;

    localStorage.setItem("streak", streak);
    localStorage.setItem("lastPractice", today);

  }
  document.getElementById("streakText").innerText = streak;
}

// ---------- Waveform ----------
const canvas = document.getElementById("waveform");
const ctx = canvas.getContext("2d");

canvas.width = canvas.offsetWidth;
canvas.height = 100;

let audioContext, analyser, dataArray, source;

function startWaveform() {

  if (navigator.mediaDevices.getUserMedia) {

    navigator.mediaDevices.getUserMedia({ audio: true }).then(stream => {

      audioContext = new (window.AudioContext || window.webkitAudioContext)();
      analyser = audioContext.createAnalyser();

      source = audioContext.createMediaStreamSource(stream);
      source.connect(analyser);

      analyser.fftSize = 256;

      dataArray = new Uint8Array(analyser.frequencyBinCount);
      drawWaveform();

    });
  }
}

function drawWaveform() {

  requestAnimationFrame(drawWaveform);

  analyser.getByteFrequencyData(dataArray);

  ctx.fillStyle = '#f0f4f8';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  let barWidth = (canvas.width / dataArray.length) * 2.5;
  let x = 0;

  for (let i = 0; i < dataArray.length; i++) {

    let barHeight = dataArray[i];

    ctx.fillStyle = '#1cb0f6';
    ctx.fillRect(x, canvas.height - barHeight / 2, barWidth, barHeight / 2);
    x += barWidth + 1;

  }
}

// ---------- On Load ----------
window.onload = function () {

  updateMenuVisibility();
  updateHeaderUsername();

  const storedName = localStorage.getItem("username");

  if (storedName) {

    loadUserStats();
    showPage("home");

  } else {
    showPage("user");
  }
  startWaveform();
  updateStreak();
  updateLeaderboards();
};

function levenshtein(a, b) {

  const matrix = [];

  for (let i = 0; i <= b.length; i++) { matrix[i] = [i]; }
  for (let j = 0; j <= a.length; j++) { matrix[0][j] = j; }
  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) == a.charAt(j - 1))
        matrix[i][j] = matrix[i - 1][j - 1];
      else
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );

    }

  }

  return matrix[b.length][a.length];
}

// ---------- AI Conversation Scenarios ----------

const aiScenarios = [

  {
    question: "Hello! How are you today?",
    answers: ["i am good", "i am fine", "i am great"]
  },

  {
    question: "What is your name?",
    answers: ["my name is"]
  },

  {
    question: "Where are you from?",
    answers: ["i am from"]
  },

  {
    question: "Why do you want to learn English?",
    answers: ["to communicate", "to learn", "for school", "for work"]
  }
];

let aiStep = 0;

// ---------- Start Conversation ----------

function startConversation() {

  aiStep = 0;

  document.getElementById("chatBox").innerHTML = "";
  aiSpeak(aiScenarios[0].question);
  addAIMessage(aiScenarios[0].question);
}

// ---------- Speak to AI ----------

function speakToAI() {

  const SpeechRecognition =
    window.SpeechRecognition || window.webkitSpeechRecognition;
  const recognition = new SpeechRecognition();

  recognition.lang = "en-US";
  recognition.start();
  recognition.onresult = function (event) {

    let speech = event.results[0][0].transcript.toLowerCase();

    addUserMessage(speech);
    checkAIResponse(speech);

  }
}

// ---------- Check Response ----------

function checkAIResponse(userSpeech) {

  let scenario = aiScenarios[aiStep];
  let correct = false;

  scenario.answers.forEach(ans => {

    if (userSpeech.includes(ans)) correct = true;
  });
  if (correct) {
    document.getElementById("aiFeedback").innerText = "✅ Good response!";

  } else {
    document.getElementById("aiFeedback").innerText = "⚠ Try answering clearly.";
  }

  aiStep++;

  if (aiStep < aiScenarios.length) {

    setTimeout(() => {
      addAIMessage(aiScenarios[aiStep].question);
      aiSpeak(aiScenarios[aiStep].question);
    }, 1200);

  } else {
    addAIMessage("Great conversation practice!");
    aiSpeak("Great conversation practice!");
  }
}

function addAIMessage(msg) {

  const chat = document.getElementById("chatBox");
  chat.innerHTML += `<div class="ai-msg">${msg}</div>`;
  chat.scrollTop = chat.scrollHeight;
}

function addUserMessage(msg) {

  const chat = document.getElementById("chatBox");
  chat.innerHTML += `<div class="user-msg">${msg}</div>`;
  chat.scrollTop = chat.scrollHeight;
}

function aiSpeak(text) {

  let speech = new SpeechSynthesisUtterance(text);

  speech.lang = "en-US";
  speech.rate = 0.9;
  speechSynthesis.speak(speech);
}

function startTeacherIntro() {

  const text = "Welcome to Smart Speech.";
  const speech = new SpeechSynthesisUtterance(text);

  speech.lang = "en-US";
  speech.rate = 0.9;

  const mouth = document.getElementById("teacherMouth");

  speech.onstart = function () {
    mouth.classList.add("talking");
  }

  speech.onend = function () {
    mouth.classList.remove("talking");
  }
  speechSynthesis.speak(speech);
}

function closeAbout() {
  document.getElementById("aboutPopup").style.display = "none";
  showPage("home");
}

function continueToSystem() {
  document.getElementById("aboutPopup").style.display = "none";
  showPage("home");
}