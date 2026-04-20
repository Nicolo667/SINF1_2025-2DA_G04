<?php
// Database connection configuration
$host = 'localhost';
$db_name = 'sinf1_project';
$db_user = 'root';
$db_pass = ''; // Change if needed

try {
    $pdo = new PDO("mysql:host=$host;dbname=$db_name;charset=utf8", $db_user, $db_pass);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (PDOException $e) {
    die('Database connection failed: ' . $e->getMessage());
}
?>