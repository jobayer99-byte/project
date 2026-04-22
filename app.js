// ── Data ─────────────────────────────────────────────────
const DEFAULT_STUDENTS = [
  "Jobayer Ahmmed",
  "MD Kawser Hossain",
  "Lobna Khanam Rimi",
  "Sree Niloy Chandra Mandal",
  "Md Rahat",
  "MD. Muktadir Rahman Souad",
  "Shazahan Kobir",
  "MD. Motasim Billah Raihan",
  "Papia Akter Mim",
  "Uthsab Ghosh",
  "MD Wasim",
  "Md Shahriar Nafiz Rabbi",
  "Foysal Hossain"
];

const ADMIN_PASS = "jobayer123"; // ← admin password

function getStudents() {
  const s = localStorage.getItem("att_students");
  return s ? JSON.parse(s) : DEFAULT_STUDENTS;
}
function saveStudents(list) {
  localStorage.setItem("att_students", JSON.stringify(list));
}
function getRecords() {
  const r = localStorage.getItem("att_records");
  return r ? JSON.parse(r) : [];
}
function saveRecords(list) {
  localStorage.setItem("att_records", JSON.stringify(list));
}

// ── Clock ─────────────────────────────────────────────────
function startClock() {
  const timeEl = document.getElementById("clock-time");
  const dateEl = document.getElementById("clock-date");
  if (!timeEl) return;
  function tick() {
    const now = new Date();
    timeEl.textContent = now.toLocaleTimeString("en-GB", { timeZone: "Asia/Dhaka", hour: "2-digit", minute: "2-digit", second: "2-digit" });
    dateEl.textContent = now.toLocaleDateString("en-GB", { timeZone: "Asia/Dhaka", weekday: "long", year: "numeric", month: "long", day: "numeric" });
  }
  tick();
  setInterval(tick, 1000);
}

// ── Router ────────────────────────────────────────────────
let currentPage = "home";
function showPage(page) {
  currentPage = page;
  document.querySelectorAll(".page").forEach(p => p.classList.remove("show"));
  document.querySelectorAll("nav button").forEach(b => b.classList.remove("active"));
  document.getElementById("page-" + page).classList.add("show");
  document.getElementById("nav-" + page).classList.add("active");
  if (page === "home")    renderHome();
  if (page === "records") renderRecords();
  if (page === "admin")   renderAdmin();
}

// ── Home Page ─────────────────────────────────────────────
function renderHome() {
  const students = getStudents();
  const sel = document.getElementById("student-select");
  sel.innerHTML = `<option value="">— তোমার নাম বেছে নাও —</option>`;
  students.forEach(s => {
    const opt = document.createElement("option");
    opt.value = opt.textContent = s;
    sel.appendChild(opt);
  });
  document.getElementById("att-msg").style.display = "none";
}

function submitAttendance(status) {
  const name = document.getElementById("student-select").value;
  const msg  = document.getElementById("att-msg");
  if (!name) {
    showMsg(msg, "error", "⚠️ আগে তোমার নাম select করো!");
    return;
  }
  const now = new Date();
  const records = getRecords();
  records.push({
    id: Date.now(),
    name,
    status,
    date: now.toLocaleDateString("en-GB", { timeZone: "Asia/Dhaka" }),
    time: now.toLocaleTimeString("en-GB", { timeZone: "Asia/Dhaka", hour: "2-digit", minute: "2-digit" }),
    datetime: now.toISOString()
  });
  saveRecords(records);
  showMsg(msg, "success", `✅ ${name} — ${status} হিসেবে নেওয়া হয়েছে!`);
  document.getElementById("student-select").value = "";
}

function showMsg(el, type, text) {
  el.textContent = text;
  el.className = "alert alert-" + (type === "success" ? "success" : "error");
  el.style.display = "block";
  if (type === "success") setTimeout(() => { el.style.display = "none"; }, 3500);
}

// ── Records Page ──────────────────────────────────────────
function renderRecords(filterDate = "", filterName = "") {
  let records = getRecords();
  if (filterDate) records = records.filter(r => r.date === filterDate);
  if (filterName) records = records.filter(r => r.name === filterName);
  records = [...records].reverse();

  const total   = records.length;
  const present = records.filter(r => r.status === "Present").length;
  const absent  = total - present;

  document.getElementById("rec-total").textContent   = total;
  document.getElementById("rec-present").textContent = present;
  document.getElementById("rec-absent").textContent  = absent;

  // student filter dropdown
  const students = getStudents();
  const sel = document.getElementById("rec-filter-name");
  const prev = sel.value;
  sel.innerHTML = `<option value="">— সব student —</option>`;
  students.forEach(s => {
    const opt = document.createElement("option");
    opt.value = opt.textContent = s;
    if (s === prev) opt.selected = true;
    sel.appendChild(opt);
  });

  const tbody = document.getElementById("rec-tbody");
  tbody.innerHTML = "";
  if (!records.length) {
    tbody.innerHTML = `<tr class="empty-row"><td colspan="5">কোনো record নেই।</td></tr>`;
    return;
  }
  records.forEach((r, i) => {
    tbody.innerHTML += `
      <tr>
        <td>${i + 1}</td>
        <td><strong>${r.name}</strong></td>
        <td><span class="badge badge-${r.status.toLowerCase()}">${r.status}</span></td>
        <td>${r.date}</td>
        <td>${r.time}</td>
      </tr>`;
  });
}

function applyRecordFilter() {
  const date = document.getElementById("rec-filter-date").value;
  const name = document.getElementById("rec-filter-name").value;

  // convert yyyy-mm-dd → dd/mm/yyyy
  let fmtDate = "";
  if (date) {
    const [y, m, d] = date.split("-");
    fmtDate = `${d}/${m}/${y}`;
  }
  renderRecords(fmtDate, name);
}

// ── Admin Page ────────────────────────────────────────────
let adminAuthed = false;

function renderAdmin() {
  if (!adminAuthed) {
    document.getElementById("admin-login").style.display = "block";
    document.getElementById("admin-dashboard").style.display = "none";
  } else {
    document.getElementById("admin-login").style.display = "none";
    document.getElementById("admin-dashboard").style.display = "block";
    renderAdminRecords();
    renderStudentTags();
  }
}

function adminLogin() {
  const val = document.getElementById("admin-pass").value;
  if (val === ADMIN_PASS) {
    adminAuthed = true;
    document.getElementById("admin-pass-err").style.display = "none";
    renderAdmin();
  } else {
    document.getElementById("admin-pass-err").style.display = "block";
  }
}

function adminLogout() {
  adminAuthed = false;
  document.getElementById("admin-pass").value = "";
  renderAdmin();
}

function renderAdminRecords(filterDate = "", filterName = "") {
  let records = getRecords();
  if (filterDate) records = records.filter(r => r.date === filterDate);
  if (filterName) records = records.filter(r => r.name === filterName);
  records = [...records].reverse();

  const total   = records.length;
  const present = records.filter(r => r.status === "Present").length;
  const absent  = total - present;

  document.getElementById("adm-total").textContent   = total;
  document.getElementById("adm-present").textContent = present;
  document.getElementById("adm-absent").textContent  = absent;

  // student filter
  const students = getStudents();
  const sel = document.getElementById("adm-filter-name");
  const prev = sel.value;
  sel.innerHTML = `<option value="">— সব student —</option>`;
  students.forEach(s => {
    const opt = document.createElement("option");
    opt.value = opt.textContent = s;
    if (s === prev) opt.selected = true;
    sel.appendChild(opt);
  });

  const tbody = document.getElementById("adm-tbody");
  tbody.innerHTML = "";
  if (!records.length) {
    tbody.innerHTML = `<tr class="empty-row"><td colspan="6">কোনো record নেই।</td></tr>`;
    return;
  }
  records.forEach((r, i) => {
    tbody.innerHTML += `
      <tr>
        <td>${i + 1}</td>
        <td><strong>${r.name}</strong></td>
        <td><span class="badge badge-${r.status.toLowerCase()}">${r.status}</span></td>
        <td>${r.date}</td>
        <td>${r.time}</td>
        <td><button class="btn btn-danger" onclick="deleteRecord(${r.id})">🗑</button></td>
      </tr>`;
  });
}

function applyAdminFilter() {
  const date = document.getElementById("adm-filter-date").value;
  const name = document.getElementById("adm-filter-name").value;
  let fmtDate = "";
  if (date) {
    const [y, m, d] = date.split("-");
    fmtDate = `${d}/${m}/${y}`;
  }
  renderAdminRecords(fmtDate, name);
}

function deleteRecord(id) {
  if (!confirm("এই record টা delete করবে?")) return;
  const records = getRecords().filter(r => r.id !== id);
  saveRecords(records);
  applyAdminFilter();
}

function exportCSV() {
  const records = getRecords().reverse();
  let csv = "Name,Status,Date,Time\n";
  records.forEach(r => { csv += `"${r.name}",${r.status},${r.date},${r.time}\n`; });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
  a.download = "attendance-" + new Date().toISOString().slice(0, 10) + ".csv";
  a.click();
}

function renderStudentTags() {
  const students = getStudents();
  const list = document.getElementById("student-tag-list");
  list.innerHTML = "";
  students.forEach((s, i) => {
    list.innerHTML += `
      <div class="tag">
        ${s}
        <button onclick="removeStudent(${i})" title="Remove">×</button>
      </div>`;
  });
}

function addStudent() {
  const input = document.getElementById("new-student-input");
  const name  = input.value.trim();
  if (!name) return;
  const students = getStudents();
  if (students.includes(name)) { alert("এই নাম already আছে!"); return; }
  students.push(name);
  saveStudents(students);
  input.value = "";
  renderStudentTags();
}

function removeStudent(i) {
  const students = getStudents();
  if (!confirm(`"${students[i]}" কে remove করবে?`)) return;
  students.splice(i, 1);
  saveStudents(students);
  renderStudentTags();
}

// ── Render App ────────────────────────────────────────────
function renderApp() {
  document.getElementById("root").innerHTML = `
    <header>
      <h1>Wordpress Course By Jobayer Ahmmed</h1>
      <p>Student Attendance System</p>
    </header>

    <nav>
      <button id="nav-home"    onclick="showPage('home')">🏠 Attendance</button>
      <button id="nav-records" onclick="showPage('records')">📊 Records</button>
      <button id="nav-admin"   onclick="showPage('admin')">⚙️ Admin</button>
    </nav>

    <!-- ── HOME ── -->
    <div class="page" id="page-home">
      <div class="card">
        <div class="clock-box">
          <div class="time" id="clock-time">--:--:--</div>
          <div class="date" id="clock-date"></div>
        </div>

        <select id="student-select"></select>

        <div class="att-btns">
          <button class="btn-present" onclick="submitAttendance('Present')">✅ Present</button>
          <button class="btn-absent"  onclick="submitAttendance('Absent')">❌ Absent</button>
        </div>

        <div id="att-msg" style="display:none"></div>
      </div>
    </div>

    <!-- ── RECORDS ── -->
    <div class="page" id="page-records">
      <div class="stats">
        <div class="stat"><div class="num c-blue"  id="rec-total">0</div><div class="lbl">Total</div></div>
        <div class="stat"><div class="num c-green" id="rec-present">0</div><div class="lbl">Present</div></div>
        <div class="stat"><div class="num c-red"   id="rec-absent">0</div><div class="lbl">Absent</div></div>
      </div>

      <div class="filters">
        <input type="date" id="rec-filter-date" onchange="applyRecordFilter()">
        <select id="rec-filter-name" onchange="applyRecordFilter()">
          <option value="">— সব student —</option>
        </select>
        <button class="btn btn-gray" onclick="document.getElementById('rec-filter-date').value='';document.getElementById('rec-filter-name').value='';renderRecords()">Reset</button>
      </div>

      <div class="table-wrap">
        <table>
          <thead>
            <tr><th>#</th><th>নাম</th><th>Status</th><th>তারিখ</th><th>সময়</th></tr>
          </thead>
          <tbody id="rec-tbody"></tbody>
        </table>
      </div>
    </div>

    <!-- ── ADMIN ── -->
    <div class="page" id="page-admin">

      <!-- Login -->
      <div id="admin-login" class="login-wrap">
        <div class="card">
          <p class="section-title" style="text-align:center;margin-bottom:18px">🔐 Admin Login</p>
          <input type="password" id="admin-pass" placeholder="Password দাও" onkeydown="if(event.key==='Enter')adminLogin()">
          <p id="admin-pass-err" class="login-err" style="display:none">❌ Password ভুল!</p>
          <button class="btn btn-primary" style="width:100%" onclick="adminLogin()">Login</button>
        </div>
      </div>

      <!-- Dashboard -->
      <div id="admin-dashboard" style="display:none">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:18px">
          <span style="font-size:18px;font-weight:700">⚙️ Admin Panel</span>
          <button class="btn btn-gray" onclick="adminLogout()">Logout</button>
        </div>

        <div class="stats">
          <div class="stat"><div class="num c-blue"  id="adm-total">0</div><div class="lbl">Total</div></div>
          <div class="stat"><div class="num c-green" id="adm-present">0</div><div class="lbl">Present</div></div>
          <div class="stat"><div class="num c-red"   id="adm-absent">0</div><div class="lbl">Absent</div></div>
        </div>

        <div class="filters">
          <input type="date" id="adm-filter-date" onchange="applyAdminFilter()">
          <select id="adm-filter-name" onchange="applyAdminFilter()">
            <option value="">— সব student —</option>
          </select>
          <button class="btn btn-gray" onclick="document.getElementById('adm-filter-date').value='';document.getElementById('adm-filter-name').value='';renderAdminRecords()">Reset</button>
          <button class="btn btn-export" onclick="exportCSV()">⬇ CSV</button>
        </div>

        <div class="table-wrap" style="margin-bottom:24px">
          <table>
            <thead>
              <tr><th>#</th><th>নাম</th><th>Status</th><th>তারিখ</th><th>সময়</th><th>Del</th></tr>
            </thead>
            <tbody id="adm-tbody"></tbody>
          </table>
        </div>

        <!-- Student Manager -->
        <div class="card">
          <p class="section-title">👥 Student List</p>
          <div class="tag-list" id="student-tag-list"></div>
          <div class="add-row">
            <input type="text" id="new-student-input" placeholder="নতুন student এর নাম" onkeydown="if(event.key==='Enter')addStudent()">
            <button class="btn btn-primary" onclick="addStudent()">+ Add</button>
          </div>
        </div>
      </div>
    </div>
  `;

  startClock();
  showPage("home");
}

renderApp();
