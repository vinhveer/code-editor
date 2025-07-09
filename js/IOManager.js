class IOManager {
    constructor() {
        this.inputElement = null;
        this.outputElement = null;
        this.init();
    }

    init() {
        this.inputElement = document.getElementById('input');
        this.outputElement = document.getElementById('output');
        
        if (this.inputElement && this.outputElement) {
            this.setupCopyButtons();
            this.setupEventListeners();
        }
    }

    setupCopyButtons() {
        // Add copy button to input section
        this.addCopyButton('input-section', 'input', 'Copy Input');
        
        // Add copy button to output section
        this.addCopyButton('output-section', 'output', 'Copy Output');
    }

    addCopyButton(sectionId, targetId, buttonText) {
        const section = document.querySelector(`[data-section="${sectionId}"]`) || 
                      document.querySelector(`.${sectionId}`) ||
                      (targetId === 'input' ? this.inputElement.parentElement : this.outputElement.parentElement);
        
        if (!section) return;

        // Find the header within the section
        const header = section.querySelector('.vscode-tab');
        if (!header) return;

        // Create copy button
        const copyButton = document.createElement('button');
        copyButton.className = 'copy-btn ml-auto px-3 py-2 text-sm vscode-text-dim dark:text-gray-400 hover:text-vscode-text dark:hover:text-gray-200 hover:bg-vscode-tab-hover dark:hover:bg-gray-700 rounded transition-all hover:scale-105 active:scale-95 opacity-80 hover:opacity-100';
        copyButton.innerHTML = `
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
            </svg>
        `;
        copyButton.title = buttonText;
        copyButton.dataset.target = targetId;

        // Make header flex and add button
        header.style.display = 'flex';
        header.style.alignItems = 'center';
        header.appendChild(copyButton);

        // Add click event
        copyButton.addEventListener('click', (e) => {
            e.preventDefault();
            this.copyContent(targetId);
        });
    }

    setupEventListeners() {
        // Add keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey) {
                switch (e.key) {
                    case 'i':
                        if (e.shiftKey) {
                            e.preventDefault();
                            this.copyContent('input');
                        }
                        break;
                    case 'o':
                        if (e.shiftKey) {
                            e.preventDefault();
                            this.copyContent('output');
                        }
                        break;
                }
            }
        });

        // Add context menu for right-click copy
        this.inputElement.addEventListener('contextmenu', (e) => {
            this.showContextMenu(e, 'input');
        });

        this.outputElement.addEventListener('contextmenu', (e) => {
            this.showContextMenu(e, 'output');
        });
    }

    async copyContent(targetId) {
        const element = document.getElementById(targetId);
        if (!element) return;

        let content = '';
        if (targetId === 'input') {
            content = element.value;
        } else if (targetId === 'output') {
            content = element.textContent || element.innerText;
        }

        if (!content.trim()) {
            this.showNotification(`No ${targetId} content to copy`, 'warning');
            return;
        }

        try {
            await navigator.clipboard.writeText(content);
            this.showNotification(`${targetId.charAt(0).toUpperCase() + targetId.slice(1)} copied to clipboard`, 'success');
            
            // Visual feedback
            this.showCopyFeedback(targetId);
        } catch (err) {
            // Fallback for older browsers
            this.fallbackCopyText(content);
            this.showNotification(`${targetId.charAt(0).toUpperCase() + targetId.slice(1)} copied to clipboard`, 'success');
        }
    }

    fallbackCopyText(text) {
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        
        try {
            document.execCommand('copy');
        } catch (err) {
            console.error('Fallback copy failed:', err);
        }
        
        document.body.removeChild(textArea);
    }

    showCopyFeedback(targetId) {
        const element = document.getElementById(targetId);
        if (!element) return;

        // Add visual feedback class
        element.classList.add('copy-feedback');
        
        // Add temporary CSS if not exists
        if (!document.querySelector('#copy-feedback-style')) {
            const style = document.createElement('style');
            style.id = 'copy-feedback-style';
            style.textContent = `
                .copy-feedback {
                    animation: copyPulse 0.3s ease-in-out;
                }
                @keyframes copyPulse {
                    0% { transform: scale(1); }
                    50% { transform: scale(1.02); }
                    100% { transform: scale(1); }
                }
            `;
            document.head.appendChild(style);
        }

        // Remove feedback class after animation
        setTimeout(() => {
            element.classList.remove('copy-feedback');
        }, 300);
    }

    showContextMenu(e, targetId) {
        e.preventDefault();
        
        // Remove existing context menu
        const existingMenu = document.querySelector('.io-context-menu');
        if (existingMenu) {
            existingMenu.remove();
        }

        const contextMenu = document.createElement('div');
        contextMenu.className = 'io-context-menu fixed bg-vscode-sidebar dark:bg-gray-800 border border-vscode-border dark:border-gray-600 rounded shadow-lg py-1 z-50';
        contextMenu.style.left = e.clientX + 'px';
        contextMenu.style.top = e.clientY + 'px';

        const copyItem = document.createElement('button');
        copyItem.className = 'w-full px-3 py-2 text-left text-xs text-vscode-text dark:text-gray-100 hover:bg-vscode-tab-hover dark:hover:bg-gray-700 transition-colors';
        copyItem.innerHTML = `
            <svg class="w-3 h-3 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
            </svg>
            Copy ${targetId.charAt(0).toUpperCase() + targetId.slice(1)}
        `;

        copyItem.addEventListener('click', () => {
            this.copyContent(targetId);
            contextMenu.remove();
        });

        contextMenu.appendChild(copyItem);
        document.body.appendChild(contextMenu);

        // Close context menu when clicking outside
        const closeHandler = (event) => {
            if (!event.target.closest('.io-context-menu')) {
                contextMenu.remove();
                document.removeEventListener('click', closeHandler);
            }
        };

        setTimeout(() => {
            document.addEventListener('click', closeHandler);
        }, 0);
    }

    showNotification(message, type = 'info') {
        // Use existing notification system if available
        if (window.codeEditorApp && window.codeEditorApp.showNotification) {
            window.codeEditorApp.showNotification(message, type, 2000);
        } else {
            // Fallback notification
            console.log(`${type.toUpperCase()}: ${message}`);
        }
    }

    // Public API methods
    getInputContent() {
        return this.inputElement ? this.inputElement.value : '';
    }

    getOutputContent() {
        return this.outputElement ? (this.outputElement.textContent || this.outputElement.innerText) : '';
    }

    setInputContent(content) {
        if (this.inputElement) {
            this.inputElement.value = content;
        }
    }

    setOutputContent(content) {
        if (this.outputElement) {
            this.outputElement.textContent = content;
        }
    }

    clearInput() {
        if (this.inputElement) {
            this.inputElement.value = '';
        }
    }

    clearOutput() {
        if (this.outputElement) {
            this.outputElement.textContent = '';
        }
    }

    focusInput() {
        if (this.inputElement) {
            this.inputElement.focus();
        }
    }
} 