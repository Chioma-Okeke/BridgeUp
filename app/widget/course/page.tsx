"use client";

export const dynamic = "force-dynamic";

import { useSearchParams } from "next/navigation";
import { useState, Suspense } from "react";

// ── Semester calendar ─────────────────────────────────────────────────────────
// ASU Spring 2026: classes begin Jan 12, finals week Apr 27 – May 2
const SEMESTER_START = new Date("2026-01-12");
const FINALS_START   = new Date("2026-04-27");
const TOTAL_WEEKS    = 16;

function getSemesterWeek(): number {
  const now = new Date();
  const diffMs = now.getTime() - SEMESTER_START.getTime();
  const week = Math.floor(diffMs / (7 * 24 * 60 * 60 * 1000)) + 1;
  return Math.max(1, Math.min(TOTAL_WEEKS, week));
}

type SemesterPhase = "midterm" | "finals" | "normal";

function getSemesterPhase(week: number): SemesterPhase {
  if (week >= 5 && week <= 8)  return "midterm";  // midterm crunch
  if (week >= 13)              return "finals";   // finals approach (fires now in demo)
  return "normal";
}

function weeksUntilFinals(): number {
  const now = new Date();
  const diffMs = FINALS_START.getTime() - now.getTime();
  return Math.max(0, Math.ceil(diffMs / (7 * 24 * 60 * 60 * 1000)));
}

// ── Mock course data ──────────────────────────────────────────────────────────
type CourseData = {
  name: string;
  code: string;
  streakDrop: boolean;
  nudge: {
    signal: string;
    resource: string;
    description: string;
    cta: string;
    service: string;
    milestone: { emoji: string; label: string };
  };
};

// ── Add your real Canvas course IDs as keys below ────────────────────────────
// Find them in the URL: canvas.asu.edu/courses/XXXXXXXX
const COURSES: Record<string, CourseData> = {
  // REPLACE these keys with your real Canvas course IDs
  "COURSE_ID_1": {
    name: "Calculus for Engineers",
    code: "MAT 265",
    streakDrop: true,
    nudge: {
      signal: "Your assignment streak dropped this week",
      resource: "ASN Subject Tutoring",
      description: "Free drop-in tutoring for MAT 265. Your partner Jordan can join you — walk in together.",
      cta: "Book MAT 265 Tutor →",
      service: "Academic Support Network",
      milestone: { emoji: "🎯", label: "First Step Taken!" },
    },
  },
  "COURSE_ID_2": {
    name: "English Composition",
    code: "ENG 101",
    streakDrop: false,
    nudge: {
      signal: "Jordan mentioned an upcoming essay in their check-in",
      resource: "ASU Writing Center",
      description: "Get help at any stage — brainstorming to final draft. Co-book a session with Jordan.",
      cta: "Book Writing Center →",
      service: "ASU Writing Centers",
      milestone: { emoji: "✍️", label: "Writer's Block Broken!" },
    },
  },
  "COURSE_ID_3": {
    name: "Software Security",
    code: "CSE 545",
    streakDrop: true,
    nudge: {
      signal: "You missed 2 assignments this week",
      resource: "Student Success Center",
      description: "Peer success coaching for class struggles. Your partner can join your first session.",
      cta: "Book Success Coach →",
      service: "Student Success Center",
      milestone: { emoji: "💪", label: "Support Unlocked!" },
    },
  },
};

// ── Calendar nudge card ───────────────────────────────────────────────────────
function CalendarNudge({
  phase,
  courseCode,
  onDismiss,
}: {
  phase: "midterm" | "finals";
  courseCode: string;
  onDismiss: () => void;
}) {
  const isFinals = phase === "finals";
  const weeksLeft = weeksUntilFinals();

  const title = isFinals
    ? `Finals are ${weeksLeft === 0 ? "this week" : `${weeksLeft} week${weeksLeft === 1 ? "" : "s"} away`}`
    : "Midterms are approaching";

  const body = isFinals
    ? `Tutoring spots fill up fast before finals. Book a session for ${courseCode} now — bring Jordan.`
    : `Midterms are 2–3 weeks out. Getting ahead with a tutor now makes a real difference for ${courseCode}.`;

  const icon = isFinals ? "🎓" : "📆";
  const urgency = isFinals ? "bg-[#8C1D40]" : "bg-[#FFC627]";
  const textColor = isFinals ? "text-white" : "text-[#8C1D40]";
  const subColor = isFinals ? "text-white/70" : "text-[#8C1D40]/70";
  const btnBg = isFinals ? "bg-[#FFC627] text-[#8C1D40]" : "bg-[#8C1D40] text-white";

  return (
    <div className={`${urgency} rounded-2xl p-4 shadow-sm`}>
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-xl">{icon}</span>
          <p className={`text-[10px] font-bold uppercase tracking-widest ${subColor}`}>
            {isFinals ? "Finals Alert" : "Midterm Alert"}
          </p>
        </div>
        <button
          type="button"
          onClick={onDismiss}
          className={`${subColor} hover:opacity-100 opacity-60 text-sm font-bold leading-none`}
          title="Dismiss"
        >
          ✕
        </button>
      </div>
      <p className={`font-bold text-sm mb-1 ${textColor}`}>{title}</p>
      <p className={`text-xs mb-3 ${subColor}`}>{body}</p>
      <a
        href="https://tutoring.asu.edu"
        target="_blank"
        rel="noopener noreferrer"
        className={`block w-full text-center ${btnBg} font-bold rounded-xl py-2.5 text-sm hover:opacity-90 transition-opacity`}
      >
        Book ASN Tutoring →
      </a>
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
      <div className="bg-white rounded-2xl shadow-2xl px-8 py-8 flex flex-col items-center gap-3 mx-4">
        <span className="text-5xl">{emoji}</span>
        <p className="text-[#8C1D40] font-bold text-lg text-center">{label}</p>
        <p className="text-zinc-500 text-sm text-center">
          Jordan has been notified. Better together.
        </p>
        <button
          type="button"
          onClick={onDismiss}
          className="mt-2 bg-[#8C1D40] text-white rounded-full px-6 py-2 font-semibold text-sm hover:bg-[#6b1530] transition-colors"
        >
          Nice!
        </button>
      </div>
    </div>
  );
}

// ── Inner component (uses useSearchParams) ────────────────────────────────────
function CourseWidgetInner() {
  const params = useSearchParams();
  const courseId = params.get("courseId") ?? "default";

  const course = COURSES[courseId] ?? COURSES["COURSE_ID_1"];

  const currentWeek = getSemesterWeek();
  const phase       = getSemesterPhase(currentWeek);

  const [activated, setActivated] = useState(false);
  const [showMilestone, setShowMilestone] = useState(false);
  const [struggling, setStruggling] = useState(false);
  const [calendarDismissed, setCalendarDismissed] = useState(false);

  function handleCTA() {
    setActivated(true);
    setShowMilestone(true);
  }

  function handleStruggling() {
    setStruggling(true);
  }

  const showCalendarNudge = phase !== "normal" && !calendarDismissed && !activated;

  return (
    <div className="h-screen w-full bg-zinc-50 flex flex-col overflow-hidden font-sans">

      {/* Header */}
      <div className="bg-[#8C1D40] px-5 pt-5 pb-4">
        <div className="flex items-center justify-between mb-1">
          <span className="bg-[#FFC627] text-[#8C1D40] text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wide">
            BridgeUp
          </span>
          <span className="text-white/50 text-xs">Week {currentWeek}</span>
        </div>
        <p className="text-white font-bold text-base">{course.code}</p>
        <p className="text-white/70 text-xs">{course.name}</p>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto flex flex-col gap-4 p-4">

        {/* Calendar nudge (midterm / finals) — shown first when active */}
        {showCalendarNudge && (
          <CalendarNudge
            phase={phase}
            courseCode={course.code}
            onDismiss={() => setCalendarDismissed(true)}
          />
        )}

        {/* Streak drop signal */}
        {course.streakDrop && !activated && (
          <div className="bg-[#8C1D40]/8 border border-[#8C1D40]/20 rounded-2xl p-4 flex gap-3">
            <span className="text-xl mt-0.5">📉</span>
            <div>
              <p className="text-[#8C1D40] font-semibold text-sm">{course.nudge.signal}</p>
              <p className="text-zinc-500 text-xs mt-0.5">
                BridgeUp detected a struggle signal
              </p>
            </div>
          </div>
        )}

        {/* Struggling signal sent */}
        {struggling && !activated && (
          <div className="bg-[#8C1D40]/8 border border-[#8C1D40]/20 rounded-2xl p-4 flex gap-3">
            <span className="text-xl">😮‍💨</span>
            <div>
              <p className="text-[#8C1D40] font-semibold text-sm">Signal sent to Jordan</p>
              <p className="text-zinc-500 text-xs mt-0.5">A resource card has been surfaced for both of you.</p>
            </div>
          </div>
        )}

        {/* Resource nudge card (streak or struggle) */}
        {(!activated && (course.streakDrop || struggling)) ? (
          <div className="bg-[#FFC627] rounded-2xl p-4 shadow-sm">
            <p className="text-[10px] font-semibold text-[#8C1D40] uppercase tracking-widest mb-1">
              Suggested Resource
            </p>
            <p className="text-zinc-800 font-bold text-sm mb-1">
              {course.nudge.resource}
            </p>
            <p className="text-zinc-700 text-xs mb-1">
              <span className="font-medium text-[#8C1D40]">{course.nudge.service}</span>
            </p>
            <p className="text-zinc-700 text-xs mb-3">{course.nudge.description}</p>
            <button
              type="button"
              onClick={handleCTA}
              className="w-full bg-[#8C1D40] text-white font-bold rounded-xl py-2.5 text-sm hover:bg-[#6b1530] transition-colors"
            >
              {course.nudge.cta}
            </button>
          </div>
        ) : activated ? (
          <div className="bg-green-50 border border-green-200 rounded-2xl p-4 flex gap-3">
            <span className="text-xl">✅</span>
            <div>
              <p className="text-green-700 font-semibold text-sm">Booking confirmed!</p>
              <p className="text-green-600 text-xs mt-0.5">
                Jordan has been invited to join you.
              </p>
            </div>
          </div>
        ) : null}

        {/* Partner status */}
        <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-4">
          <p className="text-[10px] font-semibold text-zinc-400 uppercase tracking-widest mb-3">
            Partner in This Course
          </p>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#8C1D40]/10 flex items-center justify-center text-xl">
              🌟
            </div>
            <div className="flex-1">
              <p className="font-bold text-zinc-800 text-sm">Jordan</p>
              <p className="text-zinc-500 text-xs">Checked in · Feeling &quot;tough&quot; this week</p>
            </div>
          </div>

          {!struggling && (
            <button
              type="button"
              onClick={handleStruggling}
              className="mt-3 w-full flex items-center justify-center gap-2 border-2 border-dashed border-[#8C1D40]/30 hover:border-[#8C1D40] rounded-xl py-2.5 text-[#8C1D40] font-semibold text-sm transition-all hover:bg-[#8C1D40]/5"
            >
              <span>😮‍💨</span>
              I&apos;m struggling too
            </button>
          )}
        </div>

        {/* Semester progress */}
        <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-4">
          <p className="text-[10px] font-semibold text-zinc-400 uppercase tracking-widest mb-2">
            Semester Progress
          </p>
          <div className="flex justify-between mb-1">
            <span className="text-xs text-zinc-500">Week {currentWeek} of {TOTAL_WEEKS}</span>
            <span className={`text-xs font-medium ${
              phase === "finals"  ? "text-[#8C1D40]" :
              phase === "midterm" ? "text-amber-600"  :
              "text-zinc-500"
            }`}>
              {phase === "finals"  ? "Finals season 🎓" :
               phase === "midterm" ? "Midterm crunch 📆" :
               "On track"}
            </span>
          </div>
          <div className="w-full bg-zinc-100 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all ${
                phase === "finals" ? "bg-[#8C1D40]" : "bg-[#FFC627]"
              }`}
              style={{ width: `${(currentWeek / TOTAL_WEEKS) * 100}%` }}
            />
          </div>
          <p className="text-[10px] text-zinc-400 mt-2">
            {phase === "finals"
              ? `Finals in ${weeksUntilFinals()} week${weeksUntilFinals() === 1 ? "" : "s"} — ASN tutoring recommended now.`
              : phase === "midterm"
              ? "Midterms approaching — book a tutor before spots fill up."
              : "ASU Counseling check-in recommended this week."}
          </p>
        </div>

      </div>

      {showMilestone && (
        <MilestoneToast
          emoji={course.nudge.milestone.emoji}
          label={course.nudge.milestone.label}
          onDismiss={() => setShowMilestone(false)}
        />
      )}
    </div>
  );
}

// ── Page export (Suspense required for useSearchParams) ───────────────────────
export default function CourseWidget() {
  return (
    <Suspense fallback={<div className="h-screen bg-[#8C1D40]" />}>
      <CourseWidgetInner />
    </Suspense>
  );
}
