use crate::error::SerializableError;
use serde::Serialize;
use sqlx::sqlite::SqlitePool;
use sqlx::{query, query_as};

#[derive(Debug, Serialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct TerminalCommand {
    command_id: i64,
    command: String,
    timestamp: i64,
}

#[derive(Debug, Serialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct TerminalCommandHistory {
    terminal_id: i64,
    commands: Vec<TerminalCommand>,
}

impl TerminalCommand {
    pub async fn insert_new(
        connection_pool: &SqlitePool,
        terminal_id: i64,
        command: String,
    ) -> Result<Self, SerializableError> {
        let record = query!(
            r#"INSERT INTO terminal_commands(terminal_id, command) VALUES (?, ?)
            RETURNING id AS "id!", timestamp"#,
            terminal_id,
            command
        )
        .fetch_one(connection_pool)
        .await?;
        Ok(Self {
            command_id: record.id,
            command,
            timestamp: record.timestamp,
        })
    }
}

impl TerminalCommandHistory {
    pub async fn load(
        connection_pool: &SqlitePool,
        terminal_id: i64,
    ) -> Result<Self, SerializableError> {
        let commands = query_as!(
            TerminalCommand,
            r#"SELECT id AS command_id, command, timestamp
            FROM terminal_commands
            WHERE terminal_id = ?"#,
            terminal_id
        )
        .fetch_all(connection_pool)
        .await?;
        Ok(Self {
            terminal_id,
            commands,
        })
    }
}
