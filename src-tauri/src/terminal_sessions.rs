use crate::error::SerializableError;
use crate::state::AppState;
use chrono::DateTime;
use futures::future::join_all;
use serde::Serialize;
use sqlx::{query, SqlitePool};
use tauri::{AppHandle, Manager};

#[derive(Serialize, Debug)]
pub struct TerminalSessionPreview {
    id: i64,
    date: String,
    time: String,
    commands: Vec<String>,
}

impl TerminalSessionPreview {
    pub async fn fetch_recent(
        pool: &SqlitePool,
        num_sessions: i32,
        num_commands: i32,
    ) -> Result<Vec<Self>, SerializableError> {
        let recent_sessions = query!(
            r#"
            SELECT id, modified_at AS timestamp
            FROM terminal_sessions
            ORDER BY modified_at DESC
            LIMIT ?
            "#,
            num_sessions,
        )
        .fetch_all(pool)
        .await?;
        let session_previews =
            join_all(recent_sessions.iter().map(|row| {
                Self::fetch_recent_commands(&pool, row.id, row.timestamp, num_commands)
            }))
            .await;
        Ok(session_previews)
    }

    async fn fetch_recent_commands(
        pool: &SqlitePool,
        session_id: i64,
        session_timestamp: i64,
        num_commands: i32,
    ) -> TerminalSessionPreview {
        let recent_commands = query!(
            r#"
            SELECT command AS "command!"
            FROM terminal_commands
            JOIN terminal_items
                ON terminal_items.id = terminal_commands.terminal_item_id
                AND terminal_items.item_type = 0
            JOIN terminal_sessions
                ON terminal_sessions.id = terminal_items.terminal_session_id
                AND terminal_sessions.id = ?
            WHERE command IS NOT NULL
            ORDER BY terminal_items.position DESC
            LIMIT ?
            "#,
            session_id,
            num_commands,
        )
        .fetch_all(pool)
        .await
        .map_or(Vec::new(), |commands| {
            commands.into_iter().map(|row| row.command).collect()
        });
        let timestamp = DateTime::from_timestamp(session_timestamp, 0);
        let pretty_date = timestamp.map_or(String::from("invalid date"), |t| {
            t.format("%a %d %b %Y").to_string()
        });
        let pretty_time = timestamp.map_or(String::from("invalid time"), |t| {
            t.format("%l:%M:%S%P").to_string()
        });
        TerminalSessionPreview {
            id: session_id,
            date: pretty_date,
            time: pretty_time,
            commands: recent_commands,
        }
    }
}

#[tauri::command]
pub async fn get_recent_session_previews(
    app_handle: AppHandle,
    num_sessions: i32,
    num_commands: i32,
) -> Result<Vec<TerminalSessionPreview>, SerializableError> {
    let app_state = app_handle.state::<AppState>();
    TerminalSessionPreview::fetch_recent(&app_state.connection_pool, num_sessions, num_commands)
        .await
}
