// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod database;
mod error;
mod files;
mod state;
mod system_usage;
mod terminal_sessions;
mod theme;
mod window;

use files::get_recent_file_previews;
use state::AppState;
use std::error::Error;
use system_usage::update_system_usage;
use tauri::Manager;
use terminal_sessions::get_recent_session_previews;
use theme::set_titlebar_theme;
use tokio::runtime::Runtime;
use window::build_window;

fn main() {
    tauri::Builder::default()
        .setup(app_setup)
        .invoke_handler(tauri::generate_handler![
            set_titlebar_theme,
            get_recent_file_previews,
            get_recent_session_previews
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

fn app_setup(app: &mut tauri::App) -> Result<(), Box<dyn Error>> {
    let runtime = Runtime::new()?;
    let mut app_handle = app.handle().clone();
    app.manage(runtime.block_on(AppState::new(&app_handle))?);
    build_window(&mut app_handle)?;
    std::thread::spawn(move || update_system_usage(app_handle));
    Ok(())
}
