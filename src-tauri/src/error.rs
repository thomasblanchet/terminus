use ptyprocess::errno;
use serde::ser::{Serializer, StdError};
use serde::Serialize;
use std::error::Error;
use std::fmt::{Display, Formatter, Result as FmtResult};
use std::sync::PoisonError;

#[derive(Debug, Clone)]
pub struct SerializableError {
    message: String,
}

impl Error for SerializableError {}

impl Display for SerializableError {
    fn fmt(&self, f: &mut Formatter) -> FmtResult {
        write!(f, "{}", self.message)
    }
}

impl SerializableError {
    pub fn new(message: impl Into<String>) -> Self {
        Self {
            message: message.into(),
        }
    }
}

macro_rules! impl_from_error {
    ($($t:ty),*) => {
        $(impl From<$t> for SerializableError {
            fn from(error: $t) -> Self {
                Self {
                    message: error.to_string(),
                }
            }
        })*
    };
}

impl_from_error!(
    &str,
    String,
    tauri::Error,
    tauri_plugin_dialog::Error,
    sqlx::Error,
    sqlx::migrate::MigrateError,
    std::io::Error,
    Box<dyn StdError + Send + Sync>,
    Box<dyn std::error::Error>,
    errno::Errno,
    tokio::sync::mpsc::error::SendError<Vec<u8>>
);

impl<T> From<PoisonError<T>> for SerializableError {
    fn from(error: PoisonError<T>) -> Self {
        Self {
            message: error.to_string(),
        }
    }
}

impl Serialize for SerializableError {
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
    where
        S: Serializer,
    {
        serializer.serialize_str(self.to_string().as_ref())
    }
}
