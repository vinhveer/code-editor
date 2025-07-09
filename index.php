<!DOCTYPE html>
<html lang="en" class="h-full">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Code Editor</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <script src="https://unpkg.com/monaco-editor@0.44.0/min/vs/loader.js"></script>
    <script src="code-executor.js"></script>
    <script src="script.js"></script>
    <script>
        tailwind.config = {
            darkMode: 'class',
            theme: {
                extend: {
                    colors: {
                        'vscode-bg': '#1e1e1e',
                        'vscode-sidebar': '#252526',
                        'vscode-tab': '#2d2d30',
                        'vscode-tab-active': '#1e1e1e',
                        'vscode-tab-hover': '#37373d',
                        'vscode-border': '#3e3e42',
                        'vscode-text': '#cccccc',
                        'vscode-text-dim': '#969696',
                        'vscode-accent': '#007acc',
                        'vscode-input': '#3c3c3c',
                        'vscode-button': '#0e639c',
                        'vscode-button-hover': '#1177bb'
                    }
                }
            }
        }
    </script>
</head>
<body class="h-full bg-vscode-bg">
    <!-- Header -->
    <header class="sticky top-0 z-50 bg-vscode-sidebar border-b border-vscode-border px-4 py-2">
        <div class="flex items-center justify-between">
            <h1 class="text-sm font-medium text-vscode-text">Code Editor</h1>
            <div class="flex items-center space-x-2">
                <button id="runBtn" class="px-3 py-1 bg-vscode-button hover:bg-vscode-button-hover text-white text-sm rounded transition-colors">
                    ▶ Run
                </button>
                <button id="themeToggle" class="p-1 rounded hover:bg-vscode-tab-hover transition-colors">
                    <svg class="w-4 h-4 text-vscode-text-dim" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
            <div class="w-3/4 flex flex-col border-r border-vscode-border">
                <!-- Tab Bar -->
                <div class="bg-vscode-sidebar border-b border-vscode-border px-0">
                    <div class="tab-container flex items-end"></div>
                </div>
                
                <!-- Monaco Editor -->
                <div id="editor" class="flex-1 bg-vscode-bg"></div>
            </div>

            <!-- Right Panel (1/4) -->
            <div class="w-1/4 flex flex-col bg-vscode-sidebar">
                <!-- Input Section (1/2) -->
                <div class="h-1/2 flex flex-col border-b border-vscode-border">
                    <div class="px-3 py-2 bg-vscode-tab border-b border-vscode-border">
                        <h3 class="text-xs font-medium text-vscode-text uppercase tracking-wide">Input</h3>
                    </div>
                    <textarea id="input" class="flex-1 p-3 bg-vscode-input text-vscode-text border-none outline-none resize-none font-mono text-sm" placeholder="Enter input here..."></textarea>
                </div>

                <!-- Output Section (1/2) -->
                <div class="h-1/2 flex flex-col">
                    <div class="px-3 py-2 bg-vscode-tab border-b border-vscode-border">
                        <h3 class="text-xs font-medium text-vscode-text uppercase tracking-wide">Output</h3>
                    </div>
                    <div id="output" class="flex-1 p-3 bg-vscode-input text-vscode-text font-mono text-sm overflow-auto whitespace-pre-wrap"></div>
                </div>
            </div>
        </div>
    </main>


</body>
</html> 