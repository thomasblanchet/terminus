use crate::error::SerializableError;
use sqlx::migrate;
use sqlx::sqlite::{SqliteConnectOptions, SqlitePool};
use std::path::PathBuf;

pub async fn create_connection_pool(db_path: PathBuf) -> Result<SqlitePool, SerializableError> {
    let option = SqliteConnectOptions::new()
        .filename(db_path)
        .create_if_missing(true);
    let connection_pool = SqlitePool::connect_with(option).await?;
    migrate!("./migrations").run(&connection_pool).await?;
    Ok(connection_pool)
}
