class CodeEditor {
    constructor() {
        this.tabs = [];
        this.activeTabIndex = 0;
        this.editor = null;
        this.fontSize = 14;
        this.minFontSize = 8;
        this.maxFontSize = 30;
        this.codeExecutor = new CodeExecutor();
        
        this.init();
    }

    init() {
        this.setupMonacoEditor();
        this.setupEventListeners();
        this.createInitialTab();
    }

    setupMonacoEditor() {
        require.config({ paths: { vs: 'https://unpkg.com/monaco-editor@0.44.0/min/vs' } });
        require(['vs/editor/editor.main'], () => {
            this.editor = monaco.editor.create(document.getElementById('editor'), {
                value: 'console.log("Hello, World!");',
                language: 'javascript',
                theme: 'vs-dark',
                automaticLayout: true,
                fontSize: this.fontSize,
                minimap: { enabled: false },
                scrollBeyondLastLine: false
            });

            this.setupFontSizeControls();
            this.setupThemeToggle();
            this.setupRunCode();
        });
    }

    setupEventListeners() {
        // New tab button
        document.addEventListener('click', (e) => {
            if (e.target.closest('.new-tab-btn')) {
                this.showLanguageSelectionModal();
            }
        });

        // Tab click handlers
        document.addEventListener('click', (e) => {
            const tabBtn = e.target.closest('.tab-btn');
            if (tabBtn) {
                const index = parseInt(tabBtn.dataset.index);
                this.switchTab(index);
            }
        });

        // Tab right-click context menu
        document.addEventListener('contextmenu', (e) => {
            const tabBtn = e.target.closest('.tab-btn');
            if (tabBtn) {
                e.preventDefault();
                const index = parseInt(tabBtn.dataset.index);
                this.showContextMenu(e.clientX, e.clientY, index);
            }
        });

        // Hide context menu when clicking elsewhere
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.context-menu')) {
                this.hideContextMenu();
            }
        });

        // Tab close handlers
        document.addEventListener('click', (e) => {
            const closeBtn = e.target.closest('.tab-close');
            if (closeBtn) {
                e.stopPropagation();
                const index = parseInt(closeBtn.dataset.index);
                this.closeTab(index);
            }
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey) {
                switch (e.key) {
                    case 't':
                        e.preventDefault();
                        this.createNewTab();
                        break;
                    case 'w':
                        e.preventDefault();
                        this.closeTab(this.activeTabIndex);
                        break;
                    case 'Tab':
                        e.preventDefault();
                        if (e.shiftKey) {
                            this.switchToPreviousTab();
                        } else {
                            this.switchToNextTab();
                        }
                        break;
                }

                // Ctrl + number keys for tab switching
                if (e.key >= '1' && e.key <= '9') {
                    e.preventDefault();
                    const index = parseInt(e.key) - 1;
                    if (index < this.tabs.length) {
                        this.switchTab(index);
                    }
                }
            }
        });
    }

    createInitialTab() {
        this.tabs.push({
            id: Date.now(),
            name: 'main.js',
            content: 'console.log("Hello, World!");',
            language: 'javascript',
            isDirty: false
        });
        this.renderTabs();
    }

    showLanguageSelectionModal() {
        const backdrop = document.createElement('div');
        backdrop.className = 'modal-backdrop fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center';
        
        const languages = this.codeExecutor.getSupportedLanguages();
        const languageOptions = Object.keys(languages).map(key => 
            `<button class="language-option w-full px-3 py-2 text-left border border-vscode-border rounded hover:bg-vscode-tab-hover transition-colors mb-2" data-language="${key}">
                <div class="font-medium text-vscode-text text-sm">${languages[key].name}</div>
                <div class="text-xs text-vscode-text-dim">${languages[key].extension}</div>
            </button>`
        ).join('');
        
        backdrop.innerHTML = `
            <div class="modal-content bg-vscode-sidebar border border-vscode-border rounded p-6 w-96 max-w-md">
                <h3 class="text-sm font-medium text-vscode-text mb-4">Chọn ngôn ngữ lập trình</h3>
                <div class="language-list space-y-2">
                    ${languageOptions}
                </div>
                <div class="flex justify-end mt-4">
                    <button class="cancel-btn px-3 py-1 text-vscode-text-dim hover:text-vscode-text hover:bg-vscode-tab-hover transition-colors text-xs">Hủy</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(backdrop);
        
        // Event listeners
        backdrop.querySelector('.cancel-btn').addEventListener('click', () => {
            backdrop.remove();
        });
        
        backdrop.querySelectorAll('.language-option').forEach(btn => {
            btn.addEventListener('click', () => {
                const language = btn.dataset.language;
                this.createNewTab(language);
                backdrop.remove();
            });
        });
        
        // Close on backdrop click
        backdrop.addEventListener('click', (e) => {
            if (e.target === backdrop) {
                backdrop.remove();
            }
        });
        
        // Close on Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                backdrop.remove();
            }
        }, { once: true });
    }

    createNewTab(language = 'javascript') {
        const fileName = this.codeExecutor.getDefaultFileName(language);
        const tabCount = this.tabs.filter(tab => tab.name.startsWith(fileName.split('.')[0])).length;
        
        const newTab = {
            id: Date.now(),
            name: tabCount > 0 ? `${fileName.split('.')[0]}-${tabCount + 1}.${fileName.split('.')[1]}` : fileName,
            content: '',
            language: language,
            isDirty: false
        };
        
        this.tabs.push(newTab);
        this.activeTabIndex = this.tabs.length - 1;
        this.renderTabs();
        this.updateEditorContent();
    }

    closeTab(index) {
        if (this.tabs.length <= 1) return;
        
        this.tabs.splice(index, 1);
        
        if (this.activeTabIndex >= this.tabs.length) {
            this.activeTabIndex = this.tabs.length - 1;
        } else if (this.activeTabIndex > index) {
            this.activeTabIndex--;
        }
        
        this.renderTabs();
        this.updateEditorContent();
    }

    switchTab(index) {
        if (index >= 0 && index < this.tabs.length) {
            // Save current tab content
            if (this.editor && this.tabs[this.activeTabIndex]) {
                this.tabs[this.activeTabIndex].content = this.editor.getValue();
            }
            
            this.activeTabIndex = index;
            this.renderTabs();
            this.updateEditorContent();
        }
    }

    switchToNextTab() {
        const nextIndex = (this.activeTabIndex + 1) % this.tabs.length;
        this.switchTab(nextIndex);
    }

    switchToPreviousTab() {
        const prevIndex = (this.activeTabIndex - 1 + this.tabs.length) % this.tabs.length;
        this.switchTab(prevIndex);
    }

    showContextMenu(x, y, tabIndex) {
        this.hideContextMenu();
        
        const contextMenu = document.createElement('div');
        contextMenu.className = 'context-menu fixed bg-vscode-sidebar border border-vscode-border rounded shadow-lg py-1 z-50';
        contextMenu.style.left = x + 'px';
        contextMenu.style.top = y + 'px';
        
        contextMenu.innerHTML = `
            <button class="context-rename w-full px-3 py-2 text-left text-xs text-vscode-text hover:bg-vscode-tab-hover transition-colors">
                Đổi tên
            </button>
            <button class="context-download w-full px-3 py-2 text-left text-xs text-vscode-text hover:bg-vscode-tab-hover transition-colors">
                Tải tập tin xuống
            </button>
        `;
        
        document.body.appendChild(contextMenu);
        
        // Add event listeners
        contextMenu.querySelector('.context-rename').addEventListener('click', () => {
            this.showRenameModal(tabIndex);
            this.hideContextMenu();
        });
        
        contextMenu.querySelector('.context-download').addEventListener('click', () => {
            this.downloadFile(tabIndex);
            this.hideContextMenu();
        });
    }

    hideContextMenu() {
        const existingMenu = document.querySelector('.context-menu');
        if (existingMenu) {
            existingMenu.remove();
        }
    }

    showRenameModal(index) {
        const tab = this.tabs[index];
        if (!tab) return;

        // Create modal backdrop
        const backdrop = document.createElement('div');
        backdrop.className = 'modal-backdrop fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center';
        
        backdrop.innerHTML = `
            <div class="modal-content bg-vscode-sidebar border border-vscode-border rounded p-6 w-96 max-w-md">
                <h3 class="text-sm font-medium text-vscode-text mb-4">Đổi tên tập tin</h3>
                <input type="text" id="renameInput" class="w-full px-3 py-2 border border-vscode-border rounded bg-vscode-input text-vscode-text focus:outline-none focus:ring-1 focus:ring-vscode-accent" value="${tab.name}">
                <div class="flex justify-end mt-4 space-x-2">
                    <button class="cancel-btn px-3 py-1 text-vscode-text-dim hover:text-vscode-text hover:bg-vscode-tab-hover transition-colors text-xs">Hủy</button>
                    <button class="save-btn px-3 py-1 bg-vscode-button hover:bg-vscode-button-hover text-white rounded transition-colors text-xs">Lưu</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(backdrop);
        
        const input = backdrop.querySelector('#renameInput');
        input.focus();
        input.select();
        
        // Event listeners
        backdrop.querySelector('.cancel-btn').addEventListener('click', () => {
            backdrop.remove();
        });
        
        backdrop.querySelector('.save-btn').addEventListener('click', () => {
            const newName = input.value.trim();
            if (newName && newName !== tab.name) {
                tab.name = newName;
                this.renderTabs();
            }
            backdrop.remove();
        });
        
        // Close on backdrop click
        backdrop.addEventListener('click', (e) => {
            if (e.target === backdrop) {
                backdrop.remove();
            }
        });
        
        // Close on Enter key
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                backdrop.querySelector('.save-btn').click();
            } else if (e.key === 'Escape') {
                backdrop.remove();
            }
        });
    }

    downloadFile(index) {
        const tab = this.tabs[index];
        if (!tab) return;

        // Get content from editor if it's the active tab
        let content = tab.content;
        if (index === this.activeTabIndex && this.editor) {
            content = this.editor.getValue();
        }

        // Create blob and download
        const blob = new Blob([content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = tab.name;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    updateEditorContent() {
        if (this.editor && this.tabs[this.activeTabIndex]) {
            const activeTab = this.tabs[this.activeTabIndex];
            this.editor.setValue(activeTab.content);
            const languageInfo = this.codeExecutor.getLanguageInfo(activeTab.language);
            if (languageInfo) {
                monaco.editor.setModelLanguage(this.editor.getModel(), languageInfo.monacoLanguage);
            }
        }
    }

    renderTabs() {
        const tabContainer = document.querySelector('.tab-container');
        if (!tabContainer) return;

        tabContainer.innerHTML = this.tabs.map((tab, index) => `
            <div class="tab-btn group relative flex items-center min-w-0 ${
                index === this.activeTabIndex 
                    ? 'bg-vscode-tab-active text-vscode-text border-t-2 border-t-vscode-accent' 
                    : 'bg-vscode-tab text-vscode-text-dim hover:bg-vscode-tab-hover border-t-2 border-t-transparent'
            } px-3 py-2 text-xs font-normal cursor-pointer transition-all duration-150 border-r border-vscode-border" data-index="${index}">
                <span class="truncate max-w-28">${tab.name}</span>
                ${tab.isDirty ? '<span class="ml-2 w-1.5 h-1.5 bg-white rounded-full flex-shrink-0"></span>' : ''}
                <!-- SVG ICON XÓA TAB - Nút close tab với icon X -->
                <button class="tab-close ml-2 p-0.5 rounded hover:bg-vscode-border opacity-0 group-hover:opacity-100 transition-all duration-150 flex-shrink-0" data-index="${index}">
                    <!-- Icon X để đóng tab -->
                    <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                </button>
            </div>
        `).join('') + `
            <button class="new-tab-btn flex items-center px-3 py-2 text-xs font-normal text-vscode-text-dim hover:text-vscode-text hover:bg-vscode-tab-hover transition-colors">
                <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                </svg>
                New File
            </button>
        `;
    }

    setupFontSizeControls() {
        // Ctrl + Mouse wheel zoom
        document.getElementById('editor').addEventListener('wheel', (e) => {
            if (e.ctrlKey) {
                e.preventDefault();
                if (e.deltaY < 0) {
                    this.increaseFontSize();
                } else {
                    this.decreaseFontSize();
                }
            }
        });

        // Keyboard shortcuts for font size
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey) {
                switch (e.key) {
                    case '=':
                    case '+':
                        e.preventDefault();
                        this.increaseFontSize();
                        break;
                    case '-':
                        e.preventDefault();
                        this.decreaseFontSize();
                        break;
                    case '0':
                        e.preventDefault();
                        this.resetFontSize();
                        break;
                }
            }
        });
    }

    increaseFontSize() {
        if (this.fontSize < this.maxFontSize) {
            this.fontSize += 1;
            this.updateEditorFontSize();
        }
    }

    decreaseFontSize() {
        if (this.fontSize > this.minFontSize) {
            this.fontSize -= 1;
            this.updateEditorFontSize();
        }
    }

    resetFontSize() {
        this.fontSize = 14;
        this.updateEditorFontSize();
    }

    updateEditorFontSize() {
        if (this.editor) {
            this.editor.updateOptions({ fontSize: this.fontSize });
        }
    }

    setupThemeToggle() {
        const themeToggle = document.getElementById('themeToggle');
        
        themeToggle.addEventListener('click', () => {
            // VSCode theme toggle placeholder
            console.log('Theme toggle clicked');
        });

        // Set VSCode dark theme
        if (this.editor) {
            monaco.editor.setTheme('vs-dark');
        }
    }

    setupRunCode() {
        const runBtn = document.getElementById('runBtn');
        const output = document.getElementById('output');
        
        runBtn.addEventListener('click', async () => {
            const code = this.editor.getValue();
            const input = document.getElementById('input').value;
            const activeTab = this.tabs[this.activeTabIndex];
            
            if (activeTab) {
                // Show loading message
                output.textContent = 'Running...';
                runBtn.disabled = true;
                runBtn.textContent = '⏳ Running...';
                
                try {
                    const result = await this.codeExecutor.executeCode(code, activeTab.language, input);
                    output.textContent = result;
                } catch (error) {
                    output.textContent = 'Error: ' + error.message;
                } finally {
                    // Reset button
                    runBtn.disabled = false;
                    runBtn.textContent = '▶ Run';
                }
            } else {
                output.textContent = 'No active tab';
            }
        });
    }

    // Track content changes for dirty state
    trackContentChanges() {
        if (this.editor) {
            this.editor.onDidChangeModelContent(() => {
                if (this.tabs[this.activeTabIndex]) {
                    this.tabs[this.activeTabIndex].isDirty = true;
                    this.renderTabs();
                }
            });
        }
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new CodeEditor();
}); 