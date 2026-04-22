<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    exit;
}

require_once 'db.php';

$data       = json_decode(file_get_contents('php://input'), true);
$username   = trim($data['username']   ?? '');
$firstName  = trim($data['firstName']  ?? '');
$lastName   = trim($data['lastName']   ?? '');
$birthDate  = trim($data['birthDate']  ?? '');
$email      = trim($data['email']      ?? '');
$password   = $data['password']        ?? '';
$role       = trim($data['role']       ?? 'student');

if (!$username || !$firstName || !$lastName || !$birthDate || !$email || !$password) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'All fields are required']);
    exit;
}

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

$check = $pdo->prepare('SELECT id FROM users WHERE email = ? OR username = ?');
$check->execute([$email, $username]);
if ($check->fetch()) {
    http_response_code(409);
    echo json_encode(['success' => false, 'message' => 'Email or username already in use']);
    exit;
}

$hash = password_hash($password, PASSWORD_BCRYPT);
$stmt = $pdo->prepare('INSERT INTO users (name, username, first_name, last_name, birth_date, email, password_hash,role) VALUES (?, ?, ?, ?, ?, ?, ?, ?)');
$stmt->execute(["$firstName $lastName", $username, $firstName, $lastName, $birthDate, $email, $hash,$role]);

session_start();
$_SESSION['user_id']   = $pdo->lastInsertId();
$_SESSION['user_name'] = "$firstName $lastName";
$_SESSION['user_role'] = $role;

echo json_encode(['success' => true]);
