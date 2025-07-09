class ThemeManager {
    constructor() {
        this.currentTheme = 'dark'; // Default to dark theme
        this.themes = {
            dark: {
                name: 'Dark',
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
                },
                monacoTheme: 'vs-dark'
            },
            light: {
                name: 'Light',
                colors: {
                    'vscode-bg': '#ffffff',
                    'vscode-sidebar': '#f3f3f3',
                    'vscode-tab': '#e8e8e8',
                    'vscode-tab-active': '#ffffff',
                    'vscode-tab-hover': '#e0e0e0',
                    'vscode-border': '#d4d4d4',
                    'vscode-text': '#333333',
                    'vscode-text-dim': '#666666',
                    'vscode-accent': '#0078d4',
                    'vscode-input': '#ffffff',
                    'vscode-button': '#0078d4',
                    'vscode-button-hover': '#106ebe'
                },
                monacoTheme: 'vs'
            }
        };
        
        this.init();
    }

    init() {
        // Load saved theme from localStorage
        const savedTheme = localStorage.getItem('codeEditorTheme');
        if (savedTheme && this.themes[savedTheme]) {
            this.currentTheme = savedTheme;
        }

        // Apply initial theme
        this.applyTheme(this.currentTheme);
        
        // Setup theme toggle button
        this.setupThemeToggle();
        
        // Listen for Monaco editor ready
        document.addEventListener('editorReady', (event) => {
            this.applyMonacoTheme(event.detail.editor);
        });
    }

    setupThemeToggle() {
        const themeToggle = document.getElementById('themeToggle');
        if (!themeToggle) return;

        // Update button icon based on current theme
        this.updateToggleIcon();

        themeToggle.addEventListener('click', () => {
            this.toggleTheme();
        });
    }

    toggleTheme() {
        const newTheme = this.currentTheme === 'dark' ? 'light' : 'dark';
        this.setTheme(newTheme);
    }

    setTheme(themeName) {
        if (!this.themes[themeName]) return;

        this.currentTheme = themeName;
        this.applyTheme(themeName);
        this.saveTheme(themeName);
        this.updateToggleIcon();

        // Apply to Monaco editor if available
        const editor = window.app?.getEditor();
        if (editor) {
            this.applyMonacoTheme(editor);
        }

        // Dispatch theme change event
        const themeChangeEvent = new CustomEvent('themeChanged', {
            detail: { theme: themeName, colors: this.themes[themeName].colors }
        });
        document.dispatchEvent(themeChangeEvent);
    }

    applyTheme(themeName) {
        const theme = this.themes[themeName];
        if (!theme) return;

        // Toggle body class for theme
        document.body.classList.remove('theme-dark', 'theme-light');
        document.body.classList.add(`theme-${themeName}`);
        
        // Toggle dark class on HTML element for Tailwind CSS dark mode
        const htmlElement = document.documentElement;
        if (themeName === 'dark') {
            htmlElement.classList.add('dark');
        } else {
            htmlElement.classList.remove('dark');
        }
        
        // Update CSS variables for dynamic elements
        const root = document.documentElement;
        Object.entries(theme.colors).forEach(([property, value]) => {
            root.style.setProperty(`--${property}`, value);
        });
    }

    applyMonacoTheme(editor) {
        if (!editor) return;
        
        const theme = this.themes[this.currentTheme];
        if (theme && theme.monacoTheme) {
            monaco.editor.setTheme(theme.monacoTheme);
        }
    }

    updateToggleIcon() {
        const themeToggle = document.getElementById('themeToggle');
        if (!themeToggle) return;

        const icon = themeToggle.querySelector('svg');
        if (!icon) return;

        // Update icon based on current theme
        if (this.currentTheme === 'dark') {
            // Sun icon for switching to light mode
            icon.innerHTML = `
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"></path>
            `;
        } else {
            // Moon icon for switching to dark mode
            icon.innerHTML = `
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"></path>
            `;
        }

        // Update tooltip
        themeToggle.title = `Switch to ${this.currentTheme === 'dark' ? 'light' : 'dark'} theme`;
    }

    saveTheme(themeName) {
        localStorage.setItem('codeEditorTheme', themeName);
    }

    getCurrentTheme() {
        return this.currentTheme;
    }

    getThemeColors(themeName = null) {
        const theme = themeName || this.currentTheme;
        return this.themes[theme]?.colors || {};
    }

    addCustomTheme(name, config) {
        this.themes[name] = config;
    }

    // System theme detection
    detectSystemTheme() {
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            return 'dark';
        }
        return 'light';
    }

    // Auto switch based on system preference
    enableSystemThemeSync() {
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        
        const handleSystemThemeChange = (e) => {
            const systemTheme = e.matches ? 'dark' : 'light';
            this.setTheme(systemTheme);
        };

        mediaQuery.addEventListener('change', handleSystemThemeChange);
        
        // Apply system theme initially
        const systemTheme = this.detectSystemTheme();
        this.setTheme(systemTheme);

        return () => {
            mediaQuery.removeEventListener('change', handleSystemThemeChange);
        };
    }
} 