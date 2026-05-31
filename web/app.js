const views = {
  "/login": document.querySelector("#loginView"),
  "/register": document.querySelector("#registerView"),
  "/review": document.querySelector("#reviewView"),
  "/history": document.querySelector("#historyView"),
  "/settings/models": document.querySelector("#modelsView"),
  "/settings/rules": document.querySelector("#rulesView"),
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
const auditModelGrid = document.querySelector("#auditModelGrid");
const reviewerModelSelect = document.querySelector("#reviewerModelSelect");
const auditorModelSelect = document.querySelector("#auditorModelSelect");
const sameModelHint = document.querySelector("#sameModelHint");
const enabledRuleCount = document.querySelector("#enabledRuleCount");
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
const reportTabs = document.querySelector("#reportTabs");
const reviewerResultBox = document.querySelector("#reviewerResultBox");
const auditorResultBox = document.querySelector("#auditorResultBox");
const finalResultBox = document.querySelector("#finalResultBox");

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
const historyDetail = document.querySelector("#historyDetail");
const historyDetailTitle = document.querySelector("#historyDetailTitle");
const historyDetailMeta = document.querySelector("#historyDetailMeta");
const historyDetailSummary = document.querySelector("#historyDetailSummary");
const historyMarkdownPreview = document.querySelector("#historyMarkdownPreview");
const historyDownloadBtn = document.querySelector("#historyDownloadBtn");
const historyCloseBtn = document.querySelector("#historyCloseBtn");
const reviewAskPanel = document.querySelector("#reviewAskPanel");
const reviewAskModelSelect = document.querySelector("#reviewAskModelSelect");
const reviewAskSuggestions = document.querySelector("#reviewAskSuggestions");
const reviewAskQuestion = document.querySelector("#reviewAskQuestion");
const reviewAskSendBtn = document.querySelector("#reviewAskSendBtn");
const reviewAskThreads = document.querySelector("#reviewAskThreads");
const historyAskPanel = document.querySelector("#historyAskPanel");
const historyAskModelSelect = document.querySelector("#historyAskModelSelect");
const historyAskSuggestions = document.querySelector("#historyAskSuggestions");
const historyAskQuestion = document.querySelector("#historyAskQuestion");
const historyAskSendBtn = document.querySelector("#historyAskSendBtn");
const historyAskThreads = document.querySelector("#historyAskThreads");
const ruleForm = document.querySelector("#ruleForm");
const ruleFormTitle = document.querySelector("#ruleFormTitle");
const editingRuleId = document.querySelector("#editingRuleId");
const ruleName = document.querySelector("#ruleName");
const ruleDescription = document.querySelector("#ruleDescription");
const ruleCategory = document.querySelector("#ruleCategory");
const ruleLanguage = document.querySelector("#ruleLanguage");
const ruleFilePatterns = document.querySelector("#ruleFilePatterns");
const ruleIncludeKeywords = document.querySelector("#ruleIncludeKeywords");
const ruleExcludeKeywords = document.querySelector("#ruleExcludeKeywords");
const ruleSeverity = document.querySelector("#ruleSeverity");
const ruleMessage = document.querySelector("#ruleMessage");
const ruleSuggestion = document.querySelector("#ruleSuggestion");
const ruleEnabled = document.querySelector("#ruleEnabled");
const resetRuleFormBtn = document.querySelector("#resetRuleFormBtn");
const loadTemplatesBtn = document.querySelector("#loadTemplatesBtn");
const ruleTemplateList = document.querySelector("#ruleTemplateList");
const ruleList = document.querySelector("#ruleList");

let currentUser = null;
let modelConfigs = [];
let providers = [];
let reviewRules = [];
let ruleTemplates = [];
let lastSummary = "";
let lastReport = null;
let selectedHistoryReport = null;
let selectedHistoryId = "";
let reviewAskThreadsState = [];
let historyAskThreadsState = [];
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

const askSuggestions = [
  "\u8fd9\u4e2a PR \u6700\u9700\u8981\u4eba\u5de5\u590d\u6838\u54ea\u91cc\uff1f",
  "\u6709\u6ca1\u6709\u6d4b\u8bd5\u8986\u76d6\u4e0d\u8db3\uff1f",
  "\u54ea\u4e9b\u98ce\u9669\u662f\u6a21\u578b\u4e0d\u786e\u5b9a\u7684\uff1f",
  "\u89c4\u5219\u9884\u68c0\u547d\u4e2d\u7684\u95ee\u9898\u6709\u6ca1\u6709\u88ab AI \u91c7\u7eb3\uff1f",
  "\u5ba1\u8ba1\u6a21\u578b\u4e3a\u4ec0\u4e48\u964d\u7ea7\u67d0\u4e9b\u98ce\u9669\uff1f",
  "\u5e2e\u6211\u751f\u6210\u4e00\u6bb5\u7b80\u77ed\u7684 PR Review \u603b\u7ed3\u3002",
];

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

document.addEventListener("click", (event) => {
  const askSuggestion = event.target.closest("[data-ask-suggestion]");
  if (askSuggestion) fillAskQuestion(askSuggestion.dataset.askScope, askSuggestion.dataset.askSuggestion);
  const riskAsk = event.target.closest("[data-risk-ask]");
  if (riskAsk) fillAskQuestion("review", "\u8bf7\u8fdb\u4e00\u6b65\u89e3\u91ca\u8fd9\u4e2a\u98ce\u9669\u4e3a\u4ec0\u4e48\u6210\u7acb\uff0c\u4ee5\u53ca\u5e94\u8be5\u5982\u4f55\u4fee\u6539\uff1f");
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

analysisMode.addEventListener("change", renderAuditModeControls);
reviewerModelSelect.addEventListener("change", renderAuditModeControls);
auditorModelSelect.addEventListener("change", renderAuditModeControls);

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
    const endpoint = analysisMode.value === "deep-audit" ? "/api/review/deep-audit" : "/api/review";
    const data = await apiFetch(endpoint, {method: "POST", body: JSON.stringify(payload)});
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
exportMarkdownBtn.addEventListener("click", () => downloadMarkdownReport(lastReport));

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

historyDownloadBtn.addEventListener("click", () => downloadMarkdownReport(selectedHistoryReport));
historyCloseBtn.addEventListener("click", () => {
  selectedHistoryReport = null;
  selectedHistoryId = "";
  historyDetail.classList.add("hidden");
});
reviewAskSendBtn.addEventListener("click", () => sendAsk("review"));
historyAskSendBtn.addEventListener("click", () => sendAsk("history"));

reportTabs.addEventListener("click", (event) => {
  const button = event.target.closest("[data-report-tab]");
  if (!button) return;
  setReportTab(button.dataset.reportTab);
});

ruleForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const id = editingRuleId.value;
  try {
    const payload = readRuleForm();
    if (id) {
      await apiFetch(`/api/rules/${id}`, {method: "PATCH", body: JSON.stringify(payload)});
    } else {
      await apiFetch("/api/rules", {method: "POST", body: JSON.stringify(payload)});
    }
    resetRuleForm();
    await loadRules();
    showNotice("保存成功", "规则已更新。");
  } catch (err) {
    showError(err.message);
  }
});

resetRuleFormBtn.addEventListener("click", resetRuleForm);
loadTemplatesBtn.addEventListener("click", async () => {
  ruleTemplateList.classList.toggle("hidden");
  if (!ruleTemplateList.classList.contains("hidden")) await loadRuleTemplates();
});

ruleList.addEventListener("click", async (event) => {
  const editId = event.target.closest("[data-edit-rule]")?.dataset.editRule;
  const toggleId = event.target.closest("[data-toggle-rule]")?.dataset.toggleRule;
  const deleteId = event.target.closest("[data-delete-rule]")?.dataset.deleteRule;
  try {
    if (editId) editRule(editId);
    if (toggleId) {
      const rule = reviewRules.find(item => item.id === toggleId);
      await apiFetch(`/api/rules/${toggleId}`, {method: "PATCH", body: JSON.stringify({enabled: !rule.enabled})});
      await loadRules();
    }
    if (deleteId && confirm("确定删除这条规则吗？")) {
      await apiFetch(`/api/rules/${deleteId}`, {method: "DELETE"});
      await loadRules();
    }
  } catch (err) {
    showError(err.message);
  }
});

ruleTemplateList.addEventListener("click", async (event) => {
  const templateId = event.target.closest("[data-copy-template]")?.dataset.copyTemplate;
  if (!templateId) return;
  try {
    await apiFetch("/api/rules/copy-template", {method: "POST", body: JSON.stringify({template_id: templateId})});
    await loadRules();
    showNotice("复制成功", "规则模板已复制到当前规则列表。");
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
    await loadRules();
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
  if (path === "/settings/rules") await loadRules();
  if (path === "/history") await loadHistory();
  if (path === "/review") {
    await loadModelConfigs();
    await loadRules();
  }
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
  if (analysisMode.value === "deep-audit") {
    return {
      pr_url: activeInputTab === "url" ? prUrl.value.trim() : "",
      diff_text: activeInputTab === "url" ? "" : diff,
      reviewer_model_config_id: reviewerModelSelect.value,
      auditor_model_config_id: auditorModelSelect.value,
      rule_set_id: "default",
      analysis_mode: "deep_audit",
    };
  }
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
  reviewerModelSelect.innerHTML = modelConfigSelect.innerHTML;
  auditorModelSelect.innerHTML = modelConfigSelect.innerHTML;
  reviewAskModelSelect.innerHTML = modelConfigSelect.innerHTML;
  historyAskModelSelect.innerHTML = modelConfigSelect.innerHTML;
  const defaultConfig = modelConfigs.find(item => item.is_default);
  if (defaultConfig) {
    modelConfigSelect.value = defaultConfig.id;
    reviewerModelSelect.value = defaultConfig.id;
    auditorModelSelect.value = defaultConfig.id;
    reviewAskModelSelect.value = defaultConfig.id;
    historyAskModelSelect.value = defaultConfig.id;
  }
  renderWorkbenchStatus();
  renderAuditModeControls();
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

function renderAuditModeControls() {
  const deep = analysisMode.value === "deep-audit";
  auditModelGrid.classList.toggle("hidden", !deep);
  sameModelHint.classList.toggle("hidden", !deep || reviewerModelSelect.value !== auditorModelSelect.value);
}

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

async function loadRules() {
  if (!currentUser) return;
  const data = await apiFetch("/api/rules");
  reviewRules = data.rules || [];
  const enabled = reviewRules.filter(rule => rule.enabled).length;
  enabledRuleCount.textContent = `已启用 ${enabled} 条规则`;
  renderRuleList();
}

async function loadRuleTemplates() {
  const data = await rawFetch("/api/rule-templates");
  ruleTemplates = data.templates || [];
  ruleTemplateList.innerHTML = ruleTemplates.map(template => `<article class="card compact-card">
    <div class="card-title">
      <span>${escapeHtml(template.name)}</span>
      <button type="button" data-copy-template="${escapeHtmlAttr(template.template_id)}">复制</button>
    </div>
    <p>${escapeHtml(template.description)}</p>
  </article>`).join("");
}

function renderRuleList() {
  if (!ruleList) return;
  ruleList.innerHTML = reviewRules.length ? reviewRules.map(rule => `<article class="card">
    <div class="card-title">
      <span>${escapeHtml(rule.name)}</span>
      <span class="badge ${rule.enabled ? "low" : "medium"}">${rule.enabled ? "启用" : "禁用"}</span>
    </div>
    <p>${escapeHtml(rule.description || "暂无说明")}</p>
    <p><strong>分类：</strong>${escapeHtml(rule.category)}；<strong>语言：</strong>${escapeHtml(rule.language)}；<strong>等级：</strong>${escapeHtml(rule.severity)}</p>
    <p><strong>触发：</strong>${escapeHtml((rule.include_keywords || []).join("、") || "无")}</p>
    <p><strong>排除：</strong>${escapeHtml((rule.exclude_keywords || []).join("、") || "无")}</p>
    <div class="inline-actions">
      <button type="button" data-toggle-rule="${rule.id}">${rule.enabled ? "禁用" : "启用"}</button>
      <button type="button" data-edit-rule="${rule.id}">编辑</button>
      <button type="button" data-delete-rule="${rule.id}">删除</button>
    </div>
  </article>`).join("") : empty("暂无规则。可以从模板复制或手动新增。");
}

function editRule(id) {
  const rule = reviewRules.find(item => item.id === id);
  if (!rule) return;
  editingRuleId.value = rule.id;
  ruleFormTitle.textContent = "编辑规则";
  ruleName.value = rule.name || "";
  ruleDescription.value = rule.description || "";
  ruleCategory.value = rule.category || "common";
  ruleLanguage.value = rule.language || "common";
  ruleFilePatterns.value = (rule.file_patterns || []).join(", ");
  ruleIncludeKeywords.value = (rule.include_keywords || []).join(", ");
  ruleExcludeKeywords.value = (rule.exclude_keywords || []).join(", ");
  ruleSeverity.value = rule.severity || "medium";
  ruleMessage.value = rule.message || "";
  ruleSuggestion.value = rule.suggestion || "";
  ruleEnabled.checked = Boolean(rule.enabled);
}

function resetRuleForm() {
  editingRuleId.value = "";
  ruleFormTitle.textContent = "新增规则";
  ruleName.value = "";
  ruleDescription.value = "";
  ruleCategory.value = "common";
  ruleLanguage.value = "common";
  ruleFilePatterns.value = "*";
  ruleIncludeKeywords.value = "";
  ruleExcludeKeywords.value = "";
  ruleSeverity.value = "medium";
  ruleMessage.value = "";
  ruleSuggestion.value = "";
  ruleEnabled.checked = true;
}

function readRuleForm() {
  return {
    name: ruleName.value,
    description: ruleDescription.value,
    category: ruleCategory.value,
    language: ruleLanguage.value,
    file_patterns: splitList(ruleFilePatterns.value),
    include_keywords: splitList(ruleIncludeKeywords.value),
    exclude_keywords: splitList(ruleExcludeKeywords.value),
    severity: ruleSeverity.value,
    message: ruleMessage.value,
    suggestion: ruleSuggestion.value,
    enabled: ruleEnabled.checked,
  };
}

function splitList(value) {
  return value.split(",").map(item => item.trim()).filter(Boolean);
}

async function loadHistory() {
  const data = await apiFetch("/api/history");
  const items = data.items || [];
  historyList.innerHTML = items.length ? items.map(renderHistoryItem).join("") : empty("暂无历史记录。完成一次 Review 后会自动保存。");
  if (!items.length) {
    selectedHistoryReport = null;
    historyDetail.classList.add("hidden");
  }
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
      renderHistoryDetail(item);
    }
    if (deleteId && confirm("确定删除这条历史记录吗？")) {
      await apiFetch(`/api/history/${deleteId}`, {method: "DELETE"});
      await loadHistory();
    }
  } catch (err) {
    showError(err.message);
  }
});

function renderHistoryDetail(item) {
  selectedHistoryReport = item.report;
  selectedHistoryId = item.id;
  historyAskThreadsState = item.ask_threads || [];
  const report = item.report || {};
  historyDetail.classList.remove("hidden");
  historyDetailTitle.textContent = item.prTitle || report.pr_overview?.title || "历史报告";
  historyDetailMeta.textContent = `模型：${item.model || report.model || "未知"}；风险数：${item.riskCount ?? (report.risks || []).length}；时间：${formatTime(item.analyzedAt)}`;
  historyDetailSummary.textContent = report.summary || "该历史记录没有摘要。";
  historyMarkdownPreview.textContent = buildMarkdownReport(report);
  renderAskPanel("history", selectedHistoryId, historyAskThreadsState);
}

function renderReport(data) {
  lastReport = data;
  emptyReport.classList.add("hidden");
  reportContent.classList.remove("hidden");
  setReportTab("overview");
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
  renderAuditReport(data);
  reviewAskThreadsState = data.ask_threads || [];
  renderAskPanel("review", data.history_id || "", reviewAskThreadsState);
}

function renderAskPanel(scope, historyId, threads) {
  const refs = askRefs(scope);
  refs.panel.classList.toggle("hidden", !historyId);
  refs.panel.dataset.historyId = historyId || "";
  refs.suggestions.innerHTML = askSuggestions.map(question =>
    `<button type="button" data-ask-scope="${scope}" data-ask-suggestion="${escapeHtmlAttr(question)}">${escapeHtml(question)}</button>`
  ).join("");
  refs.threads.innerHTML = threads.length ? threads.map(renderAskThread).join("") : empty("还没有追问。你可以从上方推荐问题开始。");
}

async function sendAsk(scope) {
  const refs = askRefs(scope);
  const historyId = refs.panel.dataset.historyId;
  const question = refs.question.value.trim();
  if (!historyId) {
    showError("当前报告还没有保存为历史记录，暂时不能追问。");
    return;
  }
  if (!question) {
    showError("请输入要追问的问题。");
    return;
  }
  refs.sendBtn.disabled = true;
  try {
    const data = await apiFetch("/api/ask", {
      method: "POST",
      body: JSON.stringify({
        history_id: historyId,
        question,
        model_config_id: refs.modelSelect.value,
      }),
    });
    const thread = data.ask_thread || {question, ...data, created_at: Math.floor(Date.now() / 1000)};
    if (scope === "review") {
      reviewAskThreadsState.push(thread);
      renderAskPanel("review", historyId, reviewAskThreadsState);
    } else {
      historyAskThreadsState.push(thread);
      renderAskPanel("history", historyId, historyAskThreadsState);
    }
    refs.question.value = "";
  } catch (err) {
    showError(`${err.message} 如果模型调用失败，请切换模型配置或检查 API 额度。`);
  } finally {
    refs.sendBtn.disabled = false;
  }
}

function askRefs(scope) {
  return scope === "history"
    ? {
        panel: historyAskPanel,
        modelSelect: historyAskModelSelect,
        suggestions: historyAskSuggestions,
        question: historyAskQuestion,
        sendBtn: historyAskSendBtn,
        threads: historyAskThreads,
      }
    : {
        panel: reviewAskPanel,
        modelSelect: reviewAskModelSelect,
        suggestions: reviewAskSuggestions,
        question: reviewAskQuestion,
        sendBtn: reviewAskSendBtn,
        threads: reviewAskThreads,
      };
}

function fillAskQuestion(scope, question) {
  const refs = askRefs(scope || "review");
  refs.question.value = question || "";
  refs.question.focus();
}

function renderAskThread(item) {
  const confidence = Number(item.confidence || 0);
  const files = item.related_files || [];
  const risks = item.related_risks || [];
  const limitations = item.limitations || [];
  const badge = confidence < 60 ? `<span class="badge medium">需要人工确认</span>` : `<span class="badge low">可信度 ${confidence}%</span>`;
  return `<article class="card ask-card">
    <div class="card-title">
      <span>${escapeHtml(item.question || "追问")}</span>
      ${badge}
    </div>
    <p>${escapeHtml(item.answer || "当前上下文无法确认。")}</p>
    <p><strong>相关文件：</strong>${escapeHtml(files.length ? files.join(", ") : "无明确关联文件")}</p>
    <p><strong>相关风险：</strong>${escapeHtml(risks.length ? risks.join(", ") : "无明确关联风险")}</p>
    ${limitations.length ? `<p><strong>限制说明：</strong>${escapeHtml(limitations.join("；"))}</p>` : ""}
    <div class="inline-actions">
      <button class="copy-btn" type="button" data-copy="${escapeHtmlAttr(item.answer || "")}">复制回答</button>
    </div>
  </article>`;
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
  const additions = Number(file.additions || 0);
  const deletions = Number(file.deletions || 0);
  const hunks = Number(file.hunks || 0);
  const risk = riskScoreText(score);
  const reasons = (file.risk_reasons || []).join("；") || "普通变更文件";
  const lowRiskNote = score < 40
    ? `<p class="explain-note">该文件变更规模较小或不属于核心业务代码，因此未进入深度分析。</p>`
    : "";
  return `<article class="card">
    <div class="card-title">
      <span>${escapeHtml(path)}</span>
      <span class="badge ${risk.className}">${risk.label}</span>
    </div>
    <div class="risk-meter"><span style="width:${score}%"></span></div>
    <p><strong>${escapeHtml(categoryText(file.category))}</strong>，${lineChangeText(additions, deletions)}，${hunkText(hunks)}。</p>
    <p>风险判断：${risk.label}，风险分 ${score}。状态：${status.label}。</p>
    <p>判断原因：${escapeHtml(reasons)}</p>
    ${lowRiskNote}
    <details class="tech-details">
      <summary>查看原始技术字段</summary>
      <p>category: ${escapeHtml(file.category || "general")}；risk_score: ${score}；additions: ${additions}；deletions: ${deletions}；hunks: ${hunks}</p>
    </details>
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
      <span>${escapeHtml(item.rule_name || "规则预检")}</span>
      <span class="badge ${item.risk_level || "medium"}">${escapeHtml(item.status || "待 AI 判断")}</span>
    </div>
    <p><strong>影响文件：</strong>${escapeHtml(item.file || "全局")}</p>
    <p><strong>命中原因：</strong>${escapeHtml(item.reason || item.issue || "")}</p>
    <p><strong>风险等级：</strong>${escapeHtml(riskLevelText(item.risk_level || "medium"))}</p>
    <p><strong>证据：</strong>${escapeHtml(item.evidence || "")}</p>
    <p><strong>建议：</strong>${escapeHtml(item.suggestion || "")}</p>
  </article>`;
}

function renderAuditReport(data) {
  if (data.review_mode !== "deep_audit") {
    reviewerResultBox.innerHTML = empty("当前为快速分析，没有初审模型原始结果。");
    auditorResultBox.innerHTML = empty("当前为快速分析，没有 AI 审计结果。");
    finalResultBox.innerHTML = empty("当前为快速分析，没有融合结果。");
    return;
  }
  const reviewerRisks = data.reviewer_result?.risks || [];
  const reviewerModules = data.reviewer_result?.changed_modules || [];
  const reviewerComments = data.reviewer_result?.review_comments || [];
  const auditor = data.auditor_result || {};
  const finalRisks = data.final_result?.final_risks || [];
  const dismissed = data.final_result?.dismissed_risks || [];
  reviewerResultBox.innerHTML = [
    `<article class="card"><p>${escapeHtml(data.reviewer_result?.summary || "初审模型没有返回摘要。")}</p></article>`,
    reviewerModules.length ? `<h3>初审模块总结</h3>${reviewerModules.map(renderModule).join("")}` : empty("初审模型未输出模块总结。"),
    reviewerRisks.length ? `<h3>初审风险</h3>${reviewerRisks.map(renderReviewerRisk).join("")}` : empty("初审模型未输出风险。"),
    reviewerComments.length ? `<h3>初审 Review Comments</h3>${reviewerComments.map(renderComment).join("")}` : empty("初审模型未输出 Review Comment。"),
  ].join("");
  auditorResultBox.innerHTML = renderAuditorResult(auditor);
  finalResultBox.innerHTML = [
    finalRisks.length ? `<h3>最终风险</h3>${finalRisks.map(renderFinalRisk).join("")}` : empty("融合后未发现核心风险。"),
    dismissed.length ? `<h3>被移除的误检候选</h3>${dismissed.map(item => `<article class="card compact-card"><p><strong>${escapeHtml(item.file)}</strong>：${escapeHtml(item.issue)}</p><p>${escapeHtml(item.dismiss_reason)}</p></article>`).join("")}` : "",
    (data.final_result?.review_comments || []).length ? `<h3>最终 Review Comments</h3>${data.final_result.review_comments.map(renderComment).join("")}` : "",
    (data.final_result?.limitations || []).length ? `<h3>最终限制说明</h3>${data.final_result.limitations.map(renderLimitation).join("")}` : "",
  ].join("");
}

function renderReviewerRisk(item) {
  return `<article class="card">
    <div class="card-title"><span>${escapeHtml(item.file)}</span><span class="badge ${item.risk_level}">${item.risk_level}</span></div>
    <p><strong>问题：</strong>${escapeHtml(item.issue)}</p>
    <p><strong>证据：</strong>${escapeHtml(item.evidence)}</p>
    <p><strong>初审置信度：</strong>${confidenceLabel(item.reviewer_confidence ?? item.confidence)}</p>
  </article>`;
}

function renderAuditorResult(auditor) {
  const falsePositives = auditor.false_positive_candidates || [];
  const missed = auditor.missed_risk_candidates || [];
  const adjustments = auditor.confidence_adjustments || [];
  const notes = auditor.audit_notes || [];
  return `<article class="card"><p>${escapeHtml(auditor.audit_summary || "审计模型没有返回总结。")}</p></article>
    <h3>可能误检项</h3>${falsePositives.length ? falsePositives.map(item => `<article class="card compact-card"><p><strong>${escapeHtml(item.file)}</strong>：${escapeHtml(item.reason)}</p><p>动作：${escapeHtml(auditActionText(item.audit_action || ""))}；建议类型：${escapeHtml(typeText(item.suggested_type || ""))}；建议置信度：${confidenceLabel(item.suggested_confidence)}</p></article>`).join("") : empty("暂无可能误检项")}
    <h3>可能漏检项</h3>${missed.length ? missed.map(item => `<article class="card compact-card"><p><strong>${escapeHtml(item.file)}</strong>：${escapeHtml(item.issue)}</p><p>${escapeHtml(item.reason)}</p></article>`).join("") : empty("暂无可能漏检项")}
    <h3>置信度调整</h3>${adjustments.length ? adjustments.map(item => `<article class="card compact-card"><p>${escapeHtml(item.risk_id)}：${item.old_confidence} -> ${item.new_confidence}</p><p>${escapeHtml(item.reason)}</p></article>`).join("") : empty("暂无置信度调整")}
    <h3>审计说明</h3>${notes.length ? notes.map(renderLimitation).join("") : empty("暂无额外审计说明")}
    <h3>最终审计建议</h3><article class="card compact-card"><p>${escapeHtml(auditor.final_recommendation || "暂无最终审计建议。")}</p></article>`;
}

function renderFinalRisk(item) {
  return `<article class="card">
    <div class="card-title"><span>${escapeHtml(item.file)}</span><span class="badge ${item.risk_level}">${escapeHtml(typeText(item.type))}</span><button class="copy-btn" type="button" data-risk-ask="${escapeHtmlAttr(item.id || item.file || "")}">\u8ffd\u95ee</button></div>
    <p><strong>风险等级：</strong>${escapeHtml(riskLevelText(item.risk_level))}；<strong>审计状态：</strong>${escapeHtml(auditStatusText(item.audit_status))}</p>
    <p><strong>问题：</strong>${escapeHtml(item.issue)}</p>
    <p><strong>证据：</strong>${escapeHtml(item.evidence)}</p>
    <p><strong>原因：</strong>${escapeHtml(item.reason)}</p>
    <p><strong>建议：</strong>${escapeHtml(item.suggestion)}</p>
    <p><strong>初审模型置信度：</strong>${confidenceLabel(item.reviewer_confidence)}；<strong>审计模型置信度：</strong>${confidenceLabel(item.auditor_confidence)}；<strong>最终置信度：</strong>${confidenceLabel(item.final_confidence)}</p>
    <p><strong>审计说明：</strong>${escapeHtml(item.audit_note || "")}</p>
  </article>`;
}

function renderModule(item) {
  const name = item.name || item.module || "未命名模块";
  const summary = item.summary || item.change || "无总结";
  return `<article class="card">
    <div class="card-title"><span>${escapeHtml(name)}</span></div>
    <p>${escapeHtml(summary)}</p>
    <p><strong>文件：</strong>${escapeHtml((item.files || []).join(", "))}</p>
  </article>`;
}

function renderRisk(item) {
  return `<article class="card">
    <div class="card-title">
      <span>${escapeHtml(item.file)}</span>
      <span class="badge ${item.risk_level}">${item.risk_level}</span>
      <button class="copy-btn" type="button" data-risk-ask="${escapeHtmlAttr(item.id || item.file || "")}">\u8ffd\u95ee</button>
    </div>
    <p><strong>类型：</strong>${escapeHtml(typeText(item.type))}</p>
    <p><strong>证据：</strong>${escapeHtml(item.evidence)}</p>
    <p><strong>问题：</strong>${escapeHtml(item.issue)}</p>
    <p><strong>原因：</strong>${escapeHtml(item.reason)}</p>
    <p><strong>建议：</strong>${escapeHtml(item.suggestion)}</p>
    <p><strong>置信度：</strong>${confidenceLabel(item.confidence)}</p>
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
  const fileChanges = data.file_changes || [];
  const ruleFindings = data.rule_findings || [];
  const modules = data.changed_modules || [];
  const coverage = data.context_coverage || {};
  return [
    `# ${data.pr_overview?.title || "ReviewPilot 报告"}`,
    "",
    "## Summary",
    data.summary || "",
    "",
    "## PR Overview",
    `- 文件数：${data.pr_overview?.changed_files ?? fileChanges.length}`,
    `- 新增/删除：+${data.pr_overview?.additions ?? 0} / -${data.pr_overview?.deletions ?? 0}`,
    `- 使用模型：${data.model || "未返回"}`,
    "",
    "## Context Coverage",
    `- 深度分析文件：${coverage.analyzed_files ?? 0}/${coverage.total_files ?? 0}`,
    `- 策略：${coverage.strategy || "按文件风险分选择重点上下文"}`,
    "",
    "## Changed Files",
    fileChanges.length ? fileChanges.map(item => `- ${item.filename}: ${item.status}，风险分 ${item.risk_score ?? item.priority ?? 0}，+${item.additions}/-${item.deletions}`).join("\n") : "- 暂无文件",
    "",
    "## Changed Modules",
    modules.length ? modules.map(item => `- ${item.name}: ${item.summary}`).join("\n") : "- 暂无模块总结",
    "",
    "## 规则预检",
    ruleFindings.length ? ruleFindings.map(item => `- [${item.risk_level}] ${item.file}: ${item.issue}`).join("\n") : "- 规则层未发现需要提示的问题",
    "",
    "## Risks",
    risks.length ? risks.map(item => `- [${item.risk_level}] ${item.file}: ${item.issue}`).join("\n") : "- 未发现明确风险",
    "",
    "## Review Comments",
    comments.length ? comments.map(item => `- ${item.file ? item.file + ": " : ""}${item.comment}`).join("\n") : "- 暂无建议",
  ].join("\n");
}

function downloadMarkdownReport(data) {
  if (!data) {
    showError("当前还没有可导出的报告。");
    return;
  }
  const content = buildMarkdownReport(data);
  const title = data.pr_overview?.title || "reviewpilot-report";
  const filename = `${safeFilename(title)}.md`;
  const blob = new Blob([content], {type: "text/markdown;charset=utf-8"});
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
  showNotice("导出成功", `Markdown 文件已开始下载：${filename}`);
}

function setReportTab(tab) {
  document.querySelectorAll("[data-report-tab]").forEach(button => {
    button.classList.toggle("active", button.dataset.reportTab === tab);
  });
  document.querySelectorAll("[data-report-panel]").forEach(panel => {
    panel.classList.toggle("hidden", panel.dataset.reportPanel !== tab);
  });
}

function safeFilename(value) {
  return String(value || "reviewpilot-report")
    .replace(/[\\/:*?"<>|]/g, "-")
    .replace(/\s+/g, "-")
    .slice(0, 80);
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

function riskScoreText(score) {
  if (score >= 70) return {label: "高风险", className: "high"};
  if (score >= 40) return {label: "中风险", className: "medium"};
  return {label: "低风险", className: "low"};
}

function riskLevelText(level) {
  const map = {low: "低风险", medium: "中风险", high: "高风险"};
  return map[level] || "中风险";
}

function categoryText(category) {
  const map = {
    general: "普通配置/通用文件",
    lockfile: "依赖锁定文件",
    auth: "登录/权限相关文件",
    payment: "支付/订单相关文件",
    data: "数据/模型相关文件",
    test: "测试文件",
    config: "配置文件",
    frontend: "前端界面文件",
  };
  return map[category] || "普通配置/通用文件";
}

function lineChangeText(additions, deletions) {
  return `新增 ${additions} 行，删除 ${deletions} 行，共 ${additions + deletions} 行变更`;
}

function hunkText(hunks) {
  return `${hunks} 处连续变更`;
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

function auditStatusText(status) {
  const map = {
    accepted: "审计通过",
    downgraded: "已降级为待人工确认",
    added_by_auditor: "审计模型补充的可能漏检项",
    removed: "已作为可能误检移除",
    needs_human_check: "需要人工复核",
  };
  return map[status] || "需要人工复核";
}

function auditActionText(action) {
  const map = {
    keep: "保留",
    downgrade: "降级",
    remove: "移除",
    needs_human_check: "需要人工复核",
  };
  return map[action] || action || "未说明";
}

function confidenceLabel(value) {
  const number = Number(value);
  if (!Number.isFinite(number)) return "未返回";
  return `${Math.max(0, Math.min(100, Math.round(number <= 1 ? number * 100 : number)))}%`;
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
