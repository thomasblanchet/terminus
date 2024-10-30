use crate::{database::create_connection_pool, error::SerializableError};
use sqlx::migrate;
use sqlx::sqlite::SqlitePool;
use tauri::{AppHandle, Manager};

pub struct AppState {
    pub connection_pool: SqlitePool,
}

impl AppState {
    pub async fn new(app_handle: &AppHandle) -> Result<Self, SerializableError> {
        let app_dir = app_handle.path().app_config_dir()?;
        std::fs::create_dir_all(&app_dir)?;
        let db_path = app_dir.join("terminus.sqlite");
        let connection_pool = create_connection_pool(db_path.clone()).await?;
        migrate!("./migrations").run(&connection_pool).await?;
        Ok(Self { connection_pool })
    }
}
