(() => {
  const tabButtons = document.querySelectorAll('.tab-button');
  const tabContents = {
    design: document.getElementById('tab-design'),
    lesson: document.getElementById('tab-lesson'),
    list: document.getElementById('tab-list'),
  };

  tabButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      tabButtons.forEach((b) => b.classList.toggle('active', b === btn));
      Object.entries(tabContents).forEach(([key, panel]) => {
        panel.classList.toggle('active', btn.dataset.tab === key);
      });
    });
  });
})();
