use anchor_lang::prelude::*;

pub mod errors;
pub mod events;
pub mod instructions;
pub mod state;

use instructions::*;

declare_id!("4bfagECyGUMHaaQF9mfTvJBpmyxTVFhzPNhb3xfTPMfF");

#[program]
pub mod solwill {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>, timeout_seconds: u64, grace_period: u64) -> Result<()> {
        instructions::initialize::handler(ctx, timeout_seconds, grace_period)
    }

    pub fn deposit(ctx: Context<Deposit>, amount: u64) -> Result<()> {
        instructions::deposit::handler(ctx, amount)
    }

    pub fn add_beneficiary(ctx: Context<AddBeneficiary>, beneficiary_address: Pubkey, share_bps: u16) -> Result<()> {
        instructions::add_beneficiary::handler(ctx, beneficiary_address, share_bps)
    }

    pub fn remove_beneficiary(ctx: Context<RemoveBeneficiary>, beneficiary_address: Pubkey) -> Result<()> {
        instructions::remove_beneficiary::handler(ctx, beneficiary_address)
    }

    pub fn update_beneficiary(ctx: Context<UpdateBeneficiary>, beneficiary_address: Pubkey, new_share_bps: u16) -> Result<()> {
        instructions::update_beneficiary::handler(ctx, beneficiary_address, new_share_bps)
    }

    pub fn checkin(ctx: Context<CheckIn>) -> Result<()> {
        instructions::checkin::handler(ctx)
    }

    pub fn withdraw(ctx: Context<Withdraw>, amount: u64) -> Result<()> {
        instructions::withdraw::handler(ctx, amount)
    }

    pub fn claim(ctx: Context<Claim>) -> Result<()> {
        instructions::claim::handler(ctx)
    }

    pub fn close_will(ctx: Context<CloseWill>) -> Result<()> {
        instructions::close_will::handler(ctx)
    }

    pub fn update_timeout(ctx: Context<UpdateTimeout>, new_timeout: Option<u64>, new_grace_period: Option<u64>) -> Result<()> {
        instructions::update_timeout::handler(ctx, new_timeout, new_grace_period)
    }

    pub fn pause_will(ctx: Context<PauseWill>) -> Result<()> {
        instructions::pause_will::pause_handler(ctx)
    }

    pub fn unpause_will(ctx: Context<PauseWill>) -> Result<()> {
        instructions::pause_will::unpause_handler(ctx)
    }

    pub fn transfer_ownership(ctx: Context<TransferOwnership>, new_owner: Pubkey) -> Result<()> {
        instructions::transfer_ownership::handler(ctx, new_owner)
    }
}
