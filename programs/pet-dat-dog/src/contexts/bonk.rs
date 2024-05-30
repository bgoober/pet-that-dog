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
    pub fn init(&mut self, bumps: &BonkCBumps) -> Result<()> {
        
        let slot = Clock::get()?.slot;

        self.user_account.set_inner(User {
            pets: 0,
            bonks: 0,
            last_pet: 0,
            last_bonk: 0,
            bump: bumps.user_account,
        });

        self.user_dog_account.set_inner(User {
            pets: 0,
            bonks: 0,
            last_pet: 0,
            last_bonk: 0,
            bump: bumps.user_dog_account,
        });
        Ok(())
    }

    pub fn bonk(&mut self) -> Result<()> {
        self.dog.bonks += 1;
        
        // update the user's account for that dog
        let user_bonks = &self.user_account.bonks;
        let user_dog_bonks = &self.user_dog_account.bonks;

        self.user_account.bonks = user_bonks + 1;
        self.user_dog_account.bonks = user_dog_bonks + 1;        

        self.update_board()?;

        self.disburse()?;
        Ok(())
    }


    pub fn update_board(&mut self) -> Result<()> {
        // Create a User object with the user's public key and their pets
        let user = User {
            pets: self.user_dog_account.pets,
            bonks: self.user_dog_account.bonks,
            last_pet: self.user_dog_account.last_pet,
            last_bonk: self.user_dog_account.last_bonk,
            bump: self.user_account.bump,
            // You might need to add other fields here depending on the definition of the User struct
        };
    
        // Push the User object to the members vector
        self.bonkboard.members.push(user);
    
        // Sort the members vector by the number of pets in descending order
        self.bonkboard.members.sort_by(|a, b| b.bonks.cmp(&a.bonks));
    
        // Truncate the members vector to keep only the top 10 users
        self.bonkboard.members.truncate(10);    
    
        Ok(())
    }

    pub fn disburse(&mut self) -> Result<()> {


        Ok(())
    }   
}