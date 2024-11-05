use anchor_lang::prelude::*;

// use mpl_core::{
//     instructions::{CreateCollectionV2CpiBuilder, CreateV2CpiBuilder},
//     types::{Creator, Plugin, PluginAuthority, PluginAuthorityPair, Royalties, RuleSet},
// };

// use std::str::FromStr;

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

    pub fn create_collection(ctx: Context<CreateCollection>) -> Result<()> {
        ctx.accounts.create_collection()?;
        Ok(())
    }

    pub fn create_asset(ctx: Context<CreateAsset>) -> Result<()> {
        ctx.accounts.create_asset()?;
        Ok(())
    }

    pub fn create_dog(ctx: Context<DogC>, name: String) -> Result<()> {
        ctx.accounts.init(name, &ctx.bumps)?;
        Ok(())
    }

    // pet, taking a User as context
    pub fn pet(ctx: Context<PetC>) -> Result<()> {
        ctx.accounts.pet()?;
        Ok(())
    }

    // bonk, taking a User as context
    pub fn bonk(ctx: Context<BonkC>) -> Result<()> {
        ctx.accounts.bonk()?;
        Ok(())
    }
}

#[error_code]
pub enum ErrorCode {
    #[msg("Too many pets in one slot!")]
    TooManyPets,
    #[msg("Too many bonksin one slot!")]
    TooManyBonks,
    #[msg("Session error")]
    SessionError,
}
