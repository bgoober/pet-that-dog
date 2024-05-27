use anchor_lang::prelude::*;
use anchor_spl::{
    associated_token::AssociatedToken,
    token::{transfer, Mint, Token, TokenAccount, Transfer},
};

use crate::state::Board;
use crate::state::Dog;
use crate::state::User;

// User context
#[derive(Accounts)]
pub struct UserContext<'info> {
    #[account(mut)]
    pub user: Signer<'info>,

    // init the user account with seeds [b"user", user.key().as_ref()]
    #[account(init, payer = user, seeds = [b"user", user.key().as_ref()], bump, space = User::INIT_SPACE)]
    pub user_account: Account<'info, User>,

    // derived from the existing seeds of the dog account
    #[account(mut, seeds = [b"dog", dog.key().as_ref()], bump)]
    pub dog: Account<'info, Dog>,

    // constraints derived from the dog account
    #[account(mut, seeds = [b"pets", dog.key().as_ref()], bump)]
    pub petsboard: Account<'info, Board>,

    // derive the bonkboard account from the dog account
    #[account(mut, seeds = [b"bonks", dog.key().as_ref()], bump)]
    pub bonkboard: Account<'info, Board>,

    // derive the teamboard account from the dog account
    #[account(mut, seeds = [b"team", dog.key().as_ref()], bump)]
    pub teamboard: Account<'info, Board>,

    #[account(mut)]
    pub vault: Account<'info, TokenAccount>,

    pub system_program: Program<'info, System>,
}

impl<'info> UserContext<'info> {
    pub fn init(&mut self, pets: u64, bonks: u64, bumps: &UserContextBumps) -> Result<()> {
        self.user_account.set_inner(User {
            pets,
            bonks,
            bump: bumps.dog,
        });
        Ok(())
    }

    // pet function that increments the user's pets by 1
    pub fn pet(&mut self) -> Result<()> {
        self.user_account.pets += 1;
        
        self.update()?;
        Ok(())
    }

    // bonk function that increments the user's bonks by 1
    pub fn bonk(&mut self) -> Result<()> {
        self.user_account.bonks += 1;

        self.update()?;
        Ok(())
    }

    // update leaderboard
    pub fn update(&mut self) -> Result<()> {
        Ok(())
    }  
}