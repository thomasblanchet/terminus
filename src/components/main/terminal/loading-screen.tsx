export function TerminalLoadingScreen() {
  const squares = Array.from({ length: 7 * 7 });

  return (
    <div className="flex flex-col h-full w-full justify-center items-center">
      <div className="grid grid-cols-7 gap-1 grid-flow-dense">
        {squares.map((_, index) => (
          <div
            key={index}
            className="w-4 h-4 bg-slate-500 animate-pulse"
            style={{
              animationDelay: `${Math.random() * 0.5}s`,
              animationDuration: `${Math.random() * 0.5 + 0.3}s`,
            }}
          ></div>
        ))}
      </div>
      <div className="text-muted-foreground mt-5">Starting terminal...</div>
    </div>
  );
}
