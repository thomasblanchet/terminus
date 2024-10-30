use crate::error::SerializableError;
use crate::window::set_titlebar_color;
use tauri::Window;

struct RGBColor {
    red: f64,
    green: f64,
    blue: f64,
}

const LIGHT_THEME_BACKGROUND: RGBColor = RGBColor {
    red: 248.0 / 255.0,
    green: 250.0 / 255.0,
    blue: 252.0 / 255.0,
};
const DARK_THEME_BACKGROUND: RGBColor = RGBColor {
    red: 15.0 / 255.5,
    green: 23.0 / 255.0,
    blue: 42.0 / 255.0,
};

#[tauri::command]
pub fn set_titlebar_theme(window: Window, theme: &str) -> Result<(), SerializableError> {
    match theme {
        "light" => set_titlebar_color(
            &window,
            LIGHT_THEME_BACKGROUND.red,
            LIGHT_THEME_BACKGROUND.green,
            LIGHT_THEME_BACKGROUND.blue,
        )?,
        "dark" => set_titlebar_color(
            &window,
            DARK_THEME_BACKGROUND.red,
            DARK_THEME_BACKGROUND.green,
            DARK_THEME_BACKGROUND.blue,
        )?,
        _ => return Err(SerializableError::new("Invalid theme")),
    }
    Ok(())
}
