const boot = document.getElementById("boot");
const win = document.getElementById("profileWindow");
const titlebar = document.getElementById("titlebar");
const icon = document.getElementById("profileIcon");
const taskButton = document.getElementById("taskButton");
const startButton = document.getElementById("startButton");
const startMenu = document.getElementById("startMenu");
const clock = document.getElementById("clock");

const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
const desktopWide = window.matchMedia("(min-width: 800px)");

/* ===== 起動演出 ===== */
let bootTimers = [];

function playBoot() {
  bootTimers.forEach(clearTimeout);
  closeWindow();
  boot.hidden = false;
  boot.classList.remove("is-welcome", "is-done");

  if (reducedMotion.matches) {
    finishBoot();
    return;
  }
  bootTimers = [
    setTimeout(() => boot.classList.add("is-welcome"), 1600),
    setTimeout(finishBoot, 2900),
  ];
}

function finishBoot() {
  if (boot.classList.contains("is-done")) return;
  bootTimers.forEach(clearTimeout);
  boot.classList.add("is-done");
  setTimeout(() => (boot.hidden = true), reducedMotion.matches ? 0 : 400);
  openWindow();
}

boot.addEventListener("pointerdown", finishBoot);
document.addEventListener("keydown", (e) => {
  if (!boot.hidden && !boot.classList.contains("is-done")) finishBoot();
  if (e.key === "Escape") closeStartMenu();
});

/* ===== ウィンドウ ===== */
let positioned = false;

function centerWindow() {
  const w = win.offsetWidth;
  const h = win.offsetHeight;
  const areaH = window.innerHeight - taskbarHeight();
  win.style.left = `${Math.max(16, (window.innerWidth - w) / 2)}px`;
  win.style.top = `${Math.max(16, (areaH - h) / 2)}px`;
  positioned = true;
}

function taskbarHeight() {
  return document.querySelector(".taskbar").offsetHeight;
}

function setActive(active) {
  win.classList.toggle("is-inactive", !active);
  taskButton.classList.toggle("is-active", active);
}

function openWindow() {
  closeStartMenu();
  const wasHidden = win.hidden;
  win.hidden = false;
  taskButton.hidden = false;
  win.classList.remove("is-minimized");
  if (desktopWide.matches && !positioned) centerWindow();
  if (wasHidden) {
    win.classList.remove("is-opening");
    void win.offsetWidth;
    win.classList.add("is-opening");
  }
  setActive(true);
}

function minimizeWindow() {
  win.classList.add("is-minimized");
  setActive(false);
}

function closeWindow() {
  win.hidden = true;
  win.classList.remove("is-minimized", "is-maximized");
  taskButton.hidden = true;
  positioned = false;
}

function toggleMaximize() {
  if (!desktopWide.matches) return;
  win.classList.toggle("is-maximized");
  const max = win.classList.contains("is-maximized");
  win.querySelector('[data-action="maximize"]').setAttribute("aria-label", max ? "元に戻す" : "最大化");
}

win.addEventListener("animationend", () => win.classList.remove("is-opening"));

win.querySelector(".titlebar-buttons").addEventListener("click", (e) => {
  const btn = e.target.closest("[data-action]");
  if (!btn) return;
  const action = btn.dataset.action;
  if (action === "minimize") minimizeWindow();
  if (action === "maximize") toggleMaximize();
  if (action === "close") closeWindow();
});

win.addEventListener("pointerdown", () => setActive(true));
document.getElementById("desktop").addEventListener("pointerdown", (e) => {
  if (e.target === e.currentTarget) {
    if (!win.hidden && !win.classList.contains("is-minimized")) setActive(false);
    icon.classList.remove("is-selected");
  }
});

taskButton.addEventListener("click", () => {
  if (win.classList.contains("is-minimized")) openWindow();
  else if (win.classList.contains("is-inactive")) setActive(true);
  else minimizeWindow();
});

/* ドラッグ（PCのみ） */
titlebar.addEventListener("pointerdown", (e) => {
  if (!desktopWide.matches || win.classList.contains("is-maximized")) return;
  if (e.target.closest("button")) return;

  const startX = e.clientX;
  const startY = e.clientY;
  const startLeft = win.offsetLeft;
  const startTop = win.offsetTop;
  titlebar.setPointerCapture(e.pointerId);

  const onMove = (ev) => {
    const maxLeft = window.innerWidth - 80;
    const minLeft = 80 - win.offsetWidth;
    const maxTop = window.innerHeight - taskbarHeight() - titlebar.offsetHeight;
    const left = Math.min(maxLeft, Math.max(minLeft, startLeft + ev.clientX - startX));
    const top = Math.min(maxTop, Math.max(0, startTop + ev.clientY - startY));
    win.style.left = `${left}px`;
    win.style.top = `${top}px`;
  };
  const onUp = () => {
    titlebar.removeEventListener("pointermove", onMove);
    titlebar.removeEventListener("pointerup", onUp);
    titlebar.removeEventListener("pointercancel", onUp);
  };
  titlebar.addEventListener("pointermove", onMove);
  titlebar.addEventListener("pointerup", onUp);
  titlebar.addEventListener("pointercancel", onUp);
});

titlebar.addEventListener("dblclick", (e) => {
  if (!e.target.closest("button")) toggleMaximize();
});

/* 画面幅が変わったらはみ出さないように戻す */
window.addEventListener("resize", () => {
  if (!desktopWide.matches || win.hidden) return;
  if (!positioned) {
    centerWindow();
    return;
  }
  const maxLeft = window.innerWidth - 80;
  const maxTop = window.innerHeight - taskbarHeight() - titlebar.offsetHeight;
  win.style.left = `${Math.min(win.offsetLeft, maxLeft)}px`;
  win.style.top = `${Math.min(win.offsetTop, Math.max(0, maxTop))}px`;
});

/* ===== デスクトップアイコン ===== */
icon.addEventListener("click", (e) => {
  // タッチとキーボードは1回で開く。マウスはダブルクリック
  if (e.pointerType === "mouse") {
    icon.classList.add("is-selected");
    return;
  }
  icon.classList.remove("is-selected");
  openWindow();
});

icon.addEventListener("dblclick", () => {
  icon.classList.remove("is-selected");
  openWindow();
});

/* ===== スタートメニュー ===== */
function closeStartMenu() {
  startMenu.hidden = true;
  startButton.setAttribute("aria-expanded", "false");
}

startButton.addEventListener("click", () => {
  const open = startMenu.hidden;
  startMenu.hidden = !open;
  startButton.setAttribute("aria-expanded", String(open));
});

document.addEventListener("pointerdown", (e) => {
  if (!startMenu.hidden && !startMenu.contains(e.target) && !startButton.contains(e.target)) {
    closeStartMenu();
  }
});

document.getElementById("startOpenProfile").addEventListener("click", openWindow);
document.getElementById("rebootButton").addEventListener("click", () => {
  closeStartMenu();
  playBoot();
});

/* ===== 時計 ===== */
function tick() {
  const now = new Date();
  clock.textContent = now.toLocaleTimeString("ja-JP", { hour: "2-digit", minute: "2-digit" });
  clock.dateTime = now.toISOString();
}

tick();
setInterval(tick, 10000);

playBoot();
