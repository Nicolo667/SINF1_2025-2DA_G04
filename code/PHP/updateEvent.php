<?php
// php page used to update the event data in the db.
header('Content-Type: application/json');
session_start();

// only admin can do it
if (!isset($_SESSION['user_id']) || $_SESSION['user_role'] !== 'admin') {
    echo json_encode(['success' => false, 'message' => 'Unauthorized']);
    exit;
}

require_once 'db.php';

// get data from the request body and it is sent as a json.
$data = json_decode(file_get_contents('php://input'), true);

// prepare the data for the update.
$event_id = $data['event_id'] ?? null;
$title = $data['title'] ?? '';
$event_date = $data['event_date'] ?? '';
$event_time = $data['event_time'] ?? '';
$location = $data['location'] ?? '';
$type = $data['type'] ?? '';
$description = $data['description'] ?? '';

// if some field is missing return an error.
if (!$event_id || !$title || !$event_date || !$event_time || !$location || !$type) {
    echo json_encode(['success' => false, 'message' => 'All fields are required']);
    exit;
}

// update the database. 
$stmt = $pdo->prepare('UPDATE events SET title = ?, event_date = ?, event_time = ?, location = ?, type = ?, description = ? WHERE id = ? AND admin_id = ?');
$success = $stmt->execute([$title, $event_date, $event_time, $location, $type, $description, $event_id, $_SESSION['user_id']]);

echo json_encode(['success' => $success]);
?>