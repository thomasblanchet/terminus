use crate::error::SerializableError;
use crate::terminal::listen::receiver::AsyncReceiver;
use std::marker::Send;
use std::path::PathBuf;
use tauri::{AppHandle, Manager};
use tokio::io::{AsyncBufReadExt, BufReader};
use tokio::net::UnixListener;
use tokio::select;
use tokio_util::sync::CancellationToken;

pub struct SocketHandler {
    listener: UnixListener,
    cancel_token: CancellationToken,
    pub path: PathBuf,
}

impl SocketHandler {
    pub async fn create(
        terminal_id: i64,
        subfolder: &str,
        app_handle: &AppHandle,
        cancel_token: CancellationToken,
    ) -> Result<Self, SerializableError> {
        let socket_directory = app_handle.path().temp_dir()?.join(subfolder);
        std::fs::create_dir_all(&socket_directory)?;
        let path = socket_directory.join(terminal_id.to_string());
        println!("Socket path: {:?}", path);
        if path.exists() {
            tokio::fs::remove_file(&path).await?;
        }
        let listener = UnixListener::bind(path.clone())?;
        Ok(Self {
            listener,
            path,
            cancel_token,
        })
    }

    pub fn listen(self, receiver: impl AsyncReceiver<String> + Send + 'static) {
        tauri::async_runtime::spawn(async move {
            'event: loop {
                select! {
                    _ = self.cancel_token.cancelled() => {
                        break 'event;
                    }
                    Ok((stream, _)) = self.listener.accept() => {
                        let mut reader = BufReader::new(stream);
                        let mut buffer = String::new();
                        match reader.read_line(&mut buffer).await {
                            Ok(0) => break 'event, // EOF
                            Err(_) => continue 'event, // TODO: show error in GUI
                            _ => {}
                        };
                        match receiver.handle_receive(buffer).await {
                            Err(_) => continue 'event, // TODO: show error in GUI
                            _ => {}
                        }
                    }
                }
            }
            let _ = self.close().await;
        });
    }

    async fn close(self) -> Result<(), SerializableError> {
        drop(self.listener);
        tokio::fs::remove_file(self.path).await?;
        Ok(())
    }
}
