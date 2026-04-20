<?php
header('Content-Type: application/json');
session_start();

if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(['loggedIn' => false]);
    exit;
}

require_once 'db.php';

$stmt = $pdo->prepare('SELECT name, username, first_name, last_name, email, role FROM users WHERE id = ?');
$stmt->execute([$_SESSION['user_id']]);
$user = $stmt->fetch(PDO::FETCH_ASSOC);

if (!$user) {
    http_response_code(401);
    echo json_encode(['loggedIn' => false]);
    exit;
}

echo json_encode([
    'loggedIn'  => true,
    'name'      => $user['name'],
    'username'  => $user['username'],
    'firstName' => $user['first_name'],
    'lastName'  => $user['last_name'],
    'email'     => $user['email'],
    'role'      => $user['role']
]);
