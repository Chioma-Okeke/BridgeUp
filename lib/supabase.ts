import { createClient } from "@supabase/supabase-js";

// Lazy singleton — only instantiated on the client where env vars are available
let _supabase: ReturnType<typeof createClient> | null = null;

export function getSupabase() {
  if (!_supabase) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!url || !key) throw new Error("Supabase env vars missing");
    _supabase = createClient(url, key);
  }
  return _supabase;
}

// Keep named export for convenience — same lazy pattern
export const supabase = new Proxy({} as ReturnType<typeof createClient>, {
  get(_target, prop) {
    return (getSupabase() as unknown as Record<string, unknown>)[prop as string];
  },
});

export const ROOM_ID = "demo";

export type Student = {
  id: string;
  name: string;
  avatar: string;
  nervous_course: string;
  goal: string;
  excited: string;
  comfort: number;
  checkin_day: string;
  room_id: string;
  created_at: string;
};

export type EventType = "struggling" | "checkin" | "booking";

export type RoomEvent = {
  id: string;
  room_id: string;
  user_id: string;
  event_type: EventType;
  payload: Record<string, unknown>;
  created_at: string;
};

export type ChatMessage = {
  id: string;
  room_id: string;
  from_user: string;
  text: string;
  created_at: string;
};
