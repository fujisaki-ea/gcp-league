// Firebase 設定
const firebaseConfig = {
  apiKey: "AIzaSyD-Li0Wdq11eWhkBzfFgOX2ZG9qzodv_94",
  projectId: "gcp-league-677e9",
  databaseURL: "https://gcp-league-677e9-default-rtdb.asia-southeast1.firebasedatabase.app",
};

// Firebase 初期化
firebase.initializeApp(firebaseConfig);
const db = firebase.database();
const D_SESSION_KEY = "D";
const D_REF = db.ref("D");

// --- sessionStorage ヘルパー ---
function getD() {
  try {
    return JSON.parse(sessionStorage.getItem(D_SESSION_KEY)) || {};
  } catch {
    return {};
  }
}

function setD(value) {
  sessionStorage.setItem(D_SESSION_KEY, JSON.stringify(value));
  renderD(value);
}

function renderD(data) {
  document.getElementById("d-display").textContent = JSON.stringify(data, null, 2);
}

// --- Firebase → sessionStorage 同期 ---
D_REF.on("value", (snapshot) => {
  const data = snapshot.val() || {};
  setD(data);
  console.log("[Firebase→sessionStorage] D 同期:", data);
});

// --- 接続状態の監視 ---
db.ref(".info/connected").on("value", (snapshot) => {
  const el = document.getElementById("status");
  if (snapshot.val()) {
    el.textContent = "Firebase: 接続中";
    el.className = "status connected";
  } else {
    el.textContent = "Firebase: 未接続";
    el.className = "status disconnected";
  }
});

// --- sessionStorage → Firebase 同期 ---
function syncDToFirebase(newD) {
  setD(newD);
  D_REF.set(newD)
    .then(() => console.log("[sessionStorage→Firebase] D 同期完了:", newD))
    .catch((err) => console.error("[Firebase] 書き込みエラー:", err));
}

// --- UI 操作 ---
function updateD() {
  const key = document.getElementById("input-key").value.trim();
  const value = document.getElementById("input-value").value.trim();
  if (!key) { alert("キーを入力してください"); return; }

  const current = getD();
  current[key] = value;
  syncDToFirebase(current);

  document.getElementById("input-key").value = "";
  document.getElementById("input-value").value = "";
}

function clearD() {
  if (!confirm("Dオブジェクトをすべてクリアしますか？")) return;
  syncDToFirebase({});
}

// --- sessionStorage の変化を他タブから検知して Firebase に反映 ---
window.addEventListener("storage", (e) => {
  if (e.key === D_SESSION_KEY && e.storageArea === sessionStorage) {
    // sessionStorage はタブ間では共有されないが、同一タブ内のコード変更を監視
    const newVal = JSON.parse(e.newValue || "{}");
    D_REF.set(newVal).catch((err) => console.error("[Firebase] 同期エラー:", err));
  }
});
