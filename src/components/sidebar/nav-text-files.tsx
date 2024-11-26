import { ChevronDown, FileCode2, Plus, X } from "lucide-react";

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
  isFileEditorView,
  useApp,
} from "@/context-providers/app-context-provider";

export function NavTextFiles() {
  const { currentView, setCurrentView, openFileEditors } = useApp();
  return (
    <Collapsible defaultOpen className="group/collapsible">
      <SidebarGroup className="group-data-[collapsible=icon]:hidden">
        <SidebarGroupLabel asChild>
          <div>
            <CollapsibleTrigger className="flex items-center">
              <FileCode2 className="h-4 w-4 mr-2" />
              <span>Current Files</span>
              <ChevronDown className="ml-2 h-4 w-4 transition-transform group-data-[state=open]/collapsible:rotate-180" />
            </CollapsibleTrigger>
            <SidebarGroupAction title="Add Group">
              <Plus /> <span className="sr-only">New Terminal</span>
            </SidebarGroupAction>
          </div>
        </SidebarGroupLabel>
        <CollapsibleContent>
          <SidebarMenu>
            {openFileEditors.map((fileEditor) => (
              <SidebarMenuItem key={fileEditor.id}>
                <SidebarMenuButton
                  className="font-mono text-xs"
                  onClick={() => {
                    setCurrentView(fileEditor);
                  }}
                  isActive={
                    isFileEditorView(currentView) &&
                    currentView.id === fileEditor.id
                  }
                >
                  {fileEditor.name}
                </SidebarMenuButton>
                <SidebarMenuAction>
                  <X className="h-4 w-4" />
                </SidebarMenuAction>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </CollapsibleContent>
      </SidebarGroup>
    </Collapsible>
  );
}
