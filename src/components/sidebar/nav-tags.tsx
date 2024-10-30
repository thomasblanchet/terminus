import {
  Folder,
  MoreHorizontal,
  PenLine,
  Trash2,
  Plus,
  Palette,
  Tag,
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

export function NavTags() {
  return (
    <Collapsible defaultOpen className="group/collapsible">
      <SidebarGroup className="group-data-[collapsible=icon]:hidden">
        <SidebarGroupLabel asChild>
          <div>
            <CollapsibleTrigger className="flex items-center">
              <Tag className="h-4 w-4 mr-2" />
              <span>Tags</span>
              <ChevronDown className="ml-2 h-4 w-4 transition-transform group-data-[state=open]/collapsible:rotate-180" />
            </CollapsibleTrigger>
            <SidebarGroupAction title="Add Tag">
              <Plus /> <span className="sr-only">Add Tag</span>
            </SidebarGroupAction>
          </div>
        </SidebarGroupLabel>
        <CollapsibleContent>
          <SidebarMenu>
            <SidebarMenuItem key="tag-1">
              <SidebarMenuButton>
                <span className="rounded-full px-1 bg-red-600 h-3 w-3"></span>
                My Tag
              </SidebarMenuButton>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <SidebarMenuAction>
                    <MoreHorizontal />
                    <span className="sr-only">More</span>
                  </SidebarMenuAction>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  className="w-48"
                  side="right"
                  align="start"
                >
                  <DropdownMenuItem>
                    <PenLine className="text-muted-foreground" />
                    <span>Rename Tag</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Palette className="text-muted-foreground" />
                    <span>Change Color</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Trash2 className="text-muted-foreground" />
                    <span>Delete Tag</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </SidebarMenuItem>
          </SidebarMenu>
        </CollapsibleContent>
      </SidebarGroup>
    </Collapsible>
  );
}
