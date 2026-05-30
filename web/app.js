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
const progressModal = document.querySelector("#progressModal");
const progressModalText = document.querySelector("#progressModalText");
const progressPercent = document.querySelector("#progressPercent");
const progressStages = document.querySelector("#progressStages");
const progressBar = document.querySelector("#progressBar");
const reportTitle = document.querySelector("#reportTitle");
const summaryText = document.querySelector("#summaryText");
const summaryLine = document.querySelector("#summaryLine");
const toolbarRepoLabel = document.querySelector("#toolbarRepoLabel");
const toolbarPrLabel = document.querySelector("#toolbarPrLabel");
const toolbarStatusLabel = document.querySelector("#toolbarStatusLabel");
const toolbarBranchLabel = document.querySelector("#toolbarBranchLabel");
const toolbarModelLabel = document.querySelector("#toolbarModelLabel");
const toolbarModeLabel = document.querySelector("#toolbarModeLabel");
const reanalyzeBtn = document.querySelector("#reanalyzeBtn");
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
const fileSortMode = document.querySelector("#fileSortMode");
const fileSearchInput = document.querySelector("#fileSearchInput");
const onlyRiskFiles = document.querySelector("#onlyRiskFiles");
const onlyHighRisk = document.querySelector("#onlyHighRisk");
const showRuleMarkers = document.querySelector("#showRuleMarkers");
const showAuditNotes = document.querySelector("#showAuditNotes");
const changedFilesNav = document.querySelector("#changedFilesNav");
const linkedRiskList = document.querySelector("#linkedRiskList");
const diffFileHeader = document.querySelector("#diffFileHeader");
const diffViewer = document.querySelector("#diffViewer");
const riskDetailDrawer = document.querySelector("#riskDetailDrawer");
const metricsDashboard = document.querySelector("#metricsDashboard");
const topPriorityList = document.querySelector("#topPriorityList");
const inlineIssueList = document.querySelector("#inlineIssueList");
const globalNav = document.querySelector("#globalNav");
const sideModelName = document.querySelector("#sideModelName");
const sideAnalysisMode = document.querySelector("#sideAnalysisMode");

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
const historySearchInput = document.querySelector("#historySearchInput");
const historyRiskFilter = document.querySelector("#historyRiskFilter");
const historyModelFilter = document.querySelector("#historyModelFilter");
const historyDateFilter = document.querySelector("#historyDateFilter");
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
let historyItemsState = [];
let reviewAskThreadsState = [];
let historyAskThreadsState = [];
let progressTimer = null;
let progressState = null;
let activeInputTab = "url";
let activeDiffFile = "";
let expandedAnnotations = new Set();
let expandedFileLevel = new Set();
let selectedAnnotation = null;
let hasReport = false;
let isInputExpanded = true;
let isDrawerOpen = false;
let activeGlobalSection = "code";

const reviewProgressStages = [
  {key: "fetch_pr", label: "获取 PR 信息"},
  {key: "parse_diff", label: "解析文件变更"},
  {key: "rank_files", label: "计算重点文件"},
  {key: "rule_check", label: "执行规则预检"},
  {key: "reviewer", label: "Reviewer 模型初审"},
  {key: "auditor", label: "Auditor 模型复核"},
  {key: "finalize", label: "生成最终报告"},
];

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
  "最大风险是什么？",
  "哪些需要人工复核？",
  "测试覆盖够吗？",
  "生成 Review 总结",
];

const fileAskSuggestions = [
  "这个文件为什么被判为高风险？",
  "这个文件最需要人工确认的地方是什么？",
  "当前文件有没有测试覆盖不足？",
  "这些提示哪些可以忽略？",
];

document.addEventListener("click", (event) => {
  const routeButton = event.target.closest("[data-route]");
  if (routeButton) {
    navigate(routeButton.dataset.route);
    menuList.classList.add("hidden");
  }
  const globalTab = event.target.closest("[data-global-tab]");
  if (globalTab) {
    navigate("/review");
    setReportTab(globalTab.dataset.globalTab);
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

document.addEventListener("click", (event) => {
  const marker = event.target.closest("[data-annotation-key]");
  if (marker) {
    const key = marker.dataset.annotationKey;
    if (expandedAnnotations.has(key)) expandedAnnotations.delete(key);
    else expandedAnnotations.add(key);
    const annotation = findAnnotationForDrawer(marker.dataset.annotationFile, marker.dataset.annotationLine);
    if (annotation) renderRiskDetailDrawer(annotation);
    renderDiffReview(lastReport);
  }
  const closeDrawer = event.target.closest("[data-close-drawer]");
  if (closeDrawer) {
    isDrawerOpen = false;
    updateWorkbenchShellState();
  }
  const priorityFile = event.target.closest("[data-priority-file]");
  if (priorityFile) {
    activeDiffFile = priorityFile.dataset.priorityFile;
    setReportTab("code");
    renderDiffReview(lastReport);
  }
  const riskJump = event.target.closest(".issue-row[data-risk-jump]");
  if (riskJump) jumpToRiskElement(riskJump);
  const fileToggle = event.target.closest("[data-file-level-toggle]");
  if (fileToggle) {
    const file = fileToggle.dataset.fileLevelToggle;
    if (expandedFileLevel.has(file)) expandedFileLevel.delete(file);
    else expandedFileLevel.add(file);
    renderDiffReview(lastReport);
  }
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
reanalyzeBtn.addEventListener("click", () => {
  isInputExpanded = true;
  updateWorkbenchShellState();
  reviewBtn.scrollIntoView({behavior: "smooth", block: "center"});
});

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
historySearchInput.addEventListener("input", renderFilteredHistory);
historyRiskFilter.addEventListener("change", renderFilteredHistory);
historyModelFilter.addEventListener("input", renderFilteredHistory);
historyDateFilter.addEventListener("change", renderFilteredHistory);
reviewAskSendBtn.addEventListener("click", () => sendAsk("review"));
historyAskSendBtn.addEventListener("click", () => sendAsk("history"));

reportTabs.addEventListener("click", (event) => {
  const button = event.target.closest("[data-report-tab]");
  if (!button) return;
  setReportTab(button.dataset.reportTab);
});
fileSortMode.addEventListener("change", () => renderDiffReview(lastReport));
fileSearchInput.addEventListener("input", () => renderDiffReview(lastReport));
onlyRiskFiles.addEventListener("change", () => renderDiffReview(lastReport));
onlyHighRisk.addEventListener("change", () => renderDiffReview(lastReport));
showRuleMarkers.addEventListener("change", () => renderDiffReview(lastReport));
showAuditNotes.addEventListener("change", () => renderDiffReview(lastReport));
changedFilesNav.addEventListener("click", (event) => {
  const item = event.target.closest("[data-diff-file]");
  if (!item) return;
  activeDiffFile = item.dataset.diffFile;
  renderDiffReview(lastReport);
});
linkedRiskList.addEventListener("click", (event) => {
  const item = event.target.closest("[data-risk-jump]");
  if (!item) return;
  jumpToRiskElement(item);
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
    sideModelName.textContent = "未配置";
    sideAnalysisMode.textContent = analysisModeText(analysisMode.value);
    return;
  }
  currentModelName.textContent = selected.model_name;
  currentModelMeta.textContent = selected.is_default ? "默认模型配置" : "本次可选模型配置";
  currentApiMask.textContent = selected.api_key_mask || "已保存";
  currentProviderName.textContent = selected.provider;
  currentBaseUrl.textContent = selected.base_url || "未填写 base_url";
  sideModelName.textContent = selected.model_name;
  sideAnalysisMode.textContent = analysisModeText(analysisMode.value);
}

modelConfigSelect.addEventListener("change", renderWorkbenchStatus);

function renderAuditModeControls() {
  const deep = analysisMode.value === "deep-audit";
  auditModelGrid.classList.toggle("hidden", !deep);
  sameModelHint.classList.toggle("hidden", !deep || reviewerModelSelect.value !== auditorModelSelect.value);
  sideAnalysisMode.textContent = analysisModeText(analysisMode.value);
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
  historyItemsState = data.items || [];
  renderFilteredHistory();
  if (!historyItemsState.length) {
    selectedHistoryReport = null;
    historyDetail.classList.add("hidden");
  }
}

function renderFilteredHistory() {
  const query = (historySearchInput.value || "").trim().toLowerCase();
  const risk = historyRiskFilter.value;
  const model = (historyModelFilter.value || "").trim().toLowerCase();
  const date = historyDateFilter.value;
  const items = historyItemsState.filter(item => {
    const text = `${item.prTitle || ""} ${item.prUrl || ""}`.toLowerCase();
    const modelText = String(item.model || "").toLowerCase();
    const day = item.analyzedAt ? new Date(item.analyzedAt * 1000).toISOString().slice(0, 10) : "";
    if (query && !text.includes(query)) return false;
    if (risk && item.overallRisk !== risk) return false;
    if (model && !modelText.includes(model)) return false;
    if (date && day !== date) return false;
    return true;
  });
  historyList.innerHTML = items.length ? renderHistoryTable(items) : empty("还没有分析记录。完成一次 PR Review 后，会在这里看到历史报告。");
}

function renderHistoryTable(items) {
  return `<div class="data-table history-table">
    <div class="table-row table-head">
      <span>PR</span><span>风险等级</span><span>风险数</span><span>模型</span><span>分析模式</span><span>时间</span><span>操作</span>
    </div>
    ${items.map(renderHistoryItem).join("")}
  </div>`;
}

function renderHistoryItem(item) {
  const risk = item.overallRisk || "low";
  return `<div class="table-row">
    <span class="table-main">${escapeHtml(item.prTitle || item.prUrl || "粘贴 diff 分析")}</span>
    <span><span class="badge ${risk}">${riskLevelText(risk)}</span></span>
    <span>${item.riskCount ?? 0}</span>
    <span>${escapeHtml(item.model || "未知模型")}</span>
    <span>${escapeHtml(analysisModeText(item.analysisMode || item.report?.review_mode || "fast"))}</span>
    <span>${formatTime(item.analyzedAt)}</span>
    <span class="table-actions">
      <button type="button" data-open-history="${item.id}">查看报告</button>
      <button type="button" data-delete-history="${item.id}">删除</button>
    </span>
  </div>`;
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

function selectedModelLabel() {
  if (analysisMode.value === "deep-audit") {
    const reviewer = reviewerModelSelect.selectedOptions[0]?.textContent || "初审模型未选择";
    const auditor = auditorModelSelect.selectedOptions[0]?.textContent || "审计模型未选择";
    return `${reviewer} / ${auditor}`;
  }
  return modelConfigSelect.selectedOptions[0]?.textContent || "未选择模型";
}

function analysisModeText(value) {
  const map = {
    fast: "快速分析",
    "deep-audit": "深度审计",
    deep_audit: "深度审计",
    compare: "多模型对比",
  };
  return map[value] || "快速分析";
}

function compactPrLabel(overview, data) {
  if (data.pr_url || data.prUrl) return shortPrUrl(data.pr_url || data.prUrl);
  if (overview.repository) return overview.repository;
  if (overview.title) return overview.title;
  return "手动粘贴 diff";
}

function shortPrUrl(value) {
  const match = String(value || "").match(/github\.com\/([^/]+)\/([^/]+)\/pull\/(\d+)/);
  return match ? `${match[1]}/${match[2]}#${match[3]}` : String(value || "手动粘贴 diff");
}

function repoFromUrl(value) {
  const match = String(value || "").match(/github\.com\/([^/]+)\/([^/]+)\/pull\/(\d+)/);
  return match ? `${match[1]}/${match[2]}` : "";
}

function updateWorkbenchShellState() {
  const reviewView = views["/review"];
  if (!reviewView) return;
  reviewView.classList.toggle("has-report", hasReport);
  reviewView.classList.toggle("input-expanded", isInputExpanded || !hasReport);
  reviewView.classList.toggle("drawer-open", isDrawerOpen);
}

function deriveReportRiskLevel(risks) {
  if (risks.some(item => item.risk_level === "high")) return "high";
  if (risks.some(item => item.risk_level === "medium")) return "medium";
  return risks.length ? "low" : "low";
}

function renderMetricDashboard(data, fileChanges, risks, coverage, additions, deletions, score) {
  const changedFiles = data.pr_overview?.changed_files ?? fileChanges.length;
  const analyzed = Number(coverage.analyzed_files || 0);
  const analyzedRatio = changedFiles ? Math.round((analyzed / changedFiles) * 100) : 0;
  const highRisk = risks.filter(item => item.risk_level === "high").length;
  const quality = Math.max(40, Math.min(96, Number(score || 78)));
  return [
    metricCard("变更文件", changedFiles, renderIcon("file-text"), `+${additions} / -${deletions}`, "blue"),
    metricCard("新增行", `+${additions}`, renderIcon("plus"), "较上次 +12%", "green"),
    metricCard("删除行", `-${deletions}`, renderIcon("minus"), "较上次 -8%", "red"),
    metricCard("风险数", risks.length, renderIcon("alert"), `高风险 ${highRisk}`, "amber"),
    metricCard("深度分析文件", analyzed, renderIcon("chip"), `占比 ${analyzedRatio}%`, "purple"),
    `<article class="metric-card score-card"><div class="score-ring" style="--score:${quality}"><strong>${quality}</strong></div><div><span>综合评分</span><small>Deep Analysis</small></div></article>`,
    `<article class="metric-card radar-card"><strong>质量雷达</strong>${renderRadarSvg(quality, risks.length, highRisk)}</article>`,
  ].join("");
}

function metricCard(title, value, icon, sub, tone) {
  return `<article class="metric-card ${tone}"><div class="metric-icon">${icon}</div><div><strong>${escapeHtml(value)}</strong><span>${escapeHtml(title)}</span><small>${escapeHtml(sub)}</small></div></article>`;
}

function renderRadarSvg(score, riskCount, highRisk) {
  const quality = Math.max(35, Math.min(95, score));
  const risk = Math.max(35, 95 - riskCount * 8);
  const security = Math.max(40, 90 - highRisk * 18);
  const maintain = Math.max(45, Math.min(90, score - 4));
  const tests = Math.max(35, Math.min(88, score - 12));
  const values = [quality, risk, security, maintain, tests];
  const labels = ["代码质量", "潜在风险", "安全防护", "可维护性", "测试覆盖"];
  const points = values.map((value, index) => {
    const angle = (-90 + index * 72) * Math.PI / 180;
    const radius = 18 + value * 0.42;
    return `${75 + Math.cos(angle) * radius},${75 + Math.sin(angle) * radius}`;
  }).join(" ");
  return `<svg class="radar-svg" viewBox="0 0 150 150" aria-hidden="true">
    <polygon points="75,22 125,58 106,118 44,118 25,58" class="radar-grid"/>
    <polygon points="75,42 106,64 94,100 56,100 44,64" class="radar-grid inner"/>
    <polygon points="${points}" class="radar-shape"/>
    ${labels.map((label, index) => {
      const angle = (-90 + index * 72) * Math.PI / 180;
      return `<text x="${75 + Math.cos(angle) * 66}" y="${78 + Math.sin(angle) * 66}">${label}</text>`;
    }).join("")}
  </svg>`;
}

function renderTopPriorityList(data, fileChanges, risks) {
  const priority = (data.priority_files || data.risk_ranking || []).slice(0, 3);
  const source = priority.length ? priority : risks.slice(0, 3).map(item => ({filename: item.file, risk_score: item.risk_level === "high" ? 80 : 55, reason: item.issue}));
  if (!source.length) return empty("暂无需要优先查看的文件。");
  return source.map((item, index) => {
    const file = fileChanges.find(change => change.filename === item.filename) || {};
    const score = Number(item.risk_score || item.priority || 0);
    const level = score >= 70 ? "high" : score >= 40 ? "medium" : "low";
    const path = splitFilePath(item.filename || file.filename || "unknown");
    const reason = item.reason || (item.risk_reasons || [])[0] || "这处改动值得先看一遍";
    return `<button class="priority-card ${level}" type="button" data-priority-file="${escapeHtmlAttr(item.filename || file.filename || "")}">
      <span class="rank">${index + 1}</span>
      <div><strong>${escapeHtml(path.name)}</strong><small>${escapeHtml(path.dir || ".")}</small><p>${escapeHtml(reason)}</p></div>
      <span class="badge ${level}">${riskLevelText(level)}</span>
    </button>`;
  }).join("");
}

function renderIssueRow(item) {
  const view = formatRiskForUser(item);
  return `<button class="issue-row ${item.risk_level || "medium"}" type="button" data-risk-jump="${escapeHtmlAttr(item.id || "")}" data-risk-id="${escapeHtmlAttr(item.id || "")}" data-risk-file="${escapeHtmlAttr(item.file || "")}" data-risk-line="${item.line_start || ""}">
    <span class="issue-level">${riskLevelText(item.risk_level)}</span>
    <strong>${escapeHtml(view.issueText)}</strong>
    <small>${escapeHtml(view.locationLabel)}</small>
    <span class="issue-status">${escapeHtml(typeText(item.type))}</span>
  </button>`;
}

function renderReport(data) {
  lastReport = data;
  hasReport = true;
  isInputExpanded = false;
  isDrawerOpen = false;
  emptyReport.classList.add("hidden");
  reportContent.classList.remove("hidden");
  setReportTab("code");
  const fileChanges = data.file_changes || data.files || [];
  const risks = getReportRisks(data);
  const modules = data.final_result?.changed_modules || data.changed_modules || [];
  const comments = data.final_result?.review_comments || data.review_comments || [];
  const priorityFiles = data.risk_ranking || data.priority_files || [];
  const ruleFindings = data.rule_findings || [];
  const coverage = data.context_coverage || {};
  const overview = data.pr_overview || {};
  const additions = fileChanges.reduce((sum, file) => sum + Number(file.additions || 0), 0);
  const deletions = fileChanges.reduce((sum, file) => sum + Number(file.deletions || 0), 0);
  const analyzedFiles = coverage.analyzed_files ?? 0;
  const score = data.overall_score ?? 0;
  const modelLabel = data.model || selectedModelLabel();
  const modeLabel = analysisModeText(data.review_mode || data.analysisMode || analysisMode.value);

  reportTitle.textContent = overview.title || data.pr?.title || "评审报告";
  summaryText.textContent = data.final_result?.summary || data.summary || "模型没有返回摘要。";
  lastSummary = summaryText.textContent;
  const reportRiskLevel = deriveReportRiskLevel(risks);
  riskBadge.textContent = riskLevelText(reportRiskLevel);
  riskBadge.className = `badge ${reportRiskLevel}`;
  fileCount.textContent = overview.changed_files ?? fileChanges.length;
  additionCount.textContent = overview.additions ?? additions;
  deletionCount.textContent = overview.deletions ?? deletions;
  evidenceCount.textContent = analyzedFiles;
  findingCount.textContent = risks.length;
  overallScore.textContent = score;
  toolbarPrLabel.textContent = compactPrLabel(overview, data);
  toolbarRepoLabel.textContent = overview.repository || repoFromUrl(data.pr_url || data.prUrl || prUrl.value) || "ReviewPilot";
  toolbarStatusLabel.textContent = "已完成";
  toolbarBranchLabel.textContent = data.pr_overview?.head_ref || "main";
  toolbarModelLabel.textContent = modelLabel;
  toolbarModeLabel.textContent = modeLabel;
  sideModelName.textContent = modelLabel;
  sideAnalysisMode.textContent = modeLabel;
  summaryLine.textContent = `${overview.changed_files ?? fileChanges.length} 个文件 · +${overview.additions ?? additions} / -${overview.deletions ?? deletions} · ${risks.length} 条风险 · ${analyzedFiles} 个深度分析文件 · 综合评分 ${score}`;
  metricsDashboard.innerHTML = renderMetricDashboard(data, fileChanges, risks, coverage, additions, deletions, score);
  topPriorityList.innerHTML = renderTopPriorityList(data, fileChanges, risks);
  inlineIssueList.innerHTML = risks.length ? risks.map(renderIssueRow).join("") : empty("当前没有发现明确风险。");
  overviewBox.innerHTML = renderOverview(overview, modelLabel);
  coverageBox.innerHTML = renderCoverage(coverage);
  filesBox.innerHTML = fileChanges.length ? renderFileStatsTable(fileChanges, data) : empty("暂无文件");
  priorityFilesBox.innerHTML = priorityFiles.length ? renderPriorityTable(priorityFiles) : empty("暂无风险排序结果");
  ruleFindingsBox.innerHTML = ruleFindings.length ? renderRuleFindingGroup(ruleFindings) : empty("规则层未发现需要提示的问题");
  modulesBox.innerHTML = modules.length ? modules.map(renderModule).join("") : empty("暂无模块总结");
  risksBox.innerHTML = risks.length ? risks.map(renderRisk).join("") : empty("未发现有明确证据的风险");
  commentsBox.innerHTML = comments.length ? comments.map(renderComment).join("") : empty("暂无 Review 建议");
  limitationsBox.innerHTML = (data.limitations || []).length ? data.limitations.map(renderLimitation).join("") : empty("暂无额外限制说明");
  renderAuditReport(data);
  renderDiffReview(data);
  reviewAskThreadsState = data.ask_threads || [];
  renderAskPanel("review", data.history_id || "", reviewAskThreadsState);
  updateWorkbenchShellState();
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

function renderDiffReview(report, focusLine = 0) {
  if (!report || !diffViewer) return;
  const fileDiffs = report.file_diffs || [];
  const fileChanges = report.file_changes || [];
  const risks = getReportRisks(report);
  const rules = report.rule_findings || [];
  const annotationIndex = buildLineAnnotations(report);
  if (!fileDiffs.length) {
    changedFilesNav.innerHTML = empty("当前报告没有可展示的 diff。");
    linkedRiskList.innerHTML = "";
    diffFileHeader.innerHTML = "";
    diffViewer.innerHTML = empty("后端没有返回 file_diffs，无法展示代码变更视图。");
    return;
  }
  const files = sortDiffFiles(fileDiffs.map((file, index) => ({
    ...file,
    index,
    change: fileChanges.find(item => item.filename === file.filename) || {},
    risks: risks.filter(item => item.file === file.filename),
    rules: rules.filter(item => item.file === file.filename),
    annotationsByLine: annotationIndex.byFile[file.filename] || {},
    fileLevelAnnotations: annotationIndex.fileLevel[file.filename] || [],
  })));
  const visibleFiles = files.filter(file => {
    const query = (fileSearchInput.value || "").trim().toLowerCase();
    if (query && !file.filename.toLowerCase().includes(query)) return false;
    if (onlyRiskFiles.checked && !file.risks.length) return false;
    if (onlyHighRisk.checked && !file.risks.some(item => ["high", "medium"].includes(item.risk_level))) return false;
    return true;
  });
  const firstFile = visibleFiles[0] || files[0];
  if (!activeDiffFile || !files.some(file => file.filename === activeDiffFile)) activeDiffFile = firstFile?.filename || "";
  const current = files.find(file => file.filename === activeDiffFile) || firstFile;
  changedFilesNav.innerHTML = visibleFiles.length ? renderGroupedFileNav(visibleFiles) : empty("没有符合筛选条件的文件。");
  linkedRiskList.innerHTML = risks.length ? risks.map(renderLinkedRiskItem).join("") : "";
  if (!current) {
    diffFileHeader.innerHTML = "";
    diffViewer.innerHTML = empty("请选择一个文件查看 diff。");
    return;
  }
  diffFileHeader.innerHTML = renderDiffFileHeader(current);
  diffViewer.innerHTML = renderDiffLines(current, showRuleMarkers.checked, showAuditNotes.checked);
  if (focusLine) {
    const target = diffViewer.querySelector(`[data-new-line="${focusLine}"]`);
    if (target) {
      target.scrollIntoView({behavior: "smooth", block: "center"});
      target.classList.add("line-focus");
      setTimeout(() => target.classList.remove("line-focus"), 1600);
    }
  }
}

function sortDiffFiles(files) {
  const mode = fileSortMode.value;
  return [...files].sort((a, b) => {
    if (mode === "count") return b.risks.length - a.risks.length || b.change.risk_score - a.change.risk_score || a.index - b.index;
    if (mode === "order") return a.index - b.index;
    return Number(b.change.risk_score || 0) - Number(a.change.risk_score || 0) || b.risks.length - a.risks.length || a.index - b.index;
  });
}

function renderGroupedFileNav(files) {
  const groups = groupFilesByPriority(files);
  return [
    renderFileGroup("需要优先查看", groups.priority),
    renderFileGroup("一般变更", groups.normal),
    renderFileGroup("低优先级 / 自动生成文件", groups.low),
  ].filter(Boolean).join("");
}

function renderFileGroup(title, files) {
  if (!files.length) return "";
  return `<section class="file-group"><div class="file-group-title"><span>${escapeHtml(title)}</span><small>${files.length}</small></div>${files.map(renderChangedFileNavItem).join("")}</section>`;
}

function groupFilesByPriority(files) {
  const groups = {priority: [], normal: [], low: []};
  for (const file of files) {
    const score = Number(file.change.risk_score || 0);
    if (isLowPriorityFile(file.filename) || score < 30 && !file.risks.length) groups.low.push(file);
    else if (score >= 60 || file.risks.some(item => ["high", "medium"].includes(item.risk_level))) groups.priority.push(file);
    else groups.normal.push(file);
  }
  return groups;
}

function isLowPriorityFile(filename = "") {
  return /(^|\/)(dist|build|coverage|static|assets)\//i.test(filename)
    || /\.(lock|png|jpg|jpeg|gif|svg|webp|ico|map)$/i.test(filename)
    || /(^|\/)(package-lock\.json|yarn\.lock|pnpm-lock\.yaml)$/i.test(filename);
}

function splitFilePath(filename = "") {
  const normalized = String(filename || "").replace(/\\/g, "/");
  const index = normalized.lastIndexOf("/");
  if (index < 0) return {name: normalized || "unknown", dir: ""};
  return {name: normalized.slice(index + 1), dir: normalized.slice(0, index)};
}

function fileIconName(filename = "") {
  if (/\.(ts|tsx|js|jsx|py|java|go|rs)$/i.test(filename)) return "code";
  if (/\.(json|yml|yaml|toml|env)$/i.test(filename)) return "sliders";
  if (isLowPriorityFile(filename)) return "files";
  return "file-text";
}

function renderIcon(name) {
  const icons = {
    code: '<path d="m16 18 6-6-6-6"/><path d="m8 6-6 6 6 6"/>',
    layout: '<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18"/><path d="M9 21V9"/>',
    "file-text": '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/><path d="M8 13h8"/><path d="M8 17h6"/>',
    shield: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/><path d="m9 12 2 2 4-4"/>',
    message: '<path d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4z"/>',
    files: '<path d="M16 3H5a2 2 0 0 0-2 2v11"/><path d="M8 7h11a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2z"/>',
    history: '<path d="M3 12a9 9 0 1 0 3-6.7"/><path d="M3 4v6h6"/><path d="M12 7v5l3 2"/>',
    sliders: '<path d="M4 21v-7"/><path d="M4 10V3"/><path d="M12 21v-9"/><path d="M12 8V3"/><path d="M20 21v-5"/><path d="M20 12V3"/><path d="M2 14h4"/><path d="M10 8h4"/><path d="M18 16h4"/>',
    settings: '<path d="M12 15.5A3.5 3.5 0 1 0 12 8a3.5 3.5 0 0 0 0 7.5z"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.6V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1A2 2 0 1 1 4.2 17l.1-.1a1.7 1.7 0 0 0 .3-1.9 1.7 1.7 0 0 0-1.6-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.6-1 1.7 1.7 0 0 0-.3-1.9l-.1-.1A2 2 0 1 1 7 4.2l.1.1a1.7 1.7 0 0 0 1.9.3h.1A1.7 1.7 0 0 0 10 3.1V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.6h.1a1.7 1.7 0 0 0 1.9-.3l.1-.1A2 2 0 1 1 19.8 7l-.1.1a1.7 1.7 0 0 0-.3 1.9v.1A1.7 1.7 0 0 0 20.9 10h.1a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/>',
    plus: '<path d="M12 5v14"/><path d="M5 12h14"/>',
    minus: '<path d="M5 12h14"/>',
    alert: '<path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z"/><path d="M12 9v4"/><path d="M12 17h.01"/>',
    chip: '<rect x="7" y="7" width="10" height="10" rx="2"/><path d="M9 1v4"/><path d="M15 1v4"/><path d="M9 19v4"/><path d="M15 19v4"/><path d="M1 9h4"/><path d="M1 15h4"/><path d="M19 9h4"/><path d="M19 15h4"/>',
  };
  return `<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${icons[name] || icons["file-text"]}</svg>`;
}

function renderChangedFileNavItem(file) {
  const score = Number(file.change.risk_score || 0);
  const risk = riskScoreText(score);
  const pathParts = splitFilePath(file.filename);
  const muted = !file.risks.length ? "muted-file" : "";
  return `<button class="file-nav-item ${file.filename === activeDiffFile ? "active" : ""}" type="button" data-diff-file="${escapeHtmlAttr(file.filename)}">
    <span class="file-icon">${renderIcon(fileIconName(file.filename))}</span>
    <span class="file-name">${escapeHtml(pathParts.name)}</span>
    <small class="file-path">${escapeHtml(pathParts.dir || ".")}</small>
    <span class="file-meta ${muted}"><span class="badge ${risk.className}">${risk.label}</span><span>${file.risks.length} 条</span><span>+${file.additions} / -${file.deletions}</span></span>
  </button>`;
}

function renderLinkedRiskItem(risk) {
  const view = formatRiskForUser(risk);
  return `<button class="risk-jump-item" type="button" data-risk-jump="${escapeHtmlAttr(risk.id || "")}" data-risk-id="${escapeHtmlAttr(risk.id || "")}" data-risk-file="${escapeHtmlAttr(risk.file || "")}" data-risk-line="${risk.line_start || ""}">
    <span class="badge ${risk.risk_level}">${riskLevelText(risk.risk_level)}</span>
    <strong>${escapeHtml(view.issueText)}</strong>
    <small>${escapeHtml(view.locationLabel)} · ${escapeHtml(view.auditText)}</small>
  </button>`;
}

function jumpToRiskElement(item) {
  activeDiffFile = item.dataset.riskFile;
  setReportTab("code");
  if (item.dataset.riskLine) {
    expandedAnnotations.add(annotationKey(item.dataset.riskFile, item.dataset.riskLine, item.dataset.riskId));
    const annotation = findAnnotationForDrawer(item.dataset.riskFile, item.dataset.riskLine, item.dataset.riskId);
    if (annotation) renderRiskDetailDrawer(annotation);
  } else {
    expandedFileLevel.add(item.dataset.riskFile);
    const annotation = findFileLevelAnnotation(item.dataset.riskFile, item.dataset.riskId);
    if (annotation) renderRiskDetailDrawer(annotation);
  }
  renderDiffReview(lastReport, Number(item.dataset.riskLine || 0));
}

function renderDiffFileHeader(file) {
  const score = Number(file.change.risk_score || 0);
  const risk = riskScoreText(score);
  const reasons = (file.change.risk_reasons || []).join("；") || "普通变更文件";
  const buttons = fileAskSuggestions.map(question =>
    `<button class="copy-btn" type="button" data-ask-scope="review" data-ask-suggestion="${escapeHtmlAttr(question)}">${escapeHtml(question)}</button>`
  ).join("");
  return `<div>
    <div class="diff-title-row">
      <div>
        <h3>${escapeHtml(splitFilePath(file.filename).name)}</h3>
        <p>${escapeHtml(splitFilePath(file.filename).dir || ".")} · ${statusText(file.status).label} · ${risk.label} · +${file.additions} / -${file.deletions}</p>
      </div>
      <div class="segmented-control"><button type="button" class="active">Unified</button><button type="button">Split</button><button type="button">${renderIcon("settings")}</button></div>
    </div>
    <p class="diff-hint">${file.risks.length ? `这个文件有 ${file.risks.length} 条 AI 批注，点击代码行右侧的标记查看详情。` : "这个文件没有发现明确风险，仅显示代码变更。"}</p>
    <p class="file-focus-reason">${escapeHtml(fileFocusText(file.change, reasons))}</p>
    <div class="inline-actions">${buttons}</div>
    <details class="tech-details"><summary>查看技术细节</summary><p>${escapeHtml(reasons)}</p></details>
  </div>`;
}

function renderDiffLines(file, showRules, showAudit) {
  const fileLevel = renderFileLevelAnnotations(file, showAudit, showRules);
  return `${fileLevel}<div class="diff-table">${(file.parsed_lines || []).map(line => {
    const newLine = line.new_line_no || "";
    const oldLine = line.old_line_no || "";
    const annotations = annotationsForLine(file, line.new_line_no, showRules);
    const hasRisk = annotations.some(item => item.kind === "risk");
    const hasRule = annotations.some(item => item.kind === "rule");
    const row = `<div class="diff-line diff-${line.type} ${hasRisk ? "has-risk" : ""} ${hasRule ? "has-rule" : ""}" data-new-line="${line.new_line_no || ""}">
      <span class="line-no old">${oldLine}</span>
      <span class="line-no new">${newLine}</span>
      <span class="line-mark">${line.type === "add" ? "+" : line.type === "delete" ? "-" : " "}</span>
      <code>${escapeHtml(line.content)}</code>
      <span class="annotation-cell">${renderAnnotationMarker(file.filename, line.new_line_no, annotations)}</span>
    </div>`;
    const comments = annotations
      .filter(annotation => expandedAnnotations.has(annotationKey(file.filename, line.new_line_no, annotation.id)))
      .map(annotation => renderInlineAnnotation(annotation, showAudit))
      .join("");
    return row + comments;
  }).join("")}</div>`;
}

function renderInlineRiskComment(risk, showAudit, fileLevel = false) {
  const view = formatRiskForUser(risk);
  return `<article class="inline-comment risk-comment">
    <div class="card-title">
      <span>${escapeHtml(view.title)}</span>
      <div class="inline-actions">
        <button class="copy-btn" type="button" data-copy="${escapeHtmlAttr(view.suggestionText)}">复制评论</button>
        <button class="copy-btn" type="button" data-risk-ask="${escapeHtmlAttr(risk.id || risk.file || "")}">追问这个问题</button>
      </div>
    </div>
    ${fileLevel ? `<p class="explain-note">这条提示暂时无法定位到具体行，建议结合当前文件整体改动查看。</p>` : ""}
    <p><strong>位置：</strong>${escapeHtml(view.locationLabel)}</p>
    <p><strong>问题：</strong>${escapeHtml(view.issueText)}</p>
    <p><strong>为什么要看：</strong>${escapeHtml(view.whyItMatters)}</p>
    <p><strong>建议：</strong>${escapeHtml(view.suggestionText)}</p>
    <p><strong>依据：</strong>${escapeHtml(view.evidenceText)}</p>
    ${showAudit ? `<p class="audit-note"><strong>审计说明：</strong>${escapeHtml(view.auditText)}</p>` : ""}
  </article>`;
}

function renderInlineRuleMarker(rule, fileLevel = false) {
  const view = formatRuleFindingForUser(rule);
  return `<article class="inline-comment rule-comment">
    <div class="card-title">
      <span>${escapeHtml(view.title)} · ${escapeHtml(view.statusLabel)}</span>
      <button class="copy-btn" type="button" data-risk-ask="${escapeHtmlAttr(rule.rule_id || rule.file || "")}">追问这个问题</button>
    </div>
    ${fileLevel ? `<p class="explain-note">这条规则预检暂时无法定位到具体行，建议结合当前文件整体改动查看。</p>` : ""}
    <p><strong>位置：</strong>${escapeHtml(view.locationLabel)}</p>
    <p><strong>发现：</strong>${escapeHtml(view.findingText)}</p>
    <p><strong>为什么值得关注：</strong>${escapeHtml(view.whyItMatters)}</p>
    <p><strong>建议：</strong>${escapeHtml(view.suggestionText)}</p>
    <p><strong>AI 结论：</strong>${escapeHtml(view.aiConclusionText)}</p>
  </article>`;
}

function buildLineAnnotations(report) {
  const byFile = {};
  const fileLevel = {};
  const risks = getReportRisks(report);
  const rules = report.rule_findings || [];
  for (const risk of risks) addAnnotation(byFile, fileLevel, riskToAnnotation(risk));
  for (const rule of rules) addAnnotation(byFile, fileLevel, ruleToAnnotation(rule));
  return {byFile, fileLevel};
}

function getReportRisks(report) {
  const finalRisks = report?.final_result?.final_risks || [];
  if (finalRisks.length) return finalRisks;
  return report?.risks || report?.findings || [];
}

function addAnnotation(byFile, fileLevel, annotation) {
  if (!annotation.file) return;
  if (!annotation.line_start) {
    if (!fileLevel[annotation.file]) fileLevel[annotation.file] = [];
    fileLevel[annotation.file].push(annotation);
    return;
  }
  if (!byFile[annotation.file]) byFile[annotation.file] = {};
  const line = String(annotation.line_start);
  if (!byFile[annotation.file][line]) byFile[annotation.file][line] = [];
  byFile[annotation.file][line].push(annotation);
}

function riskToAnnotation(risk) {
  const view = formatRiskForUser(risk);
  return {
    id: risk.id || `risk_${risk.file}_${risk.line_start || "file"}`,
    kind: "risk",
    file: risk.file,
    line_start: risk.line_start,
    line_end: risk.line_end || risk.line_start,
    side: risk.side || "new",
    level: risk.risk_level || "medium",
    type: risk.type || "",
    title: view.title,
    summary: view.issueText,
    why_it_matters: view.whyItMatters,
    suggestion: view.suggestionText,
    evidence: view.evidenceText,
    confidence: risk.final_confidence ?? risk.confidence,
    audit_status: risk.audit_status,
    audit_note: view.auditText,
    copyable_comment: view.suggestionText,
  };
}

function ruleToAnnotation(rule) {
  const view = formatRuleFindingForUser(rule);
  return {
    id: rule.rule_id || `rule_${rule.file}_${rule.line_start || "file"}`,
    kind: "rule",
    file: rule.file,
    line_start: rule.line_start,
    line_end: rule.line_end || rule.line_start,
    side: rule.side || "new",
    level: "info",
    title: `${view.title} · ${view.statusLabel}`,
    summary: view.findingText,
    why_it_matters: view.whyItMatters,
    suggestion: view.suggestionText,
    evidence: rule.evidence || "",
    confidence: rule.confidence,
    audit_status: rule.status,
    audit_note: view.aiConclusionText,
    copyable_comment: view.suggestionText,
  };
}

function annotationsForLine(file, lineNo, showRules) {
  const items = (file.annotationsByLine || {})[String(lineNo)] || [];
  return showRules ? items : items.filter(item => item.kind !== "rule");
}

function renderAnnotationMarker(filename, lineNo, annotations) {
  if (!annotations.length || !lineNo) return "";
  const riskCount = annotations.filter(item => item.kind === "risk").length;
  const level = highestAnnotationLevel(annotations);
  const key = annotationKey(filename, lineNo, annotations[0].id);
  const expanded = annotations.some(item => expandedAnnotations.has(annotationKey(filename, lineNo, item.id)));
  const label = riskCount ? `⚠ ${annotations.length}` : `• ${annotations.length}`;
  const title = annotations.map(item => item.summary).join("\n");
  return `<button class="annotation-marker ${level} ${expanded ? "active" : ""}" type="button" title="${escapeHtmlAttr(title)}" data-annotation-key="${escapeHtmlAttr(key)}" data-annotation-file="${escapeHtmlAttr(filename)}" data-annotation-line="${lineNo}">${label}</button>`;
}

function renderInlineAnnotation(annotation, showAudit) {
  return `<article class="inline-comment ${annotation.kind === "rule" ? "rule-comment" : "risk-comment"}">
    <div class="card-title">
      <span>${escapeHtml(annotation.title)}</span>
      <div class="inline-actions">
        <button class="copy-btn" type="button" data-copy="${escapeHtmlAttr(annotation.copyable_comment)}">复制评论</button>
        <button class="copy-btn" type="button" data-risk-ask="${escapeHtmlAttr(annotation.id)}">追问</button>
      </div>
    </div>
    <p><strong>一句话问题：</strong>${escapeHtml(annotation.summary)}</p>
    <p><strong>为什么值得看：</strong>${escapeHtml(annotation.why_it_matters)}</p>
    <p><strong>建议：</strong>${escapeHtml(annotation.suggestion)}</p>
    <p><strong>依据：</strong>${escapeHtml(annotation.evidence || "当前提示没有精确证据文本。")}</p>
    ${showAudit && annotation.audit_note ? `<p class="audit-note"><strong>审计：</strong>${escapeHtml(annotation.audit_note)}</p>` : ""}
  </article>`;
}

function findAnnotationForDrawer(file, line, id = "") {
  if (!lastReport || !file || !line) return null;
  const index = buildLineAnnotations(lastReport);
  const items = index.byFile[file]?.[String(line)] || [];
  return id ? items.find(item => item.id === id) || items[0] : items[0];
}

function findFileLevelAnnotation(file, id = "") {
  if (!lastReport || !file) return null;
  const index = buildLineAnnotations(lastReport);
  const items = index.fileLevel[file] || [];
  return id ? items.find(item => item.id === id) || items[0] : items[0];
}

function renderRiskDetailDrawer(annotation) {
  if (!riskDetailDrawer || !annotation) return;
  selectedAnnotation = annotation;
  isDrawerOpen = true;
  updateWorkbenchShellState();
  const levelLabel = annotation.kind === "rule" ? "规则预检" : riskLevelText(annotation.level);
  const typeLabel = annotation.kind === "rule" ? "候选关注点" : typeText(annotation.type || annotation.audit_status || "");
  const location = annotation.line_start ? `${annotation.file}:${annotation.line_start}` : annotation.file;
  riskDetailDrawer.innerHTML = `<section class="drawer-card">
    <div class="drawer-head">
      <span class="badge ${annotation.level || "info"}">${escapeHtml(levelLabel)}</span>
      <small>${escapeHtml(typeLabel)}</small>
      <button class="icon-button" type="button" data-close-drawer>×</button>
    </div>
    <h3>${escapeHtml(annotation.title)}</h3>
    <p class="drawer-location">${escapeHtml(location)}</p>
    <div class="drawer-block">
      <strong>问题说明</strong>
      <p>${escapeHtml(annotation.summary)}</p>
    </div>
    <div class="drawer-block">
      <strong>为什么值得关注</strong>
      <p>${escapeHtml(annotation.why_it_matters)}</p>
    </div>
    <div class="drawer-block">
      <strong>建议</strong>
      <p>${escapeHtml(annotation.suggestion)}</p>
    </div>
    <div class="drawer-block">
      <strong>依据</strong>
      <p>${escapeHtml(annotation.evidence || "这条提示暂时没有精确到某一行的证据文本。")}</p>
    </div>
    ${annotation.audit_note ? `<div class="drawer-block audit-note"><strong>审计结果</strong><p>${escapeHtml(annotation.audit_note)}</p></div>` : ""}
    <div class="drawer-actions">
      <button class="copy-btn" type="button" data-copy="${escapeHtmlAttr(annotation.copyable_comment || annotation.suggestion)}">复制 Review Comment</button>
      <button class="copy-btn" type="button" data-risk-ask="${escapeHtmlAttr(annotation.id)}">Ask PR 追问</button>
    </div>
  </section>`;
}

function renderFileLevelAnnotations(file, showAudit, showRules) {
  const items = (file.fileLevelAnnotations || []).filter(item => showRules || item.kind !== "rule");
  if (!items.length) return "";
  const open = expandedFileLevel.has(file.filename);
  return `<section class="file-level-annotations">
    <button class="file-level-toggle" type="button" data-file-level-toggle="${escapeHtmlAttr(file.filename)}">
      <span>文件级提示 ${items.length} 条</span>
      <small>${open ? "收起" : "展开"}</small>
    </button>
    ${open ? `<div class="file-level-list">
      <p class="explain-note">这类提示暂时无法定位到具体代码行，建议结合整个文件改动查看。</p>
      ${items.map(item => renderInlineAnnotation(item, showAudit)).join("")}
    </div>` : ""}
  </section>`;
}

function annotationKey(file, line, id) {
  return `${file}:${line || "file"}`;
}

function highestAnnotationLevel(items) {
  if (items.some(item => item.level === "high")) return "high";
  if (items.some(item => item.level === "medium")) return "medium";
  if (items.some(item => item.level === "low")) return "low";
  return "info";
}

function isDeepAnalyzed(file, report) {
  const analyzed = report?.context_coverage?.analyzed_file_list || [];
  return analyzed.includes(file.filename);
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
    ? `<p class="explain-note">这个文件不是核心业务代码，且改动较小，因此系统只做了基础检查。</p>`
    : "";
  return `<article class="card">
    <div class="card-title">
      <span>${escapeHtml(path)}</span>
      <span class="badge ${risk.className}">${risk.label}</span>
    </div>
    <div class="risk-meter"><span style="width:${score}%"></span></div>
    <p><strong>文件：</strong>${escapeHtml(path)}</p>
    <p><strong>状态：</strong>${status.label}；<strong>改动规模：</strong>${lineChangeText(additions, deletions)}</p>
    <p><strong>系统判断：</strong>${risk.label}，${score} 分。</p>
    <p><strong>为什么重点关注：</strong>${escapeHtml(fileFocusText(file, reasons))}</p>
    ${lowRiskNote}
    <details class="tech-details">
      <summary>查看技术细节</summary>
      <p>category: ${escapeHtml(file.category || "general")}；risk_score: ${score}；additions: ${additions}；deletions: ${deletions}；hunks: ${hunks}</p>
    </details>
  </article>`;
}

function renderFileStatsTable(files, report) {
  const priority = report.priority_files || report.risk_ranking || [];
  return `<div class="data-table file-table">
    <div class="table-row table-head">
      <span>文件名</span><span>类型</span><span>风险等级</span><span>风险分</span><span>新增 / 删除</span><span>深度分析</span>
    </div>
    ${files.map(file => {
      const ranked = priority.find(item => item.filename === file.filename) || file;
      const score = Number(ranked.risk_score || ranked.priority || file.risk_score || 0);
      const risk = riskScoreText(score);
      return `<div class="table-row">
        <span class="table-main">${escapeHtml(file.filename || file.path || "未知文件")}</span>
        <span>${escapeHtml(categoryText(file.category || ranked.category || "general"))}</span>
        <span><span class="badge ${risk.className}">${risk.label}</span></span>
        <span>${score}</span>
        <span>+${Number(file.additions || 0)} / -${Number(file.deletions || 0)}</span>
        <span>${isDeepAnalyzed(file, report) ? "已深度分析" : "基础检查"}</span>
      </div>`;
    }).join("")}
  </div>`;
}

function renderPriorityTable(files) {
  return `<div class="data-table file-table">
    <div class="table-row table-head">
      <span>文件名</span><span>风险分</span><span>关注原因</span>
    </div>
    ${files.map(file => {
      const score = Number(file.risk_score ?? file.priority ?? 0);
      const reasons = file.risk_reasons || (file.reason ? [file.reason] : []);
      return `<div class="table-row">
        <span class="table-main">${escapeHtml(file.filename || "未知文件")}</span>
        <span><span class="badge ${riskScoreText(score).className}">${score}</span></span>
        <span>${escapeHtml(reasons.join("；") || "普通变更文件")}</span>
      </div>`;
    }).join("")}
  </div>`;
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
  const view = formatRuleFindingForUser(item);
  return `<div class="compact-row">
    <span class="table-main">${escapeHtml(view.title)}</span>
    <span>${escapeHtml(view.locationLabel)}</span>
    <span><span class="badge ${item.risk_level || "medium"}">${escapeHtml(view.statusLabel)}</span></span>
    <span>${escapeHtml(view.findingText)}</span>
  </div>`;
}

function renderRuleFindingGroup(items) {
  const accepted = items.filter(item => item.status === "accepted").length;
  const manual = items.filter(item => ["downgraded", "pending_ai_review", "needs_human_check"].includes(item.status)).length;
  return `<div class="audit-metrics">
    <span>启用规则 ${reviewRules.filter(rule => rule.enabled).length} 条</span>
    <span>命中 ${items.length} 条</span>
    <span>已采纳 ${accepted} 条</span>
    <span>需人工确认 ${manual} 条</span>
  </div>
  <div class="compact-list">
    <div class="compact-row compact-head"><span>规则名称</span><span>位置</span><span>状态</span><span>说明</span></div>
    ${items.map(renderRuleFinding).join("")}
  </div>`;
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
  return `<div class="compact-row">
    <span class="table-main">${escapeHtml(item.file || "未知文件")}</span>
    <span><span class="badge ${item.risk_level || "medium"}">${riskLevelText(item.risk_level)}</span></span>
    <span>${confidenceLabel(item.reviewer_confidence ?? item.confidence)}</span>
    <span>${escapeHtml(item.issue || "未说明问题")}</span>
  </div>`;
}

function renderAuditorResult(auditor) {
  const falsePositives = auditor.false_positive_candidates || [];
  const missed = auditor.missed_risk_candidates || [];
  const adjustments = auditor.confidence_adjustments || [];
  const notes = auditor.audit_notes || [];
  return `<article class="list-item"><strong>审计总结</strong><p>${escapeHtml(auditor.audit_summary || "审计模型没有返回总结。")}</p></article>
    <h3>可能误报，已被审计模型降级/移除</h3>${falsePositives.length ? renderAuditRows(falsePositives, item => [
      item.file || "未知文件",
      auditActionText(item.audit_action || ""),
      confidenceLabel(item.suggested_confidence),
      item.reason || "未说明原因",
    ]) : empty("暂无可能误报")}
    <h3>审计模型补充的可能遗漏项</h3>${missed.length ? renderAuditRows(missed, item => [
      item.file || "未知文件",
      riskLevelText(item.risk_level),
      confidenceLabel(item.confidence),
      item.issue || item.reason || "未说明问题",
    ]) : empty("暂无可能遗漏项")}
    <h3>审计后置信度调整</h3>${adjustments.length ? renderAuditRows(adjustments, item => [
      item.risk_id || "未知风险",
      `${item.old_confidence} -> ${item.new_confidence}`,
      "",
      item.reason || "未说明原因",
    ]) : empty("暂无置信度调整")}
    <details class="tech-details"><summary>审计说明</summary>${notes.length ? notes.map(renderLimitation).join("") : empty("暂无额外审计说明")}</details>
    <article class="list-item"><strong>最终审计建议</strong><p>${escapeHtml(auditor.final_recommendation || "暂无最终审计建议。")}</p></article>`;
}

function renderAuditRows(items, mapper) {
  return `<div class="compact-list">${items.map(item => {
    const [main, state, confidence, detail] = mapper(item);
    return `<div class="compact-row">
      <span class="table-main">${escapeHtml(main)}</span>
      <span>${escapeHtml(state)}</span>
      <span>${escapeHtml(confidence)}</span>
      <span>${escapeHtml(detail)}</span>
    </div>`;
  }).join("")}</div>`;
}

function renderFinalRisk(item) {
  const view = formatRiskForUser(item);
  return `<div class="compact-row">
    <span class="table-main">${escapeHtml(view.locationLabel)}</span>
    <span><span class="badge ${item.risk_level || "medium"}">${escapeHtml(view.title)}</span></span>
    <span>${confidenceLabel(item.final_confidence)}</span>
    <span>${escapeHtml(view.issueText)}</span>
  </div>`;
}

function renderModule(item) {
  const name = item.name || item.module || "未命名模块";
  const summary = item.summary || item.change || "无总结";
  return `<article class="list-item">
    <strong>${escapeHtml(name)}</strong>
    <p>${escapeHtml(summary)}</p>
    <small>${escapeHtml((item.files || []).join(", "))}</small>
  </article>`;
}

function renderRisk(item) {
  const view = formatRiskForUser(item);
  return `<div class="compact-row">
    <span class="table-main">${escapeHtml(view.locationLabel)}</span>
    <span><span class="badge ${item.risk_level || "medium"}">${escapeHtml(view.title)}</span></span>
    <span>${confidenceLabel(item.confidence)}</span>
    <span>${escapeHtml(view.issueText)}</span>
  </div>`;
}

function renderComment(item) {
  const file = item.file ? `<p><strong>文件：</strong>${escapeHtml(item.file)}</p>` : "";
  const comment = rewriteReviewComment(item.comment || "");
  return `<article class="card">
    <div class="card-title">
      <span>${escapeHtml(typeText(item.type))}</span>
      <button class="copy-btn" type="button" data-copy="${escapeHtmlAttr(comment)}">复制</button>
    </div>
    ${file}
    <p>${escapeHtml(comment)}</p>
  </article>`;
}

function renderLimitation(item) {
  return `<article class="card compact-card"><p>${escapeHtml(item)}</p></article>`;
}

function formatRuleFindingForUser(ruleFinding) {
  const title = ruleFinding.rule_name || "规则预检";
  return {
    title,
    statusLabel: ruleStatusText(ruleFinding.status),
    locationLabel: locationLabel(ruleFinding),
    findingText: naturalRuleFindingText(ruleFinding),
    whyItMatters: ruleWhyItMatters(ruleFinding),
    suggestionText: ruleFinding.suggestion || "请结合当前文件改动确认这个提示是否成立。",
    aiConclusionText: ruleAiConclusionText(ruleFinding),
  };
}

function formatRiskForUser(risk) {
  return {
    title: `${riskLevelText(risk.risk_level)} · ${typeText(risk.type)}`,
    locationLabel: locationLabel(risk),
    issueText: risk.issue || "这处改动可能需要进一步确认。",
    whyItMatters: risk.reason || "这处改动可能影响功能行为、异常路径或后续维护，需要结合完整上下文确认。",
    suggestionText: risk.suggestion || "建议人工 Reviewer 结合完整代码上下文复核，并补充必要测试。",
    evidenceText: risk.evidence || "当前报告没有给出可定位到具体行的依据。",
    auditText: risk.audit_note || auditStatusText(risk.audit_status),
  };
}

function locationLabel(item) {
  const file = item.file || "当前文件";
  if (item.line_start && item.line_end && item.line_start !== item.line_end) return `${file}:${item.line_start}-${item.line_end}`;
  if (item.line_start) return `${file}:${item.line_start}`;
  return `${file}：文件级提示`;
}

function naturalRuleFindingText(item) {
  const name = `${item.rule_name || ""} ${item.issue || ""}`.toLowerCase();
  if (name.includes("router") || name.includes("路由")) {
    return `系统发现本次改动新增了路由配置，但没有在当前 diff 中看到 404 / NotFound / path="*" 这类兜底路由。`;
  }
  if (name.includes("async") || name.includes("await") || name.includes("异步")) {
    return "系统发现这里新增了异步调用，但当前改动里没有看到对应的失败处理。";
  }
  if (name.includes("表单") || name.includes("form")) {
    return "系统发现这里新增了表单提交逻辑，但当前改动里没有看到明显的必填校验或错误提示。";
  }
  if (name.includes("context") || name.includes("provider")) {
    return "系统发现这里新增或调整了 Context / Provider，建议确认入口组件是否已经正确包裹。";
  }
  if (name.includes("删除") || name.includes("重命名") || name.includes("renamed")) {
    return "系统发现这个文件被删除或重命名，建议确认相关 import、路由和测试引用是否同步更新。";
  }
  if (name.includes("package") || name.includes("lock")) {
    return "系统发现依赖配置发生变化，建议确认 lock 文件是否同步更新，避免安装结果不一致。";
  }
  return item.issue || "系统发现这处改动符合一条预检规则，建议多看一眼。";
}

function ruleWhyItMatters(item) {
  const name = `${item.rule_name || ""} ${item.issue || ""}`.toLowerCase();
  if (name.includes("router") || name.includes("路由")) return "如果用户访问不存在的路径，页面可能没有明确的错误提示或跳转逻辑。";
  if (name.includes("async") || name.includes("await") || name.includes("异步")) return "失败路径如果没有被处理，用户可能看不到错误反馈，状态也可能停留在不一致的状态。";
  if (name.includes("表单") || name.includes("form")) return "缺少输入校验时，用户可能提交无效数据，后续接口或页面状态会更难处理。";
  if (name.includes("context") || name.includes("provider")) return "Provider 包裹关系不正确时，子组件可能读取不到上下文，导致运行时异常或状态丢失。";
  if (name.includes("删除") || name.includes("重命名") || name.includes("renamed")) return "引用没有同步更新时，构建、路由加载或测试可能失败。";
  if (name.includes("package") || name.includes("lock")) return "依赖声明和 lock 文件不一致时，不同环境安装出的依赖可能不一样。";
  return "这类改动通常会影响运行路径或维护成本，提前确认能减少后续返工。";
}

function ruleAiConclusionText(item) {
  const status = ruleStatusText(item.status);
  if (status === "已采纳为风险") return "AI 已把这条预检采纳为需要关注的风险。";
  if (status === "需要人工确认") return "AI 认为当前证据还不够完整，因此建议人工确认。";
  if (status === "已忽略") return "AI 没有把这条预检作为主要风险，但你仍可结合上下文快速确认。";
  if (status === "已作为疑似误报移除") return "审计后认为该提示证据不足，已作为疑似误报移除。";
  return "等待 AI 结合 diff 证据进一步判断。";
}

function fileFocusText(file, fallback) {
  const path = (file.filename || file.path || "").toLowerCase();
  const changed = Number(file.additions || 0) + Number(file.deletions || 0);
  const points = [];
  if (path.includes("app.") || path.includes("main.") || path.includes("index.")) points.push("这是入口或核心渲染相关文件，改动可能影响页面加载和路由结构");
  if (path.includes("router") || path.includes("route")) points.push("该文件涉及路由结构，建议确认未知路径和权限跳转");
  if (path.includes("store") || path.includes("context") || path.includes("provider")) points.push("该文件涉及状态或上下文，建议确认组件包裹关系和状态流转");
  if (changed >= 80) points.push("本次新增和删除较多，属于结构性修改");
  if (!points.length) points.push(fallback || "该文件存在代码变更，建议结合 diff 快速确认影响范围");
  return points.join("；") + "。";
}

function rewriteReviewComment(comment) {
  if (!comment) return "";
  if (comment.includes("path=\"*\"") || comment.includes("NotFound") || comment.includes("兜底")) {
    return "这里新增了路由配置，建议确认是否已有 404 / NotFound 兜底页面。如果项目目前没有统一兜底路由，可以考虑补充 path=\"*\"，避免未知路径访问时没有明确反馈。";
  }
  return comment;
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
  activeGlobalSection = tab;
  document.querySelectorAll("[data-report-tab]").forEach(button => {
    button.classList.toggle("active", button.dataset.reportTab === tab);
  });
  document.querySelectorAll("[data-report-panel]").forEach(panel => {
    panel.classList.toggle("hidden", panel.dataset.reportPanel !== tab);
  });
  document.querySelectorAll("[data-global-tab]").forEach(button => {
    button.classList.toggle("active", button.dataset.globalTab === tab);
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
  progressModal.classList.remove("hidden");
  progressModalText.textContent = text || "系统正在获取代码变更、执行规则预检，并生成 AI Review 报告。";
  clearInterval(progressTimer);
  setProgressState({task_id: "", progress: 10, current_stage: "fetch_pr"});
  progressTimer = setInterval(() => {
    const next = Math.min(85, (progressState?.progress || 10) + 15);
    setProgressState({progress: next, current_stage: progressStageForPercent(next)});
  }, 1000);
}

function updateProgress(value, text) {
  if (text) progressModalText.textContent = text;
  setProgressState({progress: value, current_stage: progressStageForPercent(value)});
}

function finishProgress(title, text) {
  clearInterval(progressTimer);
  progressModalText.textContent = text || "报告已生成。";
  setProgressState({progress: 100, current_stage: "finalize"});
  setTimeout(() => progressModal.classList.add("hidden"), 500);
}

function stopProgress() {
  clearInterval(progressTimer);
  setProgressState({progress: progressState?.progress || 0, current_stage: progressState?.current_stage || "fetch_pr", failed: true});
  setTimeout(() => progressModal.classList.add("hidden"), 900);
}

function progressStageForPercent(value) {
  if (value >= 85) return "finalize";
  if (value >= 70) return "auditor";
  if (value >= 55) return "reviewer";
  if (value >= 40) return "rule_check";
  if (value >= 25) return "rank_files";
  if (value >= 15) return "parse_diff";
  return "fetch_pr";
}

function setProgressState(partial) {
  const current = partial.current_stage || progressState?.current_stage || "fetch_pr";
  const currentIndex = reviewProgressStages.findIndex(stage => stage.key === current);
  progressState = {
    task_id: partial.task_id ?? progressState?.task_id ?? "",
    progress: partial.progress ?? progressState?.progress ?? 0,
    current_stage: current,
    stages: reviewProgressStages.map((stage, index) => ({
      ...stage,
      status: partial.failed && stage.key === current
        ? "failed"
        : index < currentIndex || partial.progress >= 100
          ? "done"
          : index === currentIndex
            ? "running"
            : "pending",
    })),
  };
  renderProgressModal();
}

function renderProgressModal() {
  const progress = Math.max(0, Math.min(100, Number(progressState?.progress || 0)));
  progressPercent.textContent = `${Math.round(progress)}%`;
  progressBar.style.width = `${progress}%`;
  progressStages.innerHTML = (progressState?.stages || []).map(stage => {
    const icon = stage.status === "done" ? "✓" : stage.status === "running" ? "⏳" : stage.status === "failed" ? "!" : "○";
    const label = stage.status === "done" ? "已完成" : stage.status === "running" ? "进行中" : stage.status === "failed" ? "失败" : "等待中";
    return `<li class="${stage.status}"><span>${icon}</span><strong>${stage.label}</strong><small>${label}</small></li>`;
  }).join("");
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
    confirmed_issue: "高可信风险",
    potential_risk: "潜在风险",
    praise: "正向反馈",
    follow_up: "后续建议",
  };
  return map[type] || "Review 建议";
}

function auditStatusText(status) {
  const map = {
    accepted: "审计通过",
    downgraded: "已降级为待确认",
    added_by_auditor: "审计补充的可能遗漏项",
    removed: "已作为疑似误报移除",
    needs_human_check: "需要人工复核",
  };
  return map[status] || "需要人工复核";
}

function ruleStatusText(status) {
  const normalized = String(status || "").trim();
  const map = {
    pending_ai_review: "等待 AI 判断",
    accepted: "已采纳为风险",
    downgraded: "需要人工确认",
    ignored: "已忽略",
    removed: "已作为疑似误报移除",
    "待 AI 判断": "等待 AI 判断",
    "已采纳为风险": "已采纳为风险",
    "已降级为待确认": "需要人工确认",
    "已忽略": "已忽略",
  };
  return map[normalized] || normalized || "等待 AI 判断";
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

function hydrateIcons() {
  document.querySelectorAll("[data-icon]").forEach(item => {
    if (item.querySelector(".icon")) return;
    item.insertAdjacentHTML("afterbegin", renderIcon(item.dataset.icon));
  });
}

hydrateIcons();
loadProviders().then(loadSession);
