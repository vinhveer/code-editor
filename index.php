<!DOCTYPE html>
<html lang="en" class="h-full">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Code Editor</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <script src="https://unpkg.com/monaco-editor@0.44.0/min/vs/loader.js"></script>
    <script src="code-executor.js"></script>
    <script src="js/ThemeManager.js"></script>
    <script src="js/ModalManager.js"></script>
    <script src="js/IOManager.js"></script>
    <script src="js/EditorManager.js"></script>
    <script src="js/TabManager.js"></script>
    <script src="js/App.js"></script>
    <script src="js/main.js"></script>
    <style>
        :root {
            --vscode-bg: #1e1e1e;
            --vscode-sidebar: #252526;
            --vscode-tab: #2d2d30;
            --vscode-tab-active: #1e1e1e;
            --vscode-tab-hover: #37373d;
            --vscode-border: #3e3e42;
            --vscode-text: #cccccc;
            --vscode-text-dim: #969696;
            --vscode-accent: #007acc;
            --vscode-input: #3c3c3c;
            --vscode-button: #0e639c;
            --vscode-button-hover: #1177bb;
        }

        .theme-light {
            --vscode-bg: #ffffff;
            --vscode-sidebar: #f3f3f3;
            --vscode-tab: #e8e8e8;
            --vscode-tab-active: #ffffff;
            --vscode-tab-hover: #e0e0e0;
            --vscode-border: #d4d4d4;
            --vscode-text: #333333;
            --vscode-text-dim: #666666;
            --vscode-accent: #0078d4;
            --vscode-input: #ffffff;
            --vscode-button: #0078d4;
            --vscode-button-hover: #106ebe;
        }

        .vscode-bg { background-color: var(--vscode-bg); }
        .vscode-sidebar { background-color: var(--vscode-sidebar); }
        .vscode-tab { background-color: var(--vscode-tab); }
        .vscode-tab-active { background-color: var(--vscode-tab-active); }
        .vscode-tab-hover:hover { background-color: var(--vscode-tab-hover); }
        .vscode-border { border-color: var(--vscode-border); }
        .vscode-text { color: var(--vscode-text); }
        .vscode-text-dim { color: var(--vscode-text-dim); }
        .vscode-accent { color: var(--vscode-accent); }
        .vscode-input { background-color: var(--vscode-input); }
        .vscode-button { background-color: var(--vscode-button); }
        .vscode-button:hover { background-color: var(--vscode-button-hover); }
    </style>
    <script>
        tailwind.config = {
            darkMode: 'class'
        }
    </script>
</head>
<body class="h-full vscode-bg theme-dark">
    <!-- Header -->
    <header class="sticky top-0 z-50 vscode-sidebar border-b vscode-border px-4 py-3">
        <div class="flex items-center justify-between">
            <h1 class="text-sm font-medium vscode-text">Code Editor</h1>
            <div class="flex items-center space-x-3">
                <button id="runBtn" class="px-4 py-2 vscode-button text-white text-sm rounded transition-colors hover:scale-105 active:scale-95">
                    Run
                </button>
                <button id="intellisenseToggle" class="px-4 py-2 vscode-button text-white text-sm rounded transition-colors hover:scale-105 active:scale-95" title="Toggle Intellisense">
                    <span class="intellisense-icon">Intellisense</span>
                </button>
                <button id="themeToggle" class="p-2 rounded vscode-tab-hover transition-all hover:scale-105 active:scale-95">
                    <svg class="w-5 h-5 vscode-text-dim" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"></path>
                    </svg>
                </button>
            </div>
        </div>
    </header>

    <!-- Main Container -->
    <main class="h-[calc(100vh-57px)] container-fluid px-0">
        <div class="flex h-full">
            <!-- Left Panel (3/4) -->
            <div class="w-3/4 flex flex-col border-r vscode-border">
                <!-- Tab Bar -->
                <div class="vscode-sidebar border-b vscode-border px-0">
                    <div class="tab-container flex items-end"></div>
                </div>
                
                <!-- Monaco Editor -->
                <div id="editor" class="flex-1 vscode-bg"></div>
            </div>

            <!-- Right Panel (1/4) -->
            <div class="w-1/4 flex flex-col vscode-sidebar">
                <!-- Input Section (1/2) -->
                <div class="h-1/2 flex flex-col border-b vscode-border">
                    <div class="px-3 py-2 vscode-tab border-b vscode-border">
                        <h3 class="text-xs font-medium vscode-text uppercase tracking-wide">Input</h3>
                    </div>
                    <textarea id="input" class="flex-1 p-3 vscode-input vscode-text border-none outline-none resize-none font-mono text-sm" placeholder="Enter input here..."></textarea>
                </div>

                <!-- Output Section (1/2) -->
                <div class="h-1/2 flex flex-col">
                    <div class="px-3 py-2 vscode-tab border-b vscode-border">
                        <h3 class="text-xs font-medium vscode-text uppercase tracking-wide">Output</h3>
                    </div>
                    <div id="output" class="flex-1 p-3 vscode-input vscode-text font-mono text-sm overflow-auto whitespace-pre-wrap"></div>
                </div>
            </div>
        </div>
    </main>


</body>
</html> 