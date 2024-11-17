import { useState, useRef, useCallback, useEffect } from "react";
import {
  useDrag,
  useDrop,
  DndProvider,
  useDragLayer,
  DragPreviewImage,
} from "react-dnd";
import { HTML5Backend, getEmptyImage } from "react-dnd-html5-backend";
import { Card } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
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
import { Label } from "../ui/label";

const ItemTypes = {
  FILE: "file",
};

export function FileExplorer() {
  const [currentPath, setCurrentPath] = useState("/Users/example/Documents");
  const [expandedFolders, setExpandedFolders] = useState(
    new Set(["/Users/example/Documents/Documents"]),
  );
  const [selectedItems, setSelectedItems] = useState(new Set());

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

  const handleItemClick = useCallback((item, path, event) => {
    setSelectedItems((prev) => {
      const next = new Set(prev);
      if (event.metaKey || event.ctrlKey) {
        if (next.has(path)) {
          next.delete(path);
        } else {
          next.add(path);
        }
      } else {
        next.clear();
        next.add(path);
      }
      return next;
    });
  }, []);

  interface FileTreeItemProps {
    item: any;
    path?: string;
    depth?: number;
  }

  function FileTreeItem({ item, path = "", depth = 0 }: FileTreeItemProps) {
    const fullPath = `${path}/${item.name}`;
    const isExpanded = expandedFolders.has(fullPath);
    const isSelected = selectedItems.has(fullPath);

    const ref = useRef(null);

    const [{ isDragging }, drag, preview] = useDrag({
      type: ItemTypes.FILE,
      item: { id: Array.from(selectedItems), type: item.type },
      collect: (monitor) => ({
        isDragging: monitor.isDragging(),
      }),
    });

    const [{ isOver, canDrop }, drop] = useDrop({
      accept: ItemTypes.FILE,
      canDrop: (draggedItem) => {
        for (const id of draggedItem.id) {
          if (fullPath.startsWith(id) || item.type !== "directory") {
            return false;
          }
        }
        return true;
      },
      drop: (draggedItem) => {
        console.log(`Move ${draggedItem.id} to ${fullPath}`);
      },
      collect: (monitor) => ({
        isOver: monitor.isOver(),
        canDrop: monitor.canDrop(),
      }),
    });

    drag(drop(ref));

    useEffect(() => {
      // This gets called after every render, by default
      // (the first one, and every one after that)

      // Use empty image as a drag preview so browsers don't draw it
      // and we can draw whatever we want on the custom drag layer instead.
      preview(getEmptyImage(), {
        // IE fallback: specify that we'd rather screenshot the node
        // when it already knows it's being dragged so we can hide it with CSS.
        captureDraggingState: true,
      });
      // If you want to implement componentWillUnmount,
      // return a function from here, and React will call
      // it prior to unmounting.
      // return () => console.log('unmounting...');
    }, []);

    const handleMouseDown = (item, path, event) => {
      if (event.metaKey || event.ctrlKey || isSelected) {
        return;
      }
      setSelectedItems((prev) => {
        const next = new Set(prev);
        // Clear selection if the item isn't already selected
        if (!next.has(fullPath)) {
          next.clear();
          next.add(fullPath);
        }
        return next;
      });
    };

    const handleChevronClick = (event) => {
      event.stopPropagation();
      setExpandedFolders((prev) => {
        const next = new Set(prev);
        if (next.has(fullPath)) {
          next.delete(fullPath);
        } else {
          next.add(fullPath);
        }
        return next;
      });
    };

    return (
      <div>
        <div
          ref={ref}
          className={clsx(
            "flex items-center justify-between my-1 p-[6px] cursor-pointer select-none",
            "rounded-sm hover:bg-secondary transition",
            isSelected && "bg-secondary",
            isOver && canDrop && "bg-slate-200 dark:bg-slate-700",
            //isDragging && "transition-none",
          )}
          style={{ paddingLeft: `${4 + depth * 14}px` }}
          onMouseDown={(e) => handleMouseDown(item, fullPath, e)}
          onClick={(e) => handleItemClick(item, fullPath, e)}
        >
          <div className="flex items-center">
            {item.type === "directory" ? (
              <div
                onMouseDown={handleChevronClick}
                className="h-5 w-5 mx-1 flex items-center justify-center text-center rounded-sm hover:bg-slate-200 dark:hover:bg-slate-700"
              >
                {item.type === "directory" &&
                  (isExpanded ? (
                    <ChevronDown size={16} />
                  ) : (
                    <ChevronRight size={16} />
                  ))}
              </div>
            ) : (
              <div className="h-5 w-5 mr-1"></div>
            )}
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
              <DropdownMenuTrigger className="h-5 w-5 text-center rounded-sm hover:bg-slate-200 dark:hover:bg-slate-700">
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

  function CustomDragLayer() {
    const { isDragging, currentOffset, selectedItems } = useDragLayer(
      (monitor) => ({
        isDragging: monitor.isDragging(),
        currentOffset: monitor.getSourceClientOffset(),
        selectedItems: monitor.getItem()?.id || [],
      }),
    );

    if (!isDragging || !currentOffset) return null;

    return (
      <div
        style={{
          position: "fixed",
          pointerEvents: "none",
          left: currentOffset.x + 50,
          top: currentOffset.y,
          zIndex: 1000,
        }}
      >
        <div className="flex flex-col space-y-1 opacity-75">
          {selectedItems.map((path, index) => (
            <div
              key={index}
              className="flex items-center bg-secondary rounded-sm py-[6px] px-4 shadow-xl border"
            >
              <FileText size={16} className="mr-2" />
              <span className="text-sm">{path.split("/").pop()}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <Card className="border-none h-full p-4 flex flex-col space-y-2">
      <div className="border shadow-sm rounded-sm">
        <PathDisplay pathComponents={["Users", "example"]} />
      </div>
      <DndProvider backend={HTML5Backend}>
        <CustomDragLayer />
        <div className="border shadow-sm rounded-sm flex-grow px-1 overflow-y-scroll">
          <FileTreeItem item={fileTree} path="/Users/example" />
        </div>
      </DndProvider>
      <div className="flex flex-row justify-between items-center">
        <Button variant="outline" size="sm">
          <RefreshCcw />
          Refresh
        </Button>
        <div className="flex flex-row space-x-2 items-center">
          <Label className="text-xs">Show Hidden Files</Label>
          <Switch />
        </div>
      </div>
    </Card>
  );
}
