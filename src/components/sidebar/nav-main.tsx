import {
  ChevronRight,
  House,
  History,
  SquarePlus,
  FilePlus,
  FolderOpen,
  type LucideIcon,
  Settings2,
} from "lucide-react";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarSeparator,
} from "@/components/ui/sidebar";
import {
  useApp,
  isHomeView,
  isHistoryView,
  isSettingsView,
} from "@/context-providers/app-context-provider";

export function NavMain() {
  const { currentView, setCurrentView } = useApp();
  return (
    <SidebarGroup>
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton
            isActive={isHomeView(currentView)}
            onClick={() => {
              setCurrentView({ type: "home" });
            }}
          >
            <House />
            <span>Home</span>
          </SidebarMenuButton>
        </SidebarMenuItem>
        <SidebarMenuItem>
          <SidebarMenuButton
            isActive={isHistoryView(currentView)}
            onClick={() => setCurrentView({ type: "history" })}
          >
            <History />
            <span>History</span>
          </SidebarMenuButton>
        </SidebarMenuItem>
        <SidebarMenuItem>
          <SidebarMenuButton
            isActive={isSettingsView(currentView)}
            onClick={() => setCurrentView({ type: "settings" })}
          >
            <Settings2 />
            <span>Settings</span>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarGroup>
  );
}
