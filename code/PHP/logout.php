<?php
session_start(); // Access the existing session
session_unset(); // Removes all session variables
session_destroy(); // destroy the session on the server

header('Content-Type: application/json');
echo json_encode(['success' => true, 'message' => 'Logged out']);
exit;
?>