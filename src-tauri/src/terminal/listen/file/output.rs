use crate::error::SerializableError;
use crate::terminal::listen::receiver::Receiver;
use serde::Serialize;
use tauri::{AppHandle, Emitter};

#[derive(Clone, Serialize)]
#[serde(rename_all = "camelCase")]
struct TerminalRawData {
    terminal_id: i64,
    data: Vec<u8>,
}

pub struct TerminalOutputReceiver {
    app_handle: AppHandle,
    terminal_id: i64,
    target_event: String,
}

impl TerminalOutputReceiver {
    pub fn new(app_handle: AppHandle, terminal_id: i64) -> Self {
        Self {
            app_handle,
            terminal_id,
            target_event: format!("terminal-output-{}", terminal_id),
        }
    }
}

impl Receiver<Vec<u8>> for TerminalOutputReceiver {
    fn handle_receive(&self, data: Vec<u8>) -> Result<(), SerializableError> {
        let payload = TerminalRawData {
            terminal_id: self.terminal_id,
            data,
        };
        self.app_handle.emit(&self.target_event, payload)?;
        Ok(())
    }
}
