const isAdmin = true;
const tabButtons = document.querySelectorAll('.tab-button');
const tabContents = {
    design: document.getElementById('tab-design'),
    lesson: document.getElementById('tab-lesson'),
    list: document.getElementById('tab-list'),
};
const leftPane = document.getElementById('left-pane');
const rightPane = document.getElementById('right-pane');
const vSplitter = document.getElementById('v-splitter');
const hSplitter = document.getElementById('h-splitter');
const editorWrapper = document.getElementById('editor-wrapper');
const logBody = document.getElementById('log-body');
const logCardEl = document.getElementById('log-card');
const runtimeLabel = document.getElementById('runtime');
const fontSizeSlider = document.getElementById('font-size');
const fontSizeLabel = document.getElementById('font-size-label');
const runBtn = document.getElementById('run-btn');
const resetBtn = document.getElementById('reset-btn');

function setupAdminVisibility() {
    document.querySelectorAll('.admin-only').forEach(btn => {
        btn.style.display = isAdmin ? 'inline-flex' : 'none';
    });
}

function setupTabs() {
    tabButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            tabButtons.forEach(b => b.classList.toggle('active', b === btn));
            Object.entries(tabContents).forEach(([key, panel]) => {
                panel.classList.toggle('active', btn.dataset.tab === key);
            });
        });
    });
}

function setupVerticalSplitter() {
    let draggingV = false;
    vSplitter.addEventListener('mousedown', () => draggingV = true);
    window.addEventListener('mouseup', () => draggingV = false);
    window.addEventListener('mousemove', (e) => {
        if (!draggingV) return;
        const rect = document.querySelector('main.workspace').getBoundingClientRect();
        const offset = e.clientX - rect.left;
        const leftWidth = Math.min(Math.max(offset - vSplitter.offsetWidth / 2, 260), rect.width - 320);
        const ratio = (leftWidth / rect.width) * 100;
        leftPane.style.flexBasis = `${ratio}%`;
    });
}

function setupHorizontalSplitter() {
    let draggingH = false;
    hSplitter.addEventListener('mousedown', () => draggingH = true);
    window.addEventListener('mouseup', () => draggingH = false);
    window.addEventListener('mousemove', (e) => {
        if (!draggingH) return;
        const rect = rightPane.getBoundingClientRect();
        const offset = e.clientY - rect.top;
        const minEditor = 180;
        const minLog = 140;
        const editorHeight = Math.min(Math.max(offset - 70, minEditor), rect.height - minLog);
        editorWrapper.style.flexBasis = `${editorHeight}px`;
    });
}

function appendLog(text, isError = false) {
    const timestamp = new Date().toLocaleTimeString();
    logBody.textContent = `[${timestamp}] ${text}`;
    logCardEl.classList.toggle('error', isError);
}

function setupRunReset() {
    runBtn.addEventListener('click', () => {
        const start = performance.now();
        appendLog('実行中: Pythonスケッチを再起動します...');
        if (window.startSketch) {
            window.startSketch();
        }
        const elapsed = Math.round(performance.now() - start);
        runtimeLabel.textContent = `${elapsed} ms`;
    });

    resetBtn.addEventListener('click', () => {
        appendLog('キャンバスをリセットしました。');
        if (window.resetSketch) {
            window.resetSketch();
        }
    });
}

function setupMonaco() {
    const initialCode = `# Python で p5.js を動かすデモ\n` +
`import js\n\n` +
`current = None\n\n` +
`def sketch(p):\n    def setup():\n        c = p.createCanvas(720, 420)\n        c.parent("design-canvas")\n        p.background(20)\n        p.noStroke()\n\n    def draw():\n        p.fill(0, 0, 0, 26)\n        p.rect(0, 0, p.width, p.height)\n        p.fill(96, 165, 250)\n        p.circle(p.mouseX, p.mouseY, 34)\n\n    p.setup = setup\n    p.draw = draw\n\n# start_sketch() で実行\n`;

    require.config({ paths: { vs: 'https://cdn.jsdelivr.net/npm/monaco-editor@0.51.0/min/vs' } });
    window.MonacoEnvironment = {
        getWorkerUrl: function () {
            return 'data:text/javascript;charset=utf-8,' + encodeURIComponent(`self.MonacoEnvironment={baseUrl:'https://cdn.jsdelivr.net/npm/monaco-editor@0.51.0/min/'}; importScripts('https://cdn.jsdelivr.net/npm/monaco-editor@0.51.0/min/vs/base/worker/workerMain.js');`);
        }
    };

    require(['vs/editor/editor.main'], function () {
        const editor = monaco.editor.create(document.getElementById('editor'), {
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
            editor.updateOptions({ fontSize: size });
            fontSizeLabel.textContent = `${size}px`;
        });
    });
}

setupAdminVisibility();
setupTabs();
setupVerticalSplitter();
setupHorizontalSplitter();
setupRunReset();
setupMonaco();
