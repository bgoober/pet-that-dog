#![allow(unexpected_cfgs)]

use anchor_lang::prelude::*;
use solana_security_txt::security_txt;

mod context;

use context::*;

mod state;

declare_id!("5MAGgYWgNF8KtNegKMhZxNbugrgzkLDUe9Vy2y4STRwX");

#[cfg(not(feature = "no-entrypoint"))]
security_txt! {
    name: "pet that dog!",
    project_url: "https://pet-that-dog.vercel.app",
    contacts: "twitter:@pet_thatdog,email:pet-that-dog@protonmail.com",
    policy: "https://github.com/bgoober/pet-that-dog/security/policy",
    preferred_languages: "en",
    source_code: "https://github.com/bgoober/pet-that-dog",
    auditors: "None",
    acknowledgements: "Turbin3"
}

#[program]
pub mod pet_that_dog {

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

    pub fn pet(ctx: Context<InteractC>) -> Result<()> {
        ctx.accounts.pet(&ctx.bumps)?;
        Ok(())
    }

    pub fn bonk(ctx: Context<InteractC>) -> Result<()> {
        ctx.accounts.bonk(&ctx.bumps)?;
        Ok(())
    }

    pub fn wif(ctx: Context<InteractC>) -> Result<()> {
        ctx.accounts.wif(&ctx.bumps)?;
        Ok(())
    }

    pub fn pnut(ctx: Context<InteractC>) -> Result<()> {
        ctx.accounts.pnut(&ctx.bumps)?;
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
