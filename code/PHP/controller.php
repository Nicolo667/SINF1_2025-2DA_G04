<?php
// this file recieve requests and call the business logic layer functions.
error_reporting(0);
require_once 'businessLogicLayer.php';
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $action = $_POST['action'] ?? '';

    // login
    if ($action === 'login') {
        $result = loginUser($_POST); // Calls function
        echo json_encode($result);
        exit;
    }

    // registration
    if ($action === 'register') {
        // Admin code check logic
        if ($_POST['role'] === 'admin' && ($_POST['adminCode'] !== '1234')) {
            echo json_encode(["status" => "error", "message" => "Invalid Admin Code"]);
            exit;
        }
        $result = registerUser($_POST); // Calls function
        echo json_encode($result);
        exit;
    }

    // for logout
    if ($action === 'logout') {
        $result = logoutUser();
        echo json_encode($result);
        exit;
    }

    // for create event
    if ($action === 'createEvent') {
        $result = createEvent($_POST);
        echo json_encode($result);
        exit;
    }

    if ($action === 'getEvents') {
        $result = getAdminEvents();
        echo json_encode($result);
        exit;
    }

    if ($action === 'getEvent') {
        $result = getEventById($_POST);
        echo json_encode($result);
        exit;
    }

    if ($action === 'updateEvent') {
        $result = updateEvent($_POST);
        echo json_encode($result);
        exit;
    }

    if ($action === 'deleteEvent') {
        $result = deleteEvent($_POST);
        echo json_encode($result);
        exit;
    }

    if ($action === 'getMainEvents') {
    $result = getAllEvents();
    echo json_encode($result);
    exit;
    }

    if ($action === 'getTents') {
        $result = getAllTents();
        echo json_encode($result);
        exit;
    }

    // get the artist. 
    if ($action === 'getArtists') {
    $result = getAllArtists();
    echo json_encode($result);
    exit;
}
}
?>