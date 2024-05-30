use anchor_lang::{prelude::*, solana_program::clock::Slot};

use crate::state::User;

// Board account
#[account]
pub struct Board {
    pub members: Vec<User>,
    pub target: u64,
    pub bump: u8,
}

impl Space for Board {
    const INIT_SPACE: usize = 8+24*(24+1)+8+1;
}