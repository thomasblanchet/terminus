import { MultiLineInput } from "@/components/ui/multi-line-input";
import { useTerminalManager } from "@/context-providers/terminal-manager-context-provider";
import { useTheme } from "@/context-providers/theme-context-provider";
import { invoke } from "@tauri-apps/api/core";
import { Terminal } from "@xterm/xterm";
import { TerminalIcon } from "lucide-react";
import { useEffect, useRef } from "react";

interface AugmentedTerminalProps {
  terminalId: number;
}

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

function handleInput(terminalId: number, data: string) {
  const encoder = new TextEncoder();
  const u8array = encoder.encode(data);
  console.log(u8array);
  invoke("send_input_to_terminal", {
    terminalId: terminalId,
    input: u8array,
  }).then();
}

function handleResize(terminalId: number, cols: number, rows: number) {
  invoke("resize_terminal", {
    terminalId: terminalId,
    columns: cols,
    rows: rows,
  }).then();
}

function handleAdjustAugmentedInputPosition(
  terminal: Terminal,
  augmentedInput: HTMLDivElement,
) {
  const lastLinePosition = getLastNonBlankLinePosition(terminal);
  // @ts-ignore
  const rowHeight = terminal._core._renderService.dimensions.css.cell.height;
  const augmentedInputPosition = lastLinePosition * rowHeight;
  augmentedInput.style.top = `${12 + augmentedInputPosition}px`;
}

function handleChangeTheme(terminal: Terminal, theme: "dark" | "light") {
  const themeColors =
    theme === "dark"
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
  terminal.options = {
    cursorBlink: true,
    fontFamily: "ui-monospace",
    fontSize: 13,
    theme: {
      ...terminal.options.theme,
      ...themeColors,
    },
  };
}

export function AugmentedTerminal({ terminalId }: AugmentedTerminalProps) {
  const { resolvedTheme } = useTheme();
  const { getTerminalInstance } = useTerminalManager();

  const terminalContainerRef = useRef<HTMLDivElement>(null!);
  const augmentedInputRef = useRef<HTMLDivElement>(null!);

  useEffect(() => {
    const { terminal, fitAddon } = getTerminalInstance(terminalId);
    const onDataDisposable = terminal.onData((data) =>
      handleInput(terminalId, data),
    );
    const onRenderDisposable = terminal.onRender(() => {
      handleAdjustAugmentedInputPosition(terminal, augmentedInputRef.current);
    });
    const onResizeDisposable = terminal.onResize((event) =>
      handleResize(terminalId, event.cols, event.rows),
    );
    const resizeObserver = new ResizeObserver(() => fitAddon.fit());
    resizeObserver.observe(terminalContainerRef.current);
    handleChangeTheme(terminal, resolvedTheme);
    terminal.open(terminalContainerRef.current);
    fitAddon.fit();
    return () => {
      console.log("unmount");
      onDataDisposable.dispose();
      onRenderDisposable.dispose();
      onResizeDisposable.dispose();
      resizeObserver.disconnect();
    };
  }, [resolvedTheme]);

  return (
    <div>
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
    </div>
  );
}
