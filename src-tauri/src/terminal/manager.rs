use crate::error::SerializableError;
use crate::terminal::listen::file::base::FileHandler;
use crate::terminal::listen::file::output::TerminalOutputReceiver;
use crate::terminal::listen::socket::base::SocketHandler;
use crate::terminal::listen::socket::commands::TerminalCommandsReceiver;
use crate::terminal::listen::socket::environment::TerminalEnvironmentReceiver;
use crate::terminal::listen::socket::working_directory::TerminalWorkingDirectoryReceiver;
use crate::terminal::models::environment::TerminalEnvironment;
use crate::terminal::models::session::TerminalSession;
use dashmap::DashMap;
use ptyprocess::PtyProcess;
use sqlx::sqlite::SqlitePool;
use std::process::Command;
use tauri::AppHandle;
use tokio::fs::File;
use tokio::io::AsyncWriteExt;
use tokio_util::sync::CancellationToken;

pub struct TerminalManager {
    processes: DashMap<i64, PtyProcess>,
    cancel_tokens: DashMap<i64, CancellationToken>,
    files: DashMap<i64, File>,
}

impl TerminalManager {
    pub fn new() -> Self {
        Self {
            processes: DashMap::new(),
            cancel_tokens: DashMap::new(),
            files: DashMap::new(),
        }
    }

    pub async fn spawn_session(
        &self,
        session: &TerminalSession,
        connection_pool: &SqlitePool,
        app_handle: &AppHandle,
    ) -> Result<(), SerializableError> {
        let cancel_token = CancellationToken::new();
        let socket_environment =
            SocketHandler::create(session.terminal_id, "e", app_handle, cancel_token.clone())
                .await?;
        let socket_working_directory =
            SocketHandler::create(session.terminal_id, "d", app_handle, cancel_token.clone())
                .await?;
        let socket_commands =
            SocketHandler::create(session.terminal_id, "c", app_handle, cancel_token.clone())
                .await?;
        let terminal_command = Self::create_terminal_command(
            &session,
            &socket_environment,
            &socket_working_directory,
            &socket_commands,
            None,
        );
        let receiver_environment = TerminalEnvironmentReceiver::new(
            connection_pool.clone(),
            app_handle.clone(),
            session.terminal_id,
        );
        let receiver_working_directory = TerminalWorkingDirectoryReceiver::new(
            connection_pool.clone(),
            app_handle.clone(),
            session.terminal_id,
        );
        let receiver_commands = TerminalCommandsReceiver::new(
            connection_pool.clone(),
            app_handle.clone(),
            session.terminal_id,
        );
        socket_environment.listen(receiver_environment);
        socket_commands.listen(receiver_commands);
        socket_working_directory.listen(receiver_working_directory);
        let pty_process =
            tauri::async_runtime::spawn_blocking(move || PtyProcess::spawn(terminal_command))
                .await??;
        let pty_process_file = File::from_std(pty_process.get_raw_handle()?);
        let pty_process_file_handler = FileHandler {
            file: pty_process_file.try_clone().await?,
            cancel_token: cancel_token.clone(),
        };
        let pty_receiver = TerminalOutputReceiver::new(app_handle.clone(), session.terminal_id);
        pty_process_file_handler.listen(pty_receiver);
        self.processes.insert(session.terminal_id, pty_process);
        self.cancel_tokens.insert(session.terminal_id, cancel_token);
        self.files.insert(session.terminal_id, pty_process_file);
        Ok(())
    }

    pub async fn send_input(
        &self,
        terminal_id: i64,
        data: Vec<u8>,
    ) -> Result<(), SerializableError> {
        let mut file = self
            .files
            .get_mut(&terminal_id)
            .ok_or(SerializableError::new(format!(
                "Attempted to send input to terminal {} that does not exist",
                terminal_id
            )))?;
        file.write_all(&data).await?;
        Ok(())
    }

    pub async fn resize(
        &self,
        terminal_id: i64,
        columns: u16,
        rows: u16,
    ) -> Result<(), SerializableError> {
        let mut process = self
            .processes
            .get_mut(&terminal_id)
            .ok_or(SerializableError::new(format!(
                "Attempted to resize terminal {} that does not exist",
                terminal_id
            )))?;
        process.set_window_size(columns, rows)?;
        Ok(())
    }

    pub async fn close(&self, terminal_id: i64) -> Result<(), SerializableError> {
        if let Some((_, mut process)) = self.processes.remove(&terminal_id) {
            process.exit(true)?;
        }
        if let Some((_, cancel_token)) = self.cancel_tokens.remove(&terminal_id) {
            cancel_token.cancel();
        }
        let _ = self.files.remove(&terminal_id);
        Ok(())
    }

    fn create_terminal_command(
        session: &TerminalSession,
        socket_environment: &SocketHandler,
        socket_working_directory: &SocketHandler,
        socket_commands: &SocketHandler,
        environment: Option<&TerminalEnvironment>,
    ) -> Command {
        let mut command = Command::new("zsh");
        command.env("__TERMINUS_ENABLE", "true");
        command.env("__TERMINUS_START_DIR", &session.working_directory);
        command.env("__TERMINUS_SOCKET_ENV", &socket_environment.path);
        command.env("__TERMINUS_SOCKET_CWD", &socket_working_directory.path);
        command.env("__TERMINUS_SOCKET_CMD", &socket_commands.path);
        if let Some(env) = environment {
            env.environment.iter().for_each(|variable| {
                command.env(&variable.name, &variable.value);
            });
        }
        command
    }
}
