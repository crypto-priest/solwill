# SolWill - Decentralized Dead Man's Switch for Crypto Inheritance

A Solana smart contract that enables trustless crypto inheritance using a dead man's switch mechanism. Owners deposit SOL, designate beneficiaries with percentage shares, and check in periodically. If the owner stops checking in past a configurable timeout + grace period, beneficiaries can claim their designated share on-chain — no lawyers, custodians, or centralized services required.

## How It Works

1. **Owner creates a will** with a timeout period (e.g., 90 days) and grace period (e.g., 7 days)
2. **Owner deposits SOL** into a program-controlled vault
3. **Owner adds beneficiaries** with percentage shares (in basis points, 10000 = 100%)
4. **Owner checks in periodically** to reset the dead man's switch timer
5. **If the owner stops checking in** and timeout + grace period elapses, beneficiaries can claim their share
6. **Each beneficiary claims independently** — no coordination required

## Architecture

### Account Structure

```
┌─────────────────────────────────────────────┐
│                Will Account (PDA)           │
│  seeds: ["will", owner_pubkey]              │
├─────────────────────────────────────────────┤
│  owner: Pubkey                              │
│  timeout_seconds: u64                       │
│  grace_period: u64                          │
│  last_checkin: i64                          │
│  created_at: i64                            │
│  total_deposited: u64                       │
│  total_withdrawn: u64                       │
│  total_claimed: u64                         │
│  is_paused: bool                            │
│  is_closed: bool                            │
│  bump: u8                                   │
│  vault_bump: u8                             │
│  beneficiaries: Vec<Beneficiary>            │
│    ├── address: Pubkey                      │
│    ├── share_bps: u16                       │
│    └── has_claimed: bool                    │
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│              Vault Account (PDA)            │
│  seeds: ["vault", will_pubkey]              │
├─────────────────────────────────────────────┤
│  Holds deposited SOL                        │
│  Controlled by program via PDA signature    │
└─────────────────────────────────────────────┘
```

### Instructions (12 total)

| Instruction | Caller | Description |
|---|---|---|
| `initialize` | Owner | Create a new will with timeout and grace period |
| `deposit` | Owner | Deposit SOL into the vault (also acts as check-in) |
| `add_beneficiary` | Owner | Add a beneficiary with share in basis points |
| `remove_beneficiary` | Owner | Remove a beneficiary from the will |
| `update_beneficiary` | Owner | Update a beneficiary's share percentage |
| `checkin` | Owner | Reset the dead man's switch timer |
| `withdraw` | Owner | Withdraw SOL (only if not timed out) |
| `update_timeout` | Owner | Update timeout and/or grace period |
| `pause_will` | Owner | Pause the will (blocks deposits, withdrawals, claims) |
| `unpause_will` | Owner | Unpause the will and reset timer |
| `transfer_ownership` | Owner | Transfer will ownership to another address |
| `close_will` | Owner | Close the will and reclaim all funds + rent |
| `claim` | Beneficiary | Claim share after timeout + grace period |

### Events

All instructions emit events for off-chain indexing:

- `WillInitialized` — Will created
- `SolDeposited` — SOL deposited into vault
- `BeneficiaryAdded` — New beneficiary added
- `BeneficiaryRemoved` — Beneficiary removed
- `BeneficiaryShareUpdated` — Beneficiary share changed
- `OwnerCheckedIn` — Owner performed check-in
- `SolWithdrawn` — SOL withdrawn from vault
- `ShareClaimed` — Beneficiary claimed their share
- `WillPausedEvent` — Will paused
- `WillUnpausedEvent` — Will unpaused
- `WillClosed` — Will closed
- `TimeoutUpdated` — Timeout period changed
- `GracePeriodUpdated` — Grace period changed
- `OwnershipTransferred` — Ownership transferred

### Error Codes

| Error | Description |
|---|---|
| `NotAuthorized` | Non-owner calling owner-only instruction |
| `ShareOverflow` | Total shares would exceed 100% (10000 bps) |
| `TimedOut` | Owner tries to withdraw after timeout elapsed |
| `TooEarly` | Beneficiary claims before timeout + grace period |
| `NotBeneficiary` | Caller not in beneficiaries list |
| `AlreadyClaimed` | Beneficiary already claimed their share |
| `BeneficiaryAlreadyExists` | Duplicate beneficiary address |
| `MaxBeneficiariesReached` | Maximum 10 beneficiaries |
| `ZeroDeposit` | Deposit amount is zero |
| `ZeroWithdraw` | Withdrawal amount is zero |
| `InsufficientBalance` | Vault balance too low for withdrawal |
| `ZeroShare` | Share basis points is zero |
| `TimeoutTooShort` | Timeout less than 1 day (86400s) |
| `GracePeriodTooShort` | Grace period less than 1 hour (3600s) |
| `WillPaused` | Action attempted while will is paused |
| `WillClosed` | Action attempted on a closed will |
| `WillNotPaused` | Unpause attempted while will is not paused |
| `BeneficiaryNotFound` | Beneficiary address not found in will |
| `UnclaimedSharesExist` | Cannot close will with unclaimed shares after timeout |
| `CannotUpdateAfterTimeout` | Cannot modify settings after timeout |
| `SameOwner` | Transfer ownership to same address |

## Access Control

```
Owner only:           initialize, deposit, add_beneficiary, remove_beneficiary,
                      update_beneficiary, checkin, withdraw, update_timeout,
                      pause_will, unpause_will, transfer_ownership, close_will

Listed beneficiary:   claim (only after timeout + grace period)
```

## Prerequisites

- [Rust](https://rustup.rs/) (stable toolchain + solana toolchain)
- [Solana CLI](https://docs.solana.com/cli/install-solana-cli-tools) v2.x
- [Anchor](https://www.anchor-lang.com/docs/installation) v0.31.x
- [Node.js](https://nodejs.org/) v18+
- [Yarn](https://yarnpkg.com/)

## Setup

```bash
# Clone the repository
git clone <your-repo-url>
cd solwill

# Install dependencies
yarn install

# Build the program
anchor build

# Run tests
anchor test
```

## Configuration

The will supports the following configurable parameters:

| Parameter | Minimum | Description |
|---|---|---|
| `timeout_seconds` | 86400 (1 day) | How long before the dead man's switch activates |
| `grace_period` | 3600 (1 hour) | Additional buffer after timeout before claims open |
| `share_bps` | 1 | Beneficiary share in basis points (10000 = 100%) |
| Max beneficiaries | — | 10 per will |

## Project Structure

```
solwill/
├── programs/solwill/src/
│   ├── lib.rs                          # Program entry point
│   ├── errors.rs                       # Custom error codes
│   ├── events.rs                       # Event definitions
│   ├── state/
│   │   ├── mod.rs
│   │   └── will.rs                     # WillAccount and Beneficiary structs
│   └── instructions/
│       ├── mod.rs
│       ├── initialize.rs               # Create will
│       ├── deposit.rs                  # Deposit SOL
│       ├── add_beneficiary.rs          # Add beneficiary
│       ├── remove_beneficiary.rs       # Remove beneficiary
│       ├── update_beneficiary.rs       # Update beneficiary share
│       ├── checkin.rs                  # Owner check-in
│       ├── withdraw.rs                 # Withdraw SOL
│       ├── claim.rs                    # Beneficiary claim
│       ├── close_will.rs              # Close and reclaim
│       ├── update_timeout.rs           # Update timeout/grace
│       ├── pause_will.rs              # Pause/unpause
│       └── transfer_ownership.rs       # Transfer ownership
├── tests/
│   └── solwill.ts                      # Integration tests (39 tests)
├── Anchor.toml
├── Cargo.toml
└── package.json
```

## Testing

```bash
# Run all tests
anchor test

# Run tests with logs
anchor test -- --features "anchor-debug"
```

### Test Coverage (39 tests)

- **Initialize** — Will creation with valid parameters
- **Deposit** — SOL deposits, total tracking, zero amount rejection
- **Add Beneficiary** — Adding with shares, duplicate prevention, overflow prevention, zero share rejection
- **Update Beneficiary** — Share updates, overflow validation, non-existent beneficiary
- **Remove Beneficiary** — Removal, non-existent beneficiary
- **Update Timeout** — Timeout/grace period updates, minimum validation
- **Check In** — Timer reset verification
- **Pause/Unpause** — State toggling, blocked operations while paused
- **Withdraw** — SOL withdrawal, zero amount, insufficient balance, timed out
- **Claim** — Pre-timeout rejection, non-beneficiary rejection
- **Transfer Ownership** — Same-address rejection
- **Close Will** — Will closure with fund recovery, re-initialization
- **Account State** — Full field verification

## Deployment

```bash
# Configure for devnet
solana config set --url devnet

# Generate a new keypair (if needed)
solana-keygen new

# Airdrop SOL for deployment
solana airdrop 2

# Build and deploy
anchor build
anchor deploy

# Verify deployment
solana program show <PROGRAM_ID>
```

## Security Considerations

- **PDA-controlled vault**: No individual can withdraw without meeting program conditions
- **Basis point validation**: Total shares cannot exceed 10000 (100%)
- **Double-claim prevention**: `has_claimed` flag per beneficiary
- **Time-based access control**: Claims only after timeout + grace period
- **Pause mechanism**: Owner can freeze operations in emergencies
- **Rent-exempt protection**: Withdrawals and claims preserve minimum rent balance

## License

MIT
