(() => {
  const button = document.querySelector('[data-copy]');
  const status = document.getElementById('copy-status');
  if (!button || !status) return;

  button.addEventListener('click', async () => {
    const value = button.getAttribute('data-copy');
    try {
      await navigator.clipboard.writeText(value);
      status.textContent = 'Bitcoin address copied.';
      button.textContent = 'Copied';
    } catch {
      const range = document.createRange();
      range.selectNode(document.getElementById('wallet-address'));
      const selection = window.getSelection();
      selection.removeAllRanges();
      selection.addRange(range);
      status.textContent = 'Address selected. Copy it with your system command.';
    }
  });
})();
