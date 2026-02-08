import Editor from "@monaco-editor/react";

interface CodeEditorProps {
  value: string;
  onChange: (value: string) => void;
  readOnly?: boolean;
}

const CodeEditor = ({ value, onChange, readOnly }: CodeEditorProps) => {
  return (
    <Editor
      height="100%"
      defaultLanguage="cpp"
      theme="vs-dark"
      value={value}
      onChange={(val) => onChange(val ?? "")}
      options={{
        fontSize: 14,
        fontFamily: "'JetBrains Mono', monospace",
        minimap: { enabled: false },
        scrollBeyondLastLine: false,
        padding: { top: 16 },
        readOnly,
        automaticLayout: true,
        tabSize: 4,
        wordWrap: "on",
        lineNumbers: "on",
        renderLineHighlight: "line",
        cursorBlinking: "smooth",
        smoothScrolling: true,
      }}
    />
  );
};

export default CodeEditor;
