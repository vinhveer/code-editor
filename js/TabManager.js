class TabManager {
    constructor(codeExecutor) {
        this.tabs = [];
        this.activeTabIndex = 0;
        this.codeExecutor = codeExecutor;
        this.editor = null;
        
        this.setupEventListeners();
    }

    setEditor(editor) {
        this.editor = editor;
        this.trackContentChanges();
    }

    setupEventListeners() {
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
                        this.showLanguageSelectionModal();
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
        this.activeTabIndex = 0;
        this.renderTabs();
        this.updateEditorContent();
    }

    showLanguageSelectionModal() {
        const backdrop = document.createElement('div');
        backdrop.className = 'modal-backdrop fixed inset-0 bg-black bg-opacity-50 dark:bg-black dark:bg-opacity-70 z-50 flex items-center justify-center';
        
        const languages = this.codeExecutor.getSupportedLanguages();
        const languageOptions = Object.keys(languages).map(key => 
            `<button class="language-option w-full px-3 py-2 text-left border border-vscode-border dark:border-gray-600 rounded hover:bg-vscode-tab-hover dark:hover:bg-gray-700 transition-colors mb-2" data-language="${key}">
                <div class="font-medium text-vscode-text dark:text-gray-100 text-sm">${languages[key].name}</div>
                <div class="text-xs text-vscode-text-dim dark:text-gray-400">${languages[key].extension}</div>
            </button>`
        ).join('');
        
        backdrop.innerHTML = `
            <div class="modal-content bg-vscode-sidebar dark:bg-gray-800 border border-vscode-border dark:border-gray-600 rounded p-6 w-96 max-w-md">
                <h3 class="text-sm font-medium text-vscode-text dark:text-gray-100 mb-4">Chọn ngôn ngữ lập trình</h3>
                <div class="language-list space-y-2">
                    ${languageOptions}
                </div>
                <div class="flex justify-end mt-4">
                    <button class="cancel-btn px-3 py-1 text-vscode-text-dim dark:text-gray-400 hover:text-vscode-text dark:hover:text-gray-200 hover:bg-vscode-tab-hover dark:hover:bg-gray-700 transition-colors text-xs">Hủy</button>
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
                    ? 'bg-vscode-tab-active dark:bg-gray-700 text-vscode-text dark:text-gray-100' 
                    : 'bg-vscode-tab dark:bg-gray-800 text-vscode-text-dim dark:text-gray-400 hover:bg-vscode-tab-hover dark:hover:bg-gray-700'
            } px-4 py-2 text-sm font-normal cursor-pointer transition-all duration-150 border-r border-vscode-border dark:border-gray-600" data-index="${index}">
                <span class="truncate max-w-32">${tab.name}</span>
                ${tab.isDirty ? '<span class="ml-2 w-2 h-2 bg-white dark:bg-gray-300 rounded-full flex-shrink-0"></span>' : ''}
                <!-- SVG ICON XÓA TAB - Nút close tab với icon X -->
                <button class="tab-close ml-3 p-1 rounded hover:bg-vscode-border dark:hover:bg-gray-600 opacity-0 group-hover:opacity-100 transition-all duration-150 flex-shrink-0 flex items-center justify-center" data-index="${index}">
                    <!-- Icon X để đóng tab -->
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                </button>
            </div>
        `).join('') + `
            <div class="tab-btn group relative flex items-center min-w-0 bg-vscode-tab dark:bg-gray-800 text-vscode-text-dim dark:text-gray-400 hover:bg-vscode-tab-hover dark:hover:bg-gray-700 px-4 py-2 text-sm font-normal cursor-pointer transition-all duration-150 border-r border-vscode-border dark:border-gray-600 min-h-[40px]">
                <button class="new-tab-btn flex items-center justify-center w-full h-full">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2.5">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                    </svg>
                </button>
            </div>
        `;

        // Add event listener for new tab button
        const newTabBtn = tabContainer.querySelector('.new-tab-btn');
        if (newTabBtn) {
            newTabBtn.addEventListener('click', () => {
                this.showLanguageSelectionModal();
            });
        }
    }

    showContextMenu(x, y, tabIndex) {
        this.hideContextMenu();
        
        const contextMenu = document.createElement('div');
        contextMenu.className = 'context-menu fixed bg-vscode-sidebar dark:bg-gray-800 border border-vscode-border dark:border-gray-600 rounded shadow-lg py-1 z-50';
        contextMenu.style.left = x + 'px';
        contextMenu.style.top = y + 'px';
        
        contextMenu.innerHTML = `
            <button class="context-rename w-full px-3 py-2 text-left text-xs text-vscode-text dark:text-gray-100 hover:bg-vscode-tab-hover dark:hover:bg-gray-700 transition-colors">
                Đổi tên
            </button>
            <button class="context-download w-full px-3 py-2 text-left text-xs text-vscode-text dark:text-gray-100 hover:bg-vscode-tab-hover dark:hover:bg-gray-700 transition-colors">
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
        backdrop.className = 'modal-backdrop fixed inset-0 bg-black bg-opacity-50 dark:bg-black dark:bg-opacity-70 z-50 flex items-center justify-center';
        
        backdrop.innerHTML = `
            <div class="modal-content bg-vscode-sidebar dark:bg-gray-800 border border-vscode-border dark:border-gray-600 rounded p-6 w-96 max-w-md">
                <h3 class="text-sm font-medium text-vscode-text dark:text-gray-100 mb-4">Đổi tên tập tin</h3>
                <input type="text" id="renameInput" class="w-full px-3 py-2 border border-vscode-border dark:border-gray-600 rounded bg-vscode-input dark:bg-gray-700 text-vscode-text dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-vscode-accent dark:focus:ring-blue-500" value="${tab.name}">
                <div class="flex justify-end mt-4 space-x-2">
                    <button class="cancel-btn px-3 py-1 text-vscode-text-dim dark:text-gray-400 hover:text-vscode-text dark:hover:text-gray-200 hover:bg-vscode-tab-hover dark:hover:bg-gray-700 transition-colors text-xs">Hủy</button>
                    <button class="save-btn px-3 py-1 bg-vscode-button dark:bg-blue-600 hover:bg-vscode-button-hover dark:hover:bg-blue-700 text-white rounded transition-colors text-xs">Lưu</button>
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

    getCurrentTab() {
        return this.tabs[this.activeTabIndex];
    }

    getAllTabs() {
        return this.tabs;
    }
} 