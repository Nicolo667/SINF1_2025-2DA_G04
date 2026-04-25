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
    event_id INT DEFAULT NULL, -- could be null if the rating is for a tent
    tent_id INT DEFAULT NULL,  -- same if the rating is for an event
    score INT CHECK (score >= 1 AND score <= 5),
    comment TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
    FOREIGN KEY (tent_id) REFERENCES tents(id) ON DELETE CASCADE
);

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


