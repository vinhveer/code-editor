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
        modal.className = 'modal-content vscode-bg border border-vscode-border rounded p-6 w-1/2 max-w-none shadow-lg';
        
        modal.innerHTML = `
            <h3 class="text-sm font-medium vscode-text mb-4">${title}</h3>
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
            `<button class="language-option w-full px-3 py-2 text-left border vscode-border rounded hover:vscode-tab-hover transition-colors mb-2" data-language="${key}">
                <div class="font-medium vscode-text text-sm">${languages[key].name}</div>
                <div class="text-xs vscode-text-dim">${languages[key].extension}</div>
            </button>`
        ).join('');
        
        const content = `
            <div class="language-list space-y-2">
                ${languageOptions}
            </div>
            <div class="flex justify-end mt-4">
                <button class="cancel-btn px-3 py-1 vscode-text-dim hover:vscode-text hover:vscode-tab-hover transition-colors text-xs rounded">Hủy</button>
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
            <input type="text" id="renameInput" class="w-full px-3 py-2 border vscode-border rounded vscode-input vscode-text focus:outline-none focus:ring-1 focus:ring-vscode-accent" value="${currentName}">
            <div class="flex justify-end mt-4 space-x-2">
                <button class="cancel-btn px-3 py-1 vscode-text-dim hover:vscode-text hover:vscode-tab-hover transition-colors text-xs rounded">Hủy</button>
                <button class="save-btn px-3 py-1 vscode-button hover:vscode-button-hover text-white rounded transition-colors text-xs">Lưu</button>
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
        contextMenu.className = 'context-menu fixed vscode-bg border vscode-border rounded shadow-lg py-1 z-50';
        contextMenu.style.left = x + 'px';
        contextMenu.style.top = y + 'px';
        
        const menuItems = items.map(item => 
            `<button class="context-item w-full px-3 py-2 text-left text-xs vscode-text hover:vscode-tab-hover transition-colors" data-action="${item.action}">
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
            <p class="vscode-text text-sm mb-4">${message}</p>
            <div class="flex justify-end space-x-2">
                <button class="cancel-btn px-3 py-1 vscode-text-dim hover:vscode-text hover:vscode-tab-hover transition-colors text-xs rounded">Hủy</button>
                <button class="confirm-btn px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded transition-colors text-xs">Xác nhận</button>
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
        const bgColor = type === 'error' ? 'bg-red-600' : type === 'success' ? 'bg-green-600' : 'vscode-button';
        
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
                <div class="error-message bg-red-50 border border-red-200 rounded p-3 mb-4">
                    <pre class="text-red-800 text-xs font-mono whitespace-pre-wrap overflow-x-auto">${errorMessage}</pre>
                </div>
                <div class="flex justify-end">
                    <button class="close-btn px-3 py-1 vscode-button hover:vscode-button-hover text-white rounded transition-colors text-xs">Đóng</button>
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