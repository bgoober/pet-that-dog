use anchor_lang::prelude::*;

#[account]
pub struct Global {
    pub house: Pubkey,
    pub global_bump: u8,
}

impl Global {
    pub const LEN: usize = 8 + 32 + 1;
}

#[account]
pub struct Dog {
    pub name: String,
    pub owner: Pubkey,
    pub pets: u64,
    pub bonks: u64,
    pub wifs: u64,
    pub pnuts: u64,
    pub mint: Pubkey,
    pub dog_bump: u8,
    pub mint_bump: u8,
    pub auth_bump: u8,
}

impl Dog {
    pub const LEN: usize = 8 + 24 + 32 + 8 + 8 + 8 + 8 + 32 + 1 + 1 + 1;
}

#[account]
pub struct User {
    pub last_action: u64,
    pub authority: Pubkey,
    pub bump: u8,
}

impl User {
    pub const LEN: usize = 8 + 8 + 32 + 1;
}