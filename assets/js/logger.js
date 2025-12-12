(() => {
  const logBody = document.getElementById('log-body');
  const logCardEl = document.getElementById('log-card');
  const runtimeLabel = document.getElementById('runtime');

  function append(text, isError = false) {
    const timestamp = new Date().toLocaleTimeString();
    logBody.textContent = `[${timestamp}] ${text}`;
    logCardEl.classList.toggle('error', isError);
  }

  function setRuntime(text) {
    runtimeLabel.textContent = text;
  }

  window.logManager = {
    append,
    setRuntime,
  };
})();
