use std::process::Command;
use std::thread;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
  // Spawn a new thread to run the other application
  thread::spawn(|| {
    let output = Command::new("./server")
      .output()
      .expect("failed to execute process");

    if !output.status.success() {
      eprintln!("Application exited with error: {:?}", output);
    }
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
