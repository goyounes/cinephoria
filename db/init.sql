-- CREATE DATABASE cinephoria2; 

USE cinephoria;

CREATE TABLE genres (
    genre_id INT PRIMARY KEY AUTO_INCREMENT,
    genre_name VARCHAR(255) NOT NULL
);

INSERT INTO genres(genre_id,genre_name)
VALUES 
  (1, "Action"),
  (2, "Adventure"),
  (3, "Animation"),
  (4, "Biography"),
  (5, "Comedy"),
  (6, "Crime"),
  (7, "Cult movie"),
  (8, "Disney"),
  (9, "Documentary"),
  (10, "Drama"),
  (11, "Zombie"),
  (12, "Family"),
  (13, "Fantasy"),
  (14, "Film-noir"),
  (15, "Gangster"),
  (16, "Heist"),
  (17, "History"),
  (18, "Horror"),
  (19, "Military"),
  (20, "Music"),
  (21, "Musical"),
  (22, "Mystery"),
  (23, "Nature"),
  (24, "Neo-noir"),
  (25, "Period"),
  (26, "Pixar"),
  (27, "Road movie"),
  (28, "Romance"),
  (29, "Sci-fi"),
  (30, "Short"),
  (31, "Spy"),
  (32, "Super hero"),
  (33, "Thriller"),
  (34, "Visually stunning"),
  (35, "War"),
  (36, "Western");


SELECT * FROM genres;
-- ---------------------------------------------------------------------------------------------------------------------------

CREATE TABLE movies (
    movie_id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(255) NOT NULL,
    poster_img_name VARCHAR(255) DEFAULT "default_poster_img.webp",   -- the default can be a generic image 
    description TEXT,
    age_rating INT,
    is_team_pick BOOL,
    score DECIMAL(2,1),
    length TIME,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    isDeleted BOOL DEFAULT FALSE
);

INSERT INTO movies (title,  description, age_rating, is_team_pick, length) 
VALUES
('The Shawshank Redemption', 'Two imprisoned men form a deep friendship, finding solace and eventual redemption through acts of common decency.', 18, TRUE,"01:30:30"),
('The Dark Knight', 'When the menace known as the Joker emerges from his mysterious past, he wreaks havoc and chaos on the people of Gotham.', 13, TRUE,"01:30:30"),
('Inception', 'A thief who steals corporate secrets through the use of dream-sharing technology is given the inverse task of planting an idea into the mind of a CEO.', 13, TRUE,"01:00:30"),
('The Matrix', 'A computer hacker learns from mysterious rebels about the true nature of his reality and his role in the war against its controllers.', 13, TRUE,"01:00:30"),
('The Godfather', 'The aging patriarch of an organized crime dynasty transfers control of his clandestine empire to his reluctant son.', 18, FALSE,"01:10:30"),
('Pulp Fiction', 'The lives of two mob hitmen, a boxer, a gangster’s wife, and a pair of diner bandits intertwine in four tales of violence and redemption',18,FALSE,"01:10:30"),
('The Shawshank Redemption2', 'Two imprisoned men form a deep friendship, finding solace and eventual redemption through acts of common decency.', 18, TRUE,"01:30:30"),
('The Dark Knight2', 'When the menace known as the Joker emerges from his mysterious past, he wreaks havoc and chaos on the people of Gotham.', 13, TRUE,"01:30:30"),
('Inception2', 'A thief who steals corporate secrets through the use of dream-sharing technology is given the inverse task of planting an idea into the mind of a CEO.', 13, TRUE,"01:00:30"),
('The Matrix2', 'A computer hacker learns from mysterious rebels about the true nature of his reality and his role in the war against its controllers.', 13, TRUE,"01:00:30"),
('The Godfather2', 'The aging patriarch of an organized crime dynasty transfers control of his clandestine empire to his reluctant son.', 18, FALSE,"01:10:30"),
('Pulp Fiction2', 'The lives of two mob hitmen, a boxer, a gangster’s wife, and a pair of diner bandits intertwine in four tales of violence and redemption',18,FALSE,"01:10:30");

UPDATE movies
SET created_at = "2025-04-10 06:00:00"
WHERE movie_id = 6;
UPDATE movies
SET created_at = "2023-04-10 06:00:00"
WHERE movie_id = 10;
UPDATE movies
SET created_at = "2024-04-10 06:00:00"
WHERE movie_id = 11;
UPDATE movies
SET created_at = "2025-07-16 06:00:00"
WHERE movie_id = 12;


 UPDATE movies SET poster_img_name = "poster_img_1.webp"
 WHERE movie_id = 1;
 UPDATE movies SET poster_img_name = "poster_img_2.webp"
 WHERE movie_id = 2;
 UPDATE movies SET poster_img_name = "poster_img_3.webp"
 WHERE movie_id = 3;
 UPDATE movies SET poster_img_name = "poster_img_4.webp"
 WHERE movie_id = 4;
 UPDATE movies SET poster_img_name = "poster_img_5.webp"
 WHERE movie_id = 5;
 UPDATE movies SET poster_img_name = "poster_img_6.webp"
 WHERE movie_id = 6;
 UPDATE movies SET poster_img_name = "poster_img_1 - Copy.webp"
 WHERE movie_id = 7;
 UPDATE movies SET poster_img_name = "poster_img_2 - Copy.webp"
 WHERE movie_id = 8;
 UPDATE movies SET poster_img_name = "poster_img_3 - Copy.webp"
 WHERE movie_id = 9;
 UPDATE movies SET poster_img_name = "poster_img_4 - Copy.webp"
 WHERE movie_id = 10;
 UPDATE movies SET poster_img_name = "poster_img_5 - Copy.webp"
 WHERE movie_id = 11;
 UPDATE movies SET poster_img_name = "poster_img_6 - Copy.webp"
 WHERE movie_id = 12;


SELECT * FROM movies;
-- ----------------------JOINING TABLE-----------------------------------------------------------------------------------------------------

CREATE TABLE movie_genres (
	movie_id INT NOT NULL,
    genre_id INT NOT NULL,
    PRIMARY KEY (movie_id, genre_id),
    FOREIGN KEY (movie_id) REFERENCES movies(movie_id) ON DELETE CASCADE,
    FOREIGN KEY (genre_id) REFERENCES genres(genre_id) ON DELETE CASCADE
);

INSERT INTO movie_genres(movie_id,genre_id)
VALUES 
(1,1),
(1,3),
(2,4),
(2,5),
(3,2),
(4,1),
(4,3),
(4,4),
(5,2),
(5,3),
(6,5),
(6,1);

SELECT * FROM movie_genres;
-- ---------------------------------------------------------------------------------------------------------------------------

CREATE TABLE cinemas (
    cinema_id INT PRIMARY KEY AUTO_INCREMENT,
    cinema_name VARCHAR(255) NOT NULL,
    cinema_adresse VARCHAR(255) NOT NULL,
    isDeleted BOOl DEFAULT FALSE
);

INSERT INTO cinemas(cinema_id,cinema_name,cinema_adresse)
VALUES 
(1,"Nantes","12 Rue de la Loire, 44000 Nantes"),
(2,"Bordeaux","33 Rue du Chai des Farines, 33800 Bordeaux"),
(3,"Paris","42 Rue de Rivoli, 75004 Paris"),
(4,"Toulouse","18 Rue du Languedoc, 31000 Toulouse"),
(5,"Lille","77 Rue Nationale, 59800 Lille"),
(6,"Charleroi (Belgique)","26 Rue Leon Bernus, 6000 Charleroi"),
(7,"Liege (Belgique)","59 Quai de la Batte, 4020 Liege");

SELECT * FROM cinemas;
-- ---------------------------------------------------------------------------------------------------------------------------

CREATE TABLE rooms (
    room_id INT PRIMARY KEY AUTO_INCREMENT,
    room_name VARCHAR(255) ,
    room_capacity INT NOT NULL,
    isDeleted BOOl DEFAULT FALSE,
	cinema_id INT,
    FOREIGN KEY (cinema_id) REFERENCES cinemas(cinema_id)
);

INSERT INTO rooms(room_id,room_name,room_capacity,cinema_id)
VALUES 
(1,"Salle 1",20,2),
(2,"Salle 2",20,3),
(3,"Salle 3",30,5),
(4,"Salle 4",20,6),
(5,"Salle 5",40,1),
(6,"Salle 6",20,7),
(7,"Salle 7",30,5),
(8,"Salle 8",20,6),
(9,"Salle 9",20,7),
(10,"Salle 10",30,7);

SELECT * FROM rooms;
-- ---------------------------------------------------------------------------------------------------------------------------

CREATE TABLE seats (
    seat_id INT PRIMARY KEY AUTO_INCREMENT,
    seat_number INT NOT NULL,
    isAccesible BOOL DEFAULT FALSE,
    isDeleted BOOl DEFAULT FALSE,
    room_id INT,
    UNIQUE(seat_number,room_id),
    FOREIGN KEY (room_id) REFERENCES rooms(room_id)
);

INSERT INTO seats(seat_id,seat_number,room_id)
VALUES 
(1,1,1),
(2,2,1),
(3,3,1),
(4,4,1),
(5,5,1),
(6,6,1),
(7,7,1),
(8,8,1),
(9,9,1),
(10,10,1),
(11,11,1),
(12,12,1),
(13,13,1),
(14,14,1),
(15,15,1),
(16,16,1),
(17,17,1),
(18,18,1),
(19,19,1),
(20,20,1),
(21,1,2),
(22,2,2),
(23,3,2),
(24,4,2),
(25,5,2),
(26,6,2),
(27,7,2),
(28,8,2),
(29,9,2),
(30,10,2),
(31,11,2),
(32,12,2),
(33,13,2),
(34,14,2),
(35,15,2),
(36,16,2),
(37,17,2),
(38,18,2),
(39,19,2),
(40,20,2),
(41,1,3),
(42,2,3),
(43,3,3),
(44,4,3),
(45,5,3),
(46,6,3),
(47,7,3),
(48,8,3),
(49,9,3),
(50,10,3),
(51,11,3),
(52,12,3),
(53,13,3),
(54,14,3),
(55,15,3),
(56,16,3),
(57,17,3),
(58,18,3),
(59,19,3),
(60,20,3),
(61,21,3),
(62,22,3),
(63,23,3),
(64,24,3),
(65,25,3),
(66,26,3),
(67,27,3),
(68,28,3),
(69,29,3),
(70,30,3),
(71,1,4),
(72,2,4),
(73,3,4),
(74,4,4),
(75,5,4),
(76,6,4),
(77,7,4),
(78,8,4),
(79,9,4),
(80,10,4),
(81,11,4),
(82,12,4),
(83,13,4),
(84,14,4),
(85,15,4),
(86,16,4),
(87,17,4),
(88,18,4),
(89,19,4),
(90,20,4),
(91,1,5),
(92,2,5),
(93,3,5),
(94,4,5),
(95,5,5),
(96,6,5),
(97,7,5),
(98,8,5),
(99,9,5),
(100,10,5),
(101,11,5),
(102,12,5),
(103,13,5),
(104,14,5),
(105,15,5),
(106,16,5),
(107,17,5),
(108,18,5),
(109,19,5),
(110,20,5),
(111,21,5),
(112,22,5),
(113,23,5),
(114,24,5),
(115,25,5),
(116,26,5),
(117,27,5),
(118,28,5),
(119,29,5),
(120,30,5),
(121,31,5),
(122,32,5),
(123,33,5),
(124,34,5),
(125,35,5),
(126,36,5),
(127,37,5),
(128,38,5),
(129,39,5),
(130,40,5),
(131,1,6),
(132,2,6),
(133,3,6),
(134,4,6),
(135,5,6),
(136,6,6),
(137,7,6),
(138,8,6),
(139,9,6),
(140,10,6),
(141,11,6),
(142,12,6),
(143,13,6),
(144,14,6),
(145,15,6),
(146,16,6),
(147,17,6),
(148,18,6),
(149,19,6),
(150,20,6),
(151,1,7),
(152,2,7),
(153,3,7),
(154,4,7),
(155,5,7),
(156,6,7),
(157,7,7),
(158,8,7),
(159,9,7),
(160,10,7),
(161,11,7),
(162,12,7),
(163,13,7),
(164,14,7),
(165,15,7),
(166,16,7),
(167,17,7),
(168,18,7),
(169,19,7),
(170,20,7),
(171,21,7),
(172,22,7),
(173,23,7),
(174,24,7),
(175,25,7),
(176,26,7),
(177,27,7),
(178,28,7),
(179,29,7),
(180,30,7),
(181,1,8),
(182,2,8),
(183,3,8),
(184,4,8),
(185,5,8),
(186,6,8),
(187,7,8),
(188,8,8),
(189,9,8),
(190,10,8),
(191,11,8),
(192,12,8),
(193,13,8),
(194,14,8),
(195,15,8),
(196,16,8),
(197,17,8),
(198,18,8),
(199,19,8),
(200,20,8),
(201,1,9),
(202,2,9),
(203,3,9),
(204,4,9),
(205,5,9),
(206,6,9),
(207,7,9),
(208,8,9),
(209,9,9),
(210,10,9),
(211,11,9),
(212,12,9),
(213,13,9),
(214,14,9),
(215,15,9),
(216,16,9),
(217,17,9),
(218,18,9),
(219,19,9),
(220,20,9),
(221,1,10),
(222,2,10),
(223,3,10),
(224,4,10),
(225,5,10),
(226,6,10),
(227,7,10),
(228,8,10),
(229,9,10),
(230,10,10),
(231,11,10),
(232,12,10),
(233,13,10),
(234,14,10),
(235,15,10),
(236,16,10),
(237,17,10),
(238,18,10),
(239,19,10),
(240,20,10),
(241,21,10),
(242,22,10),
(243,23,10),
(244,24,10),
(245,25,10),
(246,26,10),
(247,27,10),
(248,28,10),
(249,29,10),
(250,30,10);

SELECT * FROM seats;
-- ---------------------------------------------------------------------------------------------------------------------------

CREATE TABLE screenings (
    screening_id INT PRIMARY KEY AUTO_INCREMENT,
	movie_id INT NOT NULL,
	cinema_id INT NOT NULL,
    room_id INT NOT NULL,
    start_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    isDeleted BOOL DEFAULT FALSE,
    FOREIGN KEY (cinema_id) REFERENCES cinemas(cinema_id),
    FOREIGN KEY (movie_id) REFERENCES movies(movie_id),
    FOREIGN KEY (room_id) REFERENCES rooms(room_id)
);

INSERT INTO screenings(movie_id,cinema_id,room_id,start_date,start_time,end_time)
VALUES 
(1,1,5,"2025-10-15","09:00:00","11:00:00"),
(1,1,5,"2025-10-15","12:30:00","14:30:00"),
(1,1,5,"2025-10-15","15:30:00","17:30:00"),
(1,1,5,"2025-10-15","19:30:00","21:30:00"),
(1,1,5,"2025-10-16","09:00:00","11:00:00"),
(1,1,5,"2025-10-16","12:30:00","14:30:00"),
(1,1,5,"2025-10-16","15:30:00","17:30:00"),
(1,1,5,"2025-10-16","19:30:00","21:30:00"),
(1,1,5,"2025-10-18","09:00:00","11:00:00"),
(1,1,5,"2025-10-18","12:30:00","14:30:00"),
(1,1,5,"2025-10-18","15:30:00","17:30:00"),
(1,1,5,"2025-10-18","19:30:00","21:30:00"),
(4,1,3,"2025-10-17","10:30:00","12:30:00"),
(4,1,3,"2025-10-17","14:00:00","16:00:00"),
(4,1,3,"2025-10-17","17:30:00","19:30:00"),
(4,1,3,"2025-10-17","21:30:00","23:30:00"),
(4,1,3,"2025-10-20","10:30:00","12:30:00"),
(4,1,3,"2025-10-20","14:00:00","16:00:00"),
(4,1,3,"2025-10-20","17:30:00","19:30:00"),
(4,1,3,"2025-10-20","21:30:00","23:30:00"),
(5,1,1,"2025-10-17","20:30:00","22:00:00"),
(1,2,1,"2025-10-15","15:30:00","17:30:00"),
(1,3,2,"2025-10-15","15:30:00","17:30:00"),
(1,3,2,"2025-10-16","15:30:00","17:30:00"),
(1,5,3,"2025-10-16","16:30:00","18:30:00"),
(1,5,7,"2025-10-16","14:00:00","15:00:00"),
(1,5,7,"2025-10-16","16:30:00","18:30:00"),
(1,5,7,"2025-10-16","16:30:00","18:30:00"),
(1,5,7,"2025-10-16","19:00:00","21:00:00"),
(1,5,7,"2025-10-16","21:30:00","23:30:00"),
(2,6,4,"2025-11-10","15:30:00","17:00:00"),
(3,7,10,"2025-12-30","20:00:00","22:30:00"),
(3,7,10,"2024-12-30","20:00:00","22:30:00"),
(1,1,5,"2025-07-30","09:00:00","11:00:00"),
(1,1,5,"2025-08-10","09:00:00","11:00:00"),
(1,1,5,"2025-08-20","09:00:00","11:00:00"),
(1,1,5,"2025-09-01","09:00:00","11:00:00"),
(1,1,5,"2025-09-10","09:00:00","11:00:00"),
(1,1,5,"2025-09-15","09:00:00","11:00:00"),
(1,1,5,"2025-09-20","09:00:00","11:00:00");

SELECT * FROM screenings;

-- CREATE a trigger to make sure the cinema_id gets updated in case of any change of the rooms TABLE 

DELIMITER //
CREATE TRIGGER update_screenings_cinema_id
BEFORE UPDATE ON rooms
FOR EACH ROW
BEGIN
    IF NEW.cinema_id <> OLD.cinema_id THEN
        UPDATE screenings
        SET cinema_id = NEW.cinema_id
        WHERE room_id = NEW.room_id;
    END IF;
END;
-- DROP TRIGGER IF EXISTS update_screenings_cinema_id;
//
DELIMITER ;
-- ---------------------------------------------------------------------------------------------------------------------------------------------------------------------

CREATE TABLE qualities (
    quality_id INT PRIMARY KEY AUTO_INCREMENT,
    quality_name VARCHAR(255) NOT NULL
);

INSERT INTO qualities(quality_id,quality_name)
VALUES 
(1, "4DX"),
(2, "3D"),
(3, "4K"), 
(4, "FHD");

SELECT * FROM qualities;
-- ----------------------JOINING TABLE 2-----------------------------------------------------------------------------------------------------

CREATE TABLE screening_qualities (
	screening_id INT NOT NULL,
    quality_id INT NOT NULL,
    PRIMARY KEY (screening_id, quality_id),
    FOREIGN KEY (screening_id) REFERENCES screenings(screening_id) ON DELETE CASCADE,
    FOREIGN KEY (quality_id) REFERENCES qualities(quality_id) ON DELETE CASCADE
);

INSERT INTO screening_qualities(screening_id,quality_id)
VALUES 
(1,3),
(1,1),
(2,3),
(2,1),
(3,3),
(3,2),
(4,3),
(4,1),
(4,2),
(5,3),
(6,3),
(7,2),
(8,4);


SELECT * FROM screening_qualities;

-- ----------------------------------------------------------------------------------------------------------------------------------------------------
-- ----------------------------------------------------------------------------------------------------------------------------------------------------
-- ----------------------------------------------------------------------------------------------------------------------------------------------------
-- ----------------------------------------------------------------------------------------------------------------------------------------------------
-- ----------------------------------------------------------------------------------------------------------------------------------------------------
-- ----------------------------------------------------------------------------------------------------------------------------------------------------
-- ----------------------------------------------------------------------------------------------------------------------------------------------------
-- ----------------------------------------------------------------------------------------------------------------------------------------------------
-- ----------------------------------------------------------------------------------------------------------------------------------------------------
-- ------------------------Users side---------------------------------------------------------------------------------------------------

CREATE TABLE roles (
    role_id INT PRIMARY KEY,
    role_name VARCHAR(255) NOT NULL
);

INSERT INTO roles (role_id,role_name)
VALUES 
(0, "visitor"),
(1, "user"),
(2, "employee"), 
(3, "admin");

SELECT * FROM roles;
-- ---------------------------------------------------------------------------------------------------------------------------

CREATE TABLE users (
    user_id INT PRIMARY KEY AUTO_INCREMENT,
    user_name VARCHAR(255) NOT NULL,
    user_email VARCHAR(255) NOT NULL,
    first_name VARCHAR(255) NOT NULL,
    last_name VARCHAR(255) NOT NULL,
    role_id INT DEFAULT 1,
    isVerified BOOL DEFAULT FALSE,
    refresh_token_version INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (user_name),
	UNIQUE (user_email),
    FOREIGN KEY (role_id) REFERENCES roles(role_id)
);

INSERT INTO users(user_name, user_email, first_name, last_name, role_id, isVerified)
VALUES 
("bbraney0","bbraney0@tinyurl.com","Bernard","Braney",1,1),
("ffolonin1","ffolonin1@ucla.edu","Fletch","Folonin",1,1),
("rkinnier2","rkinnier2@thetimes.co.uk","Raynor","Kinnier",2,1),
("bmongin3","bmongin3@seesaa.net","Butch","Mongin",3,1),
("phaglinton4","phaglinton4@acquirethisname.com","Pamelina","Haglinton",1,1),
("mshambroke5","mshambroke5@lulu.com","Miner","Shambroke",1,1),
("dmundford6","dmundford6@java.com","Denis","Mundford",1,1),
("gkelinge7","gkelinge7@cmu.edu","Guthrie","Kelinge",1,1),
("hyanyushkin8","hyanyushkin8@sciencedaily.com","Hamlin","Yanyushkin",1,1),
("smessiter9","smessiter9@marketwatch.com","Sydney","Messiter",1,1),
("cburrena","cburrena@yahoo.com","Clement","Burren",2,1),
("hvaneschib","hvaneschib@google.co.jp","Heywood","Vaneschi",3,1),
("fdavallc","fdavallc@networksolutions.com","Faye","Davall",1,1),
("lleadstond","lleadstond@ning.com","Lenore","Leadston",3,1),
("jfleischmanne","jfleischmanne@globo.com","June","Fleischmann",1,0), -- randomly set this user as unverified
("admin_admin","admin@admin.com","Rock","Paper",3,1),
("employee_employee","emp@emp.com","Emp","Loye",2,1),
("user_user","user@user.com","UUSS","EERR",1,1);



SELECT * FROM users;
-- ---------------------------------------------------------------------------------------------------------------------------

CREATE TABLE users_credentials (
    user_id INT PRIMARY KEY,
    user_password_hash CHAR(60) NOT NULL,
	created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
	updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    failed_attempts INT DEFAULT 0,
    FOREIGN KEY (user_id) REFERENCES users(user_id)
);

INSERT INTO users_credentials(user_id,user_password_hash)
VALUES 
(1,"wG0@3l?E"),
(2,"yC0~tBzc&(vu("),
(3,"sQ5\H4D&Vq"),
(4,"jV5}O~lyv1hC"),
(5,"nS8?gJ=A8G*0"),
(6,"kT4*7x3?Tr"),
(7,"pI5{L8KN>*1`"),
(8,"gX9}P#%~h3"),
(9,"mC9,4%R7=0hc"),
(10,"hX3'qMU_%XKLBg&"),
(11,"oA4!$NV6bk/>e'K6"),
(12,"hN6%+>~LC5XYamg"),
(13,"lN8<A$82lbmx0NRc"),
(14,"uP5~?@yU`!j"),
(15,"pZ1?4d<5+"),
(16,"$2b$10$FFeHs.Um3w90p3HkYjaU4OxoqZJuzZkoeSzUR/t70yT73YMvEAEGu"),
(17,"$2b$10$aK3Sv362yRMAL0tF9BCmuu7XvBkidPfjXwaGSsSqelZ36UqbGn8Yq"),
(18,"$2b$10$xoqjkvPxZtv1M1DsS6giqOOGWkma5u4.USSRT9YaoeHq4gnwqq..S");



SELECT * FROM users_credentials;

-- ---------------------------------------------------------------------------------------------------------------------------

CREATE TABLE movies_reviews (
  review_id INT PRIMARY KEY AUTO_INCREMENT,
  movie_id INT NOT NULL,
  user_id INT NOT NULL,
  score INT NOT NULL CHECK (score BETWEEN 1 AND 5),
  review VARCHAR(255) DEFAULT "(no comment)",
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (movie_id, user_id),
  FOREIGN KEY (movie_id) REFERENCES movies(movie_id),
  FOREIGN KEY (user_id) REFERENCES users(user_id)
);

DELIMITER //
CREATE TRIGGER trg_review_insert
AFTER INSERT ON movies_reviews
FOR EACH ROW
BEGIN
  DECLARE new_avg DECIMAL(3,2);

  SELECT ROUND(AVG(score), 1)
  INTO new_avg
  FROM movies_reviews
  WHERE movie_id = NEW.movie_id;

  UPDATE movies
  SET score = new_avg
  WHERE movie_id = NEW.movie_id;
END;
//
DELIMITER ;
-- no updates will be allowed
-- no deletes will be allowed

INSERT INTO movies_reviews (movie_id, user_id, score) VALUES
(1, 1, 5), (1, 2, 4),
(2, 1, 4), (2, 2, 3), (2, 3, 4),
(3, 1, 2), (3, 2, 3),
(4, 1, 1), (4, 2, 2),
(5, 1, 4), (5, 2, 3), (5, 3, 2),
(6, 1, 5), (6, 2, 4), (6, 3, 4),
(7, 1, 5), (7, 2, 4),
(8, 1, 4), (8, 2, 3), (8, 3, 4),
(9, 1, 3), (9, 2, 2),
(10, 1, 2), (10, 2, 1),
(11, 1, 4), (11, 2, 3), (11, 3, 2),
(12, 1, 5), (12, 2, 4), (12, 3, 4);

SELECT * FROM movies_reviews ;


-- -------------------------------------------------------------------------------------------------------------
CREATE TABLE ticket_types (
    ticket_type_id INT PRIMARY KEY ,
    ticket_type_name  VARCHAR(255) NOT NULL,
	ticket_type_price DECIMAL(3,1) NOT NULL
);
INSERT INTO ticket_types(ticket_type_id,ticket_type_name,ticket_type_price)
VALUES 
(1,"Child",5),
(2,"Teenager",10),
(3,"Student",15),
(4,"Adult",20);

SELECT * FROM ticket_types;
-- ---------------------------------------------------------------------------------------------------------------------------
CREATE TABLE tickets (
    ticket_id INT PRIMARY KEY AUTO_INCREMENT,
	ticket_type_id INT,
	screening_id INT,
	user_id INT,
    seat_id INT,
	QR_code CHAR(32),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (screening_id) REFERENCES screenings(screening_id),
    FOREIGN KEY (user_id) REFERENCES users(user_id),
    FOREIGN KEY (seat_id) REFERENCES seats(seat_id),
	FOREIGN KEY (ticket_type_id) REFERENCES ticket_types(ticket_type_id),
    UNIQUE (screening_id,seat_id)
);

INSERT INTO tickets(screening_id,user_id,seat_id,ticket_type_id)
VALUES 
(1,1,91,1),
(1,2,92,2),
(2,6,96,1),
(2,7,97,2),
(3,15,105,3),
(7,10,100,3),
(7,13,103,4),
(7,14,104,4),
(8,14,104,4),
(8,15,105,1),
(15,1,41,2),
(16,2,42,2),
(17,6,46,1),
(18,7,47,3),
(19,15,55,1),
(22,10,10,1),
(23,13,33,2),
(24,14,34,4),
(25,5,45,4),
(32,16,91,4),
(32,17,92,4),
(32,18,93,4),
(33,16,91,4),
(33,17,92,4),
(33,18,93,4);
SELECT * FROM tickets;








