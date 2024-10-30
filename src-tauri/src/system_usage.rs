use crate::error::SerializableError;
use serde::{Deserialize, Serialize};
use sysinfo::{
    get_current_pid, ProcessRefreshKind, ProcessesToUpdate, System, MINIMUM_CPU_UPDATE_INTERVAL,
};
use tauri::{AppHandle, Emitter};

#[derive(Serialize, Clone, Deserialize, Debug)]
#[serde(rename_all = "camelCase")]
struct SystemUsage {
    cpu_usage: f32,
    memory_usage: f32,
}

pub fn update_system_usage(app_handle: AppHandle) -> Result<(), SerializableError> {
    let pid = get_current_pid()?;
    let mut system = System::new();
    system.refresh_processes_specifics(
        ProcessesToUpdate::Some(&[pid]),
        true,
        ProcessRefreshKind::new().with_cpu().with_memory(),
    );
    loop {
        std::thread::sleep(std::cmp::max(
            MINIMUM_CPU_UPDATE_INTERVAL,
            std::time::Duration::from_secs(10),
        ));
        system.refresh_processes_specifics(
            ProcessesToUpdate::Some(&[pid]),
            true,
            ProcessRefreshKind::new().with_cpu().with_memory(),
        );
        let process = match system.process(pid) {
            Some(process) => process,
            None => {
                let _ = app_handle.emit("update-system-usage", ());
                continue;
            }
        };
        let system_usage = SystemUsage {
            cpu_usage: process.cpu_usage(),
            memory_usage: (process.memory() as f32) / (1024.0 * 1024.0),
        };
        let _ = app_handle.emit("update-system-usage", system_usage);
    }
}
