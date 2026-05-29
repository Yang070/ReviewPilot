const prUrl = document.querySelector("#prUrl");
const diffInput = document.querySelector("#diffInput");
const reviewBtn = document.querySelector("#reviewBtn");
const sampleBtn = document.querySelector("#sampleBtn");
const statusBox = document.querySelector("#status");
const reportTitle = document.querySelector("#reportTitle");
const summaryText = document.querySelector("#summaryText");
const riskBadge = document.querySelector("#riskBadge");
const fileCount = document.querySelector("#fileCount");
const evidenceCount = document.querySelector("#evidenceCount");
const findingCount = document.querySelector("#findingCount");
const filesBox = document.querySelector("#files");
const findingsBox = document.querySelector("#findings");
const testsBox = document.querySelector("#tests");

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

sampleBtn.addEventListener("click", () => {
  diffInput.value = sampleDiff;
  prUrl.value = "";
});

reviewBtn.addEventListener("click", async () => {
  setStatus("评审中...");
  reviewBtn.disabled = true;
  try {
    const res = await fetch("/api/review", {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({prUrl: prUrl.value.trim(), diff: diffInput.value}),
    });
    const data = await res.json();
    if (!res.ok || data.error) throw new Error(data.error || "评审失败");
    renderReport(data);
    setStatus("完成");
  } catch (err) {
    setStatus(err.message);
  } finally {
    reviewBtn.disabled = false;
  }
});

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
    <p>+${file.additions} / -${file.deletions}, ${file.hunks} hunks</p>
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

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}
