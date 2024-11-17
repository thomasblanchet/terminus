use cocoa::appkit::{NSColor, NSWindow};
use cocoa::base::{id, nil};
use std::error::Error;
use tauri::{AppHandle, TitleBarStyle, WebviewUrl, WebviewWindowBuilder, Window};

use crate::error::SerializableError;

const WINDOW_HEIGHT: f64 = 1000.0;
const WINDOW_WIDTH: f64 = 1700.0;

pub fn build_window(app_handle: &mut AppHandle) -> Result<(), Box<dyn Error>> {
    let win_builder = WebviewWindowBuilder::new(app_handle, "main", WebviewUrl::default())
        .title("")
        .disable_drag_drop_handler()
        .inner_size(WINDOW_WIDTH, WINDOW_HEIGHT);
    #[cfg(target_os = "macos")]
    let win_builder = win_builder.title_bar_style(TitleBarStyle::Transparent);
    win_builder.build()?;
    Ok(())
}

pub fn set_titlebar_color(
    window: &Window,
    red: f64,
    green: f64,
    blue: f64,
) -> Result<(), SerializableError> {
    #[cfg(target_os = "macos")]
    {
        let ns_window = window.ns_window()? as id;
        unsafe {
            let bg_color = NSColor::colorWithRed_green_blue_alpha_(nil, red, green, blue, 1.0);
            ns_window.setBackgroundColor_(bg_color);
        }
    }
    Ok(())
}
