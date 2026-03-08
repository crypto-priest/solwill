use anchor_lang::prelude::*;
use crate::state::*;
use crate::errors::SolWillError;
use crate::events::BeneficiaryRemoved;

#[derive(Accounts)]
pub struct RemoveBeneficiary<'info> {
    #[account(mut)]
    pub owner: Signer<'info>,

    #[account(
        mut,
        seeds = [b"will", owner.key().as_ref()],
        bump = will.bump,
        has_one = owner @ SolWillError::NotAuthorized,
    )]
    pub will: Account<'info, WillAccount>,
}

pub fn handler(ctx: Context<RemoveBeneficiary>, beneficiary_address: Pubkey) -> Result<()> {
    let owner_key = ctx.accounts.owner.key();
    let will_key = ctx.accounts.will.key();
    let will = &mut ctx.accounts.will;

    require!(!will.is_closed, SolWillError::WillClosed);
    require!(!will.is_paused, SolWillError::WillPaused);

    let index = will
        .find_beneficiary(&beneficiary_address)
        .ok_or(SolWillError::BeneficiaryNotFound)?;

    let removed_share = will.beneficiaries[index].share_bps;
    will.beneficiaries.remove(index);

    emit!(BeneficiaryRemoved {
        owner: owner_key,
        will: will_key,
        beneficiary: beneficiary_address,
        share_bps: removed_share,
    });

    msg!("Removed beneficiary {} with {} bps share", beneficiary_address, removed_share);
    Ok(())
}
