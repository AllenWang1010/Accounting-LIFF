const liffId = "2008940948-Zs6T1r82"; // 在 LINE Developers 拿到後貼進來
const apiUrl =
  "https://dalene-phylar-ruttily.ngrok-free.dev/webhook/reports-demo";

let chartInstance = null;

const START_YEAR = 1911;
const now = new Date();
const CURRENT_YEAR = now.getFullYear();
const CURRENT_MONTH = now.getMonth() + 1; // 1-12

let selectedYear = CURRENT_YEAR;
let selectedMonth = CURRENT_MONTH; // 1-12

// ---- 月份選擇器 UI ----
function initMonthPicker() {
  const yearLabel = document.getElementById("yearLabel");
  const monthGrid = document.getElementById("monthGrid");
  const monthDisplayText = document.getElementById("monthDisplayText");
  const monthPanel = document.getElementById("monthPanel");
  const monthToggleBtn = document.getElementById("monthToggleBtn");
  const yearPrevBtn = document.getElementById("yearPrevBtn");
  const yearNextBtn = document.getElementById("yearNextBtn");

  // 產生 12 個月份按鈕
  monthGrid.innerHTML = "";
  for (let m = 1; m <= 12; m++) {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "month-btn";
    btn.dataset.month = m;
    btn.textContent = m + "月";
    monthGrid.appendChild(btn);
  }

  function updateYearLabel() {
    yearLabel.textContent = selectedYear;
  }

  function updateMonthHighlight() {
    const buttons = monthGrid.querySelectorAll(".month-btn");
    buttons.forEach((btn) => {
      const m = Number(btn.dataset.month);
      btn.classList.toggle(
        "active",
        m === selectedMonth && selectedYear === getSelectedYear(),
      );
    });
  }

  function getSelectedYear() {
    return selectedYear;
  }

  function updateDisplayText() {
    monthDisplayText.textContent =
      selectedYear + " 年 " + selectedMonth + " 月";
  }

  // 點按展開/收起
  monthToggleBtn.addEventListener("click", () => {
    monthPanel.classList.toggle("open");
  });

  // 年份導航
  yearPrevBtn.addEventListener("click", () => {
    if (selectedYear > START_YEAR) {
      selectedYear--;
      updateYearLabel();
      updateMonthHighlight();
    }
  });

  yearNextBtn.addEventListener("click", () => {
    if (selectedYear < CURRENT_YEAR) {
      selectedYear++;
      updateYearLabel();
      updateMonthHighlight();
    }
  });

  // 點選月份
  monthGrid.addEventListener("click", (e) => {
    const btn = e.target.closest(".month-btn");
    if (!btn) return;
    const m = Number(btn.dataset.month);

    // 若是未來年月就不給選
    if (
      selectedYear > CURRENT_YEAR ||
      (selectedYear === CURRENT_YEAR && m > CURRENT_MONTH)
    ) {
      return;
    }

    selectedMonth = m;
    updateMonthHighlight();
    updateDisplayText();
    monthPanel.classList.remove("open");
    updateLedgerOptions();
  });

  // 初始化
  updateYearLabel();
  updateDisplayText();
  updateMonthHighlight();

  // 若點擊外面關閉面板
  document.addEventListener("click", (e) => {
    const picker = document.querySelector(".month-picker");
    if (!picker.contains(e.target)) {
      monthPanel.classList.remove("open");
    }
  });
}

function getSelectedMonthValue() {
  // 回傳 YYYY-MM 字串
  const ym = selectedYear + "-" + String(selectedMonth).padStart(2, "0");
  return ym;
}

// ---- 資料載入與主流程 ----
async function main() {
  try {
    const statusEl = document.getElementById("status");
    const userEl = document.getElementById("user");
    const apiEl = document.getElementById("api-result");

    statusEl.textContent = "Initializing LIFF...";

    // 初始化 LIFF
    await liff.init({ liffId });

    // 確保登入
    if (!liff.isLoggedIn()) {
      statusEl.textContent = "Not logged in, redirecting to login...";
      liff.login();
      return;
    }

    statusEl.textContent = "LIFF initialized.";

    // 取得使用者資訊（之後也可以把 userId 傳給 n8n 用來做個人化查詢）
    const profile = await liff.getProfile();
    userEl.textContent = `Hello, ${profile.displayName}！`;

    // 呼叫 n8n 的報表 API
    apiEl.textContent = "Loading report from n8n...";

    const res = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        // 可以先傳一些基本資訊過去，之後要區分 user 時會用到
        userId: profile.userId,
        source: "liff-demo",
      }),
    });

    if (!res.ok) {
      apiEl.textContent = `n8n API error: ${res.status} ${res.statusText}`;
      return;
    }

    records = await res.json();
    console.log("Records from n8n:", records);
    apiEl.textContent = `n8n 回應：${JSON.stringify(records)}`;
    initMonthPicker();
    // initUI();
  } catch (err) {
    console.error(err);
    const statusEl = document.getElementById("status");
    statusEl.textContent = "發生錯誤：" + err;
  }
}

main();
// loadData();
