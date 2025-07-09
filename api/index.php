<?php

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Only allow POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit();
}

// Get JSON input
$input = json_decode(file_get_contents('php://input'), true);

// Validate input
if (!$input || !isset($input['code']) || !isset($input['language'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Missing required fields: code, language']);
    exit();
}

$code = $input['code'];
$language = $input['language'];
$userInput = $input['input'] ?? '';

// Include language classes
require_once 'ProgramingLanguage/IBaseLanguage.php';
require_once 'ProgramingLanguage/CppLanguage.php';
require_once 'ProgramingLanguage/PythonLanguage.php';

try {
    $executor = null;
    
    switch ($language) {
        case 'cpp':
            $executor = new CppLanguage($code);
            break;
        case 'python':
            $executor = new PythonLanguage($code);
            break;
        case 'javascript':
            // JavaScript execution handled on frontend
            http_response_code(400);
            echo json_encode(['error' => 'JavaScript execution is handled on the frontend']);
            exit();
        default:
            http_response_code(400);
            echo json_encode(['error' => 'Unsupported language: ' . $language]);
            exit();
    }
    
    // Execute code
    $output = $executor->run($userInput);
    
    // Return result
    echo json_encode([
        'success' => true,
        'output' => $output,
        'language' => $language
    ]);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'error' => 'Execution failed: ' . $e->getMessage()
    ]);
}
