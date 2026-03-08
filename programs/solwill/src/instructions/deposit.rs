use anchor_lang::prelude::*;
use anchor_lang::system_program;
use crate::state::*;
use crate::errors::SolWillError;
use crate::events::SolDeposited;

#[derive(Accounts)]
pub struct Deposit<'info> {
    #[account(mut)]
    pub owner: Signer<'info>,

    #[account(
        mut,
        seeds = [b"will", owner.key().as_ref()],
        bump = will.bump,
        has_one = owner @ SolWillError::NotAuthorized,
    )]
    pub will: Account<'info, WillAccount>,

    /// CHECK: Vault PDA that holds SOL
    #[account(
        mut,
        seeds = [b"vault", will.key().as_ref()],
        bump,
    )]
    pub vault: SystemAccount<'info>,

    pub system_program: Program<'info, System>,
}

pub fn handler(ctx: Context<Deposit>, amount: u64) -> Result<()> {
    let will = &ctx.accounts.will;
    require!(!will.is_closed, SolWillError::WillClosed);
    require!(!will.is_paused, SolWillError::WillPaused);
    require!(amount > 0, SolWillError::ZeroDeposit);

    let owner_key = ctx.accounts.owner.key();
    let will_key = ctx.accounts.will.key();

    system_program::transfer(
        CpiContext::new(
            ctx.accounts.system_program.to_account_info(),
            system_program::Transfer {
                from: ctx.accounts.owner.to_account_info(),
                to: ctx.accounts.vault.to_account_info(),
            },
        ),
        amount,
    )?;

    let will = &mut ctx.accounts.will;
    will.last_checkin = Clock::get()?.unix_timestamp;
    will.total_deposited += amount;

    emit!(SolDeposited {
        owner: owner_key,
        will: will_key,
        amount,
        total_deposited: will.total_deposited,
        timestamp: will.last_checkin,
    });

    msg!("Deposited {} lamports into vault", amount);
    Ok(())
}
