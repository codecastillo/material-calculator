// Service-worker registration. Extracted from inline <script> so strict CSP
// (script-src 'self') can keep blocking inline scripts.
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js');
}
