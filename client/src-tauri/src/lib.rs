use std::env;
use std::process::Command;
use std::thread;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    // Spawn a new thread to run the other application
    thread::spawn(|| {
        let path_exe = env::current_exe().expect("failed to get path of exe");
        let path_dir = path_exe.parent().expect("failet to get dir path");
        let path_server = format!(
            "{}",
            if cfg!(target_os = "windows") {
                format!("{}\\server.exe", path_dir.display())
            } else {
                format!("{}/server", path_dir.display())
            }
        );
        println!("{}", path_server);
        Command::new(path_server)
            .spawn()
            .expect("failed to execute process");


    });

    tauri::Builder::default()
        .setup(|app| {
            if cfg!(debug_assertions) {
                app.handle().plugin(
                    tauri_plugin_log::Builder::default()
                        .level(log::LevelFilter::Info)
                        .build(),
                )?;
            }
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
