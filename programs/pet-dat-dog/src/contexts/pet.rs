use anchor_lang::prelude::*;
use anchor_spl::{associated_token::AssociatedToken, token::{transfer, Mint, Token, TokenAccount, Transfer}};

use crate::state::Board;
use crate::state::Dog;
use crate::state::User;


#[derive(Accounts)]
pub struct PetC<'info> {
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
    #[account(mut, seeds = [b"pets", dog.key().as_ref()], bump)]
    pub petsboard: Account<'info, Board>,

    #[account(mut)]
    pub vault: Account<'info, TokenAccount>,

    // mint to call to mint the user a token for each pet function call, from the dog's mint
    #[account(mut, seeds = [b"dog", dog.key().as_ref()], bump)]
    pub mint: Account<'info, Mint>,

    pub system_program: Program<'info, System>,
}

impl<'info> PetC<'info> {
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

    pub fn pet(&mut self) -> Result<()> {
        self.dog.pets += 1;
        self.user_account.pets += 1;
        self.user_dog_account.pets += 1;
        
        self.update_board()?;
        Ok(())
    }

    pub fn update_board(&mut self) -> Result<()> {
        // Create a User object with the user's public key and their pets
        let user = User {
            pets: self.user_dog_account.pets,
            bonks: self.user_dog_account.bonks,
            bump: self.user_account.bump,
            // You might need to add other fields here depending on the definition of the User struct
        };
    
        // Push the User object to the members vector
        self.petsboard.members.push(user);
    
        // Sort the members vector by the number of pets in descending order
        self.petsboard.members.sort_by(|a, b| b.pets.cmp(&a.pets));
    
        // Truncate the members vector to keep only the top 10 users
        self.petsboard.members.truncate(10);    
    
        Ok(())
    }
}