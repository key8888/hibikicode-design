(() => {
  const runBtn = document.getElementById('run-btn');
  const resetBtn = document.getElementById('reset-btn');

  const pyodideReady = new Promise((resolve) => {
    if (window.pyodide) {
      resolve(window.pyodide);
      return;
    }
    document.addEventListener('pyscript-ready', () => resolve(window.pyodide));
  });

  async function executeFromEditor() {
    const pyodide = await pyodideReady;
    await window.editorManager.ready;

    const code = window.editorManager.getValue();
    const wrapped = `${""}import js\nif hasattr(js, "currentP5Instance") and js.currentP5Instance:\n    try:\n        js.currentP5Instance.remove()\n    except Exception:\n        pass\njs.currentP5Instance = None\n\n` +
      code +
      `\n\nif 'start_sketch' in globals():\n    try:\n        js.currentP5Instance = start_sketch()\n    except Exception:\n        start_sketch()\n`;

    try {
      const start = performance.now();
      window.logManager.append('実行中: Pythonスケッチを再起動します...');
      await pyodide.runPythonAsync(wrapped);
      const elapsed = Math.round(performance.now() - start);
      window.logManager.append('実行が完了しました。');
      window.logManager.setRuntime(`${elapsed} ms`);
    } catch (err) {
      window.logManager.append(`エラー: ${err}`, true);
      window.logManager.setRuntime('-- ms');
    }
  }

  async function resetSketch() {
    const pyodide = await pyodideReady;
    try {
      await pyodide.runPythonAsync(
        `import js\n\nif hasattr(js, "currentP5Instance") and js.currentP5Instance:\n    try:\n        js.currentP5Instance.background(20)\n    except Exception:\n        pass\n\nif 'reset_sketch' in globals():\n    try:\n        reset_sketch()\n    except Exception:\n        pass\n`,
      );
      window.logManager.append('キャンバスをリセットしました。');
    } catch (err) {
      window.logManager.append(`リセット時にエラーが発生しました: ${err}`, true);
    }
  }

  runBtn.addEventListener('click', executeFromEditor);
  resetBtn.addEventListener('click', resetSketch);

  Promise.all([pyodideReady, window.editorManager.ready]).then(() => executeFromEditor());
})();
