use anchor_lang::prelude::*;

#[event]
pub struct WillInitialized {
    pub owner: Pubkey,
    pub will: Pubkey,
    pub timeout_seconds: u64,
    pub grace_period: u64,
    pub timestamp: i64,
}

#[event]
pub struct SolDeposited {
    pub owner: Pubkey,
    pub will: Pubkey,
    pub amount: u64,
    pub total_deposited: u64,
    pub timestamp: i64,
}

#[event]
pub struct BeneficiaryAdded {
    pub owner: Pubkey,
    pub will: Pubkey,
    pub beneficiary: Pubkey,
    pub share_bps: u16,
    pub total_shares: u16,
}

#[event]
pub struct BeneficiaryRemoved {
    pub owner: Pubkey,
    pub will: Pubkey,
    pub beneficiary: Pubkey,
    pub share_bps: u16,
}

#[event]
pub struct BeneficiaryShareUpdated {
    pub owner: Pubkey,
    pub will: Pubkey,
    pub beneficiary: Pubkey,
    pub old_share_bps: u16,
    pub new_share_bps: u16,
}

#[event]
pub struct OwnerCheckedIn {
    pub owner: Pubkey,
    pub will: Pubkey,
    pub timestamp: i64,
}

#[event]
pub struct SolWithdrawn {
    pub owner: Pubkey,
    pub will: Pubkey,
    pub amount: u64,
    pub total_withdrawn: u64,
    pub timestamp: i64,
}

#[event]
pub struct ShareClaimed {
    pub beneficiary: Pubkey,
    pub will: Pubkey,
    pub amount: u64,
    pub share_bps: u16,
    pub total_claimed: u64,
}

#[event]
pub struct WillPausedEvent {
    pub owner: Pubkey,
    pub will: Pubkey,
    pub timestamp: i64,
}

#[event]
pub struct WillUnpausedEvent {
    pub owner: Pubkey,
    pub will: Pubkey,
    pub timestamp: i64,
}

#[event]
pub struct WillClosed {
    pub owner: Pubkey,
    pub will: Pubkey,
    pub remaining_balance: u64,
    pub timestamp: i64,
}

#[event]
pub struct TimeoutUpdated {
    pub owner: Pubkey,
    pub will: Pubkey,
    pub old_timeout: u64,
    pub new_timeout: u64,
}

#[event]
pub struct GracePeriodUpdated {
    pub owner: Pubkey,
    pub will: Pubkey,
    pub old_grace_period: u64,
    pub new_grace_period: u64,
}

#[event]
pub struct OwnershipTransferred {
    pub will: Pubkey,
    pub old_owner: Pubkey,
    pub new_owner: Pubkey,
    pub timestamp: i64,
}
