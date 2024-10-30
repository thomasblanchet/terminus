import { Separator } from "@/components/ui/separator";
import * as monaco from "monaco-editor";
import { useEffect, useState } from "react";

interface FilePreviewCardProps {
  id: number;
  fileName: string;
  date: string;
  time: string;
  language: string;
  preview: string;
}

export function FilePreviewCard(props: FilePreviewCardProps) {
  const [colorizedText, setColorizedText] = useState<string | null>(null);
  useEffect(() => {
    monaco.editor
      .colorize(props.preview, props.language, {})
      .then((colorized) => {
        console.log(colorized);
        setColorizedText(colorized);
      })
      .catch(() => {
        setColorizedText(props.preview);
      });
  }, []);
  return (
    <div className="snap-start pl-2">
      <div className="flex-none truncate text-xs/4 w-48 h-48 p-3 rounded border shadow-sm bg-background font-mono hover:scale-105 transition-transform cursor-pointer">
        <div className="font-bold">{props.fileName}</div>
        <div className="text-muted-foreground">{props.date}</div>
        <div className="text-muted-foreground">{props.time}</div>
        <Separator className="my-1" />
        <div
          className="text-xs/4 whitespace-pre overflow-hidden overflow-ellipsis"
          dangerouslySetInnerHTML={{ __html: colorizedText || "" }}
        />
      </div>
    </div>
  );
}
