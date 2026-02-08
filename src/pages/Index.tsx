import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useRoom } from "@/hooks/useRoom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Code2, Users, Pencil, LogOut, Plus, ArrowRight, Terminal } from "lucide-react";

const Index = () => {
  const { user, signOut, loading: authLoading } = useAuth();
  const { createRoom, joinRoom, loading } = useRoom();
  const [joinCode, setJoinCode] = useState("");
  const navigate = useNavigate();

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!user) {
    navigate("/auth");
    return null;
  }

  const features = [
    {
      icon: Terminal,
      title: "C++ Code Editor",
      description: "Monaco editor with syntax highlighting and built-in C++ compiler via Judge0 API",
    },
    {
      icon: Users,
      title: "Real-Time Collaboration",
      description: "Code together in real-time with live cursors, presence tracking, and contributor lists",
    },
    {
      icon: Pencil,
      title: "Whiteboard",
      description: "Draw, sketch and brainstorm ideas with a shared whiteboard canvas",
    },
  ];

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Navbar */}
      <header className="flex items-center justify-between border-b border-border/50 px-6 py-4">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
            <Code2 className="h-5 w-5 text-primary" />
          </div>
          <span className="text-lg font-bold text-foreground">CodeSphere</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-muted-foreground">{user.email}</span>
          <Button variant="ghost" size="sm" onClick={signOut}>
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </header>

      {/* Hero */}
      <main className="flex flex-1 flex-col items-center justify-center gap-12 px-6 py-12">
        <div className="text-center space-y-4 max-w-2xl">
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">
            Code Together, <span className="text-primary">Build Together</span>
          </h1>
          <p className="text-lg text-muted-foreground">
            Create a room, invite your team, and write C++ code collaboratively in real-time.
          </p>
        </div>

        {/* Room Actions */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:gap-6">
          <Button
            onClick={() => createRoom()}
            disabled={loading}
            size="lg"
            className="bg-secondary hover:bg-secondary/90 text-secondary-foreground gap-2 px-8"
          >
            <Plus className="h-5 w-5" />
            Create New Room
          </Button>

          <div className="flex items-end gap-2">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Room Code</label>
              <Input
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                placeholder="ABC-DEF-GHI"
                className="w-44 font-mono tracking-wider uppercase"
              />
            </div>
            <Button
              onClick={() => joinRoom(joinCode)}
              disabled={loading || !joinCode.trim()}
              size="default"
              className="gap-2"
            >
              Join <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Features */}
        <div className="grid gap-6 sm:grid-cols-3 max-w-4xl w-full">
          {features.map((f) => (
            <Card key={f.title} className="border-border/40 bg-card/60 backdrop-blur hover:border-primary/30 transition-colors">
              <CardContent className="flex flex-col gap-3 p-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <f.icon className="h-5 w-5 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground">{f.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{f.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
};

export default Index;
