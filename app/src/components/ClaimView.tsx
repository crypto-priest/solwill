"use client";

import { useState } from "react";
import { motion } from "framer-motion";

interface Props {
  loading: boolean;
  onClaim: (willOwner: string) => Promise<void>;
}

export default function ClaimView({ loading, onClaim }: Props) {
  const [ownerAddress, setOwnerAddress] = useState("");

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
          className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-4"
        >
          <svg viewBox="0 0 24 24" fill="none" className="w-8 h-8 text-emerald-400" stroke="currentColor" strokeWidth="1.5">
            <path d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </motion.div>
        <h2 className="text-2xl font-bold text-white mb-2">Claim Inheritance</h2>
        <p className="text-zinc-500 text-sm max-w-sm mx-auto">
          If you are a named beneficiary and the owner&apos;s timeout + grace
          period has elapsed, claim your share here.
        </p>
      </div>

      <div className="glass-card gradient-border rounded-2xl p-6 sm:p-8">
        <div className="space-y-5">
          <div>
            <label className="text-xs text-zinc-500 font-medium mb-2 block uppercase tracking-wider">
              Will Owner Address
            </label>
            <input
              type="text"
              value={ownerAddress}
              onChange={(e) => setOwnerAddress(e.target.value)}
              placeholder="Enter the will owner's wallet address"
              className="w-full bg-zinc-900/80 border border-zinc-800 rounded-xl px-4 py-3.5 text-white focus:border-emerald-500 transition-all placeholder:text-zinc-600"
            />
            <p className="text-[10px] text-zinc-600 mt-2 flex items-center gap-1.5">
              <svg viewBox="0 0 24 24" fill="none" className="w-3.5 h-3.5 shrink-0" stroke="currentColor" strokeWidth="1.5">
                <path d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              The wallet address of the person who created the will
            </p>
          </div>

          <motion.button
            onClick={() => onClaim(ownerAddress)}
            disabled={loading || !ownerAddress}
            whileHover={{ scale: loading || !ownerAddress ? 1 : 1.01 }}
            whileTap={{ scale: loading || !ownerAddress ? 1 : 0.98 }}
            className={`w-full py-4 rounded-xl font-semibold transition-all text-base ${
              loading || !ownerAddress
                ? "bg-zinc-800 text-zinc-600 cursor-not-allowed"
                : "bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 text-white shadow-lg shadow-emerald-600/20 hover:shadow-emerald-600/30"
            }`}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                </svg>
                Claiming...
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5" stroke="currentColor" strokeWidth="2">
                  <path d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Claim My Share
              </span>
            )}
          </motion.button>
        </div>
      </div>

      {/* Info cards */}
      <div className="mt-6 space-y-3">
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="flex items-start gap-3 p-4 rounded-xl bg-zinc-900/50 border border-zinc-800/50"
        >
          <div className="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center shrink-0">
            <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4 text-purple-400" stroke="currentColor" strokeWidth="1.5">
              <path d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <div>
            <div className="text-xs font-semibold text-zinc-300">Timeout + Grace Must Expire</div>
            <div className="text-[10px] text-zinc-600 mt-0.5">
              You can only claim after the owner&apos;s timeout period AND grace period have both elapsed.
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="flex items-start gap-3 p-4 rounded-xl bg-zinc-900/50 border border-zinc-800/50"
        >
          <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shrink-0">
            <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4 text-blue-400" stroke="currentColor" strokeWidth="1.5">
              <path d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <div>
            <div className="text-xs font-semibold text-zinc-300">One-Time Claim</div>
            <div className="text-[10px] text-zinc-600 mt-0.5">
              Each beneficiary can claim exactly once. Your share is calculated as a percentage of the vault balance.
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
