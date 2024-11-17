import { Terminal } from "@xterm/xterm";
import { FitAddon } from "@xterm/addon-fit";
import { useEffect, useRef } from "react";
import { listen } from "@tauri-apps/api/event";
import { invoke } from "@tauri-apps/api/core";
import { useTheme } from "@/context-providers/theme-context-provider";

import { MultiLineInput } from "@/components/ui/multi-line-input";
import { TerminalIcon } from "lucide-react";

export function XTermComponent() {
  const { resolvedTheme } = useTheme();
  const terminalContainerRef = useRef<HTMLDivElement>(null!);
  const augmentedInputRef = useRef<HTMLDivElement>(null!);
  const terminalRef = useRef(new Terminal());
  const fitAddonRef = useRef(new FitAddon());
  const isSetupRef = useRef(false);

  function getLastNonBlankLinePosition() {
    const buffer = terminalRef.current.buffer.active;
    const offset = buffer.viewportY;
    const cursorY = buffer.cursorY;
    const totalRows = terminalRef.current.rows;
    for (let i = totalRows - 1; i >= cursorY; i--) {
      const line = buffer.getLine(offset + i);
      if (line && line.translateToString().trim() !== "") {
        return i + 1;
      }
    }
    return cursorY + 1;
  }

  if (!isSetupRef.current) {
    isSetupRef.current = true;

    terminalRef.current.loadAddon(fitAddonRef.current);

    // Listen for terminal output from the Rust backend
    listen("terminal-output", (event) => {
      const decoder = new TextDecoder();
      const u8arr = new Uint8Array(event.payload);
      console.log(decoder.decode(u8arr));
      terminalRef.current.write(u8arr);
    });

    // Start the shell
    invoke("listen_shell")
      .then(() => console.log("started shell"))
      .catch(console.error);

    // Send input to the backend when the user types
    terminalRef.current.onData((data) => {
      console.log("data");
      console.log(data);
      const encoder = new TextEncoder();
      const u8array = encoder.encode(data);
      invoke("write_to_shell", { input: u8array }).catch(console.error);
    });

    terminalRef.current.onRender((event) => {
      const lastLinePosition = getLastNonBlankLinePosition();
      const rowHeight = document.querySelector(
        ".xterm-rows > div:first-child",
      )!.clientHeight;
      const augmentedInputPosition = lastLinePosition * rowHeight;
      augmentedInputRef.current.style.top = `${12 + augmentedInputPosition}px`;
      console.log(lastLinePosition * rowHeight);
    });
  }

  useEffect(() => {
    terminalRef.current.open(terminalContainerRef.current);
    fitAddonRef.current.fit();

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

    terminalRef.current.options = {
      cursorBlink: true,
      fontFamily: "ui-monospace",
      fontSize: 13,
      theme: {
        ...terminalRef.current.options.theme,
        ...themeColors,
      },
    };

    const resizeObserver = new ResizeObserver(() => {
      fitAddonRef.current.fit();
    });
    resizeObserver.observe(terminalContainerRef.current);

    const onResizeDisposable = terminalRef.current.onResize((event) => {
      console.log(event);
      invoke("set_shell_size", {
        cols: event.cols,
        rows: event.rows,
      }).catch(console.error);
    });

    return () => {
      resizeObserver.disconnect();
      onResizeDisposable.dispose();
    };
  }, [resolvedTheme]);

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
