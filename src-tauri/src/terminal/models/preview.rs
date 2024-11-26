use crate::error::SerializableError;
use futures::future::join_all;
use serde::Serialize;
use sqlx::{query, query_scalar, SqlitePool};

#[derive(Serialize, Debug)]
#[serde(rename_all = "camelCase")]
pub struct TerminalSessionPreview {
    terminal_id: i64,
    timestamp: i64,
    working_directory: String,
    commands: Vec<String>,
}

impl TerminalSessionPreview {
    pub async fn load(
        connection_pool: &SqlitePool,
        terminal_id: i64,
        num_commands: i64,
    ) -> Result<Self, SerializableError> {
        let session = query!(
            r#"
            SELECT modified_at, working_directory
            FROM terminals
            WHERE id = ?
            "#,
            terminal_id,
        )
        .fetch_one(connection_pool)
        .await?;
        let session_preview = Self::load_recent_commands(
            &connection_pool,
            terminal_id,
            session.modified_at,
            session.working_directory,
            num_commands,
        )
        .await;
        Ok(session_preview)
    }

    pub async fn load_recent(
        connection_pool: &SqlitePool,
        num_sessions: i64,
        num_commands: i64,
    ) -> Result<Vec<Self>, SerializableError> {
        let recent_sessions = query!(
            r#"
            SELECT id AS "id!", working_directory, modified_at
            FROM terminals
            ORDER BY modified_at DESC
            LIMIT ?
            "#,
            num_sessions,
        )
        .fetch_all(connection_pool)
        .await?;
        let session_previews = join_all(recent_sessions.into_iter().map(|row| {
            Self::load_recent_commands(
                &connection_pool,
                row.id,
                row.modified_at,
                row.working_directory,
                num_commands,
            )
        }))
        .await;
        Ok(session_previews)
    }

    async fn load_recent_commands(
        connection_pool: &SqlitePool,
        terminal_id: i64,
        timestamp: i64,
        working_directory: String,
        num_commands: i64,
    ) -> TerminalSessionPreview {
        let commands = query_scalar!(
            r#"
            SELECT command
            FROM terminal_commands
            WHERE terminal_commands.terminal_id = ?
            ORDER BY terminal_commands.timestamp
            LIMIT ?
            "#,
            terminal_id,
            num_commands,
        )
        .fetch_all(connection_pool)
        .await;
        Self {
            terminal_id,
            timestamp,
            working_directory,
            commands: commands.unwrap_or_default(),
        }
    }
}
