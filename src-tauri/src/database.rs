use crate::error::SerializableError;
use sqlx::migrate;
use sqlx::sqlite::{SqliteConnectOptions, SqlitePool};
use tauri::{AppHandle, Manager};

const DB_FILE_NAME: &str = "terminus.sqlite";

pub async fn create_connection_pool(
    app_handle: &AppHandle,
) -> Result<SqlitePool, SerializableError> {
    let app_dir = app_handle.path().app_config_dir()?;
    std::fs::create_dir_all(&app_dir)?;
    let db_path = app_dir.join(DB_FILE_NAME);
    let options = SqliteConnectOptions::new()
        .filename(db_path)
        .create_if_missing(true);
    let connection_pool = SqlitePool::connect_with(options).await?;
    migrate!("./migrations").run(&connection_pool).await?;
    Ok(connection_pool)
}
