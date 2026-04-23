<?php
// this is the file which allows administrators to add new events to the database.
header('Content-Type: application/json');
session_start();
require_once 'db.php';

// only allow admins to create events, chek if the user is logged in and has the admin role.
if (!isset($_SESSION['user_id']) || $_SESSION['user_role'] !== 'admin') {
    echo json_encode(['success' => false, 'message' => 'Unauthorized']);
    exit;
}

$data = json_decode(file_get_contents('php://input'), true); // Use php://input ,receives a JSON sent by the browser and trasform it into a PHP array.

if (!$data) {
    echo json_encode(['success' => false, 'message' => 'Invalid JSON request body']); // if the data is not valid JSON, return an error message.
    exit;
}

$sql = "INSERT INTO events (title, event_date, event_time, location, description, type, admin_id) 
        VALUES (?, ?, ?, ?, ?, ?, ?)"; // Here we prepare the insertion. The question marks are placeholders for the actual values that will be inserted.
$stmt = $pdo->prepare($sql);

try { // try to insert data of the new event in the database.
    $success = $stmt->execute([
        $data['title'],
        $data['event_date'],
        $data['event_time'],
        $data['location'],
        $data['description'],
        $data['type'],
        $_SESSION['user_id']
    ]);
    echo json_encode(['success' => $success]); // if the insertion is successful return a success message otherwise return an error message.
} catch (PDOException $e) {
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}