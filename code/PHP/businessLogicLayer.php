<?php
require_once 'db.php';

function registerUser($data) {
    global $pdo;

    // Check if email or username already exists
    $check = $pdo->prepare("SELECT id FROM users WHERE email = ? OR username = ?");
    $check->execute([$data['email'], $data['username']]);
    if ($check->fetch()) {
        return ["status" => "error", "message" => "email or username already exists."];
    }

    // Hash of password. 
    $pwdHash = password_hash($data['password'], PASSWORD_DEFAULT);
    
    // The DB requires 'name' (First Name + Last Name)
    $fullName = $data['firstName'] . " " . $data['lastName'];
    
    // The DB accepts 'user' or 'admin'
    $role = ($data['role'] === 'admin') ? 'admin' : 'user';

    $sql = "INSERT INTO users (name, username, first_name, last_name, birth_date, email, password_hash, role) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
    
    try {
        $stmt = $pdo->prepare($sql);
        $stmt->execute([
            $fullName,
            $data['username'],
            $data['firstName'],
            $data['lastName'],
            $data['birthDate'],
            $data['email'],
            $pwdHash,
            $role
        ]);
        return ["status" => "success", "message" => "Registration successful!"];
    } catch (PDOException $e) {
        return ["status" => "error", "message" => "error during registration."];
    }
}

// login function:
function loginUser($data) {
    global $pdo;

    try {
        // Search for the user by email
        $sql = "SELECT id,username,first_name,last_name, email, password_hash, role FROM users WHERE email = ?";
        $stmt = $pdo->prepare($sql);
        $stmt->execute([$data['email']]);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);

        // Check if user exists and verify password
        if ($user && password_verify($data['password'], $user['password_hash'])) {
            // Start session to store user data
            if (session_status() === PHP_SESSION_NONE) {
                session_start();
            }
            $_SESSION['user_id'] = $user['id'];
            $_SESSION['user_role'] = $user['role'];
            $_SESSION['user_name'] = $user['name'];

            return [
               "status" => "success",
                "role" => $user['role'],
                "username" => $user['username'],
                "firstName" => $user['first_name'], 
                "lastName" => $user['last_name'],   
                "email" => $user['email']
                    
            ];
        } else {
            return ["status" => "error", "message" => "Invalid email or password."];
        }
    } catch (PDOException $e) {
        return ["status" => "error", "message" => "error during login:" . $e->getMessage()];
    }
}

// logout function:
function logoutUser() {
    if (session_status() === PHP_SESSION_NONE) {
        session_start();
    }
    session_unset();
    session_destroy();
    return ["status" => "success", "message" => "Logged out successfully."];
}

// function to create an event. (used by an admin)
function createEvent($data) {
    global $pdo;

    if (session_status() === PHP_SESSION_NONE) {
        session_start();
    }

    // Check if the user is actually an admin
    if (!isset($_SESSION['user_role']) || $_SESSION['user_role'] !== 'admin') {
        return ["status" => "error", "message" => "Unauthorized: Only admins can create events"];
    }

    $adminId = $_SESSION['user_id'];

    try {
        $sql = "INSERT INTO events (title, description, event_date, event_time, location, type, admin_id) 
                VALUES (?, ?, ?, ?, ?, ?, ?)";
        
        $stmt = $pdo->prepare($sql);
        $stmt->execute([
            $data['title'],
            $data['description'],
            $data['date'],
            $data['time'],
            $data['location'],
            $data['type'],
            $adminId
        ]);

        return ["status" => "success", "message" => "Event created successfully!"];
    } catch (PDOException $e) {
        return ["status" => "error", "message" => "Database error: " . $e->getMessage()];
    }
}

// function to get all the events created by an admin. 
function getAdminEvents() {
    global $pdo;

    if (session_status() === PHP_SESSION_NONE) {
        session_start();
    }

    // check if the user is an admin
    if (!isset($_SESSION['user_role']) || $_SESSION['user_role'] !== 'admin') {
        return ["status" => "error", "message" => "Unauthorized: Only admins can view events"];
    }

    $adminId = $_SESSION['user_id'];

    // take the events create by an admin.
    try {
        $sql = "SELECT id, title, description, DATE_FORMAT(event_date, '%Y-%m-%d') AS event_date, event_time, location, type FROM events WHERE admin_id = ? ORDER BY event_date ASC";
        $stmt = $pdo->prepare($sql);
        $stmt->execute([$adminId]);
        $events = $stmt->fetchAll(PDO::FETCH_ASSOC);

        return ["status" => "success", "events" => $events];
    } catch (PDOException $e) {
        return ["status" => "error", "message" => "Database error: " . $e->getMessage()];
    }
}

// function that get an event by the id -> useful for the edit page, to get one specific event.
// we can't use this function to 'create' the event page cause only the admin can see the event.
function getEventById($data) {
    global $pdo;

    if (session_status() === PHP_SESSION_NONE) {
        session_start();
    }

    //check of admin.
    if (!isset($_SESSION['user_role']) || $_SESSION['user_role'] !== 'admin') {
        return ["status" => "error", "message" => "Unauthorized: Only admins can view this event"];
    }

    $eventId = isset($data['event_id']) ? (int)$data['event_id'] : 0;
    if ($eventId <= 0) {
        return ["status" => "error", "message" => "Invalid event id"];
    }

    // get the event by the id and check if the event belongs to the admin.
    try {
        $sql = "SELECT id, title, description, DATE_FORMAT(event_date, '%Y-%m-%d') AS event_date, event_time, location, type FROM events WHERE id = ? AND admin_id = ?";
        $stmt = $pdo->prepare($sql);
        $stmt->execute([$eventId, $_SESSION['user_id']]);
        $event = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$event) {
            return ["status" => "error", "message" => "Event not found or access denied."];
        }

        return ["status" => "success", "event" => $event];
    } catch (PDOException $e) {
        return ["status" => "error", "message" => "Database error: " . $e->getMessage()];
    }
}

// function to update the event. 
function updateEvent($data) {
    global $pdo;

    if (session_status() === PHP_SESSION_NONE) {
        session_start();
    }

    // check of the admin
    if (!isset($_SESSION['user_role']) || $_SESSION['user_role'] !== 'admin') {
        return ["status" => "error", "message" => "Unauthorized: Only admins can update events"];
    }

    // check if the event id is valid (belong to admin).
    $eventId = isset($data['event_id']) ? (int)$data['event_id'] : 0;
    if ($eventId <= 0) {
        return ["status" => "error", "message" => "Invalid event id"];
    }

    // update the event.
    try {
        $sql = "UPDATE events SET title = ?, description = ?, event_date = ?, event_time = ?, location = ?, type = ? WHERE id = ? AND admin_id = ?";
        $stmt = $pdo->prepare($sql);
        $stmt->execute([
            $data['title'],
            $data['description'],
            $data['event_date'],
            $data['event_time'],
            $data['location'],
            $data['type'],
            $eventId,
            $_SESSION['user_id']
        ]);

        if ($stmt->rowCount() === 0) {
            return ["status" => "error", "message" => "No event was updated. Please check the event id or permissions."];
        }

        return ["status" => "success", "message" => "Event updated successfully!"];
    } catch (PDOException $e) {
        return ["status" => "error", "message" => "Database error: " . $e->getMessage()];
    }
}

// function to delete an event
function deleteEvent($data) {
    global $pdo;

    if (session_status() === PHP_SESSION_NONE) {
        session_start();
    }

    if (!isset($_SESSION['user_role']) || $_SESSION['user_role'] !== 'admin') {
        return ["status" => "error", "message" => "Unauthorized: Only admins can delete events"];
    }

    $eventId = isset($data['event_id']) ? (int)$data['event_id'] : 0;
    if ($eventId <= 0) {
        return ["status" => "error", "message" => "Invalid event id"];
    }

    // code to delete de event from the db. 
    try {
        $sql = "DELETE FROM events WHERE id = ? AND admin_id = ?";
        $stmt = $pdo->prepare($sql);
        $stmt->execute([$eventId, $_SESSION['user_id']]);

        if ($stmt->rowCount() === 0) {
            return ["status" => "error", "message" => "No event was deleted. Please check the event id or permissions."];
        }

        return ["status" => "success", "message" => "Event deleted successfully!"];
    } catch (PDOException $e) {
        return ["status" => "error", "message" => "Database error: " . $e->getMessage()];
    }
}

// this function get all the events created by admins from the db.
// now we add the id cause we need it for the singol event page.
function getAllEvents($data = null) {
    global $pdo;
    try {
        $eventId = isset($data['id']) ? (int)$data['id'] : null; // if we have the id we check for the correct event.

        if ($eventId) {
            // take the details of the event.
            $sql = "SELECT id, title, description, DATE_FORMAT(event_date, '%Y-%m-%d') AS event_date, event_time, location, type 
                    FROM events WHERE id = ?";
            $stmt = $pdo->prepare($sql);
            $stmt->execute([$eventId]);
            $event = $stmt->fetch(PDO::FETCH_ASSOC);

            if (!$event) return ["status" => "error", "message" => "Event not found"];

            // take the artist of the event
            $sqlArt = "SELECT a.id, a.name, a.genre, a.bio 
                       FROM artists a 
                       JOIN event_artists ea ON a.id = ea.artist_id 
                       WHERE ea.event_id = ?";
            $stmtArt = $pdo->prepare($sqlArt);
            $stmtArt->execute([$eventId]);
            $artists = $stmtArt->fetchAll(PDO::FETCH_ASSOC);

            return ["status" => "success", "event" => $event, "artists" => $artists];
        } else {
            // if there isn't an id we take all the events to show them in the main page 
            $sql = "SELECT id, title, description, DATE_FORMAT(event_date, '%Y-%m-%d') AS event_date, event_time, location, type FROM events ORDER BY event_date ASC";
            $stmt = $pdo->query($sql);
            $events = $stmt->fetchAll(PDO::FETCH_ASSOC);
            return ["status" => "success", "events" => $events];
        }
    } catch (PDOException $e) {
        return ["status" => "error", "message" => "DB Error: " . $e->getMessage()];
    }
}

// this function get all the tents from db.
function getAllTents() {
    global $pdo;
    try {
        $sql = "SELECT id, name, faculty_id, location, opening_time, closing_time, description FROM tents ORDER BY name ASC";
        $stmt = $pdo->query($sql);
        $tents = $stmt->fetchAll(PDO::FETCH_ASSOC); // return an array with all the tents.
        return ["status" => "success", "tents" => $tents];
    } catch (PDOException $e) {
        return ["status" => "error", "message" => "DB Error: " . $e->getMessage()];
    }
}

// this function get all the artists from db.
function getAllArtists() {
    global $pdo;
    try {
        // chose all the artist from de db, with all their info and also order it by the name.
        $sql = "SELECT id, name, genre, bio FROM artists ORDER BY name ASC";
        $stmt = $pdo->query($sql); // exxecute the query and obtain the results.
        $artists = $stmt->fetchAll(PDO::FETCH_ASSOC);  // create an array with all the artists.
        
        return ["status" => "success", "artists" => $artists];
    } catch (PDOException $e) {
        return ["status" => "error", "message" => "DB Error: " . $e->getMessage()];
    }
}

?>