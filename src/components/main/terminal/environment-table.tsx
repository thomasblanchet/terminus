import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Trash2, PenLine } from "lucide-react";
import { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";

export type EnvironmentVariable = {
  name: string;
  value: string;
};

export function EnvironmentTable() {
  const [environment, setEnvironment] = useState<EnvironmentVariable[]>([]);

  useEffect(() => {
    const unlistenEnvironment = listen<EnvironmentVariable[]>(
      "terminal-environment-variables",
      (event) => {
        setEnvironment(event.payload);
      },
    );
    return () => {
      unlistenEnvironment.then();
    };
  }, [environment]);

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
