<?php
// this file is used to get the event data from the database.
header('Content-Type: application/json');
session_start();

// allow only admins to get the event data.
if (!isset($_SESSION['user_id']) || $_SESSION['user_role'] !== 'admin') {
    echo json_encode(['error' => 'Unauthorized']);
    exit;
}

// access the database.
require_once 'db.php';

// get event id.
$event_id = $_GET['event_id'] ?? null;

// if the event id is not provided return an error message.
if (!$event_id) {
    echo json_encode(['error' => 'Event ID required']);
    exit;
}

// get the event data from db.
$stmt = $pdo->prepare('SELECT id, title, event_date, event_time, location, type, description FROM events WHERE id = ? AND admin_id = ?');
$stmt->execute([$event_id, $_SESSION['user_id']]);
$event = $stmt->fetch(PDO::FETCH_ASSOC);

if (!$event) {
    echo json_encode(['error' => 'Event not found or not authorized']);
    exit;
}

echo json_encode($event);
?>