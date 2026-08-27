(() => {
  const button = document.querySelector('[data-copy]');
  const status = document.getElementById('copy-status');
  if (!button || !status) return;

  button.addEventListener('click', async () => {
    const value = button.getAttribute('data-copy');
    if (!value) return;
    try {
      await navigator.clipboard.writeText(value);
      status.textContent = 'Bitcoin address copied. Paste it into your wallet.';
      button.textContent = 'Address copied ✓';
    } catch {
      const range = document.createRange();
      range.selectNode(document.getElementById('wallet-address'));
      const selection = window.getSelection();
      selection.removeAllRanges();
      selection.addRange(range);
      status.textContent = 'Address selected. Copy it, then paste it into your wallet.';
    }
  });
})();
