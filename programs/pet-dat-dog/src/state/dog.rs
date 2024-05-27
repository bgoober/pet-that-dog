use anchor_lang::prelude::*;

// Dog account
#[account]
pub struct Dog {
    pub name: String,
    pub pets: u64,
    pub bonks: u64,
    pub bump: u8,
}

impl Space for Dog {
    const INIT_SPACE: usize = 8+24+8+8+1;
}
