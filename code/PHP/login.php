<?php
// this file is used to manage the login of the users, it receives the email and password from the frontend and check if they are correct, 
// if they are correct it creates a session for the user and return the user data (name and role) to the frontend, otherwise it returns an error message.
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') { // only allow POST requests, if the request method is different from POST return an error message.
    // the post method is used to sent data to the server, in this case the email and password of the user.
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    exit;
}

require_once 'db.php'; // include the database connection file.

$data = json_decode(file_get_contents('php://input'), true);
$email    = trim($data['email'] ?? ''); // clean the email input by trimming whitespace.
$password = $data['password'] ?? ''; 

if (!$email || !$password) { // if the email or password is empty return an error message.
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Email and password are required']);
    exit;
}

// call the database and check if the email exists, if it exists check if the password is correct, if it is correct create a session for the user otherwise return an error message.
$stmt = $pdo->prepare('SELECT id, name, email, password_hash, role FROM users WHERE email = ?');
$stmt->execute([$email]);
$user = $stmt->fetch(PDO::FETCH_ASSOC);

// if the pw is not correct or the email does not exist return an error message.
if (!$user || !password_verify($password, $user['password_hash'])) { // use hash code because is more secure than soring pw in normal text.
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'Invalid email or password']);
    exit;
}

session_start(); // create the session for the user.
$_SESSION['user_id']   = $user['id'];
$_SESSION['user_name'] = $user['name'];
$_SESSION['user_role'] = $user['role'];

echo json_encode([
    'success' => true,
    'user'    => ['name' => $user['name'], 'role' => $user['role']]
]);
