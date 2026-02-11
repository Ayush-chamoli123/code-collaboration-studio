import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { useNavigate } from "react-router-dom";
import { useToast } from "./use-toast";

function generateRoomCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const parts = [0, 0, 0].map(() =>
    Array.from({ length: 3 }, () => chars[Math.floor(Math.random() * chars.length)]).join("")
  );
  return parts.join("-");
}

export function useRoom() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const createRoom = async (name?: string) => {
    if (!user) return;
    setLoading(true);
    const code = generateRoomCode();

    const { data: room, error } = await supabase
      .from("rooms")
      .insert({ code, name: name || "Untitled Room", host_id: user.id })
      .select()
      .single();

    if (error) {
      toast({ title: "Failed to create room", description: error.message, variant: "destructive" });
      setLoading(false);
      return;
    }

    await supabase.from("room_members").insert({ room_id: room.id, user_id: user.id });

    setLoading(false);
    navigate(`/room/${room.code}`);
  };

  const joinRoom = async (code: string) => {
    if (!user) return;
    setLoading(true);

    const { data: room, error } = await supabase
      .from("rooms")
      .select("id, code")
      .eq("code", code.toUpperCase().trim())
      .maybeSingle();

    if (error || !room) {
      toast({ title: "Room not found", description: "Check the room code and try again.", variant: "destructive" });
      setLoading(false);
      return;
    }

    await supabase.from("room_members").upsert(
      { room_id: room.id, user_id: user.id, is_online: true },
      { onConflict: "room_id,user_id" }
    );

    setLoading(false);
    navigate(`/room/${room.code}`);
  };

  return { createRoom, joinRoom, loading };
}
