-- =====================================================
-- DATABASE: Game Events Platform (CORRIGÉ)
-- =====================================================

DROP TABLE IF EXISTS Review CASCADE;
DROP TABLE IF EXISTS Participant CASCADE;
DROP TABLE IF EXISTS Event_Photo CASCADE;
DROP TABLE IF EXISTS Event_Game CASCADE;
DROP TABLE IF EXISTS Event CASCADE;
DROP TABLE IF EXISTS Game_Tag CASCADE;
DROP TABLE IF EXISTS Tag CASCADE;
DROP TABLE IF EXISTS Game CASCADE;
DROP TABLE IF EXISTS "User" CASCADE;
DROP TABLE IF EXISTS Photo CASCADE;

-- === TABLE: Photo ===
CREATE TABLE Photo (
    id SERIAL PRIMARY KEY,
    url TEXT NOT NULL
);

-- === TABLE: User ===
CREATE TABLE "User" (
    id SERIAL PRIMARY KEY,
    photo_id INTEGER REFERENCES Photo(id),
    pseudo VARCHAR(64) NOT NULL,
    birth_date DATE,
    creation_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    email VARCHAR(64) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    is_admin BOOLEAN NOT NULL DEFAULT FALSE,
    bio TEXT
);

-- === TABLE: Game ===
CREATE TABLE Game (
    id SERIAL PRIMARY KEY,
    banner_id INTEGER REFERENCES Photo(id),
    logo_id INTEGER REFERENCES Photo(id),
    grid_id INTEGER REFERENCES Photo(id),
    name VARCHAR(64) NOT NULL,
    description TEXT,
    release_date DATE,
    publisher VARCHAR(64),
    studio VARCHAR(64),
    platforms TEXT,
    is_approved BOOLEAN NOT NULL DEFAULT FALSE
);

-- === TABLE: Tag ===
CREATE TABLE Tag (
    name VARCHAR(32) PRIMARY KEY
);

-- === TABLE: Game_Tag ===
CREATE TABLE Game_Tag (
    game_id INTEGER REFERENCES Game(id) ON DELETE CASCADE,
    tag_name VARCHAR(32) REFERENCES Tag(name) ON DELETE CASCADE,
    PRIMARY KEY (game_id, tag_name)
);

-- === TABLE: Event ===
CREATE TABLE Event (
    id SERIAL PRIMARY KEY,
    name VARCHAR(64) NOT NULL,
    scheduled_date TIMESTAMP NOT NULL,
    creation_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    description TEXT,
    location TEXT,
    max_capacity INTEGER CHECK (max_capacity > 0),
    author INTEGER NOT NULL REFERENCES "User"(id) ON DELETE CASCADE
);

-- === TABLE: Event_Game ===
CREATE TABLE Event_Game (
    event_id INTEGER REFERENCES Event(id) ON DELETE CASCADE,
    game_id INTEGER REFERENCES Game(id),
    PRIMARY KEY (event_id, game_id)
);

-- === TABLE: Event_Photo ===
CREATE TABLE Event_Photo (
    event_id INTEGER REFERENCES Event(id) ON DELETE CASCADE,
    photo_id INTEGER REFERENCES Photo(id),
    PRIMARY KEY (event_id, photo_id)
);

-- === TABLE: Participant ===
CREATE TABLE Participant (
    event_id INTEGER REFERENCES Event(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES "User"(id) ON DELETE CASCADE,
    PRIMARY KEY (event_id, user_id)
);

-- === TABLE: Review ===
CREATE TABLE Review (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
    event_id INTEGER NOT NULL REFERENCES Event(id) ON DELETE CASCADE,
    photo_id INTEGER REFERENCES Photo(id),
    note INTEGER CHECK (note >= 0 AND note <= 5),
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (user_id, event_id)
);

-- =====================================================
-- INDEXES
-- =====================================================

CREATE INDEX idx_user_email ON "User"(email);
CREATE INDEX idx_event_date ON Event(scheduled_date);
CREATE INDEX idx_review_user ON Review(user_id);
CREATE INDEX idx_review_event ON Review(event_id);

-- USERS
INSERT INTO "User" (pseudo, email, password, is_admin)
VALUES
('Alice', 'alice@example.com', 'password123', true),
('Bob', 'bob@example.com', 'password123', false);

-- GAMES
INSERT INTO game (name, description, is_approved)
VALUES
('Super Game', 'Un jeu test pour les events', true),
('Mega Game', 'Un autre jeu pour tester', true);

-- PHOTOS
INSERT INTO photo (url)
VALUES
('default_pfp.png'),
('default_pfp.png'),
('default_pfp.png');


INSERT INTO game (banner_id, logo_id, grid_id, name, description, release_date, publisher, studio, platforms, is_approved)
VALUES
(3, 3, 3, 'League of Legends', 'Un jeu de stratégie en équipe très populaire.', '2009-10-27', 'Riot Games', 'Riot Games', 'PC, Mac', true);

INSERT INTO Tag (name)
VALUES
('MOBA'),
('Stratégie'),
('Compétitif');

INSERT INTO Game_Tag (game_id, tag_name)
VALUES
(3, 'MOBA'),
(3, 'Stratégie'),
(3, 'Compétitif');


-- EVENTS (sans jeux ni photos pour commencer)
INSERT INTO event (name, scheduled_date, location, author)
VALUES
('Tournoi Alice', '2025-12-20 18:00:00', 'Paris', 1),
('Soirée Bob', '2025-12-25 20:00:00', 'Lyon', 2);

-- ASSOCIER LES JEUX AUX EVENTS
INSERT INTO event_game (event_id, game_id)
VALUES
(1, 1),
(1, 2),
(2, 1);

-- ASSOCIER LES PHOTOS AUX EVENTS
INSERT INTO event_photo (event_id, photo_id)
VALUES
(1, 1),
(1, 2),
(2, 1);

INSERT INTO Review (user_id, event_id, note, description, photo_id)
VALUES
(2, 1, 8, 'Super tournoi !', 1),
(1, 2, 9, 'Soirée au top', 2);