import { AppSidebar } from "@/components/sidebar/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { HelperTabs } from "@/components/helper/tabs";
import { ThemeProvider } from "@/context-providers/theme-context-provider";
import { Home } from "@/components/main/home/home";
import "./App.css";

function App() {
  return (
    <main>
      <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
        <SidebarProvider>
          <AppSidebar />
          <SidebarInset className="overflow-y-scroll h-[calc(100vh-25px)]">
            <Home />
          </SidebarInset>
          <HelperTabs />
        </SidebarProvider>
      </ThemeProvider>
    </main>
  );
}

export default App;
