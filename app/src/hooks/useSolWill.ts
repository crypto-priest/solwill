"use client";

import { useCallback, useEffect, useState } from "react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { Program, AnchorProvider, BN, setProvider } from "@coral-xyz/anchor";
import { PublicKey, SystemProgram, LAMPORTS_PER_SOL } from "@solana/web3.js";
import { Solwill } from "@/utils/solwill";
import idl from "@/utils/idl.json";
import { getWillPda, getVaultPda, PROGRAM_ID } from "@/utils/constants";

export interface BeneficiaryData {
  address: PublicKey;
  shareBps: number;
  hasClaimed: boolean;
}

export interface WillData {
  owner: PublicKey;
  timeoutSeconds: number;
  gracePeriod: number;
  lastCheckin: number;
  createdAt: number;
  totalDeposited: number;
  totalWithdrawn: number;
  totalClaimed: number;
  isPaused: boolean;
  isClosed: boolean;
  bump: number;
  vaultBump: number;
  beneficiaries: BeneficiaryData[];
}

export function useSolWill() {
  const { connection } = useConnection();
  const wallet = useWallet();
  const [willData, setWillData] = useState<WillData | null>(null);
  const [vaultBalance, setVaultBalance] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [willExists, setWillExists] = useState(false);
  const [txStatus, setTxStatus] = useState<string>("");

  const getProgram = useCallback(() => {
    if (!wallet.publicKey || !wallet.signTransaction) return null;
    const provider = new AnchorProvider(connection, wallet as any, {
      commitment: "confirmed",
    });
    setProvider(provider);
    return new Program<Solwill>(idl as any, provider);
  }, [connection, wallet]);

  const fetchWill = useCallback(async () => {
    if (!wallet.publicKey) return;
    try {
      const program = getProgram();
      if (!program) return;

      const [willPda] = getWillPda(wallet.publicKey);
      const [vaultPda] = getVaultPda(willPda);

      const account = await program.account.willAccount.fetch(willPda);
      const balance = await connection.getBalance(vaultPda);

      setWillData({
        owner: account.owner,
        timeoutSeconds: (account.timeoutSeconds as BN).toNumber(),
        gracePeriod: (account.gracePeriod as BN).toNumber(),
        lastCheckin: (account.lastCheckin as BN).toNumber(),
        createdAt: (account.createdAt as BN).toNumber(),
        totalDeposited: (account.totalDeposited as BN).toNumber(),
        totalWithdrawn: (account.totalWithdrawn as BN).toNumber(),
        totalClaimed: (account.totalClaimed as BN).toNumber(),
        isPaused: account.isPaused,
        isClosed: account.isClosed,
        bump: account.bump,
        vaultBump: account.vaultBump,
        beneficiaries: account.beneficiaries.map((b: any) => ({
          address: b.address,
          shareBps: b.shareBps,
          hasClaimed: b.hasClaimed,
        })),
      });
      setVaultBalance(balance);
      setWillExists(true);
    } catch {
      setWillData(null);
      setWillExists(false);
      setVaultBalance(0);
    }
  }, [wallet.publicKey, connection, getProgram]);

  useEffect(() => {
    fetchWill();
  }, [fetchWill]);

  const initializeWill = async (
    timeoutSeconds: number,
    gracePeriod: number
  ) => {
    if (!wallet.publicKey) return;
    setLoading(true);
    setTxStatus("Initializing will...");
    try {
      const program = getProgram()!;
      const [willPda] = getWillPda(wallet.publicKey);
      const [vaultPda] = getVaultPda(willPda);

      const tx = await program.methods
        .initialize(new BN(timeoutSeconds), new BN(gracePeriod))
        .accountsStrict({
          owner: wallet.publicKey,
          will: willPda,
          vault: vaultPda,
          systemProgram: SystemProgram.programId,
        })
        .rpc();

      setTxStatus(`Will created! Tx: ${tx.slice(0, 16)}...`);
      await fetchWill();
    } catch (err: any) {
      setTxStatus(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const deposit = async (solAmount: number) => {
    if (!wallet.publicKey) return;
    setLoading(true);
    setTxStatus("Depositing SOL...");
    try {
      const program = getProgram()!;
      const [willPda] = getWillPda(wallet.publicKey);
      const [vaultPda] = getVaultPda(willPda);

      const tx = await program.methods
        .deposit(new BN(solAmount * LAMPORTS_PER_SOL))
        .accountsStrict({
          owner: wallet.publicKey,
          will: willPda,
          vault: vaultPda,
          systemProgram: SystemProgram.programId,
        })
        .rpc();

      setTxStatus(`Deposited ${solAmount} SOL! Tx: ${tx.slice(0, 16)}...`);
      await fetchWill();
    } catch (err: any) {
      setTxStatus(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const withdraw = async (solAmount: number) => {
    if (!wallet.publicKey) return;
    setLoading(true);
    setTxStatus("Withdrawing SOL...");
    try {
      const program = getProgram()!;
      const [willPda] = getWillPda(wallet.publicKey);
      const [vaultPda] = getVaultPda(willPda);

      const tx = await program.methods
        .withdraw(new BN(solAmount * LAMPORTS_PER_SOL))
        .accountsStrict({
          owner: wallet.publicKey,
          will: willPda,
          vault: vaultPda,
          systemProgram: SystemProgram.programId,
        })
        .rpc();

      setTxStatus(`Withdrew ${solAmount} SOL! Tx: ${tx.slice(0, 16)}...`);
      await fetchWill();
    } catch (err: any) {
      setTxStatus(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const addBeneficiary = async (address: string, shareBps: number) => {
    if (!wallet.publicKey) return;
    setLoading(true);
    setTxStatus("Adding beneficiary...");
    try {
      const program = getProgram()!;
      const [willPda] = getWillPda(wallet.publicKey);

      const tx = await program.methods
        .addBeneficiary(new PublicKey(address), shareBps)
        .accountsStrict({
          owner: wallet.publicKey,
          will: willPda,
          systemProgram: SystemProgram.programId,
        })
        .rpc();

      setTxStatus(`Beneficiary added! Tx: ${tx.slice(0, 16)}...`);
      await fetchWill();
    } catch (err: any) {
      setTxStatus(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const removeBeneficiary = async (address: string) => {
    if (!wallet.publicKey) return;
    setLoading(true);
    setTxStatus("Removing beneficiary...");
    try {
      const program = getProgram()!;
      const [willPda] = getWillPda(wallet.publicKey);

      const tx = await program.methods
        .removeBeneficiary(new PublicKey(address))
        .accountsStrict({
          owner: wallet.publicKey,
          will: willPda,
        })
        .rpc();

      setTxStatus(`Beneficiary removed! Tx: ${tx.slice(0, 16)}...`);
      await fetchWill();
    } catch (err: any) {
      setTxStatus(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const updateBeneficiary = async (address: string, newShareBps: number) => {
    if (!wallet.publicKey) return;
    setLoading(true);
    setTxStatus("Updating beneficiary...");
    try {
      const program = getProgram()!;
      const [willPda] = getWillPda(wallet.publicKey);

      const tx = await program.methods
        .updateBeneficiary(new PublicKey(address), newShareBps)
        .accountsStrict({
          owner: wallet.publicKey,
          will: willPda,
        })
        .rpc();

      setTxStatus(`Beneficiary updated! Tx: ${tx.slice(0, 16)}...`);
      await fetchWill();
    } catch (err: any) {
      setTxStatus(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const checkin = async () => {
    if (!wallet.publicKey) return;
    setLoading(true);
    setTxStatus("Checking in...");
    try {
      const program = getProgram()!;
      const [willPda] = getWillPda(wallet.publicKey);

      const tx = await program.methods
        .checkin()
        .accountsStrict({
          owner: wallet.publicKey,
          will: willPda,
        })
        .rpc();

      setTxStatus(`Checked in! Tx: ${tx.slice(0, 16)}...`);
      await fetchWill();
    } catch (err: any) {
      setTxStatus(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const pauseWill = async () => {
    if (!wallet.publicKey) return;
    setLoading(true);
    setTxStatus("Pausing will...");
    try {
      const program = getProgram()!;
      const [willPda] = getWillPda(wallet.publicKey);

      const tx = await program.methods
        .pauseWill()
        .accountsStrict({
          owner: wallet.publicKey,
          will: willPda,
        })
        .rpc();

      setTxStatus(`Will paused! Tx: ${tx.slice(0, 16)}...`);
      await fetchWill();
    } catch (err: any) {
      setTxStatus(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const unpauseWill = async () => {
    if (!wallet.publicKey) return;
    setLoading(true);
    setTxStatus("Unpausing will...");
    try {
      const program = getProgram()!;
      const [willPda] = getWillPda(wallet.publicKey);

      const tx = await program.methods
        .unpauseWill()
        .accountsStrict({
          owner: wallet.publicKey,
          will: willPda,
        })
        .rpc();

      setTxStatus(`Will unpaused! Tx: ${tx.slice(0, 16)}...`);
      await fetchWill();
    } catch (err: any) {
      setTxStatus(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const updateTimeout = async (
    newTimeout: number | null,
    newGracePeriod: number | null
  ) => {
    if (!wallet.publicKey) return;
    setLoading(true);
    setTxStatus("Updating settings...");
    try {
      const program = getProgram()!;
      const [willPda] = getWillPda(wallet.publicKey);

      const tx = await program.methods
        .updateTimeout(
          newTimeout ? new BN(newTimeout) : null,
          newGracePeriod ? new BN(newGracePeriod) : null
        )
        .accountsStrict({
          owner: wallet.publicKey,
          will: willPda,
        })
        .rpc();

      setTxStatus(`Settings updated! Tx: ${tx.slice(0, 16)}...`);
      await fetchWill();
    } catch (err: any) {
      setTxStatus(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const closeWill = async () => {
    if (!wallet.publicKey) return;
    setLoading(true);
    setTxStatus("Closing will...");
    try {
      const program = getProgram()!;
      const [willPda] = getWillPda(wallet.publicKey);
      const [vaultPda] = getVaultPda(willPda);

      const tx = await program.methods
        .closeWill()
        .accountsStrict({
          owner: wallet.publicKey,
          will: willPda,
          vault: vaultPda,
          systemProgram: SystemProgram.programId,
        })
        .rpc();

      setTxStatus(`Will closed! Tx: ${tx.slice(0, 16)}...`);
      await fetchWill();
    } catch (err: any) {
      setTxStatus(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const transferOwnership = async (newOwner: string) => {
    if (!wallet.publicKey) return;
    setLoading(true);
    setTxStatus("Transferring ownership...");
    try {
      const program = getProgram()!;
      const [willPda] = getWillPda(wallet.publicKey);

      const tx = await program.methods
        .transferOwnership(new PublicKey(newOwner))
        .accountsStrict({
          owner: wallet.publicKey,
          will: willPda,
        })
        .rpc();

      setTxStatus(`Ownership transferred! Tx: ${tx.slice(0, 16)}...`);
      await fetchWill();
    } catch (err: any) {
      setTxStatus(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const claimShare = async (willOwner: string) => {
    if (!wallet.publicKey) return;
    setLoading(true);
    setTxStatus("Claiming share...");
    try {
      const program = getProgram()!;
      const ownerPk = new PublicKey(willOwner);
      const [willPda] = getWillPda(ownerPk);
      const [vaultPda] = getVaultPda(willPda);

      const tx = await program.methods
        .claim()
        .accountsStrict({
          beneficiary: wallet.publicKey,
          will: willPda,
          vault: vaultPda,
          systemProgram: SystemProgram.programId,
        })
        .rpc();

      setTxStatus(`Share claimed! Tx: ${tx.slice(0, 16)}...`);
      await fetchWill();
    } catch (err: any) {
      setTxStatus(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return {
    willData,
    vaultBalance,
    loading,
    willExists,
    txStatus,
    setTxStatus,
    fetchWill,
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
  };
}
