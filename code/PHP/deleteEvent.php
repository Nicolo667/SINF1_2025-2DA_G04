<?php
// this page is useful to delete the event from rhe database, only admin can do it.
header('Content-Type: application/json');
session_start();

if (!isset($_SESSION['user_id']) || $_SESSION['user_role'] !== 'admin') { // control if the user is logged in and has the admin role (otherwhise error messagE).
    http_response_code(403);
    echo json_encode(['success' => false, 'message' => 'Unauthorized']);
    exit;
}

require_once 'db.php';

$data = json_decode(file_get_contents('php://input'), true); // wait for the id of the event to delete.
$event_id = $data['event_id'] ?? null;

if (!$event_id) {
    echo json_encode(['success' => false, 'message' => 'Event ID required']); // if the id doesnt exist.
    exit;
}

$stmt = $pdo->prepare('DELETE FROM events WHERE id = ? AND admin_id = ?'); // an admin can delete only the events that he create (admin_id).
$success = $stmt->execute([$event_id, $_SESSION['user_id']]);

echo json_encode(['success' => $success]);
?>