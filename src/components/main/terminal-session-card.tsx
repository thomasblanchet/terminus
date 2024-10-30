import { Separator } from "@/components/ui/separator";
import { ChevronRight } from "lucide-react";
import * as monaco from "monaco-editor";
import { useEffect, useState } from "react";

interface TerminalSessionCardProps {
  id: number;
  date: string;
  time: string;
  commands: string[];
}

export function TerminalSessionCard(props: TerminalSessionCardProps) {
  const [colorizedCommands, setColorizedCommands] = useState<string[]>([]);
  useEffect(() => {
    Promise.allSettled(
      props.commands.map((command) =>
        monaco.editor.colorize(command, "shell", {}),
      ),
    ).then((result) => {
      setColorizedCommands(
        result.map((result, i) =>
          result.status === "fulfilled" ? result.value : props.commands[i],
        ),
      );
    });
  }, []);
  return (
    <div className="snap-start pl-2">
      <div className="flex-none truncate text-xs/4 w-48 h-48 p-3 rounded border shadow-sm bg-background font-mono hover:scale-105 transition-transform cursor-pointer">
        <div className="text-muted-foreground">{props.date}</div>
        <div className="text-muted-foreground">{props.time}</div>
        <Separator className="my-1" />
        {colorizedCommands.map((command, index) => (
          <div key={index} className="flex items-center">
            <ChevronRight className="h-3 w-3 mr-1 shrink-0" />
            <div
              className="text-xs/4 whitespace-pre overflow-hidden overflow-ellipsis"
              dangerouslySetInnerHTML={{ __html: command }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
