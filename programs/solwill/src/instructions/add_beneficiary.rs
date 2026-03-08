use anchor_lang::prelude::*;
use crate::state::*;
use crate::errors::SolWillError;
use crate::events::BeneficiaryAdded;

#[derive(Accounts)]
pub struct AddBeneficiary<'info> {
    #[account(mut)]
    pub owner: Signer<'info>,

    #[account(
        mut,
        seeds = [b"will", owner.key().as_ref()],
        bump = will.bump,
        has_one = owner @ SolWillError::NotAuthorized,
        realloc = WILL_ACCOUNT_SIZE,
        realloc::payer = owner,
        realloc::zero = false,
    )]
    pub will: Account<'info, WillAccount>,

    pub system_program: Program<'info, System>,
}

pub fn handler(ctx: Context<AddBeneficiary>, beneficiary_address: Pubkey, share_bps: u16) -> Result<()> {
    let will = &mut ctx.accounts.will;

    require!(!will.is_closed, SolWillError::WillClosed);
    require!(!will.is_paused, SolWillError::WillPaused);
    require!(share_bps > 0, SolWillError::ZeroShare);
    require!(
        will.beneficiaries.len() < MAX_BENEFICIARIES,
        SolWillError::MaxBeneficiariesReached
    );
    require!(
        will.find_beneficiary(&beneficiary_address).is_none(),
        SolWillError::BeneficiaryAlreadyExists
    );
    require!(
        will.total_shares() + share_bps <= 10000,
        SolWillError::ShareOverflow
    );

    will.beneficiaries.push(Beneficiary {
        address: beneficiary_address,
        share_bps,
        has_claimed: false,
    });

    let total = will.total_shares();

    emit!(BeneficiaryAdded {
        owner: ctx.accounts.owner.key(),
        will: ctx.accounts.will.key(),
        beneficiary: beneficiary_address,
        share_bps,
        total_shares: total,
    });

    msg!(
        "Added beneficiary {} with {} bps share",
        beneficiary_address,
        share_bps
    );
    Ok(())
}
