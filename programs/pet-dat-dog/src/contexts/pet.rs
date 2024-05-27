// use anchor_lang::prelude::*;
// use anchor_spl::{associated_token::AssociatedToken, token::{transfer, Mint, Token, TokenAccount, Transfer}};

// use crate::state::Board;
// use crate::state::Dog;
// use crate::state::User;


// #[derive(Accounts)]
// pub struct Pet<'info> {
//     #[account(mut)]
//     pub user: Signer<'info>,

//     // derived from the existing seeds of the dog account
//     #[account(mut, seeds = [b"dog", dog.key().as_ref()], bump)]
//     pub dog: Account<'info, Dog>,

//     // constraints derived from the dog account 
//     #[account(mut, seeds = [b"pets", dog.key().as_ref()], bump)]
//     pub petsboard: Account<'info, Board>,

//     #[account(mut)]
//     pub vault: Account<'info, TokenAccount>,

//     pub system_program: Program<'info, System>,
// }

// impl<'info> Pet<'info> {
//     pub fn new(
//         user: Signer<'info>,
//         dog: Account<'info, Dog>,
//         petsboard: Account<'info, Board>,
//         vault: Account<'info, TokenAccount>,
//         system_program: Program<'info, System>,
//     ) -> Self {
//         Self {
//             user,
//             dog,
//             petsboard,
//             vault,
//             system_program,
//         }
//     }

//     pub fn pet(&mut self) -> Result<()> {
//         self.petsboard.pets += 1;



//         self.update_leaderboard()?;
//         Ok(())
//     }

//     pub fn update_leaderboard(&mut self) -> Result<()> {
//         Ok(())
//     }
// }