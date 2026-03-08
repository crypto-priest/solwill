import { PublicKey } from "@solana/web3.js";

export const PROGRAM_ID = new PublicKey(
  "4bfagECyGUMHaaQF9mfTvJBpmyxTVFhzPNhb3xfTPMfF"
);

export const getWillPda = (owner: PublicKey) => {
  return PublicKey.findProgramAddressSync(
    [Buffer.from("will"), owner.toBuffer()],
    PROGRAM_ID
  );
};

export const getVaultPda = (will: PublicKey) => {
  return PublicKey.findProgramAddressSync(
    [Buffer.from("vault"), will.toBuffer()],
    PROGRAM_ID
  );
};

export const bpsToPercent = (bps: number) => (bps / 100).toFixed(2);
export const percentToBps = (percent: number) => Math.round(percent * 100);

export const lamportsToSol = (lamports: number) => lamports / 1e9;
export const solToLamports = (sol: number) => Math.round(sol * 1e9);

export const formatTimestamp = (ts: number) => {
  if (ts === 0) return "Never";
  return new Date(ts * 1000).toLocaleString();
};

export const formatDuration = (seconds: number) => {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  if (days > 0) return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h ${mins}m`;
  return `${mins}m`;
};

export const timeRemaining = (lastCheckin: number, timeout: number) => {
  const now = Math.floor(Date.now() / 1000);
  const deadline = lastCheckin + timeout;
  const remaining = deadline - now;
  if (remaining <= 0) return "Expired";
  return formatDuration(remaining);
};
