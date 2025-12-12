(() => {
  const isAdmin = true;
  const adminButtons = document.querySelectorAll('.admin-only');

  adminButtons.forEach((btn) => {
    btn.style.display = isAdmin ? 'inline-flex' : 'none';
  });
})();
