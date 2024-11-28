import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  isTerminalView,
  TerminalView,
  useApp,
} from "@/context-providers/app-context-provider";
import clsx from "clsx";
import { History, NotebookPen, Plus, TableProperties, X } from "lucide-react";

import { EnvironmentTable } from "@/components/main/terminal/environment-table";
import { AugmentedTerminal } from "./augmented-terminal";

export function TerminalPanel() {
  const { openTerminals, currentView } = useApp();

  return (
    <ResizablePanelGroup direction="vertical">
      <ResizablePanel className="p-3">
        {openTerminals.filter(isTerminalView).map((terminal: TerminalView) => (
          <div
            key={terminal.terminalId}
            className={clsx(
              "h-full",
              isTerminalView(currentView) &&
                terminal.terminalId == currentView.terminalId
                ? "block"
                : "hidden",
            )}
          >
            <AugmentedTerminal terminalId={terminal.terminalId} />
          </div>
        ))}
      </ResizablePanel>
      <ResizableHandle />
      <ResizablePanel defaultSize={30} className="bg-background z-50">
        <div className="flex flex-col h-full">
          <div className="flex flex-1 h-0">
            <Tabs
              defaultValue="environment"
              className="w-full p-2 flex flex-col"
            >
              <TabsList className="grid w-full grid-cols-3 flex-none">
                <TabsTrigger value="environment">
                  <TableProperties className="mr-2 h-4 w-4" />
                  Environment
                </TabsTrigger>
                <TabsTrigger value="history">
                  <History className="mr-2 h-4 w-4" />
                  History
                </TabsTrigger>
                <TabsTrigger value="notes">
                  <NotebookPen className="mr-2 h-4 w-4" />
                  Notes
                </TabsTrigger>
              </TabsList>
              <TabsContent
                value="environment"
                className="flex-1 overflow-hidden"
              >
                <div className="h-full max-h-full overflow-hidden">
                  <EnvironmentTable />
                </div>
              </TabsContent>
              <TabsContent value="history" className="h-full"></TabsContent>
              <TabsContent value="notes" className="h-full"></TabsContent>
            </Tabs>
          </div>
          <div className="bg-muted rounded-lg mx-2 mb-2 flex flex-none flex-row justify-between">
            <div className="flex gap-1 p-1 flex-wrap">
              <div className="text-sm rounded-md p-1 flex flex-row items-center space-x-1 shadow bg-background">
                <div className="h-4 w-4 bg-red-600 rounded-sm" />
                <div className="text-xs font-medium px-0.5">My Tag</div>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-4 w-4 p-0 text-muted-foreground"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <div className="text-sm rounded-md p-1 flex flex-row items-center space-x-1 shadow bg-background">
                <div className="h-4 w-4 bg-red-600 rounded-sm" />
                <div className="text-xs font-medium px-0.5">My Tag</div>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-4 w-4 p-0 text-muted-foreground"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <div className="text-sm rounded-md p-1 flex flex-row items-center space-x-1 shadow bg-background">
                <div className="h-4 w-4 bg-red-600 rounded-sm" />
                <div className="text-xs font-medium px-0.5">My Tag</div>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-4 w-4 p-0 text-muted-foreground"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="flex items-center p-1 hover:bg-slate-200 h-6"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Add Tag</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem>New Tag...</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <div className="flex items-center space-x-2 p-1 pr-2 whitespace-nowrap">
              <Label className="text-xs">Enable Smart Input</Label>
              <Switch className="dark:data-[state=unchecked]:bg-slate-700" />
            </div>
          </div>
        </div>
      </ResizablePanel>
    </ResizablePanelGroup>
  );
}
