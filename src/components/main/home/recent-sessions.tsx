import { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { TerminalSessionCard } from "@/components/main/terminal-session-card";
import { LoaderCircle, Ban } from "lucide-react";

interface TerminalSessionPreview {
  id: number;
  date: string;
  time: string;
  commands: string[];
}

export function RecentSessions() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [recentSessions, setRecentSessions] = useState<
    TerminalSessionPreview[]
  >([]);
  useEffect(() => {
    invoke<TerminalSessionPreview[]>("get_recent_session_previews", {
      numSessions: 10,
      numCommands: 10,
    })
      .then((sessions) => {
        setRecentSessions(sessions);
        setLoading(false);
      })
      .catch((error) => {
        setError(error);
        setLoading(false);
      });
  }, []);
  if (loading) {
    return (
      <div className="flex-none overflow-hidden border rounded shadow-inner bg-primary-foreground">
        <div className="text-sm text-muted-foreground h-48 p-3 w-full text-center flex items-center justify-center">
          <LoaderCircle className="h-8 w-8 animate-spin" />
        </div>
      </div>
    );
  }
  if (error) {
    return (
      <div className="flex-none overflow-hidden border rounded shadow-inner bg-primary-foreground">
        <div className="text-sm text-muted-foreground h-48 p-3 w-full flex flex-col items-center justify-center">
          <Ban className="mb-2" />
          <div>Could not load recent sessions:</div>
          <div>{error}</div>
        </div>
      </div>
    );
  }
  if (recentSessions.length === 0) {
    return (
      <div className="flex-none overflow-hidden border rounded shadow-inner bg-primary-foreground">
        <div className="text-sm text-muted-foreground h-48 p-3 w-full text-center flex items-center justify-center">
          No recent sessions available
        </div>
      </div>
    );
  }
  return (
    <div className="flex-none overflow-hidden border rounded shadow-inner bg-primary-foreground">
      <div className="flex overflow-x-auto snap-x snap-mandatory">
        <div className="flex py-2 pr-2">
          {recentSessions.map((session) => (
            <TerminalSessionCard
              id={session.id}
              date={session.date}
              time={session.time}
              commands={session.commands}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
