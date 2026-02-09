import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import RoomTopBar from "@/components/room/RoomTopBar";
import CodeEditor from "@/components/room/CodeEditor";
import OutputPanel from "@/components/room/OutputPanel";
import ChatPanel from "@/components/room/ChatPanel";
import ContributorsSidebar from "@/components/room/ContributorsSidebar";
import Whiteboard from "@/components/room/Whiteboard";

interface RoomData {
  id: string;
  code: string;
  name: string;
  host_id: string;
  current_code: string;
}

interface MemberData {
  user_id: string;
  display_name: string;
  is_online: boolean;
  joined_at: string;
}

const Room = () => {
  const { roomCode } = useParams<{ roomCode: string }>();
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [room, setRoom] = useState<RoomData | null>(null);
  const [editorCode, setEditorCode] = useState("");
  const [members, setMembers] = useState<MemberData[]>([]);
  const [view, setView] = useState<"code" | "whiteboard">("code");
  const [showContributors, setShowContributors] = useState(true);
  const [showChat, setShowChat] = useState(false);
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const [compiling, setCompiling] = useState(false);
  const [stdin, setStdin] = useState("");
  const [cursorLine, setCursorLine] = useState(1);
  const [cursorColumn, setCursorColumn] = useState(1);
  const [codeUpdateTimeout, setCodeUpdateTimeout] = useState<NodeJS.Timeout | null>(null);

  // Fetch room data
  useEffect(() => {
    if (!roomCode || !user) return;

    const fetchRoom = async () => {
      const { data, error } = await supabase
        .from("rooms")
        .select("*")
        .eq("code", roomCode)
        .maybeSingle();

      if (error || !data) {
        navigate("/");
        return;
      }

      setRoom(data);
      setEditorCode(data.current_code);

      // Ensure user is a member — use Clerk user ID
      await supabase.from("room_members").upsert(
        { room_id: data.id, user_id: user!.id, is_online: true },
        { onConflict: "room_id,user_id" }
      );
    };

    fetchRoom();
  }, [roomCode, user, navigate]);

  // Fetch members with profiles
  useEffect(() => {
    if (!room) return;

    const fetchMembers = async () => {
      const { data: memberRows } = await supabase
        .from("room_members")
        .select("user_id, is_online, joined_at")
        .eq("room_id", room.id);

      if (!memberRows) return;

      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, display_name")
        .in("user_id", memberRows.map((m) => m.user_id));

      const merged: MemberData[] = memberRows.map((m) => ({
        ...m,
        display_name: profiles?.find((p) => p.user_id === m.user_id)?.display_name || "Unknown",
      }));
      setMembers(merged);
    };

    fetchMembers();

    // Realtime member changes
    const channel = supabase
      .channel(`members-${room.id}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "room_members", filter: `room_id=eq.${room.id}` },
        () => fetchMembers()
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [room]);

  // Realtime code sync
  useEffect(() => {
    if (!room) return;

    const channel = supabase
      .channel(`code-${room.id}`)
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "rooms", filter: `id=eq.${room.id}` },
        (payload) => {
          const newCode = (payload.new as RoomData).current_code;
          if (newCode !== editorCode) {
            setEditorCode(newCode);
          }
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [room]);

  // Presence
  useEffect(() => {
    if (!room || !user) return;

    const channel = supabase.channel(`presence-${room.id}`);
    channel
      .on("presence", { event: "sync" }, () => {})
      .subscribe(async (status) => {
        if (status === "SUBSCRIBED") {
          await channel.track({ user_id: user.id, online_at: new Date().toISOString() });
        }
      });

    return () => { supabase.removeChannel(channel); };
  }, [room, user]);

  // Handle code changes - debounced save to DB
  const handleCodeChange = useCallback((value: string) => {
    setEditorCode(value);
    if (codeUpdateTimeout) clearTimeout(codeUpdateTimeout);
    const timeout = setTimeout(async () => {
      if (room) {
        await supabase.from("rooms").update({ current_code: value }).eq("id", room.id);
      }
    }, 500);
    setCodeUpdateTimeout(timeout);
  }, [room, codeUpdateTimeout]);

  // Compile & run
  const handleRun = async () => {
    setCompiling(true);
    setOutput("");
    setError("");

    try {
      const { data, error: fnError } = await supabase.functions.invoke("compile-cpp", {
        body: { code: editorCode, stdin },
      });

      if (fnError) {
        setError(fnError.message);
      } else if (data?.error) {
        setError(data.error);
      } else if (data?.compile_error) {
        setError(data.compile_error);
      } else {
        setOutput(data?.output || "No output");
      }
    } catch (err: any) {
      setError(err.message || "Compilation failed");
    }
    setCompiling(false);
  };

  if (authLoading || !room) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-background overflow-hidden">
      <RoomTopBar
        roomCode={room.code}
        roomName={room.name}
        view={view}
        onViewChange={setView}
        onToggleContributors={() => setShowContributors(!showContributors)}
        onToggleChat={() => setShowChat(!showChat)}
        showContributors={showContributors}
        showChat={showChat}
        onRun={handleRun}
        compiling={compiling}
        cursorLine={cursorLine}
        cursorColumn={cursorColumn}
      />

      <div className="flex flex-1 overflow-hidden">
        {/* Contributors Sidebar */}
        {showContributors && (
          <div className="w-60 border-r border-border shrink-0 overflow-hidden">
            <ContributorsSidebar members={members} hostId={room.host_id} />
          </div>
        )}

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {view === "code" ? (
            <>
              <div className="flex-1 min-h-0">
                <CodeEditor value={editorCode} onChange={handleCodeChange} />
              </div>
              <div className="h-48 shrink-0">
                <OutputPanel
                  output={output}
                  error={error}
                  compiling={compiling}
                  stdin={stdin}
                  onStdinChange={setStdin}
                />
              </div>
            </>
          ) : (
            <Whiteboard roomId={room.id} />
          )}
        </div>

        {/* Chat Panel */}
        {showChat && (
          <div className="w-72 border-l border-border shrink-0 overflow-hidden">
            <ChatPanel roomId={room.id} members={members} />
          </div>
        )}
      </div>
    </div>
  );
};

export default Room;
