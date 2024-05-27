use anchor_lang::prelude::*;

// team account
#[account]
pub struct Team {
    pub members: Vec<(Pubkey, u8)>,
    pub bump: u8,
}

// impl new function to create a team of members with their public keys and ownership percentage (out of 100) in whole numbers.
impl<'info> Team {
    pub fn new(members: Vec<(Pubkey, u8)>, bump: u8) -> Box<Self> {
        Box::new(Team {
            members,
            bump,
        })
    }
}

impl Space for Team {
    const INIT_SPACE: usize = 8+24*(32+1)+1;
}