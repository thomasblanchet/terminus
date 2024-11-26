use crate::error::SerializableError;
use serde::Serialize;
use sqlx::query;
use sqlx::sqlite::SqlitePool;

#[derive(Debug, Serialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct TerminalSession {
    pub terminal_id: i64,
    pub working_directory: String,
}

impl TerminalSession {
    pub async fn insert_new(
        connection_pool: &SqlitePool,
        working_directory: String,
    ) -> Result<Self, SerializableError> {
        let start = std::time::Instant::now();
        let terminal_id = query!(
            r#"INSERT INTO terminals(working_directory) VALUES (?) RETURNING id"#,
            working_directory
        )
        .fetch_one(connection_pool)
        .await?
        .id;
        println!("Time to insert new terminal: {:?}", start.elapsed());
        Ok(Self {
            terminal_id,
            working_directory,
        })
    }

    pub async fn load_existing(
        connection_pool: &SqlitePool,
        terminal_id: i64,
    ) -> Result<Self, SerializableError> {
        let working_directory = query!(
            r#"SELECT working_directory FROM terminals WHERE id = ?"#,
            terminal_id
        )
        .fetch_one(connection_pool)
        .await?
        .working_directory;
        Ok(Self {
            terminal_id,
            working_directory,
        })
    }

    pub async fn update(
        connection_pool: &SqlitePool,
        terminal_id: i64,
        working_directory: String,
    ) -> Result<Self, SerializableError> {
        query!(
            r#"UPDATE terminals SET working_directory = ? WHERE id = ?"#,
            working_directory,
            terminal_id
        )
        .execute(connection_pool)
        .await?;
        Ok(Self {
            terminal_id,
            working_directory,
        })
    }
}
