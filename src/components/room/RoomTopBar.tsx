import { Button } from "@/components/ui/button";
import { Code2, Pencil, Users, MessageSquare, Share2, Copy, Play, Loader2, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

interface RoomTopBarProps {
  roomCode: string;
  roomName: string;
  view: "code" | "whiteboard";
  onViewChange: (view: "code" | "whiteboard") => void;
  onToggleContributors: () => void;
  onToggleChat: () => void;
  showContributors: boolean;
  showChat: boolean;
  onRun: () => void;
  compiling: boolean;
  cursorLine: number;
  cursorColumn: number;
}

const RoomTopBar = ({
  roomCode, roomName, view, onViewChange,
  onToggleContributors, onToggleChat, showContributors, showChat,
  onRun, compiling, cursorLine, cursorColumn,
}: RoomTopBarProps) => {
  const { toast } = useToast();
  const navigate = useNavigate();

  const copyCode = () => {
    navigator.clipboard.writeText(roomCode);
    toast({ title: "Room code copied!", description: roomCode });
  };

  return (
    <div className="flex items-center justify-between border-b border-border px-3 py-2 bg-card/80">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => navigate("/")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex items-center gap-2">
          <Code2 className="h-4 w-4 text-primary" />
          <span className="font-semibold text-sm text-foreground">{roomName}</span>
        </div>
        <div className="flex items-center rounded-md border border-border overflow-hidden">
          <Button
            variant={view === "code" ? "default" : "ghost"}
            size="sm"
            className="rounded-none h-7 text-xs gap-1"
            onClick={() => onViewChange("code")}
          >
            <Code2 className="h-3 w-3" /> Code
          </Button>
          <Button
            variant={view === "whiteboard" ? "default" : "ghost"}
            size="sm"
            className="rounded-none h-7 text-xs gap-1"
            onClick={() => onViewChange("whiteboard")}
          >
            <Pencil className="h-3 w-3" /> Whiteboard
          </Button>
        </div>
        <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded font-mono">C++</span>
      </div>

      <div className="flex items-center gap-2">
        {view === "code" && (
          <>
            <span className="text-xs text-muted-foreground mr-2">
              Ln {cursorLine}, Col {cursorColumn}
            </span>
            <Button
              onClick={onRun}
              disabled={compiling}
              size="sm"
              className="bg-success hover:bg-success/90 text-primary-foreground gap-1 h-7"
            >
              {compiling ? <Loader2 className="h-3 w-3 animate-spin" /> : <Play className="h-3 w-3" />}
              Run
            </Button>
          </>
        )}
        <Button
          variant={showContributors ? "default" : "ghost"}
          size="icon"
          className="h-8 w-8"
          onClick={onToggleContributors}
        >
          <Users className="h-4 w-4" />
        </Button>
        <Button
          variant={showChat ? "default" : "ghost"}
          size="icon"
          className="h-8 w-8"
          onClick={onToggleChat}
        >
          <MessageSquare className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={copyCode} title="Copy room code">
          <Copy className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default RoomTopBar;
