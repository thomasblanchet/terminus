use crate::error::SerializableError;
use crate::file_editor::models::preview::FilePreview;
use sqlx::sqlite::SqlitePool;
use tauri::State;

#[tauri::command(rename_all = "camelCase")]
pub async fn get_recent_file_previews(
    connection_pool: State<'_, SqlitePool>,
    num_files: i64,
) -> Result<Vec<FilePreview>, SerializableError> {
    FilePreview::load_recent(&connection_pool, num_files).await
}
