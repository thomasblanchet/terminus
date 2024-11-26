import { invoke } from "@tauri-apps/api/core";
import {
  ChevronDown,
  Plus,
  SquareTerminal,
  X,
  LoaderCircle,
} from "lucide-react";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  SidebarGroup,
  SidebarGroupAction,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import {
  LoadingTerminalView,
  TerminalView,
  isLoadingTerminalView,
  isTerminalView,
  useApp,
} from "@/context-providers/app-context-provider";

import { Terminal } from "@xterm/xterm";
import { FitAddon } from "@xterm/addon-fit";
import { listen } from "@tauri-apps/api/event";

interface TerminalSession {
  terminalId: number;
  workingDirectory: string;
}

interface TerminalRawData {
  terminalId: number;
  data: Uint8Array;
}

export function NavTerminals() {
  const {
    openTerminals,
    setOpenTerminals,
    currentView,
    setCurrentView,
    terminalsRef,
  } = useApp();

  function handleNewTerminal() {
    invoke<TerminalSession>("create_new_terminal").then((session) => {
      const loadingTerminal: LoadingTerminalView = {
        type: "loading-terminal",
        terminalId: session.terminalId,
      };
      setCurrentView(loadingTerminal);
      setOpenTerminals((prev) => [...prev, loadingTerminal]);

      const terminal = new Terminal();
      const fitAddon = new FitAddon();
      terminal.loadAddon(fitAddon);
      const node = document.createElement("div");
      node.className = "h-full w-full";
      const unlistenOutput = listen<TerminalRawData>(
        `terminal-output-${session.terminalId}`,
        (event) => {
          const u8arr = new Uint8Array(event.payload.data);
          terminal.write(u8arr);
        },
      );
      terminal.onData((data: string) => {
        const encoder = new TextEncoder();
        const u8array = encoder.encode(data);
        invoke("send_input_to_terminal", {
          terminalId: session.terminalId,
          input: u8array,
        }).catch(console.error);
      });
      terminalsRef.current.set(session.terminalId, {
        terminal: terminal,
        fitAddon: fitAddon,
        unlistenOutput: unlistenOutput,
        node: node,
      });

      invoke<TerminalSession>("open_terminal", {
        terminalId: session.terminalId,
      }).then((session) => {
        const newTerminalView: TerminalView = {
          type: "terminal",
          terminalId: session.terminalId,
          lastCommand: null,
        };
        setCurrentView((prev) => {
          if (
            isLoadingTerminalView(prev) &&
            prev.terminalId === session.terminalId
          ) {
            return newTerminalView;
          }
          return prev;
        });
        setOpenTerminals((prev) => {
          const idx = prev.findIndex(
            (e) => e.terminalId === session.terminalId,
          );
          if (idx === -1) {
            return prev;
          }
          return [
            ...prev.slice(0, idx),
            newTerminalView,
            ...prev.slice(idx + 1),
          ];
        });
      });
    });
  }

  function renderTerminal(terminal: LoadingTerminalView | TerminalView) {
    if (isLoadingTerminalView(terminal)) {
      return (
        <div className="flex items-center space-x-2 text-muted-foreground text-xs">
          <LoaderCircle className="h-4 w-4 animate-spin" />
          <span className="font-mono font-xs italic">Starting terminal...</span>
        </div>
      );
    }
    if (isTerminalView(terminal) && terminal.lastCommand !== null) {
      return (
        <div className="flex items-center space-x-2 text-xs">
          <span className="font-mono font-xs rounded-sm px-1 bg-slate-200 dark:bg-slate-700">
            {terminal.lastCommand}
          </span>
        </div>
      );
    }
    return (
      <div className="flex items-center space-x-2 text-xs">
        <span className="font-mono font-xs italic text-muted-foreground">
          new terminal
        </span>
      </div>
    );
  }

  return (
    <Collapsible defaultOpen className="group/collapsible">
      <SidebarGroup className="group-data-[collapsible=icon]:hidden">
        <SidebarGroupLabel asChild>
          <div>
            <CollapsibleTrigger className="flex items-center">
              <SquareTerminal className="h-4 w-4 mr-2" />
              <span>Current Terminals</span>
              <ChevronDown className="ml-2 h-4 w-4 transition-transform group-data-[state=open]/collapsible:rotate-180" />
            </CollapsibleTrigger>
            <SidebarGroupAction onClick={handleNewTerminal}>
              <Plus /> <span className="sr-only">New Terminal</span>
            </SidebarGroupAction>
          </div>
        </SidebarGroupLabel>
        <CollapsibleContent className="space-y-1">
          {openTerminals.map((terminal) => (
            <SidebarMenu key={terminal.terminalId}>
              <SidebarMenuItem>
                <SidebarMenuButton
                  isActive={
                    isTerminalView(currentView) &&
                    currentView.terminalId === terminal.terminalId
                  }
                  onClick={() => {
                    setCurrentView(terminal);
                  }}
                >
                  {renderTerminal(terminal)}
                </SidebarMenuButton>
                <SidebarMenuAction>
                  <X className="h-4 w-4" />
                </SidebarMenuAction>
              </SidebarMenuItem>
            </SidebarMenu>
          ))}
        </CollapsibleContent>
      </SidebarGroup>
    </Collapsible>
  );
}
