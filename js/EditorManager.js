class EditorManager {
    constructor() {
        this.editor = null;
        this.codeExecutor = null;
        this.activeTab = null;
        this.fontSize = 14;
        this.minFontSize = 10;
        this.maxFontSize = 24;
        this.intellisenseEnabled = localStorage.getItem('intellisenseEnabled') !== 'false';
        this.languageConfigs = {
            javascript: {
                completionItems: [
                    { label: 'console.log', insertText: 'console.log(${1:message});', kind: 'Function' },
                    { label: 'console.error', insertText: 'console.error(${1:error});', kind: 'Function' },
                    { label: 'function', insertText: 'function ${1:name}(${2:params}) {\n\t${3:// code}\n}', kind: 'Snippet' },
                    { label: 'if', insertText: 'if (${1:condition}) {\n\t${2:// code}\n}', kind: 'Snippet' },
                    { label: 'ifelse', insertText: 'if (${1:condition}) {\n\t${2:// code}\n} else {\n\t${3:// code}\n}', kind: 'Snippet' },
                    { label: 'for', insertText: 'for (let ${1:i} = 0; ${1:i} < ${2:length}; ${1:i}++) {\n\t${3:// code}\n}', kind: 'Snippet' },
                    { label: 'forin', insertText: 'for (const ${1:key} in ${2:object}) {\n\t${3:// code}\n}', kind: 'Snippet' },
                    { label: 'forof', insertText: 'for (const ${1:item} of ${2:array}) {\n\t${3:// code}\n}', kind: 'Snippet' },
                    { label: 'while', insertText: 'while (${1:condition}) {\n\t${2:// code}\n}', kind: 'Snippet' },
                    { label: 'try', insertText: 'try {\n\t${1:// code}\n} catch (${2:error}) {\n\t${3:// handle error}\n}', kind: 'Snippet' },
                    { label: 'const', insertText: 'const ${1:name} = ${2:value};', kind: 'Snippet' },
                    { label: 'let', insertText: 'let ${1:name} = ${2:value};', kind: 'Snippet' },
                    { label: 'var', insertText: 'var ${1:name} = ${2:value};', kind: 'Snippet' },
                    { label: 'arrow', insertText: '(${1:params}) => {\n\t${2:// code}\n}', kind: 'Snippet' },
                    { label: 'switch', insertText: 'switch (${1:expression}) {\n\tcase ${2:value}:\n\t\t${3:// code}\n\t\tbreak;\n\tdefault:\n\t\t${4:// code}\n}', kind: 'Snippet' }
                ]
            },
            python: {
                completionItems: [
                    { label: 'print', insertText: 'print(${1:message})', kind: 'Function' },
                    { label: 'def', insertText: 'def ${1:function_name}(${2:params}):\n\t${3:pass}', kind: 'Snippet' },
                    { label: 'if', insertText: 'if ${1:condition}:\n\t${2:pass}', kind: 'Snippet' },
                    { label: 'for', insertText: 'for ${1:item} in ${2:iterable}:\n\t${3:pass}', kind: 'Snippet' },
                    { label: 'while', insertText: 'while ${1:condition}:\n\t${2:pass}', kind: 'Snippet' },
                    { label: 'try', insertText: 'try:\n\t${1:pass}\nexcept ${2:Exception} as ${3:e}:\n\t${4:pass}', kind: 'Snippet' },
                    { label: 'class', insertText: 'class ${1:ClassName}:\n\tdef __init__(self${2:, params}):\n\t\t${3:pass}', kind: 'Snippet' },
                    { label: 'import', insertText: 'import ${1:module}', kind: 'Snippet' },
                    { label: 'from', insertText: 'from ${1:module} import ${2:item}', kind: 'Snippet' },
                    { label: 'with', insertText: 'with ${1:expression} as ${2:variable}:\n\t${3:pass}', kind: 'Snippet' }
                ]
            },
            cpp: {
                completionItems: [
                    { label: 'cout', insertText: 'std::cout << ${1:message} << std::endl;', kind: 'Function' },
                    { label: 'cin', insertText: 'std::cin >> ${1:variable};', kind: 'Function' },
                    { label: 'main', insertText: 'int main() {\n\t${1:// code}\n\treturn 0;\n}', kind: 'Snippet' },
                    { label: 'if', insertText: 'if (${1:condition}) {\n\t${2:// code}\n}', kind: 'Snippet' },
                    { label: 'for', insertText: 'for (int ${1:i} = 0; ${1:i} < ${2:n}; ${1:i}++) {\n\t${3:// code}\n}', kind: 'Snippet' },
                    { label: 'while', insertText: 'while (${1:condition}) {\n\t${2:// code}\n}', kind: 'Snippet' },
                    { label: 'function', insertText: '${1:returnType} ${2:functionName}(${3:params}) {\n\t${4:// code}\n}', kind: 'Snippet' },
                    { label: 'vector', insertText: 'std::vector<${1:type}> ${2:name};', kind: 'Snippet' },
                    { label: 'string', insertText: 'std::string ${1:name};', kind: 'Snippet' },
                    { label: 'include', insertText: '#include <${1:header}>', kind: 'Snippet' }
                ]
            }
        };
        
        this.init();
    }

    init() {
        this.setupMonacoEditor();
        this.setupIntellisenseToggle();
    }

    setCodeExecutor(codeExecutor) {
        this.codeExecutor = codeExecutor;
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
                scrollBeyondLastLine: false,
                quickSuggestions: this.intellisenseEnabled,
                suggestOnTriggerCharacters: this.intellisenseEnabled,
                acceptSuggestionOnEnter: this.intellisenseEnabled ? 'on' : 'off',
                wordBasedSuggestions: this.intellisenseEnabled,
                parameterHints: { enabled: this.intellisenseEnabled },
                autoClosingBrackets: this.intellisenseEnabled ? 'always' : 'never',
                autoClosingQuotes: this.intellisenseEnabled ? 'always' : 'never'
            });

            this.setupCustomCompletionProviders();
            this.setupFontSizeControls();
            this.setupRunCode();
            
            // Notify that editor is ready
            this.onEditorReady();
        });
    }

    setupCustomCompletionProviders() {
        // Register completion providers for each Monaco language
        const monacoLanguages = ['javascript', 'python', 'cpp'];
        
        monacoLanguages.forEach(monacoLang => {
            monaco.languages.registerCompletionItemProvider(monacoLang, {
                provideCompletionItems: (model, position) => {
                    if (!this.intellisenseEnabled) return { suggestions: [] };
                    
                    // Get current active tab language
                    const currentLanguage = this.activeTab?.language;
                    if (!currentLanguage) return { suggestions: [] };
                    
                    // Get current model language
                    const modelLanguage = model.getLanguageId();
                    const expectedMonacoLang = this.getMonacoLanguage(currentLanguage);
                    
                    // Only provide suggestions if languages match
                    if (modelLanguage !== expectedMonacoLang) {
                        return { suggestions: [] };
                    }
                    
                    const config = this.languageConfigs[currentLanguage];
                    if (!config) return { suggestions: [] };
                    
                    const suggestions = config.completionItems.map(item => ({
                        label: item.label,
                        kind: monaco.languages.CompletionItemKind[item.kind] || monaco.languages.CompletionItemKind.Text,
                        insertText: item.insertText,
                        insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                        range: {
                            startLineNumber: position.lineNumber,
                            endLineNumber: position.lineNumber,
                            startColumn: position.column,
                            endColumn: position.column
                        }
                    }));
                    
                    return { suggestions };
                }
            });
        });
    }

    setupIntellisenseToggle() {
        const toggleBtn = document.getElementById('intellisenseToggle');
        if (!toggleBtn) return;

        this.updateIntellisenseToggleUI();

        toggleBtn.addEventListener('click', () => {
            this.toggleIntellisense();
        });
    }

    toggleIntellisense() {
        this.intellisenseEnabled = !this.intellisenseEnabled;
        this.updateIntellisenseToggleUI();
        
        // Update editor options
        if (this.editor) {
            this.editor.updateOptions({
                quickSuggestions: this.intellisenseEnabled,
                suggestOnTriggerCharacters: this.intellisenseEnabled,
                acceptSuggestionOnEnter: this.intellisenseEnabled ? 'on' : 'off',
                wordBasedSuggestions: this.intellisenseEnabled,
                parameterHints: { enabled: this.intellisenseEnabled },
                autoClosingBrackets: this.intellisenseEnabled ? 'always' : 'never',
                autoClosingQuotes: this.intellisenseEnabled ? 'always' : 'never'
            });
        }

        // Save preference
        localStorage.setItem('intellisenseEnabled', this.intellisenseEnabled);
    }

    updateIntellisenseToggleUI() {
        const toggleBtn = document.getElementById('intellisenseToggle');
        if (!toggleBtn) return;

        const icon = toggleBtn.querySelector('.intellisense-icon');
        if (this.intellisenseEnabled) {
            toggleBtn.classList.add('vscode-button');
            toggleBtn.classList.remove('vscode-tab');
            toggleBtn.title = 'Disable Intellisense';
            icon.style.opacity = '1';
        } else {
            toggleBtn.classList.remove('vscode-button');
            toggleBtn.classList.add('vscode-tab');
            toggleBtn.title = 'Enable Intellisense';
            icon.style.opacity = '0.5';
        }
    }

    getMonacoLanguage(language) {
        const mapping = {
            javascript: 'javascript',
            python: 'python',
            cpp: 'cpp'
        };
        return mapping[language];
    }

    onEditorReady() {
        // Dispatch custom event when editor is ready
        const event = new CustomEvent('editorReady', { detail: { editor: this.editor } });
        document.dispatchEvent(event);
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

        // Keyboard shortcuts for font size and save
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
                    case 's':
                        e.preventDefault();
                        this.handleSave();
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



    setupRunCode() {
        const runBtn = document.getElementById('runBtn');
        const output = document.getElementById('output');
        
        runBtn.addEventListener('click', async () => {
            if (!this.codeExecutor) {
                output.textContent = 'Code executor not initialized';
                return;
            }
            
            const code = this.editor.getValue();
            const input = document.getElementById('input').value;
            
            // Show loading message
            output.textContent = 'Running...';
            runBtn.disabled = true;
            runBtn.textContent = '⏳ Running...';
            
            try {
                // Get active tab language
                const activeTab = this.activeTab;
                if (activeTab && activeTab.language) {
                    const result = await this.codeExecutor.executeCode(code, activeTab.language, input);
                    
                    // Check if result contains error
                    if (result && (result.includes('Error:') || result.includes('Compilation Error:'))) {
                        // Show error modal
                        if (window.app) {
                            window.app.showErrorModal('Lỗi thực thi code', result);
                        }
                        output.textContent = result;
                    } else {
                        output.textContent = result;
                    }
                } else {
                    output.textContent = 'No active tab or language not set';
                }
            } catch (error) {
                const errorMessage = 'Error: ' + error.message;
                output.textContent = errorMessage;
                
                // Show error modal
                if (window.app) {
                    window.app.showErrorModal('Lỗi thực thi code', errorMessage);
                }
            } finally {
                // Reset button
                runBtn.disabled = false;
                runBtn.textContent = 'Run';
            }
        });
    }

    getActiveTab() {
        return this.activeTab;
    }

    setActiveTab(tab) {
        this.activeTab = tab;
    }

    setValue(content) {
        if (this.editor) {
            this.editor.setValue(content);
        }
    }

    getValue() {
        if (this.editor) {
            return this.editor.getValue();
        }
        return '';
    }

    setLanguage(language) {
        if (this.editor && this.codeExecutor) {
            const languageInfo = this.codeExecutor.getLanguageInfo(language);
            if (languageInfo) {
                monaco.editor.setModelLanguage(this.editor.getModel(), languageInfo.monacoLanguage);
            }
        }
    }

    focus() {
        if (this.editor) {
            this.editor.focus();
        }
    }

    onDidChangeModelContent(callback) {
        if (this.editor) {
            return this.editor.onDidChangeModelContent(callback);
        }
    }

    updateOptions(options) {
        if (this.editor) {
            this.editor.updateOptions(options);
        }
    }

    getEditor() {
        return this.editor;
    }

    handleSave() {
        // Dispatch custom event for save action
        const saveEvent = new CustomEvent('saveRequested', {
            detail: {
                content: this.getValue(),
                activeTab: this.activeTab
            }
        });
        document.dispatchEvent(saveEvent);
    }

    dispose() {
        if (this.editor) {
            this.editor.dispose();
        }
    }
} 