// Landing page behavior. Kept in an external file because the Content-Security
// Policy is script-src 'self', which blocks inline scripts.
(function () {
  // Wire pricing buttons to the Stripe Checkout backend.
  document.querySelectorAll('.price-cta[data-plan]').forEach((btn) => {
    btn.addEventListener('click', async () => {
      const plan = btn.getAttribute('data-plan');
      const original = btn.innerHTML;
      btn.disabled = true;
      btn.innerHTML = 'Loading…';
      try {
        const res = await fetch('/api/stripe/checkout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ plan }),
        });
        const data = await res.json();
        if (!res.ok || !data.url) throw new Error(data.error || 'Checkout failed');
        window.location.assign(data.url);
      } catch (err) {
        btn.disabled = false;
        btn.innerHTML = original;
        alert('Could not start checkout: ' + err.message);
      }
    });
  });

  // Show the post-purchase toast if Stripe redirected back with ?purchase=success.
  const params = new URLSearchParams(window.location.search);
  if (params.get('purchase') === 'success') {
    const toast = document.getElementById('purchaseToast');
    if (toast) {
      toast.style.display = '';
      setTimeout(() => {
        toast.style.display = 'none';
      }, 10000);
    }
    // Clean the query string so a refresh does not re-show it.
    history.replaceState({}, '', window.location.pathname + window.location.hash);
  }
})();
