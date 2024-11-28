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
import { useTerminalManager } from "@/context-providers/terminal-manager-context-provider";

interface TerminalSession {
  terminalId: number;
  workingDirectory: string;
}

export function NavTerminals() {
  const { openTerminals, setOpenTerminals, currentView, setCurrentView } =
    useApp();
  const { createTerminalInstance } = useTerminalManager();

  function handleNewTerminal() {
    invoke<TerminalSession>("create_new_terminal").then((session) => {
      const loadingTerminal: LoadingTerminalView = {
        type: "loading-terminal",
        terminalId: session.terminalId,
      };
      setCurrentView(loadingTerminal);
      setOpenTerminals((prev) => [...prev, loadingTerminal]);
      createTerminalInstance(session.terminalId);
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

  function renderTerminalMenuItem(
    terminal: LoadingTerminalView | TerminalView,
  ) {
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
                  {renderTerminalMenuItem(terminal)}
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
