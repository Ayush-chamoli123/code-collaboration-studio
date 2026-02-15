import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Send, Pencil, Trash2, X, Check } from "lucide-react";

interface ChatMessage {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
}

interface ChatPanelProps {
  roomId: string;
  members: { user_id: string; display_name: string }[];
}

const ChatPanel = ({ roomId, members }: ChatPanelProps) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  const getName = (userId: string) =>
    members.find((m) => m.user_id === userId)?.display_name || "Unknown";

  useEffect(() => {
    const fetchMessages = async () => {
      const { data } = await supabase
        .from("chat_messages")
        .select("*")
        .eq("room_id", roomId)
        .order("created_at", { ascending: true })
        .limit(200);
      if (data) setMessages(data);
    };
    fetchMessages();

    const channel = supabase
      .channel(`chat-${roomId}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "chat_messages", filter: `room_id=eq.${roomId}` },
        (payload) => {
          setMessages((prev) => [...prev, payload.new as ChatMessage]);
        }
      )
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "chat_messages", filter: `room_id=eq.${roomId}` },
        (payload) => {
          const updated = payload.new as ChatMessage;
          setMessages((prev) => prev.map((m) => (m.id === updated.id ? updated : m)));
        }
      )
      .on("postgres_changes", { event: "DELETE", schema: "public", table: "chat_messages", filter: `room_id=eq.${roomId}` },
        (payload) => {
          const deletedId = (payload.old as { id: string }).id;
          setMessages((prev) => prev.filter((m) => m.id !== deletedId));
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [roomId]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || !user) return;
    await supabase.from("chat_messages").insert({ room_id: roomId, user_id: user.id, content: input.trim() });
    setInput("");
  };

  const startEdit = (msg: ChatMessage) => {
    setEditingId(msg.id);
    setEditText(msg.content);
  };

  const saveEdit = async () => {
    if (!editingId || !editText.trim()) return;
    await supabase.from("chat_messages").update({ content: editText.trim() }).eq("id", editingId);
    setEditingId(null);
    setEditText("");
  };

  const deleteMessage = async (id: string) => {
    await supabase.from("chat_messages").delete().eq("id", id);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 py-3 border-b border-border">
        <h3 className="text-sm font-semibold text-foreground">Chat</h3>
      </div>
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-3 space-y-3">
        {messages.map((msg) => {
          const isOwn = msg.user_id === user?.id;
          const isEditing = editingId === msg.id;
          return (
            <div key={msg.id} className={`group flex flex-col ${isOwn ? "items-end" : "items-start"}`}>
              <span className="text-[10px] text-muted-foreground mb-0.5">{getName(msg.user_id)}</span>
              {isEditing ? (
                <div className="flex items-center gap-1 max-w-[85%]">
                  <input
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && saveEdit()}
                    className="flex-1 rounded-md bg-muted px-2 py-1 text-sm text-foreground outline-none"
                    autoFocus
                  />
                  <Button size="icon" variant="ghost" className="h-6 w-6" onClick={saveEdit}><Check className="h-3 w-3" /></Button>
                  <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => setEditingId(null)}><X className="h-3 w-3" /></Button>
                </div>
              ) : (
                <div className="relative max-w-[85%]">
                  <div className={`rounded-lg px-3 py-1.5 text-sm ${isOwn ? "bg-primary/20 text-foreground" : "bg-muted text-foreground"}`}>
                    {msg.content}
                  </div>
                  {isOwn && (
                    <div className="hidden group-hover:flex absolute -top-5 right-0 gap-0.5">
                      <Button size="icon" variant="ghost" className="h-5 w-5" onClick={() => startEdit(msg)}><Pencil className="h-3 w-3" /></Button>
                      <Button size="icon" variant="ghost" className="h-5 w-5 text-destructive" onClick={() => deleteMessage(msg.id)}><Trash2 className="h-3 w-3" /></Button>
                    </div>
                  )}
                </div>
              )}
              <span className="text-[9px] text-muted-foreground/60 mt-0.5">
                {new Date(msg.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </span>
            </div>
          );
        })}
      </div>
      <div className="p-3 border-t border-border flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          placeholder="Type a message..."
          className="flex-1 rounded-md bg-muted px-3 py-2 text-sm text-foreground outline-none placeholder:text-muted-foreground/50"
        />
        <Button size="icon" variant="ghost" onClick={sendMessage} disabled={!input.trim()}>
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default ChatPanel;
