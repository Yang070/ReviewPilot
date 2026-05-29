const views = {
  "/login": document.querySelector("#loginView"),
  "/register": document.querySelector("#registerView"),
  "/review": document.querySelector("#reviewView"),
  "/history": document.querySelector("#historyView"),
  "/settings/models": document.querySelector("#modelsView"),
};

const loginForm = document.querySelector("#loginForm");
const registerForm = document.querySelector("#registerForm");
const logoutBtn = document.querySelector("#logoutBtn");
const userLabel = document.querySelector("#userLabel");
const userMenu = document.querySelector("#userMenu");
const menuBtn = document.querySelector("#menuBtn");
const menuList = document.querySelector("#menuList");
const brandBtn = document.querySelector("#brandBtn");
const messageDialog = document.querySelector("#messageDialog");
const messageTitle = document.querySelector("#messageTitle");
const messageText = document.querySelector("#messageText");
const messageCloseBtn = document.querySelector("#messageCloseBtn");

const prUrl = document.querySelector("#prUrl");
const diffInput = document.querySelector("#diffInput");
const patchFile = document.querySelector("#patchFile");
const reviewBtn = document.querySelector("#reviewBtn");
const sampleBtn = document.querySelector("#sampleBtn");
const modelConfigSelect = document.querySelector("#modelConfigSelect");
const analysisMode = document.querySelector("#analysisMode");
const modelMissingHint = document.querySelector("#modelMissingHint");
const currentModelName = document.querySelector("#currentModelName");
const currentModelMeta = document.querySelector("#currentModelMeta");
const currentApiMask = document.querySelector("#currentApiMask");
const currentProviderName = document.querySelector("#currentProviderName");
const currentBaseUrl = document.querySelector("#currentBaseUrl");
const quickModelForm = document.querySelector("#quickModelForm");
const quickProvider = document.querySelector("#quickProvider");
const quickBaseUrl = document.querySelector("#quickBaseUrl");
const quickApiKey = document.querySelector("#quickApiKey");
const quickModelName = document.querySelector("#quickModelName");
const quickTestModelBtn = document.querySelector("#quickTestModelBtn");

const emptyReport = document.querySelector("#emptyReport");
const reportContent = document.querySelector("#reportContent");
const operationStatus = document.querySelector("#operationStatus");
const operationTitle = document.querySelector("#operationTitle");
const operationText = document.querySelector("#operationText");
const progressBar = document.querySelector("#progressBar");
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
const exportMarkdownBtn = document.querySelector("#exportMarkdownBtn");

const modelForm = document.querySelector("#modelForm");
const modelFormTitle = document.querySelector("#modelFormTitle");
const editingConfigId = document.querySelector("#editingConfigId");
const modelProvider = document.querySelector("#modelProvider");
const modelBaseUrl = document.querySelector("#modelBaseUrl");
const modelApiKey = document.querySelector("#modelApiKey");
const modelName = document.querySelector("#modelName");
const modelDefault = document.querySelector("#modelDefault");
const modelConfigList = document.querySelector("#modelConfigList");
const testModelBtn = document.querySelector("#testModelBtn");
const resetModelFormBtn = document.querySelector("#resetModelFormBtn");
const historyList = document.querySelector("#historyList");

let currentUser = null;
let modelConfigs = [];
let providers = [];
let lastSummary = "";
let lastReport = null;
let progressTimer = null;
let activeInputTab = "url";

const providerDefaults = {
  OpenAI: "https://api.openai.com/v1",
  Qwen: "https://dashscope.aliyuncs.com/compatible-mode/v1",
  DeepSeek: "https://api.deepseek.com",
  Claude: "https://api.anthropic.com/v1",
  "Custom OpenAI-Compatible": "",
};

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

document.addEventListener("click", (event) => {
  const routeButton = event.target.closest("[data-route]");
  if (routeButton) {
    navigate(routeButton.dataset.route);
    menuList.classList.add("hidden");
  }
});

document.addEventListener("click", async (event) => {
  const copyButton = event.target.closest("[data-copy]");
  if (copyButton) await copyText(copyButton.dataset.copy, "Review Comment 已复制。");
});

brandBtn.addEventListener("click", () => navigate(currentUser ? "/review" : "/login"));
menuBtn.addEventListener("click", () => menuList.classList.toggle("hidden"));
messageCloseBtn.addEventListener("click", () => messageDialog.close());

loginForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  await authRequest("/api/login", {
    username: document.querySelector("#loginUsername").value,
    password: document.querySelector("#loginPassword").value,
  });
});

registerForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  await authRequest("/api/register", {
    username: document.querySelector("#registerUsername").value,
    email: document.querySelector("#registerEmail").value,
    password: document.querySelector("#registerPassword").value,
    confirmPassword: document.querySelector("#registerConfirmPassword").value,
  });
});

logoutBtn.addEventListener("click", async () => {
  try {
    await apiFetch("/api/logout", {method: "POST"});
  } finally {
    localStorage.removeItem("reviewpilot_token");
    currentUser = null;
    modelConfigs = [];
    renderAuthState();
    navigate("/login");
  }
});

document.querySelectorAll("[data-input-tab]").forEach(button => {
  button.addEventListener("click", () => setInputTab(button.dataset.inputTab));
});

patchFile.addEventListener("change", async () => {
  const file = patchFile.files[0];
  if (!file) return;
  diffInput.value = await file.text();
  setInputTab("file");
  showNotice("文件已读取", "diff 内容已载入，可以开始评审。");
});

sampleBtn.addEventListener("click", () => {
  diffInput.value = sampleDiff;
  prUrl.value = "";
  setInputTab("diff");
});

reviewBtn.addEventListener("click", async () => {
  if (!modelConfigs.length) {
    showError("当前账号还没有模型配置，请先进入模型设置中心添加。");
    navigate("/settings/models");
    return;
  }
  startProgress("正在评审", "正在解析输入和构建风险感知上下文...");
  reviewBtn.disabled = true;
  try {
    const payload = await buildReviewPayload();
    updateProgress(42, "正在执行规则检测和文件风险排序...");
    const data = await apiFetch("/api/review", {method: "POST", body: JSON.stringify(payload)});
    updateProgress(90, "正在整理评审报告和保存历史记录...");
    renderReport(data);
    finishProgress("评审完成", "报告已生成，并已保存到历史记录。");
  } catch (err) {
    stopProgress();
    showError(`${err.message} 如模型调用失败，请切换模型配置，或检查 API Key、Provider 和模型名称。`);
  } finally {
    reviewBtn.disabled = false;
  }
});

modelProvider.addEventListener("change", () => {
  if (!modelBaseUrl.value || Object.values(providerDefaults).includes(modelBaseUrl.value)) {
    modelBaseUrl.value = providerDefaults[modelProvider.value] || "";
  }
});

modelForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const payload = readModelForm();
  const id = editingConfigId.value;
  try {
    if (id) {
      await apiFetch(`/api/model-configs/${id}`, {method: "PATCH", body: JSON.stringify(payload)});
    } else {
      await apiFetch("/api/model-configs", {method: "POST", body: JSON.stringify(payload)});
    }
    resetModelForm();
    await loadModelConfigs();
    showNotice("保存成功", "模型配置已更新。");
  } catch (err) {
    showError(err.message);
  }
});

testModelBtn.addEventListener("click", async () => {
  try {
    const id = editingConfigId.value;
    const payload = id && !modelApiKey.value.trim() ? {configId: id} : readModelForm();
    const data = await apiFetch("/api/model-configs/test", {method: "POST", body: JSON.stringify(payload)});
    showNotice("连接测试", data.message || "连接测试成功。");
  } catch (err) {
    showError(err.message);
  }
});

resetModelFormBtn.addEventListener("click", resetModelForm);
copySummaryBtn.addEventListener("click", async () => copyText(lastSummary, "摘要已复制。"));
exportMarkdownBtn.addEventListener("click", async () => copyText(buildMarkdownReport(lastReport), "Markdown 报告已复制。"));

quickProvider.addEventListener("change", () => {
  if (!quickBaseUrl.value || Object.values(providerDefaults).includes(quickBaseUrl.value)) {
    quickBaseUrl.value = providerDefaults[quickProvider.value] || "";
  }
});

quickModelForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  try {
    await apiFetch("/api/model-configs", {
      method: "POST",
      body: JSON.stringify(readQuickModelForm(true)),
    });
    clearQuickModelForm();
    await loadModelConfigs();
    showNotice("保存成功", "API 和模型名称已保存到模型配置，可以直接开始评审。");
  } catch (err) {
    showError(err.message);
  }
});

quickTestModelBtn.addEventListener("click", async () => {
  try {
    const data = await apiFetch("/api/model-configs/test", {
      method: "POST",
      body: JSON.stringify(readQuickModelForm(false)),
    });
    showNotice("连接测试", data.message || "连接测试成功。");
  } catch (err) {
    showError(err.message);
  }
});

window.addEventListener("popstate", () => route());

async function authRequest(path, payload) {
  try {
    const data = await rawFetch(path, {method: "POST", body: JSON.stringify(payload)});
    localStorage.setItem("reviewpilot_token", data.token);
    currentUser = data.user;
    renderAuthState();
    await loadModelConfigs();
    navigate("/review");
    if (!currentUser.hasModelConfigs) {
      showNotice("需要配置模型", "请在工作台顶部输入 API Key 和模型名称，保存后即可开始评审。");
    }
  } catch (err) {
    showError(err.message);
  }
}

async function loadSession() {
  const token = localStorage.getItem("reviewpilot_token");
  if (!token) {
    currentUser = null;
    renderAuthState();
    route();
    return;
  }
  try {
    currentUser = await apiFetch("/api/me");
    renderAuthState();
    await loadProviders();
    await loadModelConfigs();
  } catch {
    localStorage.removeItem("reviewpilot_token");
    currentUser = null;
    renderAuthState();
  }
  route();
}

async function loadProviders() {
  const data = await rawFetch("/api/providers");
  providers = data.providers || [];
  const options = providers.map(item => `<option value="${escapeHtmlAttr(item)}">${escapeHtml(item)}</option>`).join("");
  modelProvider.innerHTML = options;
  quickProvider.innerHTML = options;
  modelProvider.value = "Qwen";
  quickProvider.value = "Qwen";
  modelBaseUrl.value = providerDefaults.Qwen;
  quickBaseUrl.value = providerDefaults.Qwen;
  quickModelName.value = "qwen-plus";
}

async function loadModelConfigs() {
  if (!currentUser) return;
  const data = await apiFetch("/api/model-configs");
  modelConfigs = data.configs || [];
  currentUser.hasModelConfigs = modelConfigs.length > 0;
  renderModelSelect();
  renderModelConfigList();
  renderWorkbenchStatus();
}

function renderAuthState() {
  const loggedIn = Boolean(currentUser);
  userMenu.classList.toggle("hidden", !loggedIn);
  userLabel.classList.toggle("hidden", !loggedIn);
  userLabel.textContent = loggedIn ? `当前账号：${currentUser.username}` : "";
}

function navigate(path) {
  if (location.pathname !== path) history.pushState({}, "", path);
  route();
}

async function route() {
  const path = views[location.pathname] ? location.pathname : (currentUser ? "/review" : "/login");
  if (!currentUser && path !== "/login" && path !== "/register") {
    showView("/login");
    return;
  }
  showView(path);
  if (path === "/settings/models") {
    await loadProviders();
    await loadModelConfigs();
  }
  if (path === "/history") await loadHistory();
  if (path === "/review") await loadModelConfigs();
}

function showView(path) {
  Object.entries(views).forEach(([key, view]) => view.classList.toggle("hidden", key !== path));
}

function setInputTab(tab) {
  activeInputTab = tab;
  document.querySelectorAll("[data-input-tab]").forEach(button => {
    button.classList.toggle("active", button.dataset.inputTab === tab);
  });
  document.querySelector("#urlInputPane").classList.toggle("hidden", tab !== "url");
  document.querySelector("#diffInputPane").classList.toggle("hidden", tab !== "diff");
  document.querySelector("#fileInputPane").classList.toggle("hidden", tab !== "file");
}

async function buildReviewPayload() {
  let diff = diffInput.value;
  if (activeInputTab === "file" && patchFile.files[0]) diff = await patchFile.files[0].text();
  return {
    prUrl: activeInputTab === "url" ? prUrl.value.trim() : "",
    diff: activeInputTab === "url" ? "" : diff,
    modelConfigId: modelConfigSelect.value,
    analysisMode: analysisMode.value,
  };
}

function renderModelSelect() {
  modelMissingHint.classList.toggle("hidden", modelConfigs.length > 0);
  reviewBtn.disabled = modelConfigs.length === 0;
  modelConfigSelect.innerHTML = modelConfigs.length
    ? modelConfigs.map(item => `<option value="${item.id}">${escapeHtml(item.display_name)}${item.is_default ? "（默认）" : ""}</option>`).join("")
    : `<option value="">请先添加模型配置</option>`;
  const defaultConfig = modelConfigs.find(item => item.is_default);
  if (defaultConfig) modelConfigSelect.value = defaultConfig.id;
  renderWorkbenchStatus();
}

function renderWorkbenchStatus() {
  const selected = modelConfigs.find(item => item.id === modelConfigSelect.value)
    || modelConfigs.find(item => item.is_default)
    || modelConfigs[0];
  if (!selected) {
    currentModelName.textContent = "未配置";
    currentModelMeta.textContent = "请在下方输入 API Key 和模型名称，或进入完整模型设置。";
    currentApiMask.textContent = "未保存";
    currentProviderName.textContent = "未配置";
    currentBaseUrl.textContent = "添加配置后会显示 Provider 和接口地址。";
    return;
  }
  currentModelName.textContent = selected.model_name;
  currentModelMeta.textContent = selected.is_default ? "默认模型配置" : "本次可选模型配置";
  currentApiMask.textContent = selected.api_key_mask || "已保存";
  currentProviderName.textContent = selected.provider;
  currentBaseUrl.textContent = selected.base_url || "未填写 base_url";
}

modelConfigSelect.addEventListener("change", renderWorkbenchStatus);

function renderModelConfigList() {
  if (!modelConfigList) return;
  if (!modelConfigs.length) {
    modelConfigList.innerHTML = empty("暂无模型配置。添加后才能开始 Review。");
    return;
  }
  modelConfigList.innerHTML = modelConfigs.map(item => `<article class="card">
    <div class="card-title">
      <span>${escapeHtml(item.display_name)}</span>
      <span class="badge ${item.is_default ? "low" : "medium"}">${item.is_default ? "默认" : "可用"}</span>
    </div>
    <p><strong>Provider：</strong>${escapeHtml(item.provider)}</p>
    <p><strong>Base URL：</strong>${escapeHtml(item.base_url)}</p>
    <p><strong>API Key：</strong>${escapeHtml(item.api_key_mask)}</p>
    <div class="inline-actions">
      <button type="button" data-edit-model="${item.id}">编辑</button>
      <button type="button" data-default-model="${item.id}">设为默认</button>
      <button type="button" data-delete-model="${item.id}">删除</button>
    </div>
  </article>`).join("");
}

modelConfigList.addEventListener("click", async (event) => {
  const editId = event.target.closest("[data-edit-model]")?.dataset.editModel;
  const defaultId = event.target.closest("[data-default-model]")?.dataset.defaultModel;
  const deleteId = event.target.closest("[data-delete-model]")?.dataset.deleteModel;
  try {
    if (editId) editModelConfig(editId);
    if (defaultId) {
      await apiFetch(`/api/model-configs/${defaultId}/default`, {method: "POST"});
      await loadModelConfigs();
    }
    if (deleteId && confirm("确定删除这个模型配置吗？")) {
      await apiFetch(`/api/model-configs/${deleteId}`, {method: "DELETE"});
      await loadModelConfigs();
    }
  } catch (err) {
    showError(err.message);
  }
});

function editModelConfig(id) {
  const item = modelConfigs.find(config => config.id === id);
  if (!item) return;
  editingConfigId.value = item.id;
  modelFormTitle.textContent = "编辑模型配置";
  modelProvider.value = item.provider;
  modelBaseUrl.value = item.base_url;
  modelApiKey.value = "";
  modelName.value = item.model_name;
  modelDefault.checked = item.is_default;
}

function resetModelForm() {
  editingConfigId.value = "";
  modelFormTitle.textContent = "添加模型配置";
  modelProvider.value = "Qwen";
  modelBaseUrl.value = providerDefaults.Qwen;
  modelApiKey.value = "";
  modelName.value = "qwen-plus";
  modelDefault.checked = modelConfigs.length === 0;
}

function readModelForm() {
  return {
    provider: modelProvider.value,
    base_url: modelBaseUrl.value,
    api_key: modelApiKey.value,
    model_name: modelName.value,
    is_default: modelDefault.checked,
  };
}

function readQuickModelForm(isDefault) {
  return {
    provider: quickProvider.value,
    base_url: quickBaseUrl.value,
    api_key: quickApiKey.value,
    model_name: quickModelName.value,
    is_default: isDefault || modelConfigs.length === 0,
  };
}

function clearQuickModelForm() {
  quickApiKey.value = "";
  quickModelName.value = "qwen-plus";
}

async function loadHistory() {
  const data = await apiFetch("/api/history");
  const items = data.items || [];
  historyList.innerHTML = items.length ? items.map(renderHistoryItem).join("") : empty("暂无历史记录。完成一次 Review 后会自动保存。");
}

function renderHistoryItem(item) {
  return `<article class="card">
    <div class="card-title">
      <span>${escapeHtml(item.prTitle || "粘贴 diff 分析")}</span>
      <span class="badge ${item.overallRisk}">${item.overallRisk}</span>
    </div>
    <p><strong>PR：</strong>${escapeHtml(item.prUrl || "粘贴 diff")}</p>
    <p><strong>模型：</strong>${escapeHtml(item.model)}；风险数：${item.riskCount}；时间：${formatTime(item.analyzedAt)}</p>
    <div class="inline-actions">
      <button type="button" data-open-history="${item.id}">查看报告</button>
      <button type="button" data-delete-history="${item.id}">删除</button>
    </div>
  </article>`;
}

historyList.addEventListener("click", async (event) => {
  const openId = event.target.closest("[data-open-history]")?.dataset.openHistory;
  const deleteId = event.target.closest("[data-delete-history]")?.dataset.deleteHistory;
  try {
    if (openId) {
      const item = await apiFetch(`/api/history/${openId}`);
      navigate("/review");
      renderReport(item.report);
    }
    if (deleteId && confirm("确定删除这条历史记录吗？")) {
      await apiFetch(`/api/history/${deleteId}`, {method: "DELETE"});
      await loadHistory();
    }
  } catch (err) {
    showError(err.message);
  }
});

function renderReport(data) {
  lastReport = data;
  emptyReport.classList.add("hidden");
  reportContent.classList.remove("hidden");
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

  reportTitle.textContent = overview.title || data.pr?.title || "评审报告";
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
    <p><strong>覆盖率：</strong>${analyzed}/${total} 个文件进入深度上下文，${percent}%</p>
    <p><strong>策略：</strong>${escapeHtml(coverage.strategy || "按文件风险分选择重点上下文。")}</p>
    <p><strong>跳过文件：</strong>${escapeHtml(skippedText + suffix)}</p>
    <p><strong>是否筛选上下文：</strong>${coverage.context_truncated ? "是" : "否"}</p>
  </article>`;
}

function renderFile(file) {
  const status = statusText(file.status);
  const score = Number(file.risk_score || file.priority || 0);
  const path = file.filename || file.path;
  return `<article class="card">
    <div class="card-title">
      <span>${escapeHtml(path)}</span>
      <span class="badge ${status.className}">${status.label}</span>
    </div>
    <div class="risk-meter"><span style="width:${score}%"></span></div>
    <p>类型：${escapeHtml(file.category || "general")}；风险分 ${score}；+${file.additions} / -${file.deletions}，${file.hunks || 0} 个 hunk</p>
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
    <div class="card-title"><span>${escapeHtml(item.name)}</span></div>
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
    <p><strong>类型：</strong>${escapeHtml(typeText(item.type))}</p>
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

function buildMarkdownReport(data) {
  if (!data) return "暂无报告";
  const risks = data.risks || [];
  const comments = data.review_comments || [];
  return [
    `# ${data.pr_overview?.title || "ReviewPilot 报告"}`,
    "",
    `## Summary`,
    data.summary || "",
    "",
    `## Risks`,
    risks.length ? risks.map(item => `- [${item.risk_level}] ${item.file}: ${item.issue}`).join("\n") : "- 未发现明确风险",
    "",
    `## Review Comments`,
    comments.length ? comments.map(item => `- ${item.file ? item.file + ": " : ""}${item.comment}`).join("\n") : "- 暂无建议",
  ].join("\n");
}

async function apiFetch(path, options = {}) {
  const token = localStorage.getItem("reviewpilot_token");
  return rawFetch(path, {
    ...options,
    headers: {...(options.headers || {}), Authorization: `Bearer ${token}`},
  });
}

async function rawFetch(path, options = {}) {
  let res;
  try {
    res = await fetch(path, {
      ...options,
      headers: {"Content-Type": "application/json", ...(options.headers || {})},
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
    throw new Error("服务返回了网页而不是接口数据。通常是后端服务没有重启，或当前页面仍连接到旧版本服务。");
  } else if (text) {
    throw new Error(text.slice(0, 160));
  }
  if (!res.ok || data.error) throw new Error(data.error || `请求失败，状态码 ${res.status}`);
  return data;
}

function startProgress(title, text) {
  reportContent.classList.remove("hidden");
  emptyReport.classList.add("hidden");
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
  setTimeout(() => operationStatus.classList.add("hidden"), 1800);
}

function stopProgress() {
  clearInterval(progressTimer);
  operationStatus.classList.add("hidden");
  progressBar.style.width = "0";
}

async function copyText(text, successText) {
  if (!text) {
    showError("当前没有可复制的内容。");
    return;
  }
  try {
    await navigator.clipboard.writeText(text);
    showNotice("复制成功", successText);
  } catch {
    showError("复制失败，请手动选择文本复制。");
  }
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

function formatTime(value) {
  return value ? new Date(value * 1000).toLocaleString("zh-CN") : "未知";
}

function empty(text) {
  return `<div class="empty">${text}</div>`;
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function escapeHtmlAttr(value) {
  return escapeHtml(value).replaceAll("'", "&#39;");
}

loadProviders().then(loadSession);
