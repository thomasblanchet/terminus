PRAGMA foreign_keys = ON;

-- Table which stores each terminal session
CREATE TABLE terminals (
    id INTEGER PRIMARY KEY,
    working_directory TEXT NOT NULL,
    notes TEXT NOT NULL DEFAULT '',
    created_at INTEGER NOT NULL DEFAULT (unixepoch()),
    modified_at INTEGER NOT NULL DEFAULT (unixepoch())
) STRICT;
CREATE INDEX terminal_modified_at_index ON terminals(modified_at);

-- Table which stores the command history for each terminal session
CREATE TABLE terminal_commands (
    id INTEGER PRIMARY KEY,
    terminal_id INTEGER NOT NULL,
    timestamp INTEGER NOT NULL DEFAULT (unixepoch()),
    command TEXT NOT NULL,
    FOREIGN KEY (terminal_id) REFERENCES terminals(id) ON DELETE CASCADE
) STRICT;

-- Table which stores the environment variables for each terminal session
CREATE TABLE terminal_environments (
    terminal_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    value TEXT NOT NULL,
    PRIMARY KEY (terminal_id, name),
    FOREIGN KEY (terminal_id) REFERENCES terminals(id) ON DELETE CASCADE
) STRICT, WITHOUT ROWID;

-- Table which stores the previosuly edited files
CREATE TABLE files (
    id INTEGER PRIMARY KEY,
    directory TEXT NOT NULL,
    name TEXT NOT NULL,
    last_opened_at INTEGER NOT NULL DEFAULT (unixepoch()),
    language TEXT NOT NULL
) STRICT;
