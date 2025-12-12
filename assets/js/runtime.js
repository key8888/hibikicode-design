(() => {
  const runBtn = document.getElementById('run-btn');
  const resetBtn = document.getElementById('reset-btn');
  const designCanvas = document.getElementById('design-canvas');

  let pyEnvReady = false;
  let fallbackHandle = null;

  const startFallback = () => {
    if (fallbackHandle) return fallbackHandle;

    const canvas = document.createElement('canvas');
    canvas.width = designCanvas.clientWidth;
    canvas.height = designCanvas.clientHeight;
    canvas.classList.add('p5Canvas');
    designCanvas.appendChild(canvas);

    const ctx = canvas.getContext('2d');
    let t = 0;
    let rafId = null;

    const draw = () => {
      const { width, height } = canvas;
      ctx.fillStyle = 'rgba(15,17,42,0.12)';
      ctx.fillRect(0, 0, width, height);
      const x = (Math.sin(t / 20) * 0.4 + 0.5) * width;
      const y = (Math.cos(t / 23) * 0.4 + 0.5) * height;
      const r = 24 + 10 * Math.sin(t / 11);
      const grd = ctx.createRadialGradient(x, y, 4, x, y, r * 4);
      grd.addColorStop(0, '#60a5fa');
      grd.addColorStop(1, 'rgba(96,165,250,0)');
      ctx.fillStyle = grd;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
      t += 1;
      rafId = requestAnimationFrame(draw);
    };

    const onResize = () => {
      canvas.width = designCanvas.clientWidth;
      canvas.height = designCanvas.clientHeight;
    };

    window.addEventListener('resize', onResize);
    draw();
    window.logManager.append('Pyodide が利用できないため、フェールバック描画を表示しています。', true);

    fallbackHandle = {
      stop() {
        if (rafId !== null) {
          cancelAnimationFrame(rafId);
          rafId = null;
        }
        window.removeEventListener('resize', onResize);
        canvas.remove();
      },
    };

    return fallbackHandle;
  };

  const stopFallback = () => {
    if (fallbackHandle && typeof fallbackHandle.stop === 'function') {
      fallbackHandle.stop();
    }
    fallbackHandle = null;
  };

  const loadPyodideFromCdn = async () => {
    if (window.pyodide) return window.pyodide;

    if (!window.loadPyodide) {
      await new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/pyodide/v0.26.1/full/pyodide.js';
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
      });
    }

    const pyodide = await window.loadPyodide({ indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.26.1/full/' });
    window.pyodide = pyodide;
    return pyodide;
  };

  const pyodideReady = new Promise((resolve, reject) => {
    if (window.pyodide) {
      pyEnvReady = true;
      resolve(window.pyodide);
      return;
    }

    const onReady = () => {
      pyEnvReady = true;
      resolve(window.pyodide);
    };
    document.addEventListener('pyscript-ready', onReady, { once: true });

    loadPyodideFromCdn()
      .then((py) => {
        pyEnvReady = true;
        resolve(py);
      })
      .catch((err) => {
        window.logManager.append(`Pyodide の読み込みに失敗しました: ${err}`, true);
        startFallback();
        reject(err);
      });
  });

  async function executeFromEditor() {
    if (!pyEnvReady) {
      startFallback();
      window.logManager.append('Python 環境が初期化されていません。ネットワーク接続を確認してください。', true);
      window.logManager.setRuntime('-- ms');
      return;
    }

    const pyodide = await pyodideReady;
    stopFallback();
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
      startFallback();
      window.logManager.append(`エラー: ${err}`, true);
      window.logManager.setRuntime('-- ms');
    }
  }

  async function resetSketch() {
    if (!pyEnvReady) {
      startFallback();
      window.logManager.append('Python 環境がまだ利用できません。', true);
      return;
    }

    const pyodide = await pyodideReady;
    try {
      await pyodide.runPythonAsync(
        `import js\n\nif hasattr(js, "currentP5Instance") and js.currentP5Instance:\n    try:\n        js.currentP5Instance.background(20)\n    except Exception:\n        pass\n\nif 'reset_sketch' in globals():\n    try:\n        reset_sketch()\n    except Exception:\n        pass\n`,
      );
      window.logManager.append('キャンバスをリセットしました。');
    } catch (err) {
      startFallback();
      window.logManager.append(`リセット時にエラーが発生しました: ${err}`, true);
    }
  }

  runBtn.addEventListener('click', executeFromEditor);
  resetBtn.addEventListener('click', resetSketch);

  Promise.all([pyodideReady, window.editorManager.ready])
    .then(() => executeFromEditor())
    .catch(() => startFallback());
})();
