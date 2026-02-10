use serde::Serialize;

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct PlatformDefaults {
    pub default_shell: String,
    pub default_shell_args: Vec<String>,
    pub home_dir: String,
    pub os: String,
}

#[tauri::command]
pub fn get_platform_defaults() -> PlatformDefaults {
    let home = dirs_next().unwrap_or_default();

    #[cfg(target_os = "windows")]
    let (shell, args, os) = ("cmd.exe".to_string(), vec!["/k".to_string()], "windows");

    #[cfg(target_os = "macos")]
    let (shell, args, os) = (
        std::env::var("SHELL").unwrap_or_else(|_| "/bin/zsh".to_string()),
        vec!["-l".to_string()],
        "macos",
    );

    #[cfg(target_os = "linux")]
    let (shell, args, os) = (
        std::env::var("SHELL").unwrap_or_else(|_| "/bin/bash".to_string()),
        vec!["-l".to_string()],
        "linux",
    );

    #[cfg(not(any(target_os = "windows", target_os = "macos", target_os = "linux")))]
    let (shell, args, os) = ("/bin/sh".to_string(), vec![], "unknown");

    PlatformDefaults {
        default_shell: shell,
        default_shell_args: args,
        home_dir: home,
        os: os.to_string(),
    }
}

fn dirs_next() -> Option<String> {
    #[cfg(target_os = "windows")]
    {
        std::env::var("USERPROFILE").ok()
    }
    #[cfg(not(target_os = "windows"))]
    {
        std::env::var("HOME").ok()
    }
}
