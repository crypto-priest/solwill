use anchor_lang::prelude::*;
use crate::state::*;
use crate::errors::SolWillError;
use crate::events::BeneficiaryShareUpdated;

#[derive(Accounts)]
pub struct UpdateBeneficiary<'info> {
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

pub fn handler(ctx: Context<UpdateBeneficiary>, beneficiary_address: Pubkey, new_share_bps: u16) -> Result<()> {
    let owner_key = ctx.accounts.owner.key();
    let will_key = ctx.accounts.will.key();
    let will = &mut ctx.accounts.will;

    require!(!will.is_closed, SolWillError::WillClosed);
    require!(!will.is_paused, SolWillError::WillPaused);
    require!(new_share_bps > 0, SolWillError::ZeroShare);

    let index = will
        .find_beneficiary(&beneficiary_address)
        .ok_or(SolWillError::BeneficiaryNotFound)?;

    let old_share = will.beneficiaries[index].share_bps;
    let other_shares: u16 = will.beneficiaries.iter()
        .enumerate()
        .filter(|(i, _)| *i != index)
        .map(|(_, b)| b.share_bps)
        .sum();

    require!(
        other_shares + new_share_bps <= 10000,
        SolWillError::ShareOverflow
    );

    will.beneficiaries[index].share_bps = new_share_bps;

    emit!(BeneficiaryShareUpdated {
        owner: owner_key,
        will: will_key,
        beneficiary: beneficiary_address,
        old_share_bps: old_share,
        new_share_bps,
    });

    msg!(
        "Updated beneficiary {} share from {} to {} bps",
        beneficiary_address, old_share, new_share_bps
    );
    Ok(())
}
