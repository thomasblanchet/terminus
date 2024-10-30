import { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { FilePreviewCard } from "@/components/main/file-preview-card";
import { LoaderCircle, Ban } from "lucide-react";

interface FilePreview {
  id: number;
  fileName: string;
  date: string;
  time: string;
  language: string;
  preview: string;
}

export function RecentFiles() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [recentFiles, setRecentFiles] = useState<FilePreview[]>([]);
  useEffect(() => {
    invoke<FilePreview[]>("get_recent_file_previews", {
      numFiles: 10,
    })
      .then((files) => {
        console.log(files);
        setRecentFiles(files);
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
          <div>Could not load recent files:</div>
          <div>{error}</div>
        </div>
      </div>
    );
  }
  if (recentFiles.length === 0) {
    return (
      <div className="flex-none overflow-hidden border rounded shadow-inner bg-primary-foreground">
        <div className="text-sm text-muted-foreground h-48 p-3 w-full text-center flex items-center justify-center">
          No recent files available
        </div>
      </div>
    );
  }
  return (
    <div className="flex-none overflow-hidden border rounded shadow-inner bg-primary-foreground">
      <div className="flex overflow-x-auto snap-x snap-mandatory">
        <div className="flex py-2 pr-2">
          {recentFiles.map((file) => (
            <FilePreviewCard
              id={file.id}
              fileName={file.fileName}
              date={file.date}
              time={file.time}
              language={file.language}
              preview={file.preview}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
