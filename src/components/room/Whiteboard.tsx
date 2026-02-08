import { useRef, useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { MousePointer2, Pen, Square, Type, Undo2, Eraser, ArrowUpRight } from "lucide-react";

type Tool = "pointer" | "pen" | "rectangle" | "arrow" | "text" | "eraser";

interface WhiteboardProps {
  roomId: string;
}

interface DrawAction {
  type: Tool;
  points: { x: number; y: number }[];
  color: string;
  width: number;
  text?: string;
}

const Whiteboard = ({ roomId }: WhiteboardProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [tool, setTool] = useState<Tool>("pen");
  const [drawing, setDrawing] = useState(false);
  const [actions, setActions] = useState<DrawAction[]>([]);
  const [currentAction, setCurrentAction] = useState<DrawAction | null>(null);
  const [color] = useState("#38bdf8");

  const redraw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    [...actions, currentAction].filter(Boolean).forEach((action) => {
      if (!action) return;
      ctx.strokeStyle = action.type === "eraser" ? "#0c1222" : action.color;
      ctx.lineWidth = action.type === "eraser" ? 20 : action.width;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";

      if (action.type === "pen" || action.type === "eraser") {
        ctx.beginPath();
        action.points.forEach((p, i) => {
          if (i === 0) ctx.moveTo(p.x, p.y);
          else ctx.lineTo(p.x, p.y);
        });
        ctx.stroke();
      } else if (action.type === "rectangle" && action.points.length >= 2) {
        const [s, e] = [action.points[0], action.points[action.points.length - 1]];
        ctx.strokeRect(s.x, s.y, e.x - s.x, e.y - s.y);
      } else if (action.type === "arrow" && action.points.length >= 2) {
        const [s, e] = [action.points[0], action.points[action.points.length - 1]];
        ctx.beginPath();
        ctx.moveTo(s.x, s.y);
        ctx.lineTo(e.x, e.y);
        ctx.stroke();
        // Arrowhead
        const angle = Math.atan2(e.y - s.y, e.x - s.x);
        const headLen = 15;
        ctx.beginPath();
        ctx.moveTo(e.x, e.y);
        ctx.lineTo(e.x - headLen * Math.cos(angle - Math.PI / 6), e.y - headLen * Math.sin(angle - Math.PI / 6));
        ctx.moveTo(e.x, e.y);
        ctx.lineTo(e.x - headLen * Math.cos(angle + Math.PI / 6), e.y - headLen * Math.sin(angle + Math.PI / 6));
        ctx.stroke();
      } else if (action.type === "text" && action.text && action.points.length > 0) {
        ctx.font = "16px 'Inter', sans-serif";
        ctx.fillStyle = action.color;
        ctx.fillText(action.text, action.points[0].x, action.points[0].y);
      }
    });
  }, [actions, currentAction]);

  useEffect(() => { redraw(); }, [redraw]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const resize = () => {
      canvas.width = canvas.parentElement?.clientWidth || 800;
      canvas.height = canvas.parentElement?.clientHeight || 600;
      redraw();
    };
    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, [redraw]);

  const getPos = (e: React.MouseEvent) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return { x: 0, y: 0 };
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const onMouseDown = (e: React.MouseEvent) => {
    if (tool === "pointer") return;
    if (tool === "text") {
      const pos = getPos(e);
      const text = prompt("Enter text:");
      if (text) {
        setActions((prev) => [...prev, { type: "text", points: [pos], color, width: 2, text }]);
      }
      return;
    }
    setDrawing(true);
    setCurrentAction({ type: tool, points: [getPos(e)], color, width: 2 });
  };

  const onMouseMove = (e: React.MouseEvent) => {
    if (!drawing || !currentAction) return;
    setCurrentAction({ ...currentAction, points: [...currentAction.points, getPos(e)] });
  };

  const onMouseUp = () => {
    if (currentAction) {
      setActions((prev) => [...prev, currentAction]);
      setCurrentAction(null);
    }
    setDrawing(false);
  };

  const undo = () => setActions((prev) => prev.slice(0, -1));

  const tools: { id: Tool; icon: typeof Pen; label: string }[] = [
    { id: "pointer", icon: MousePointer2, label: "Pointer" },
    { id: "pen", icon: Pen, label: "Pen" },
    { id: "rectangle", icon: Square, label: "Rectangle" },
    { id: "arrow", icon: ArrowUpRight, label: "Arrow" },
    { id: "text", icon: Type, label: "Text" },
    { id: "eraser", icon: Eraser, label: "Eraser" },
  ];

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-1 px-4 py-2 border-b border-border bg-card/50">
        {tools.map((t) => (
          <Button
            key={t.id}
            variant={tool === t.id ? "default" : "ghost"}
            size="icon"
            className="h-8 w-8"
            onClick={() => setTool(t.id)}
            title={t.label}
          >
            <t.icon className="h-4 w-4" />
          </Button>
        ))}
        <div className="mx-2 h-4 w-px bg-border" />
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={undo} title="Undo">
          <Undo2 className="h-4 w-4" />
        </Button>
      </div>
      <div className="flex-1 relative bg-background">
        <canvas
          ref={canvasRef}
          className="absolute inset-0 cursor-crosshair"
          onMouseDown={onMouseDown}
          onMouseMove={onMouseMove}
          onMouseUp={onMouseUp}
          onMouseLeave={onMouseUp}
        />
      </div>
    </div>
  );
};

export default Whiteboard;
