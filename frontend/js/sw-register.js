// Service-worker registration. Extracted from inline <script> so strict CSP
// (script-src 'self') can keep blocking inline scripts.
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js');

  // When a freshly deployed service worker takes control, reload once so the
  // page swaps to the new JS/CSS without the user having to clear anything.
  // Only reload if a worker was already controlling this page (an update) so
  // the very first install doesn't trigger a needless reload. The flag guards
  // against a reload loop.
  const hadController = !!navigator.serviceWorker.controller;
  let reloadingForNewWorker = false;
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (!hadController || reloadingForNewWorker) return;
    reloadingForNewWorker = true;
    window.location.reload();
  });
}
