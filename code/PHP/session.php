<?php
// this page is used to check if the user is logged in 
// if the user is logged in it returns all the user data and shows them in the profile page.
header('Content-Type: application/json');
session_start();

// chek if the user is logged in.
if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(['loggedIn' => false]);
    exit;
}

require_once 'db.php';

// get the user data from the database using the user id stored in the session.
$stmt = $pdo->prepare('SELECT name, username, first_name, last_name, email, role FROM users WHERE id = ?');
$stmt->execute([$_SESSION['user_id']]);
$user = $stmt->fetch(PDO::FETCH_ASSOC);

if (!$user) {
    http_response_code(401);
    echo json_encode(['loggedIn' => false]);
    exit;
}

// if the user is logged in return all the user data to the frontend to show them in the profile page (with a JSON).
echo json_encode([
    'loggedIn'  => true,
    'name'      => $user['name'],
    'username'  => $user['username'],
    'firstName' => $user['first_name'],
    'lastName'  => $user['last_name'],
    'email'     => $user['email'],
    'role'      => $user['role']
]);
