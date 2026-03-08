"use client";

import { useState } from "react";
import { motion } from "framer-motion";

interface Props {
  onSubmit: (timeoutSeconds: number, gracePeriod: number) => Promise<void>;
  loading: boolean;
}

export default function CreateWill({ onSubmit, loading }: Props) {
  const [timeoutDays, setTimeoutDays] = useState("90");
  const [graceDays, setGraceDays] = useState("7");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const timeout = parseInt(timeoutDays) * 86400;
    const grace = parseInt(graceDays) * 86400;
    await onSubmit(timeout, grace);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="text-center mb-8">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200, delay: 0.1 }}
          className="w-16 h-16 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center mx-auto mb-4"
        >
          <svg viewBox="0 0 24 24" fill="none" className="w-8 h-8 text-purple-400" stroke="currentColor" strokeWidth="1.5">
            <path d="M12 4.5v15m7.5-7.5h-15" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </motion.div>
        <h2 className="text-2xl font-bold text-white mb-2">Create Your Will</h2>
        <p className="text-zinc-500 text-sm max-w-sm mx-auto">
          Set up your dead man&apos;s switch. If you stop checking in, your
          beneficiaries can claim their designated share.
        </p>
      </div>

      <div className="glass-card gradient-border rounded-2xl p-6 sm:p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="flex items-center justify-between text-sm text-zinc-300 mb-2">
              <span className="font-medium">Timeout Period</span>
              <span className="text-xs text-zinc-600">Min: 1 day</span>
            </label>
            <div className="relative">
              <input
                type="number"
                min="1"
                value={timeoutDays}
                onChange={(e) => setTimeoutDays(e.target.value)}
                className="w-full bg-zinc-900/80 border border-zinc-800 rounded-xl px-4 py-3.5 text-white text-lg font-medium focus:border-purple-500 transition-all pr-16"
                placeholder="90"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-zinc-500 font-medium">
                days
              </span>
            </div>
            <p className="text-xs text-zinc-600 mt-2 flex items-center gap-1.5">
              <svg viewBox="0 0 24 24" fill="none" className="w-3.5 h-3.5 shrink-0" stroke="currentColor" strokeWidth="1.5">
                <path d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              How long without a check-in before the switch activates
            </p>
          </div>

          <div>
            <label className="flex items-center justify-between text-sm text-zinc-300 mb-2">
              <span className="font-medium">Grace Period</span>
              <span className="text-xs text-zinc-600">Min: 1 day</span>
            </label>
            <div className="relative">
              <input
                type="number"
                min="1"
                value={graceDays}
                onChange={(e) => setGraceDays(e.target.value)}
                className="w-full bg-zinc-900/80 border border-zinc-800 rounded-xl px-4 py-3.5 text-white text-lg font-medium focus:border-purple-500 transition-all pr-16"
                placeholder="7"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-zinc-500 font-medium">
                days
              </span>
            </div>
            <p className="text-xs text-zinc-600 mt-2 flex items-center gap-1.5">
              <svg viewBox="0 0 24 24" fill="none" className="w-3.5 h-3.5 shrink-0" stroke="currentColor" strokeWidth="1.5">
                <path d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Additional buffer after timeout before beneficiaries can claim
            </p>
          </div>

          <div className="pt-2">
            <motion.button
              type="submit"
              disabled={loading}
              whileHover={{ scale: loading ? 1 : 1.01 }}
              whileTap={{ scale: loading ? 1 : 0.98 }}
              className="w-full bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-500 hover:to-violet-500 disabled:from-zinc-700 disabled:to-zinc-700 text-white font-semibold py-4 rounded-xl transition-all shadow-lg shadow-purple-600/20 hover:shadow-purple-600/30 disabled:shadow-none text-base"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                  </svg>
                  Creating Will...
                </span>
              ) : (
                "Create Will"
              )}
            </motion.button>
          </div>
        </form>
      </div>

      <div className="mt-6 grid grid-cols-3 gap-3">
        {[
          { label: "Trustless", desc: "No intermediaries" },
          { label: "On-Chain", desc: "Fully transparent" },
          { label: "Secure", desc: "PDA-protected vault" },
        ].map((item, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 + i * 0.1 }}
            className="text-center p-3 rounded-xl bg-zinc-900/50 border border-zinc-800/50"
          >
            <div className="text-xs font-semibold text-zinc-300">{item.label}</div>
            <div className="text-[10px] text-zinc-600 mt-0.5">{item.desc}</div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
