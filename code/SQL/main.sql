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
    role ENUM('user', 'admin') DEFAULT 'user', -- Here we manage the role
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

-- Table for faculty tents (not for now)
CREATE TABLE IF NOT EXISTS tents (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name        VARCHAR(255) NOT NULL,
    faculty     VARCHAR(255) NOT NULL,
    highlights  TEXT
);

-- Insert sample data (optional, for testing)
INSERT INTO users (name, email, password_hash, role) VALUES ('Admin', 'admin@example.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin');
INSERT INTO users (name, email, password_hash, role) VALUES ('Test User', 'user@example.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'user');
INSERT INTO events (title, description, event_date, event_time, location, type, admin_id) VALUES ('Sample Event', 'A test event for the demo.', '2026-05-01 10:00:00', '10:00:00', 'Main Hall', 'Conference', 1);
INSERT INTO tents (name, faculty, highlights) VALUES ('Engineering Tent', 'ISEP Engineering', 'Live DJ sets and tech demos');
INSERT INTO tents (name, faculty, highlights) VALUES ('Arts Tent', 'ISEP Arts', 'Art exhibitions and performances');
