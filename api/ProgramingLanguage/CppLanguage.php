<?php

require_once 'IBaseLanguage.php';

class CppLanguage implements IBaseLanguage
{
    private string $code;
    
    public function __construct(string $code)
    {
        $this->code = $code;
    }
    
    /**
     * Execute C++ code with given input
     * 
     * @param string $input Input data for the code execution
     * @return string Output result from code execution
     */
    public function run(string $input): string
    {
        try {
            // Create temporary files
            $tempDir = sys_get_temp_dir();
            $sourceFile = $tempDir . '/temp_' . uniqid() . '.cpp';
            $executableFile = $tempDir . '/temp_' . uniqid();
            $inputFile = $tempDir . '/input_' . uniqid() . '.txt';
            
            // Write C++ code to file
            file_put_contents($sourceFile, $this->code);
            
            // Write input to file
            file_put_contents($inputFile, $input);
            
            // Compile C++ code
            $compileCommand = "g++ -o " . escapeshellarg($executableFile) . " " . escapeshellarg($sourceFile) . " 2>&1";
            $compileOutput = shell_exec($compileCommand);
            
            // Check if compilation was successful
            if (!file_exists($executableFile)) {
                $this->cleanup([$sourceFile, $inputFile]);
                return "Compilation Error:\n" . $compileOutput;
            }
            
            // Execute the compiled program with input
            $executeCommand = escapeshellarg($executableFile) . " < " . escapeshellarg($inputFile) . " 2>&1";
            $output = shell_exec($executeCommand);
            
            // Cleanup temporary files
            $this->cleanup([$sourceFile, $executableFile, $inputFile]);
            
            return $output ?: "No output";
            
        } catch (Exception $e) {
            return "Error: " . $e->getMessage();
        }
    }
    
    /**
     * Clean up temporary files
     * 
     * @param array $files Array of file paths to delete
     */
    private function cleanup(array $files): void
    {
        foreach ($files as $file) {
            if (file_exists($file)) {
                unlink($file);
            }
        }
    }
}
