class CodeExecutor {
    constructor() {
        this.supportedLanguages = {
            javascript: {
                name: 'JavaScript',
                extension: '.js',
                monacoLanguage: 'javascript'
            },
            python: {
                name: 'Python',
                extension: '.py',
                monacoLanguage: 'python'
            },
            cpp: {
                name: 'C++',
                extension: '.cpp',
                monacoLanguage: 'cpp'
            }
        };
    }

    async executeCode(code, language, input = '') {
        switch (language) {
            case 'javascript':
                return this.executeJavaScript(code, input);
            case 'python':
                return await this.executePython(code, input);
            case 'cpp':
                return await this.executeCpp(code, input);
            default:
                return 'Unsupported language';
        }
    }

    executeJavaScript(code, input) {
        try {
            // Simple JavaScript execution simulation
            const originalLog = console.log;
            const originalError = console.error;
            let result = '';
            
            console.log = (...args) => {
                result += args.join(' ') + '\n';
            };
            
            console.error = (...args) => {
                result += 'Error: ' + args.join(' ') + '\n';
            };
            
            // Create a function with input available
            const func = new Function('input', code);
            func(input);
            
            console.log = originalLog;
            console.error = originalError;
            
            return result || 'No output';
        } catch (error) {
            return 'Error: ' + error.message;
        }
    }

    async executePython(code, input) {
        return await this.executeOnServer(code, 'python', input);
    }

    async executeCpp(code, input) {
        return await this.executeOnServer(code, 'cpp', input);
    }

    async executeOnServer(code, language, input) {
        try {
            const response = await fetch('api/index.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    code: code,
                    language: language,
                    input: input
                })
            });

            const result = await response.json();

            if (result.success) {
                return result.output;
            } else {
                return 'Error: ' + result.error;
            }
        } catch (error) {
            return 'Network Error: ' + error.message;
        }
    }

    getSupportedLanguages() {
        return this.supportedLanguages;
    }

    getLanguageInfo(language) {
        return this.supportedLanguages[language] || null;
    }

    getDefaultFileName(language) {
        const info = this.getLanguageInfo(language);
        if (!info) return 'untitled.txt';
        
        switch (language) {
            case 'javascript':
                return 'main.js';
            case 'python':
                return 'main.py';
            case 'cpp':
                return 'main.cpp';
            default:
                return 'untitled' + info.extension;
        }
    }
} 