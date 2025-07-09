class ModalManager {
    constructor() {
        this.activeModal = null;
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Close modal on Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.activeModal) {
                this.closeModal();
            }
        });
    }

    createModal(title, content, options = {}) {
        this.closeModal(); // Close any existing modal
        
        const backdrop = document.createElement('div');
        backdrop.className = 'modal-backdrop fixed inset-0 bg-black bg-opacity-50 dark:bg-black dark:bg-opacity-70 z-50 flex items-center justify-center';
        
        const modal = document.createElement('div');
        modal.className = 'modal-content bg-vscode-sidebar dark:bg-gray-800 border border-vscode-border dark:border-gray-600 rounded p-6 w-1/2 max-w-none';
        
        modal.innerHTML = `
            <h3 class="text-sm font-medium text-vscode-text dark:text-gray-100 mb-4">${title}</h3>
            <div class="modal-body">
                ${content}
            </div>
        `;
        
        backdrop.appendChild(modal);
        document.body.appendChild(backdrop);
        
        this.activeModal = backdrop;
        
        // Close on backdrop click
        backdrop.addEventListener('click', (e) => {
            if (e.target === backdrop && options.closeOnBackdrop !== false) {
                this.closeModal();
            }
        });
        
        return { backdrop, modal };
    }

    createLanguageSelectionModal(languages, onSelect, onCancel) {
        const languageOptions = Object.keys(languages).map(key => 
            `<button class="language-option w-full px-3 py-2 text-left border border-vscode-border dark:border-gray-600 rounded hover:bg-vscode-tab-hover dark:hover:bg-gray-700 transition-colors mb-2" data-language="${key}">
                <div class="font-medium text-vscode-text dark:text-gray-100 text-sm">${languages[key].name}</div>
                <div class="text-xs text-vscode-text-dim dark:text-gray-400">${languages[key].extension}</div>
            </button>`
        ).join('');
        
        const content = `
            <div class="language-list space-y-2">
                ${languageOptions}
            </div>
            <div class="flex justify-end mt-4">
                <button class="cancel-btn px-3 py-1 text-vscode-text-dim dark:text-gray-400 hover:text-vscode-text dark:hover:text-gray-200 hover:bg-vscode-tab-hover dark:hover:bg-gray-700 transition-colors text-xs">Hủy</button>
            </div>
        `;
        
        const { backdrop, modal } = this.createModal('Chọn ngôn ngữ lập trình', content);
        
        // Event listeners
        modal.querySelector('.cancel-btn').addEventListener('click', () => {
            this.closeModal();
            if (onCancel) onCancel();
        });
        
        modal.querySelectorAll('.language-option').forEach(btn => {
            btn.addEventListener('click', () => {
                const language = btn.dataset.language;
                this.closeModal();
                if (onSelect) onSelect(language);
            });
        });
        
        return backdrop;
    }

    createRenameModal(currentName, onSave, onCancel) {
        const content = `
            <input type="text" id="renameInput" class="w-full px-3 py-2 border border-vscode-border dark:border-gray-600 rounded bg-vscode-input dark:bg-gray-700 text-vscode-text dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-vscode-accent dark:focus:ring-blue-500" value="${currentName}">
            <div class="flex justify-end mt-4 space-x-2">
                <button class="cancel-btn px-3 py-1 text-vscode-text-dim dark:text-gray-400 hover:text-vscode-text dark:hover:text-gray-200 hover:bg-vscode-tab-hover dark:hover:bg-gray-700 transition-colors text-xs">Hủy</button>
                <button class="save-btn px-3 py-1 bg-vscode-button dark:bg-blue-600 hover:bg-vscode-button-hover dark:hover:bg-blue-700 text-white rounded transition-colors text-xs">Lưu</button>
            </div>
        `;
        
        const { backdrop, modal } = this.createModal('Đổi tên tập tin', content);
        
        const input = modal.querySelector('#renameInput');
        input.focus();
        input.select();
        
        // Event listeners
        modal.querySelector('.cancel-btn').addEventListener('click', () => {
            this.closeModal();
            if (onCancel) onCancel();
        });
        
        modal.querySelector('.save-btn').addEventListener('click', () => {
            const newName = input.value.trim();
            this.closeModal();
            if (onSave) onSave(newName);
        });
        
        // Close on Enter key
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                modal.querySelector('.save-btn').click();
            } else if (e.key === 'Escape') {
                this.closeModal();
            }
        });
        
        return backdrop;
    }

    createContextMenu(x, y, items) {
        this.closeContextMenu(); // Close any existing context menu
        
        const contextMenu = document.createElement('div');
        contextMenu.className = 'context-menu fixed bg-vscode-sidebar dark:bg-gray-800 border border-vscode-border dark:border-gray-600 rounded shadow-lg py-1 z-50';
        contextMenu.style.left = x + 'px';
        contextMenu.style.top = y + 'px';
        
        const menuItems = items.map(item => 
            `<button class="context-item w-full px-3 py-2 text-left text-xs text-vscode-text dark:text-gray-100 hover:bg-vscode-tab-hover dark:hover:bg-gray-700 transition-colors" data-action="${item.action}">
                ${item.label}
            </button>`
        ).join('');
        
        contextMenu.innerHTML = menuItems;
        document.body.appendChild(contextMenu);
        
        // Add event listeners
        contextMenu.querySelectorAll('.context-item').forEach(btn => {
            btn.addEventListener('click', () => {
                const action = btn.dataset.action;
                const item = items.find(i => i.action === action);
                this.closeContextMenu();
                if (item && item.onClick) item.onClick();
            });
        });
        
        // Close on click outside
        const closeHandler = (e) => {
            if (!e.target.closest('.context-menu')) {
                this.closeContextMenu();
                document.removeEventListener('click', closeHandler);
            }
        };
        
        setTimeout(() => {
            document.addEventListener('click', closeHandler);
        }, 0);
        
        return contextMenu;
    }

    closeModal() {
        if (this.activeModal) {
            this.activeModal.remove();
            this.activeModal = null;
        }
    }

    closeContextMenu() {
        const existingMenu = document.querySelector('.context-menu');
        if (existingMenu) {
            existingMenu.remove();
        }
    }

    showConfirmDialog(title, message, onConfirm, onCancel) {
        const content = `
            <p class="text-vscode-text dark:text-gray-100 text-sm mb-4">${message}</p>
            <div class="flex justify-end space-x-2">
                <button class="cancel-btn px-3 py-1 text-vscode-text-dim dark:text-gray-400 hover:text-vscode-text dark:hover:text-gray-200 hover:bg-vscode-tab-hover dark:hover:bg-gray-700 transition-colors text-xs">Hủy</button>
                <button class="confirm-btn px-3 py-1 bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800 text-white rounded transition-colors text-xs">Xác nhận</button>
            </div>
        `;
        
        const { backdrop, modal } = this.createModal(title, content);
        
        modal.querySelector('.cancel-btn').addEventListener('click', () => {
            this.closeModal();
            if (onCancel) onCancel();
        });
        
        modal.querySelector('.confirm-btn').addEventListener('click', () => {
            this.closeModal();
            if (onConfirm) onConfirm();
        });
        
        return backdrop;
    }

    showNotification(message, type = 'info', duration = 3000) {
        const notification = document.createElement('div');
        const bgColor = type === 'error' ? 'bg-red-600 dark:bg-red-700' : type === 'success' ? 'bg-green-600 dark:bg-green-700' : 'bg-vscode-button dark:bg-blue-600';
        
        notification.className = `fixed bottom-4 left-4 ${bgColor} text-white px-4 py-2 rounded shadow-lg z-50 text-sm transition-all duration-300`;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        // Auto remove after duration
        setTimeout(() => {
            notification.style.opacity = '0';
            notification.style.transform = 'translateX(-100%)';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.remove();
                }
            }, 300);
        }, duration);
        
        return notification;
    }

    createErrorModal(title, errorMessage) {
        const content = `
            <div class="error-content">
                <div class="error-message bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded p-3 mb-4">
                    <pre class="text-red-800 dark:text-red-200 text-xs font-mono whitespace-pre-wrap overflow-x-auto">${errorMessage}</pre>
                </div>
                <div class="flex justify-end">
                    <button class="close-btn px-3 py-1 bg-vscode-button dark:bg-blue-600 hover:bg-vscode-button-hover dark:hover:bg-blue-700 text-white rounded transition-colors text-xs">Đóng</button>
                </div>
            </div>
        `;
        
        const { backdrop, modal } = this.createModal(title, content);
        
        modal.querySelector('.close-btn').addEventListener('click', () => {
            this.closeModal();
        });
        
        return backdrop;
    }
} 