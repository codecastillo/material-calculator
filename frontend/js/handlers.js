// Delegated event handlers — replaces inline onXxx= attributes blocked by CSP.
//
// Markup convention:
//   <button data-on-click="funcName">                  zero-arg call
//   <button data-on-click="funcName" data-args="42">   single arg (JSON-parsed if possible, else raw string)
//   <button data-on-click="funcName" data-args='[1,"x",true]'>   multi-arg (JSON array)
//   <input  data-on-keydown-enter="funcName">          Enter-key shortcut
//   <input  data-on-change="funcName">                 onchange (handler receives (...args, event); `this` is the element)
//   <a      data-on-click="funcName">                  preventDefault() is auto-applied to <a>
//
// Handlers are called as: fn.apply(element, [...parsedArgs, event])
// So inside the handler you can use `this` for the element and the last arg for the event.

(function () {
  function parseArgs(raw) {
    if (raw == null || raw === '') return [];
    if (raw.startsWith('[')) {
      try { return JSON.parse(raw); } catch (_) { /* fall through */ }
    }
    try { return [JSON.parse(raw)]; } catch (_) { return [raw]; }
  }

  function invoke(fnName, el, event) {
    if (!fnName) return;
    const fn = window[fnName];
    if (typeof fn !== 'function') {
      console.warn('[handlers] missing function:', fnName);
      return;
    }
    const args = parseArgs(el.dataset.args);
    return fn.apply(el, [...args, event]);
  }

  document.addEventListener('click', function (e) {
    const el = e.target.closest('[data-on-click]');
    if (!el) return;
    if (el.tagName === 'A') e.preventDefault();
    invoke(el.dataset.onClick, el, e);
  });

  document.addEventListener('contextmenu', function (e) {
    const el = e.target.closest('[data-on-contextmenu]');
    if (!el) return;
    e.preventDefault();
    invoke(el.dataset.onContextmenu, el, e);
  });

  document.addEventListener('change', function (e) {
    const el = e.target.closest('[data-on-change]');
    if (!el) return;
    invoke(el.dataset.onChange, el, e);
  });

  document.addEventListener('input', function (e) {
    const el = e.target.closest('[data-on-input]');
    if (!el) return;
    invoke(el.dataset.onInput, el, e);
  });

  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Enter') return;
    const el = e.target.closest('[data-on-keydown-enter]');
    if (!el) return;
    invoke(el.dataset.onKeydownEnter, el, e);
  });

  ['dragstart', 'dragover', 'dragleave', 'drop', 'dragend'].forEach(function (evt) {
    document.addEventListener(evt, function (e) {
      const sel = '[data-on-' + evt + ']';
      const el = e.target.closest(sel);
      if (!el) return;
      const dsKey = 'on' + evt.charAt(0).toUpperCase() + evt.slice(1);
      invoke(el.dataset[dsKey], el, e);
    });
  });
})();
