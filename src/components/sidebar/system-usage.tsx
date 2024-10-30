import { listen, Event } from "@tauri-apps/api/event";
import { Cpu, MemoryStick, LoaderCircle } from "lucide-react";
import { useState, useEffect } from "react";

interface SystemUsage {
  cpuUsage: number;
  memoryUsage: number;
}

function renderCpuUsage(systemUsage: SystemUsage | null) {
  if (systemUsage === null) {
    return <LoaderCircle className="h-4 w-4 animate-spin" />;
  }
  return <span>{systemUsage.cpuUsage.toFixed(0)}%</span>;
}

function renderMemoryUsage(systemUsage: SystemUsage | null) {
  if (systemUsage === null) {
    return <LoaderCircle className="h-4 w-4 animate-spin" />;
  }
  return <span>{systemUsage.memoryUsage.toFixed(0)} MB</span>;
}

export function SystemUsage() {
  const [systemUsage, setSystemUsage] = useState<SystemUsage | null>(null);

  useEffect(() => {
    const unlisten = listen<SystemUsage | null>(
      "update-system-usage",
      (event: Event<SystemUsage | null>) => {
        setSystemUsage(event.payload);
      },
    );
    return () => {
      unlisten.then();
    };
  }, []);

  return (
    <div className="flex-col space-y-2 m-2">
      <div className="flex flex-row items-center justify-between">
        <div className="flex flex-row items-center space-x-2">
          <MemoryStick className="h-4 w-4" />
          <span className="text-xs">Memory Usage</span>
        </div>
        <span className="ml-2 text-right font-mono text-xs">
          {renderMemoryUsage(systemUsage)}
        </span>
      </div>
      <div className="flex flex-row items-center justify-between">
        <div className="flex flex-row items-center space-x-2">
          <Cpu className="h-4 w-4" />
          <span className="text-xs">CPU Usage</span>
        </div>
        <span className="ml-2 text-right font-mono text-xs">
          {renderCpuUsage(systemUsage)}
        </span>
      </div>
    </div>
  );
}
