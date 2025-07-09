class App {
    constructor() {
        this.codeExecutor = new CodeExecutor();
        this.modalManager = new ModalManager();
        this.editorManager = new EditorManager();
        this.tabManager = new TabManager(this.codeExecutor);
        this.themeManager = new ThemeManager();
        this.ioManager = new IOManager();
        
        this.init();
    }

    init() {
        // Set up component relationships
        this.editorManager.setCodeExecutor(this.codeExecutor);
        
        // Listen for editor ready event
        document.addEventListener('editorReady', (event) => {
            this.onEditorReady(event.detail.editor);
        });

        // Listen for save requests
        document.addEventListener('saveRequested', (event) => {
            this.handleSaveRequest(event.detail);
        });
        
        // Update TabManager with modals
        this.updateTabManagerWithModals();
    }

    onEditorReady(editor) {
        // Connect editor to tab manager
        this.tabManager.setEditor(editor);
        
        // Create initial tab
        this.tabManager.createInitialTab();
        
        // Set up editor-tab synchronization
        this.setupEditorTabSync();
        
        // Set initial active tab in editor manager
        const initialTab = this.tabManager.getCurrentTab();
        if (initialTab) {
            this.editorManager.setActiveTab(initialTab);
        }
    }

    setupEditorTabSync() {
        // Listen for tab changes to update editor
        const originalSwitchTab = this.tabManager.switchTab.bind(this.tabManager);
        this.tabManager.switchTab = (index) => {
            originalSwitchTab(index);
            const currentTab = this.tabManager.getCurrentTab();
            this.editorManager.setActiveTab(currentTab);
        };

        // Listen for tab updates to sync editor content
        const originalUpdateEditorContent = this.tabManager.updateEditorContent.bind(this.tabManager);
        this.tabManager.updateEditorContent = () => {
            const currentTab = this.tabManager.getCurrentTab();
            if (currentTab) {
                this.editorManager.setValue(currentTab.content);
                this.editorManager.setLanguage(currentTab.language);
                this.editorManager.setActiveTab(currentTab);
            }
        };
    }

    updateTabManagerWithModals() {
        // Replace TabManager's modal methods with ModalManager methods
        this.tabManager.showLanguageSelectionModal = () => {
            const languages = this.codeExecutor.getSupportedLanguages();
            this.modalManager.createLanguageSelectionModal(
                languages,
                (language) => this.tabManager.createNewTab(language),
                () => {}
            );
        };

        this.tabManager.showRenameModal = (index) => {
            const tab = this.tabManager.getAllTabs()[index];
            if (!tab) return;

            this.modalManager.createRenameModal(
                tab.name,
                (newName) => {
                    if (newName && newName !== tab.name) {
                        tab.name = newName;
                        this.tabManager.renderTabs();
                    }
                },
                () => {}
            );
        };

        this.tabManager.showContextMenu = (x, y, tabIndex) => {
            const items = [
                {
                    label: 'Đổi tên',
                    action: 'rename',
                    onClick: () => this.tabManager.showRenameModal(tabIndex)
                },
                {
                    label: 'Tải tập tin xuống',
                    action: 'download',
                    onClick: () => this.tabManager.downloadFile(tabIndex)
                }
            ];

            this.modalManager.createContextMenu(x, y, items);
        };

        this.tabManager.hideContextMenu = () => {
            this.modalManager.closeContextMenu();
        };
    }

    // Public API methods
    getCurrentTab() {
        return this.tabManager.getCurrentTab();
    }

    getAllTabs() {
        return this.tabManager.getAllTabs();
    }

    createNewTab(language) {
        return this.tabManager.createNewTab(language);
    }

    closeTab(index) {
        return this.tabManager.closeTab(index);
    }

    switchTab(index) {
        return this.tabManager.switchTab(index);
    }

    getEditor() {
        return this.editorManager.getEditor();
    }

    showNotification(message, type = 'info', duration = 3000) {
        return this.modalManager.showNotification(message, type, duration);
    }

    showConfirmDialog(title, message, onConfirm, onCancel) {
        return this.modalManager.showConfirmDialog(title, message, onConfirm, onCancel);
    }

    showErrorModal(title, errorMessage) {
        return this.modalManager.createErrorModal(title, errorMessage);
    }

    // Theme management methods
    toggleTheme() {
        return this.themeManager.toggleTheme();
    }

    setTheme(themeName) {
        return this.themeManager.setTheme(themeName);
    }

    getCurrentTheme() {
        return this.themeManager.getCurrentTheme();
    }

    enableSystemThemeSync() {
        return this.themeManager.enableSystemThemeSync();
    }

    // IO management methods
    getInputContent() {
        return this.ioManager.getInputContent();
    }

    getOutputContent() {
        return this.ioManager.getOutputContent();
    }

    setInputContent(content) {
        return this.ioManager.setInputContent(content);
    }

    setOutputContent(content) {
        return this.ioManager.setOutputContent(content);
    }

    clearInput() {
        return this.ioManager.clearInput();
    }

    clearOutput() {
        return this.ioManager.clearOutput();
    }

    focusInput() {
        return this.ioManager.focusInput();
    }

    handleSaveRequest(detail) {
        const { content, activeTab } = detail;
        
        if (activeTab) {
            // Update tab content
            activeTab.content = content;
            activeTab.isDirty = false;
            
            // Re-render tabs to remove dirty indicator
            this.tabManager.renderTabs();
            
            // Show save notification
            this.showNotification('Save Changes', 'success', 2000);
        } else {
            this.showNotification('No active tab to save', 'error', 2000);
        }
    }

    // Cleanup method
    destroy() {
        this.editorManager.dispose();
        this.modalManager.closeModal();
        this.modalManager.closeContextMenu();
    }
} 