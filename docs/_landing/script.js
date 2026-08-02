/* ============================================================
   discli 首頁 — 腳本
   ============================================================ */

// --- 複製安裝指令 ---
window.copyInstall = function () {
  navigator.clipboard.writeText('pip install discord-cli-agent').then(function () {
    var pill = document.getElementById('installPill');
    if (pill) {
      pill.setAttribute('data-copied', 'true');
      setTimeout(function () { pill.removeAttribute('data-copied'); }, 1500);
    }
  });
};

// --- 複製程式碼片段 ---
window.copyCode = function () {
  var el = document.getElementById('codeSnippet');
  if (!el) return;
  var text = el.textContent || el.innerText;
  navigator.clipboard.writeText(text).then(function () {
    var label = document.getElementById('codeCopyLabel');
    if (label) {
      label.textContent = 'Copied!';
      setTimeout(function () { label.textContent = 'Copy'; }, 2000);
    }
  });
};

// --- 首頁動態主控台動畫 ---
(function () {
  var body = document.getElementById('termBody');
  if (!body) return;

  var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var lines = body.querySelectorAll('.tl');
  var cursor = body.querySelector('.t-cursor');

  // 若啟用降低動態效果，立即顯示所有內容
  if (reducedMotion) {
    lines.forEach(function (l) { l.style.opacity = '1'; });
    return;
  }

  function run() {
  // 隱藏全部列
    lines.forEach(function (l) {
      l.style.transition = 'none';
      l.style.opacity = '0';
    });

    // 依照 data-delay 逐列顯示
    lines.forEach(function (line, i) {
      var delay = parseInt(line.getAttribute('data-delay'), 10);
      if (isNaN(delay)) delay = i * 600;

      setTimeout(function () {
        line.style.transition = 'opacity 0.4s ease';
        line.style.opacity = '1';
      }, delay);
    });

    // 取得最長延遲並在暫停後重複播放
    var maxDelay = 0;
    lines.forEach(function (l) {
      var d = parseInt(l.getAttribute('data-delay'), 10) || 0;
      if (d > maxDelay) maxDelay = d;
    });

    setTimeout(run, maxDelay + 4000);
  }

  run();
})();
