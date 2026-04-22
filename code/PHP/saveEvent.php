<?php
header('Content-Type: application/json');
session_start();
require_once 'db.php';

// only allow admins to create events
if (!isset($_SESSION['user_id']) || $_SESSION['user_role'] !== 'admin') {
    echo json_encode(['success' => false, 'message' => 'Unauthorized']);
    exit;
}

$data = json_decode(file_get_contents('php://input'), true);

if (!$data) {
    echo json_encode(['success' => false, 'message' => 'Invalid JSON request body']);
    exit;
}

$sql = "INSERT INTO events (title, event_date, event_time, location, description, type, admin_id) 
        VALUES (?, ?, ?, ?, ?, ?, ?)";
$stmt = $pdo->prepare($sql);

try {
    $success = $stmt->execute([
        $data['title'],
        $data['event_date'],
        $data['event_time'],
        $data['location'],
        $data['description'],
        $data['type'],
        $_SESSION['user_id']
    ]);
    echo json_encode(['success' => $success]);
} catch (PDOException $e) {
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}