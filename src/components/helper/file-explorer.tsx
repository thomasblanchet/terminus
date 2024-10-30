import { useState } from "react";
import { Card } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  ChevronRight,
  ChevronDown,
  Folder,
  FileText,
  MoreHorizontal,
  Trash2,
  FolderInput,
  RefreshCcw,
  TerminalSquare,
} from "lucide-react";
import { clsx } from "clsx";
import { PathDisplay } from "../path-display";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";

export function FileExplorer() {
  const [currentPath, setCurrentPath] = useState("/Users/example/Documents");
  const [expandedFolders, setExpandedFolders] = useState(
    new Set(["Documents"]),
  );
  const [selectedItem, setSelectedItem] = useState(null);
  const [draggingItem, setDraggingItem] = useState(null);
  const [dragOverItem, setDragOverItem] = useState(null);

  // Mock data structure - in real app, this would come from Tauri
  const fileTree = {
    name: "Documents",
    type: "directory",
    children: [
      {
        name: "Projects",
        type: "directory",
        children: [
          { name: "README.md", type: "file" },
          { name: "config.json", type: "file" },
        ],
      },
      {
        name: "Images",
        type: "directory",
        children: [
          { name: "photo.jpg", type: "file" },
          { name: "screenshot.png", type: "file" },
        ],
      },
    ],
  };

  const handleItemClick = (item, path) => {
    setSelectedItem(path);
    if (item.type === "directory") {
      setExpandedFolders((prev) => {
        const next = new Set(prev);
        if (next.has(path)) {
          next.delete(path);
        } else {
          next.add(path);
        }
        return next;
      });
    }
  };

  interface FileTreeItemProps {
    item: any;
    path?: string;
    depth?: number;
  }

  function FileTreeItem({ item, path = "", depth = 0 }: FileTreeItemProps) {
    const fullPath = `${path}/${item.name}`;
    const isExpanded = expandedFolders.has(fullPath);
    const isSelected = selectedItem === fullPath;
    const isDraggedOver = dragOverItem === fullPath;
    const isDragged = draggingItem === fullPath;

    return (
      <div>
        <div
          className={clsx(
            "flex items-center justify-between mt-1 p-[6px] cursor-pointer select-none",
            "rounded-sm hover:bg-secondary transition",
            isSelected && "bg-secondary",
            isDraggedOver &&
              item.type === "directory" &&
              "bg-slate-200 dark:bg-slate-700",
            isDragged && "transition-none",
          )}
          style={{ paddingLeft: `${4 + depth * 14}px` }}
          onClick={() => handleItemClick(item, fullPath)}
          draggable
          onDrop={(e) => {
            e.preventDefault();
            setDragOverItem(null);
            if (draggingItem && item.type === "directory") {
              console.log(`Move ${draggingItem} to ${fullPath}`);
              // In real app: Implement Tauri file system move operation here
            }
          }}
          onDragStart={(e) => {
            setDraggingItem(fullPath);
            e.dataTransfer.setData("text/plain", fullPath);
          }}
          onDragEnd={(e) => {
            e.preventDefault();
            console.log("Drag end", fullPath);
            setDraggingItem(null);
            setDragOverItem(null);
          }}
          onDragOver={(e) => {
            e.preventDefault();
            if (item.type === "directory" && draggingItem !== fullPath) {
              setDragOverItem(fullPath);
            }
          }}
          onDragLeave={(e) => {
            if (!e.currentTarget.contains(e.relatedTarget)) {
              setDragOverItem(null);
            }
          }}
        >
          <div className="flex items-center">
            <span className="w-4 h-4 mr-1">
              {item.type === "directory" &&
                (isExpanded ? (
                  <ChevronDown size={16} />
                ) : (
                  <ChevronRight size={16} />
                ))}
            </span>
            <span className="w-4 h-4 mr-2">
              {item.type === "directory" ? (
                <Folder size={16} />
              ) : (
                <FileText size={16} />
              )}
            </span>
            <span className="text-sm">{item.name}</span>
          </div>
          <div className="flex items-center">
            <DropdownMenu>
              <DropdownMenuTrigger className="h-5 w-5 text-center hover:bg-slate-200 dark:hover:bg-slate-700">
                <MoreHorizontal className="h-4 w-4 mx-auto" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>
                  <TerminalSquare />
                  Open Terminal Here
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <FolderInput />
                  Move File Explorer Here
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Trash2 /> Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {item.type === "directory" && isExpanded && item.children && (
          <div>
            {item.children.map((child) => (
              <FileTreeItem
                key={child.name}
                item={child}
                path={fullPath}
                depth={depth + 1}
              />
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <Card className="border-none h-full p-4 flex flex-col space-y-2">
      <div className="border shadow-sm rounded-sm">
        <PathDisplay pathComponents={["Users", "thomasblanchet"]} />
      </div>
      <div className="border shadow-sm rounded-sm flex-grow px-1">
        <FileTreeItem item={fileTree} />
      </div>
      <div className="flex flex-row justify-between items-center">
        <Button variant="outline" size="sm">
          <RefreshCcw />
          Refresh
        </Button>
        <div className="flex flex-row space-x-2 items-center">
          <span className="text-xs">Show Hidden Files</span>
          <Switch />
        </div>
      </div>
    </Card>
  );
}
