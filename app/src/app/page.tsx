"use client";

import { useState, useEffect } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { useSolWill } from "@/hooks/useSolWill";
import CreateWill from "@/components/CreateWill";
import WillDashboard from "@/components/WillDashboard";
import WillActions from "@/components/WillActions";
import ClaimView from "@/components/ClaimView";
import { motion, AnimatePresence } from "framer-motion";

const fadeUp = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
};

const stagger = {
  animate: { transition: { staggerChildren: 0.1 } },
};

function Particles() {
  const [particles, setParticles] = useState<
    { id: number; left: number; size: number; delay: number; duration: number }[]
  >([]);

  useEffect(() => {
    setParticles(
      Array.from({ length: 20 }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        size: Math.random() * 4 + 2,
        delay: Math.random() * 10,
        duration: Math.random() * 15 + 10,
      }))
    );
  }, []);

  return (
    <>
      {particles.map((p) => (
        <div
          key={p.id}
          className="particle"
          style={{
            left: `${p.left}%`,
            width: p.size,
            height: p.size,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
          }}
        />
      ))}
    </>
  );
}

function HeroSection() {
  return (
    <div className="hero-gradient relative min-h-[92vh] flex flex-col items-center justify-center px-4">
      <Particles />

      <motion.div
        className="relative z-10 text-center max-w-4xl mx-auto"
        initial="initial"
        animate="animate"
        variants={stagger}
      >
        <motion.div
          variants={fadeUp}
          transition={{ duration: 0.6 }}
          className="mb-6"
        >
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 text-sm font-medium">
            <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
            Built on Solana
          </span>
        </motion.div>

        <motion.h1
          variants={fadeUp}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-tight mb-6"
        >
          <span className="text-white">Secure Your</span>
          <br />
          <span className="bg-gradient-to-r from-purple-400 via-violet-400 to-blue-400 bg-clip-text text-transparent">
            Digital Legacy
          </span>
        </motion.h1>

        <motion.p
          variants={fadeUp}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-lg sm:text-xl text-zinc-400 max-w-2xl mx-auto mb-10 leading-relaxed"
        >
          A trustless dead man&apos;s switch for crypto inheritance. Deposit SOL,
          designate beneficiaries, and let the blockchain handle the rest
          &mdash; no lawyers, no custodians, fully on-chain.
        </motion.p>

        <motion.div
          variants={fadeUp}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-6"
        >
          <WalletMultiButton />
          <a
            href="#how-it-works"
            className="px-6 py-3 rounded-xl border border-zinc-700 text-zinc-300 hover:border-zinc-500 hover:text-white transition-all text-sm font-medium"
          >
            How it works
          </a>
        </motion.div>

        <motion.p
          variants={fadeUp}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-xs text-zinc-600"
        >
          Connect your Solana wallet to get started
        </motion.p>
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-8 z-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="w-6 h-10 rounded-full border-2 border-zinc-600 flex items-start justify-center p-1.5"
        >
          <div className="w-1.5 h-2.5 rounded-full bg-zinc-500" />
        </motion.div>
      </motion.div>
    </div>
  );
}

function HowItWorks() {
  const steps = [
    {
      step: "01",
      title: "Create Your Will",
      description:
        "Set a timeout period (e.g. 90 days) and grace period. Your dead man's switch is now active on-chain.",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" className="w-7 h-7" stroke="currentColor" strokeWidth="1.5">
          <path d="M12 4.5v15m7.5-7.5h-15" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ),
      color: "purple",
    },
    {
      step: "02",
      title: "Deposit & Assign",
      description:
        "Deposit SOL into your vault and designate beneficiaries with percentage shares. Up to 10 beneficiaries supported.",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" className="w-7 h-7" stroke="currentColor" strokeWidth="1.5">
          <path d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ),
      color: "blue",
    },
    {
      step: "03",
      title: "Check In Regularly",
      description:
        "Periodically check in to reset the timer. Each check-in proves you're still active and resets the countdown.",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" className="w-7 h-7" stroke="currentColor" strokeWidth="1.5">
          <path d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ),
      color: "green",
    },
    {
      step: "04",
      title: "Automatic Inheritance",
      description:
        "If you stop checking in, after timeout + grace period, beneficiaries can claim their designated share of the vault.",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" className="w-7 h-7" stroke="currentColor" strokeWidth="1.5">
          <path d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ),
      color: "amber",
    },
  ];

  const colorMap: Record<string, { bg: string; border: string; text: string; glow: string }> = {
    purple: { bg: "bg-purple-500/10", border: "border-purple-500/20", text: "text-purple-400", glow: "glow-purple" },
    blue: { bg: "bg-blue-500/10", border: "border-blue-500/20", text: "text-blue-400", glow: "" },
    green: { bg: "bg-green-500/10", border: "border-green-500/20", text: "text-green-400", glow: "glow-green" },
    amber: { bg: "bg-amber-500/10", border: "border-amber-500/20", text: "text-amber-400", glow: "glow-orange" },
  };

  return (
    <section id="how-it-works" className="py-24 px-4 relative">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            How It Works
          </h2>
          <p className="text-zinc-500 max-w-xl mx-auto">
            Four simple steps to secure your crypto inheritance on the Solana blockchain
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((s, i) => {
            const c = colorMap[s.color];
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                whileHover={{ y: -5, transition: { duration: 0.2 } }}
                className={`glass-card glass-card-hover rounded-2xl p-6 relative ${c.glow}`}
              >
                <div className="text-xs font-bold text-zinc-600 mb-4">{s.step}</div>
                <div className={`w-12 h-12 rounded-xl ${c.bg} ${c.border} border flex items-center justify-center ${c.text} mb-4`}>
                  {s.icon}
                </div>
                <h3 className="text-white font-semibold text-lg mb-2">{s.title}</h3>
                <p className="text-zinc-500 text-sm leading-relaxed">{s.description}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function Features() {
  const features = [
    {
      title: "Dead Man's Switch",
      desc: "Configurable timeout with grace period. Your will activates only after prolonged inactivity.",
      icon: "🔒",
    },
    {
      title: "Up to 10 Beneficiaries",
      desc: "Add multiple beneficiaries with precise share allocation in basis points (0.01% precision).",
      icon: "👥",
    },
    {
      title: "Pause & Resume",
      desc: "Going on vacation? Pause your will to freeze the timer. Unpause when you're back.",
      icon: "⏸️",
    },
    {
      title: "Flexible Withdrawals",
      desc: "Withdraw your deposited SOL anytime before timeout. Full control while you're active.",
      icon: "💸",
    },
    {
      title: "Transfer Ownership",
      desc: "Transfer your will to a new wallet address if you need to change your primary wallet.",
      icon: "🔄",
    },
    {
      title: "On-Chain Events",
      desc: "Every action emits on-chain events for full transparency and audit trail.",
      icon: "📡",
    },
  ];

  return (
    <section className="py-24 px-4 relative">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-purple-500/[0.02] to-transparent pointer-events-none" />
      <div className="max-w-6xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Powerful Features
          </h2>
          <p className="text-zinc-500 max-w-xl mx-auto">
            Everything you need to manage your crypto inheritance with confidence
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((f, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
              whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
              className="glass-card glass-card-hover rounded-2xl p-6 cursor-default"
            >
              <div className="text-3xl mb-4">{f.icon}</div>
              <h3 className="text-white font-semibold mb-2">{f.title}</h3>
              <p className="text-zinc-500 text-sm leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Stats() {
  return (
    <section className="py-20 px-4">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="glass-card gradient-border rounded-3xl p-10 sm:p-14"
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { value: "13", label: "On-Chain Instructions" },
              { value: "10", label: "Max Beneficiaries" },
              { value: "14", label: "Program Events" },
              { value: "100%", label: "On-Chain" },
            ].map((s, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                className="text-center"
              >
                <div className="text-3xl sm:text-4xl font-black bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                  {s.value}
                </div>
                <div className="text-xs sm:text-sm text-zinc-500 mt-1">{s.label}</div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-zinc-800/50 py-10 px-4">
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <span className="text-xl font-bold text-white">
            Sol<span className="text-purple-400">Will</span>
          </span>
          <span className="text-xs text-zinc-600 hidden sm:block">|</span>
          <span className="text-xs text-zinc-600 hidden sm:block">
            Decentralized Crypto Inheritance
          </span>
        </div>
        <div className="text-xs text-zinc-600">
          Built on Solana &bull; Fully On-Chain &bull; Open Source
        </div>
      </div>
    </footer>
  );
}

export default function Home() {
  const { publicKey } = useWallet();
  const [view, setView] = useState<"owner" | "beneficiary">("owner");
  const {
    willData,
    vaultBalance,
    loading,
    willExists,
    txStatus,
    setTxStatus,
    initializeWill,
    deposit,
    withdraw,
    addBeneficiary,
    removeBeneficiary,
    updateBeneficiary,
    checkin,
    pauseWill,
    unpauseWill,
    updateTimeout,
    closeWill,
    transferOwnership,
    claimShare,
  } = useSolWill();

  // If wallet not connected, show landing page
  if (!publicKey) {
    return (
      <main className="min-h-screen">
        <header className="fixed top-0 left-0 right-0 z-50 bg-[#111113]/80 backdrop-blur-xl border-b border-zinc-800/50">
          <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
            <span className="text-xl font-bold text-white">
              Sol<span className="text-purple-400">Will</span>
            </span>
            <WalletMultiButton />
          </div>
        </header>
        <HeroSection />
        <HowItWorks />
        <Features />
        <Stats />
        <Footer />
      </main>
    );
  }

  // Connected — show app
  return (
    <main className="min-h-screen">
      {/* App header */}
      <header className="sticky top-0 z-50 bg-[#111113]/80 backdrop-blur-xl border-b border-zinc-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="text-xl font-bold text-white">
              Sol<span className="text-purple-400">Will</span>
            </span>
            <div className="hidden sm:flex items-center bg-zinc-900 rounded-xl overflow-hidden border border-zinc-800">
              <button
                onClick={() => setView("owner")}
                className={`px-5 py-2 text-sm font-medium transition-all ${
                  view === "owner"
                    ? "bg-purple-600 text-white shadow-lg shadow-purple-600/20"
                    : "text-zinc-500 hover:text-zinc-300"
                }`}
              >
                Owner
              </button>
              <button
                onClick={() => setView("beneficiary")}
                className={`px-5 py-2 text-sm font-medium transition-all ${
                  view === "beneficiary"
                    ? "bg-purple-600 text-white shadow-lg shadow-purple-600/20"
                    : "text-zinc-500 hover:text-zinc-300"
                }`}
              >
                Beneficiary
              </button>
            </div>
          </div>
          <WalletMultiButton />
        </div>

        {/* Mobile view toggle */}
        <div className="sm:hidden px-4 pb-3">
          <div className="flex items-center bg-zinc-900 rounded-xl overflow-hidden border border-zinc-800">
            <button
              onClick={() => setView("owner")}
              className={`flex-1 px-4 py-2 text-sm font-medium transition-all ${
                view === "owner"
                  ? "bg-purple-600 text-white"
                  : "text-zinc-500"
              }`}
            >
              Owner
            </button>
            <button
              onClick={() => setView("beneficiary")}
              className={`flex-1 px-4 py-2 text-sm font-medium transition-all ${
                view === "beneficiary"
                  ? "bg-purple-600 text-white"
                  : "text-zinc-500"
              }`}
            >
              Beneficiary
            </button>
          </div>
        </div>
      </header>

      {/* Transaction status toast */}
      <AnimatePresence>
        {txStatus && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed top-20 left-1/2 -translate-x-1/2 z-50 max-w-lg w-[90vw]"
          >
            <div
              className={`rounded-2xl px-5 py-4 text-sm flex items-center justify-between backdrop-blur-xl ${
                txStatus.startsWith("Error")
                  ? "bg-red-500/10 text-red-300 border border-red-500/20 glow-red"
                  : "bg-green-500/10 text-green-300 border border-green-500/20 glow-green"
              }`}
            >
              <div className="flex items-center gap-3">
                <span className={`text-lg ${txStatus.startsWith("Error") ? "" : ""}`}>
                  {txStatus.startsWith("Error") ? "✕" : "✓"}
                </span>
                <span className="leading-tight">{txStatus}</span>
              </div>
              <button
                onClick={() => setTxStatus("")}
                className="ml-4 text-xs opacity-60 hover:opacity-100 transition shrink-0"
              >
                Dismiss
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* App content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <AnimatePresence mode="wait">
          {view === "beneficiary" ? (
            <motion.div
              key="beneficiary"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="max-w-xl mx-auto"
            >
              <ClaimView loading={loading} onClaim={claimShare} />
            </motion.div>
          ) : !willExists ? (
            <motion.div
              key="create"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="max-w-xl mx-auto"
            >
              <CreateWill onSubmit={initializeWill} loading={loading} />
            </motion.div>
          ) : willData ? (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="grid grid-cols-1 lg:grid-cols-5 gap-6"
            >
              <div className="lg:col-span-3">
                <WillDashboard willData={willData} vaultBalance={vaultBalance} />
              </div>
              <div className="lg:col-span-2">
                <WillActions
                  willData={willData}
                  loading={loading}
                  onDeposit={deposit}
                  onWithdraw={withdraw}
                  onCheckin={checkin}
                  onAddBeneficiary={addBeneficiary}
                  onRemoveBeneficiary={removeBeneficiary}
                  onUpdateBeneficiary={updateBeneficiary}
                  onPause={pauseWill}
                  onUnpause={unpauseWill}
                  onUpdateTimeout={updateTimeout}
                  onClose={closeWill}
                  onTransferOwnership={transferOwnership}
                />
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
    </main>
  );
}
