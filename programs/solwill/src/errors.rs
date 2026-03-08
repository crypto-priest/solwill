use anchor_lang::prelude::*;

#[error_code]
pub enum SolWillError {
    #[msg("You are not authorized to perform this action")]
    NotAuthorized,

    #[msg("Total beneficiary shares would exceed 100% (10000 basis points)")]
    ShareOverflow,

    #[msg("The timeout period has elapsed, owner can no longer withdraw")]
    TimedOut,

    #[msg("The timeout + grace period has not yet elapsed")]
    TooEarly,

    #[msg("The caller is not a listed beneficiary")]
    NotBeneficiary,

    #[msg("This beneficiary has already claimed their share")]
    AlreadyClaimed,

    #[msg("The beneficiary already exists in the will")]
    BeneficiaryAlreadyExists,

    #[msg("Maximum number of beneficiaries reached")]
    MaxBeneficiariesReached,

    #[msg("Deposit amount must be greater than zero")]
    ZeroDeposit,

    #[msg("Withdrawal amount must be greater than zero")]
    ZeroWithdraw,

    #[msg("Insufficient vault balance for withdrawal")]
    InsufficientBalance,

    #[msg("Share basis points must be greater than zero")]
    ZeroShare,

    #[msg("Timeout must be at least 1 day (86400 seconds)")]
    TimeoutTooShort,

    #[msg("Grace period must be at least 1 hour (3600 seconds)")]
    GracePeriodTooShort,

    #[msg("The will is currently paused")]
    WillPaused,

    #[msg("The will is already closed")]
    WillClosed,

    #[msg("The will is not paused")]
    WillNotPaused,

    #[msg("The beneficiary was not found in the will")]
    BeneficiaryNotFound,

    #[msg("Cannot close will while there are unclaimed shares after timeout")]
    UnclaimedSharesExist,

    #[msg("Cannot update timeout or grace period after the will has timed out")]
    CannotUpdateAfterTimeout,

    #[msg("Cannot transfer ownership to the same address")]
    SameOwner,
}
