use anchor_lang::prelude::*;
use anchor_spl::{associated_token::AssociatedToken, token::{mint_to, transfer_checked, Mint, MintTo, Token, TokenAccount, TransferChecked}};

use crate::state::*;

#[derive(Accounts)]
#[instruction(name: String)]
pub struct DogC<'info> {

    #[account(mut)]
    pub owner: Signer<'info>,

    #[account(init, payer = owner, seeds = [b"dog", name.as_bytes(), owner.key().as_ref()], space = Dog::LEN, bump)]
    pub dog: Account<'info, Dog>,

    #[account(init, payer = owner, seeds = [b"pets", dog.key().as_ref()], mint::decimals=0, mint::authority = dog, bump)]
    pub dog_mint: Account<'info, Mint>,

    //bonk mint
    pub bonk_mint: Account<'info, Mint>,

    // dog's bonk ata
    #[account(init, payer = owner, associated_token::mint = bonk_mint, associated_token::authority = dog)]
    pub dog_bonk_ata: Account<'info, TokenAccount>,

    // #[account(init, payer = owner, seeds = [b"team"], space = Team::LEN, bump)]
    // pub team: Account<'info, Team>,

    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub system_program: Program<'info, System>,
}

impl<'info> DogC<'info> {
    pub fn init(&mut self, name: String, bumps: &DogCBumps) -> Result<()>  {
        self.dog.name = name;
        self.dog.pets = 0;
        self.dog.bonks = 0;
        self.dog.bump = bumps.dog;
        Ok(())
    }
}

#[derive(Accounts)]
pub struct PetC<'info> {

    #[account(mut)]
    pub user: Signer<'info>,

    pub owner: SystemAccount<'info>,

    #[account(mut, seeds = [b"dog", dog.name.as_ref(), owner.key().as_ref()], bump)]
    pub dog: Account<'info, Dog>,

    #[account(mut)]
    pub dog_mint: Account<'info, Mint>,

    #[account(init_if_needed, payer = user, associated_token::mint = dog_mint, associated_token::authority = user)]
    pub user_pets_ata: Account<'info, TokenAccount>,

    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub system_program: Program<'info, System>,
}

impl<'info> PetC<'info> {
    pub fn pet(&mut self) -> Result<()> {
        self.dog.pets += 1;

        // tell how many pets the dog has
        msg!("{} has been pet {} times", self.dog.name, self.dog.pets);
        self.mint_pets()?;
        Ok(())
    }   
        // nest mint_pets function to mint the pet token only when the dog is pet
        fn mint_pets(&mut self) -> Result<()> {
            let cpi_accounts = MintTo {
                mint: self.dog_mint.to_account_info(),
                to: self.user_pets_ata.to_account_info(),
                authority: self.dog.to_account_info(),
            };
            let seeds = &[
                &b"dog"[..],
                &[self.dog.bump],
            ];
            let signer_seeds = &[&seeds[..]];

            let ctx = CpiContext::new_with_signer(self.token_program.to_account_info(), cpi_accounts, signer_seeds);
            mint_to(ctx, 1)
        }
}

#[derive(Accounts)]
pub struct BonkC<'info> {

    #[account(mut)]
    pub user: Signer<'info>,

    pub owner: SystemAccount<'info>,

    #[account(mut, seeds = [b"dog", dog.name.as_ref(), owner.key().as_ref()], bump)]
    pub dog: Account<'info, Dog>,  

    //bonk mint
    pub bonk_mint: Account<'info, Mint>,

    // user's bonk ata
    #[account(mut, associated_token::mint = bonk_mint, associated_token::authority = user)]
    pub user_bonk_ata: Account<'info, TokenAccount>,

    // dog's bonk ata
    #[account(mut, associated_token::mint = bonk_mint, associated_token::authority = dog)]
    pub dog_bonk_ata: Account<'info, TokenAccount>,

    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub system_program: Program<'info, System>,
}

impl<'info> BonkC<'info> {
    pub fn bonk(&mut self) -> Result<()> {
        self.dog.bonks += 1;

        // tell how many bonks the dog has
        msg!("{} has been bonked {} times", self.dog.name, self.dog.bonks);
        self.bonkposit()?;
        Ok(())
    }

        fn bonkposit(&mut self) -> Result<()> {
            // create a cpi transfer from the user's pets ata to the dog's pets ata for 1 token
            let cpi_accounts = TransferChecked {
                from: self.user_bonk_ata.to_account_info(),
                to: self.dog_bonk_ata.to_account_info(),
                mint: self.bonk_mint.to_account_info(),
                authority: self.user.to_account_info(),
            };

        let ctx = CpiContext::new(self.token_program.to_account_info(), cpi_accounts);
        
        transfer_checked(ctx, 100000, 6)

        }
}