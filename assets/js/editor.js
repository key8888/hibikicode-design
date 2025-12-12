(() => {
  const fontSizeSlider = document.getElementById('font-size');
  const fontSizeLabel = document.getElementById('font-size-label');
  const initialCode = window.sampleCode?.python ?? '# Python コードをここに記述します';

  let editorInstance;
  let resolveEditor;
  const editorReady = new Promise((resolve) => {
    resolveEditor = resolve;
  });

  require.config({ paths: { vs: 'https://cdn.jsdelivr.net/npm/monaco-editor@0.51.0/min/vs' } });
  window.MonacoEnvironment = {
    getWorkerUrl: function () {
      return (
        'data:text/javascript;charset=utf-8,' +
        encodeURIComponent(
          `self.MonacoEnvironment={baseUrl:'https://cdn.jsdelivr.net/npm/monaco-editor@0.51.0/min/'}; importScripts('https://cdn.jsdelivr.net/npm/monaco-editor@0.51.0/min/vs/base/worker/workerMain.js');`,
        )
      );
    },
  };

  require(['vs/editor/editor.main'], function () {
    editorInstance = monaco.editor.create(document.getElementById('editor'), {
      value: initialCode,
      language: 'python',
      theme: window.matchMedia('(prefers-color-scheme: dark)').matches ? 'vs-dark' : 'vs',
      fontSize: Number(fontSizeSlider.value),
      automaticLayout: true,
      minimap: { enabled: false },
      roundedSelection: true,
      scrollBeyondLastLine: false,
    });

    fontSizeSlider.addEventListener('input', (e) => {
      const size = Number(e.target.value);
      editorInstance.updateOptions({ fontSize: size });
      fontSizeLabel.textContent = `${size}px`;
    });

    resolveEditor(editorInstance);
  });

  window.editorManager = {
    ready: editorReady,
    getValue: () => editorInstance?.getValue() ?? initialCode,
  };
})();
