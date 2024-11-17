use crate::error::SerializableError;
use ptyprocess::PtyProcess;
use serde::Serialize;
use std::io::Write;
use std::process::Command;
use tauri::{AppHandle, Manager};
use tokio::io::{AsyncBufReadExt, AsyncReadExt, AsyncWriteExt, BufReader};
use tokio::net::UnixListener;
use tokio::sync::{mpsc, Mutex};
use uuid::Uuid;

#[derive(Debug, Serialize, Clone)]
pub struct TerminalEnvironmentVariable {
    pub name: String,
    pub value: String,
}

#[derive(Debug)]
pub struct Terminal {
    pub pty_process: Mutex<PtyProcess>,
    pub shell_sender: mpsc::Sender<Vec<u8>>,
    pub shell_receiver: Mutex<mpsc::Receiver<Vec<u8>>>,

    pub socket_listener_env: Mutex<UnixListener>,

    pub socket_listener_cwd: Mutex<UnixListener>,
}

impl Terminal {
    pub fn new() -> Result<Self, SerializableError> {
        let (shell_sender, shell_receiver) = mpsc::channel(128);

        let uuid = Uuid::new_v4().to_string();
        let socket_listener_env = tauri::async_runtime::block_on(async {
            UnixListener::bind(format!("/tmp/{}-env.sock", uuid))
        })?;
        let socket_listener_cwd = tauri::async_runtime::block_on(async {
            UnixListener::bind(format!("/tmp/{}-cwd.sock", uuid))
        })?;

        let mut command = Command::new("zsh");
        command.env("TERMINUS_ENABLE", "true");
        command.env("TERMINUS_START_DIR", "/Users/thomasblanchet");
        command.env("TERMINUS_SOCKET_ENV", format!("/tmp/{}-env.sock", uuid));
        command.env("TERMINUS_SOCKET_CWD", format!("/tmp/{}-cwd.sock", uuid));
        command.env("TERMINUS_SOCKET_CMD", format!("/tmp/{}-cmd.sock", uuid));
        let process = PtyProcess::spawn(command)?;
        return Ok(Self {
            pty_process: Mutex::new(process),
            shell_sender,
            shell_receiver: Mutex::new(shell_receiver),
            socket_listener_env: Mutex::new(socket_listener_env),
            socket_listener_cwd: Mutex::new(socket_listener_cwd),
        });
    }
}

// Define commands for Tauri
#[tauri::command]
pub async fn write_to_shell(
    terminal: tauri::State<'_, Terminal>,
    input: Vec<u8>,
) -> Result<(), SerializableError> {
    let process = terminal.pty_process.lock().await;
    let file = process.get_raw_handle()?.try_clone()?;
    let mut async_file = tokio::fs::File::from_std(file);
    async_file.write_all(&input).await?;
    Ok(())
}

#[tauri::command]
pub async fn set_shell_size(
    terminal: tauri::State<'_, Terminal>,
    cols: u16,
    rows: u16,
) -> Result<(), SerializableError> {
    let mut process = terminal.pty_process.lock().await;
    process.set_window_size(cols, rows)?;
    Ok(())
}

#[tauri::command]
pub async fn listen_shell(terminal: tauri::State<'_, Terminal>) -> Result<(), SerializableError> {
    let process = terminal.pty_process.lock().await;
    let sender = terminal.shell_sender.clone();
    let file = process.get_raw_handle()?.try_clone()?;
    let mut async_file = tokio::fs::File::from_std(file);
    tokio::spawn(async move {
        loop {
            let mut buffer = [0; 1024];
            match async_file.read(&mut buffer).await? {
                0 => break,
                n => {
                    let data = buffer[..n].to_vec();
                    sender.send(data).await?;
                }
            }
        }
        Ok::<(), SerializableError>(())
    });
    Ok(())
}
