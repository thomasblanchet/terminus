import { Home } from "@/components/main/home/home";
import { TerminalLoadingScreen } from "@/components/main/terminal/loading-screen";
import { TerminalPanel } from "@/components/main/terminal/terminal-panel";
import {
  isFileEditorView,
  isHistoryView,
  isHomeView,
  isLoadingTerminalView,
  isSettingsView,
  isTagView,
  isTerminalView,
  useApp,
} from "@/context-providers/app-context-provider";
import clsx from "clsx";

export function MainView() {
  const { currentView } = useApp();

  return (
    <>
      <div
        className={clsx("h-full", isHomeView(currentView) ? "block" : "hidden")}
      >
        <Home />
      </div>
      <div
        className={clsx(
          "h-full",
          isHistoryView(currentView) ? "block" : "hidden",
        )}
      >
        History
      </div>
      <div
        className={clsx(
          "h-full",
          isSettingsView(currentView) ? "block" : "hidden",
        )}
      >
        Settings
      </div>
      <div
        className={clsx(
          "h-full",
          isTerminalView(currentView) ? "block" : "hidden",
        )}
      >
        <TerminalPanel />
      </div>
      <div
        className={clsx(
          "h-full",
          isLoadingTerminalView(currentView) ? "block" : "hidden",
        )}
      >
        <TerminalLoadingScreen />
      </div>
      <div
        className={clsx(
          "h-full",
          isFileEditorView(currentView) ? "block" : "hidden",
        )}
      >
        File Editor
      </div>
      <div
        className={clsx("h-full", isTagView(currentView) ? "block" : "hidden")}
      >
        Tag
      </div>
    </>
  );
}
