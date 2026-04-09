"use client";

import { useState } from "react";

const AVATARS = ["🌵", "🦋", "🌟", "🔥", "🌊", "🦅", "🌸", "⚡", "🎯", "🌙"];

const COMFORT_LABELS: Record<number, { label: string; desc: string; color: string }> = {
  1: { label: "Very uncomfortable", desc: "Asking for help feels really hard right now", color: "#ef4444" },
  2: { label: "Uncomfortable",      desc: "I usually try to figure things out alone",    color: "#f97316" },
  3: { label: "Neutral",            desc: "Sometimes I ask, sometimes I don't",          color: "#eab308" },
  4: { label: "Comfortable",        desc: "I'm okay reaching out when I need to",        color: "#22c55e" },
  5: { label: "Very comfortable",   desc: "I have no problem asking for help",           color: "#16a34a" },
};

// ── Step indicators ─────────────────────────────────────────────────────────
function StepIndicators({ step }: { step: number }) {
  return (
    <div className="flex items-center gap-2 justify-center mb-6">
      {[1, 2, 3].map((s) => (
        <div key={s} className="flex items-center gap-2">
          <div
            className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
              s < step
                ? "bg-[#FFC627] text-[#8C1D40]"
                : s === step
                ? "bg-white text-[#8C1D40]"
                : "bg-white/20 text-white/40"
            }`}
          >
            {s < step ? "✓" : s}
          </div>
          {s < 3 && (
            <div className={`w-8 h-0.5 ${s < step ? "bg-[#FFC627]" : "bg-white/20"}`} />
          )}
        </div>
      ))}
    </div>
  );
}

// ── Step 1: Avatar + Name ────────────────────────────────────────────────────
function Step1({
  selectedAvatar, setSelectedAvatar, name, setName, onNext,
}: {
  selectedAvatar: string;
  setSelectedAvatar: (v: string) => void;
  name: string;
  setName: (v: string) => void;
  onNext: () => void;
}) {
  return (
    <div className="flex flex-col gap-5 flex-1">
      <div>
        <h2 className="text-white font-bold text-lg leading-tight">Create your identity</h2>
        <p className="text-white/60 text-xs mt-1">
          This is how your accountability partner will see you.
        </p>
      </div>

      <div className="flex flex-col items-center gap-2">
        <div className="w-20 h-20 rounded-full bg-[#FFC627] flex items-center justify-center text-4xl shadow-lg">
          {selectedAvatar}
        </div>
        <p className="text-white/50 text-xs">Choose your avatar</p>
      </div>

      <div className="grid grid-cols-5 gap-2">
        {AVATARS.map((emoji) => (
          <button
            key={emoji}
            type="button"
            onClick={() => setSelectedAvatar(emoji)}
            className={`h-12 rounded-xl text-2xl transition-all ${
              selectedAvatar === emoji
                ? "bg-[#FFC627] scale-110 shadow-md"
                : "bg-white/10 hover:bg-white/20"
            }`}
          >
            {emoji}
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-white/70 text-xs font-semibold uppercase tracking-wide">
          First name
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

      <button
        type="button"
        onClick={onNext}
        disabled={!name.trim()}
        className="mt-auto w-full bg-[#FFC627] text-[#8C1D40] font-bold rounded-xl py-3 text-sm transition-all disabled:opacity-40 hover:bg-yellow-300"
      >
        Next →
      </button>
    </div>
  );
}

// ── Step 2: Comfort scale ────────────────────────────────────────────────────
function Step2({
  comfort, setComfort, onBack, onNext,
}: {
  comfort: number;
  setComfort: (v: number) => void;
  onBack: () => void;
  onNext: () => void;
}) {
  const info = COMFORT_LABELS[comfort];
  return (
    <div className="flex flex-col gap-5 flex-1">
      <div>
        <h2 className="text-white font-bold text-lg leading-tight">
          How comfortable are you asking for help?
        </h2>
        <p className="text-white/60 text-xs mt-1">
          This is private — only BridgeUp uses it to nudge you at the right time.
        </p>
      </div>

      <div className="flex items-center gap-2 bg-white/10 rounded-xl px-4 py-2.5">
        <span className="text-lg">🔒</span>
        <p className="text-white/70 text-xs">
          Your comfort level is never visible to your partner or advisors.
        </p>
      </div>

      <div className="flex flex-col items-center gap-3 py-4">
        <div
          className="w-20 h-20 rounded-full flex items-center justify-center text-4xl font-black shadow-lg transition-all"
          style={{ background: info.color }}
        >
          {comfort}
        </div>
        <p className="text-white font-bold text-base">{info.label}</p>
        <p className="text-white/60 text-xs text-center px-4">{info.desc}</p>
      </div>

      <div className="flex flex-col gap-2">
        <input
          type="range"
          min={1}
          max={5}
          value={comfort}
          title="Comfort level"
          onChange={(e) => setComfort(Number(e.target.value))}
          className="w-full accent-[#FFC627] cursor-pointer"
        />
        <div className="flex justify-between text-white/40 text-[10px]">
          <span>Very uncomfortable</span>
          <span>Very comfortable</span>
        </div>
      </div>

      <div className="flex gap-3 mt-auto">
        <button
          type="button"
          onClick={onBack}
          className="flex-1 bg-white/10 text-white font-semibold rounded-xl py-3 text-sm hover:bg-white/20 transition-colors"
        >
          ← Back
        </button>
        <button
          type="button"
          onClick={onNext}
          className="flex-[2] bg-[#FFC627] text-[#8C1D40] font-bold rounded-xl py-3 text-sm hover:bg-yellow-300 transition-colors"
        >
          Next →
        </button>
      </div>
    </div>
  );
}

// ── Step 3: Partner match reveal ─────────────────────────────────────────────
function Step3({
  selectedAvatar, name,
}: {
  selectedAvatar: string;
  name: string;
}) {
  const [done, setDone] = useState(false);

  return (
    <div className="flex flex-col gap-5 flex-1">
      <div>
        <h2 className="text-white font-bold text-lg leading-tight">
          {!done ? "Finding your partner..." : "You're matched! 🎉"}
        </h2>
        <p className="text-white/60 text-xs mt-1">
          {!done
            ? "Matching you with a peer in your shared course."
            : "You and Jordan are both in MAT 265."}
        </p>
      </div>

      {!done ? (
        <div className="flex flex-col items-center gap-6 py-8">
          <div className="flex items-center gap-4">
            <div className="flex flex-col items-center gap-2">
              <div className="w-16 h-16 rounded-full bg-[#FFC627] flex items-center justify-center text-3xl">
                {selectedAvatar}
              </div>
              <p className="text-white text-xs font-semibold">{name}</p>
            </div>

            <div className="flex gap-1">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="w-2 h-2 rounded-full bg-white/40 animate-bounce"
                  style={{ animationDelay: `${i * 0.15}s` }}
                />
              ))}
            </div>

            <div className="flex flex-col items-center gap-2">
              <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center text-3xl blur-sm">
                🌟
              </div>
              <p className="text-white/30 text-xs font-semibold">???</p>
            </div>
          </div>

          <p className="text-white/50 text-xs text-center">
            Scanning shared courses · MAT 265, CSE 110...
          </p>

          <button
            type="button"
            onClick={() => setDone(true)}
            className="bg-white/10 hover:bg-white/20 text-white text-xs px-6 py-2 rounded-full transition-colors"
          >
            Reveal match →
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          <div className="bg-white rounded-2xl p-5 flex flex-col items-center gap-3 shadow-lg">
            <div className="flex items-center gap-6">
              <div className="flex flex-col items-center gap-1">
                <div className="w-14 h-14 rounded-full bg-[#FFC627] flex items-center justify-center text-2xl">
                  {selectedAvatar}
                </div>
                <p className="text-xs font-bold text-zinc-700">{name}</p>
              </div>
              <div className="flex flex-col items-center gap-1">
                <span className="text-2xl">🤝</span>
                <span className="text-[10px] text-zinc-400">matched</span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <div className="w-14 h-14 rounded-full bg-[#8C1D40]/10 flex items-center justify-center text-2xl">
                  🌟
                </div>
                <p className="text-xs font-bold text-zinc-700">Jordan</p>
              </div>
            </div>

            <div className="bg-zinc-50 rounded-xl px-4 py-2.5 w-full text-center">
              <p className="text-[10px] text-zinc-400 font-semibold uppercase tracking-wide mb-0.5">
                Shared course
              </p>
              <p className="text-sm font-bold text-zinc-700">MAT 265 — Calculus for Engineers</p>
            </div>
          </div>

          <div className="bg-white/10 rounded-2xl p-4 flex flex-col gap-3">
            <p className="text-white/70 text-xs font-semibold uppercase tracking-wide">
              Jordan shared...
            </p>
            <div className="flex gap-2 items-start">
              <span>🎉</span>
              <p className="text-white text-xs">
                <strong>Excited about:</strong> Finally understanding integrals
              </p>
            </div>
            <div className="flex gap-2 items-start">
              <span>😬</span>
              <p className="text-white text-xs">
                <strong>Nervous about:</strong> The midterm in Week 8
              </p>
            </div>
          </div>

          <div className="bg-[#FFC627] rounded-2xl p-4 flex gap-3 items-center">
            <span className="text-2xl">🗺️</span>
            <div>
              <p className="text-[#8C1D40] font-bold text-sm">First milestone unlocked!</p>
              <p className="text-[#8C1D40]/70 text-xs">Run your DARS audit to set up your roadmap.</p>
            </div>
          </div>
        </div>
      )}

      {done && (
        <button
          type="button"
          onClick={() => {
            localStorage.setItem("bridgeup_onboarded", "true");
            window.location.href = "/widget/dashboard";
          }}
          className="mt-auto w-full bg-[#FFC627] text-[#8C1D40] font-bold rounded-xl py-3 text-sm hover:bg-yellow-300 transition-colors"
        >
          Go to my dashboard →
        </button>
      )}
    </div>
  );
}

// ── Main page ────────────────────────────────────────────────────────────────
export default function Onboarding() {
  const [step, setStep] = useState(1);
  const [selectedAvatar, setSelectedAvatar] = useState("🌵");
  const [name, setName] = useState("");
  const [comfort, setComfort] = useState(3);

  return (
    <div className="h-screen w-full bg-[#8C1D40] flex flex-col p-5 overflow-hidden font-sans">
      <div className="flex-shrink-0 mb-4">
        <span className="bg-[#FFC627] text-[#8C1D40] text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wide">
          BridgeUp
        </span>
        <p className="text-white font-bold text-base mt-2">Welcome to BridgeUp</p>
        <p className="text-white/50 text-xs">Let&apos;s set you up in 3 minutes.</p>
      </div>

      <StepIndicators step={step} />

      <div className="flex-1 overflow-y-auto flex flex-col">
        {step === 1 && (
          <Step1
            selectedAvatar={selectedAvatar}
            setSelectedAvatar={setSelectedAvatar}
            name={name}
            setName={setName}
            onNext={() => setStep(2)}
          />
        )}
        {step === 2 && (
          <Step2
            comfort={comfort}
            setComfort={setComfort}
            onBack={() => setStep(1)}
            onNext={() => setStep(3)}
          />
        )}
        {step === 3 && (
          <Step3
            selectedAvatar={selectedAvatar}
            name={name}
          />
        )}
      </div>
    </div>
  );
}
