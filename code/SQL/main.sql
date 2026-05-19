-- Database for SINF1 Project
-- Creates the database and tables for user login and events
-- Create database (if not exists)
CREATE DATABASE IF NOT EXISTS sinf1_project;
USE sinf1_project;

-- Table for users (login and registration)
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name            VARCHAR(255) NOT NULL,
    username        VARCHAR(100) NOT NULL UNIQUE,
    first_name      VARCHAR(100) NOT NULL,
    last_name       VARCHAR(100) NOT NULL,
    birth_date      DATE         NOT NULL,
    email           VARCHAR(255) NOT NULL UNIQUE,
    password_hash   VARCHAR(255) NOT NULL,
    FOREIGN KEY (role) REFERENCES roles(role_name) ON DELETE CASCADE
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table for events (created by admins)
CREATE TABLE IF NOT EXISTS events (
    id INT AUTO_INCREMENT PRIMARY KEY,
    
    title       VARCHAR(255) NOT NULL,
    description TEXT,
    event_date  DATETIME NOT NULL,
    event_time  TIME NOT NULL,
    location    VARCHAR(255) NOT NULL,
    type        VARCHAR(100) NOT NULL,
    admin_id    INT NOT NULL,
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (admin_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Table for tents
CREATE TABLE IF NOT EXISTS tents (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    faculty_id INT NOT NULL,
    location VARCHAR(255) NOT NULL,
    opening_time TIME NOT NULL,
    closing_time TIME NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- table for faculty
CREATE TABLE IF NOT EXISTS faculties (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    acronym VARCHAR(20) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- table for artists
CREATE TABLE IF NOT EXISTS artists (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    genre VARCHAR(100),
    bio TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE artists ADD COLUMN image_path VARCHAR(255) DEFAULT 'default_artist.jpg';

-- relationship table for events and artists (many to many)
CREATE TABLE IF NOT EXISTS event_artists (
    event_id INT NOT NULL,
    artist_id INT NOT NULL,
    PRIMARY KEY (event_id, artist_id),
    FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
    FOREIGN KEY (artist_id) REFERENCES artists(id) ON DELETE CASCADE
);

-- evaluation table for users to rate events
CREATE TABLE IF NOT EXISTS ratings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    event_id INT DEFAULT NULL,
    score INT CHECK (score >= 1 AND score <= 5),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE
);

ALTER TABLE ratings ADD COLUMN comment TEXT AFTER score;

-- have to change the table to make possible to evaluate the tents
ALTER TABLE ratings ADD COLUMN tent_id INT DEFAULT NULL;
ALTER TABLE ratings ADD FOREIGN KEY (tent_id) REFERENCES tents(id) ON DELETE CASCADE;
ALTER TABLE ratings DROP INDEX unique_user_event;
ALTER TABLE ratings ADD UNIQUE KEY unique_user_event (user_id, event_id);
ALTER TABLE ratings ADD UNIQUE KEY unique_user_tent (user_id, tent_id);


-- table for the user agenda
CREATE TABLE IF NOT EXISTS user_agenda (
    user_id INT NOT NULL,
    event_id INT NOT NULL,
    added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, event_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE
);

-- roles table
CREATE TABLE IF NOT EXISTS roles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    role_name ENUM('user', 'admin') NOT NULL UNIQUE
);
-- add the default roles
INSERT IGNORE INTO roles (role_name) VALUES ('user'), ('admin');

-- user can vote only one time for an event.
ALTER TABLE ratings ADD UNIQUE KEY unique_user_event (user_id, event_id);

-- add some info and events without the php logic

INSERT INTO users (name, username, first_name, last_name, birth_date, email, password_hash, role)
VALUES ('Admin Queima', 'admin2026', 'Admin', 'Project', '1990-01-01', 'admin@queima.com', '$2y$10$8u.9E9v2B5A5Y5xQ5e5u5O5e5u5O5e5u5O5e5u5O5e5u5O5e5u5O','admin');

INSERT INTO tents (id, name, faculty_id, location, opening_time, closing_time, description) VALUES
(1, 'FEUP - Tech Demos', 1, 'northern zone B', '09:00:00', '23:00:00', 'Showcasing innovative technology and engineering projects developed by students.'),
(2, 'FEUP - Workshop Hall', 1, 'northern zone A', '10:00:00', '22:00:00', 'Interactive workshops on programming, CAD design, and new technology,'),
(3, 'FMUP - Health & Well-being', 2, 'Central Zone A', '09:00:00', '23:00:00', 'Lectures and screenings regarding medicine, clinical research, and healthy habits.'),
(4, 'FLUP - Literatura & Artes', 3, 'Central Zone B', '10:00:00', '22:00:00', 'Poetry readings, cultural debates, and artistic performances by the Faculty of Arts.'),
(5, 'FCUP - Living Science', 4, 'East Zone A', '09:00:00', '23:00:00', 'Interactive scientific experiments exploring biology, physics, and chemistry.'),
(6, 'FDUP - Law & Society', 5, 'East Zone B', '10:00:00', '22:00:00', 'Conferences discussing justice, human rights, and the role of law in modern society.'),
(7, 'FBAUP - Creativity Hub', 6, 'West Zone A', '11:00:00', '23:30:00', 'Fine arts exhibitions, including design, photography, and live art performances.'),
(8, 'ICBAS - Biomedical Research', 7, 'Central Zone C', '09:00:00', '22:00:00', 'Presentations of the latest research in life sciences and medicine.'),
(9, 'FADEUP - Sports & Movement', 8, 'West Zone B', '10:00:00', '23:00:00', 'Sports demonstrations, yoga sessions, and physical activity workshops'),
(10, 'FEP - Economics & Innovation', 9, 'South Zone A', '09:00:00', '22:00:00', 'Talks on entrepreneurship, market trends, and sustainable business models.'),
(11, 'FPCEUP - Education & Dev.', 10, 'South Zone B', '10:00:00', '22:00:00', 'Workshops on psychology, educational sciences, and human development.'),
(12, 'ESENF - Nursing & Care', 11, 'Central Zone D', '09:00:00', '23:00:00', 'Practical nursing demonstrations, public health awareness, and caregiving tips.'),
(13, 'I3S - Innovation & Future', 12, 'northern zone C', '10:00:00', '22:30:00', 'Showcases of breakthrough health research, startups, and future technologies.'),
(14, 'FSCH - Social Impact', 13, 'South Zone C', '09:30:00', '22:00:00', 'Social initiatives, volunteer opportunities, and public policy discussions.');

INSERT INTO artists (id, name, genre, bio) VALUES 
(1, 'Dillaz', 'Hip-Hop', 'Renowned Portuguese producer and rapper known for hits like "Alô" and "Mô Boy". A pioneer of national hip-hop.'),
(2, 'Papillon', 'Hip-Hop/Rap', 'A creative force in Portuguese rap, part of the GROGNation collective and a successful solo artist.'),
(3, 'Slow J', 'Hip-Hop/Soul', 'A unique artist in the Portuguese scene who blended hip-hop with soul since his 2015 debut.'),
(4, 'ÁTOA', 'Pop/Rock', 'A popular Portuguese band celebrating their 9th anniversary with the "Prova dei 9" tour.'),
(5, 'Wet Bed Gang', 'Rap/Hip-Hop', 'A record-breaking collective with millions of views and a massive influence on the younger generation.'),
(6, 'Deejay Telio', 'Afrobeats/Pop', 'Famous for his "Karanganhola" style and energetic live performances.'),
(7, 'Quim Barreiros', 'Popular/Pimba', 'The legendary icon of Portuguese popular music, a mandatory presence at every Academic Cortege night.'),
(8, 'Morad', 'Drill/Rap', 'The Spanish "King of Drill" known for his authentic lyrics reflecting street life in Barcelona.'),
(9, 'Yasmine', 'Kizomba/Zouk', 'One of the most listened voices in the Lusophony world, famous for hits like "Apaixona".'),
(10, 'Calum Scott', 'Pop', 'British singer-songwriter who rose to fame on Britain''s Got Talent, famous for "You Are The Reason".'),
(11, 'Bispo', 'Rap/Pop', 'A versatile rapper with over half a million monthly listeners, presenting his latest album "Entre Nós".'),
(12, 'Chico da Tina', 'Trap/Folk', 'The "Trapstar" from Viana do Castelo who mixes traditional Minho folklore with modern trap.'),
(13, 'Veigh', 'Brazilian Trap', 'One of the biggest stars of Brazilian trap music, bringing international vibes to the Queimódromo.'),
(14, 'Richie Campbell', 'Reggae/Dancehall', 'Portugal''s biggest reggae export, presenting his highly anticipated new music.'),
(15, 'Xutos & Pontapés', 'Rock', 'The most legendary Portuguese rock band, returning to the Queima stage after 8 years.');

INSERT INTO events (id, title, description, event_date, event_time, location, type, admin_id) VALUES 
(1, 'Opening: Dillaz & Papillon', 'National Hip-Hop opening night.', '2026-05-02 00:00:00', '22:00:00', 'Queimódromo', 'Concert', 3),
(2, 'Sunday: Slow J & ÁTOA', 'Soulful Sunday & Pop Vibes.', '2026-05-03 00:00:00', '21:30:00', 'Queimódromo', 'Concert', 3),
(3, 'Monday: Wet Bed Gang & Telio', 'Urban Monday: Rap & Afrobeats.', '2026-05-04 00:00:00', '22:00:00', 'Queimódromo', 'Concert', 3),
(4, 'Tuesday: Cortejo Night', 'Traditional Cortejo with Quim Barreiros.', '2026-05-05 00:00:00', '21:00:00', 'Queimódromo', 'Tradition', 3),
(5, 'Wednesday: Morad & Yasmine', 'Global Rhythms: Kizomba & Drill.', '2026-05-06 00:00:00', '22:00:00', 'Queimódromo', 'Concert', 3),
(6, 'Thursday: Bispo & Calum Scott', 'Pop & Rap: The Experience.', '2026-05-07 00:00:00', '22:00:00', 'Queimódromo', 'Concert', 3),
(7, 'Friday: Veigh & Chico da Tina', 'Friday Trap Fever.', '2026-05-08 00:00:00', '22:00:00', 'Queimódromo', 'Concert', 3),
(8, 'Saturday: Grand Finale', 'Rock & Reggae Legends.', '2026-05-09 00:00:00', '22:30:00', 'Queimódromo', 'Concert', 3);

INSERT INTO event_artists (event_id, artist_id) VALUES 
(1,1), (1,2), (2,3), (2,4), (3,5), (3,6), (4,7), (4,8), 
(5,9), (5,10), (6,11), (6,12), (7,13), (7,14), (8,15), (8,16);

