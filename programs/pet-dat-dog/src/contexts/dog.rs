use anchor_lang::{prelude::*, Bump};
use anchor_spl::{
    associated_token::AssociatedToken,
    token::{transfer, Mint, Token, TokenAccount, Transfer},
};

use crate::state::Board;
use crate::state::Dog;
use crate::state::Team;

#[derive(Accounts)]
#[instruction(name: String, team: Vec<()>)]
pub struct DogContext<'info> {
    #[account(mut)]
    pub owner: Signer<'info>,

    // init a Dog account with seeds [b"dog", owner.key().as_ref(), name.to_le_bytes()]
    #[account(init, payer = owner, seeds = [b"dog", name.as_bytes(), owner.key.as_ref()], bump, space = Dog::INIT_SPACE)]
    pub dog: Account<'info, Dog>,

    // init a pets Board account with seeds [b"pets", owner.key().as_ref()]
    #[account(init, payer = owner, seeds = [b"pets", dog.key().as_ref()], bump, space = Board::INIT_SPACE)]
    pub petsboard: Account<'info, Board>,

    // init a bonks Board account with seeds [b"bonks", owner.key().as_ref()]
    #[account(init, payer = owner, seeds = [b"bonks", dog.key().as_ref()], bump, space = Board::INIT_SPACE)]
    pub bonkboard: Account<'info, Board>,

    // init a team Board account with seeds [b"team", owner.key().as_ref()]
    #[account(init, payer = owner, seeds = [b"team", dog.key().as_ref()], bump, space = Team::INIT_SPACE)]
    pub teamboard: Account<'info, Team>,

    // token account for the vault
    #[account(seeds = [b"vault", dog.key().as_ref()], bump)]
    pub vault: Account<'info, TokenAccount>,

    // define a vault account with seeds [b"vault", owner.key().as_ref()] within the system program
    pub system_program: Program<'info, System>,
}

impl<'info> DogContext<'info> {
    pub fn init(&mut self, name: String, pets: u64, bonks: u64, bumps: &DogContextBumps) -> Result<()> {
        self.dog.set_inner(Dog {
            name,
            pets,
            bonks,
            bump: bumps.dog,
        });
        Ok(())
    }   
}
