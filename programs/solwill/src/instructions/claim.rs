use anchor_lang::prelude::*;
use anchor_lang::system_program;
use crate::state::*;
use crate::errors::SolWillError;
use crate::events::ShareClaimed;

#[derive(Accounts)]
pub struct Claim<'info> {
    #[account(mut)]
    pub beneficiary: Signer<'info>,

    #[account(
        mut,
        seeds = [b"will", will.owner.as_ref()],
        bump = will.bump,
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

pub fn handler(ctx: Context<Claim>) -> Result<()> {
    let will = &ctx.accounts.will;
    let current_time = Clock::get()?.unix_timestamp;
    let beneficiary_key = ctx.accounts.beneficiary.key();

    require!(!will.is_closed, SolWillError::WillClosed);
    require!(!will.is_paused, SolWillError::WillPaused);
    require!(will.is_claimable(current_time), SolWillError::TooEarly);

    let beneficiary_index = will
        .find_beneficiary(&beneficiary_key)
        .ok_or(SolWillError::NotBeneficiary)?;

    let beneficiary_data = &will.beneficiaries[beneficiary_index];
    require!(!beneficiary_data.has_claimed, SolWillError::AlreadyClaimed);

    let share_bps = beneficiary_data.share_bps;

    let vault_balance = ctx.accounts.vault.lamports();
    let rent = Rent::get()?;
    let min_balance = rent.minimum_balance(0);
    let available_balance = vault_balance.saturating_sub(min_balance);

    let claim_amount = (available_balance as u128)
        .checked_mul(share_bps as u128)
        .unwrap()
        .checked_div(10000)
        .unwrap() as u64;

    let will_key = ctx.accounts.will.key();
    let vault_bump = ctx.bumps.vault;
    let signer_seeds: &[&[&[u8]]] = &[&[b"vault", will_key.as_ref(), &[vault_bump]]];

    system_program::transfer(
        CpiContext::new_with_signer(
            ctx.accounts.system_program.to_account_info(),
            system_program::Transfer {
                from: ctx.accounts.vault.to_account_info(),
                to: ctx.accounts.beneficiary.to_account_info(),
            },
            signer_seeds,
        ),
        claim_amount,
    )?;

    let will = &mut ctx.accounts.will;
    will.beneficiaries[beneficiary_index].has_claimed = true;
    will.total_claimed = will.total_claimed.saturating_add(claim_amount);

    emit!(ShareClaimed {
        beneficiary: beneficiary_key,
        will: will_key,
        amount: claim_amount,
        share_bps,
        total_claimed: will.total_claimed,
    });

    msg!(
        "Beneficiary {} claimed {} lamports",
        beneficiary_key,
        claim_amount
    );
    Ok(())
}
