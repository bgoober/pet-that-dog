use anchor_lang::prelude::*;
use anchor_spl::{associated_token::AssociatedToken, token::{transfer, Mint, Token, TokenAccount, Transfer}};

mod state;

mod contexts;

use contexts::dog::*;

use contexts::pet::*;

use contexts::bonk::*;

declare_id!("4Z2Tjaw2a4tMUnefnPExQ7sE4UfYSZhZT1pMDKfvAofL");

#[program]
pub mod pet_dat_dog {

    use super::*;

    pub fn create_dog(ctx: Context<DogC>, name: String, params: InitTokenParams, team: Vec<(Pubkey, u8)>) -> Result<()> {   
        ctx.accounts.init(name, team, params, &ctx.bumps)?;
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







