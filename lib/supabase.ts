import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(url, key);

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
