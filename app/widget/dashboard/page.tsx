"use client";

export const dynamic = "force-dynamic";

import { useState, useRef, useEffect, useCallback, Suspense } from "react";
import ReactMarkdown from "react-markdown";
import { supabase, ROOM_ID } from "@/lib/supabase";
import type { RoomEvent, ChatMessage, Student } from "@/lib/supabase";

// ── Milestone definitions ─────────────────────────────────────────────────────
type MilestoneDef = { id: string; emoji: string; label: string; sub: string; earnedLabel: string };

const MILESTONES: MilestoneDef[] = [
  { id: "roadmap",        emoji: "🗺️", label: "Roadmap Unlocked",  sub: "Run your first DARS audit",          earnedLabel: "You ran your first DARS audit" },
  { id: "streak_fire",    emoji: "🔥", label: "On Fire",           sub: "Check in 5 days in a row",           earnedLabel: "5-day check-in streak achieved" },
  { id: "first_step",     emoji: "🎯", label: "First Step Taken",  sub: "Book your first ASN tutor session",  earnedLabel: "You booked your first tutor session" },
  { id: "course_confirm", emoji: "✅", label: "Course Confirmed",  sub: "Meet with your academic advisor",    earnedLabel: "You met with your advisor" },
  { id: "self_care",      emoji: "💙", label: "Taking Care of You",sub: "Open a Counseling check-in",         earnedLabel: "You opened a counseling check-in" },
  { id: "together",       emoji: "🤝", label: "Better Together",   sub: "Attend a resource with your partner",earnedLabel: "You showed up with your partner" },
];

// ── Sub-components ────────────────────────────────────────────────────────────
function StreakPill({ icon, label, count }: { icon: string; label: string; count: number }) {
  return (
    <div className="flex flex-col items-center gap-1 bg-white/10 rounded-xl px-3 py-2 flex-1">
      <span className="text-lg">{icon}</span>
      <span className="text-white font-bold text-base leading-none">{count}</span>
      <span className="text-white/60 text-[10px] text-center leading-tight">{label}</span>
    </div>
  );
}

function MilestoneToast({ emoji, label, onDismiss }: { emoji: string; label: string; onDismiss: () => void }) {
  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/40">
      <div className="bg-white rounded-2xl shadow-2xl px-8 py-8 flex flex-col items-center gap-3 mx-4">
        <span className="text-5xl">{emoji}</span>
        <p className="text-[#8C1D40] font-bold text-lg text-center">{label}</p>
        <p className="text-zinc-500 text-sm text-center">Your partner has been notified. Help-seeking is a win.</p>
        <button type="button" onClick={onDismiss}
          className="mt-2 bg-[#8C1D40] text-white rounded-full px-6 py-2 font-semibold text-sm hover:bg-[#6b1530] transition-colors">
          Keep Going
        </button>
      </div>
    </div>
  );
}

// ── Milestones view ───────────────────────────────────────────────────────────
function MilestonesView({ earnedIds, onBack }: { earnedIds: Set<string>; onBack: () => void }) {
  const earned = MILESTONES.filter((m) => earnedIds.has(m.id));
  const locked  = MILESTONES.filter((m) => !earnedIds.has(m.id));
  return (
    <div className="flex flex-col h-full">
      <button type="button" onClick={onBack}
        className="flex items-center gap-2 text-white/70 hover:text-white text-sm font-semibold mb-4 transition-colors self-start shrink-0">
        ← Back
      </button>
      <div className="flex-1 bg-zinc-50 rounded-t-3xl overflow-y-auto">
        <div className="p-4 flex flex-col gap-5">
          <div>
            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-3">Earned · {earned.length}/{MILESTONES.length}</p>
            {earned.length === 0 ? (
              <p className="text-zinc-400 text-sm text-center py-6">Complete actions to earn your first badge!</p>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {earned.map((m) => (
                  <div key={m.id} className="bg-white border-2 border-[#FFC627] rounded-2xl p-3 flex flex-col items-center gap-1.5 shadow-[0_0_14px_rgba(255,198,39,0.35)]">
                    <span className="text-4xl">{m.emoji}</span>
                    <p className="text-[#8C1D40] font-bold text-xs text-center leading-tight">{m.label}</p>
                    <p className="text-zinc-400 text-[10px] text-center leading-tight">{m.earnedLabel}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
          {locked.length > 0 && (
            <div>
              <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-3">Locked · {locked.length} remaining</p>
              <div className="grid grid-cols-2 gap-3">
                {locked.map((m) => (
                  <div key={m.id} className="bg-white border border-zinc-200 rounded-2xl p-3 flex flex-col items-center gap-1.5 opacity-40">
                    <span className="text-4xl grayscale">{m.emoji}</span>
                    <p className="text-zinc-600 font-bold text-xs text-center leading-tight">{m.label}</p>
                    <p className="text-zinc-400 text-[10px] text-center leading-tight">{m.sub}</p>
                    <span className="text-zinc-300 text-sm mt-0.5">🔒</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Tab 1: Check-in ───────────────────────────────────────────────────────────
function CheckInTab({
  myId, me, partner,
  partnerStruggling, partnerCheckedIn,
}: {
  myId: string; me: Student; partner: Student;
  partnerStruggling: boolean; partnerCheckedIn: boolean;
}) {
  const myStreaks = { checkin: 5, assignment: 7, helpSeeking: 2 };

  const [checkIn, setCheckIn]             = useState<string | null>(null);
  const [note, setNote]                   = useState("");
  const [noteSent, setNoteSent]           = useState(false);
  const [selfStruggling, setSelfStruggling] = useState(false);
  const [selfMoodStruggling, setSelfMoodStruggling] = useState(false);
  const [showMilestone, setShowMilestone] = useState(false);
  const [bookingPending, setBookingPending] = useState(false);
  const [nudgeDismissed, setNudgeDismissed] = useState(false);
  const [strugglingDismissed, setStrugglingDismissed] = useState(false);

  // Derive: show resource card if either the user or their partner signalled struggling
  const showResource = (selfStruggling || partnerStruggling || selfMoodStruggling) && !bookingPending && !nudgeDismissed;

  async function handleCheckIn(mood: string) {
    setCheckIn(mood);
    await supabase.from("room_events").insert({
      room_id: ROOM_ID, user_id: myId, event_type: "checkin", payload: { mood },
    });
    if (mood === "struggling") setSelfMoodStruggling(true);
  }

  async function handleStruggling() {
    setSelfStruggling(true);
    await supabase.from("room_events").insert({
      room_id: ROOM_ID, user_id: myId, event_type: "struggling", payload: {},
    });
  }

  async function handleResourceCTA() {
    await supabase.from("room_events").insert({
      room_id: ROOM_ID, user_id: myId, event_type: "booking", payload: { resource: "ASU Tutoring" },
    });
    setBookingPending(true);
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Partner card */}
      <div className="bg-white rounded-2xl shadow-sm border border-zinc-100 p-4">
        <p className="text-[10px] font-semibold text-zinc-400 uppercase tracking-widest mb-3">Your Accountability Partner</p>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-[#8C1D40]/10 flex items-center justify-center text-2xl">{partner.avatar}</div>
          <div className="flex-1">
            <p className="font-bold text-zinc-800">{partner.name}</p>
            <p className="text-zinc-500 text-xs leading-tight">{partner.nervous_course ?? "No course listed"}</p>
          </div>
          <div className="flex flex-col items-center">
            <div className={`w-2.5 h-2.5 rounded-full ${partnerCheckedIn ? "bg-green-400" : "bg-zinc-300"}`} />
            <p className="text-[10px] text-zinc-400 mt-1">{partnerCheckedIn ? "Checked in" : "Pending"}</p>
          </div>
        </div>
        {partnerStruggling && !strugglingDismissed && (
          <div className="mt-3 pt-3 border-t border-zinc-100 flex items-center gap-2">
            <span className="text-sm">😮‍💨</span>
            <p className="text-[#8C1D40] text-xs font-semibold flex-1">{partner.name} is struggling too — you&apos;re not alone.</p>
            <button type="button" onClick={() => setStrugglingDismissed(true)}
              className="text-zinc-400 hover:text-zinc-600 text-xs font-bold leading-none">✕</button>
          </div>
        )}
        <div className="flex gap-3 mt-3 pt-3 border-t border-zinc-100">
          <span className="flex items-center gap-1 text-xs text-zinc-500">🔥 4</span>
          <span className="flex items-center gap-1 text-xs text-zinc-500">📚 6</span>
          <span className="flex items-center gap-1 text-xs text-zinc-500">🤝 1</span>
        </div>
      </div>

      {/* Weekly check-in */}
      {!checkIn ? (
        <div className="bg-white rounded-2xl shadow-sm border border-zinc-100 p-4">
          <p className="text-[10px] font-semibold text-zinc-400 uppercase tracking-widest mb-1">Weekly Check-in</p>
          <p className="text-zinc-700 font-semibold text-sm mb-4">How is MAT 265 feeling this week?</p>
          <div className="grid grid-cols-2 gap-2">
            {[
              { mood: "great",      emoji: "😊", label: "Great" },
              { mood: "okay",       emoji: "😐", label: "Okay" },
              { mood: "tough",      emoji: "😬", label: "Tough" },
              { mood: "struggling", emoji: "😓", label: "Really struggling" },
            ].map(({ mood, emoji, label }) => (
              <button key={mood} type="button" onClick={() => handleCheckIn(mood)}
                className="flex items-center gap-2 bg-zinc-50 hover:bg-[#8C1D40]/5 border border-zinc-200 hover:border-[#8C1D40]/30 rounded-xl px-3 py-2.5 text-sm font-medium text-zinc-700 transition-all">
                <span className="text-lg">{emoji}</span><span>{label}</span>
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-zinc-100 p-4 flex flex-col gap-3">
          <p className="text-[10px] font-semibold text-zinc-400 uppercase tracking-widest">Weekly Check-in</p>
          <p className="text-zinc-700 text-sm">
            Checked in as{" "}
            <span className="font-semibold text-[#8C1D40]">
              {checkIn === "great" ? "😊 Great" : checkIn === "okay" ? "😐 Okay" : checkIn === "tough" ? "😬 Tough" : "😓 Really struggling"}
            </span>
          </p>
          {!noteSent ? (
            <div className="flex flex-col gap-2">
              <textarea value={note} onChange={(e) => setNote(e.target.value)}
                placeholder={`Add a note for ${partner.name} (optional)...`}
                title="Note for your partner" rows={2}
                className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-sm text-zinc-700 placeholder-zinc-400 resize-none focus:outline-none focus:border-[#8C1D40]/40 transition-colors"
              />
              <button type="button" onClick={async () => {
                if (!note.trim()) return;
                await supabase.from("messages").insert({ room_id: ROOM_ID, from_user: myId, text: note.trim() });
                setNoteSent(true);
              }} disabled={!note.trim()}
                className="self-end bg-[#8C1D40] text-white text-xs font-bold px-4 py-2 rounded-xl disabled:opacity-40 hover:bg-[#6b1530] transition-colors">
                Send to {partner.name} →
              </button>
            </div>
          ) : (
            <p className="text-xs text-green-600 font-medium">✓ Note sent to {partner.name}</p>
          )}
          {bookingPending && (
            <p className="text-xs text-amber-600 font-medium">⏳ Booking request sent — pending confirmation.</p>
          )}
        </div>
      )}

      {/* Struggling too */}
      {!selfStruggling && !showResource && (
        <button type="button" onClick={handleStruggling}
          className="w-full flex items-center justify-center gap-2 bg-white border-2 border-dashed border-[#8C1D40]/30 hover:border-[#8C1D40] rounded-2xl py-3 text-[#8C1D40] font-semibold text-sm transition-all hover:bg-[#8C1D40]/5">
          <span>😮‍💨</span> I&apos;m struggling too
        </button>
      )}

      {/* Resource nudge */}
      {showResource && (
        <div className="bg-[#FFC627] rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between mb-1">
            <p className="text-[10px] font-semibold text-[#8C1D40] uppercase tracking-widest">Resource Nudge</p>
            <button type="button" onClick={() => setNudgeDismissed(true)}
              className="text-[#8C1D40]/50 hover:text-[#8C1D40] text-xs font-bold leading-none">✕</button>
          </div>
          <p className="text-zinc-800 font-bold text-sm mb-1">ASN Tutoring — {partner.nervous_course ?? "your course"}</p>
          <p className="text-zinc-700 text-xs mb-3">
            {partnerStruggling
              ? `${partner.name} is also struggling. Book a free session together.`
              : `${me.name} and ${partner.name} can both drop in — it's free.`}
          </p>
          {bookingPending ? (
            <div className="w-full bg-[#8C1D40]/10 border border-[#8C1D40]/20 rounded-xl py-2.5 text-center text-[#8C1D40] text-sm font-semibold">
              ⏳ Pending confirmation…
            </div>
          ) : (
            <button type="button" onClick={handleResourceCTA}
              className="w-full bg-[#8C1D40] text-white font-bold rounded-xl py-2.5 text-sm hover:bg-[#6b1530] transition-colors">
              Book with {partner.name} →
            </button>
          )}
        </div>
      )}

      {/* My streaks at the bottom */}
      {/* <div className="bg-white rounded-2xl shadow-sm border border-zinc-100 p-4">
        <p className="text-[10px] font-semibold text-zinc-400 uppercase tracking-widest mb-3">Your Streaks</p>
        <div className="flex gap-3">
          <span className="flex items-center gap-1.5 text-xs text-zinc-600">🔥 {myStreaks.checkin} check-ins</span>
          <span className="flex items-center gap-1.5 text-xs text-zinc-600">📚 {myStreaks.assignment} assignments</span>
          <span className="flex items-center gap-1.5 text-xs text-zinc-600">🤝 {myStreaks.helpSeeking} help</span>
        </div>
      </div> */}

      {showMilestone && (
        <MilestoneToast emoji="🎯" label="First Step Taken!" onDismiss={() => setShowMilestone(false)} />
      )}
    </div>
  );
}

// ── Tab 2: Chat (real-time) ───────────────────────────────────────────────────
function ChatTab({ myId, partner }: { myId: string; partner: Student }) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput]       = useState("");
  const bottomRef               = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Load existing messages
    supabase
      .from("messages")
      .select("*")
      .eq("room_id", ROOM_ID)
      .order("created_at", { ascending: true })
      .then(({ data }: { data: ChatMessage[] | null }) => { if (data) setMessages(data); });

    // Subscribe to new messages
    const channel = supabase
      .channel("messages")
      .on("postgres_changes", {
        event: "INSERT", schema: "public", table: "messages",
        filter: `room_id=eq.${ROOM_ID}`,
      }, (payload: { new: ChatMessage }) => {
        setMessages((prev) => [...prev, payload.new]);
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function handleSend() {
    if (!input.trim()) return;
    const text = input.trim();
    setInput("");
    await supabase.from("messages").insert({ room_id: ROOM_ID, from_user: myId, text });
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-3 bg-white rounded-2xl border border-zinc-100 p-3 mb-3">
        <div className="w-9 h-9 rounded-full bg-[#8C1D40]/10 flex items-center justify-center text-xl">{partner.avatar}</div>
        <div>
          <p className="font-bold text-zinc-800 text-sm">{partner.name}</p>
          <p className="text-zinc-400 text-xs">MAT 265 partner · Active now</p>
        </div>
        <div className="ml-auto w-2 h-2 rounded-full bg-green-400" />
      </div>

      <div className="flex-1 overflow-y-auto flex flex-col gap-3 pb-2">
        {messages.length === 0 && (
          <p className="text-zinc-400 text-xs text-center py-8">No messages yet — say hi 👋</p>
        )}
        {messages.map((msg) => (
          <div key={msg.id} className={`flex flex-col ${msg.from_user === myId ? "items-end" : "items-start"}`}>
            <div className={`max-w-[75%] rounded-2xl px-3 py-2 text-sm leading-relaxed ${
              msg.from_user === myId
                ? "bg-[#8C1D40] text-white rounded-br-sm"
                : "bg-white border border-zinc-100 text-zinc-700 rounded-bl-sm"
            }`}>
              {msg.text}
            </div>
            <span className="text-[10px] text-zinc-400 mt-1 px-1">
              {new Date(msg.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
            </span>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      <div className="flex gap-2 mt-3">
        <input type="text" value={input} onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          placeholder={`Message ${partner.name}...`} title="Chat message"
          className="flex-1 bg-white border border-zinc-200 rounded-xl px-3 py-2.5 text-sm text-zinc-700 placeholder-zinc-400 focus:outline-none focus:border-[#8C1D40]/40 transition-colors"
        />
        <button type="button" onClick={handleSend} disabled={!input.trim()}
          className="bg-[#8C1D40] text-white rounded-xl px-4 font-bold text-sm disabled:opacity-40 hover:bg-[#6b1530] transition-colors">
          →
        </button>
      </div>
    </div>
  );
}

// ── Tab 3: AI Help ────────────────────────────────────────────────────────────
type AIMessage = { role: "user" | "assistant"; content: string };

const RESOURCE_SUGGESTIONS = [
  "Where can I get math tutoring?",
  "I'm struggling with writing an essay",
  "I feel overwhelmed and stressed",
  "I'm not sure I picked the right major",
];

const NAVIGATION_SUGGESTIONS = [
  "What is a DARS audit and why does it matter?",
  "What's the difference between a major map and DARS?",
  "What is a credit hour?",
  "What does 'off-track' mean on eAdvisor?",
  "How do I know if I'm on track to graduate?",
  "What's an academic advisor and when should I see one?",
];

function AIHelpTab({ isFirstGen }: { isFirstGen: boolean }) {
  const [messages, setMessages] = useState<AIMessage[]>([]);
  const [input, setInput]       = useState("");
  const [loading, setLoading]   = useState(false);
  const bottomRef               = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  async function handleSend(text?: string) {
    const query = (text ?? input).trim();
    if (!query) return;
    setInput("");
    const updated: AIMessage[] = [...messages, { role: "user", content: query }];
    setMessages(updated);
    setLoading(true);
    try {
      const res  = await fetch("/api/ai-help", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ messages: updated }) });
      const data = await res.json();
      setMessages((prev) => [...prev, { role: "assistant", content: data.reply }]);
    } catch {
      setMessages((prev) => [...prev, { role: "assistant", content: "Sorry, I couldn't connect right now. Try again!" }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-3 bg-white rounded-2xl border border-zinc-100 p-3 mb-3">
        <div className="w-9 h-9 rounded-full bg-[#FFC627] flex items-center justify-center text-xl">✨</div>
        <div>
          <p className="font-bold text-zinc-800 text-sm">BridgeUp AI</p>
          <p className="text-zinc-400 text-xs">No question is too basic — ask anything</p>
        </div>
      </div>

      {messages.length === 0 && (
        <div className="flex flex-col gap-3 mb-3">
          {isFirstGen ? (
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center gap-2 px-1">
                <p className="text-[10px] text-[#8C1D40] font-bold uppercase tracking-widest">How college works</p>
                <span className="bg-[#8C1D40] text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">First-gen</span>
              </div>
              <p className="text-[10px] text-zinc-400 px-1 -mt-0.5">Questions you never got to ask — this is the safe place.</p>
              {NAVIGATION_SUGGESTIONS.map((s) => (
                <button key={s} type="button" onClick={() => handleSend(s)}
                  className="text-left bg-[#8C1D40]/5 border border-[#8C1D40]/15 hover:border-[#8C1D40]/40 rounded-xl px-3 py-2.5 text-sm text-zinc-700 hover:bg-[#8C1D40]/10 transition-all">
                  {s}
                </button>
              ))}
            </div>
          ) : (
            <div className="flex flex-col gap-1.5">
              <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest px-1">Find support</p>
              {RESOURCE_SUGGESTIONS.map((s) => (
                <button key={s} type="button" onClick={() => handleSend(s)}
                  className="text-left bg-white border border-zinc-200 hover:border-[#8C1D40]/30 rounded-xl px-3 py-2.5 text-sm text-zinc-600 hover:bg-[#8C1D40]/5 transition-all">
                  {s}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="flex-1 overflow-y-auto flex flex-col gap-3 pb-2">
        {messages.map((msg, i) => (
          <div key={i} className={`flex flex-col ${msg.role === "user" ? "items-end" : "items-start"}`}>
            <div className={`max-w-[85%] rounded-2xl px-3 py-2.5 text-sm leading-relaxed ${
              msg.role === "user"
                ? "bg-[#8C1D40] text-white rounded-br-sm"
                : "bg-[#FFC627]/20 border border-[#FFC627]/40 text-zinc-700 rounded-bl-sm"
            }`}>
              {msg.role === "user" ? msg.content : (
                <ReactMarkdown components={{
                  p:      ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                  strong: ({ children }) => <strong className="font-bold text-[#8C1D40]">{children}</strong>,
                  ul:     ({ children }) => <ul className="mt-1 mb-2 flex flex-col gap-1">{children}</ul>,
                  ol:     ({ children }) => <ol className="mt-1 mb-2 flex flex-col gap-1 list-decimal pl-4">{children}</ol>,
                  li: ({ children }) => (
                    <div className="flex gap-1.5 items-start">
                      <span className="text-[#8C1D40] font-bold mt-0.5 shrink-0">·</span>
                      <span>{children}</span>
                    </div>
                  ),
                  a: ({ href, children }) => (
                    <a href={href} target="_blank" rel="noopener noreferrer"
                      className="text-[#8C1D40] font-semibold underline underline-offset-2 hover:text-[#6b1530]">
                      {children}
                    </a>
                  ),
                  code: ({ children }) => (
                    <code className="bg-white/60 text-[#8C1D40] rounded px-1 py-0.5 text-xs font-mono">{children}</code>
                  ),
                }}>
                  {msg.content}
                </ReactMarkdown>
              )}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex items-start">
            <div className="bg-[#FFC627]/20 border border-[#FFC627]/40 rounded-2xl rounded-bl-sm px-4 py-3 flex gap-1">
              {[0,1,2].map(i => (
                <div key={i} className={`w-1.5 h-1.5 rounded-full bg-[#8C1D40]/40 animate-bounce ${i === 1 ? "delay-150" : i === 2 ? "delay-300" : ""}`} />
              ))}
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div className="flex gap-2 mt-3">
        <input type="text" value={input} onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          placeholder="Ask anything — resources, credits, DARS..." title="Ask AI for help"
          className="flex-1 bg-white border border-zinc-200 rounded-xl px-3 py-2.5 text-sm text-zinc-700 placeholder-zinc-400 focus:outline-none focus:border-[#8C1D40]/40 transition-colors"
        />
        <button type="button" onClick={() => handleSend()} disabled={!input.trim() || loading}
          className="bg-[#FFC627] text-[#8C1D40] rounded-xl px-4 font-bold text-sm disabled:opacity-40 hover:bg-yellow-300 transition-colors">
          ✨
        </button>
      </div>
    </div>
  );
}

// ── Tab 4: Semester Plan ──────────────────────────────────────────────────────
// ASU Spring 2026 — mirrors the same calendar used in course/page.tsx
const PLAN_SEMESTER_START = new Date("2026-01-12");

function getPlanWeek(): number {
  const diff = Date.now() - PLAN_SEMESTER_START.getTime();
  return Math.max(1, Math.min(16, Math.floor(diff / (7 * 24 * 60 * 60 * 1000)) + 1));
}

type SemesterNudge = {
  week: number;
  icon: string;
  title: string;
  body: string;
  cta: { label: string; href: string };
};

const SEMESTER_NUDGES: SemesterNudge[] = [
  {
    week: 1,
    icon: "🗺️",
    title: "Resources Worth Knowing Now",
    body: "Before anything gets hard — tutoring, writing help, and counseling are all free and exist for you. You don't have to be struggling to use them.",
    cta: { label: "Explore ASU Student Resources →", href: "https://students.asu.edu" },
  },
  {
    week: 3,
    icon: "📋",
    title: "Run Your First DARS Audit",
    body: "DARS shows exactly which graduation requirements you've met and what's left. Week 3 is the right time — early enough to fix surprises before they matter.",
    cta: { label: "Open DARS Audit →", href: "https://webapp4.asu.edu/dars" },
  },
  {
    week: 6,
    icon: "💙",
    title: "Mid-Semester Counseling Check-in",
    body: "Stress tends to peak around weeks 7–9. Booking now — before you feel like you need it — means you won't be on a waitlist when it matters most.",
    cta: { label: "Book ASU Counseling →", href: "https://eoss.asu.edu/counseling" },
  },
  {
    week: 10,
    icon: "🎓",
    title: "Start Finals Prep Now",
    body: "Tutoring spots fill up 2–3 weeks before finals. Getting a session on the calendar now is one of the highest-impact things you can do this semester.",
    cta: { label: "Book ASN Tutoring →", href: "https://tutoring.asu.edu" },
  },
];

function PlanTab() {
  const currentWeek = getPlanWeek();
  // The active nudge is the most recent one whose week has arrived
  const activeNudge = [...SEMESTER_NUDGES].reverse().find((n) => currentWeek >= n.week);

  return (
    <div className="flex flex-col gap-4">
      {/* Intro */}
      <div className="bg-[#8C1D40] rounded-2xl p-4">
        <p className="text-white font-bold text-sm mb-1">Your Semester Roadmap</p>
        <p className="text-white/70 text-xs leading-relaxed">
          These check-ins fire for every student — not because something&apos;s wrong, but because knowing early is how you stay ahead.
        </p>
        <p className="text-white/50 text-[10px] mt-2 font-semibold">Week {currentWeek} of 16</p>
      </div>

      {/* Timeline */}
      <div className="flex flex-col">
        {SEMESTER_NUDGES.map((nudge, i) => {
          const isPast    = currentWeek > nudge.week && nudge !== activeNudge;
          const isActive  = nudge === activeNudge;
          const isFuture  = currentWeek < nudge.week;

          return (
            <div key={nudge.week} className="flex gap-3">
              {/* Timeline spine */}
              <div className="flex flex-col items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-base shrink-0 ${
                  isActive  ? "bg-[#FFC627] shadow-[0_0_12px_rgba(255,198,39,0.5)]" :
                  isPast    ? "bg-green-100" :
                  "bg-zinc-100"
                }`}>
                  {isPast ? "✓" : nudge.icon}
                </div>
                {i < SEMESTER_NUDGES.length - 1 && (
                  <div className={`w-0.5 flex-1 my-1 min-h-4 ${isPast ? "bg-green-200" : "bg-zinc-200"}`} />
                )}
              </div>

              {/* Card */}
              <div className={`flex-1 mb-4 rounded-2xl p-3.5 border ${
                isActive  ? "bg-white border-[#FFC627]/60 shadow-sm" :
                isPast    ? "bg-zinc-50 border-zinc-100 opacity-60" :
                "bg-zinc-50 border-zinc-100"
              }`}>
                <div className="flex items-center justify-between mb-1">
                  <p className={`text-[10px] font-bold uppercase tracking-widest ${
                    isActive ? "text-[#8C1D40]" : isPast ? "text-green-600" : "text-zinc-400"
                  }`}>
                    {isPast ? "Completed" : isActive ? "Now — Week " + nudge.week : "Week " + nudge.week}
                  </p>
                  {isFuture && (
                    <span className="text-[10px] text-zinc-400 font-medium">in {nudge.week - currentWeek}w</span>
                  )}
                </div>
                <p className={`font-bold text-sm mb-1 ${isPast ? "text-zinc-500" : "text-zinc-800"}`}>{nudge.title}</p>
                {!isPast && (
                  <>
                    <p className="text-zinc-500 text-xs leading-relaxed mb-3">{nudge.body}</p>
                    <a
                      href={nudge.cta.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`inline-block text-xs font-bold px-3 py-2 rounded-xl transition-opacity hover:opacity-90 ${
                        isActive
                          ? "bg-[#8C1D40] text-white"
                          : "bg-zinc-200 text-zinc-600"
                      }`}
                    >
                      {nudge.cta.label}
                    </a>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Main dashboard ─────────────────────────────────────────────────────────────
type Tab = "checkin" | "chat" | "ai" | "plan";

function DashboardInner() {
  const [me, setMe]           = useState<Student | null>(null);
  const [partner, setPartner] = useState<Student | null>(null);
  const [loading, setLoading] = useState(true);

  const [activeTab, setActiveTab]                   = useState<Tab>("checkin");
  const [showMilestonesView, setShowMilestonesView] = useState(false);
  const [showProfileMenu, setShowProfileMenu]       = useState(false);
  const [partnerStruggling, setPartnerStruggling]   = useState(false);
  const [partnerCheckedIn, setPartnerCheckedIn]     = useState(false);
  const [incomingAlert, setIncomingAlert]           = useState<string | null>(null);

  // Load identity from localStorage → Supabase on mount
  useEffect(() => {
    (async () => {
      const storedId = localStorage.getItem("bridgeup_student_id");
      if (!storedId) { setLoading(false); return; }

      const { data: self }: { data: Student | null } = await supabase
        .from("students").select("*").eq("id", storedId).single();
      if (self) setMe(self);

      const { data: others }: { data: Student[] | null } = await supabase
        .from("students").select("*").eq("room_id", ROOM_ID).neq("id", storedId)
        .order("created_at", { ascending: false }).limit(1);
      if (others && others.length > 0) setPartner(others[0]);

      setLoading(false);
    })();
  }, []);

  const earnedIds = new Set<string>(["roadmap", "streak_fire"]);

  const handleEvent = useCallback((event: RoomEvent) => {
    if (!me || event.user_id === me.id) return;
    if (event.event_type === "struggling") {
      setPartnerStruggling(true);
      setIncomingAlert(`Your partner is struggling too, a resource has been surfaced for both of you.`);
    }
    if (event.event_type === "checkin") {
      setPartnerCheckedIn(true);
      const mood = (event.payload as { mood?: string }).mood ?? "something";
      setIncomingAlert(`Your partner just checked in — feeling ${mood}.`);
    }
    if (event.event_type === "booking") {
      setIncomingAlert(`Your partner just booked a tutoring session — you can join them!`);
    }
  }, [me]);

  useEffect(() => {
    if (!incomingAlert) return;
    const t = setTimeout(() => setIncomingAlert(null), 5000);
    return () => clearTimeout(t);
  }, [incomingAlert]);

  useEffect(() => {
    if (!me) return;
    const channel = supabase
      .channel("room_events")
      .on("postgres_changes", {
        event: "INSERT", schema: "public", table: "room_events",
        filter: `room_id=eq.${ROOM_ID}`,
      }, (payload: { new: RoomEvent }) => {
        handleEvent(payload.new);
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [me, handleEvent]);

  const tabs: { id: Tab; label: string; icon: string }[] = [
    { id: "checkin", label: "Check-in", icon: "🔥" },
    { id: "chat",    label: "Chat",     icon: "💬" },
    { id: "ai",      label: "AI Help",  icon: "✨" },
    { id: "plan",    label: "Plan",     icon: "🗺️" },
  ];

  if (loading) {
    return (
      <div className="h-screen w-full bg-[#8C1D40] flex items-center justify-center">
        <p className="text-white/60 text-sm">Loading your dashboard…</p>
      </div>
    );
  }

  if (!me) {
    return (
      <div className="h-screen w-full bg-[#8C1D40] flex items-center justify-center px-8">
        <p className="text-white text-sm text-center">No profile found. Please complete onboarding first.</p>
      </div>
    );
  }

  return (
    <div className="h-screen w-full bg-[#8C1D40] flex flex-col overflow-hidden font-sans">

      {/* Incoming real-time alert banner */}
      {incomingAlert && (
        <div className="bg-[#FFC627] px-4 py-2.5 flex items-center gap-2 shrink-0">
          <span className="text-sm">🔔</span>
          <p className="text-[#8C1D40] text-xs font-semibold flex-1">{incomingAlert}</p>
          <button type="button" onClick={() => setIncomingAlert(null)}
            className="text-[#8C1D40]/60 hover:text-[#8C1D40] text-sm font-bold">✕</button>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center gap-3 px-5 pt-4 pb-3 shrink-0">
        <div className="relative">
          <button type="button" onClick={() => setShowProfileMenu((v) => !v)}
            className="w-10 h-10 rounded-full bg-[#FFC627] flex items-center justify-center text-xl shadow hover:ring-2 hover:ring-white/40 transition-all"
            title="Profile">
            {me.avatar}
          </button>
          {showProfileMenu && (
            <div className="absolute top-12 left-0 bg-white rounded-2xl shadow-xl border border-zinc-100 py-1 z-50 min-w-[190px]">
              <div className="px-4 py-2.5 border-b border-zinc-100">
                <p className="text-zinc-800 font-bold text-sm">{me.name}</p>
                <p className="text-zinc-400 text-xs">{me.checkin_day}</p>
              </div>
              <button type="button" onClick={() => { setShowMilestonesView(true); setShowProfileMenu(false); }}
                className="w-full text-left px-4 py-2.5 text-sm text-zinc-700 hover:bg-[#8C1D40]/5 hover:text-[#8C1D40] font-medium flex items-center gap-2 transition-colors">
                <span>🏅</span> Your Milestones
                <span className="ml-auto bg-[#FFC627] text-[#8C1D40] text-[10px] font-bold px-1.5 py-0.5 rounded-full">{earnedIds.size}</span>
              </button>
              <button type="button" onClick={() => setShowProfileMenu(false)}
                className="w-full text-left px-4 py-2.5 text-sm text-zinc-400 hover:bg-zinc-50 flex items-center gap-2 transition-colors">
                <span>⚙️</span> Settings
              </button>
            </div>
          )}
        </div>
        <div>
          <p className="text-white/60 text-xs">Welcome back</p>
          <p className="text-white font-bold text-base leading-tight">{me.name}</p>
        </div>
        <div className="ml-auto">
          <span className="bg-[#FFC627] text-[#8C1D40] text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wide">BridgeUp</span>
        </div>
      </div>

      {showMilestonesView ? (
        <div className="flex-1 flex flex-col px-5 pb-4 overflow-hidden">
          <MilestonesView earnedIds={earnedIds} onBack={() => setShowMilestonesView(false)} />
        </div>
      ) : (
        <>
          {/* Streaks */}
          <div className="flex gap-2 px-5 pb-4 shrink-0">
            <StreakPill icon="🔥" label="Check-ins"    count={5} />
            <StreakPill icon="📚" label="Assignments"  count={7} />
            <StreakPill icon="🤝" label="Help-seeking" count={2} />
          </div>

          {/* Tab bar */}
          <div className="flex px-5 gap-1 pb-3 shrink-0">
            {tabs.map(tab => (
              <button key={tab.id} type="button" onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold transition-all ${
                  activeTab === tab.id ? "bg-white text-[#8C1D40]" : "bg-white/10 text-white/60 hover:bg-white/20"
                }`}>
                <span>{tab.icon}</span><span>{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Tab content */}
          <div className="flex-1 bg-zinc-50 rounded-t-3xl mb-4 overflow-y-auto">
            <div className="p-4 h-full">
              {activeTab === "checkin" && partner && (
                <CheckInTab
                  myId={me.id} me={me} partner={partner}
                  partnerStruggling={partnerStruggling}
                  partnerCheckedIn={partnerCheckedIn}
                />
              )}
              {activeTab === "checkin" && !partner && (
                <p className="text-zinc-400 text-sm text-center py-8">Waiting for your partner to join…</p>
              )}
              {activeTab === "chat" && partner && <ChatTab myId={me.id} partner={partner} />}
              {activeTab === "chat" && !partner && (
                <p className="text-zinc-400 text-sm text-center py-8">Waiting for your partner to join…</p>
              )}
              {activeTab === "ai"   && <AIHelpTab isFirstGen={me.is_first_gen} />}
              {activeTab === "plan" && <PlanTab />}
            </div>
          </div>
        </>
      )}

      {showProfileMenu && (
        <div className="fixed inset-0 z-40" onClick={() => setShowProfileMenu(false)} />
      )}
    </div>
  );
}

// ── Page export (Suspense required for useSearchParams) ────────────────────────
export default function DashboardWidget() {
  return (
    <Suspense fallback={<div className="h-screen bg-[#8C1D40]" />}>
      <DashboardInner />
    </Suspense>
  );
}
