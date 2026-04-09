"use client";

import { useState } from "react";

// ── Mock data ────────────────────────────────────────────────────────────────
const student = {
  name: "Maria",
  avatar: "🌵",
  year: "Sophomore",
  comfortLevel: 2, // private, 1–5
  milestones: ["roadmap"],
};

const partner = {
  name: "Jordan",
  avatar: "🌟",
  year: "Sophomore",
  sharedCourse: "MAT 265 — Calculus for Engineers",
  checkedInToday: false,
  streaks: { checkin: 4, assignment: 6, helpSeeking: 1 },
};

const myStreaks = { checkin: 5, assignment: 7, helpSeeking: 2 };

const RESOURCE_CARD = {
  title: "ASN Tutoring — MAT 265",
  body: "Jordan tapped 'struggling too' in Calculus. Book a free session together.",
  cta: "Book with Jordan →",
  color: "bg-[#FFC627]",
  textColor: "text-[#1a1a1a]",
  milestone: { emoji: "🎯", label: "First Step Taken!" },
};

// ── Streak pill ───────────────────────────────────────────────────────────────
function StreakPill({
  icon,
  label,
  count,
}: {
  icon: string;
  label: string;
  count: number;
}) {
  return (
    <div className="flex flex-col items-center gap-1 bg-white/10 rounded-xl px-3 py-2 flex-1">
      <span className="text-lg">{icon}</span>
      <span className="text-white font-bold text-base leading-none">{count}</span>
      <span className="text-white/60 text-[10px] text-center leading-tight">{label}</span>
    </div>
  );
}

// ── Milestone toast ───────────────────────────────────────────────────────────
function MilestoneToast({
  emoji,
  label,
  onDismiss,
}: {
  emoji: string;
  label: string;
  onDismiss: () => void;
}) {
  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/40">
      <div className="bg-white rounded-2xl shadow-2xl px-8 py-8 flex flex-col items-center gap-3 mx-4 animate-bounce-in">
        <span className="text-5xl">{emoji}</span>
        <p className="text-[#8C1D40] font-bold text-lg text-center">{label}</p>
        <p className="text-zinc-500 text-sm text-center">
          Jordan has been notified. Help-seeking is a win.
        </p>
        <button
          onClick={onDismiss}
          className="mt-2 bg-[#8C1D40] text-white rounded-full px-6 py-2 font-semibold text-sm hover:bg-[#6b1530] transition-colors"
        >
          Keep Going
        </button>
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function DashboardWidget() {
  const [checkIn, setCheckIn] = useState<string | null>(null);
  const [showResource, setShowResource] = useState(false);
  const [showMilestone, setShowMilestone] = useState(false);
  const [resourceActivated, setResourceActivated] = useState(false);
  const [struggling, setStruggling] = useState(false);

  function handleCheckIn(mood: string) {
    setCheckIn(mood);
    if (mood === "struggling") {
      setTimeout(() => setShowResource(true), 600);
    }
  }

  function handleStruggling() {
    setStruggling(true);
    setTimeout(() => setShowResource(true), 400);
  }

  function handleResourceCTA() {
    setShowResource(false);
    setResourceActivated(true);
    setShowMilestone(true);
  }

  return (
    <div className="h-screen w-full bg-[#8C1D40] flex flex-col overflow-hidden font-sans">

      {/* ── Header ── */}
      <div className="flex items-center gap-3 px-5 pt-5 pb-3">
        <div className="w-10 h-10 rounded-full bg-[#FFC627] flex items-center justify-center text-xl shadow">
          {student.avatar}
        </div>
        <div>
          <p className="text-white/60 text-xs">Welcome back</p>
          <p className="text-white font-bold text-base leading-tight">
            {student.name} · {student.year}
          </p>
        </div>
        <div className="ml-auto">
          <span className="bg-[#FFC627] text-[#8C1D40] text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wide">
            BridgeUp
          </span>
        </div>
      </div>

      {/* ── Streaks ── */}
      <div className="flex gap-2 px-5 pb-4">
        <StreakPill icon="🔥" label="Check-ins" count={myStreaks.checkin} />
        <StreakPill icon="📚" label="Assignments" count={myStreaks.assignment} />
        <StreakPill icon="🤝" label="Help-seeking" count={myStreaks.helpSeeking} />
      </div>

      {/* ── Scrollable body ── */}
      <div className="flex-1 bg-zinc-50 rounded-t-3xl overflow-y-auto">
        <div className="flex flex-col gap-4 p-5">

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
                <div
                  className={`w-2.5 h-2.5 rounded-full ${
                    partner.checkedInToday ? "bg-green-400" : "bg-zinc-300"
                  }`}
                />
                <p className="text-[10px] text-zinc-400 mt-1">
                  {partner.checkedInToday ? "Checked in" : "Pending"}
                </p>
              </div>
            </div>

            {/* Partner streaks */}
            <div className="flex gap-3 mt-3 pt-3 border-t border-zinc-100">
              <div className="flex items-center gap-1 text-xs text-zinc-500">
                <span>🔥</span>
                <span>{partner.streaks.checkin} check-ins</span>
              </div>
              <div className="flex items-center gap-1 text-xs text-zinc-500">
                <span>📚</span>
                <span>{partner.streaks.assignment} assignments</span>
              </div>
              <div className="flex items-center gap-1 text-xs text-zinc-500">
                <span>🤝</span>
                <span>{partner.streaks.helpSeeking} help</span>
              </div>
            </div>
          </div>

          {/* Weekly check-in */}
          {!checkIn ? (
            <div className="bg-white rounded-2xl shadow-sm border border-zinc-100 p-4">
              <p className="text-[10px] font-semibold text-zinc-400 uppercase tracking-widest mb-1">
                Weekly Check-in
              </p>
              <p className="text-zinc-700 font-semibold text-sm mb-4">
                How is MAT 265 feeling this week?
              </p>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { mood: "great", emoji: "😊", label: "Great" },
                  { mood: "okay", emoji: "😐", label: "Okay" },
                  { mood: "tough", emoji: "😬", label: "Tough" },
                  { mood: "struggling", emoji: "😓", label: "Really struggling" },
                ].map(({ mood, emoji, label }) => (
                  <button
                    key={mood}
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
            <div className="bg-white rounded-2xl shadow-sm border border-zinc-100 p-4 flex flex-col gap-2">
              <p className="text-[10px] font-semibold text-zinc-400 uppercase tracking-widest">
                Weekly Check-in
              </p>
              <p className="text-zinc-700 text-sm">
                You checked in as{" "}
                <span className="font-semibold text-[#8C1D40]">
                  {checkIn === "great"
                    ? "😊 Great"
                    : checkIn === "okay"
                    ? "😐 Okay"
                    : checkIn === "tough"
                    ? "😬 Tough"
                    : "😓 Really struggling"}
                </span>
              </p>
              {checkIn !== "great" && checkIn !== "okay" && !resourceActivated && (
                <p className="text-xs text-zinc-400">A resource nudge has been surfaced below.</p>
              )}
              {resourceActivated && (
                <p className="text-xs text-green-600 font-medium">
                  🎯 You booked a tutor session. Milestone earned!
                </p>
              )}
            </div>
          )}

          {/* Struggling too button */}
          {!struggling && !showResource && (
            <button
              onClick={handleStruggling}
              className="w-full flex items-center justify-center gap-2 bg-white border-2 border-dashed border-[#8C1D40]/30 hover:border-[#8C1D40] rounded-2xl py-3 text-[#8C1D40] font-semibold text-sm transition-all hover:bg-[#8C1D40]/5"
            >
              <span>😮‍💨</span>
              I`&apos;`m struggling too
            </button>
          )}

          {/* Resource nudge card */}
          {showResource && !resourceActivated && (
            <div className="bg-[#FFC627] rounded-2xl p-4 shadow-sm">
              <p className="text-[10px] font-semibold text-[#8C1D40] uppercase tracking-widest mb-1">
                Resource Nudge
              </p>
              <p className="text-zinc-800 font-bold text-sm mb-1">{RESOURCE_CARD.title}</p>
              <p className="text-zinc-700 text-xs mb-3">{RESOURCE_CARD.body}</p>
              <button
                onClick={handleResourceCTA}
                className="w-full bg-[#8C1D40] text-white font-bold rounded-xl py-2.5 text-sm hover:bg-[#6b1530] transition-colors"
              >
                {RESOURCE_CARD.cta}
              </button>
            </div>
          )}

          {/* Milestones earned */}
          <div className="bg-white rounded-2xl shadow-sm border border-zinc-100 p-4">
            <p className="text-[10px] font-semibold text-zinc-400 uppercase tracking-widest mb-3">
              Your Milestones
            </p>
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <span className="text-lg">🗺️</span>
                <div>
                  <p className="text-sm font-semibold text-zinc-700">Roadmap Unlocked</p>
                  <p className="text-xs text-zinc-400">You ran your first DARS audit</p>
                </div>
              </div>
              {resourceActivated && (
                <div className="flex items-center gap-2 animate-pulse">
                  <span className="text-lg">🎯</span>
                  <div>
                    <p className="text-sm font-semibold text-[#8C1D40]">First Step Taken</p>
                    <p className="text-xs text-zinc-400">You booked your first ASN tutor session</p>
                  </div>
                </div>
              )}
              <div className="flex items-center gap-2 opacity-30">
                <span className="text-lg">✅</span>
                <div>
                  <p className="text-sm font-semibold text-zinc-700">Course Confirmed</p>
                  <p className="text-xs text-zinc-400">Meet with your advisor</p>
                </div>
              </div>
              <div className="flex items-center gap-2 opacity-30">
                <span className="text-lg">💙</span>
                <div>
                  <p className="text-sm font-semibold text-zinc-700">Taking Care of You</p>
                  <p className="text-xs text-zinc-400">Open a Counseling check-in</p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Milestone toast */}
      {showMilestone && (
        <MilestoneToast
          emoji={RESOURCE_CARD.milestone.emoji}
          label={RESOURCE_CARD.milestone.label}
          onDismiss={() => setShowMilestone(false)}
        />
      )}
    </div>
  );
}
