// Mock dataset representing a sample of the 128 submissions in the inbox.
const submissions = [
  { nct: "NCT04567890", sponsor: "Acme Pharma", risk: "high", status: "Needs Review", score: 42, issue: "Missing Primary Outcome", updated: "2026-07-08" },
  { nct: "NCT03812345", sponsor: "Union Pharma", risk: "high", status: "Needs Review", score: 38, issue: "Missing Adverse Events", updated: "2026-07-07" },
  { nct: "NCT05234567", sponsor: "Vertex Trials Inc.", risk: "high", status: "Needs Review", score: 45, issue: "Incomplete Statistical Analysis", updated: "2026-07-06" },
  { nct: "NCT03678901", sponsor: "BioHealth Corp", risk: "high", status: "Overdue", score: 30, issue: "No Results Posted", updated: "2026-06-28" },
  { nct: "NCT04987654", sponsor: "Summit Biosciences", risk: "medium", status: "Needs Fixes", score: 68, issue: "Inconsistent Data Fields", updated: "2026-07-08" },
  { nct: "NCT04123456", sponsor: "Clarity Health Labs", risk: "medium", status: "Needs Fixes", score: 71, issue: "Missing Baseline Data", updated: "2026-07-07" },
  { nct: "NCT05321098", sponsor: "Meridian Clinical", risk: "medium", status: "Needs Fixes", score: 65, issue: "Formatting Errors", updated: "2026-07-05" },
  { nct: "NCT05399887", sponsor: "MedInnovate Inc.", risk: "medium", status: "Under Review", score: 74, issue: "Pending AI Review", updated: "2026-07-08" },
  { nct: "NCT04876543", sponsor: "NovaGen Therapeutics", risk: "low", status: "Compliant", score: 94, issue: "—", updated: "2026-07-08" },
  { nct: "NCT03987612", sponsor: "Apex BioSciences", risk: "low", status: "Compliant", score: 97, issue: "—", updated: "2026-07-06" },
  { nct: "NCT05098765", sponsor: "BioHealth Corp", risk: "low", status: "Compliant", score: 91, issue: "—", updated: "2026-07-04" },
];

const riskBadge = { high: "badge-red", medium: "badge-orange", low: "badge-green" };
const riskLabel = { high: "High Risk", medium: "Medium Risk", low: "Low Risk" };
const statusBadge = {
  "Needs Review": "badge-red",
  "Overdue": "badge-red",
  "Needs Fixes": "badge-orange",
  "Under Review": "badge-blue",
  "Compliant": "badge-green",
};

let toastTimer = null;
function showToast(message) {
  const toast = document.getElementById("toast");
  toast.textContent = message;
  toast.hidden = false;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { toast.hidden = true; }, 3000);
}

function switchView(viewName, filter) {
  document.querySelectorAll(".view").forEach((v) => { v.hidden = true; });
  const target = document.getElementById(`view-${viewName}`);
  if (target) target.hidden = false;

  document.querySelectorAll(".nav-item[data-view]").forEach((item) => {
    item.classList.toggle("active", item.dataset.view === viewName);
  });

  const titles = {
    home: ["Welcome back, FDA Reviewer", "Here's what's happening with clinical trial results submissions."],
    inbox: ["Submission Inbox", "Review flagged trials and send one-click sponsor reminders."],
    submissions: ["All Submissions", "Every trial tracked by Nexus, across every status."],
    analytics: ["Analytics", "Compliance trends and pattern analysis across sponsors."],
    reports: ["Reports", "Published compliance reports for FDA leadership."],
    sponsors: ["Sponsors", "Aggregated compliance performance by sponsor."],
    alerts: ["Alerts", "Every flagged event across the submission pipeline."],
    settings: ["Settings", "Manage your profile, notifications, and security preferences."],
  };
  const [title, subtitle] = titles[viewName] || titles.home;
  document.getElementById("pageTitle").textContent = title;
  document.getElementById("pageSubtitle").textContent = subtitle;

  if (viewName === "inbox") renderInbox(filter || "all");
  if (viewName === "submissions") renderSubmissions(filter || "all");
  if (viewName === "analytics") renderAnalytics();
  if (viewName === "reports") renderReports();
  if (viewName === "sponsors") renderSponsors();
  if (viewName === "alerts") renderAlerts();

  closeAllDropdowns();
}

function sendReminder(nct, sponsor, btn) {
  btn.textContent = "Sent";
  btn.classList.remove("btn-primary");
  btn.classList.add("btn-disabled");
  btn.disabled = true;
  showToast(`Reminder sent to ${sponsor} for ${nct}.`);
}

function renderInbox(activeFilter) {
  document.querySelectorAll("#inboxFilters .filter-chip").forEach((chip) => {
    chip.classList.toggle("active", chip.dataset.risk === activeFilter);
  });

  const query = document.getElementById("globalSearch").value.trim().toLowerCase();
  const rows = submissions.filter((s) => s.status !== "Compliant" && s.risk !== "low")
    .filter((s) => activeFilter === "all" || s.risk === activeFilter)
    .filter((s) => !query || s.nct.toLowerCase().includes(query) || s.sponsor.toLowerCase().includes(query));

  document.getElementById("inboxCount").textContent = `Showing ${rows.length} of 128 submissions`;

  const tbody = document.getElementById("inboxTableBody");
  tbody.innerHTML = rows.map((s) => `
    <tr>
      <td>${s.nct}</td>
      <td>${s.sponsor}</td>
      <td><span class="badge ${riskBadge[s.risk]}"><span class="dot dot-${s.risk === "high" ? "red" : s.risk === "medium" ? "orange" : "green"}"></span>${riskLabel[s.risk]}</span></td>
      <td>${s.score}</td>
      <td>${s.issue}</td>
      <td>${s.updated}</td>
      <td><button class="btn btn-primary btn-sm" data-nct="${s.nct}" data-sponsor="${s.sponsor}">Send Reminder</button></td>
    </tr>
  `).join("") || `<tr><td colspan="7" style="color:var(--text-muted); white-space:normal;">No submissions match this filter.</td></tr>`;

  tbody.querySelectorAll("button[data-nct]").forEach((btn) => {
    btn.addEventListener("click", () => sendReminder(btn.dataset.nct, btn.dataset.sponsor, btn));
  });
}

function renderSubmissions(activeStatus) {
  document.querySelectorAll("#submissionsFilters .filter-chip").forEach((chip) => {
    chip.classList.toggle("active", chip.dataset.status === activeStatus);
  });

  const query = document.getElementById("globalSearch").value.trim().toLowerCase();
  const rows = submissions
    .filter((s) => activeStatus === "all" || s.status === activeStatus)
    .filter((s) => !query || s.nct.toLowerCase().includes(query) || s.sponsor.toLowerCase().includes(query));

  document.getElementById("submissionsCount").textContent = `Showing ${rows.length} of 128 submissions`;

  const tbody = document.getElementById("submissionsTableBody");
  tbody.innerHTML = rows.map((s) => `
    <tr>
      <td>${s.nct}</td>
      <td>${s.sponsor}</td>
      <td><span class="badge ${statusBadge[s.status]}">${s.status}</span></td>
      <td><span class="badge ${riskBadge[s.risk]}">${riskLabel[s.risk]}</span></td>
      <td>${s.score}</td>
      <td>${s.updated}</td>
    </tr>
  `).join("") || `<tr><td colspan="6" style="color:var(--text-muted); white-space:normal;">No submissions match this filter.</td></tr>`;
}

function renderAnalytics() {
  const trend = [
    { label: "Feb", value: 58 },
    { label: "Mar", value: 61 },
    { label: "Apr", value: 60 },
    { label: "May", value: 64 },
    { label: "Jun", value: 66.7 },
    { label: "Jul", value: 70.4 },
  ];
  const max = 100;
  document.getElementById("trendChart").innerHTML = trend.map((t) => `
    <div class="bar-col">
      <div class="bar-value">${t.value}%</div>
      <div class="bar" style="height:${(t.value / max) * 100}%"></div>
      <div class="bar-label">${t.label}</div>
    </div>
  `).join("");

  const issues = [
    { label: "Missing Primary Outcome", count: 41 },
    { label: "Missing Adverse Events", count: 33 },
    { label: "Incomplete Statistical Analysis", count: 27 },
    { label: "Inconsistent Data Fields", count: 19 },
    { label: "Formatting Errors", count: 12 },
  ];
  const issueMax = Math.max(...issues.map((i) => i.count));
  document.getElementById("issueList").innerHTML = issues.map((i) => `
    <li>
      <span>${i.label}</span>
      <span class="issue-bar-track"><span class="issue-bar-fill" style="width:${(i.count / issueMax) * 100}%"></span></span>
      <strong>${i.count}</strong>
    </li>
  `).join("");
}

function renderReports() {
  const reports = [
    { title: "June 2026 Compliance Summary", meta: "Published Jul 1, 2026 · Agency-wide" },
    { title: "Q2 2026 Sponsor Reporting Gaps", meta: "Published Jun 30, 2026 · Leadership briefing" },
    { title: "High-Risk Submission Review — May 2026", meta: "Published Jun 3, 2026 · Internal" },
    { title: "FDAAA Outreach Follow-Up Log", meta: "Published May 20, 2026 · Compliance office" },
  ];
  document.getElementById("reportList").innerHTML = reports.map((r) => `
    <li class="report-item">
      <div>
        <div class="report-title">${r.title}</div>
        <div class="report-meta">${r.meta}</div>
      </div>
      <button class="btn btn-outline btn-sm download-report">Download</button>
    </li>
  `).join("");

  document.querySelectorAll(".download-report").forEach((btn) => {
    btn.addEventListener("click", () => showToast("Report download started (demo)."));
  });
}

function renderSponsors() {
  const bySponsor = {};
  submissions.forEach((s) => {
    if (!bySponsor[s.sponsor]) bySponsor[s.sponsor] = { trials: [], riskRank: 0 };
    bySponsor[s.sponsor].trials.push(s);
  });
  const rank = { high: 3, medium: 2, low: 1 };

  const rows = Object.entries(bySponsor).map(([sponsor, data]) => {
    const avgScore = Math.round(data.trials.reduce((sum, t) => sum + t.score, 0) / data.trials.length);
    const highestRisk = data.trials.reduce((max, t) => (rank[t.risk] > rank[max] ? t.risk : max), "low");
    return { sponsor, count: data.trials.length, avgScore, highestRisk };
  });

  document.getElementById("sponsorsTableBody").innerHTML = rows.map((r) => `
    <tr>
      <td>${r.sponsor}</td>
      <td>${r.count}</td>
      <td>${r.avgScore}</td>
      <td><span class="badge ${riskBadge[r.highestRisk]}">${riskLabel[r.highestRisk]}</span></td>
      <td><button class="btn btn-outline btn-sm view-sponsor-btn" data-sponsor="${r.sponsor}">View Trials</button></td>
    </tr>
  `).join("");

  document.querySelectorAll(".view-sponsor-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      document.getElementById("globalSearch").value = btn.dataset.sponsor;
      switchView("submissions", "all");
    });
  });
}

const allAlerts = [
  { type: "warning", title: "High risk submission missing Primary Outcome", meta: "NCT04567890 · Acme Pharma", time: "10 min ago" },
  { type: "warning", title: "Overdue trial results", meta: "NCT03678901 · BioHealth Corp", time: "1 hr ago" },
  { type: "info", title: "New submission received", meta: "NCT05399887 · MedInnovate Inc.", time: "2 hr ago" },
  { type: "warning", title: "Missing Adverse Events section flagged", meta: "NCT03812345 · Union Pharma", time: "5 hr ago" },
  { type: "info", title: "Sponsor responded to reminder", meta: "NCT04987654 · Summit Biosciences", time: "Yesterday" },
  { type: "warning", title: "Incomplete statistical analysis flagged", meta: "NCT05234567 · Vertex Trials Inc.", time: "Yesterday" },
];

function alertIcon(type) {
  return type === "warning" ? "&#9888;" : "&#8505;";
}

function renderAlerts() {
  document.getElementById("fullAlertList").innerHTML = allAlerts.map((a) => `
    <li class="alert-item">
      <span class="alert-icon alert-${a.type}">${alertIcon(a.type)}</span>
      <div class="alert-text">
        <div class="alert-title">${a.title}</div>
        <div class="alert-meta">${a.meta}</div>
      </div>
      <div class="alert-time">${a.time}</div>
    </li>
  `).join("");
}

function renderNotifDropdown() {
  document.getElementById("notifList").innerHTML = allAlerts.slice(0, 5).map((a) => `
    <li>
      <div class="dropdown-item-title">${a.title}</div>
      <div class="dropdown-item-meta">${a.meta} · ${a.time}</div>
    </li>
  `).join("");
}

function closeAllDropdowns() {
  document.querySelectorAll(".dropdown-panel").forEach((p) => { p.hidden = true; });
}

function toggleDropdown(panelId) {
  const panel = document.getElementById(panelId);
  const isHidden = panel.hidden;
  closeAllDropdowns();
  panel.hidden = !isHidden;
}

document.addEventListener("DOMContentLoaded", () => {
  renderNotifDropdown();

  document.querySelectorAll("[data-view]").forEach((el) => {
    el.addEventListener("click", (e) => {
      e.preventDefault();
      switchView(el.dataset.view, el.dataset.filter);
    });
  });

  document.getElementById("notifBtn").addEventListener("click", (e) => {
    e.stopPropagation();
    toggleDropdown("notifPanel");
  });

  document.getElementById("helpBtn").addEventListener("click", (e) => {
    e.stopPropagation();
    toggleDropdown("helpPanel");
  });

  document.getElementById("userChip").addEventListener("click", (e) => {
    e.stopPropagation();
    toggleDropdown("userPanel");
  });

  document.getElementById("helpNavBtn").addEventListener("click", (e) => {
    e.preventDefault();
    toggleDropdown("helpPanel");
  });

  document.getElementById("signOutBtn").addEventListener("click", (e) => {
    e.preventDefault();
    showToast("Signed out (demo).");
  });

  document.getElementById("userSignOut").addEventListener("click", (e) => {
    e.preventDefault();
    showToast("Signed out (demo).");
    closeAllDropdowns();
  });

  document.addEventListener("click", () => closeAllDropdowns());

  document.getElementById("inboxFilters").addEventListener("click", (e) => {
    const chip = e.target.closest(".filter-chip");
    if (chip) renderInbox(chip.dataset.risk);
  });

  document.getElementById("submissionsFilters").addEventListener("click", (e) => {
    const chip = e.target.closest(".filter-chip");
    if (chip) renderSubmissions(chip.dataset.status);
  });

  document.getElementById("generateReportBtn").addEventListener("click", () => {
    showToast("Generating new compliance report (demo).");
  });

  document.getElementById("markAllReadBtn").addEventListener("click", () => {
    showToast("All alerts marked as read.");
  });

  const searchInput = document.getElementById("globalSearch");
  searchInput.addEventListener("input", () => {
    const activeView = document.querySelector(".view:not([hidden])").id;
    if (activeView === "view-inbox") {
      const activeChip = document.querySelector("#inboxFilters .filter-chip.active");
      renderInbox(activeChip ? activeChip.dataset.risk : "all");
    } else if (activeView === "view-submissions") {
      const activeChip = document.querySelector("#submissionsFilters .filter-chip.active");
      renderSubmissions(activeChip ? activeChip.dataset.status : "all");
    }
  });

  switchView("home");
});
