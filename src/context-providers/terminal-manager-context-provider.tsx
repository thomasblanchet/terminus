import { listen, UnlistenFn } from "@tauri-apps/api/event";
import { FitAddon } from "@xterm/addon-fit";
import { Terminal } from "@xterm/xterm";
import { createContext, useContext, useRef, useState } from "react";

export type TerminalRawData = {
  terminalId: number;
  data: Uint8Array;
};

export type EnvironmentVariable = {
  name: string;
  value: string;
};

type TerminalEnvironment = {
  terminalId: number;
  environment: EnvironmentVariable[];
};

export type XTermObjects = {
  terminal: Terminal;
  fitAddon: FitAddon;
  unlistenOutput: Promise<UnlistenFn>;
  unlistenEnvironment: Promise<UnlistenFn>;
};

type TerminalManagerProviderState = {
  terminalEnvironments: Map<number, EnvironmentVariable[]>;
  setTerminalEnvironments: React.Dispatch<
    React.SetStateAction<Map<number, EnvironmentVariable[]>>
  >;
  createTerminalInstance: (terminalId: number) => void;
  getTerminalInstance: (terminalId: number) => XTermObjects;
  disposeTerminalInstance: (terminalId: number) => void;
};

const TerminalManagerContext = createContext<TerminalManagerProviderState>({
  terminalEnvironments: new Map(),
  setTerminalEnvironments: () => {},
  createTerminalInstance: () => {},
  getTerminalInstance: () => null!,
  disposeTerminalInstance: () => {},
});

export function TerminalManagerProvider({
  children,
  ...props
}: {
  children: React.ReactNode;
}) {
  const xTermObjectsRef = useRef(new Map<number, XTermObjects>());
  const [terminalEnvironments, setTerminalEnvironments] = useState(
    new Map<number, EnvironmentVariable[]>(),
  );

  function createTerminalInstance(terminalId: number) {
    const terminal = new Terminal();
    const fitAddon = new FitAddon();
    terminal.loadAddon(fitAddon);
    const unlistenOutput = listen<TerminalRawData>(
      `terminal-output-${terminalId}`,
      (event) => terminal.write(event.payload.data),
    );
    const unlistenEnvironment = listen<TerminalEnvironment>(
      `terminal-environment-${terminalId}`,
      (event) => {
        setTerminalEnvironments((prev) => {
          const newEnvironments = new Map(prev);
          newEnvironments.set(terminalId, event.payload.environment);
          return newEnvironments;
        });
      },
    );
    xTermObjectsRef.current.set(terminalId, {
      terminal,
      fitAddon,
      unlistenOutput,
      unlistenEnvironment,
    });
  }

  function getTerminalInstance(terminalId: number) {
    const instance = xTermObjectsRef.current.get(terminalId);
    if (instance === undefined) {
      throw new Error(`Terminal instance with id ${terminalId} not found`);
    }
    return instance;
  }

  function disposeTerminalInstance(terminalId: number) {
    const xTermObject = xTermObjectsRef.current.get(terminalId);
    if (xTermObject) {
      xTermObject.unlistenOutput.then((unlisten) => unlisten());
      xTermObject.unlistenEnvironment.then((unlisten) => unlisten());
      xTermObject.fitAddon.dispose();
      xTermObject.terminal.dispose();
      xTermObjectsRef.current.delete(terminalId);
    }
  }

  const value = {
    terminalEnvironments,
    setTerminalEnvironments,
    createTerminalInstance,
    getTerminalInstance,
    disposeTerminalInstance,
  };

  return (
    <TerminalManagerContext.Provider {...props} value={value}>
      {children}
    </TerminalManagerContext.Provider>
  );
}

export function useTerminalManager() {
  const context = useContext(TerminalManagerContext);
  if (context === undefined) {
    throw new Error(
      "useTerminalManager must be used within a TerminalManagerProvider",
    );
  }
  return context;
}
