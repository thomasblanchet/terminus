import { Terminal } from "@xterm/xterm";
import { useEffect, useRef } from "react";
import { invoke } from "@tauri-apps/api/core";
import { useTheme } from "@/context-providers/theme-context-provider";
import {
  isTerminalView,
  useApp,
} from "@/context-providers/app-context-provider";

import { MultiLineInput } from "@/components/ui/multi-line-input";
import { TerminalIcon } from "lucide-react";

export function XTermComponent() {
  const { resolvedTheme } = useTheme();
  const { terminalsRef, currentView } = useApp();
  const terminalContainerRef = useRef<HTMLDivElement>(null!);
  const augmentedInputRef = useRef<HTMLDivElement>(null!);

  function getLastNonBlankLinePosition(terminal: Terminal) {
    const buffer = terminal.buffer.active;
    const offset = buffer.viewportY;
    const cursorY = buffer.cursorY;
    const totalRows = terminal.rows;
    for (let i = totalRows - 1; i >= cursorY; i--) {
      const line = buffer.getLine(offset + i);
      if (line && line.translateToString().trim() !== "") {
        return i + 1;
      }
    }
    return cursorY + 1;
  }

  useEffect(() => {
    console.log(terminalContainerRef.current);
    if (isTerminalView(currentView)) {
      const xtermObjects = terminalsRef.current.get(currentView.terminalId);
      console.log(currentView.terminalId);
      console.log(xtermObjects);
      console.log(xtermObjects?.terminal.buffer);
      if (xtermObjects) {
        const onResizeDisposable = xtermObjects.terminal.onResize((event) => {
          invoke("resize_terminal", {
            terminalId: currentView.terminalId,
            columns: event.cols,
            rows: event.rows,
          }).catch(console.error);
        });
        xtermObjects.terminal.onRender(() => {
          const lastLinePosition = getLastNonBlankLinePosition(
            xtermObjects.terminal,
          );
          const rowHeight = document.querySelector(
            ".xterm-rows > div:first-child",
          )!.clientHeight;
          const augmentedInputPosition = lastLinePosition * rowHeight;
          augmentedInputRef.current.style.top = `${12 + augmentedInputPosition}px`;
          console.log(lastLinePosition * rowHeight);
        });
        terminalContainerRef.current.appendChild(xtermObjects.node);
        xtermObjects.terminal.open(xtermObjects.node);
        xtermObjects.fitAddon.fit();
        const themeColors =
          resolvedTheme === "dark"
            ? {
                background: "#020817",
                foreground: "#ffffff",
                cursor: "#ffffff",
                cursorAccent: "#ffffff",
                selection: "#ffffff",
              }
            : {
                background: "#ffffff",
                foreground: "#000000",
                cursor: "#000000",
                cursorAccent: "#000000",
                selection: "#000000",
              };

        xtermObjects.terminal.options = {
          cursorBlink: true,
          fontFamily: "ui-monospace",
          fontSize: 13,
          theme: {
            ...xtermObjects.terminal.options.theme,
            ...themeColors,
          },
        };

        const resizeObserver = new ResizeObserver(() => {
          xtermObjects.fitAddon.fit();
        });
        resizeObserver.observe(terminalContainerRef.current);

        return () => {
          console.log(terminalContainerRef.current);
          xtermObjects.node.remove();
          resizeObserver.disconnect();
          onResizeDisposable.dispose();
        };
      }
    }
  }, [resolvedTheme, currentView]);

  return (
    <>
      <div className="flex flex-col h-full space-y-0">
        <div
          ref={terminalContainerRef}
          className="flex-grow overflow-y-hidden min-h-[15px]"
        ></div>
        <div className="flex-none h-64" />
      </div>
      <div
        ref={augmentedInputRef}
        className="absolute left-0 w-full h-64 px-3 py-1"
      >
        <div className="border rounded-sm shadow-sm h-full text-sm mt-1">
          <div className="flex flex-row items-center border-b">
            <TerminalIcon className="w-4 h-4 ml-3" />
            <MultiLineInput
              placeholder="Type your command here..."
              className="font-mono text-[13px]"
              noBorder
            />
          </div>
        </div>
      </div>
    </>
  );
}
