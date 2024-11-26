import { createContext, useContext, useRef, useState } from "react";
import { Terminal } from "@xterm/xterm";
import { FitAddon } from "@xterm/addon-fit";
import { UnlistenFn } from "@tauri-apps/api/event";

export type HomeView = {
  type: "home";
};

export type HistoryView = {
  type: "history";
};

export type SettingsView = {
  type: "settings";
};

export type TerminalView = {
  type: "terminal";
  terminalId: number;
  lastCommand: string | null;
};

export type LoadingTerminalView = {
  type: "loading-terminal";
  terminalId: number;
};

export type FileEditorView = {
  type: "file-editor";
  name: string;
  id: number;
};

export type TagView = {
  type: "tag";
  id: number;
  tag: string;
  color: string;
};

export type AppView =
  | HomeView
  | HistoryView
  | SettingsView
  | TerminalView
  | LoadingTerminalView
  | FileEditorView
  | TagView;

export function isHomeView(view: AppView): view is HomeView {
  return view.type === "home";
}

export function isHistoryView(view: AppView): view is HistoryView {
  return view.type === "history";
}

export function isSettingsView(view: AppView): view is SettingsView {
  return view.type === "settings";
}

export function isTerminalView(view: AppView): view is TerminalView {
  return view.type === "terminal";
}

export function isLoadingTerminalView(
  view: AppView,
): view is LoadingTerminalView {
  return view.type === "loading-terminal";
}

export function isFileEditorView(view: AppView): view is FileEditorView {
  return view.type === "file-editor";
}

export function isTagView(view: AppView): view is TagView {
  return view.type === "tag";
}

export type XTermObjects = {
  terminal: Terminal;
  fitAddon: FitAddon;
  unlistenOutput: Promise<UnlistenFn>;
  node: HTMLDivElement;
};

type AppProviderState = {
  currentView: AppView;
  setCurrentView: React.Dispatch<React.SetStateAction<AppView>>;

  openTerminals: (TerminalView | LoadingTerminalView)[];
  setOpenTerminals: React.Dispatch<
    React.SetStateAction<(TerminalView | LoadingTerminalView)[]>
  >;

  terminalsRef: React.MutableRefObject<Map<number, XTermObjects>>;

  openFileEditors: FileEditorView[];
  setOpenFileEditors: React.Dispatch<React.SetStateAction<FileEditorView[]>>;

  tags: TagView[];
  setTags: React.Dispatch<React.SetStateAction<TagView[]>>;
};

const AppContext = createContext<AppProviderState>({
  currentView: { type: "home" },
  setCurrentView: () => {},

  openTerminals: [],
  setOpenTerminals: () => {},

  terminalsRef: null!,

  openFileEditors: [],
  setOpenFileEditors: () => {},

  tags: [],
  setTags: () => {},
});

export function AppProvider({
  children,
  ...props
}: {
  children: React.ReactNode;
}) {
  const [currentView, setCurrentView] = useState<AppView>({ type: "home" });
  const [openTerminals, setOpenTerminals] = useState<
    (TerminalView | LoadingTerminalView)[]
  >([]);
  const terminalsRef = useRef(new Map<number, XTermObjects>());
  const [openFileEditors, setOpenFileEditors] = useState<FileEditorView[]>([
    {
      type: "file-editor",
      name: "index.js",
      id: 0,
    },
  ]);
  const [tags, setTags] = useState<TagView[]>([
    {
      type: "tag",
      id: 0,
      tag: "tag1",
      color: "red",
    },
    {
      type: "tag",
      id: 1,
      tag: "tag2",
      color: "blue",
    },
  ]);
  const value = {
    currentView,
    setCurrentView,
    openTerminals,
    setOpenTerminals,
    terminalsRef,
    openFileEditors,
    setOpenFileEditors,
    tags,
    setTags,
  };
  return (
    <AppContext.Provider {...props} value={value}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useApp must be used within a AppProvider");
  }
  return context;
}
