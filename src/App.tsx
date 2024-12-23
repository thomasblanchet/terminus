import { HelperTabs } from "@/components/helper/tabs";
import { MainView } from "@/components/main/main-view";
import { AppSidebar } from "@/components/sidebar/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AppProvider } from "@/context-providers/app-context-provider";
import { ThemeProvider } from "@/context-providers/theme-context-provider";
import "./App.css";
import { TerminalManagerProvider } from "./context-providers/terminal-manager-context-provider";

function App() {
  return (
    <main>
      <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
        <AppProvider>
          <TerminalManagerProvider>
            <SidebarProvider>
              <AppSidebar />
              <SidebarInset className="overflow-y-scroll h-[calc(100vh-25px)]">
                <MainView />
              </SidebarInset>
              <HelperTabs />
            </SidebarProvider>
          </TerminalManagerProvider>
        </AppProvider>
      </ThemeProvider>
    </main>
  );
}

export default App;
