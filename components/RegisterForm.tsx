"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";

type Status = "idle" | "submitting" | "success";

export default function RegisterForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<Status>("idle");
  const [welcomeName, setWelcomeName] = useState("");

  const phoneValid = /^01[3-9]\d{8}$/.test(phone);
  const nameValid = name.trim().length >= 2;

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!nameValid) return setError("Please enter your full name.");
    if (!phoneValid) return setError("Enter an 11-digit mobile number starting with 01.");

    setStatus("submitting");
    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, phone }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Something went wrong.");
      setWelcomeName(data.name);
      setStatus("success");
      setTimeout(() => router.replace("/home"), 1400);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
      setStatus("idle");
    }
  }

  return (
    <div className="glass ring-gradient relative mx-auto w-full max-w-md overflow-hidden rounded-[2rem] p-7 sm:p-9">
      <div aria-hidden className="absolute -right-20 -top-20 h-48 w-48 rounded-full bg-cyan/20 blur-3xl" />

      <AnimatePresence mode="wait">
        {status !== "success" ? (
          <motion.form key="form" onSubmit={onSubmit} exit={{ opacity: 0, scale: 0.96 }} className="relative space-y-5" noValidate>
            <div>
              <h1 className="font-display text-2xl font-bold sm:text-3xl">
                Join <span className="text-electric">Renata Live</span>
              </h1>
              <p className="mt-2 text-sm text-white/65">Register to unlock the quiz, games and the live Cricket World Cup stream.</p>
            </div>

            <Field label="Your name" htmlFor="name">
              <input
                id="name"
                autoComplete="name"
                value={name}
                maxLength={60}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Ayesha Rahman"
                className="w-full bg-transparent px-4 py-3.5 text-base text-white outline-none placeholder:text-white/30"
              />
            </Field>

            <Field label="Mobile number" htmlFor="phone" valid={phoneValid}>
              <span className="flex items-center gap-1.5 border-r border-white/10 pl-4 pr-3 text-sm font-semibold text-white/70">
                <span aria-hidden>🇧🇩</span> +88
              </span>
              <input
                id="phone"
                type="tel"
                inputMode="numeric"
                autoComplete="tel-national"
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 11))}
                placeholder="01XXXXXXXXX"
                className="w-full bg-transparent px-3 py-3.5 text-base tracking-wider text-white outline-none placeholder:tracking-normal placeholder:text-white/30"
              />
            </Field>

            <AnimatePresence>
              {error && (
                <motion.p
                  role="alert"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="rounded-xl border border-red-400/30 bg-red-500/10 px-4 py-2.5 text-sm text-red-200"
                >
                  {error}
                </motion.p>
              )}
            </AnimatePresence>

            <button
              type="submit"
              disabled={status === "submitting"}
              className="btn-primary flex w-full items-center justify-center gap-2 px-6 py-4 font-display text-base font-semibold"
            >
              {status === "submitting" ? (
                <>
                  <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  Registering…
                </>
              ) : (
                <>
                  Enter the Experience <span aria-hidden>→</span>
                </>
              )}
            </button>

            <p className="text-center text-xs text-white/40">By continuing you agree to be contacted by Renata PLC about this campaign.</p>
          </motion.form>
        ) : (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative flex flex-col items-center py-10 text-center"
          >
            <div className="relative mb-6 grid h-24 w-24 place-items-center">
              <span className="absolute inset-0 rounded-full bg-cyan/40 animate-pulse-ring" />
              <span className="absolute inset-0 rounded-full bg-gradient-to-br from-cyan to-electric" />
              <svg viewBox="0 0 24 24" className="relative h-12 w-12" fill="none" stroke="white" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
                <motion.path d="M5 12.5l4.5 4.5L19 7.5" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.5, delay: 0.15 }} />
              </svg>
            </div>
            <h2 className="font-display text-2xl font-bold">Welcome, {welcomeName.split(" ")[0]}!</h2>
            <p className="mt-2 text-white/65">Taking you inside…</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Field({ label, htmlFor, valid, children }: { label: string; htmlFor: string; valid?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label htmlFor={htmlFor} className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-white/55">
        {label}
      </label>
      <div className="relative flex items-center rounded-2xl border border-white/12 bg-navy-950/50 transition focus-within:border-cyan/70 focus-within:shadow-[0_0_0_4px_rgba(56,214,255,0.15)]">
        {children}
        {valid && <span className="absolute right-4 text-cyan">✓</span>}
      </div>
    </div>
  );
}
