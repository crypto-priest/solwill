use anchor_lang::prelude::*;
use anchor_lang::system_program;
use crate::state::*;
use crate::errors::SolWillError;
use crate::events::WillClosed;

#[derive(Accounts)]
pub struct CloseWill<'info> {
    #[account(mut)]
    pub owner: Signer<'info>,

    #[account(
        mut,
        seeds = [b"will", owner.key().as_ref()],
        bump = will.bump,
        has_one = owner @ SolWillError::NotAuthorized,
        close = owner,
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

pub fn handler(ctx: Context<CloseWill>) -> Result<()> {
    let will = &ctx.accounts.will;
    let current_time = Clock::get()?.unix_timestamp;

    require!(!will.is_closed, SolWillError::WillClosed);
    require!(!will.is_timed_out(current_time), SolWillError::TimedOut);

    let vault_balance = ctx.accounts.vault.lamports();
    let rent = Rent::get()?;
    let min_balance = rent.minimum_balance(0);

    if vault_balance > min_balance {
        let transfer_amount = vault_balance - min_balance;
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
            transfer_amount,
        )?;

        emit!(WillClosed {
            owner: ctx.accounts.owner.key(),
            will: ctx.accounts.will.key(),
            remaining_balance: transfer_amount,
            timestamp: current_time,
        });

        msg!("Will closed, {} lamports returned to owner", transfer_amount);
    } else {
        emit!(WillClosed {
            owner: ctx.accounts.owner.key(),
            will: ctx.accounts.will.key(),
            remaining_balance: 0,
            timestamp: current_time,
        });

        msg!("Will closed with no remaining balance");
    }

    Ok(())
}
