use anchor_lang::prelude::*;
use crate::state::*;
use crate::errors::SolWillError;
use crate::events::OwnerCheckedIn;

#[derive(Accounts)]
pub struct CheckIn<'info> {
    pub owner: Signer<'info>,

    #[account(
        mut,
        seeds = [b"will", owner.key().as_ref()],
        bump = will.bump,
        has_one = owner @ SolWillError::NotAuthorized,
    )]
    pub will: Account<'info, WillAccount>,
}

pub fn handler(ctx: Context<CheckIn>) -> Result<()> {
    let owner_key = ctx.accounts.owner.key();
    let will_key = ctx.accounts.will.key();
    let will = &mut ctx.accounts.will;

    require!(!will.is_closed, SolWillError::WillClosed);
    require!(!will.is_paused, SolWillError::WillPaused);

    will.last_checkin = Clock::get()?.unix_timestamp;

    emit!(OwnerCheckedIn {
        owner: owner_key,
        will: will_key,
        timestamp: will.last_checkin,
    });

    msg!("Owner checked in at {}", will.last_checkin);
    Ok(())
}
