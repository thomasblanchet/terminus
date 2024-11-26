use crate::terminal::listen::receiver::Receiver;
use tokio::fs::File;
use tokio::io::AsyncReadExt;
use tokio::select;
use tokio_util::sync::CancellationToken;

pub struct FileHandler {
    pub file: File,
    pub cancel_token: CancellationToken,
}

impl FileHandler {
    pub fn listen(mut self, receiver: impl Receiver<Vec<u8>> + Send + 'static) {
        tauri::async_runtime::spawn(async move {
            'event: loop {
                let mut buffer = [0; 1024];
                select! {
                    _ = self.cancel_token.cancelled() => {
                        break 'event;
                    }
                    Ok(n) = self.file.read(&mut buffer) => {
                        if n == 0 {
                            break 'event;
                        }
                        let data = buffer[..n].to_vec();
                        match receiver.handle_receive(data) {
                            Err(_) => continue 'event, // TODO: show error in GUI
                            _ => {}
                        }
                    }
                }
            }
        });
    }
}
