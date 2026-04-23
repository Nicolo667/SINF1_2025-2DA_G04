<?php
// this php file is used to manage the registration of the users, it receives the user data from the frontend and check if they are correct,
// if they are correct it creates a new user in the database and return a success message to the frontend,
// otherwise it returns an error message.
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') { // the page accept only POST requests, if the request method is different from POST return an error message.
     // the post method is used to sent data to the server, in this case the user data (name, email, ...)  
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    exit;
}

require_once 'db.php';

// clean the data received from the frontend and check if they are correct
$data       = json_decode(file_get_contents('php://input'), true);
$username   = trim($data['username']   ?? '');
$firstName  = trim($data['firstName']  ?? '');
$lastName   = trim($data['lastName']   ?? '');
$birthDate  = trim($data['birthDate']  ?? '');
$email      = trim($data['email']      ?? '');
$password   = $data['password']        ?? '';
// If role exists and is full, use that, otherwise always write 'user' (to fix the null problem in some variables)
$role = (isset($data['role']) && trim($data['role']) === 'admin') ? 'admin' : 'user';

// every data field is required.
if (!$username || !$firstName || !$lastName || !$birthDate || !$email || !$password) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'All fields are required']);
    exit;
}

// validate email format and pw lenght.
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Invalid email address']);
    exit;
}

if (strlen($password) < 6) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Password must be at least 6 characters']);
    exit;
}

// check if the email or username already exists in the database, if they exist return an error message.
$check = $pdo->prepare('SELECT id FROM users WHERE email = ? OR username = ?');
$check->execute([$email, $username]);
if ($check->fetch()) {
    http_response_code(409);
    echo json_encode(['success' => false, 'message' => 'Email or username already in use']);
    exit;
}

// if all the data are correct create a new user in the database, hash the password for security and create a session for the user.
$hash = password_hash($password, PASSWORD_BCRYPT);
$stmt = $pdo->prepare('INSERT INTO users (name, username, first_name, last_name, birth_date, email, password_hash,role) VALUES (?, ?, ?, ?, ?, ?, ?, ?)');
$stmt->execute(["$firstName $lastName", $username, $firstName, $lastName, $birthDate, $email, $hash, $role]);

session_start();
$_SESSION['user_id']   = $pdo->lastInsertId();
$_SESSION['user_name'] = "$firstName $lastName";
$_SESSION['user_role'] = $role;

echo json_encode(['success' => true]);
