-- =====================================================
-- DATABASE: Game Events Platform
-- =====================================================

-- === TABLE: Photo ===
CREATE TABLE Photo (
                       id SERIAL PRIMARY KEY,
                       URL TEXT NOT NULL
);

-- === TABLE: User ===
CREATE TABLE "User" (
                        id SERIAL PRIMARY KEY,
                        photo_id INTEGER REFERENCES Photo(id),
                        pseudo VARCHAR(64) NOT NULL,
                        birth_date DATE,
                        creation_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                        email VARCHAR(64) UNIQUE NOT NULL,
                        password VARCHAR(25) NOT NULL,
                        is_admin BOOLEAN DEFAULT FALSE,
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
                      is_approved BOOLEAN DEFAULT FALSE
);

-- === TABLE: Tag ===
CREATE TABLE Tag (
                     name VARCHAR(32) PRIMARY KEY
);

-- === TABLE: Game_Tag (Many-to-Many) ===
CREATE TABLE Game_Tag (
                          game_id INTEGER REFERENCES Game(id),
                          tag_name VARCHAR(32) REFERENCES Tag(name),
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
                       max_capacity INTEGER,
                       author INTEGER REFERENCES "User"(id) ON DELETE CASCADE
);

-- === TABLE: Event_Game (Many-to-Many) ===
CREATE TABLE Event_Game (
                            game_id INTEGER REFERENCES Game(id),
                            event_id INTEGER REFERENCES Event(id),
                            PRIMARY KEY (game_id, event_id)
);

-- === TABLE: Event_Photo (Many-to-Many) ===
CREATE TABLE Event_Photo (
                             event_id INTEGER REFERENCES Event(id),
                             photo_id INTEGER REFERENCES Photo(id),
                             PRIMARY KEY (event_id, photo_id)
);

-- === TABLE: Participant (Many-to-Many between User & Event) ===
CREATE TABLE Participant (
                             event_id INTEGER REFERENCES Event(id),
                             user_id INTEGER REFERENCES "User"(id),
                             PRIMARY KEY (event_id, user_id)
);

-- === TABLE: Review ===
CREATE TABLE Review (
                        id SERIAL PRIMARY KEY,
                        user_id INTEGER REFERENCES "User"(id),
                        event_id INTEGER REFERENCES Event(id),
                        photo_id INTEGER REFERENCES Photo(id),
                        note INTEGER CHECK (note >= 0 AND note <= 10),
                        description TEXT,
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- INDEXES for performance
-- =====================================================

CREATE INDEX idx_user_email ON "User"(email);
CREATE INDEX idx_event_date ON Event(scheduled_date);
CREATE INDEX idx_review_user ON Review(user_id);
CREATE INDEX idx_review_event ON Review(event_id);
