import { createClient } from "@supabase/supabase-js";

let _client: ReturnType<typeof createClient> | null = null;

function getClient() {
  if (!_client) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!url || !key) throw new Error("Supabase env vars missing");
    _client = createClient(url, key);
  }
  return _client;
}

// Proxy so imports work as `supabase.from(...)` without calling getClient() at module load time
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const supabase: any = new Proxy({} as ReturnType<typeof createClient>, {
  get(_target, prop) {
    return (getClient() as unknown as Record<string, unknown>)[prop as string];
  },
});

export const ROOM_ID = "demo";

// ── App types (not tied to Supabase generics) ─────────────────────────────────
export type Student = {
  id: string;
  name: string;
  avatar: string;
  nervous_course: string | null;
  goal: string | null;
  excited: string | null;
  comfort: number;
  checkin_day: string;
  room_id: string;
  created_at: string;
  is_first_gen: boolean;
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
