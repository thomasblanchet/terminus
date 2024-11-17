// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod database;
mod error;
mod files;
mod state;
mod system_usage;
mod terminal;
mod terminal_sessions;
mod theme;
mod window;

use files::get_recent_file_previews;
use state::AppState;
use system_usage::update_system_usage;
use tauri::{Emitter, Manager};
use terminal::{
    listen_shell, set_shell_size, write_to_shell, Terminal, TerminalEnvironmentVariable,
};
use terminal_sessions::get_recent_session_previews;
use theme::set_titlebar_theme;
use tokio::io::{AsyncBufReadExt, AsyncReadExt, AsyncWriteExt, BufReader};
use tokio::runtime::Runtime;
use window::build_window;

fn main() -> Result<(), Box<dyn std::error::Error>> {
    tauri::Builder::default()
        .manage(Terminal::new()?)
        .setup(move |app| {
            let mut app_handle = app.handle().clone();
            let runtime = Runtime::new()?;
            app.manage(runtime.block_on(AppState::new(&app_handle))?);
            build_window(&mut app_handle)?;
            std::thread::spawn(move || update_system_usage(app_handle));

            let app_handle = app.handle().clone();
            tauri::async_runtime::spawn(async move {
                let terminal = app_handle.state::<Terminal>();
                let mut receiver = terminal.shell_receiver.lock().await;
                loop {
                    let data = receiver.recv().await.unwrap();
                    app_handle.emit("terminal-output", data).unwrap();
                }
            });

            let app_handle = app.handle().clone();
            tauri::async_runtime::spawn(async move {
                let terminal = app_handle.state::<Terminal>();
                let listener = terminal.socket_listener_env.lock().await;
                loop {
                    let (socket, _) = listener.accept().await.unwrap();
                    let mut reader = BufReader::new(socket);
                    let mut line = String::new();
                    reader.read_line(&mut line).await.unwrap();
                    let mut variables: Vec<TerminalEnvironmentVariable> = Vec::new();
                    for elem in line.split("\0") {
                        let parts: Vec<&str> = elem.splitn(2, "=").collect();
                        if parts.len() == 2 {
                            variables.push(TerminalEnvironmentVariable {
                                name: parts[0].to_string(),
                                value: parts[1].to_string(),
                            });
                        }
                    }
                    app_handle
                        .emit("terminal-environment-variables", variables)
                        .unwrap();
                    println!("Received (env): {}", line);
                }
            });

            let app_handle = app.handle().clone();
            tauri::async_runtime::spawn(async move {
                let terminal = app_handle.state::<Terminal>();
                let listener = terminal.socket_listener_cwd.lock().await;
                loop {
                    let (socket, _) = listener.accept().await.unwrap();
                    let mut reader = BufReader::new(socket);
                    let mut line = String::new();
                    reader.read_line(&mut line).await.unwrap();
                    app_handle.emit("terminal-cwd", line).unwrap();
                }
            });

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            set_titlebar_theme,
            get_recent_file_previews,
            get_recent_session_previews,
            write_to_shell,
            listen_shell,
            set_shell_size
        ])
        .run(tauri::generate_context!())?;
    Ok(())
}
