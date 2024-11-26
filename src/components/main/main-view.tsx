import { Home } from "@/components/main/home/home";
import { TerminalPanel } from "@/components/main/terminal/terminal-panel";
import {
  isFileEditorView,
  isHistoryView,
  isHomeView,
  isSettingsView,
  isTagView,
  isTerminalView,
  isLoadingTerminalView,
  useApp,
} from "@/context-providers/app-context-provider";
import { TerminalLoadingScreen } from "@/components/main/terminal/loading-screen";

export function MainView() {
  const { currentView } = useApp();

  console.log(currentView);

  if (isHomeView(currentView)) {
    return <Home />;
  } else if (isHistoryView(currentView)) {
    return <div>History</div>;
  } else if (isSettingsView(currentView)) {
    return <div>Settings</div>;
  } else if (isTerminalView(currentView)) {
    return <TerminalPanel />;
  } else if (isLoadingTerminalView(currentView)) {
    return <TerminalLoadingScreen />;
  } else if (isFileEditorView(currentView)) {
    return <div>File Editor</div>;
  } else if (isTagView(currentView)) {
    return <div>Tag</div>;
  }
}
