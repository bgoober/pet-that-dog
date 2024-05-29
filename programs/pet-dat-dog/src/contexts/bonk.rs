use anchor_lang::prelude::*;
use anchor_spl::{associated_token::AssociatedToken, token::{transfer, Mint, Token, TokenAccount, Transfer}};


use crate::state::Board;
use crate::state::Dog;
use crate::state::User;

#[derive(Accounts)]
pub struct BonkC<'info> {
    #[account(mut)]
    pub user: Signer<'info>,

    // derived from the existing seeds of the dog account
    #[account(mut, seeds = [b"dog", dog.key().as_ref()], bump)]
    pub dog: Account<'info, Dog>,

    // user's global account
    #[account(init_if_needed, payer = user, space = User::INIT_SPACE, seeds = [b"userglobal", user.key().as_ref()], bump)]
    pub user_account: Account<'info, User>,

    // user's dog specific account
    #[account(init_if_needed, payer = user, space = User::INIT_SPACE, seeds = [b"userdog", dog.key().as_ref(), user.key().as_ref()], bump)]
    pub user_dog_account: Account<'info, User>,

    // constraints derived from the dog account 
    #[account(mut, seeds = [b"bonks", dog.key().as_ref()], bump)]
    pub bonkboard: Account<'info, Board>,

    #[account(mut)]
    pub vault: Account<'info, TokenAccount>,

    pub system_program: Program<'info, System>,
}

impl<'info> BonkC<'info> {
    pub fn init(&mut self, bumps: &InitBumps) -> Result<()> {
        self.user_account.set_inner(User {
            pets: 0,
            bonks: 0,
            bump: bumps.user_account,
        });

        self.user_dog_account.set_inner(User {
            pets: 0,
            bonks: 0,
            bump: bumps.user_dog_account,
        });
        Ok(())
    }

    pub fn bonk(&mut self) -> Result<()> {
        self.bonkboard.bonks += 1;
        
        // update the user's account for that dog
        let user_pets = &self.user.pets;

        self.update()?;
        Ok(())
    }

    pub fn update(&mut self) -> Result<()> {
        Ok(())
    }

    pub fn disburse(&mut self) -> Result<()> {
        Ok(())
    }   
}