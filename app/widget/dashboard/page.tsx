"use client";

import { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";

// ── Mock data ─────────────────────────────────────────────────────────────────
const student = { name: "Maria", avatar: "🌵", year: "Sophomore" };
const partner = {
  name: "Jordan", avatar: "🌟",
  sharedCourse: "MAT 265 — Calculus for Engineers",
  checkedInToday: false,
  streaks: { checkin: 4, assignment: 6, helpSeeking: 1 },
};
const myStreaks = { checkin: 5, assignment: 7, helpSeeking: 2 };

const MOCK_CHAT: { from: "me" | "partner"; text: string; time: string }[] = [
  { from: "partner", text: "Hey! Did you finish the MAT 265 homework?", time: "Mon 9:12am" },
  { from: "me",      text: "Not yet 😅 the integrals are killing me", time: "Mon 9:45am" },
  { from: "partner", text: "Same. I'm thinking of going to ASN tutoring Thursday — wanna come?", time: "Mon 10:01am" },
  { from: "me",      text: "Yes please! What time?", time: "Mon 10:03am" },
  { from: "partner", text: "3pm, they have drop-in. I'll send you the link", time: "Mon 10:04am" },
];

// ── Milestone definitions ─────────────────────────────────────────────────────
type MilestoneDef = {
  id: string;
  emoji: string;
  label: string;
  sub: string;
  earnedLabel: string;
};

const MILESTONES: MilestoneDef[] = [
  {
    id: "roadmap",
    emoji: "🗺️",
    label: "Roadmap Unlocked",
    sub: "Run your first DARS audit",
    earnedLabel: "You ran your first DARS audit",
  },
  {
    id: "streak_fire",
    emoji: "🔥",
    label: "On Fire",
    sub: "Check in 5 days in a row",
    earnedLabel: "5-day check-in streak achieved",
  },
  {
    id: "first_step",
    emoji: "🎯",
    label: "First Step Taken",
    sub: "Book your first ASN tutor session",
    earnedLabel: "You booked your first tutor session",
  },
  {
    id: "course_confirmed",
    emoji: "✅",
    label: "Course Confirmed",
    sub: "Meet with your academic advisor",
    earnedLabel: "You met with your advisor",
  },
  {
    id: "self_care",
    emoji: "💙",
    label: "Taking Care of You",
    sub: "Open a Counseling check-in",
    earnedLabel: "You opened a counseling check-in",
  },
  {
    id: "better_together",
    emoji: "🤝",
    label: "Better Together",
    sub: "Attend a resource with your partner",
    earnedLabel: "You showed up with Jordan",
  },
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
      <div className="bg-white rounded-2xl shadow-2xl px-8 py-8 flex flex-col items-center gap-3 mx-4 animate-bounce">
        <span className="text-5xl">{emoji}</span>
        <p className="text-[#8C1D40] font-bold text-lg text-center">{label}</p>
        <p className="text-zinc-500 text-sm text-center">Jordan has been notified. Help-seeking is a win.</p>
        <button
          type="button"
          onClick={onDismiss}
          className="mt-2 bg-[#8C1D40] text-white rounded-full px-6 py-2 font-semibold text-sm hover:bg-[#6b1530] transition-colors"
        >
          Keep Going
        </button>
      </div>
    </div>
  );
}

// ── Milestones full-panel view ────────────────────────────────────────────────
function MilestonesView({ earnedIds, onBack }: { earnedIds: Set<string>; onBack: () => void }) {
  const earned = MILESTONES.filter((m) => earnedIds.has(m.id));
  const locked  = MILESTONES.filter((m) => !earnedIds.has(m.id));

  return (
    <div className="flex flex-col h-full">
      {/* Back */}
      <button
        type="button"
        onClick={onBack}
        className="flex items-center gap-2 text-white/70 hover:text-white text-sm font-semibold mb-4 transition-colors self-start shrink-0"
      >
        ← Back
      </button>

      <div className="flex-1 bg-zinc-50 rounded-t-3xl overflow-y-auto">
        <div className="p-4 flex flex-col gap-5">

          {/* Earned */}
          <div>
            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-3">
              Earned · {earned.length}/{MILESTONES.length}
            </p>
            {earned.length === 0 ? (
              <p className="text-zinc-400 text-sm text-center py-6">Complete actions to earn your first badge!</p>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {earned.map((m) => (
                  <div
                    key={m.id}
                    className="bg-white border-2 border-[#FFC627] rounded-2xl p-3 flex flex-col items-center gap-1.5 shadow-[0_0_14px_rgba(255,198,39,0.35)]"
                  >
                    <span className="text-4xl">{m.emoji}</span>
                    <p className="text-[#8C1D40] font-bold text-xs text-center leading-tight">{m.label}</p>
                    <p className="text-zinc-400 text-[10px] text-center leading-tight">{m.earnedLabel}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Locked */}
          {locked.length > 0 && (
            <div>
              <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-3">
                Locked · {locked.length} remaining
              </p>
              <div className="grid grid-cols-2 gap-3">
                {locked.map((m) => (
                  <div
                    key={m.id}
                    className="bg-white border border-zinc-200 rounded-2xl p-3 flex flex-col items-center gap-1.5 opacity-40"
                  >
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
  resourceActivated,
  onResourceActivated,
}: {
  resourceActivated: boolean;
  onResourceActivated: () => void;
}) {
  const [checkIn, setCheckIn] = useState<string | null>(null);
  const [note, setNote] = useState("");
  const [noteSent, setNoteSent] = useState(false);
  const [showResource, setShowResource] = useState(false);
  const [showMilestone, setShowMilestone] = useState(false);
  const [struggling, setStruggling] = useState(false);

  function handleCheckIn(mood: string) {
    setCheckIn(mood);
    if (mood === "struggling") setTimeout(() => setShowResource(true), 600);
  }

  function handleStruggling() {
    setStruggling(true);
    setTimeout(() => setShowResource(true), 400);
  }

  function handleResourceCTA() {
    setShowResource(false);
    onResourceActivated();
    setShowMilestone(true);
  }

  return (
    <div className="flex flex-col gap-4">

      {/* Partner card */}
      <div className="bg-white rounded-2xl shadow-sm border border-zinc-100 p-4">
        <p className="text-[10px] font-semibold text-zinc-400 uppercase tracking-widest mb-3">
          Your Accountability Partner
        </p>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-[#8C1D40]/10 flex items-center justify-center text-2xl">
            {partner.avatar}
          </div>
          <div className="flex-1">
            <p className="font-bold text-zinc-800">{partner.name}</p>
            <p className="text-zinc-500 text-xs leading-tight">{partner.sharedCourse}</p>
          </div>
          <div className="flex flex-col items-center">
            <div className={`w-2.5 h-2.5 rounded-full ${partner.checkedInToday ? "bg-green-400" : "bg-zinc-300"}`} />
            <p className="text-[10px] text-zinc-400 mt-1">{partner.checkedInToday ? "Checked in" : "Pending"}</p>
          </div>
        </div>
        <div className="flex gap-3 mt-3 pt-3 border-t border-zinc-100">
          <span className="flex items-center gap-1 text-xs text-zinc-500">🔥 {partner.streaks.checkin}</span>
          <span className="flex items-center gap-1 text-xs text-zinc-500">📚 {partner.streaks.assignment}</span>
          <span className="flex items-center gap-1 text-xs text-zinc-500">🤝 {partner.streaks.helpSeeking}</span>
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
              <button
                key={mood}
                type="button"
                onClick={() => handleCheckIn(mood)}
                className="flex items-center gap-2 bg-zinc-50 hover:bg-[#8C1D40]/5 border border-zinc-200 hover:border-[#8C1D40]/30 rounded-xl px-3 py-2.5 text-sm font-medium text-zinc-700 transition-all"
              >
                <span className="text-lg">{emoji}</span>
                <span>{label}</span>
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
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Add a note for Jordan (optional)..."
                title="Note for your partner"
                rows={2}
                className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-sm text-zinc-700 placeholder-zinc-400 resize-none focus:outline-none focus:border-[#8C1D40]/40 transition-colors"
              />
              <button
                type="button"
                onClick={() => setNoteSent(true)}
                disabled={!note.trim()}
                className="self-end bg-[#8C1D40] text-white text-xs font-bold px-4 py-2 rounded-xl disabled:opacity-40 hover:bg-[#6b1530] transition-colors"
              >
                Send to Jordan →
              </button>
            </div>
          ) : (
            <p className="text-xs text-green-600 font-medium">✓ Note sent to Jordan</p>
          )}

          {resourceActivated && (
            <p className="text-xs text-green-600 font-medium">🎯 You booked a tutor session. Milestone earned!</p>
          )}
        </div>
      )}

      {/* Struggling too */}
      {!struggling && !showResource && (
        <button
          type="button"
          onClick={handleStruggling}
          className="w-full flex items-center justify-center gap-2 bg-white border-2 border-dashed border-[#8C1D40]/30 hover:border-[#8C1D40] rounded-2xl py-3 text-[#8C1D40] font-semibold text-sm transition-all hover:bg-[#8C1D40]/5"
        >
          <span>😮‍💨</span>
          I&apos;m struggling too
        </button>
      )}

      {/* Resource nudge */}
      {showResource && !resourceActivated && (
        <div className="bg-[#FFC627] rounded-2xl p-4 shadow-sm">
          <p className="text-[10px] font-semibold text-[#8C1D40] uppercase tracking-widest mb-1">Resource Nudge</p>
          <p className="text-zinc-800 font-bold text-sm mb-1">ASN Tutoring — MAT 265</p>
          <p className="text-zinc-700 text-xs mb-3">Jordan tapped &apos;struggling too&apos;. Book a free session together.</p>
          <button
            type="button"
            onClick={handleResourceCTA}
            className="w-full bg-[#8C1D40] text-white font-bold rounded-xl py-2.5 text-sm hover:bg-[#6b1530] transition-colors"
          >
            Book with Jordan →
          </button>
        </div>
      )}

      {showMilestone && (
        <MilestoneToast emoji="🎯" label="First Step Taken!" onDismiss={() => setShowMilestone(false)} />
      )}
    </div>
  );
}

// ── Tab 2: Chat ───────────────────────────────────────────────────────────────
function ChatTab() {
  const [messages, setMessages] = useState(MOCK_CHAT);
  const [input, setInput] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  function handleSend() {
    if (!input.trim()) return;
    setMessages(prev => [...prev, { from: "me", text: input.trim(), time: "Now" }]);
    setInput("");
    setTimeout(() => {
      setMessages(prev => [...prev, {
        from: "partner",
        text: "Got it! Let me know if you want to study together before the exam 📚",
        time: "Now",
      }]);
    }, 1200);
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-3 bg-white rounded-2xl border border-zinc-100 p-3 mb-3">
        <div className="w-9 h-9 rounded-full bg-[#8C1D40]/10 flex items-center justify-center text-xl">🌟</div>
        <div>
          <p className="font-bold text-zinc-800 text-sm">{partner.name}</p>
          <p className="text-zinc-400 text-xs">MAT 265 partner · Active today</p>
        </div>
        <div className="ml-auto w-2 h-2 rounded-full bg-green-400" />
      </div>

      <div className="flex-1 overflow-y-auto flex flex-col gap-3 pb-2" style={{ maxHeight: "320px" }}>
        {messages.map((msg, i) => (
          <div key={i} className={`flex flex-col ${msg.from === "me" ? "items-end" : "items-start"}`}>
            <div
              className={`max-w-[75%] rounded-2xl px-3 py-2 text-sm leading-relaxed ${
                msg.from === "me"
                  ? "bg-[#8C1D40] text-white rounded-br-sm"
                  : "bg-white border border-zinc-100 text-zinc-700 rounded-bl-sm"
              }`}
            >
              {msg.text}
            </div>
            <span className="text-[10px] text-zinc-400 mt-1 px-1">{msg.time}</span>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      <div className="flex gap-2 mt-3">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          placeholder="Message Jordan..."
          title="Chat message"
          className="flex-1 bg-white border border-zinc-200 rounded-xl px-3 py-2.5 text-sm text-zinc-700 placeholder-zinc-400 focus:outline-none focus:border-[#8C1D40]/40 transition-colors"
        />
        <button
          type="button"
          onClick={handleSend}
          disabled={!input.trim()}
          className="bg-[#8C1D40] text-white rounded-xl px-4 font-bold text-sm disabled:opacity-40 hover:bg-[#6b1530] transition-colors"
        >
          →
        </button>
      </div>
    </div>
  );
}

// ── Tab 3: AI Help ────────────────────────────────────────────────────────────
type AIMessage = { role: "user" | "assistant"; content: string };

const SUGGESTIONS = [
  "Where can I get math tutoring?",
  "I'm struggling with writing an essay",
  "I feel overwhelmed and stressed",
  "I'm not sure I picked the right major",
];

function AIHelpTab() {
  const [messages, setMessages] = useState<AIMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

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
      const res = await fetch("/api/ai-help", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: updated }),
      });
      const data = await res.json();
      setMessages(prev => [...prev, { role: "assistant", content: data.reply }]);
    } catch {
      setMessages(prev => [...prev, { role: "assistant", content: "Sorry, I couldn't connect right now. Try again!" }]);
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
          <p className="text-zinc-400 text-xs">Finds the right ASU resource for you</p>
        </div>
      </div>

      {messages.length === 0 && (
        <div className="flex flex-col gap-2 mb-3">
          <p className="text-xs text-zinc-400 font-semibold uppercase tracking-wide px-1">Try asking...</p>
          {SUGGESTIONS.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => handleSend(s)}
              className="text-left bg-white border border-zinc-200 hover:border-[#8C1D40]/30 rounded-xl px-3 py-2.5 text-sm text-zinc-600 hover:bg-[#8C1D40]/5 transition-all"
            >
              {s}
            </button>
          ))}
        </div>
      )}

      <div className="flex-1 overflow-y-auto flex flex-col gap-3 pb-2" style={{ maxHeight: "280px" }}>
        {messages.map((msg, i) => (
          <div key={i} className={`flex flex-col ${msg.role === "user" ? "items-end" : "items-start"}`}>
            <div
              className={`max-w-[85%] rounded-2xl px-3 py-2.5 text-sm leading-relaxed ${
                msg.role === "user"
                  ? "bg-[#8C1D40] text-white rounded-br-sm"
                  : "bg-[#FFC627]/20 border border-[#FFC627]/40 text-zinc-700 rounded-bl-sm"
              }`}
            >
              {msg.role === "user" ? (
                msg.content
              ) : (
                <ReactMarkdown
                  components={{
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
                      <a
                        href={href}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[#8C1D40] font-semibold underline underline-offset-2 hover:text-[#6b1530]"
                      >
                        {children}
                      </a>
                    ),
                    code: ({ children }) => (
                      <code className="bg-white/60 text-[#8C1D40] rounded px-1 py-0.5 text-xs font-mono">{children}</code>
                    ),
                  }}
                >
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
                <div key={i} className="w-1.5 h-1.5 rounded-full bg-[#8C1D40]/40 animate-bounce" style={{ animationDelay: `${i*0.15}s` }} />
              ))}
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div className="flex gap-2 mt-3">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          placeholder="Ask about ASU resources..."
          title="Ask AI for help"
          className="flex-1 bg-white border border-zinc-200 rounded-xl px-3 py-2.5 text-sm text-zinc-700 placeholder-zinc-400 focus:outline-none focus:border-[#8C1D40]/40 transition-colors"
        />
        <button
          type="button"
          onClick={() => handleSend()}
          disabled={!input.trim() || loading}
          className="bg-[#FFC627] text-[#8C1D40] rounded-xl px-4 font-bold text-sm disabled:opacity-40 hover:bg-yellow-300 transition-colors"
        >
          ✨
        </button>
      </div>
    </div>
  );
}

// ── Main dashboard ────────────────────────────────────────────────────────────
type Tab = "checkin" | "chat" | "ai";

export default function DashboardWidget() {
  const [activeTab, setActiveTab] = useState<Tab>("checkin");
  const [resourceActivated, setResourceActivated] = useState(false);
  const [showMilestonesView, setShowMilestonesView] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  // Badges earned by default + unlocked by actions
  const earnedIds = new Set<string>(["roadmap", "streak_fire"]);
  if (resourceActivated) earnedIds.add("first_step");

  const tabs: { id: Tab; label: string; icon: string }[] = [
    { id: "checkin", label: "Check-in", icon: "🔥" },
    { id: "chat",    label: "Chat",     icon: "💬" },
    { id: "ai",      label: "AI Help",  icon: "✨" },
  ];

  return (
    <div className="h-screen w-full bg-[#8C1D40] flex flex-col overflow-hidden font-sans">

      {/* Header */}
      <div className="flex items-center gap-3 px-5 pt-5 pb-3 shrink-0">

        {/* Clickable avatar */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowProfileMenu((v) => !v)}
            className="w-10 h-10 rounded-full bg-[#FFC627] flex items-center justify-center text-xl shadow hover:ring-2 hover:ring-white/40 transition-all"
            title="Profile"
          >
            {student.avatar}
          </button>

          {/* Profile dropdown */}
          {showProfileMenu && (
            <div className="absolute top-12 left-0 bg-white rounded-2xl shadow-xl border border-zinc-100 py-1 z-50 min-w-[190px]">
              <div className="px-4 py-2.5 border-b border-zinc-100">
                <p className="text-zinc-800 font-bold text-sm">{student.name}</p>
                <p className="text-zinc-400 text-xs">{student.year}</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowMilestonesView(true);
                  setShowProfileMenu(false);
                }}
                className="w-full text-left px-4 py-2.5 text-sm text-zinc-700 hover:bg-[#8C1D40]/5 hover:text-[#8C1D40] font-medium flex items-center gap-2 transition-colors"
              >
                <span>🏅</span>
                Your Milestones
                <span className="ml-auto bg-[#FFC627] text-[#8C1D40] text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                  {earnedIds.size}
                </span>
              </button>
              <button
                type="button"
                onClick={() => setShowProfileMenu(false)}
                className="w-full text-left px-4 py-2.5 text-sm text-zinc-400 hover:bg-zinc-50 flex items-center gap-2 transition-colors"
              >
                <span>⚙️</span>
                Settings
              </button>
            </div>
          )}
        </div>

        <div>
          <p className="text-white/60 text-xs">Welcome back</p>
          <p className="text-white font-bold text-base leading-tight">{student.name} · {student.year}</p>
        </div>
        <div className="ml-auto">
          <span className="bg-[#FFC627] text-[#8C1D40] text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wide">
            BridgeUp
          </span>
        </div>
      </div>

      {/* Milestones full-panel view replaces tabs */}
      {showMilestonesView ? (
        <div className="flex-1 flex flex-col px-5 pb-4 overflow-hidden">
          <MilestonesView earnedIds={earnedIds} onBack={() => setShowMilestonesView(false)} />
        </div>
      ) : (
        <>
          {/* Streaks */}
          <div className="flex gap-2 px-5 pb-4 shrink-0">
            <StreakPill icon="🔥" label="Check-ins"    count={myStreaks.checkin} />
            <StreakPill icon="📚" label="Assignments"  count={myStreaks.assignment} />
            <StreakPill icon="🤝" label="Help-seeking" count={myStreaks.helpSeeking} />
          </div>

          {/* Tab bar */}
          <div className="flex px-5 gap-1 pb-3 shrink-0">
            {tabs.map(tab => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold transition-all ${
                  activeTab === tab.id
                    ? "bg-white text-[#8C1D40]"
                    : "bg-white/10 text-white/60 hover:bg-white/20"
                }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Tab content */}
          <div className="flex-1 bg-zinc-50 rounded-t-3xl overflow-y-auto">
            <div className="p-4 h-full">
              {activeTab === "checkin" && (
                <CheckInTab
                  resourceActivated={resourceActivated}
                  onResourceActivated={() => setResourceActivated(true)}
                />
              )}
              {activeTab === "chat" && <ChatTab />}
              {activeTab === "ai"   && <AIHelpTab />}
            </div>
          </div>
        </>
      )}

      {/* Backdrop to close profile menu */}
      {showProfileMenu && (
        <div className="fixed inset-0 z-40" onClick={() => setShowProfileMenu(false)} />
      )}
    </div>
  );
}
