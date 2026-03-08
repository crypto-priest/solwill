use anchor_lang::prelude::*;
use crate::state::*;
use crate::errors::SolWillError;
use crate::events::OwnershipTransferred;

#[derive(Accounts)]
pub struct TransferOwnership<'info> {
    pub owner: Signer<'info>,

    #[account(
        mut,
        seeds = [b"will", owner.key().as_ref()],
        bump = will.bump,
        has_one = owner @ SolWillError::NotAuthorized,
    )]
    pub will: Account<'info, WillAccount>,
}

pub fn handler(ctx: Context<TransferOwnership>, new_owner: Pubkey) -> Result<()> {
    let will_key = ctx.accounts.will.key();
    let will = &mut ctx.accounts.will;
    let current_time = Clock::get()?.unix_timestamp;

    require!(!will.is_closed, SolWillError::WillClosed);
    require!(!will.is_paused, SolWillError::WillPaused);
    require!(new_owner != will.owner, SolWillError::SameOwner);
    require!(new_owner != Pubkey::default(), SolWillError::NotAuthorized);

    let old_owner = will.owner;
    will.owner = new_owner;
    will.last_checkin = current_time;

    emit!(OwnershipTransferred {
        will: will_key,
        old_owner,
        new_owner,
        timestamp: current_time,
    });

    msg!("Ownership transferred from {} to {}", old_owner, new_owner);
    Ok(())
}
