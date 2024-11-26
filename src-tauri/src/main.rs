// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod database;
mod error;
mod file_editor;
mod system_usage;
mod terminal;
mod theme;
mod window;

use crate::database::create_connection_pool;
use crate::file_editor::api::*;
use crate::system_usage::update_system_usage;
use crate::terminal::api::*;
use crate::terminal::manager::TerminalManager;
use crate::theme::set_titlebar_theme;
use crate::window::build_window;
use tauri::Manager;

fn main() -> Result<(), Box<dyn std::error::Error>> {
    tauri::Builder::default()
        .setup(move |app| {
            let app_handle = app.handle();
            // Start the thread updating the system usage
            let app_handle_system_usage = app_handle.clone();
            std::thread::spawn(move || update_system_usage(app_handle_system_usage));
            // Create the connection pool to the SQLite database
            let connection_pool =
                tauri::async_runtime::block_on(create_connection_pool(&app_handle))?;
            app.manage(connection_pool);
            // Create the manager for active terminal sessions
            let terminal_manager = TerminalManager::new();
            app.manage(terminal_manager);
            // Build the window
            let mut app_handle_build_window = app_handle.clone();
            build_window(&mut app_handle_build_window)?;
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            set_titlebar_theme,
            create_new_terminal,
            open_terminal,
            close_terminal,
            send_input_to_terminal,
            resize_terminal,
            get_recent_terminal_session_previews,
            get_terminal_session_preview,
            get_terminal_environment,
            get_terminal_command_history,
            get_recent_file_previews,
        ])
        .run(tauri::generate_context!())?;
    Ok(())
}
