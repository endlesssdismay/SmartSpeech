CREATE TABLE students (
 id INT AUTO_INCREMENT PRIMARY KEY,
 name VARCHAR(100) UNIQUE,
 section VARCHAR(100),
 password VARCHAR(255)
);
CREATE TABLE scores (
 id INT AUTO_INCREMENT PRIMARY KEY,
 student_id INT,
 practice INT DEFAULT 0,
 score INT DEFAULT 0,
 FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
);