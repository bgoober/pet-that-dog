use anchor_lang::prelude::*;
use session_keys::{session_auth_or, Session, SessionError};

mod context;

use context::*;

mod state;

declare_id!("DNHVjKARnjUuTykjqhbrQ1veV8YFkmqiwP65EKd19YPT");

#[program]
pub mod pet_dat_dog {

    use super::*;

    pub fn init_global(
        ctx: Context<GlobalC>,
        token_name: String,
        token_symbol: String,
        token_uri: String,
    ) -> Result<()> {
        ctx.accounts
            .init(&ctx.bumps, token_name, token_symbol, token_uri)?;
        Ok(())
    }

    pub fn create_dog(ctx: Context<DogC>, name: String) -> Result<()> {
        ctx.accounts.init(name, &ctx.bumps)?;
        Ok(())
    }

    #[session_auth_or(
        ctx.accounts.user.authority.key() == ctx.accounts.signer.key(),
        ErrorCode::SessionError
    )]
    pub fn pet(ctx: Context<PetC>) -> Result<()> {
        ctx.accounts.pet(&ctx.bumps)?;
        Ok(())
    }

    #[session_auth_or(
        ctx.accounts.user.authority.key() == ctx.accounts.signer.key(),
        ErrorCode::SessionError
    )]
    pub fn bonk(ctx: Context<BonkC>) -> Result<()> {
        ctx.accounts.bonk(&ctx.bumps)?;
        Ok(())
    }
}

#[error_code]
pub enum ErrorCode {
    #[msg("Too many pets in one slot!")]
    TooManyPets,
    #[msg("Too many bonksin one slot!")]
    TooManyBonks,
    #[msg("Session error, wrong authority.")]
    SessionError
}
