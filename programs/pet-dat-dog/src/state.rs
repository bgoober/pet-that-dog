use anchor_lang::prelude::*;

#[account]
pub struct Global {
    pub house: Pubkey,
    pub mint: Pubkey,
    pub auth_bump: u8,
    pub mint_bump: u8,
    pub global_bump: u8,
}

impl Global {
    pub const LEN: usize = 8 + 32 + 32 + 1 + 1 + 1;
}

#[account]
pub struct Dog {
    pub name: String,
    pub owner: Pubkey,
    pub pets: u64,
    // I am removing the bonk, pnuts, and wif tracker, as these are not necessary to track, as nothing is being minted during their transactions. This makes things more gas efficient for users, vs having more novel/useless numbers to give to them.
    // pub bonks: u64, // tracks BONK
    // pub pnuts: u64, // tracks PNUT
    // pub wifs: u64, // tracks WIF
    pub dog_bump: u8,
    // pub auth_bump: u8, // the auth_bump for the dog is needed eventually as a signer to disburse the dog's BONK ata account balance to the user if they win
}

impl Dog {
    pub const LEN: usize = 8 + 24 + 32 + 8 + 1;
}

#[account]
pub struct User {
    pub authority: Pubkey,
    pub last_pet: u64,
    // I am removing the bonk, pnuts, and wif tracker, as these are not necessary to track, as nothing is being minted during their transactions. This makes things more gas efficient for users, vs having more novel/useless numbers to give to them
    // pub last_bonk: u64, // tracks BONK
    // pub last_pnut: u64, // tracks PNUT
    // pub last_wif: u64, // tracks WIF
    pub bump: u8,
}

impl User {
    pub const LEN: usize = 8 + 32 + 8 + 1;
}

// #[account]
// pub struct Team {
//     pub team: Vec<(Pubkey, u8)>,
//     pub bump: u8,
// }

// impl Team {
//     pub const LEN: usize = 8+(4+10*(32+1)+1);
// }
