use anchor_lang::prelude::*;
use crate::state::*;
use crate::errors::SolWillError;
use crate::events::{WillPausedEvent, WillUnpausedEvent};

#[derive(Accounts)]
pub struct PauseWill<'info> {
    pub owner: Signer<'info>,

    #[account(
        mut,
        seeds = [b"will", owner.key().as_ref()],
        bump = will.bump,
        has_one = owner @ SolWillError::NotAuthorized,
    )]
    pub will: Account<'info, WillAccount>,
}

pub fn pause_handler(ctx: Context<PauseWill>) -> Result<()> {
    let will = &mut ctx.accounts.will;
    let current_time = Clock::get()?.unix_timestamp;

    require!(!will.is_closed, SolWillError::WillClosed);
    require!(!will.is_paused, SolWillError::WillPaused);

    will.is_paused = true;
    will.last_checkin = current_time;

    emit!(WillPausedEvent {
        owner: ctx.accounts.owner.key(),
        will: ctx.accounts.will.key(),
        timestamp: current_time,
    });

    msg!("Will paused at {}", current_time);
    Ok(())
}

pub fn unpause_handler(ctx: Context<PauseWill>) -> Result<()> {
    let will = &mut ctx.accounts.will;
    let current_time = Clock::get()?.unix_timestamp;

    require!(!will.is_closed, SolWillError::WillClosed);
    require!(will.is_paused, SolWillError::WillNotPaused);

    will.is_paused = false;
    will.last_checkin = current_time;

    emit!(WillUnpausedEvent {
        owner: ctx.accounts.owner.key(),
        will: ctx.accounts.will.key(),
        timestamp: current_time,
    });

    msg!("Will unpaused at {}", current_time);
    Ok(())
}
