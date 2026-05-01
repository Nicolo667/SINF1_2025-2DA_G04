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

    if ($action === 'getAllEvents') {
    $result = getAllEvents($_POST); //if $_POST is an empty variable the page will fill it with all the events.
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

    if ($action === 'addToAgenda') {
    echo json_encode(addToAgenda($_POST));
    exit;
    }

    if ($action === 'removeFromAgenda') {
        echo json_encode(removeFromAgenda($_POST));
        exit;
    }
    
    if ($action === 'getUserAgenda') {
        echo json_encode(getUserAgenda());
        exit;
    }

    if ($action === 'updateProfile') {
        if (isset($_POST['first_name'], $_POST['last_name'], $_POST['email'], $_POST['username'])) {
            $result = updateUserProfile($_POST);
            echo json_encode($result);
        } else {
            echo json_encode(["status" => "error", "message" => "Missing data. All fields are required."]);
        }
        exit;
    }

}
?>