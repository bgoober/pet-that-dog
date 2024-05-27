use anchor_lang::prelude::*;
use anchor_spl::{associated_token::AssociatedToken, token::{transfer, Mint, Token, TokenAccount, Transfer}};

mod state;

mod contexts;

use contexts::dog::*;

declare_id!("4Z2Tjaw2a4tMUnefnPExQ7sE4UfYSZhZT1pMDKfvAofL");

#[program]
pub mod pet_dat_dog {

    use super::*;

    pub fn dog(ctx: Context<DogContext> , name: String) -> Result<()> {   
        ctx.accounts.dog.new(name);

        ctx.accounts.petsboard.new();

        ctx.accounts.bonkboard.new();

        ctx.accounts.teamboard.new();

        ctx.accounts.vault.new();

        Ok(())
    }

    // pet, taking a User as context
    pub fn pet(ctx: Context<UserContext>) -> Result<()> {
        ctx.accounts.dog.pets += 1;
        Ok(())
    
    }

    // bonk, taking a User as context
    pub fn bonk(ctx: Context<UserContext>) -> Result<()> {
        ctx.accounts.dog.bonks += 1;
        Ok(())
    
    }
}







