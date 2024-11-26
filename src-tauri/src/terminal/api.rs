use crate::error::SerializableError;
use crate::terminal::manager::TerminalManager;
use crate::terminal::models::commands::TerminalCommandHistory;
use crate::terminal::models::environment::TerminalEnvironment;
use crate::terminal::models::preview::TerminalSessionPreview;
use crate::terminal::models::session::TerminalSession;
use sqlx::sqlite::SqlitePool;
use tauri::{AppHandle, Manager, State};

#[tauri::command(rename_all = "camelCase")]
pub async fn create_new_terminal(
    connection_pool: State<'_, SqlitePool>,
    app_handle: AppHandle,
) -> Result<TerminalSession, SerializableError> {
    let home_directory = app_handle.path().home_dir()?.to_string_lossy().to_string();
    let session = TerminalSession::insert_new(&connection_pool, home_directory).await?;
    Ok(session)
}

#[tauri::command(rename_all = "camelCase")]
pub async fn open_terminal(
    terminal_manager: State<'_, TerminalManager>,
    connection_pool: State<'_, SqlitePool>,
    app_handle: AppHandle,
    terminal_id: i64,
) -> Result<TerminalSession, SerializableError> {
    let session = TerminalSession::load_existing(&connection_pool, terminal_id).await?;
    terminal_manager
        .inner()
        .spawn_session(&session, &connection_pool, &app_handle)
        .await?;
    Ok(session)
}

#[tauri::command(rename_all = "camelCase")]
pub async fn close_terminal(
    terminal_manager: State<'_, TerminalManager>,
    terminal_id: i64,
) -> Result<(), SerializableError> {
    terminal_manager.inner().close(terminal_id).await?;
    Ok(())
}

#[tauri::command(rename_all = "camelCase")]
pub async fn send_input_to_terminal(
    terminal_manager: State<'_, TerminalManager>,
    terminal_id: i64,
    input: Vec<u8>,
) -> Result<(), SerializableError> {
    terminal_manager
        .inner()
        .send_input(terminal_id, input)
        .await?;
    Ok(())
}

#[tauri::command(rename_all = "camelCase")]
pub async fn resize_terminal(
    terminal_manager: State<'_, TerminalManager>,
    terminal_id: i64,
    columns: u16,
    rows: u16,
) -> Result<(), SerializableError> {
    terminal_manager
        .inner()
        .resize(terminal_id, columns, rows)
        .await?;
    Ok(())
}

#[tauri::command(rename_all = "camelCase")]
pub async fn get_recent_terminal_session_previews(
    connection_pool: State<'_, SqlitePool>,
    num_sessions: i64,
    num_commands: i64,
) -> Result<Vec<TerminalSessionPreview>, SerializableError> {
    let sessions =
        TerminalSessionPreview::load_recent(&connection_pool, num_sessions, num_commands).await?;
    Ok(sessions)
}

#[tauri::command(rename_all = "camelCase")]
pub async fn get_terminal_session_preview(
    connection_pool: State<'_, SqlitePool>,
    terminal_id: i64,
    num_commands: i64,
) -> Result<TerminalSessionPreview, SerializableError> {
    let session = TerminalSessionPreview::load(&connection_pool, terminal_id, num_commands).await?;
    Ok(session)
}

#[tauri::command(rename_all = "camelCase")]
pub async fn get_terminal_environment(
    connection_pool: State<'_, SqlitePool>,
    terminal_id: i64,
) -> Result<TerminalEnvironment, SerializableError> {
    let environment = TerminalEnvironment::load(&connection_pool, terminal_id).await?;
    Ok(environment)
}

#[tauri::command(rename_all = "camelCase")]
pub async fn get_terminal_command_history(
    connection_pool: State<'_, SqlitePool>,
    terminal_id: i64,
) -> Result<TerminalCommandHistory, SerializableError> {
    let history = TerminalCommandHistory::load(&connection_pool, terminal_id).await?;
    Ok(history)
}
