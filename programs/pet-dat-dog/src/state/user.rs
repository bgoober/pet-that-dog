use anchor_lang::prelude::*;

// User account
#[account]
pub struct User {
    pub pets: u64,
    pub bonks: u64,
    pub bump: u8,
}

impl Space for User {
    const INIT_SPACE: usize = 8+8+8+1;
}