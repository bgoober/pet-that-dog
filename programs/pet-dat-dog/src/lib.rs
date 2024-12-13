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
        ctx.accounts.init(name, token_name, token_symbol, token_uri, &ctx.bumps)?;
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

}

#[error_code]
pub enum ErrorCode {
    #[msg("Too much love at one time! Don't hog all the love!")]
    TooMuchLove,
    #[msg("Only the dog owner can close this account.")]
    UnauthorizedClose,
}

