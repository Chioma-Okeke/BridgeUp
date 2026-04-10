import { createClient } from "@supabase/supabase-js";

// ── Minimal DB schema type so TypeScript knows our tables ──────────────────────
export type Database = {
  public: {
    Tables: {
      students: {
        Row: {
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
        };
        Insert: {
          name: string;
          avatar: string;
          nervous_course?: string;
          goal?: string;
          excited?: string;
          comfort?: number;
          checkin_day?: string;
          room_id?: string;
        };
        Update: Partial<Database["public"]["Tables"]["students"]["Insert"]>;
      };
      room_events: {
        Row: {
          id: string;
          room_id: string;
          user_id: string;
          event_type: string;
          payload: Record<string, unknown>;
          created_at: string;
        };
        Insert: {
          room_id?: string;
          user_id: string;
          event_type: string;
          payload?: Record<string, unknown>;
        };
        Update: never;
      };
      messages: {
        Row: {
          id: string;
          room_id: string;
          from_user: string;
          text: string;
          created_at: string;
        };
        Insert: {
          room_id?: string;
          from_user: string;
          text: string;
        };
        Update: never;
      };
    };
  };
};

let _supabase: ReturnType<typeof createClient<Database>> | null = null;

export function getSupabase() {
  if (!_supabase) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!url || !key) throw new Error("Supabase env vars missing");
    _supabase = createClient<Database>(url, key);
  }
  return _supabase;
}

export const supabase = new Proxy({} as ReturnType<typeof createClient<Database>>, {
  get(_target, prop) {
    return (getSupabase() as unknown as Record<string, unknown>)[prop as string];
  },
});

export const ROOM_ID = "demo";

export type Student    = Database["public"]["Tables"]["students"]["Row"];
export type RoomEvent  = Database["public"]["Tables"]["room_events"]["Row"];
export type ChatMessage = Database["public"]["Tables"]["messages"]["Row"];
export type EventType  = "struggling" | "checkin" | "booking";
