<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

require_once 'db.php';

$type = $_GET['type'] ?? 'all';

if ($type === 'all') {
    $stmt = $pdo->query('SELECT id, title, location, type, event_date FROM events ORDER BY event_date ASC');
} else {
    $stmt = $pdo->prepare('SELECT id, title, location, type, event_date FROM events WHERE type = ? ORDER BY event_date ASC');
    $stmt->execute([$type]);
}

$events = $stmt->fetchAll(PDO::FETCH_ASSOC);

foreach ($events as &$event) {
    $dt = new DateTime($event['event_date']);
    $event['date'] = $dt->format('M j');
    $event['time'] = $dt->format('H:i');
    unset($event['event_date']);
}

$tents = $pdo->query('SELECT name, faculty, highlights FROM tents ORDER BY id ASC')->fetchAll(PDO::FETCH_ASSOC);

echo json_encode(['events' => $events, 'tents' => $tents]);
