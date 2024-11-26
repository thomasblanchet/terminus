use crate::error::SerializableError;
use serde::Serialize;
use sqlx::sqlite::SqlitePool;
use sqlx::{query, query_as};

#[derive(Debug, Serialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct TerminalEnvironmentVariable {
    pub name: String,
    pub value: String,
}

#[derive(Debug, Serialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct TerminalEnvironment {
    pub terminal_id: i64,
    pub environment: Vec<TerminalEnvironmentVariable>,
}

impl TerminalEnvironmentVariable {
    pub fn from_env_str(text: &str) -> Option<Self> {
        let mut parts = text.splitn(2, '=');
        let name = parts.next()?.to_string();
        let value = parts.next().unwrap_or("").to_string();
        Some(Self { name, value })
    }

    pub async fn insert(
        &self,
        connection_pool: &SqlitePool,
        terminal_id: i64,
    ) -> Result<(), SerializableError> {
        query!(
            r#"INSERT INTO terminal_environments (terminal_id, name, value) VALUES (?, ?, ?)"#,
            terminal_id,
            self.name,
            self.value
        )
        .execute(connection_pool)
        .await?;
        Ok(())
    }
}

impl TerminalEnvironment {
    pub fn from_env_str(terminal_id: i64, text: &str) -> Self {
        let environment = text
            .split("\0")
            .filter_map(TerminalEnvironmentVariable::from_env_str)
            .collect();
        Self {
            terminal_id,
            environment,
        }
    }

    pub async fn load(
        connection_pool: &SqlitePool,
        terminal_id: i64,
    ) -> Result<Self, SerializableError> {
        let environment = query_as!(
            TerminalEnvironmentVariable,
            r#"SELECT name, value FROM terminal_environments WHERE terminal_id = ?"#,
            terminal_id
        )
        .fetch_all(connection_pool)
        .await?;
        Ok(Self {
            terminal_id,
            environment,
        })
    }

    pub async fn replace(&self, connection_pool: &SqlitePool) -> Result<(), SerializableError> {
        self.delete(connection_pool).await?;
        for variable in &self.environment {
            variable.insert(connection_pool, self.terminal_id).await?;
        }
        Ok(())
    }

    pub async fn delete(&self, connection_pool: &SqlitePool) -> Result<(), SerializableError> {
        query!(
            r#"DELETE FROM terminal_environments WHERE terminal_id = ?"#,
            self.terminal_id
        )
        .execute(connection_pool)
        .await?;
        Ok(())
    }
}
