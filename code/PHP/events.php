<?php
// this php code is useful to get the events from the database and send them to the main Page as a json (a kind of a list of events).
header('Content-Type: application/json'); // communicates that the content will be a json
header('Access-Control-Allow-Origin: *');

require_once 'db.php'; // connection with database

$type = $_GET['type'] ?? 'all'; //use get parameter to filter events by type.

if ($type === 'all') {
    $stmt = $pdo->query('SELECT id, title, location, type, event_date, event_time FROM events ORDER BY event_date ASC');
} else {
    $stmt = $pdo->prepare('SELECT id, title, location, type, event_date, event_time FROM events WHERE type = ? ORDER BY event_date ASC');
    $stmt->execute([$type]);
}

$events = $stmt->fetchAll(PDO::FETCH_ASSOC);

// clean the date for easyer dysplay on database.
foreach ($events as &$event) {
    $dt = new DateTime($event['event_date']);
    $event['date'] = $dt->format('M j'); // gotmat date as may 5 -> format more user friendly.
    $event['time'] = substr($event['event_time'], 0, 5); // remove the seconds from the time (only hours and minutes).
    unset($event['event_date'], $event['event_time']);
}

$tents = $pdo->query('SELECT name, faculty, highlights FROM tents ORDER BY id ASC')->fetchAll(PDO::FETCH_ASSOC); // info on tents (not used yet).

echo json_encode(['events' => $events, 'tents' => $tents]);
