use anchor_lang::prelude::*;
use crate::state::*;
use crate::errors::SolWillError;
use crate::events::{TimeoutUpdated, GracePeriodUpdated};

#[derive(Accounts)]
pub struct UpdateTimeout<'info> {
    pub owner: Signer<'info>,

    #[account(
        mut,
        seeds = [b"will", owner.key().as_ref()],
        bump = will.bump,
        has_one = owner @ SolWillError::NotAuthorized,
    )]
    pub will: Account<'info, WillAccount>,
}

pub fn handler(ctx: Context<UpdateTimeout>, new_timeout: Option<u64>, new_grace_period: Option<u64>) -> Result<()> {
    let owner_key = ctx.accounts.owner.key();
    let will_key = ctx.accounts.will.key();
    let will = &mut ctx.accounts.will;
    let current_time = Clock::get()?.unix_timestamp;

    require!(!will.is_closed, SolWillError::WillClosed);
    require!(!will.is_paused, SolWillError::WillPaused);
    require!(!will.is_timed_out(current_time), SolWillError::CannotUpdateAfterTimeout);

    if let Some(timeout) = new_timeout {
        require!(timeout >= 86400, SolWillError::TimeoutTooShort);
        let old_timeout = will.timeout_seconds;
        will.timeout_seconds = timeout;

        emit!(TimeoutUpdated {
            owner: owner_key,
            will: will_key,
            old_timeout,
            new_timeout: timeout,
        });

        msg!("Timeout updated from {}s to {}s", old_timeout, timeout);
    }

    if let Some(grace) = new_grace_period {
        require!(grace >= 3600, SolWillError::GracePeriodTooShort);
        let old_grace = will.grace_period;
        will.grace_period = grace;

        emit!(GracePeriodUpdated {
            owner: owner_key,
            will: will_key,
            old_grace_period: old_grace,
            new_grace_period: grace,
        });

        msg!("Grace period updated from {}s to {}s", old_grace, grace);
    }

    Ok(())
}
