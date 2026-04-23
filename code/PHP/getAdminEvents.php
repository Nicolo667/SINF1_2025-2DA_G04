<?php
// this is different from the events.php because this is used to get only the events created by the admin that is logged in, so that he can manage them (delete or edit).
// instead the events.php is used to get all the events to display them on the main page. (so everyone can see all the events but only the admin can see his events to manage them).
header('Content-Type: application/json');
session_start();

if (!isset($_SESSION['user_id']) || $_SESSION['user_role'] !== 'admin') {
    http_response_code(403);
    echo json_encode(['error' => 'Unauthorized']);
    exit;
}

require_once 'db.php';

$stmt = $pdo->prepare('SELECT id, title, event_date, event_time, location, type, description FROM events WHERE admin_id = ? ORDER BY event_date ASC');
$stmt->execute([$_SESSION['user_id']]);
$events = $stmt->fetchAll(PDO::FETCH_ASSOC);

foreach ($events as &$event) {
    $dt = new DateTime($event['event_date']);
    $event['date'] = $dt->format('M j, Y');
    $event['time'] = substr($event['event_time'], 0, 5);
    unset($event['event_date'], $event['event_time']);
}

echo json_encode($events);
?>