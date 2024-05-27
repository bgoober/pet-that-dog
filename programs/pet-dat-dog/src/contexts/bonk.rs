// use anchor_lang::prelude::*;
// use anchor_spl::{associated_token::AssociatedToken, token::{transfer, Mint, Token, TokenAccount, Transfer}};


// use crate::state::Board;
// use crate::state::Dog;
// use crate::state::User;

// #[derive(Accounts)]
// pub struct Bonk<'info> {
//     #[account(mut)]
//     pub user: Signer<'info>,

//     // derived from the existing seeds of the dog account
//     #[account(mut, seeds = [b"dog", dog.key().as_ref()], bump)]
//     pub dog: Account<'info, Dog>,

//     // constraints derived from the dog account 
//     #[account(mut, seeds = [b"bonks", dog.key().as_ref()], bump)]
//     pub bonkboard: Account<'info, Board>,

//     #[account(mut)]
//     pub vault: Account<'info, TokenAccount>,

//     pub system_program: Program<'info, System>,
// }

// impl<'info> Bonk<'info> {
//     pub fn new(
//         user: Signer<'info>,
//         dog: Account<'info, Dog>,
//         bonkboard: Account<'info, Board>,
//         vault: Account<'info, TokenAccount>,

//         system_program: Program<'info, System>,
//     ) -> Self {
//         Self {
//             user,
//             dog,
//             bonkboard,
//             vault,
//             system_program,
//         }
//     }

//     pub fn bonk(&mut self) -> Result<()> {
//         self.bonkboard.bonks += 1;
        
//         // update the user's account for that dog
//         let user_pets = &self.user.pets;

//         self.update_leaderboard()?;
//         Ok(())
//     }

//     pub fn update_leaderboard(&mut self) -> Result<()> {
//         Ok(())
//     }
// }