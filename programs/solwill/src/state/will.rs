use anchor_lang::prelude::*;

pub const MAX_BENEFICIARIES: usize = 10;

// 8 (discriminator) + 32 (owner) + 8 (timeout) + 8 (grace) + 8 (last_checkin)
// + 8 (created_at) + 8 (total_deposited) + 8 (total_withdrawn) + 8 (total_claimed)
// + 1 (is_paused) + 1 (is_closed) + 1 (bump) + 1 (vault_bump)
// + 4 (vec length prefix) + MAX_BENEFICIARIES * Beneficiary::SIZE
pub const WILL_ACCOUNT_SIZE: usize = 8 + 32 + 8 + 8 + 8 + 8 + 8 + 8 + 8 + 1 + 1 + 1 + 1 + 4 + (MAX_BENEFICIARIES * Beneficiary::SIZE);

#[account]
pub struct WillAccount {
    pub owner: Pubkey,
    pub timeout_seconds: u64,
    pub grace_period: u64,
    pub last_checkin: i64,
    pub created_at: i64,
    pub total_deposited: u64,
    pub total_withdrawn: u64,
    pub total_claimed: u64,
    pub is_paused: bool,
    pub is_closed: bool,
    pub bump: u8,
    pub vault_bump: u8,
    pub beneficiaries: Vec<Beneficiary>,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Debug, PartialEq)]
pub struct Beneficiary {
    pub address: Pubkey,
    pub share_bps: u16,
    pub has_claimed: bool,
}

impl Beneficiary {
    // 32 (address) + 2 (share_bps) + 1 (has_claimed)
    pub const SIZE: usize = 32 + 2 + 1;
}

impl WillAccount {
    pub fn total_shares(&self) -> u16 {
        self.beneficiaries.iter().map(|b| b.share_bps).sum()
    }

    pub fn is_timed_out(&self, current_time: i64) -> bool {
        current_time > self.last_checkin + self.timeout_seconds as i64
    }

    pub fn is_claimable(&self, current_time: i64) -> bool {
        current_time > self.last_checkin + self.timeout_seconds as i64 + self.grace_period as i64
    }

    pub fn find_beneficiary(&self, address: &Pubkey) -> Option<usize> {
        self.beneficiaries.iter().position(|b| b.address == *address)
    }
}
