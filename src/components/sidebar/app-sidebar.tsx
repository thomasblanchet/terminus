import {
  BookOpen,
  Bot,
  Command,
  Frame,
  LifeBuoy,
  Map,
  PieChart,
  Send,
  Settings2,
  SquareTerminal,
} from "lucide-react";

import { NavMain } from "@/components/sidebar/nav-main";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarSeparator,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { ComponentProps } from "react";
import { SystemUsage } from "@/components/sidebar/system-usage";
import { ThemeToggle } from "@/components/sidebar/theme-toggle";
import { NavTags } from "@/components/sidebar/nav-tags";
import { NavTerminals } from "@/components/sidebar/nav-terminals";
import { NavTextFiles } from "@/components/sidebar/nav-text-files";

export function AppSidebar({ ...props }: ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar variant="inset" {...props}>
      <SidebarContent>
        <NavMain />
        <NavTerminals />
        <NavTextFiles />
        <NavTags />
      </SidebarContent>
      <SidebarFooter>
        <ThemeToggle />
        <SidebarSeparator />
        <SystemUsage />
      </SidebarFooter>
    </Sidebar>
  );
}
