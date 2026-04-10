"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect } from "react";
import { supabase, ROOM_ID } from "@/lib/supabase";
import type { Student } from "@/lib/supabase";

const AVATARS = ["🦊", "🌵", "⚡", "🌊", "🏔️", "🍌", "🦋", "🌸", "🌙", "🎯"];

const COURSES = [
  "MAT 265 — Calculus for Engineers",
  "ENG 101 — English Composition",
  "CSE 110 — Principles of Programming",
  "BIO 181 — General Biology",
  "CHM 113 — General Chemistry",
  "ECN 211 — Macroeconomic Principles",
  "Not sure yet",
];

const GOALS = [
  "Keeping up with coursework",
  "Understanding the material",
  "Managing stress",
  "Knowing where to go for help",
  "Staying motivated",
  "Something else",
];

const COMFORT_SCALE = [
  { emoji: "😟", label: "Not at all",       value: 1 },
  { emoji: "😕", label: "A little hard",    value: 2 },
  { emoji: "😐", label: "Sometimes okay",   value: 3 },
  { emoji: "🙂", label: "Usually fine",     value: 4 },
  { emoji: "😊", label: "Very comfortable", value: 5 },
];

const CHECKIN_DAYS = [
  { id: "monday",    label: "Monday morning" },
  { id: "wednesday", label: "Wednesday evening" },
  { id: "friday",    label: "Friday afternoon" },
];

// ── Step indicators ────────────────────────────────────────────────────────────
function StepIndicators({ step, total }: { step: number; total: number }) {
  return (
    <div className="flex items-center gap-1.5 justify-center mb-6">
      {Array.from({ length: total }, (_, i) => i + 1).map((s) => (
        <div key={s} className="flex items-center gap-1.5">
          <div className={`rounded-full transition-all ${
            s < step  ? "w-5 h-5 bg-[#FFC627] flex items-center justify-center text-[9px] font-bold text-[#8C1D40]"
            : s === step ? "w-5 h-5 bg-white flex items-center justify-center text-[9px] font-bold text-[#8C1D40]"
            : "w-2 h-2 bg-white/20"
          }`}>
            {s <= step && (s < step ? "✓" : s)}
          </div>
          {s < total && <div className={`h-0.5 w-4 ${s < step ? "bg-[#FFC627]" : "bg-white/20"}`} />}
        </div>
      ))}
    </div>
  );
}

// ── Screen 1: Welcome + name ───────────────────────────────────────────────────
function Screen1({ name, setName, onNext }: {
  name: string; setName: (v: string) => void; onNext: () => void;
}) {
  return (
    <div className="flex flex-col flex-1 gap-5">
      <div className="flex-1 flex flex-col justify-center gap-5">
        <div className="flex flex-col gap-3">
          <h2 className="text-white font-bold text-2xl leading-snug">
            Welcome to BridgeUp{name.trim() ? `, ${name.trim()}` : ""}.
          </h2>
          <p className="text-white/70 text-sm leading-relaxed">
            College is hard — for everyone. BridgeUp pairs you with a fellow
            student in one of your classes so you don&apos;t have to figure it out alone.
          </p>
          <p className="text-white/70 text-sm leading-relaxed">
            Takes 3 minutes to set up. You can opt out any time.
          </p>
        </div>

        {/* Name input */}
        <div className="flex flex-col gap-1.5">
          <label className="text-white/70 text-xs font-semibold uppercase tracking-wide">
            What&apos;s your first name?
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Maria"
            title="Your first name"
            className="bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/30 text-sm focus:outline-none focus:border-[#FFC627] transition-colors"
          />
        </div>

        <div className="bg-white/10 rounded-2xl p-4 flex flex-col gap-2.5">
          {[
            { icon: "🎓", text: "Matched with a peer in your class" },
            { icon: "📍", text: "Nudged when you might need support" },
            { icon: "🔒", text: "Your private answers stay private — always" },
          ].map(({ icon, text }) => (
            <div key={text} className="flex items-center gap-3">
              <span className="text-lg">{icon}</span>
              <p className="text-white/80 text-xs">{text}</p>
            </div>
          ))}
        </div>
      </div>

      <button type="button" onClick={onNext} disabled={!name.trim()}
        className="w-full bg-[#FFC627] text-[#8C1D40] font-bold rounded-xl py-3 text-sm hover:bg-yellow-300 transition-colors disabled:opacity-40">
        Let&apos;s go →
      </button>
    </div>
  );
}

// ── Screen 2: Avatar ───────────────────────────────────────────────────────────
function Screen2({ selectedAvatar, setSelectedAvatar, onBack, onNext }: {
  selectedAvatar: string; setSelectedAvatar: (v: string) => void;
  onBack: () => void; onNext: () => void;
}) {
  return (
    <div className="flex flex-col flex-1 gap-5">
      <div>
        <h2 className="text-white font-bold text-lg leading-tight">Build your identity</h2>
        <p className="text-white/60 text-xs mt-1">This is how your accountability partner sees you.</p>
      </div>

      <div className="flex flex-col items-center gap-2">
        <div className="w-20 h-20 rounded-full bg-[#FFC627] flex items-center justify-center text-4xl shadow-lg transition-all">
          {selectedAvatar}
        </div>
        <p className="text-white/50 text-xs">Pick your avatar</p>
      </div>

      <div className="grid grid-cols-5 gap-2">
        {AVATARS.map((emoji) => (
          <button key={emoji} type="button" onClick={() => setSelectedAvatar(emoji)}
            className={`h-12 rounded-xl text-2xl transition-all ${
              selectedAvatar === emoji ? "bg-[#FFC627] scale-110 shadow-md" : "bg-white/10 hover:bg-white/20"
            }`}>
            {emoji}
          </button>
        ))}
      </div>

      <p className="text-white/30 text-[10px] text-center -mt-2">More styles unlocked as you earn milestones</p>

      <div className="flex gap-3 mt-auto">
        <button type="button" onClick={onBack}
          className="flex-1 bg-white/10 text-white font-semibold rounded-xl py-3 text-sm hover:bg-white/20 transition-colors">
          ← Back
        </button>
        <button type="button" onClick={onNext}
          className="flex-[2] bg-[#FFC627] text-[#8C1D40] font-bold rounded-xl py-3 text-sm hover:bg-yellow-300 transition-colors">
          Next →
        </button>
      </div>
    </div>
  );
}

// ── Screen 3: Your situation ───────────────────────────────────────────────────
function Screen3({
  nervousCourse, setNervousCourse, goal, setGoal, excited, setExcited, onBack, onNext,
}: {
  nervousCourse: string; setNervousCourse: (v: string) => void;
  goal: string;          setGoal: (v: string) => void;
  excited: string;       setExcited: (v: string) => void;
  onBack: () => void;    onNext: () => void;
}) {
  return (
    <div className="flex flex-col flex-1 gap-5 overflow-y-auto">
      <div>
        <h2 className="text-white font-bold text-lg leading-tight">Help us match you well</h2>
        <p className="text-white/60 text-xs mt-1">3 questions — all low-stakes, no wrong answers.</p>
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-white/80 text-xs font-semibold">
          Which course are you most nervous about this semester?
        </label>
        <div className="relative">
          <select value={nervousCourse} onChange={(e) => setNervousCourse(e.target.value)}
            title="Nervous course"
            className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-[#FFC627] transition-colors appearance-none cursor-pointer">
            <option value="" disabled className="text-zinc-800">Select a course…</option>
            {COURSES.map((c) => <option key={c} value={c} className="text-zinc-800">{c}</option>)}
          </select>
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 pointer-events-none">▾</span>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-white/80 text-xs font-semibold">
          What&apos;s one thing you&apos;re hoping to get better at this semester?
        </label>
        <div className="grid grid-cols-2 gap-2">
          {GOALS.map((g) => (
            <button key={g} type="button" onClick={() => setGoal(g)}
              className={`text-left text-xs px-3 py-2.5 rounded-xl border transition-all ${
                goal === g
                  ? "bg-[#FFC627] border-[#FFC627] text-[#8C1D40] font-bold"
                  : "bg-white/10 border-white/20 text-white/80 hover:bg-white/20"
              }`}>
              {g}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-white/80 text-xs font-semibold">
          One thing you&apos;re excited about this semester.
          <span className="text-white/40 font-normal ml-1">(optional)</span>
        </label>
        <textarea value={excited} onChange={(e) => setExcited(e.target.value)}
          placeholder="e.g. finally taking a class I actually chose…"
          title="Excited about" rows={2}
          className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/30 text-sm resize-none focus:outline-none focus:border-[#FFC627] transition-colors"
        />
        <p className="text-white/30 text-[10px]">Shared with your partner as your opening message.</p>
      </div>

      <div className="flex gap-3 mt-auto">
        <button type="button" onClick={onBack}
          className="flex-1 bg-white/10 text-white font-semibold rounded-xl py-3 text-sm hover:bg-white/20 transition-colors">
          ← Back
        </button>
        <button type="button" onClick={onNext} disabled={!nervousCourse || !goal}
          className="flex-[2] bg-[#FFC627] text-[#8C1D40] font-bold rounded-xl py-3 text-sm hover:bg-yellow-300 transition-colors disabled:opacity-40">
          Next →
        </button>
      </div>
    </div>
  );
}

// ── Screen 4: Comfort scale ────────────────────────────────────────────────────
function Screen4({ comfort, setComfort, onBack, onNext }: {
  comfort: number; setComfort: (v: number) => void;
  onBack: () => void; onNext: () => void;
}) {
  return (
    <div className="flex flex-col flex-1 gap-5">
      <div>
        <h2 className="text-white font-bold text-lg leading-tight">
          This is just for you —<br />your partner never sees this
        </h2>
        <p className="text-white/60 text-xs mt-1">The most important private input.</p>
      </div>

      <div className="flex items-center gap-2 bg-white/10 rounded-xl px-4 py-2.5">
        <span className="text-lg">🔒</span>
        <p className="text-white/70 text-xs">Never shown to your partner, advisors, or faculty.</p>
      </div>

      <div className="flex flex-col gap-4">
        <p className="text-white font-semibold text-sm text-center">
          How comfortable are you asking for help when you&apos;re struggling?
        </p>
        <div className="flex justify-between gap-1">
          {COMFORT_SCALE.map((c) => (
            <button key={c.value} type="button" onClick={() => setComfort(c.value)}
              className={`flex-1 flex flex-col items-center gap-1.5 py-3 rounded-2xl border-2 transition-all ${
                comfort === c.value
                  ? "bg-white/20 border-[#FFC627] scale-105"
                  : "bg-white/5 border-transparent hover:bg-white/10"
              }`}>
              <span className="text-2xl">{c.emoji}</span>
              <span className={`text-[9px] text-center leading-tight font-medium ${
                comfort === c.value ? "text-[#FFC627]" : "text-white/50"
              }`}>{c.label}</span>
            </button>
          ))}
        </div>
        <p className="text-white/60 text-xs text-center px-4">
          {comfort === 1 && "BridgeUp will check in gently — no pressure, ever."}
          {comfort === 2 && "That's okay. BridgeUp will ease you in with low-stakes steps."}
          {comfort === 3 && "Good to know. We'll nudge you at the right moments."}
          {comfort === 4 && "Great. We'll connect you with resources when they're relevant."}
          {comfort === 5 && "Awesome. We'll surface resources and support proactively."}
        </p>
      </div>

      <div className="flex gap-3 mt-auto">
        <button type="button" onClick={onBack}
          className="flex-1 bg-white/10 text-white font-semibold rounded-xl py-3 text-sm hover:bg-white/20 transition-colors">
          ← Back
        </button>
        <button type="button" onClick={onNext}
          className="flex-[2] bg-[#FFC627] text-[#8C1D40] font-bold rounded-xl py-3 text-sm hover:bg-yellow-300 transition-colors">
          Next →
        </button>
      </div>
    </div>
  );
}

// ── Screen 5: Confirm & save ───────────────────────────────────────────────────
function Screen5({
  name, selectedAvatar, nervousCourse, goal, excited, comfort,
  checkinDay, setCheckinDay, onBack,
}: {
  name: string; selectedAvatar: string; nervousCourse: string;
  goal: string; excited: string; comfort: number;
  checkinDay: string; setCheckinDay: (v: string) => void; onBack: () => void;
}) {
  const [saving, setSaving]               = useState(false);
  const [partner, setPartner]             = useState<Student | null>(null);
  const [error, setError]                 = useState("");
  const [partnerRevealed, setPartnerRevealed] = useState(false);

  async function handleFindPartner() {
    setSaving(true);
    setError("");

    // Save this student to Supabase
    const { data, error: insertErr } = await supabase
      .from("students")
      .insert({
        name,
        avatar: selectedAvatar,
        nervous_course: nervousCourse,
        goal,
        excited,
        comfort,
        checkin_day: checkinDay,
        room_id: ROOM_ID,
      })
      .select()
      .single();

    if (insertErr || !data) {
      setError("Couldn't save your profile. Try again.");
      setSaving(false);
      return;
    }

    // Store this student's UUID in localStorage
    localStorage.setItem("bridgeup_student_id", data.id);
    localStorage.setItem("bridgeup_onboarded", "true");

    // Find partner — the other student in the same room
    const { data: others } = await supabase
      .from("students")
      .select("*")
      .eq("room_id", ROOM_ID)
      .neq("id", data.id)
      .order("created_at", { ascending: false })
      .limit(1);

    if (others && others.length > 0) {
      setPartner(others[0] as Student);
    }

    setSaving(false);
    setPartnerRevealed(true);
  }

  function handleGoToDashboard() {
    window.location.href = "/widget/dashboard";
  }

  if (partnerRevealed) {
    return (
      <div className="flex flex-col flex-1 gap-4">
        <div>
          <h2 className="text-white font-bold text-lg leading-tight">
            {partner ? "You're matched! 🎉" : "You're in! 🎉"}
          </h2>
          <p className="text-white/60 text-xs mt-1">
            {partner
              ? `You and ${partner.name} are both in ${nervousCourse.split("—")[0].trim()}.`
              : "Waiting for your partner to join. You'll be matched automatically."}
          </p>
        </div>

        {/* Match card */}
        <div className="bg-white rounded-2xl p-5 flex flex-col items-center gap-3 shadow-lg">
          <div className="flex items-center gap-6">
            <div className="flex flex-col items-center gap-1">
              <div className="w-14 h-14 rounded-full bg-[#FFC627] flex items-center justify-center text-2xl">
                {selectedAvatar}
              </div>
              <p className="text-xs font-bold text-zinc-700">{name}</p>
            </div>
            <div className="flex flex-col items-center gap-1">
              <span className="text-2xl">{partner ? "🤝" : "⏳"}</span>
              <span className="text-[10px] text-zinc-400">{partner ? "matched" : "waiting"}</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <div className={`w-14 h-14 rounded-full flex items-center justify-center text-2xl ${
                partner ? "bg-[#8C1D40]/10" : "bg-zinc-100 blur-sm"
              }`}>
                {partner ? partner.avatar : "❓"}
              </div>
              <p className="text-xs font-bold text-zinc-700">{partner ? partner.name : "???"}</p>
            </div>
          </div>
          <div className="bg-zinc-50 rounded-xl px-4 py-2.5 w-full text-center">
            <p className="text-[10px] text-zinc-400 font-semibold uppercase tracking-wide mb-0.5">Shared course</p>
            <p className="text-sm font-bold text-zinc-700">{nervousCourse}</p>
          </div>
        </div>

        {/* Partner's excited message */}
        {partner?.excited && (
          <div className="bg-white/10 rounded-2xl p-4 flex flex-col gap-2">
            <p className="text-white/70 text-xs font-semibold uppercase tracking-wide">{partner.name} shared...</p>
            <div className="flex gap-2 items-start">
              <span>🎉</span>
              <p className="text-white text-xs"><strong>Excited about:</strong> {partner.excited}</p>
            </div>
          </div>
        )}

        <div className="bg-[#FFC627] rounded-2xl p-4 flex gap-3 items-center">
          <span className="text-2xl">🗺️</span>
          <div>
            <p className="text-[#8C1D40] font-bold text-sm">First milestone unlocked!</p>
            <p className="text-[#8C1D40]/70 text-xs">Run your DARS audit to set up your roadmap.</p>
          </div>
        </div>

        <button type="button" onClick={handleGoToDashboard}
          className="mt-auto w-full bg-[#FFC627] text-[#8C1D40] font-bold rounded-xl py-3 text-sm hover:bg-yellow-300 transition-colors">
          Go to my dashboard →
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1 gap-4">
      <div>
        <h2 className="text-white font-bold text-lg leading-tight">Your setup, confirmed</h2>
        <p className="text-white/60 text-xs mt-1">Here&apos;s what we know about you.</p>
      </div>

      {/* Summary card */}
      <div className="bg-white rounded-2xl p-4 flex flex-col gap-3 shadow-sm">
        {[
          { icon: selectedAvatar, label: "Avatar",       value: name },
          { icon: "📚",           label: "Nervous about", value: nervousCourse },
          { icon: "🎯",           label: "Goal",          value: goal },
        ].map(({ icon, label, value }) => (
          <div key={label} className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-[#8C1D40]/10 flex items-center justify-center text-base shrink-0">
              {icon}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] text-zinc-400 font-semibold uppercase tracking-wide">{label}</p>
              <p className="text-zinc-700 text-xs font-medium truncate">{value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Check-in day */}
      <div className="flex flex-col gap-2">
        <p className="text-white/80 text-xs font-semibold">
          When should we send your weekly check-in reminder?
          <span className="text-white/40 font-normal ml-1">(optional)</span>
        </p>
        <div className="flex flex-col gap-2">
          {CHECKIN_DAYS.map((d) => (
            <button key={d.id} type="button" onClick={() => setCheckinDay(d.id)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl border-2 text-sm font-medium transition-all ${
                checkinDay === d.id
                  ? "bg-[#FFC627]/20 border-[#FFC627] text-white"
                  : "bg-white/5 border-white/20 text-white/60 hover:bg-white/10"
              }`}>
              <span className={`w-3.5 h-3.5 rounded-full border-2 shrink-0 ${
                checkinDay === d.id ? "bg-[#FFC627] border-[#FFC627]" : "border-white/30"
              }`} />
              {d.label}
            </button>
          ))}
        </div>
      </div>

      {error && <p className="text-red-300 text-xs text-center">{error}</p>}

      <div className="flex gap-3 mt-auto">
        <button type="button" onClick={onBack} disabled={saving}
          className="flex-1 bg-white/10 text-white font-semibold rounded-xl py-3 text-sm hover:bg-white/20 transition-colors disabled:opacity-40">
          ← Back
        </button>
        <button type="button" onClick={handleFindPartner} disabled={saving}
          className="flex-[2] bg-[#FFC627] text-[#8C1D40] font-bold rounded-xl py-3 text-sm hover:bg-yellow-300 transition-colors disabled:opacity-60">
          {saving ? "Finding your partner…" : "Find my partner →"}
        </button>
      </div>
    </div>
  );
}

// ── Main page ──────────────────────────────────────────────────────────────────
export default function Onboarding() {
  const [step, setStep] = useState(1);
  const [name, setName]                     = useState("");
  const [selectedAvatar, setSelectedAvatar] = useState("🌵");
  const [nervousCourse, setNervousCourse]   = useState("");
  const [goal, setGoal]                     = useState("");
  const [excited, setExcited]               = useState("");
  const [comfort, setComfort]               = useState(3);
  const [checkinDay, setCheckinDay]         = useState("monday");

  useEffect(() => {
    if (localStorage.getItem("bridgeup_onboarded") === "true") {
      window.location.replace("/widget/dashboard");
    }
  }, []);

  return (
    <div className="h-screen w-full bg-[#8C1D40] flex flex-col p-5 overflow-hidden font-sans">
      <div className="shrink-0 mb-3">
        <span className="bg-[#FFC627] text-[#8C1D40] text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wide">
          BridgeUp
        </span>
      </div>

      <StepIndicators step={step} total={5} />

      <div className="flex-1 overflow-y-auto flex flex-col">
        {step === 1 && <Screen1 name={name} setName={setName} onNext={() => setStep(2)} />}
        {step === 2 && (
          <Screen2 selectedAvatar={selectedAvatar} setSelectedAvatar={setSelectedAvatar}
            onBack={() => setStep(1)} onNext={() => setStep(3)} />
        )}
        {step === 3 && (
          <Screen3
            nervousCourse={nervousCourse} setNervousCourse={setNervousCourse}
            goal={goal} setGoal={setGoal}
            excited={excited} setExcited={setExcited}
            onBack={() => setStep(2)} onNext={() => setStep(4)} />
        )}
        {step === 4 && (
          <Screen4 comfort={comfort} setComfort={setComfort}
            onBack={() => setStep(3)} onNext={() => setStep(5)} />
        )}
        {step === 5 && (
          <Screen5
            name={name} selectedAvatar={selectedAvatar}
            nervousCourse={nervousCourse} goal={goal}
            excited={excited} comfort={comfort}
            checkinDay={checkinDay} setCheckinDay={setCheckinDay}
            onBack={() => setStep(4)} />
        )}
      </div>
    </div>
  );
}
