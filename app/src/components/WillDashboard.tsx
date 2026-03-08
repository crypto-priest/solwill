"use client";

import { useEffect, useState } from "react";
import { WillData } from "@/hooks/useSolWill";
import {
  lamportsToSol,
  formatTimestamp,
  formatDuration,
  bpsToPercent,
} from "@/utils/constants";
import { motion } from "framer-motion";

interface Props {
  willData: WillData;
  vaultBalance: number;
}

function useCountdown(lastCheckin: number, timeoutSeconds: number) {
  const [remaining, setRemaining] = useState(0);

  useEffect(() => {
    const update = () => {
      const now = Math.floor(Date.now() / 1000);
      const deadline = lastCheckin + timeoutSeconds;
      setRemaining(Math.max(0, deadline - now));
    };
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, [lastCheckin, timeoutSeconds]);

  return remaining;
}

function CountdownDisplay({ seconds }: { seconds: number }) {
  if (seconds <= 0) return <span className="text-red-400 font-bold">Expired</span>;

  const d = Math.floor(seconds / 86400);
  const h = Math.floor((seconds % 86400) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;

  return (
    <div className="flex items-center gap-1.5">
      {d > 0 && (
        <div className="flex items-baseline gap-0.5">
          <span className="text-2xl font-bold text-white tabular-nums">{d}</span>
          <span className="text-xs text-zinc-500">d</span>
        </div>
      )}
      <div className="flex items-baseline gap-0.5">
        <span className="text-2xl font-bold text-white tabular-nums">{String(h).padStart(2, "0")}</span>
        <span className="text-xs text-zinc-500">h</span>
      </div>
      <span className="text-zinc-600 text-xl" style={{ animation: "tick 1s infinite" }}>:</span>
      <div className="flex items-baseline gap-0.5">
        <span className="text-2xl font-bold text-white tabular-nums">{String(m).padStart(2, "0")}</span>
        <span className="text-xs text-zinc-500">m</span>
      </div>
      <span className="text-zinc-600 text-xl" style={{ animation: "tick 1s infinite" }}>:</span>
      <div className="flex items-baseline gap-0.5">
        <span className="text-2xl font-bold text-white tabular-nums">{String(s).padStart(2, "0")}</span>
        <span className="text-xs text-zinc-500">s</span>
      </div>
    </div>
  );
}

export default function WillDashboard({ willData, vaultBalance }: Props) {
  const remaining = useCountdown(willData.lastCheckin, willData.timeoutSeconds);
  const now = Math.floor(Date.now() / 1000);
  const isTimedOut = now > willData.lastCheckin + willData.timeoutSeconds;
  const isClaimable =
    now > willData.lastCheckin + willData.timeoutSeconds + willData.gracePeriod;

  const totalSharesAllocated = willData.beneficiaries.reduce(
    (sum, b) => sum + b.shareBps,
    0
  );

  const statusConfig = willData.isPaused
    ? { label: "PAUSED", color: "bg-amber-500/10 text-amber-400 border-amber-500/20", glow: "glow-orange" }
    : isClaimable
    ? { label: "CLAIMABLE", color: "bg-red-500/10 text-red-400 border-red-500/20", glow: "glow-red" }
    : isTimedOut
    ? { label: "TIMED OUT", color: "bg-orange-500/10 text-orange-400 border-orange-500/20", glow: "glow-orange" }
    : { label: "ACTIVE", color: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20", glow: "glow-green" };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-5"
    >
      {/* Status & Countdown Card */}
      <div className={`glass-card rounded-2xl p-6 ${statusConfig.glow}`}>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-white">Will Status</h2>
          <span className={`px-3 py-1.5 rounded-full text-xs font-semibold border ${statusConfig.color}`}>
            {statusConfig.label}
          </span>
        </div>

        {/* Countdown timer */}
        <div className="bg-zinc-900/60 rounded-xl p-5 mb-5">
          <div className="text-xs text-zinc-500 mb-2 font-medium uppercase tracking-wider">
            Time Until Activation
          </div>
          <CountdownDisplay seconds={remaining} />
          {/* Progress bar */}
          <div className="mt-3 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
            <motion.div
              className={`h-full rounded-full ${
                remaining <= 0
                  ? "bg-red-500"
                  : remaining < willData.timeoutSeconds * 0.25
                  ? "bg-amber-500"
                  : "bg-emerald-500"
              }`}
              initial={{ width: 0 }}
              animate={{
                width: `${Math.min(
                  100,
                  (remaining / willData.timeoutSeconds) * 100
                )}%`,
              }}
              transition={{ duration: 1, ease: "easeOut" }}
            />
          </div>
        </div>

        {/* Vault balance */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-zinc-900/60 rounded-xl p-4">
            <div className="text-xs text-zinc-500 mb-1 font-medium">Vault Balance</div>
            <div className="text-xl font-bold text-white">
              {lamportsToSol(vaultBalance).toFixed(4)}
              <span className="text-sm text-zinc-500 ml-1.5">SOL</span>
            </div>
          </div>
          <div className="bg-zinc-900/60 rounded-xl p-4">
            <div className="text-xs text-zinc-500 mb-1 font-medium">Shares Allocated</div>
            <div className="text-xl font-bold text-white">
              {(totalSharesAllocated / 100).toFixed(1)}
              <span className="text-sm text-zinc-500 ml-1.5">%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Financial Stats */}
      <div className="glass-card rounded-2xl p-6">
        <h3 className="text-sm font-semibold text-zinc-400 mb-4 uppercase tracking-wider">
          Financial Overview
        </h3>
        <div className="grid grid-cols-3 gap-3">
          <StatTile
            label="Deposited"
            value={lamportsToSol(willData.totalDeposited).toFixed(4)}
            unit="SOL"
            color="text-purple-400"
          />
          <StatTile
            label="Withdrawn"
            value={lamportsToSol(willData.totalWithdrawn).toFixed(4)}
            unit="SOL"
            color="text-blue-400"
          />
          <StatTile
            label="Claimed"
            value={lamportsToSol(willData.totalClaimed).toFixed(4)}
            unit="SOL"
            color="text-amber-400"
          />
        </div>
      </div>

      {/* Settings Summary */}
      <div className="glass-card rounded-2xl p-6">
        <h3 className="text-sm font-semibold text-zinc-400 mb-4 uppercase tracking-wider">
          Configuration
        </h3>
        <div className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
          <InfoRow label="Timeout" value={formatDuration(willData.timeoutSeconds)} />
          <InfoRow label="Grace Period" value={formatDuration(willData.gracePeriod)} />
          <InfoRow label="Last Check-in" value={formatTimestamp(willData.lastCheckin)} />
          <InfoRow label="Created" value={formatTimestamp(willData.createdAt)} />
          <InfoRow
            label="Owner"
            value={`${willData.owner.toString().slice(0, 6)}...${willData.owner.toString().slice(-4)}`}
            mono
          />
          <InfoRow
            label="Beneficiaries"
            value={`${willData.beneficiaries.length} / 10`}
          />
        </div>
      </div>

      {/* Beneficiaries */}
      {willData.beneficiaries.length > 0 && (
        <div className="glass-card rounded-2xl p-6">
          <h3 className="text-sm font-semibold text-zinc-400 mb-4 uppercase tracking-wider">
            Beneficiaries ({willData.beneficiaries.length})
          </h3>
          <div className="space-y-2.5">
            {willData.beneficiaries.map((b, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="flex items-center justify-between bg-zinc-900/60 rounded-xl px-4 py-3.5 hover:bg-zinc-900 transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div
                      className={`w-9 h-9 rounded-lg flex items-center justify-center text-xs font-bold ${
                        b.hasClaimed
                          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                          : "bg-zinc-800 text-zinc-400 border border-zinc-700"
                      }`}
                    >
                      {b.hasClaimed ? "✓" : `#${i + 1}`}
                    </div>
                  </div>
                  <div>
                    <span className="text-sm text-zinc-300 font-mono block">
                      {b.address.toString().slice(0, 6)}...
                      {b.address.toString().slice(-4)}
                    </span>
                    {b.hasClaimed && (
                      <span className="text-[10px] text-emerald-500 font-medium">
                        Claimed
                      </span>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-base font-bold text-white">
                    {bpsToPercent(b.shareBps)}%
                  </span>
                  <span className="block text-[10px] text-zinc-600">
                    ~{lamportsToSol(Math.floor(vaultBalance * b.shareBps / 10000)).toFixed(4)} SOL
                  </span>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Share allocation bar */}
          <div className="mt-4">
            <div className="h-2 bg-zinc-800 rounded-full overflow-hidden flex">
              {willData.beneficiaries.map((b, i) => {
                const colors = [
                  "bg-purple-500",
                  "bg-blue-500",
                  "bg-emerald-500",
                  "bg-amber-500",
                  "bg-pink-500",
                  "bg-cyan-500",
                  "bg-orange-500",
                  "bg-indigo-500",
                  "bg-lime-500",
                  "bg-rose-500",
                ];
                return (
                  <motion.div
                    key={i}
                    initial={{ width: 0 }}
                    animate={{ width: `${b.shareBps / 100}%` }}
                    transition={{ duration: 0.6, delay: i * 0.1 }}
                    className={`h-full ${colors[i % colors.length]} ${i > 0 ? "border-l border-zinc-900" : ""}`}
                  />
                );
              })}
            </div>
            <div className="flex justify-between mt-1.5">
              <span className="text-[10px] text-zinc-600">0%</span>
              <span className="text-[10px] text-zinc-600">
                {(totalSharesAllocated / 100).toFixed(1)}% allocated
              </span>
              <span className="text-[10px] text-zinc-600">100%</span>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}

function StatTile({
  label,
  value,
  unit,
  color,
}: {
  label: string;
  value: string;
  unit: string;
  color: string;
}) {
  return (
    <div className="bg-zinc-900/60 rounded-xl p-3.5 text-center">
      <div className="text-[10px] text-zinc-500 mb-1 font-medium uppercase tracking-wider">
        {label}
      </div>
      <div className={`text-lg font-bold ${color}`}>
        {value}
      </div>
      <div className="text-[10px] text-zinc-600">{unit}</div>
    </div>
  );
}

function InfoRow({
  label,
  value,
  mono,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="flex justify-between items-center py-1.5 border-b border-zinc-800/50 last:border-0">
      <span className="text-xs text-zinc-500">{label}</span>
      <span className={`text-xs text-zinc-300 ${mono ? "font-mono" : "font-medium"}`}>
        {value}
      </span>
    </div>
  );
}
