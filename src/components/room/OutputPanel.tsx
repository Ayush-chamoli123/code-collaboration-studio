import { Terminal, Loader2 } from "lucide-react";

interface OutputPanelProps {
  output: string;
  error: string;
  compiling: boolean;
  stdin: string;
  onStdinChange: (value: string) => void;
}

const OutputPanel = ({ output, error, compiling, stdin, onStdinChange }: OutputPanelProps) => {
  return (
    <div className="flex flex-col h-full border-t border-border">
      <div className="flex items-center gap-2 px-4 py-2 border-b border-border bg-card/50">
        <Terminal className="h-4 w-4 text-primary" />
        <span className="text-xs font-medium text-muted-foreground">Output</span>
        {compiling && <Loader2 className="h-3 w-3 animate-spin text-primary ml-auto" />}
      </div>
      <div className="flex-1 overflow-auto p-4 font-mono text-sm">
        {compiling ? (
          <span className="text-muted-foreground">Compiling & running...</span>
        ) : error ? (
          <pre className="text-destructive whitespace-pre-wrap">{error}</pre>
        ) : output ? (
          <pre className="text-foreground whitespace-pre-wrap">{output}</pre>
        ) : (
          <span className="text-muted-foreground">Click "Run" to compile and execute your code</span>
        )}
      </div>
      <div className="border-t border-border px-4 py-2">
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground shrink-0">stdin:</span>
          <input
            value={stdin}
            onChange={(e) => onStdinChange(e.target.value)}
            placeholder="Program input (optional)"
            className="flex-1 bg-transparent text-sm font-mono text-foreground outline-none placeholder:text-muted-foreground/50"
          />
        </div>
      </div>
    </div>
  );
};

export default OutputPanel;
