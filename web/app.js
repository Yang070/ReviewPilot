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
const statusBox = document.querySelector("#status");
const messageDialog = document.querySelector("#messageDialog");
const messageTitle = document.querySelector("#messageTitle");
const messageText = document.querySelector("#messageText");
const messageCloseBtn = document.querySelector("#messageCloseBtn");

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
const evidenceCount = document.querySelector("#evidenceCount");
const findingCount = document.querySelector("#findingCount");
const filesBox = document.querySelector("#files");
const findingsBox = document.querySelector("#findings");
const testsBox = document.querySelector("#tests");

let currentUser = null;

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
    setStatus("设置已保存");
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
  setStatus("评审中...");
  reviewBtn.disabled = true;
  try {
    const data = await apiFetch("/api/review", {
      method: "POST",
      body: JSON.stringify({
        prUrl: prUrl.value.trim(),
        diff: diffInput.value,
        model: selectedModel(),
      }),
    });
    renderReport(data);
    setStatus("完成");
  } catch (err) {
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
    setStatus("已登录");
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
  reportTitle.textContent = data.pr.title || "评审报告";
  summaryText.textContent = data.summary || "模型没有返回摘要。";
  riskBadge.textContent = data.riskLevel || "low";
  riskBadge.className = `badge ${data.riskLevel || "low"}`;
  fileCount.textContent = data.files.length;
  evidenceCount.textContent = data.evidenceCount;
  findingCount.textContent = data.findings.length;
  filesBox.innerHTML = data.files.length ? data.files.map(renderFile).join("") : empty("暂无文件");
  findingsBox.innerHTML = data.findings.length ? data.findings.map(renderFinding).join("") : empty("暂无发现");
  testsBox.innerHTML = data.testSuggestions.map(item => `<li>${escapeHtml(item)}</li>`).join("");
}

function renderFile(file) {
  return `<article class="card">
    <div class="card-title">
      <span>${escapeHtml(file.path)}</span>
      <span class="badge low">${file.category}</span>
    </div>
    <p>+${file.additions} / -${file.deletions}, ${file.hunks} 个 hunk</p>
  </article>`;
}

function renderFinding(item) {
  const line = item.line ? `:${item.line}` : "";
  return `<article class="card">
    <div class="card-title">
      <span>${escapeHtml(item.file)}${line}</span>
      <span class="badge ${item.severity}">${item.severity}</span>
    </div>
    <p><strong>证据：</strong>${escapeHtml(item.evidence)}</p>
    <p><strong>原因：</strong>${escapeHtml(item.message)}</p>
    <p><strong>建议：</strong>${escapeHtml(item.suggestion)}</p>
    <p><strong>置信度：</strong>${Math.round(item.confidence * 100)}%</p>
  </article>`;
}

function empty(text) {
  return `<div class="empty">${text}</div>`;
}

function setStatus(text) {
  statusBox.textContent = text;
}

function showError(text) {
  setStatus("出现错误");
  messageTitle.textContent = "操作失败";
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

loadSession();
