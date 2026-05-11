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
        $eventId = isset($data['id']) ? (int)$data['id'] : null;
        // default sorting (sort by data)
        $sort = isset($data['sort']) ? $data['sort'] : 'date_asc';

        if ($eventId) {
            // get all the events and also their averange 
            $sql = "SELECT id, title, description, DATE_FORMAT(event_date, '%Y-%m-%d') AS event_date, 
                           event_time, location, type,
                           (SELECT ROUND(AVG(score), 1) FROM ratings WHERE event_id = events.id) AS avg_rating
                    FROM events WHERE id = ?";
            
            $stmt = $pdo->prepare($sql);
            $stmt->execute([$eventId]);
            $event = $stmt->fetch(PDO::FETCH_ASSOC);

            if (!$event) return ["status" => "error", "message" => "Event not found"];

            // get all the artists
            $sqlArt = "SELECT a.id, a.name, a.genre, a.bio 
                       FROM artists a 
                       JOIN event_artists ea ON a.id = ea.artist_id 
                       WHERE ea.event_id = ?";
            $stmtArt = $pdo->prepare($sqlArt);
            $stmtArt->execute([$eventId]);
            $artists = $stmtArt->fetchAll(PDO::FETCH_ASSOC);

            return ["status" => "success", "event" => $event, "artists" => $artists];

        } else {
            $orderBy = "event_date ASC, event_time ASC"; // Default senza alias 'e.'
            if ($sort === 'rating_desc') {
                $orderBy = "avg_rating DESC, event_date ASC";
            }

            $sql = "SELECT id, title, description, DATE_FORMAT(event_date, '%Y-%m-%d') AS event_date, 
                        event_time, location, type,
                        (SELECT ROUND(AVG(score), 1) FROM ratings WHERE event_id = events.id) AS avg_rating 
                    FROM events 
                    ORDER BY $orderBy";
            
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

// function to add an event to the personal agenda. 
function addToAgenda($data) {
    global $pdo;
    if (session_status() === PHP_SESSION_NONE) session_start();
    if (!isset($_SESSION['user_id'])) return ["status" => "error", "message" => "you must be logged in"];
    try {
        $sql = "INSERT INTO user_agenda (user_id, event_id) VALUES (?, ?)";
        $stmt = $pdo->prepare($sql);
        $stmt->execute([$_SESSION['user_id'], $data['event_id']]);
        return ["status" => "success", "message" => "Event added in agenda"];
    } catch (PDOException $e) {
        // 23000 is the code for duplocate data.
        if ($e->getCode() == 23000) return ["status" => "error", "message" => "Event aready in agenda."];
        return ["status" => "error", "message" => "error during the addition."];
    }
}

// function to remove an eventi from the PA.
function removeFromAgenda($data) {
    global $pdo;
    if (session_status() === PHP_SESSION_NONE) session_start();
    try {
        $sql = "DELETE FROM user_agenda WHERE user_id = ? AND event_id = ?";
        $stmt = $pdo->prepare($sql);
        $stmt->execute([$_SESSION['user_id'], $data['event_id']]);
        return ["status" => "success", "message" => "removed event"];
    } catch (PDOException $e) {
        return ["status" => "error", "message" => "Error during the remotion"];
    }
}

//function to get the sorted agenda.
function getUserAgenda() {
    global $pdo;
    if (session_status() === PHP_SESSION_NONE) session_start();
    $userId = $_SESSION['user_id'];

    try {
        // Select the events, order them by date an hour. and now also show the avg of ratings.
        $sql = "SELECT e.*, 
                       DATE_FORMAT(e.event_date, '%Y-%m-%d') as event_date,
                       (SELECT ROUND(AVG(score), 1) FROM ratings WHERE event_id = e.id) as avg_rating
                FROM events e 
                JOIN user_agenda ua ON e.id = ua.event_id 
                WHERE ua.user_id = ? 
                ORDER BY e.event_date ASC, e.event_time ASC";
                
        $stmt = $pdo->prepare($sql);
        $stmt->execute([$userId]);
        
        return [
            "status" => "success", 
            "events" => $stmt->fetchAll(PDO::FETCH_ASSOC)
        ];
    } catch (PDOException $e) {
        return [
            "status" => "error", 
            "message" => "Error during uploading user_agenda: " . $e->getMessage()
        ];
    }
}

function updateUserProfile($data) {
    global $pdo;
    if (session_status() === PHP_SESSION_NONE) session_start();
    
    if (!isset($_SESSION['user_id'])) {
        return ["status" => "error", "message" => "You must be logged in!"];
    }

    try {
        // Updated to include username
        $sql = "UPDATE users 
                SET first_name = ?, last_name = ?, email = ?, username = ? 
                WHERE id = ?";
        
        $stmt = $pdo->prepare($sql);
        $stmt->execute([
            $data['first_name'], 
            $data['last_name'], 
            $data['email'], 
            $data['username'], 
            $_SESSION['user_id']
        ]);

        return ["status" => "success", "message" => "Profile updated successfully!"];
    } catch (PDOException $e) {
        // Handle potential duplicate username error
        if ($e->getCode() == 23000) {
            return ["status" => "error", "message" => "Username or Email already taken."];
        }
        return ["status" => "error", "message" => "Update error: " . $e->getMessage()];
    }
}

// function to see the upcoming events.
function getUpcomingEvents($userId) {
    global $pdo;
    try {
        $sql = "SELECT e.title, DATE(e.event_date) as clean_date, e.event_time 
                FROM events e
                JOIN user_agenda a ON e.id = a.event_id
                WHERE a.user_id = ? 
                -- we should 'clean' the event_date cause there is a time -> 00:00:00
                AND STR_TO_DATE(CONCAT(DATE(e.event_date), ' ', e.event_time), '%Y-%m-%d %H:%i:%s') >= NOW()
                AND STR_TO_DATE(CONCAT(DATE(e.event_date), ' ', e.event_time), '%Y-%m-%d %H:%i:%s') <= DATE_ADD(NOW(), INTERVAL 48 HOUR)
                ORDER BY clean_date ASC, e.event_time ASC";
        
        $stmt = $pdo->prepare($sql);
        $stmt->execute([$userId]);
        $events = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        return ["status" => "success", "events" => $events];
    } catch (PDOException $e) {
        return ["status" => "error", "message" => $e->getMessage()];
    }
}

// function to upoad artist from a csv file
function importArtistsFromCSV($filePath) {
    global $pdo;
    $insertedCount = 0;
    $errorCount = 0;

    // open the file in a reading way
    if (($handle = fopen($filePath, "r")) !== FALSE) {

        try {
            $pdo->beginTransaction();

            // prepare the request (query)
            $sql = "INSERT INTO artists (name, genre, bio) VALUES (?, ?, ?)";
            $stmt = $pdo->prepare($sql);

            // put the data in db.
            while (($data = fgetcsv($handle, 1000, ",")) !== FALSE) {
                if (count($data) >= 3) {
                    if ($stmt->execute([$data[0], $data[1], $data[2]])) {
                        $insertedCount++;
                    } else {
                        $errorCount++;
                    }
                }
            }

            $pdo->commit();
            fclose($handle);
            return [
                // print in an alert the number of the new artists added in the db.
                "status" => "success", 
                "message" => "import csv: $insertedCount new artists. Errors: $errorCount."
            ];

        } catch (Exception $e) {
            $pdo->rollBack();
            fclose($handle);
            return ["status" => "error", "message" => "Error in DB: " . $e->getMessage()];
        }
    }
    return ["status" => "error", "message" => "Impossible to open CSV file."];
}

// function to export the personal agenda
function exportUserAgendaToCSV($userId) {
    global $pdo;
    
    try {
        // Query to take all the events and the artist of that agenda
        $sql = "SELECT e.title, e.event_date, e.event_time, e.location, 
                       GROUP_CONCAT(art.name SEPARATOR ' & ') as artists
                FROM events e
                JOIN user_agenda a ON e.id = a.event_id
                LEFT JOIN event_artists ea ON e.id = ea.event_id
                LEFT JOIN artists art ON ea.artist_id = art.id
                WHERE a.user_id = ?
                GROUP BY e.id
                ORDER BY e.event_date ASC";
        
        $stmt = $pdo->prepare($sql);
        $stmt->execute([$userId]);
        $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

        // prepare the download
        $filename = "my_agenda_Queima26" . ".csv"; // name of file
        header('Content-Type: text/csv; charset=utf-8');
        header('Content-Disposition: attachment; filename=' . $filename);

        // file output
        $output = fopen('php://output', 'w');

        // problem for the caracter with '
        fprintf($output, chr(0xEF).chr(0xBB).chr(0xBF));

        // header csv file.
        fputcsv($output, ['Event Title', 'Date', 'Time', 'Location', 'Artists']);

        // fill the line
        foreach ($rows as $row) {
            $onlyDate = substr($row['event_date'], 0, 10); //only the first 10 character of a date

            fputcsv($output, [
                $row['title'],
                $onlyDate,
                $row['event_time'],
                $row['location'],
                $row['artists'] ?: 'No artists assigned'
            ]);
        }

        fclose($output);
        exit;

    } catch (PDOException $e) {
        die("Error exporting agenda: " . $e->getMessage());
    }
}

// function to save rating
function saveEventRating($userId, $eventId, $score) {
    global $pdo;
    try {
        // chack if the user is registered fot this event and that the event isn't in the future
        $sqlCheck = "SELECT COUNT(*) FROM user_agenda ua
                     JOIN events e ON ua.event_id = e.id
                     WHERE ua.user_id = ? AND ua.event_id = ? 
                     AND (e.event_date < CURRENT_DATE OR (e.event_date = CURRENT_DATE AND e.event_time <= CURRENT_TIME))";
        
        $stmtCheck = $pdo->prepare($sqlCheck);
        $stmtCheck->execute([$userId, $eventId]);
        $canRate = $stmtCheck->fetchColumn();

        if (!$canRate) {
            return [
                "status" => "error", 
                "message" => "You can only rate events that have already occurred and that you attended."
            ];
        }

        // if the user pass all the checks we update his score.
        $sql = "INSERT INTO ratings (user_id, event_id, score) VALUES (?, ?, ?)
                ON DUPLICATE KEY UPDATE score = VALUES(score)";
        
        $stmt = $pdo->prepare($sql);
        $stmt->execute([$userId, $eventId, $score]);
        
        return ["status" => "success", "message" => "Successfull rating, thank you :)"];

    } catch (PDOException $e) {
        return ["status" => "error", "message" => "Database Error: " . $e->getMessage()];
    }
}

// funtion to get the averange of an event.
function getAverageRating($eventId) {
    global $pdo;
    $sql = "SELECT ROUND(AVG(score), 1) as average FROM ratings WHERE event_id = ?";
    $stmt = $pdo->prepare($sql);
    $stmt->execute([$eventId]);
    $result = $stmt->fetch(PDO::FETCH_ASSOC);
    return $result['average'] ?? 0;
}

?>