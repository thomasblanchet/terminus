PRAGMA foreign_keys = ON;

-- Table which stores each terminal session
CREATE TABLE terminal_sessions (
    id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    working_directory TEXT NOT NULL,
    created_at INTEGER NOT NULL DEFAULT (unixepoch()),
    modified_at INTEGER NOT NULL DEFAULT (unixepoch())
) STRICT;
CREATE INDEX terminal_sessions_modified_at_index
ON terminal_sessions(modified_at);

CREATE TRIGGER terminal_sessions_modified_at_trigger
AFTER UPDATE ON terminal_sessions
BEGIN
    UPDATE terminal_sessions
    SET modified_at = unixepoch()
    WHERE id = new.id;
END;

-- Table which stores the items (commands or notes) for each terminal session
CREATE TABLE terminal_items (
    id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    terminal_session_id INTEGER NOT NULL,
    position INTEGER NOT NULL CHECK (position >= 0),
    item_type INTEGER NOT NULL CHECK (item_type IN (0, 1)),
    FOREIGN KEY (terminal_session_id) REFERENCES terminal_sessions(id) ON DELETE CASCADE
) STRICT;
CREATE UNIQUE INDEX terminal_items_position_index
ON terminal_items(terminal_session_id, position);

-- Table which stores the commands for each terminal session
CREATE TABLE terminal_commands (
    id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    terminal_item_id INTEGER NOT NULL,
    command TEXT,
    output TEXT,
    FOREIGN KEY (terminal_item_id) REFERENCES terminal_items(id) ON DELETE CASCADE
) STRICT;

-- Table which stores the notes for each terminal session
CREATE TABLE terminal_notes (
    id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    terminal_item_id INTEGER NOT NULL,
    note TEXT,
    FOREIGN KEY (terminal_item_id) REFERENCES terminal_items(id) ON DELETE CASCADE
) STRICT;

-- Table which stores the command history
CREATE TABLE terminal_command_history (
    id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    command TEXT NOT NULL,
    number_of_uses INTEGER NOT NULL CHECK (number_of_uses >= 1),
    last_used INTEGER NOT NULL
) STRICT;

CREATE UNIQUE INDEX terminal_command_history_command_index
ON terminal_command_history(command);

-- Table is automatically updated when a new command is inserted or updated
CREATE TRIGGER insert_terminal_command_history
AFTER INSERT ON terminal_commands
WHEN new.command IS NOT NULL
BEGIN
    INSERT INTO terminal_command_history(command, number_of_uses, last_used)
    VALUES (new.command, 1, unixepoch())
    ON CONFLICT(command) DO UPDATE SET
        number_of_uses = number_of_uses + 1,
        last_used = unixepoch();
END;

CREATE TRIGGER update_terminal_command_history
AFTER UPDATE OF command ON terminal_commands
WHEN new.command IS NOT NULL
BEGIN
    INSERT INTO terminal_command_history(command, number_of_uses, last_used)
    VALUES (new.command, 1, unixepoch())
    ON CONFLICT(command) DO UPDATE SET
        number_of_uses = number_of_uses + 1,
        last_used = unixepoch();
END;

-- Virtual table which indexes the command history for full-text search
CREATE VIRTUAL TABLE terminal_command_history_fts
USING fts5(
    command,
    tokenize='trigram',
    content='terminal_command_history',
    content_rowid='id'
);

CREATE TRIGGER insert_command_history_fts
AFTER INSERT ON terminal_command_history
BEGIN
    INSERT INTO terminal_command_history_fts(rowid, command)
    VALUES (new.id, new.command);
END;

CREATE TRIGGER delete_command_history_fts
AFTER DELETE ON terminal_command_history
BEGIN
    INSERT INTO terminal_command_history_fts(terminal_command_history_fts, rowid, command)
    VALUES ('delete', old.id, old.command);
END;

-- Table for the file history
CREATE TABLE file_history (
    id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    file_path TEXT NOT NULL,
    last_opened_at INTEGER NOT NULL DEFAULT (unixepoch()),
    language TEXT NOT NULL
) STRICT;

CREATE UNIQUE INDEX file_history_file_path_index
ON file_history(file_path);

CREATE INDEX file_history_last_opened_at_index
ON file_history(last_opened_at);

-- Tables for the tags
CREATE TABLE tags (
    id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    label TEXT NOT NULL,
    color INTEGER NOT NULL
) STRICT;

CREATE UNIQUE INDEX tags_label_index ON tags(label);

CREATE TABLE tag_associations (
    id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    tag_id INTEGER NOT NULL,
    item_type INTEGER NOT NULL CHECK (item_type IN (0, 1)),
    terminal_session_id INTEGER,
    file_id INTEGER,
    FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE,
    FOREIGN KEY (terminal_session_id) REFERENCES terminal_sessions(id) ON DELETE CASCADE,
    FOREIGN KEY (file_id) REFERENCES file_history(id) ON DELETE CASCADE,
    CHECK (
        (item_type = 0 AND terminal_session_id IS NOT NULL AND file_id IS NULL)
        OR (item_type = 1 AND file_id IS NOT NULL AND terminal_session_id IS NULL)
    )
) STRICT;

CREATE INDEX tag_associations_tag_id_index
ON tag_associations(tag_id);

CREATE INDEX tag_associations_item_type_terminal_session_index
ON tag_associations(item_type, terminal_session_id);

CREATE INDEX tag_associations_item_type_file_index
ON tag_associations(item_type, file_id);

-- Populate the database with dummy data (for testing)
-- -- Insert terminal sessions with different working directories
INSERT INTO terminal_sessions (working_directory) VALUES
    ('/home/user/projects/web-app'),
    ('/home/user/documents'),
    ('/home/user/projects/api');

-- Insert terminal items (mix of commands and notes)
-- item_type: 0 = command, 1 = note
INSERT INTO terminal_items (terminal_session_id, position, item_type) VALUES
    (1, 0, 0),  -- Command: npm start
    (1, 1, 1),  -- Note about server
    (1, 2, 0),  -- Command: git status
    (1, 3, 0),  -- Command: git add .
    (2, 4, 0),  -- Command: ls -la
    (2, 5, 1),  -- Note about files
    (2, 6, 0),  -- Command: cat example.txt
    (3, 7, 0),  -- Command: docker ps
    (3, 8, 1),  -- Note about containers
    (3, 9, 0);  -- Command: docker-compose up

-- Insert terminal commands
INSERT INTO terminal_commands (terminal_item_id, command, output) VALUES
    (1, 'npm start', '> web-app@1.0.0 start' || char(10) || '> node server.js' || char(10) || 'Server running on port 3000'),
    (3, 'git status', 'On branch main' || char(10) || 'Your branch is up to date with origin/main' || char(10) || 'nothing to commit, working tree clean'),
    (4, 'git add .', ''),
    (5, 'ls -la', 'total 32' || char(10) || 'drwxr-xr-x  2 user user 4096 Oct 26 10:00 .' || char(10) || 'drwxr-xr-x 15 user user 4096 Oct 26 10:00 ..' || char(10) || '-rw-r--r--  1 user user  220 Oct 26 10:00 example.txt'),
    (7, 'cat example.txt', 'This is an example file' || char(10) || 'with some content' || char(10) || 'for testing purposes.'),
    (8, 'docker ps', 'CONTAINER ID   IMAGE     COMMAND   CREATED   STATUS    PORTS     NAMES' || char(10) || '123456789abc   nginx     "nginx"    3 hours   Up       80/tcp    web-server'),
    (10, 'docker-compose up', 'Creating network "api_default" with the default driver' || char(10) || 'Creating api_db_1    ... done' || char(10) || 'Creating api_redis_1 ... done');

-- Insert terminal notes
INSERT INTO terminal_notes (terminal_item_id, note) VALUES
    (2, 'Server started successfully. Remember to check the logs if there are any issues.'),
    (6, 'Important files in this directory: config.json, .env, and backup/'),
    (9, 'Running containers: nginx (web-server), postgres (db), redis (cache)');

-- Insert file history
INSERT INTO file_history (file_path, last_opened_at, language) VALUES
    ('/Users/thomasblanchet/GitHub/terminus/vite.config.ts', unixepoch(), 'typescript'),
    ('/Users/thomasblanchet/GitHub/terminus/package.json', unixepoch(), 'json'),
    ('/Users/thomasblanchet/GitHub/terminus/index.html', unixepoch(), 'html'),
    ('/Users/thomasblanchet/GitHub/terminus/README.md', unixepoch(), 'markdown');

-- Insert tags
INSERT INTO tags (label, color) VALUES
    ('development', 1),
    ('production', 2),
    ('documentation', 3),
    ('docker', 4),
    ('database', 5);

-- Insert tag associations
-- item_type: 0 = terminal_session, 1 = file
INSERT INTO tag_associations (tag_id, item_type, terminal_session_id, file_id) VALUES
    (1, 0, 1, NULL),  -- development tag for web-app session
    (4, 0, 3, NULL),  -- docker tag for api session
    (5, 0, 3, NULL),  -- database tag for api session
    (1, 1, NULL, 1),  -- development tag for server.js
    (3, 1, NULL, 4),  -- documentation tag for notes.md
    (4, 1, NULL, 3);  -- docker tag for docker-compose.yml
