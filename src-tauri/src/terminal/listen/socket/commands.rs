use crate::error::SerializableError;
use crate::terminal::listen::receiver::AsyncReceiver;
use crate::terminal::models::commands::TerminalCommand;
use sqlx::sqlite::SqlitePool;
use tauri::{AppHandle, Emitter};

pub struct TerminalCommandsReceiver {
    connection_pool: SqlitePool,
    app_handle: AppHandle,
    terminal_id: i64,
    target_event: String,
}

impl TerminalCommandsReceiver {
    pub fn new(connection_pool: SqlitePool, app_handle: AppHandle, terminal_id: i64) -> Self {
        Self {
            connection_pool,
            app_handle,
            terminal_id,
            target_event: format!("terminal-commands-{}", terminal_id),
        }
    }
}

impl AsyncReceiver<String> for TerminalCommandsReceiver {
    async fn handle_receive(&self, buffer: String) -> Result<(), SerializableError> {
        let command =
            TerminalCommand::insert_new(&self.connection_pool, self.terminal_id, buffer).await?;
        self.app_handle.emit(&self.target_event, command)?;
        Ok(())
    }
}
