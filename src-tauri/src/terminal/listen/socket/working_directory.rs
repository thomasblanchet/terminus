use crate::error::SerializableError;
use crate::terminal::listen::receiver::AsyncReceiver;
use crate::terminal::models::session::TerminalSession;
use sqlx::sqlite::SqlitePool;
use tauri::{AppHandle, Emitter};

pub struct TerminalWorkingDirectoryReceiver {
    connection_pool: SqlitePool,
    app_handle: AppHandle,
    terminal_id: i64,
    target_event: String,
}

impl TerminalWorkingDirectoryReceiver {
    pub fn new(connection_pool: SqlitePool, app_handle: AppHandle, terminal_id: i64) -> Self {
        Self {
            connection_pool,
            app_handle,
            terminal_id,
            target_event: format!("terminal-working-directory-{}", terminal_id),
        }
    }
}

impl AsyncReceiver<String> for TerminalWorkingDirectoryReceiver {
    async fn handle_receive(&self, buffer: String) -> Result<(), SerializableError> {
        let session =
            TerminalSession::update(&self.connection_pool, self.terminal_id, buffer).await?;
        self.app_handle.emit(&self.target_event, session)?;
        Ok(())
    }
}
