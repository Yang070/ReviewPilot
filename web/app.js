const authView = document.querySelector("#authView");
const appView = document.querySelector("#appView");
const loginForm = document.querySelector("#loginForm");
const registerForm = document.querySelector("#registerForm");
const settingsDialog = document.querySelector("#settingsDialog");
const settingsForm = document.querySelector("#settingsForm");
const settingsBtn = document.querySelector("#settingsBtn");
const closeSettingsBtn = document.querySelector("#closeSettingsBtn");
const logoutBtn = document.querySelector("#logoutBtn");
const userLabel = document.querySelector("#userLabel");
const messageDialog = document.querySelector("#messageDialog");
const messageTitle = document.querySelector("#messageTitle");
const messageText = document.querySelector("#messageText");
const messageCloseBtn = document.querySelector("#messageCloseBtn");
const operationStatus = document.querySelector("#operationStatus");
const operationTitle = document.querySelector("#operationTitle");
const operationText = document.querySelector("#operationText");
const progressBar = document.querySelector("#progressBar");

const prUrl = document.querySelector("#prUrl");
const diffInput = document.querySelector("#diffInput");
const reviewBtn = document.querySelector("#reviewBtn");
const sampleBtn = document.querySelector("#sampleBtn");
const modelPreset = document.querySelector("#modelPreset");
const customModel = document.querySelector("#customModel");
const customModelField = document.querySelector("#customModelField");

const reportTitle = document.querySelector("#reportTitle");
const summaryText = document.querySelector("#summaryText");
const riskBadge = document.querySelector("#riskBadge");
const fileCount = document.querySelector("#fileCount");
const additionCount = document.querySelector("#additionCount");
const deletionCount = document.querySelector("#deletionCount");
const evidenceCount = document.querySelector("#evidenceCount");
const findingCount = document.querySelector("#findingCount");
const overallScore = document.querySelector("#overallScore");
const overviewBox = document.querySelector("#overviewBox");
const coverageBox = document.querySelector("#coverageBox");
const filesBox = document.querySelector("#files");
const priorityFilesBox = document.querySelector("#priorityFiles");
const ruleFindingsBox = document.querySelector("#ruleFindings");
const modulesBox = document.querySelector("#modules");
const risksBox = document.querySelector("#risks");
const commentsBox = document.querySelector("#comments");
const limitationsBox = document.querySelector("#limitations");
const copySummaryBtn = document.querySelector("#copySummaryBtn");

let currentUser = null;
let lastSummary = "";
let progressTimer = null;

const sampleDiff = `diff --git a/src/auth.ts b/src/auth.ts
index 1111111..2222222 100644
--- a/src/auth.ts
+++ b/src/auth.ts
@@ -10,6 +10,12 @@ export function login(req, res) {
+  const userId = req.body.userId;
+  console.log("login user", userId);
+  if (req.body.redirect) {
+    document.body.innerHTML = req.body.redirect;
+  }
+  return issueToken(userId);
 }
diff --git a/src/payment.ts b/src/payment.ts
index 3333333..4444444 100644
--- a/src/payment.ts
+++ b/src/payment.ts
@@ -21,6 +21,9 @@ export async function charge(order) {
+  // TODO: handle duplicate callback
+  const amount = Number(order.amount);
+  await gateway.charge(amount);
 }`;

loginForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const payload = {
    username: document.querySelector("#loginUsername").value,
    password: document.querySelector("#loginPassword").value,
  };
  await authRequest("/api/login", payload);
});

registerForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const payload = {
    username: document.querySelector("#registerUsername").value,
    password: document.querySelector("#registerPassword").value,
    apiKey: document.querySelector("#registerApiKey").value,
    defaultModel: document.querySelector("#registerDefaultModel").value,
  };
  await authRequest("/api/register", payload);
});

logoutBtn.addEventListener("click", async () => {
  try {
    await apiFetch("/api/logout", {method: "POST"});
    localStorage.removeItem("reviewpilot_token");
    currentUser = null;
    renderAuthState();
  } catch (err) {
    showError(err.message);
  }
});

settingsBtn.addEventListener("click", () => {
  document.querySelector("#settingsApiKey").value = "";
  document.querySelector("#settingsDefaultModel").value = currentUser?.defaultModel || "qwen-plus";
  settingsDialog.showModal();
});

closeSettingsBtn.addEventListener("click", () => {
  settingsDialog.close();
});

messageCloseBtn.addEventListener("click", () => {
  messageDialog.close();
});

settingsForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  try {
    const payload = {
      apiKey: document.querySelector("#settingsApiKey").value,
      defaultModel: document.querySelector("#settingsDefaultModel").value,
    };
    const data = await apiFetch("/api/settings", {
      method: "PATCH",
      body: JSON.stringify(payload),
    });
    currentUser = data.user;
    applyDefaultModel(currentUser.defaultModel);
    settingsDialog.close();
    renderAuthState();
    showNotice("设置已保存", "新的 API Key 或默认模型将在下次评审时生效。");
  } catch (err) {
    showError(err.message);
  }
});

modelPreset.addEventListener("change", () => {
  customModelField.classList.toggle("hidden", modelPreset.value !== "custom");
});

sampleBtn.addEventListener("click", () => {
  diffInput.value = sampleDiff;
  prUrl.value = "";
});

reviewBtn.addEventListener("click", async () => {
  startProgress("正在评审", "正在解析 PR 链接和代码变更...");
  reviewBtn.disabled = true;
  try {
    updateProgress(35, "正在构建文件变更概览和重点上下文...");
    const data = await apiFetch("/api/review", {
      method: "POST",
      body: JSON.stringify({
        prUrl: prUrl.value.trim(),
        diff: diffInput.value,
        model: selectedModel(),
      }),
    });
    updateProgress(90, "正在整理评审报告...");
    renderReport(data);
    finishProgress("评审完成", "报告已生成，可以查看风险和复制 Review Comments。");
  } catch (err) {
    stopProgress();
    showError(err.message);
  } finally {
    reviewBtn.disabled = false;
  }
});

async function authRequest(path, payload) {
  try {
    const data = await rawFetch(path, {
      method: "POST",
      body: JSON.stringify(payload),
    });
    localStorage.setItem("reviewpilot_token", data.token);
    currentUser = data.user;
    applyDefaultModel(currentUser.defaultModel);
    renderAuthState();
    showNotice("登录成功", "已进入 ReviewPilot 工作台。");
  } catch (err) {
    showError(err.message);
  }
}

async function loadSession() {
  const token = localStorage.getItem("reviewpilot_token");
  if (!token) {
    renderAuthState();
    return;
  }
  try {
    currentUser = await apiFetch("/api/me");
    applyDefaultModel(currentUser.defaultModel);
  } catch {
    localStorage.removeItem("reviewpilot_token");
    currentUser = null;
  }
  renderAuthState();
}

function renderAuthState() {
  const loggedIn = Boolean(currentUser);
  authView.classList.toggle("hidden", loggedIn);
  appView.classList.toggle("hidden", !loggedIn);
  settingsBtn.classList.toggle("hidden", !loggedIn);
  logoutBtn.classList.toggle("hidden", !loggedIn);
  userLabel.classList.toggle("hidden", !loggedIn);
  userLabel.textContent = loggedIn ? `当前账号：${currentUser.username}` : "";
}

function selectedModel() {
  if (modelPreset.value === "custom") {
    return customModel.value.trim();
  }
  return modelPreset.value;
}

function applyDefaultModel(model) {
  const options = Array.from(modelPreset.options).map(option => option.value);
  if (options.includes(model)) {
    modelPreset.value = model;
    customModel.value = "";
  } else {
    modelPreset.value = "custom";
    customModel.value = model;
  }
  customModelField.classList.toggle("hidden", modelPreset.value !== "custom");
}

async function apiFetch(path, options = {}) {
  const token = localStorage.getItem("reviewpilot_token");
  return rawFetch(path, {
    ...options,
    headers: {
      ...(options.headers || {}),
      Authorization: `Bearer ${token}`,
    },
  });
}

async function rawFetch(path, options = {}) {
  let res;
  try {
    res = await fetch(path, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(options.headers || {}),
      },
    });
  } catch {
    throw new Error("无法连接本地服务，请确认已经运行 python server.py。");
  }

  const contentType = res.headers.get("Content-Type") || "";
  const text = await res.text();
  let data = {};
  if (text && contentType.includes("application/json")) {
    try {
      data = JSON.parse(text);
    } catch {
      throw new Error("服务返回的 JSON 格式不正确，请重启服务后重试。");
    }
  } else if (text && text.trim().startsWith("<!")) {
    throw new Error("服务返回了网页而不是接口数据。通常是后端服务没有重启，或当前页面仍连接到旧版本服务。请关闭旧服务后重新运行 python server.py。");
  } else if (text) {
    throw new Error(text.slice(0, 160));
  }

  if (!res.ok || data.error) {
    throw new Error(data.error || `请求失败，状态码 ${res.status}`);
  }
  return data;
}

function renderReport(data) {
  const fileChanges = data.file_changes || data.files || [];
  const risks = data.risks || data.findings || [];
  const modules = data.changed_modules || [];
  const comments = data.review_comments || [];
  const priorityFiles = data.risk_ranking || data.priority_files || [];
  const ruleFindings = data.rule_findings || [];
  const coverage = data.context_coverage || {};
  const overview = data.pr_overview || {};
  const additions = fileChanges.reduce((sum, file) => sum + Number(file.additions || 0), 0);
  const deletions = fileChanges.reduce((sum, file) => sum + Number(file.deletions || 0), 0);

  reportTitle.textContent = overview.title || data.pr.title || "评审报告";
  summaryText.textContent = data.summary || "模型没有返回摘要。";
  lastSummary = summaryText.textContent;
  riskBadge.textContent = data.riskLevel || "low";
  riskBadge.className = `badge ${data.riskLevel || "low"}`;
  fileCount.textContent = overview.changed_files ?? fileChanges.length;
  additionCount.textContent = overview.additions ?? additions;
  deletionCount.textContent = overview.deletions ?? deletions;
  evidenceCount.textContent = coverage.analyzed_files ?? 0;
  findingCount.textContent = risks.length;
  overallScore.textContent = data.overall_score ?? 0;
  overviewBox.innerHTML = renderOverview(overview, data.model);
  coverageBox.innerHTML = renderCoverage(coverage);
  filesBox.innerHTML = fileChanges.length ? fileChanges.map(renderFile).join("") : empty("暂无文件");
  priorityFilesBox.innerHTML = priorityFiles.length ? priorityFiles.map(renderPriorityFile).join("") : empty("暂无风险排序结果");
  ruleFindingsBox.innerHTML = ruleFindings.length ? ruleFindings.map(renderRuleFinding).join("") : empty("规则层未发现需要提示的问题");
  modulesBox.innerHTML = modules.length ? modules.map(renderModule).join("") : empty("暂无模块总结");
  risksBox.innerHTML = risks.length ? risks.map(renderRisk).join("") : empty("未发现有明确证据的风险");
  commentsBox.innerHTML = comments.length ? comments.map(renderComment).join("") : empty("暂无 Review 建议");
  limitationsBox.innerHTML = (data.limitations || []).length ? data.limitations.map(renderLimitation).join("") : empty("暂无额外限制说明");
}

function renderOverview(overview, model) {
  return `<article class="card">
    <p><strong>标题：</strong>${escapeHtml(overview.title || "粘贴 diff 分析")}</p>
    <p><strong>模型：</strong>${escapeHtml(model || "未返回")}</p>
    <p><strong>规模：</strong>${overview.changed_files || 0} 个文件，+${overview.additions || 0} / -${overview.deletions || 0}</p>
  </article>`;
}

function renderCoverage(coverage) {
  const total = Number(coverage.total_files || 0);
  const analyzed = Number(coverage.analyzed_files || 0);
  const percent = total ? Math.round((analyzed / total) * 100) : 0;
  const skipped = coverage.skipped_files || [];
  const skippedText = skipped.length ? skipped.slice(0, 6).join(", ") : "无";
  const suffix = skipped.length > 6 ? ` 等 ${skipped.length} 个文件` : "";
  return `<article class="card">
    <div class="coverage-bar"><span style="width:${percent}%"></span></div>
    <p><strong>覆盖率：</strong>${analyzed}/${total} 个文件进入重点上下文，${percent}%</p>
    <p><strong>策略：</strong>${escapeHtml(coverage.strategy || "按文件优先级选择重点上下文。")}</p>
    <p><strong>跳过文件：</strong>${escapeHtml(skippedText + suffix)}</p>
    <p><strong>是否筛选上下文：</strong>${coverage.context_truncated ? "是" : "否"}</p>
  </article>`;
}

function renderFile(file) {
  const status = statusText(file.status);
  const path = file.filename || file.path;
  return `<article class="card">
    <div class="card-title">
      <span>${escapeHtml(path)}</span>
      <span class="badge ${status.className}">${status.label}</span>
    </div>
    <div class="risk-meter"><span style="width:${Number(file.risk_score || file.priority || 0)}%"></span></div>
    <p>类型：${escapeHtml(file.category || "general")}；风险分 ${file.risk_score ?? file.priority ?? 0}；+${file.additions} / -${file.deletions}，${file.hunks || 0} 个 hunk</p>
    <p>${escapeHtml((file.risk_reasons || []).join("；") || "普通变更文件")}</p>
  </article>`;
}

function renderPriorityFile(file) {
  const score = Number(file.risk_score ?? file.priority ?? 0);
  const level = score >= 70 ? "high" : score >= 40 ? "medium" : "low";
  const reasons = file.risk_reasons || (file.reason ? [file.reason] : []);
  return `<article class="card compact-card">
    <div class="card-title">
      <span>${escapeHtml(file.filename)}</span>
      <span class="badge ${level}">${score}</span>
    </div>
    <div class="risk-meter"><span style="width:${score}%"></span></div>
    <p>${escapeHtml(reasons.join("；") || "普通变更文件")}</p>
  </article>`;
}

function renderRuleFinding(item) {
  return `<article class="card">
    <div class="card-title">
      <span>${escapeHtml(item.file || "全局规则")}</span>
      <span class="badge ${item.risk_level || "medium"}">${escapeHtml(typeText(item.type))}</span>
    </div>
    <p><strong>规则证据：</strong>${escapeHtml(item.evidence || "")}</p>
    <p><strong>提示：</strong>${escapeHtml(item.issue || "")}</p>
    <p><strong>原因：</strong>${escapeHtml(item.reason || "")}</p>
    <p><strong>建议：</strong>${escapeHtml(item.suggestion || "")}</p>
  </article>`;
}

function renderModule(item) {
  return `<article class="card">
    <div class="card-title">
      <span>${escapeHtml(item.name)}</span>
    </div>
    <p>${escapeHtml(item.summary || "无总结")}</p>
    <p><strong>文件：</strong>${escapeHtml((item.files || []).join(", "))}</p>
  </article>`;
}

function renderRisk(item) {
  return `<article class="card">
    <div class="card-title">
      <span>${escapeHtml(item.file)}</span>
      <span class="badge ${item.risk_level}">${item.risk_level}</span>
    </div>
    <p><strong>证据：</strong>${escapeHtml(item.evidence)}</p>
    <p><strong>问题：</strong>${escapeHtml(item.issue)}</p>
    <p><strong>原因：</strong>${escapeHtml(item.reason)}</p>
    <p><strong>建议：</strong>${escapeHtml(item.suggestion)}</p>
    <p><strong>置信度：</strong>${Math.round(item.confidence * 100)}%</p>
  </article>`;
}

function renderComment(item) {
  const file = item.file ? `<p><strong>文件：</strong>${escapeHtml(item.file)}</p>` : "";
  return `<article class="card">
    <div class="card-title">
      <span>${escapeHtml(typeText(item.type))}</span>
      <button class="copy-btn" type="button" data-copy="${escapeHtmlAttr(item.comment)}">复制</button>
    </div>
    ${file}
    <p>${escapeHtml(item.comment)}</p>
  </article>`;
}

function renderLimitation(item) {
  return `<article class="card compact-card"><p>${escapeHtml(item)}</p></article>`;
}

function statusText(status) {
  const map = {
    added: {label: "新增", className: "low"},
    modified: {label: "修改", className: "medium"},
    deleted: {label: "删除", className: "high"},
    renamed: {label: "重命名", className: "medium"},
  };
  return map[status] || {label: status || "修改", className: "medium"};
}

function typeText(type) {
  const map = {
    test: "测试建议",
    maintainability: "可维护性",
    question: "需要确认",
    needs_human_check: "需要人工复核",
    confirmed_issue: "明确问题",
    potential_risk: "潜在风险",
    praise: "正向反馈",
    follow_up: "后续建议",
  };
  return map[type] || "Review 建议";
}

function empty(text) {
  return `<div class="empty">${text}</div>`;
}

function showError(text) {
  messageTitle.textContent = "操作失败";
  messageText.textContent = text;
  messageDialog.showModal();
}

function showNotice(title, text) {
  messageTitle.textContent = title;
  messageText.textContent = text;
  messageDialog.showModal();
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function escapeHtmlAttr(value) {
  return escapeHtml(value).replaceAll("'", "&#39;");
}

document.addEventListener("click", async (event) => {
  const button = event.target.closest("[data-copy]");
  if (!button) return;
  try {
    await copyText(button.dataset.copy, "Review Comment 已复制。");
  } catch {
    showError("复制失败，请手动选择文本复制。");
  }
});

copySummaryBtn.addEventListener("click", async () => {
  if (!lastSummary) {
    showError("当前还没有可复制的摘要。");
    return;
  }
  await copyText(lastSummary, "摘要已复制");
});

async function copyText(text, successText) {
  try {
    await navigator.clipboard.writeText(text);
    showNotice("复制成功", successText);
  } catch {
    showError("复制失败，请手动选择文本复制。");
  }
}

function startProgress(title, text) {
  operationStatus.classList.remove("hidden");
  operationTitle.textContent = title;
  operationText.textContent = text;
  progressBar.style.width = "12%";
  clearInterval(progressTimer);
  let value = 12;
  progressTimer = setInterval(() => {
    value = Math.min(82, value + 6);
    progressBar.style.width = `${value}%`;
  }, 500);
}

function updateProgress(value, text) {
  operationText.textContent = text;
  progressBar.style.width = `${value}%`;
}

function finishProgress(title, text) {
  clearInterval(progressTimer);
  operationTitle.textContent = title;
  operationText.textContent = text;
  progressBar.style.width = "100%";
  setTimeout(() => {
    operationStatus.classList.add("hidden");
    progressBar.style.width = "0";
  }, 1800);
}

function stopProgress() {
  clearInterval(progressTimer);
  operationStatus.classList.add("hidden");
  progressBar.style.width = "0";
}

loadSession();
