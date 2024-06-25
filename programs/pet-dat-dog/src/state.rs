use anchor_lang::prelude::*;


#[account]
pub struct Dog {
    pub name: String,
    pub pets: u64,
    pub bonks: u64,
    pub mint: Pubkey,
    pub dog_bump: u8,
    pub mint_bump: u8,
    pub auth_bump: u8,
}

impl Dog {
    pub const LEN: usize = 8+24+8+8+32+1+1+1;
}


// #[account]
// pub struct Team {
//     pub team: Vec<(Pubkey, u8)>,
//     pub bump: u8,
// }

// impl Team {
//     pub const LEN: usize = 8+(4+10*(32+1)+1);
// }