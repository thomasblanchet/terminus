import {
  SquareTerminal,
  MoreHorizontal,
  PenLine,
  X,
  Plus,
  Boxes,
  ChevronDown,
} from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarGroupAction,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from "@/components/ui/collapsible";

export function NavTerminals() {
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
            <SidebarGroupAction title="Add Group">
              <Plus /> <span className="sr-only">New Terminal</span>
            </SidebarGroupAction>
          </div>
        </SidebarGroupLabel>
        <CollapsibleContent>
          <SidebarMenu>
            <SidebarMenuItem key="project-1">
              <SidebarMenuButton>
                <span className="font-mono font-xs rounded-sm px-1 bg-slate-200 dark:bg-slate-700">
                  pip -m venv env
                </span>
              </SidebarMenuButton>
              <SidebarMenuAction>
                <X className="h-4 w-4" />
              </SidebarMenuAction>
            </SidebarMenuItem>
          </SidebarMenu>
        </CollapsibleContent>
      </SidebarGroup>
    </Collapsible>
  );
}
