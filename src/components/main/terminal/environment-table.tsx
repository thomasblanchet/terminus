import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useTerminalManager } from "@/context-providers/terminal-manager-context-provider";
import {
  useApp,
  isTerminalView,
} from "@/context-providers/app-context-provider";
import { PenLine, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";

export type EnvironmentVariable = {
  name: string;
  value: string;
};

export function EnvironmentTable() {
  const { currentView } = useApp();
  const { terminalEnvironments } = useTerminalManager();
  const [environment, setEnvironment] = useState<EnvironmentVariable[]>([]);

  useEffect(() => {
    setEnvironment((prev) => {
      if (isTerminalView(currentView)) {
        const terminalId = currentView.terminalId;
        const newEnvironment = terminalEnvironments.get(terminalId) ?? [];
        if (newEnvironment !== prev) {
          return newEnvironment;
        }
      }
      return prev;
    });
  }, [terminalEnvironments, currentView]);

  return (
    <div className="border rounded-sm overflow-hidden h-full w-full">
      <Table className="max-h-full overflow-scroll text-xs w-full table-fixed">
        <TableHeader className="sticky top-0 bg-background border-none">
          <TableRow>
            <TableHead className="h-0 py-1 w-4/12">Name</TableHead>
            <TableHead className="h-0 py-1">Value</TableHead>
            <TableHead className="h-0 py-1 w-8"></TableHead>
            <TableHead className="h-0 py-1 w-8 pr-0.5 box-content"></TableHead>
          </TableRow>
          <TableRow className="border-none">
            <TableHead colSpan={4} className="h-[1px] bg-border p-0" />
          </TableRow>
        </TableHeader>
        <TableBody className="font-mono">
          {environment.map((variable) => (
            <TableRow key={variable.name} className="break-words">
              <TableCell className="py-1 font-medium">
                {variable.name}
              </TableCell>
              <TableCell className="py-1 text-muted-foreground">
                <span className="overflow-hidden">
                  {variable.value.replace(/:/g, ":\u200b")}
                </span>
              </TableCell>
              <TableCell className="py-0.5">
                <Button
                  size="sm"
                  variant="link"
                  className="text-border hover:text-muted-foreground text-xs w-8 h-5 p-0 transition"
                >
                  <PenLine />
                </Button>
              </TableCell>
              <TableCell className="py-0.5">
                <Button
                  size="sm"
                  variant="link"
                  className="text-border hover:text-muted-foreground text-xs w-8 h-5 px-1 py-0 transition"
                >
                  <Trash2 />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
