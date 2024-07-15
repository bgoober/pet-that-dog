use anchor_lang::prelude::*;
use anchor_spl::{
    associated_token::AssociatedToken,
    token::{mint_to, transfer_checked, Mint, MintTo, Token, TokenAccount, TransferChecked},
};

use crate::state::*;

#[derive(Accounts)]
#[instruction(name: String)]
pub struct DogC<'info> {
    #[account(mut)]
    pub owner: Signer<'info>,

    #[account(init, payer = owner, seeds = [b"dog", name.as_str().as_bytes()], space = Dog::LEN, bump)]
    pub dog: Account<'info, Dog>,

    /// CHECK: this is safe
    #[account(
        seeds = [b"auth", dog.key().as_ref()],
        bump
    )]
    pub dog_auth: UncheckedAccount<'info>,

    #[account(init, payer = owner, seeds = [b"pets", dog.key().as_ref()], mint::decimals=0, mint::authority = dog_auth, bump)]
    pub dog_mint: Account<'info, Mint>,

    //bonk mint
    pub bonk_mint: Account<'info, Mint>,

    // dog's bonk ata
    #[account(init, payer = owner, associated_token::mint = bonk_mint, associated_token::authority = dog_auth)]
    pub dog_bonk_ata: Account<'info, TokenAccount>,

    // #[account(init, payer = owner, seeds = [b"team"], space = Team::LEN, bump)]
    // pub team: Account<'info, Team>,
    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub system_program: Program<'info, System>,
}

impl<'info> DogC<'info> {
    pub fn init(&mut self, name: String, bumps: &DogCBumps) -> Result<()> {
        self.dog.set_inner(Dog {
            name,
            pets: 0,
            bonks: 0,
            mint: self.dog_mint.key(),
            dog_bump: bumps.dog,
            mint_bump: bumps.dog_mint,
            auth_bump: bumps.dog_auth,
        });
        Ok(())
    }
}

#[derive(Accounts)]
pub struct PetC<'info> {
    #[account(mut)]
    pub user: Signer<'info>,

    #[account(mut, seeds = [b"dog", dog.name.as_ref()], bump = dog.dog_bump)]
    pub dog: Account<'info, Dog>,

    /// CHECK: this is safe
    #[account(
        seeds = [b"auth", dog.key().as_ref()],
        bump
    )]
    pub dog_auth: UncheckedAccount<'info>,

    #[account(mut, seeds = [b"pets", dog.key().as_ref()], bump = dog.mint_bump)]
    pub dog_mint: Account<'info, Mint>,

    #[account(init_if_needed, payer = user, associated_token::mint = dog_mint, associated_token::authority = user)]
    pub user_pets_ata: Account<'info, TokenAccount>,

    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub system_program: Program<'info, System>,
}

impl<'info> PetC<'info> {
    pub fn pet(&mut self) -> Result<()> {
        let cpi_accounts = MintTo {
            mint: self.dog_mint.to_account_info(),
            to: self.user_pets_ata.to_account_info(),
            authority: self.dog_auth.to_account_info(),
        };
        let seeds = &[
            &b"auth"[..],
            &self.dog.key().to_bytes()[..],
            &[self.dog.auth_bump],
        ];
        let signer_seeds = &[&seeds[..]];

        let ctx = CpiContext::new_with_signer(
            self.token_program.to_account_info(),
            cpi_accounts,
            signer_seeds,
        );
        mint_to(ctx, 1)?;

        self.dog.pets += 1;

        // tell how many pets the dog has
        msg!("{} has been pet {} times", self.dog.name, self.dog.pets);

        Ok(())
    }
}

#[derive(Accounts)]
pub struct BonkC<'info> {
    #[account(mut)]
    pub user: Signer<'info>,

    #[account(mut, seeds = [b"dog", dog.name.as_ref()], bump = dog.dog_bump)]
    pub dog: Account<'info, Dog>,

    //bonk mint
    //    #[account(mut)]
    pub bonk_mint: Account<'info, Mint>,

    // user's bonk ata
    #[account(mut, associated_token::mint = bonk_mint, associated_token::authority = user)]
    pub user_bonk_ata: Account<'info, TokenAccount>,

    /// CHECK: this is safe
    #[account(
        seeds = [b"auth", dog.key().as_ref()],
        bump
    )]
    pub dog_auth: UncheckedAccount<'info>,

    // dog's bonk ata
    #[account(mut, associated_token::mint = bonk_mint, associated_token::authority = dog_auth)]
    pub dog_bonk_ata: Account<'info, TokenAccount>,

    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub system_program: Program<'info, System>,
}

impl<'info> BonkC<'info> {
    pub fn bonk(&mut self) -> Result<()> {
        // create a cpi transfer from the user's pets ata to the dog's pets ata for 1 token
        let cpi_accounts = TransferChecked {
            from: self.user_bonk_ata.to_account_info(),
            to: self.dog_bonk_ata.to_account_info(),
            mint: self.bonk_mint.to_account_info(),
            authority: self.user.to_account_info(),
        };

        let ctx = CpiContext::new(self.token_program.to_account_info(), cpi_accounts);

        transfer_checked(ctx, 100_000, 6)?;

        self.dog.bonks += 1;

        // tell how many bonks the dog has
        msg!("{} has been bonked {} times", self.dog.name, self.dog.bonks);

        Ok(())
    }
}


// #[derive(Accounts)]
// pub struct IssueTokens<'info> {

//     // Account of the user issuing tokens
//     #[account(mut)]
//     user: Signer<'info>,
//     #[account(
//         mut,
//         associated_token::mint = mint,
//         associated_token::authority = user,
//         associated_token::token_program = token_program
//     )]
//     pub user_ata: InterfaceAccount<'info, TokenAccount>,
//     // Mint
//     #[account(
//         init,
//         seeds = [b"mint"],
//         bump,
//         payer = user,
//         mint::decimals = 6,
//         mint::authority = user,
//         mint::token_program = token_program
//     )]
//     mint: InterfaceAccount<'info, Mint>,
//     #[account(mut)]
//     /// CHECK: this account will be init by token metadata
//     metadata: UncheckedAccount<'info>, 
//     metadata_program: Program<'info, Metadata>,
//     token_program: Interface<'info, TokenInterface>,
//     associated_token_program: Program<'info, AssociatedToken>,
//     system_program: Program<'info, System>,
// }

// impl<'info> IssueTokens<'info> {

// pub fn issue_tokens(&self) -> Result<()> {

//         let accounts = MintTo {
//             mint: self.mint.to_account_info(),
//             to: self.user_ata.to_account_info(),
//             authority: self.user.to_account_info(),
//         };

//         let ctx = CpiContext::new(
//             self.token_program.to_account_info(),
//             accounts,
//         );

//         mint_to(ctx, TOKEN_ISSUE_AMOUNT)
//     }

//     pub fn create_metadata(&mut self, name: String, symbol: String, uri: String) -> Result<()> {

//         let program_id = self.metadata_program.key();
//         let metadata = self.metadata.key();
//         let mint = self.mint.key();
//         let mint_authority = self.user.key();
//         let payer = self.user.key();

//         let create_metadata_ix = create_metadata_accounts_v3(
//             program_id,
//             metadata,
//             mint,
//             mint_authority,
//             payer,
//             mint_authority,
//             name,
//             symbol,
//             uri,
//             Some(vec![creator_struct {
//                 address: mint_authority,
//                 verified: true,
//                 share: 100,
//             }]),
//             0,
//             false,
//             false,
//             None,
//             None,
//             None,
//         );

//         invoke_signed(
//             &create_metadata_ix,
//             &[
//                 self.metadata.to_account_info(),
//                 self.mint.to_account_info(),
//                 self.creator.to_account_info(),
//                 self.pool_creator.to_account_info(),
//                 self.creator.to_account_info(),
//                 self.system_program.to_account_info(),
//                 self.rent_program.to_account_info(),
//             ]
//         )?;      

//         Ok(())
//     }
//     pub fn revoke_mint_authority(&self) -> Result<()> {
//         let accounts = SetAuthority {
//             current_authority: self.user.to_account_info(),
//             account_or_mint: self.mint.to_account_info(),
//         };
//         let ctx = CpiContext::new_with_signer(
//             self.token_program.to_account_info(),
//             accounts
//         );
//         set_authority(ctx, AuthorityType::MintTokens, None)
//     }        
// } 