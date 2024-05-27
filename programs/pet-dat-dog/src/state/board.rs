use anchor_lang::prelude::*;

use crate::state::User;

// Board account
#[account]
pub struct Board {
    pub members: Vec<User>,
    pub bump: u8,
}

impl Space for Board {
    const INIT_SPACE: usize = 8+24*(8+8+8+1)+1;
}