use crate::error::SerializableError;
use futures::future::join_all;
use serde::Serialize;
use sqlx::{query, SqlitePool};
use std::path::PathBuf;
use std::str::FromStr;
use tokio::fs::File;
use tokio::io::{AsyncBufReadExt, BufReader};

#[derive(Serialize, Debug)]
#[serde(rename_all = "camelCase")]
pub struct FilePreview {
    file_id: i64,
    directory: String,
    name: String,
    last_opened_at: i64,
    language: String,
    preview: String,
}

impl FilePreview {
    pub async fn load_recent(
        connection_pool: &SqlitePool,
        num_files: i64,
    ) -> Result<Vec<Self>, SerializableError> {
        let recent_files = query!(
            r#"
            SELECT id, directory, name, last_opened_at, language
            FROM files
            ORDER BY last_opened_at DESC
            LIMIT ?
            "#,
            num_files,
        )
        .fetch_all(connection_pool)
        .await?;
        let file_previews = join_all(recent_files.into_iter().map(|row| {
            Self::build_preview(
                row.id,
                row.directory,
                row.name,
                row.last_opened_at,
                row.language,
            )
        }))
        .await
        .into_iter()
        .filter_map(|preview| preview)
        .collect();
        Ok(file_previews)
    }

    async fn build_preview(
        file_id: i64,
        directory: String,
        name: String,
        last_opened_at: i64,
        language: String,
    ) -> Option<Self> {
        let file_path = std::path::PathBuf::from_str(&directory).ok()?.join(&name);
        let preview = read_k_chars_from_n_lines(&file_path, 1024, 7)
            .await
            .ok()?
            .join("\n");
        Some(Self {
            file_id,
            directory,
            name,
            last_opened_at,
            language,
            preview,
        })
    }
}

async fn read_k_chars_from_n_lines(
    file_path: &PathBuf,
    k: usize,
    n: usize,
) -> Result<Vec<String>, SerializableError> {
    let file = File::open(file_path).await?;
    let reader = BufReader::new(file);
    let mut lines = reader.lines();
    let mut result = Vec::new();
    for _ in 0..n {
        if let Some(line) = lines.next_line().await? {
            let truncated_line = line.chars().take(k).collect();
            result.push(truncated_line);
        } else {
            break;
        }
    }
    Ok(result)
}
