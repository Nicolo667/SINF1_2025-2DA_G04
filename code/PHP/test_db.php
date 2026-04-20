<?php
require_once 'db.php';

echo "=== Database Connection Test ===\n\n";

try {
    // Test 1: Check users table
    $stmt = $pdo->prepare("SELECT * FROM users");
    $stmt->execute();
    $users = $stmt->fetchAll();
    
    echo "✓ Users found: " . count($users) . "\n";
    foreach ($users as $user) {
        echo "  - " . $user['name'] . " (" . $user['email'] . ")\n";
    }
    
    echo "\n";
    
    // Test 2: Check events table
    $stmt = $pdo->prepare("SELECT * FROM events");
    $stmt->execute();
    $events = $stmt->fetchAll();
    
    echo "✓ Events found: " . count($events) . "\n";
    foreach ($events as $event) {
        echo "  - " . $event['title'] . " on " . $event['event_date'] . "\n";
    }
    
    echo "\n✓ Database is working correctly!\n";
    
} catch (Exception $e) {
    echo "✗ Error: " . $e->getMessage() . "\n";
}
?>