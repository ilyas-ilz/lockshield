/* Top progress bar page loader — self-contained, include in <head>. */
(function () {
  'use strict';
  if (window.__lsLoader) return;
  window.__lsLoader = true;

  var css = ''
    + '#ls-bar{position:fixed;top:0;left:0;height:3px;width:0;z-index:99999;'
    + 'background:linear-gradient(90deg,#e52629,#ff7a45);'
    + 'box-shadow:0 0 8px rgba(229,38,41,.5);border-radius:0 2px 2px 0;'
    + 'transition:width .25s ease,opacity .4s ease;}'
    + '@media (prefers-reduced-motion:reduce){#ls-bar{transition:none}}';

  var style = document.createElement('style');
  style.textContent = css;
  document.head.appendChild(style);

  var bar = document.createElement('div');
  bar.id = 'ls-bar';
  bar.setAttribute('aria-hidden', 'true');
  (document.body || document.documentElement).appendChild(bar);

  // trickle toward 90% until real load event lands
  var progress = 0;
  var timer = setInterval(function () {
    progress += (90 - progress) * 0.15;
    bar.style.width = progress + '%';
  }, 200);

  function done() {
    clearInterval(timer);
    bar.style.width = '100%';
    setTimeout(function () {
      bar.style.opacity = '0';
      setTimeout(function () { bar.remove(); }, 450);
    }, 200);
  }
  // complete at DOM ready, not window.load — lazy images must not hold the bar
  if (document.readyState !== 'loading') done();
  else document.addEventListener('DOMContentLoaded', done);
  // ponytail: 5s cap — stalled parse never leaves bar hanging
  setTimeout(done, 5000);
})();
