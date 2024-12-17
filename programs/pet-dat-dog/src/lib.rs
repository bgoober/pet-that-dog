use anchor_lang::prelude::*;

mod context;

use context::*;

mod state;

declare_id!("DXe7XXXBiBf4Btb9c5DTH9ikUhzcprwxn7B7SuFif2bW");

#[program]
pub mod pet_dat_dog {

    use super::*;

    pub fn init_global(ctx: Context<GlobalC>) -> Result<()> {
        ctx.accounts.init(&ctx.bumps)?;
        Ok(())
    }

    pub fn create_dog(
        ctx: Context<CreateDogC>,
        name: String,
        token_name: String,
        token_symbol: String,
        token_uri: String,
    ) -> Result<()> {
        ctx.accounts
            .init(name, token_name, token_symbol, token_uri, &ctx.bumps)?;
        Ok(())
    }

    #[session_auth_or(
        ctx.accounts.user.authority.key() == ctx.accounts.signer.key(),
        SessionError::InvalidToken
    )]
    pub fn pet(ctx: Context<InteractC>) -> Result<()> {
        ctx.accounts.pet()?;
        Ok(())
    }

    #[session_auth_or(
        ctx.accounts.user.authority.key() == ctx.accounts.signer.key(),
        SessionError::InvalidToken
    )]
    pub fn bonk(ctx: Context<InteractC>) -> Result<()> {
        ctx.accounts.bonk()?;
        Ok(())
    }

    #[session_auth_or(
        ctx.accounts.user.authority.key() == ctx.accounts.signer.key(),
        SessionError::InvalidToken
    )]
    pub fn wif(ctx: Context<InteractC>) -> Result<()> {
        ctx.accounts.wif()?;
        Ok(())
    }

    #[session_auth_or(
        ctx.accounts.user.authority.key() == ctx.accounts.signer.key(),
        SessionError::InvalidToken
    )]
    pub fn pnut(ctx: Context<InteractC>) -> Result<()> {
        ctx.accounts.pnut()?;
        Ok(())
    }

    pub fn kill_dog(ctx: Context<KillDogC>) -> Result<()> {
        ctx.accounts.kill()?;
        Ok(())
    }

    pub fn close_user(ctx: Context<CloseUserC>) -> Result<()> {
        ctx.accounts.close()?;
        Ok(())
    }

    pub fn init_user(ctx: Context<InitUserC>) -> Result<()> {
        ctx.accounts.init(&ctx.bumps)?;
        Ok(())
    }
}

#[error_code]
pub enum ErrorCode {
    #[msg("Too much love at one time! Don't hog all the love!")]
    TooMuchLove,
    #[msg("Only the dog owner can close this account.")]
    UnauthorizedClose,
    #[msg("The signer is not the authority of the user's account.")]
    UnauthorizedUserClose,
}
