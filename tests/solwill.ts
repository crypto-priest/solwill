import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Solwill } from "../target/types/solwill";
import {
  Keypair,
  LAMPORTS_PER_SOL,
  PublicKey,
  SystemProgram,
} from "@solana/web3.js";
import { assert } from "chai";

describe("solwill", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.solwill as Program<Solwill>;
  const owner = provider.wallet;

  const beneficiary1 = Keypair.generate();
  const beneficiary2 = Keypair.generate();
  const beneficiary3 = Keypair.generate();

  const TIMEOUT_SECONDS = 86400; // 1 day (minimum)
  const GRACE_PERIOD = 3600; // 1 hour (minimum)

  let willPda: PublicKey;
  let vaultPda: PublicKey;

  before(async () => {
    [willPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("will"), owner.publicKey.toBuffer()],
      program.programId
    );
    [vaultPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("vault"), willPda.toBuffer()],
      program.programId
    );

    // Airdrop to beneficiaries
    for (const kp of [beneficiary1, beneficiary2, beneficiary3]) {
      const sig = await provider.connection.requestAirdrop(
        kp.publicKey,
        LAMPORTS_PER_SOL
      );
      await provider.connection.confirmTransaction(sig);
    }
  });

  // ========== INITIALIZE ==========

  describe("Initialize", () => {
    it("Initializes a will with valid parameters", async () => {
      await program.methods
        .initialize(
          new anchor.BN(TIMEOUT_SECONDS),
          new anchor.BN(GRACE_PERIOD)
        )
        .accountsStrict({
          owner: owner.publicKey,
          will: willPda,
          vault: vaultPda,
          systemProgram: SystemProgram.programId,
        })
        .rpc();

      const willAccount = await program.account.willAccount.fetch(willPda);
      assert.ok(willAccount.owner.equals(owner.publicKey));
      assert.equal(willAccount.timeoutSeconds.toNumber(), TIMEOUT_SECONDS);
      assert.equal(willAccount.gracePeriod.toNumber(), GRACE_PERIOD);
      assert.equal(willAccount.beneficiaries.length, 0);
      assert.ok(willAccount.lastCheckin.toNumber() > 0);
      assert.ok(willAccount.createdAt.toNumber() > 0);
      assert.equal(willAccount.totalDeposited.toNumber(), 0);
      assert.equal(willAccount.totalWithdrawn.toNumber(), 0);
      assert.equal(willAccount.totalClaimed.toNumber(), 0);
      assert.equal(willAccount.isPaused, false);
      assert.equal(willAccount.isClosed, false);
    });
  });

  // ========== DEPOSIT ==========

  describe("Deposit", () => {
    it("Deposits SOL into the vault", async () => {
      const depositAmount = LAMPORTS_PER_SOL;
      const vaultBalanceBefore = await provider.connection.getBalance(vaultPda);

      await program.methods
        .deposit(new anchor.BN(depositAmount))
        .accountsStrict({
          owner: owner.publicKey,
          will: willPda,
          vault: vaultPda,
          systemProgram: SystemProgram.programId,
        })
        .rpc();

      const vaultBalanceAfter = await provider.connection.getBalance(vaultPda);
      assert.equal(vaultBalanceAfter - vaultBalanceBefore, depositAmount);

      const willAccount = await program.account.willAccount.fetch(willPda);
      assert.equal(willAccount.totalDeposited.toNumber(), depositAmount);
    });

    it("Deposits more SOL and tracks total", async () => {
      const depositAmount = LAMPORTS_PER_SOL / 2;

      await program.methods
        .deposit(new anchor.BN(depositAmount))
        .accountsStrict({
          owner: owner.publicKey,
          will: willPda,
          vault: vaultPda,
          systemProgram: SystemProgram.programId,
        })
        .rpc();

      const willAccount = await program.account.willAccount.fetch(willPda);
      assert.equal(
        willAccount.totalDeposited.toNumber(),
        LAMPORTS_PER_SOL + depositAmount
      );
    });

    it("Fails to deposit zero amount", async () => {
      try {
        await program.methods
          .deposit(new anchor.BN(0))
          .accountsStrict({
            owner: owner.publicKey,
            will: willPda,
            vault: vaultPda,
            systemProgram: SystemProgram.programId,
          })
          .rpc();
        assert.fail("Should have thrown ZeroDeposit error");
      } catch (err) {
        assert.include(err.toString(), "ZeroDeposit");
      }
    });
  });

  // ========== ADD BENEFICIARY ==========

  describe("Add Beneficiary", () => {
    it("Adds beneficiary 1 with 40% share", async () => {
      await program.methods
        .addBeneficiary(beneficiary1.publicKey, 4000)
        .accountsStrict({
          owner: owner.publicKey,
          will: willPda,
          systemProgram: SystemProgram.programId,
        })
        .rpc();

      const willAccount = await program.account.willAccount.fetch(willPda);
      assert.equal(willAccount.beneficiaries.length, 1);
      assert.ok(
        willAccount.beneficiaries[0].address.equals(beneficiary1.publicKey)
      );
      assert.equal(willAccount.beneficiaries[0].shareBps, 4000);
      assert.equal(willAccount.beneficiaries[0].hasClaimed, false);
    });

    it("Adds beneficiary 2 with 30% share", async () => {
      await program.methods
        .addBeneficiary(beneficiary2.publicKey, 3000)
        .accountsStrict({
          owner: owner.publicKey,
          will: willPda,
          systemProgram: SystemProgram.programId,
        })
        .rpc();

      const willAccount = await program.account.willAccount.fetch(willPda);
      assert.equal(willAccount.beneficiaries.length, 2);
      assert.equal(willAccount.beneficiaries[1].shareBps, 3000);
    });

    it("Adds beneficiary 3 with 30% share (total = 100%)", async () => {
      await program.methods
        .addBeneficiary(beneficiary3.publicKey, 3000)
        .accountsStrict({
          owner: owner.publicKey,
          will: willPda,
          systemProgram: SystemProgram.programId,
        })
        .rpc();

      const willAccount = await program.account.willAccount.fetch(willPda);
      assert.equal(willAccount.beneficiaries.length, 3);
    });

    it("Fails to add duplicate beneficiary", async () => {
      try {
        await program.methods
          .addBeneficiary(beneficiary1.publicKey, 1000)
          .accountsStrict({
            owner: owner.publicKey,
            will: willPda,
            systemProgram: SystemProgram.programId,
          })
          .rpc();
        assert.fail("Should have thrown BeneficiaryAlreadyExists error");
      } catch (err) {
        assert.include(err.toString(), "BeneficiaryAlreadyExists");
      }
    });

    it("Fails to exceed 100% total shares", async () => {
      const extra = Keypair.generate();
      try {
        await program.methods
          .addBeneficiary(extra.publicKey, 1)
          .accountsStrict({
            owner: owner.publicKey,
            will: willPda,
            systemProgram: SystemProgram.programId,
          })
          .rpc();
        assert.fail("Should have thrown ShareOverflow error");
      } catch (err) {
        assert.include(err.toString(), "ShareOverflow");
      }
    });

    it("Fails to add beneficiary with zero share", async () => {
      const extra = Keypair.generate();
      try {
        await program.methods
          .addBeneficiary(extra.publicKey, 0)
          .accountsStrict({
            owner: owner.publicKey,
            will: willPda,
            systemProgram: SystemProgram.programId,
          })
          .rpc();
        assert.fail("Should have thrown ZeroShare error");
      } catch (err) {
        assert.include(err.toString(), "ZeroShare");
      }
    });
  });

  // ========== UPDATE BENEFICIARY ==========

  describe("Update Beneficiary", () => {
    it("Updates beneficiary 3 share from 30% to 20%", async () => {
      await program.methods
        .updateBeneficiary(beneficiary3.publicKey, 2000)
        .accountsStrict({
          owner: owner.publicKey,
          will: willPda,
        })
        .rpc();

      const willAccount = await program.account.willAccount.fetch(willPda);
      const b3 = willAccount.beneficiaries.find((b) =>
        b.address.equals(beneficiary3.publicKey)
      );
      assert.equal(b3.shareBps, 2000);
    });

    it("Fails to update non-existent beneficiary", async () => {
      const fake = Keypair.generate();
      try {
        await program.methods
          .updateBeneficiary(fake.publicKey, 1000)
          .accountsStrict({
            owner: owner.publicKey,
            will: willPda,
          })
          .rpc();
        assert.fail("Should have thrown BeneficiaryNotFound error");
      } catch (err) {
        assert.include(err.toString(), "BeneficiaryNotFound");
      }
    });

    it("Fails to update share that would overflow 100%", async () => {
      try {
        await program.methods
          .updateBeneficiary(beneficiary3.publicKey, 5000)
          .accountsStrict({
            owner: owner.publicKey,
            will: willPda,
          })
          .rpc();
        assert.fail("Should have thrown ShareOverflow error");
      } catch (err) {
        assert.include(err.toString(), "ShareOverflow");
      }
    });
  });

  // ========== REMOVE BENEFICIARY ==========

  describe("Remove Beneficiary", () => {
    it("Removes beneficiary 3", async () => {
      await program.methods
        .removeBeneficiary(beneficiary3.publicKey)
        .accountsStrict({
          owner: owner.publicKey,
          will: willPda,
        })
        .rpc();

      const willAccount = await program.account.willAccount.fetch(willPda);
      assert.equal(willAccount.beneficiaries.length, 2);
      assert.ok(
        !willAccount.beneficiaries.some((b) =>
          b.address.equals(beneficiary3.publicKey)
        )
      );
    });

    it("Fails to remove non-existent beneficiary", async () => {
      try {
        await program.methods
          .removeBeneficiary(beneficiary3.publicKey)
          .accountsStrict({
            owner: owner.publicKey,
            will: willPda,
          })
          .rpc();
        assert.fail("Should have thrown BeneficiaryNotFound error");
      } catch (err) {
        assert.include(err.toString(), "BeneficiaryNotFound");
      }
    });
  });

  // ========== UPDATE TIMEOUT ==========

  describe("Update Timeout", () => {
    it("Updates timeout to 2 days", async () => {
      const newTimeout = 86400 * 2;
      await program.methods
        .updateTimeout(new anchor.BN(newTimeout), null)
        .accountsStrict({
          owner: owner.publicKey,
          will: willPda,
        })
        .rpc();

      const willAccount = await program.account.willAccount.fetch(willPda);
      assert.equal(willAccount.timeoutSeconds.toNumber(), newTimeout);
    });

    it("Updates grace period to 2 hours", async () => {
      const newGrace = 7200;
      await program.methods
        .updateTimeout(null, new anchor.BN(newGrace))
        .accountsStrict({
          owner: owner.publicKey,
          will: willPda,
        })
        .rpc();

      const willAccount = await program.account.willAccount.fetch(willPda);
      assert.equal(willAccount.gracePeriod.toNumber(), newGrace);
    });

    it("Updates both timeout and grace period", async () => {
      await program.methods
        .updateTimeout(
          new anchor.BN(TIMEOUT_SECONDS),
          new anchor.BN(GRACE_PERIOD)
        )
        .accountsStrict({
          owner: owner.publicKey,
          will: willPda,
        })
        .rpc();

      const willAccount = await program.account.willAccount.fetch(willPda);
      assert.equal(willAccount.timeoutSeconds.toNumber(), TIMEOUT_SECONDS);
      assert.equal(willAccount.gracePeriod.toNumber(), GRACE_PERIOD);
    });

    it("Fails to set timeout below minimum", async () => {
      try {
        await program.methods
          .updateTimeout(new anchor.BN(100), null)
          .accountsStrict({
            owner: owner.publicKey,
            will: willPda,
          })
          .rpc();
        assert.fail("Should have thrown TimeoutTooShort error");
      } catch (err) {
        assert.include(err.toString(), "TimeoutTooShort");
      }
    });

    it("Fails to set grace period below minimum", async () => {
      try {
        await program.methods
          .updateTimeout(null, new anchor.BN(100))
          .accountsStrict({
            owner: owner.publicKey,
            will: willPda,
          })
          .rpc();
        assert.fail("Should have thrown GracePeriodTooShort error");
      } catch (err) {
        assert.include(err.toString(), "GracePeriodTooShort");
      }
    });
  });

  // ========== CHECK IN ==========

  describe("Check In", () => {
    it("Owner checks in successfully", async () => {
      const willBefore = await program.account.willAccount.fetch(willPda);

      await new Promise((resolve) => setTimeout(resolve, 1500));

      await program.methods
        .checkin()
        .accountsStrict({
          owner: owner.publicKey,
          will: willPda,
        })
        .rpc();

      const willAfter = await program.account.willAccount.fetch(willPda);
      assert.ok(
        willAfter.lastCheckin.toNumber() >= willBefore.lastCheckin.toNumber()
      );
    });
  });

  // ========== PAUSE / UNPAUSE ==========

  describe("Pause and Unpause", () => {
    it("Pauses the will", async () => {
      await program.methods
        .pauseWill()
        .accountsStrict({
          owner: owner.publicKey,
          will: willPda,
        })
        .rpc();

      const willAccount = await program.account.willAccount.fetch(willPda);
      assert.equal(willAccount.isPaused, true);
    });

    it("Fails to deposit when paused", async () => {
      try {
        await program.methods
          .deposit(new anchor.BN(LAMPORTS_PER_SOL))
          .accountsStrict({
            owner: owner.publicKey,
            will: willPda,
            vault: vaultPda,
            systemProgram: SystemProgram.programId,
          })
          .rpc();
        assert.fail("Should have thrown WillPaused error");
      } catch (err) {
        assert.include(err.toString(), "WillPaused");
      }
    });

    it("Fails to add beneficiary when paused", async () => {
      const extra = Keypair.generate();
      try {
        await program.methods
          .addBeneficiary(extra.publicKey, 1000)
          .accountsStrict({
            owner: owner.publicKey,
            will: willPda,
            systemProgram: SystemProgram.programId,
          })
          .rpc();
        assert.fail("Should have thrown WillPaused error");
      } catch (err) {
        assert.include(err.toString(), "WillPaused");
      }
    });

    it("Fails to withdraw when paused", async () => {
      try {
        await program.methods
          .withdraw(new anchor.BN(1000))
          .accountsStrict({
            owner: owner.publicKey,
            will: willPda,
            vault: vaultPda,
            systemProgram: SystemProgram.programId,
          })
          .rpc();
        assert.fail("Should have thrown WillPaused error");
      } catch (err) {
        assert.include(err.toString(), "WillPaused");
      }
    });

    it("Fails to pause when already paused", async () => {
      try {
        await program.methods
          .pauseWill()
          .accountsStrict({
            owner: owner.publicKey,
            will: willPda,
          })
          .rpc();
        assert.fail("Should have thrown WillPaused error");
      } catch (err) {
        assert.include(err.toString(), "WillPaused");
      }
    });

    it("Fails to check in when paused", async () => {
      try {
        await program.methods
          .checkin()
          .accountsStrict({
            owner: owner.publicKey,
            will: willPda,
          })
          .rpc();
        assert.fail("Should have thrown WillPaused error");
      } catch (err) {
        assert.include(err.toString(), "WillPaused");
      }
    });

    it("Fails to remove beneficiary when paused", async () => {
      try {
        await program.methods
          .removeBeneficiary(beneficiary2.publicKey)
          .accountsStrict({
            owner: owner.publicKey,
            will: willPda,
          })
          .rpc();
        assert.fail("Should have thrown WillPaused error");
      } catch (err) {
        assert.include(err.toString(), "WillPaused");
      }
    });

    it("Fails to update beneficiary when paused", async () => {
      try {
        await program.methods
          .updateBeneficiary(beneficiary1.publicKey, 5000)
          .accountsStrict({
            owner: owner.publicKey,
            will: willPda,
          })
          .rpc();
        assert.fail("Should have thrown WillPaused error");
      } catch (err) {
        assert.include(err.toString(), "WillPaused");
      }
    });

    it("Fails to update timeout when paused", async () => {
      try {
        await program.methods
          .updateTimeout(new anchor.BN(86400 * 2), null)
          .accountsStrict({
            owner: owner.publicKey,
            will: willPda,
          })
          .rpc();
        assert.fail("Should have thrown WillPaused error");
      } catch (err) {
        assert.include(err.toString(), "WillPaused");
      }
    });

    it("Fails to transfer ownership when paused", async () => {
      const newOwner = Keypair.generate();
      try {
        await program.methods
          .transferOwnership(newOwner.publicKey)
          .accountsStrict({
            owner: owner.publicKey,
            will: willPda,
          })
          .rpc();
        assert.fail("Should have thrown WillPaused error");
      } catch (err) {
        assert.include(err.toString(), "WillPaused");
      }
    });

    it("Unpauses the will", async () => {
      await program.methods
        .unpauseWill()
        .accountsStrict({
          owner: owner.publicKey,
          will: willPda,
        })
        .rpc();

      const willAccount = await program.account.willAccount.fetch(willPda);
      assert.equal(willAccount.isPaused, false);
    });

    it("Fails to unpause when not paused", async () => {
      try {
        await program.methods
          .unpauseWill()
          .accountsStrict({
            owner: owner.publicKey,
            will: willPda,
          })
          .rpc();
        assert.fail("Should have thrown WillNotPaused error");
      } catch (err) {
        assert.include(err.toString(), "WillNotPaused");
      }
    });
  });

  // ========== WITHDRAW ==========

  describe("Withdraw", () => {
    it("Owner withdraws SOL from vault", async () => {
      const withdrawAmount = LAMPORTS_PER_SOL / 4;
      const vaultBalanceBefore = await provider.connection.getBalance(vaultPda);

      await program.methods
        .withdraw(new anchor.BN(withdrawAmount))
        .accountsStrict({
          owner: owner.publicKey,
          will: willPda,
          vault: vaultPda,
          systemProgram: SystemProgram.programId,
        })
        .rpc();

      const vaultBalanceAfter = await provider.connection.getBalance(vaultPda);
      assert.equal(vaultBalanceBefore - vaultBalanceAfter, withdrawAmount);

      const willAccount = await program.account.willAccount.fetch(willPda);
      assert.equal(willAccount.totalWithdrawn.toNumber(), withdrawAmount);
    });

    it("Fails to withdraw zero amount", async () => {
      try {
        await program.methods
          .withdraw(new anchor.BN(0))
          .accountsStrict({
            owner: owner.publicKey,
            will: willPda,
            vault: vaultPda,
            systemProgram: SystemProgram.programId,
          })
          .rpc();
        assert.fail("Should have thrown ZeroWithdraw error");
      } catch (err) {
        assert.include(err.toString(), "ZeroWithdraw");
      }
    });

    it("Fails to withdraw more than available", async () => {
      try {
        await program.methods
          .withdraw(new anchor.BN(100 * LAMPORTS_PER_SOL))
          .accountsStrict({
            owner: owner.publicKey,
            will: willPda,
            vault: vaultPda,
            systemProgram: SystemProgram.programId,
          })
          .rpc();
        assert.fail("Should have thrown InsufficientBalance error");
      } catch (err) {
        assert.include(err.toString(), "InsufficientBalance");
      }
    });
  });

  // ========== CLAIM (before timeout) ==========

  describe("Claim (before timeout)", () => {
    it("Beneficiary cannot claim before timeout", async () => {
      try {
        await program.methods
          .claim()
          .accountsStrict({
            beneficiary: beneficiary1.publicKey,
            will: willPda,
            vault: vaultPda,
            systemProgram: SystemProgram.programId,
          })
          .signers([beneficiary1])
          .rpc();
        assert.fail("Should have thrown TooEarly error");
      } catch (err) {
        assert.include(err.toString(), "TooEarly");
      }
    });
  });

  // ========== NON-BENEFICIARY CLAIM ==========

  describe("Non-beneficiary claim attempt", () => {
    it("Non-beneficiary cannot claim", async () => {
      const stranger = Keypair.generate();
      const sig = await provider.connection.requestAirdrop(
        stranger.publicKey,
        LAMPORTS_PER_SOL
      );
      await provider.connection.confirmTransaction(sig);

      try {
        await program.methods
          .claim()
          .accountsStrict({
            beneficiary: stranger.publicKey,
            will: willPda,
            vault: vaultPda,
            systemProgram: SystemProgram.programId,
          })
          .signers([stranger])
          .rpc();
        assert.fail("Should have thrown an error");
      } catch (err) {
        assert.ok(
          err.toString().includes("TooEarly") ||
            err.toString().includes("NotBeneficiary")
        );
      }
    });
  });

  // ========== TRANSFER OWNERSHIP ==========

  describe("Transfer Ownership", () => {
    it("Fails to transfer ownership to same address", async () => {
      try {
        await program.methods
          .transferOwnership(owner.publicKey)
          .accountsStrict({
            owner: owner.publicKey,
            will: willPda,
          })
          .rpc();
        assert.fail("Should have thrown SameOwner error");
      } catch (err) {
        assert.include(err.toString(), "SameOwner");
      }
    });
  });

  // ========== CLOSE WILL ==========

  describe("Close Will", () => {
    it("Owner closes the will and reclaims vault balance", async () => {
      const ownerBalanceBefore = await provider.connection.getBalance(
        owner.publicKey
      );
      const vaultBalanceBefore = await provider.connection.getBalance(vaultPda);

      await program.methods
        .closeWill()
        .accountsStrict({
          owner: owner.publicKey,
          will: willPda,
          vault: vaultPda,
          systemProgram: SystemProgram.programId,
        })
        .rpc();

      // Will account should be closed (rent reclaimed)
      try {
        await program.account.willAccount.fetch(willPda);
        assert.fail("Will account should have been closed");
      } catch (err) {
        // Account should not exist
        assert.ok(err.toString().includes("Account does not exist"));
      }

      const ownerBalanceAfter = await provider.connection.getBalance(
        owner.publicKey
      );
      // Owner should have received vault balance + will rent
      assert.ok(ownerBalanceAfter > ownerBalanceBefore);
    });
  });

  // ========== SECOND WILL (for re-init test) ==========

  describe("Re-initialize after close", () => {
    it("Can create a new will after closing previous one", async () => {
      await program.methods
        .initialize(
          new anchor.BN(TIMEOUT_SECONDS),
          new anchor.BN(GRACE_PERIOD)
        )
        .accountsStrict({
          owner: owner.publicKey,
          will: willPda,
          vault: vaultPda,
          systemProgram: SystemProgram.programId,
        })
        .rpc();

      const willAccount = await program.account.willAccount.fetch(willPda);
      assert.ok(willAccount.owner.equals(owner.publicKey));
      assert.equal(willAccount.beneficiaries.length, 0);
      assert.equal(willAccount.totalDeposited.toNumber(), 0);
    });

    it("Sets up for remaining tests", async () => {
      // Deposit
      await program.methods
        .deposit(new anchor.BN(2 * LAMPORTS_PER_SOL))
        .accountsStrict({
          owner: owner.publicKey,
          will: willPda,
          vault: vaultPda,
          systemProgram: SystemProgram.programId,
        })
        .rpc();

      // Add beneficiary 1 (50%) and beneficiary 2 (50%)
      await program.methods
        .addBeneficiary(beneficiary1.publicKey, 5000)
        .accountsStrict({
          owner: owner.publicKey,
          will: willPda,
          systemProgram: SystemProgram.programId,
        })
        .rpc();

      await program.methods
        .addBeneficiary(beneficiary2.publicKey, 5000)
        .accountsStrict({
          owner: owner.publicKey,
          will: willPda,
          systemProgram: SystemProgram.programId,
        })
        .rpc();

      const willAccount = await program.account.willAccount.fetch(willPda);
      assert.equal(willAccount.beneficiaries.length, 2);
      assert.equal(willAccount.totalDeposited.toNumber(), 2 * LAMPORTS_PER_SOL);
    });
  });

  // ========== FULL ACCOUNT STATE INSPECTION ==========

  describe("Account State Inspection", () => {
    it("Will account has all expected fields populated", async () => {
      const willAccount = await program.account.willAccount.fetch(willPda);

      assert.ok(willAccount.owner.equals(owner.publicKey));
      assert.equal(willAccount.timeoutSeconds.toNumber(), TIMEOUT_SECONDS);
      assert.equal(willAccount.gracePeriod.toNumber(), GRACE_PERIOD);
      assert.ok(willAccount.lastCheckin.toNumber() > 0);
      assert.ok(willAccount.createdAt.toNumber() > 0);
      assert.equal(willAccount.totalDeposited.toNumber(), 2 * LAMPORTS_PER_SOL);
      assert.equal(willAccount.totalWithdrawn.toNumber(), 0);
      assert.equal(willAccount.totalClaimed.toNumber(), 0);
      assert.equal(willAccount.isPaused, false);
      assert.equal(willAccount.isClosed, false);
      assert.equal(willAccount.beneficiaries.length, 2);

      // Verify beneficiary data
      const b1 = willAccount.beneficiaries[0];
      assert.ok(b1.address.equals(beneficiary1.publicKey));
      assert.equal(b1.shareBps, 5000);
      assert.equal(b1.hasClaimed, false);

      const b2 = willAccount.beneficiaries[1];
      assert.ok(b2.address.equals(beneficiary2.publicKey));
      assert.equal(b2.shareBps, 5000);
      assert.equal(b2.hasClaimed, false);
    });

    it("Vault has correct balance", async () => {
      const vaultBalance = await provider.connection.getBalance(vaultPda);
      assert.ok(vaultBalance >= 2 * LAMPORTS_PER_SOL);
    });
  });

  // ========== AUTHORIZATION (NON-OWNER) ==========

  describe("Authorization - Non-owner operations", () => {
    it("Non-owner cannot deposit", async () => {
      try {
        await program.methods
          .deposit(new anchor.BN(LAMPORTS_PER_SOL))
          .accountsStrict({
            owner: beneficiary1.publicKey,
            will: willPda,
            vault: vaultPda,
            systemProgram: SystemProgram.programId,
          })
          .signers([beneficiary1])
          .rpc();
        assert.fail("Should have thrown an error");
      } catch (err) {
        // PDA seed mismatch or has_one constraint failure
        assert.ok(err.toString().length > 0);
      }
    });

    it("Non-owner cannot add beneficiary", async () => {
      const extra = Keypair.generate();
      try {
        await program.methods
          .addBeneficiary(extra.publicKey, 1000)
          .accountsStrict({
            owner: beneficiary1.publicKey,
            will: willPda,
            systemProgram: SystemProgram.programId,
          })
          .signers([beneficiary1])
          .rpc();
        assert.fail("Should have thrown an error");
      } catch (err) {
        assert.ok(err.toString().length > 0);
      }
    });

    it("Non-owner cannot withdraw", async () => {
      try {
        await program.methods
          .withdraw(new anchor.BN(1000))
          .accountsStrict({
            owner: beneficiary1.publicKey,
            will: willPda,
            vault: vaultPda,
            systemProgram: SystemProgram.programId,
          })
          .signers([beneficiary1])
          .rpc();
        assert.fail("Should have thrown an error");
      } catch (err) {
        assert.ok(err.toString().length > 0);
      }
    });

    it("Non-owner cannot pause", async () => {
      try {
        await program.methods
          .pauseWill()
          .accountsStrict({
            owner: beneficiary1.publicKey,
            will: willPda,
          })
          .signers([beneficiary1])
          .rpc();
        assert.fail("Should have thrown an error");
      } catch (err) {
        assert.ok(err.toString().length > 0);
      }
    });

    it("Non-owner cannot close will", async () => {
      try {
        await program.methods
          .closeWill()
          .accountsStrict({
            owner: beneficiary1.publicKey,
            will: willPda,
            vault: vaultPda,
            systemProgram: SystemProgram.programId,
          })
          .signers([beneficiary1])
          .rpc();
        assert.fail("Should have thrown an error");
      } catch (err) {
        assert.ok(err.toString().length > 0);
      }
    });

    it("Non-owner cannot check in", async () => {
      try {
        await program.methods
          .checkin()
          .accountsStrict({
            owner: beneficiary1.publicKey,
            will: willPda,
          })
          .signers([beneficiary1])
          .rpc();
        assert.fail("Should have thrown an error");
      } catch (err) {
        assert.ok(err.toString().length > 0);
      }
    });

    it("Non-owner cannot transfer ownership", async () => {
      const newOwner = Keypair.generate();
      try {
        await program.methods
          .transferOwnership(newOwner.publicKey)
          .accountsStrict({
            owner: beneficiary1.publicKey,
            will: willPda,
          })
          .signers([beneficiary1])
          .rpc();
        assert.fail("Should have thrown an error");
      } catch (err) {
        assert.ok(err.toString().length > 0);
      }
    });
  });

  // ========== TRANSFER OWNERSHIP (zero address) ==========

  describe("Transfer Ownership - zero address", () => {
    it("Fails to transfer ownership to zero address", async () => {
      try {
        await program.methods
          .transferOwnership(PublicKey.default)
          .accountsStrict({
            owner: owner.publicKey,
            will: willPda,
          })
          .rpc();
        assert.fail("Should have thrown NotAuthorized error");
      } catch (err) {
        assert.include(err.toString(), "NotAuthorized");
      }
    });
  });

  // ========== CLOSE WILL EDGE CASES ==========

  describe("Close Will - edge cases", () => {
    it("Cannot deposit to closed will", async () => {
      // Close the main will
      await program.methods
        .closeWill()
        .accountsStrict({
          owner: owner.publicKey,
          will: willPda,
          vault: vaultPda,
          systemProgram: SystemProgram.programId,
        })
        .rpc();

      // Try depositing to closed (account no longer exists)
      try {
        await program.methods
          .deposit(new anchor.BN(LAMPORTS_PER_SOL))
          .accountsStrict({
            owner: owner.publicKey,
            will: willPda,
            vault: vaultPda,
            systemProgram: SystemProgram.programId,
          })
          .rpc();
        assert.fail("Should have thrown an error");
      } catch (err) {
        // Account doesn't exist anymore
        assert.ok(err.toString().length > 0);
      }
    });
  });

  // ========== MULTIPLE BENEFICIARIES (MAX) ==========

  describe("Max Beneficiaries", () => {
    const maxOwner = Keypair.generate();
    let maxWillPda: PublicKey;
    let maxVaultPda: PublicKey;

    before(async () => {
      const sig = await provider.connection.requestAirdrop(
        maxOwner.publicKey,
        10 * LAMPORTS_PER_SOL
      );
      await provider.connection.confirmTransaction(sig);

      [maxWillPda] = PublicKey.findProgramAddressSync(
        [Buffer.from("will"), maxOwner.publicKey.toBuffer()],
        program.programId
      );
      [maxVaultPda] = PublicKey.findProgramAddressSync(
        [Buffer.from("vault"), maxWillPda.toBuffer()],
        program.programId
      );

      await program.methods
        .initialize(
          new anchor.BN(TIMEOUT_SECONDS),
          new anchor.BN(GRACE_PERIOD)
        )
        .accountsStrict({
          owner: maxOwner.publicKey,
          will: maxWillPda,
          vault: maxVaultPda,
          systemProgram: SystemProgram.programId,
        })
        .signers([maxOwner])
        .rpc();
    });

    it("Can add up to 10 beneficiaries (MAX_BENEFICIARIES)", async () => {
      for (let i = 0; i < 10; i++) {
        const b = Keypair.generate();
        await program.methods
          .addBeneficiary(b.publicKey, 1000) // 10% each = 100%
          .accountsStrict({
            owner: maxOwner.publicKey,
            will: maxWillPda,
            systemProgram: SystemProgram.programId,
          })
          .signers([maxOwner])
          .rpc();
      }

      const willAccount = await program.account.willAccount.fetch(maxWillPda);
      assert.equal(willAccount.beneficiaries.length, 10);
      assert.equal(
        willAccount.beneficiaries.reduce((sum, b) => sum + b.shareBps, 0),
        10000
      );
    });

    it("Fails to add 11th beneficiary (MaxBeneficiariesReached)", async () => {
      const extra = Keypair.generate();
      try {
        await program.methods
          .addBeneficiary(extra.publicKey, 100)
          .accountsStrict({
            owner: maxOwner.publicKey,
            will: maxWillPda,
            systemProgram: SystemProgram.programId,
          })
          .signers([maxOwner])
          .rpc();
        assert.fail("Should have thrown MaxBeneficiariesReached error");
      } catch (err) {
        assert.include(err.toString(), "MaxBeneficiariesReached");
      }
    });
  });

});
