"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect, Suspense } from "react";
import { supabase, ROOM_ID } from "@/lib/supabase";
import type { Student } from "@/lib/supabase";

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


// ── Main component ────────────────────────────────────────────────────────────
function CourseWidgetInner() {
  const [me, setMe]           = useState<Student | null>(null);
  const [partner, setPartner] = useState<Student | null>(null);
  const [loading, setLoading] = useState(true);

  const [struggling, setStruggling]         = useState(false);
  const [bookingPending, setBookingPending] = useState(false);
  const [calendarDismissed, setCalendarDismissed] = useState(false);

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

  const currentWeek = getSemesterWeek();
  const phase       = getSemesterPhase(currentWeek);

  const courseName = me?.nervous_course ?? "your course";
  const partnerSharesCourse = partner?.nervous_course === me?.nervous_course;

  const showCalendarNudge = phase !== "normal" && !calendarDismissed && !bookingPending;

  if (loading) {
    return <div className="h-screen bg-[#8C1D40] flex items-center justify-center">
      <p className="text-white/60 text-sm">Loading…</p>
    </div>;
  }

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
        <p className="text-white font-bold text-base">{courseName}</p>
        {me && <p className="text-white/70 text-xs">{me.name}</p>}
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto flex flex-col gap-4 p-4">

        {/* Calendar nudge (midterm / finals) */}
        {showCalendarNudge && (
          <CalendarNudge
            phase={phase}
            courseCode={courseName}
            onDismiss={() => setCalendarDismissed(true)}
          />
        )}

        {/* Struggling signal sent */}
        {struggling && !bookingPending && (
          <div className="bg-[#8C1D40]/8 border border-[#8C1D40]/20 rounded-2xl p-4 flex gap-3">
            <span className="text-xl">😮‍💨</span>
            <div>
              <p className="text-[#8C1D40] font-semibold text-sm">
                Signal sent{partner ? ` to ${partner.name}` : ""}
              </p>
              <p className="text-zinc-500 text-xs mt-0.5">A resource card has been surfaced for both of you.</p>
            </div>
          </div>
        )}

        {/* Peer usage social proof — always visible once a course is loaded */}
        {me && (
          <div className="flex items-center gap-2.5 bg-white rounded-2xl border border-zinc-100 shadow-sm px-4 py-3">
            <div className="flex -space-x-1.5">
              {["🧑‍💻","👩‍🔬","🧑‍🎨"].map((e, i) => (
                <div key={i} className="w-6 h-6 rounded-full bg-[#8C1D40]/10 flex items-center justify-center text-xs border border-white">{e}</div>
              ))}
            </div>
            <p className="text-zinc-600 text-xs leading-tight">
              <span className="font-semibold text-zinc-800">14 students</span> from {courseName.split("—")[0].trim()} used ASN this week.
            </p>
          </div>
        )}

        {/* Resource nudge card */}
        {struggling && !bookingPending && (
          <div className="bg-[#FFC627] rounded-2xl p-4 shadow-sm">
            <p className="text-[10px] font-semibold text-[#8C1D40] uppercase tracking-widest mb-1">
              Suggested Resource
            </p>
            <p className="text-zinc-800 font-bold text-sm mb-1">ASN Subject Tutoring</p>
            <p className="text-zinc-700 text-xs mb-1">
              <span className="font-medium text-[#8C1D40]">Academic Support Network</span>
            </p>
            <p className="text-zinc-700 text-xs mb-3">
              Free drop-in tutoring for {courseName}.
              {partnerSharesCourse && partner ? ` ${partner.name} can join you — walk in together.` : ""}
            </p>
            <button
              type="button"
              onClick={() => setBookingPending(true)}
              className="w-full bg-[#8C1D40] text-white font-bold rounded-xl py-2.5 text-sm hover:bg-[#6b1530] transition-colors"
            >
              Book {courseName} Tutor →
            </button>
          </div>
        )}

        {bookingPending && (
          <div className="flex flex-col gap-3">
            <div className="bg-[#8C1D40]/8 border border-[#8C1D40]/20 rounded-2xl p-4 flex gap-3">
              <span className="text-xl">⏳</span>
              <div>
                <p className="text-[#8C1D40] font-semibold text-sm">Booking request sent</p>
                <p className="text-zinc-500 text-xs mt-0.5">Pending confirmation from ASN.</p>
              </div>
            </div>
            {/* Drop-in follow-up */}
            <div className="bg-white rounded-2xl border border-zinc-200 p-4 flex flex-col gap-2.5">
              <div className="flex items-center gap-2">
                <span className="text-base">🚪</span>
                <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Can&apos;t wait? Drop in today</p>
              </div>
              <p className="text-zinc-800 font-bold text-sm">ASN is open 2–6 PM — no appointment needed</p>
              <p className="text-zinc-500 text-xs leading-relaxed">
                Just walk in. You don&apos;t need to schedule anything — drop-in is first come, first served.
              </p>
              <div className="flex items-center gap-1.5 bg-zinc-50 rounded-xl px-3 py-2">
                <span className="text-sm">🧑‍🎓</span>
                <p className="text-zinc-500 text-xs">
                  <span className="font-semibold text-zinc-700">14 students</span> from your courses visited ASN this week.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Partner in this course */}
        <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-4">
          <p className="text-[10px] font-semibold text-zinc-400 uppercase tracking-widest mb-3">
            Partner in This Course
          </p>
          {partnerSharesCourse && partner ? (
            <>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#8C1D40]/10 flex items-center justify-center text-xl">
                  {partner.avatar}
                </div>
                <div className="flex-1">
                  <p className="font-bold text-zinc-800 text-sm">{partner.name}</p>
                  <p className="text-zinc-500 text-xs">{partner.nervous_course}</p>
                </div>
              </div>
              {!struggling && (
                <button
                  type="button"
                  onClick={() => setStruggling(true)}
                  className="mt-3 w-full flex items-center justify-center gap-2 border-2 border-dashed border-[#8C1D40]/30 hover:border-[#8C1D40] rounded-xl py-2.5 text-[#8C1D40] font-semibold text-sm transition-all hover:bg-[#8C1D40]/5"
                >
                  <span>😮‍💨</span>
                  I&apos;m struggling too.
                </button>
              )}
            </>
          ) : (
            <p className="text-zinc-400 text-sm text-center py-2">
              {partner
                ? `Your partner is in a different course (${partner.nervous_course ?? "unknown"}).`
                : "No partner yet."}
            </p>
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
    </div>
  );
}

// ── Page export ───────────────────────────────────────────────────────────────
export default function CourseWidget() {
  return (
    <Suspense fallback={<div className="h-screen bg-[#8C1D40]" />}>
      <CourseWidgetInner />
    </Suspense>
  );
}
