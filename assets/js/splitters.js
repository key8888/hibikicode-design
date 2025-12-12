(() => {
  const leftPane = document.getElementById('left-pane');
  const rightPane = document.getElementById('right-pane');
  const vSplitter = document.getElementById('v-splitter');
  const hSplitter = document.getElementById('h-splitter');
  const editorWrapper = document.getElementById('editor-wrapper');

  let draggingV = false;
  let draggingH = false;

  vSplitter.addEventListener('mousedown', () => (draggingV = true));
  window.addEventListener('mouseup', () => (draggingV = false));
  window.addEventListener('mousemove', (e) => {
    if (!draggingV) return;
    const rect = document.querySelector('main.workspace').getBoundingClientRect();
    const offset = e.clientX - rect.left;
    const leftWidth = Math.min(Math.max(offset - vSplitter.offsetWidth / 2, 260), rect.width - 320);
    const ratio = (leftWidth / rect.width) * 100;
    leftPane.style.flexBasis = `${ratio}%`;
  });

  hSplitter.addEventListener('mousedown', () => (draggingH = true));
  window.addEventListener('mouseup', () => (draggingH = false));
  window.addEventListener('mousemove', (e) => {
    if (!draggingH) return;
    const rect = rightPane.getBoundingClientRect();
    const offset = e.clientY - rect.top;
    const minEditor = 180;
    const minLog = 140;
    const editorHeight = Math.min(Math.max(offset - 70, minEditor), rect.height - minLog);
    editorWrapper.style.flexBasis = `${editorHeight}px`;
  });
})();
