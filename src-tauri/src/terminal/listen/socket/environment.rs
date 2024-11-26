use crate::error::SerializableError;
use crate::terminal::listen::receiver::AsyncReceiver;
use crate::terminal::models::environment::TerminalEnvironment;
use sqlx::sqlite::SqlitePool;
use tauri::{AppHandle, Emitter};

pub struct TerminalEnvironmentReceiver {
    connection_pool: SqlitePool,
    app_handle: AppHandle,
    terminal_id: i64,
    target_event: String,
}

impl TerminalEnvironmentReceiver {
    pub fn new(connection_pool: SqlitePool, app_handle: AppHandle, terminal_id: i64) -> Self {
        Self {
            connection_pool,
            app_handle,
            terminal_id,
            target_event: format!("terminal-environment-{}", terminal_id),
        }
    }
}

impl AsyncReceiver<String> for TerminalEnvironmentReceiver {
    async fn handle_receive(&self, buffer: String) -> Result<(), SerializableError> {
        let environment = TerminalEnvironment::from_env_str(self.terminal_id, &buffer);
        environment.replace(&self.connection_pool).await?;
        self.app_handle.emit(&self.target_event, environment)?;
        Ok(())
    }
}
