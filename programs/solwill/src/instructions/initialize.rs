use anchor_lang::prelude::*;
use crate::state::*;
use crate::errors::SolWillError;
use crate::events::WillInitialized;

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(mut)]
    pub owner: Signer<'info>,

    #[account(
        init,
        payer = owner,
        space = WILL_ACCOUNT_SIZE,
        seeds = [b"will", owner.key().as_ref()],
        bump,
    )]
    pub will: Account<'info, WillAccount>,

    /// CHECK: Vault PDA that holds SOL, no data needed
    #[account(
        mut,
        seeds = [b"vault", will.key().as_ref()],
        bump,
    )]
    pub vault: SystemAccount<'info>,

    pub system_program: Program<'info, System>,
}

pub fn handler(ctx: Context<Initialize>, timeout_seconds: u64, grace_period: u64) -> Result<()> {
    require!(timeout_seconds >= 86400, SolWillError::TimeoutTooShort);
    require!(grace_period >= 3600, SolWillError::GracePeriodTooShort);

    let current_time = Clock::get()?.unix_timestamp;
    let will = &mut ctx.accounts.will;
    will.owner = ctx.accounts.owner.key();
    will.timeout_seconds = timeout_seconds;
    will.grace_period = grace_period;
    will.last_checkin = current_time;
    will.created_at = current_time;
    will.total_deposited = 0;
    will.total_withdrawn = 0;
    will.total_claimed = 0;
    will.is_paused = false;
    will.is_closed = false;
    will.bump = ctx.bumps.will;
    will.vault_bump = ctx.bumps.vault;
    will.beneficiaries = Vec::new();

    emit!(WillInitialized {
        owner: ctx.accounts.owner.key(),
        will: ctx.accounts.will.key(),
        timeout_seconds,
        grace_period,
        timestamp: current_time,
    });

    msg!("Will initialized with timeout: {}s, grace period: {}s", timeout_seconds, grace_period);
    Ok(())
}
