<?php
// Database connection configuration (this is the file that is used to connect to the database, it is included in all the other php files that need to access the database).

$host = '127.0.0.1'; // main function to create a connection with the database.
$db_name = 'sinf1_project';
$db_user = 'root';
$db_pass = ''; // Change if needed

try { // manage the connection and try to catch any error that may occur during the connection.
    $pdo = new PDO("mysql:host=$host;dbname=$db_name;charset=utf8", $db_user, $db_pass); // create a new PDO instance to connect to the database sql.
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (PDOException $e) {
    die('Database connection failed: ' . $e->getMessage());
}
?>
