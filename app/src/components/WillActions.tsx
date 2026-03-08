"use client";

import { useState } from "react";
import { WillData } from "@/hooks/useSolWill";
import { motion, AnimatePresence } from "framer-motion";

interface Props {
  willData: WillData;
  loading: boolean;
  onDeposit: (sol: number) => Promise<void>;
  onWithdraw: (sol: number) => Promise<void>;
  onCheckin: () => Promise<void>;
  onAddBeneficiary: (address: string, shareBps: number) => Promise<void>;
  onRemoveBeneficiary: (address: string) => Promise<void>;
  onUpdateBeneficiary: (address: string, newShareBps: number) => Promise<void>;
  onPause: () => Promise<void>;
  onUnpause: () => Promise<void>;
  onUpdateTimeout: (
    timeout: number | null,
    grace: number | null
  ) => Promise<void>;
  onClose: () => Promise<void>;
  onTransferOwnership: (newOwner: string) => Promise<void>;
}

const tabs = [
  {
    id: "funds",
    label: "Funds",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4" stroke="currentColor" strokeWidth="1.5">
        <path d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  },
  {
    id: "beneficiaries",
    label: "Heirs",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4" stroke="currentColor" strokeWidth="1.5">
        <path d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  },
  {
    id: "settings",
    label: "Settings",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4" stroke="currentColor" strokeWidth="1.5">
        <path d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  },
  {
    id: "danger",
    label: "Advanced",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4" stroke="currentColor" strokeWidth="1.5">
        <path d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  },
];

export default function WillActions({
  willData,
  loading,
  onDeposit,
  onWithdraw,
  onCheckin,
  onAddBeneficiary,
  onRemoveBeneficiary,
  onUpdateBeneficiary,
  onPause,
  onUnpause,
  onUpdateTimeout,
  onClose,
  onTransferOwnership,
}: Props) {
  const [activeTab, setActiveTab] = useState("funds");
  const [depositAmount, setDepositAmount] = useState("");
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [beneficiaryAddress, setBeneficiaryAddress] = useState("");
  const [sharePercent, setSharePercent] = useState("");
  const [updateAddress, setUpdateAddress] = useState("");
  const [updatePercent, setUpdatePercent] = useState("");
  const [removeAddress, setRemoveAddress] = useState("");
  const [newTimeoutDays, setNewTimeoutDays] = useState("");
  const [newGraceDays, setNewGraceDays] = useState("");
  const [newOwner, setNewOwner] = useState("");
  const [showCloseConfirm, setShowCloseConfirm] = useState(false);

  const inputClass =
    "w-full bg-zinc-900/80 border border-zinc-800 rounded-xl px-4 py-3 text-white text-sm focus:border-purple-500 transition-all placeholder:text-zinc-600";

  const btnPrimary = (disabled: boolean) =>
    `w-full py-3 rounded-xl text-sm font-semibold transition-all ${
      disabled
        ? "bg-zinc-800 text-zinc-600 cursor-not-allowed"
        : "bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-500 hover:to-violet-500 text-white shadow-lg shadow-purple-600/20 hover:shadow-purple-600/30"
    }`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.1 }}
      className="glass-card rounded-2xl overflow-hidden sticky top-20"
    >
      {/* Tab bar */}
      <div className="flex border-b border-zinc-800/50">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 py-3.5 text-xs font-medium transition-all flex flex-col items-center gap-1.5 relative ${
              activeTab === tab.id
                ? "text-purple-400"
                : "text-zinc-600 hover:text-zinc-400"
            }`}
          >
            {tab.icon}
            <span>{tab.label}</span>
            {activeTab === tab.id && (
              <motion.div
                layoutId="activeTab"
                className="absolute bottom-0 left-2 right-2 h-0.5 bg-purple-500 rounded-full"
              />
            )}
          </button>
        ))}
      </div>

      <div className="p-5">
        <AnimatePresence mode="wait">
          {/* FUNDS TAB */}
          {activeTab === "funds" && (
            <motion.div
              key="funds"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              transition={{ duration: 0.2 }}
              className="space-y-5"
            >
              {/* Check In Button */}
              <motion.button
                onClick={onCheckin}
                disabled={loading}
                whileHover={{ scale: loading ? 1 : 1.02 }}
                whileTap={{ scale: loading ? 1 : 0.98 }}
                className={`w-full py-4 rounded-xl font-semibold transition-all text-base ${
                  loading
                    ? "bg-zinc-800 text-zinc-600"
                    : "bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 text-white shadow-lg shadow-emerald-600/20 hover:shadow-emerald-600/30"
                }`}
              >
                {loading ? (
                  <Spinner text="Processing..." />
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5" stroke="currentColor" strokeWidth="2">
                      <path d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    Check In
                  </span>
                )}
              </motion.button>

              {/* Deposit */}
              <div>
                <label className="text-xs text-zinc-500 font-medium mb-2 block uppercase tracking-wider">
                  Deposit SOL
                </label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={depositAmount}
                      onChange={(e) => setDepositAmount(e.target.value)}
                      placeholder="0.00"
                      className={inputClass}
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-zinc-600">SOL</span>
                  </div>
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      onDeposit(parseFloat(depositAmount));
                      setDepositAmount("");
                    }}
                    disabled={loading || !depositAmount}
                    className="px-5 py-3 rounded-xl text-sm font-semibold bg-purple-600 hover:bg-purple-500 disabled:bg-zinc-800 disabled:text-zinc-600 text-white transition-all shrink-0"
                  >
                    Deposit
                  </motion.button>
                </div>
              </div>

              {/* Withdraw */}
              <div>
                <label className="text-xs text-zinc-500 font-medium mb-2 block uppercase tracking-wider">
                  Withdraw SOL
                </label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={withdrawAmount}
                      onChange={(e) => setWithdrawAmount(e.target.value)}
                      placeholder="0.00"
                      className={inputClass}
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-zinc-600">SOL</span>
                  </div>
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      onWithdraw(parseFloat(withdrawAmount));
                      setWithdrawAmount("");
                    }}
                    disabled={loading || !withdrawAmount}
                    className="px-5 py-3 rounded-xl text-sm font-semibold bg-orange-600 hover:bg-orange-500 disabled:bg-zinc-800 disabled:text-zinc-600 text-white transition-all shrink-0"
                  >
                    Withdraw
                  </motion.button>
                </div>
              </div>
            </motion.div>
          )}

          {/* BENEFICIARIES TAB */}
          {activeTab === "beneficiaries" && (
            <motion.div
              key="beneficiaries"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              {/* Add */}
              <div>
                <SectionLabel>Add Beneficiary</SectionLabel>
                <div className="space-y-2.5">
                  <input
                    type="text"
                    value={beneficiaryAddress}
                    onChange={(e) => setBeneficiaryAddress(e.target.value)}
                    placeholder="Wallet address (base58)"
                    className={inputClass}
                  />
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <input
                        type="number"
                        step="0.01"
                        min="0.01"
                        max="100"
                        value={sharePercent}
                        onChange={(e) => setSharePercent(e.target.value)}
                        placeholder="Share"
                        className={inputClass}
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-zinc-600">%</span>
                    </div>
                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      onClick={() => {
                        onAddBeneficiary(
                          beneficiaryAddress,
                          Math.round(parseFloat(sharePercent) * 100)
                        );
                        setBeneficiaryAddress("");
                        setSharePercent("");
                      }}
                      disabled={loading || !beneficiaryAddress || !sharePercent}
                      className={btnPrimary(loading || !beneficiaryAddress || !sharePercent) + " !w-auto px-6"}
                    >
                      Add
                    </motion.button>
                  </div>
                </div>
              </div>

              {/* Update */}
              <div>
                <SectionLabel>Update Share</SectionLabel>
                <div className="space-y-2.5">
                  <input
                    type="text"
                    value={updateAddress}
                    onChange={(e) => setUpdateAddress(e.target.value)}
                    placeholder="Wallet address"
                    className={inputClass}
                  />
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <input
                        type="number"
                        step="0.01"
                        min="0.01"
                        max="100"
                        value={updatePercent}
                        onChange={(e) => setUpdatePercent(e.target.value)}
                        placeholder="New share"
                        className={inputClass}
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-zinc-600">%</span>
                    </div>
                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      onClick={() => {
                        onUpdateBeneficiary(
                          updateAddress,
                          Math.round(parseFloat(updatePercent) * 100)
                        );
                        setUpdateAddress("");
                        setUpdatePercent("");
                      }}
                      disabled={loading || !updateAddress || !updatePercent}
                      className="px-6 py-3 rounded-xl text-sm font-semibold bg-blue-600 hover:bg-blue-500 disabled:bg-zinc-800 disabled:text-zinc-600 text-white transition-all shrink-0"
                    >
                      Update
                    </motion.button>
                  </div>
                </div>
              </div>

              {/* Remove */}
              <div>
                <SectionLabel>Remove Beneficiary</SectionLabel>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={removeAddress}
                    onChange={(e) => setRemoveAddress(e.target.value)}
                    placeholder="Wallet address to remove"
                    className={inputClass + " flex-1"}
                  />
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      onRemoveBeneficiary(removeAddress);
                      setRemoveAddress("");
                    }}
                    disabled={loading || !removeAddress}
                    className="px-6 py-3 rounded-xl text-sm font-semibold bg-red-600 hover:bg-red-500 disabled:bg-zinc-800 disabled:text-zinc-600 text-white transition-all shrink-0"
                  >
                    Remove
                  </motion.button>
                </div>
              </div>
            </motion.div>
          )}

          {/* SETTINGS TAB */}
          {activeTab === "settings" && (
            <motion.div
              key="settings"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              {/* Timeout settings */}
              <div>
                <SectionLabel>Timeout Settings</SectionLabel>
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div>
                    <label className="text-[10px] text-zinc-600 mb-1 block">Timeout</label>
                    <div className="relative">
                      <input
                        type="number"
                        min="1"
                        value={newTimeoutDays}
                        onChange={(e) => setNewTimeoutDays(e.target.value)}
                        placeholder="Skip"
                        className={inputClass}
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-zinc-600">days</span>
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] text-zinc-600 mb-1 block">Grace Period</label>
                    <div className="relative">
                      <input
                        type="number"
                        min="1"
                        value={newGraceDays}
                        onChange={(e) => setNewGraceDays(e.target.value)}
                        placeholder="Skip"
                        className={inputClass}
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-zinc-600">days</span>
                    </div>
                  </div>
                </div>
                <motion.button
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    onUpdateTimeout(
                      newTimeoutDays ? parseInt(newTimeoutDays) * 86400 : null,
                      newGraceDays ? parseInt(newGraceDays) * 86400 : null
                    );
                    setNewTimeoutDays("");
                    setNewGraceDays("");
                  }}
                  disabled={loading || (!newTimeoutDays && !newGraceDays)}
                  className={btnPrimary(loading || (!newTimeoutDays && !newGraceDays))}
                >
                  Update Settings
                </motion.button>
              </div>

              {/* Pause/Unpause */}
              <div>
                <SectionLabel>Will Status</SectionLabel>
                <motion.button
                  whileTap={{ scale: 0.98 }}
                  onClick={willData.isPaused ? onUnpause : onPause}
                  disabled={loading}
                  className={`w-full py-3 rounded-xl text-sm font-semibold transition-all ${
                    willData.isPaused
                      ? "bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/20"
                      : "bg-amber-600 hover:bg-amber-500 text-white shadow-lg shadow-amber-600/20"
                  } disabled:bg-zinc-800 disabled:text-zinc-600 disabled:shadow-none`}
                >
                  {willData.isPaused ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                        <path d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347a1.125 1.125 0 01-1.667-.985V5.653z"/>
                      </svg>
                      Resume Will
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                        <path d="M6.75 5.25a.75.75 0 01.75-.75H9a.75.75 0 01.75.75v13.5a.75.75 0 01-.75.75H7.5a.75.75 0 01-.75-.75V5.25zm7.5 0A.75.75 0 0115 4.5h1.5a.75.75 0 01.75.75v13.5a.75.75 0 01-.75.75H15a.75.75 0 01-.75-.75V5.25z"/>
                      </svg>
                      Pause Will
                    </span>
                  )}
                </motion.button>
                <p className="text-[10px] text-zinc-600 mt-2 text-center">
                  {willData.isPaused
                    ? "Will is paused. Timer is frozen and all operations are blocked."
                    : "Pausing freezes the timer and blocks all operations except unpause."}
                </p>
              </div>
            </motion.div>
          )}

          {/* DANGER TAB */}
          {activeTab === "danger" && (
            <motion.div
              key="danger"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              {/* Transfer Ownership */}
              <div>
                <SectionLabel>Transfer Ownership</SectionLabel>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newOwner}
                    onChange={(e) => setNewOwner(e.target.value)}
                    placeholder="New owner wallet address"
                    className={inputClass + " flex-1"}
                  />
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      onTransferOwnership(newOwner);
                      setNewOwner("");
                    }}
                    disabled={loading || !newOwner}
                    className="px-5 py-3 rounded-xl text-sm font-semibold bg-orange-600 hover:bg-orange-500 disabled:bg-zinc-800 disabled:text-zinc-600 text-white transition-all shrink-0"
                  >
                    Transfer
                  </motion.button>
                </div>
                <div className="flex items-start gap-2 mt-2 p-3 rounded-lg bg-red-500/5 border border-red-500/10">
                  <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4 text-red-400 shrink-0 mt-0.5" stroke="currentColor" strokeWidth="1.5">
                    <path d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  <p className="text-[10px] text-red-400/80 leading-relaxed">
                    This is irreversible. You will permanently lose control of this will.
                  </p>
                </div>
              </div>

              {/* Close Will */}
              <div className="border-t border-zinc-800/50 pt-6">
                <SectionLabel color="red">Close Will</SectionLabel>
                <p className="text-xs text-zinc-600 mb-3">
                  Permanently closes the will and returns all vault funds + rent to your wallet. Cannot be undone.
                </p>
                <AnimatePresence mode="wait">
                  {!showCloseConfirm ? (
                    <motion.button
                      key="close-btn"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setShowCloseConfirm(true)}
                      disabled={loading}
                      className="w-full py-3 rounded-xl text-sm font-semibold bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 hover:border-red-500/30 transition-all disabled:opacity-50"
                    >
                      Close Will Permanently
                    </motion.button>
                  ) : (
                    <motion.div
                      key="confirm"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex gap-2"
                    >
                      <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={() => {
                          onClose();
                          setShowCloseConfirm(false);
                        }}
                        disabled={loading}
                        className="flex-1 py-3 rounded-xl text-sm font-semibold bg-red-600 hover:bg-red-500 text-white transition-all"
                      >
                        Yes, Close
                      </motion.button>
                      <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setShowCloseConfirm(false)}
                        className="flex-1 py-3 rounded-xl text-sm font-semibold bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-all"
                      >
                        Cancel
                      </motion.button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

function SectionLabel({ children, color }: { children: React.ReactNode; color?: string }) {
  return (
    <h3
      className={`text-xs font-semibold mb-3 uppercase tracking-wider ${
        color === "red" ? "text-red-400" : "text-zinc-500"
      }`}
    >
      {children}
    </h3>
  );
}

function Spinner({ text }: { text: string }) {
  return (
    <span className="flex items-center justify-center gap-2">
      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
      </svg>
      {text}
    </span>
  );
}
