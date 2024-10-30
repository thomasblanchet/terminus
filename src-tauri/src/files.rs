use crate::error::SerializableError;
use crate::state::AppState;
use chrono::DateTime;
use futures::future::join_all;
use serde::Serialize;
use sqlx::{query, SqlitePool};
use tauri::{AppHandle, Manager};
use tokio::fs::File;
use tokio::io::{self, AsyncBufReadExt, BufReader};

#[derive(Serialize, Debug)]
#[serde(rename_all = "camelCase")]
pub struct FilePreview {
    id: i64,
    file_name: String,
    date: String,
    time: String,
    language: String,
    preview: String,
}

impl FilePreview {
    pub async fn fetch_recent(
        pool: &SqlitePool,
        num_files: i32,
    ) -> Result<Vec<Self>, SerializableError> {
        let recent_files = query!(
            r#"
            SELECT id, last_opened_at, language, file_path
            FROM file_history
            ORDER BY last_opened_at DESC
            LIMIT ?
            "#,
            num_files,
        )
        .fetch_all(pool)
        .await?;
        let file_previews = join_all(recent_files.into_iter().map(|row| {
            Self::build_preview(row.id, row.last_opened_at, row.language, row.file_path)
        }))
        .await
        .into_iter()
        .filter_map(|preview| preview)
        .collect();
        Ok(file_previews)
    }

    async fn build_preview(
        file_id: i64,
        last_opened_at: i64,
        language: String,
        file_path: String,
    ) -> Option<Self> {
        let preview = read_k_chars_from_n_lines(&file_path, 25, 7)
            .await
            .ok()?
            .join("\n");
        let path = std::path::Path::new(&file_path);
        let file_name = path.file_name()?;
        let timestamp = DateTime::from_timestamp(last_opened_at, 0);
        let pretty_date = timestamp.map_or(String::from("invalid date"), |t| {
            t.format("%a %d %b %Y").to_string()
        });
        let pretty_time = timestamp.map_or(String::from("invalid time"), |t| {
            t.format("%l:%M:%S%P").to_string()
        });
        Some(FilePreview {
            id: file_id,
            file_name: file_name.to_string_lossy().to_string(),
            date: pretty_date,
            time: pretty_time,
            language,
            preview,
        })
    }
}

async fn read_k_chars_from_n_lines(file_path: &str, k: usize, n: usize) -> io::Result<Vec<String>> {
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

#[tauri::command]
pub async fn get_recent_file_previews(
    app_handle: AppHandle,
    num_files: i32,
) -> Result<Vec<FilePreview>, SerializableError> {
    let app_state = app_handle.state::<AppState>();
    FilePreview::fetch_recent(&app_state.connection_pool, num_files).await
}
