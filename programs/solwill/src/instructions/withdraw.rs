use anchor_lang::prelude::*;
use anchor_lang::system_program;
use crate::state::*;
use crate::errors::SolWillError;
use crate::events::SolWithdrawn;

#[derive(Accounts)]
pub struct Withdraw<'info> {
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

pub fn handler(ctx: Context<Withdraw>, amount: u64) -> Result<()> {
    let will = &ctx.accounts.will;
    let current_time = Clock::get()?.unix_timestamp;

    require!(!will.is_closed, SolWillError::WillClosed);
    require!(!will.is_paused, SolWillError::WillPaused);
    require!(amount > 0, SolWillError::ZeroWithdraw);
    require!(!will.is_timed_out(current_time), SolWillError::TimedOut);

    let vault_balance = ctx.accounts.vault.lamports();
    let rent = Rent::get()?;
    let min_balance = rent.minimum_balance(0);
    let available = vault_balance.saturating_sub(min_balance);
    require!(amount <= available, SolWillError::InsufficientBalance);

    let will_key = ctx.accounts.will.key();
    let vault_bump = ctx.bumps.vault;
    let signer_seeds: &[&[&[u8]]] = &[&[b"vault", will_key.as_ref(), &[vault_bump]]];

    system_program::transfer(
        CpiContext::new_with_signer(
            ctx.accounts.system_program.to_account_info(),
            system_program::Transfer {
                from: ctx.accounts.vault.to_account_info(),
                to: ctx.accounts.owner.to_account_info(),
            },
            signer_seeds,
        ),
        amount,
    )?;

    let owner_key = ctx.accounts.owner.key();
    let will = &mut ctx.accounts.will;
    will.last_checkin = Clock::get()?.unix_timestamp;
    will.total_withdrawn += amount;

    emit!(SolWithdrawn {
        owner: owner_key,
        will: will_key,
        amount,
        total_withdrawn: will.total_withdrawn,
        timestamp: will.last_checkin,
    });

    msg!("Withdrew {} lamports from vault", amount);
    Ok(())
}
