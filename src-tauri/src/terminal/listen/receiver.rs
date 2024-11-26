use crate::error::SerializableError;
use std::future::Future;
use std::marker::Send;

pub trait Receiver<T> {
    fn handle_receive(&self, buffer: T) -> Result<(), SerializableError>;
}

pub trait AsyncReceiver<T> {
    fn handle_receive(
        &self,
        buffer: T,
    ) -> impl Future<Output = Result<(), SerializableError>> + Send;
}
