<?php
// file contains the connection with the db.
$host = "localhost";
$dbname = "sinf1_project";
$username = "root"; 
$password = ""; 

try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8", $username, $password); // create the PDO connection (PHP extension).
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (PDOException $e) {
    header('Content-Type: application/json');
    echo json_encode(["status" => "error", "message" => "DB Connection failed"]);
    exit;
}
?>
