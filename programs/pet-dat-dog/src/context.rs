use anchor_lang::{
    prelude::*,
    system_program::{transfer, Transfer},
};
use anchor_spl::{
    associated_token::AssociatedToken,
    metadata::{
        create_metadata_accounts_v3, mpl_token_metadata::types::DataV2, CreateMetadataAccountsV3,
        Metadata,
    },
    token::{mint_to, Mint, MintTo, Token, TokenAccount},
}; // TransferChecked, transfer_checked (put these methods back into the token imports above once the need for a TransferChecked CPI is back in-place.)

// use std::str::FromStr;

use crate::state::*;

// HOUSE addressed to be changed to Squads DAO/Multisig in the future
// const HOUSE: &str = "4QPAeQG6CTq2zMJAVCJnzY9hciQteaMkgBmcyGL7Vrwp";

// ADMIN address to be used for calling GlobalC
// const ADMIN: &str = "4QPAeQG6CTq2zMJAVCJnzY9hciQteaMkgBmcyGL7Vrwp";

#[derive(Accounts)]
pub struct GlobalC<'info> {
    /// CHECK: This account will be constrained to the Squads/Programs/Dev Team's multi-sig account
    // #[account(mut, constraint = house.key() == Pubkey::from_str(HOUSE).unwrap())]
    #[account()]
    pub house: AccountInfo<'info>,

    // #[account(mut, constraint = payer.key() == Pubkey::from_str(ADMIN).unwrap())]
    #[account(mut)]
    pub payer: Signer<'info>,

    #[account(init, payer = payer, seeds = [b"global"], space = Global::LEN, bump)]
    pub global: Account<'info, Global>,

    pub associated_token_program: Program<'info, AssociatedToken>,
    pub system_program: Program<'info, System>,
}

impl<'info> GlobalC<'info> {
    pub fn init(&mut self, bumps: &GlobalCBumps) -> Result<()> {
        self.global.set_inner(Global {
            house: self.house.key(),
            global_bump: bumps.global,
        });
        Ok(())
    }
}

#[derive(Accounts)]
#[instruction(name: String)]
pub struct DogC<'info> {
    #[account(mut)]
    pub owner: Signer<'info>,

    #[account(init, payer = owner, seeds = [b"dog", name.as_str().as_bytes(), owner.key().as_ref()], space = Dog::LEN, bump)]
    pub dog: Account<'info, Dog>,

    /// CHECK: this is the squads multi-sig
    #[account(mut, constraint = house.key() == global.house.key())]
    pub house: AccountInfo<'info>,

    #[account(seeds = [b"global"], bump = global.global_bump)]
    pub global: Account<'info, Global>,

    #[account(
        init,
        payer = owner,
        seeds = [b"mint", dog.key().as_ref()],
        bump,
        mint::decimals = 6,
        mint::authority = mint_auth
    )]
    pub dog_mint: Account<'info, Mint>,

    /// CHECK: this is safe
    #[account(
        seeds = [b"auth", dog_mint.key().as_ref()],
        bump
    )]
    pub mint_auth: AccountInfo<'info>,

    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub system_program: Program<'info, System>,
    pub token_metadata_program: Program<'info, Metadata>,
    pub rent: Sysvar<'info, Rent>,

    /// CHECK: this is safe
    #[account(
        mut,
        seeds = [b"metadata", token_metadata_program.key().as_ref(), dog_mint.key().as_ref()],
        bump,
        seeds::program = token_metadata_program.key(),
    )]
    pub metadata: AccountInfo<'info>,
}

impl<'info> DogC<'info> {
    pub fn init(
        &mut self,
        name: String,
        token_name: String,
        token_symbol: String,
        token_uri: String,
        bumps: &DogCBumps,
    ) -> Result<()> {
        // Only charge if not the house
        if self.owner.key() != self.house.key() {
            let cpi_accounts = Transfer {
                from: self.owner.to_account_info(),
                to: self.house.to_account_info(),
            };
            let ctx = CpiContext::new(self.system_program.to_account_info(), cpi_accounts);
            transfer(ctx, 100_000_000)?; // 0.1 SOL
        }

        self.dog.set_inner(Dog {
            name,
            owner: self.owner.key(),
            pets: 0,
            mint: self.dog_mint.key(),
            dog_bump: bumps.dog,
            mint_bump: bumps.dog_mint,
            auth_bump: bumps.mint_auth,
        });

        // Create metadata for dog's token
        let mint_key = self.dog_mint.key();
        let seeds = &[&b"auth"[..], mint_key.as_ref(), &[bumps.mint_auth]];
        let signer_seeds = &[&seeds[..]];

        // Invoking the create_metadata_account_v3 instruction on the token metadata program
        create_metadata_accounts_v3(
            CpiContext::new_with_signer(
                self.token_metadata_program.to_account_info(),
                CreateMetadataAccountsV3 {
                    metadata: self.metadata.to_account_info(),
                    mint: self.dog_mint.to_account_info(),
                    mint_authority: self.mint_auth.to_account_info(),
                    update_authority: self.owner.to_account_info(),
                    payer: self.owner.to_account_info(),
                    system_program: self.system_program.to_account_info(),
                    rent: self.rent.to_account_info(),
                },
                signer_seeds,
            ),
            DataV2 {
                name: token_name,
                symbol: token_symbol,
                uri: token_uri,
                seller_fee_basis_points: 0,
                creators: None,
                collection: None,
                uses: None,
            },
            false,
            true,
            None,
        )?;

        // msg!("Token mint created successfully.");
        Ok(())
    }
}

#[derive(Accounts)]
pub struct PetC<'info> {
    #[account(mut)]
    pub signer: Signer<'info>,

    #[account(init_if_needed, payer = signer, seeds = [signer.key().as_ref()], space = User::LEN, bump)]
    pub user: Account<'info, User>,

    #[account(mut, seeds = [b"dog", dog.name.as_ref(), dog.owner.as_ref()], bump = dog.dog_bump)]
    pub dog: Account<'info, Dog>,

    /// CHECK: this is the dog's owner
    #[account(mut, constraint = owner.key() == dog.owner)]
    pub owner: AccountInfo<'info>,

    #[account(mut, constraint = dog_mint.key() == dog.mint)]
    pub dog_mint: Account<'info, Mint>,

    /// CHECK: this is safe
    #[account(
        seeds = [b"auth", dog_mint.key().as_ref()],
        bump = dog.auth_bump
    )]
    pub mint_auth: AccountInfo<'info>,

    #[account(init_if_needed, payer = signer, associated_token::mint = dog_mint, associated_token::authority = signer)]
    pub user_token_ata: Account<'info, TokenAccount>,

    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub system_program: Program<'info, System>,
}

impl<'info> PetC<'info> {
    pub fn pet(&mut self, bumps: &PetCBumps) -> Result<()> {
        if self.user.authority != self.signer.key() {
            self.user.set_inner(User {
                authority: self.signer.key(),
                last_pet: 0,
                bump: bumps.user,
            });
        }

        if self.user.last_pet == Clock::get()?.slot {
            return Err(ErrorCode::TooManyPets.into());
        }

        let cpi_accounts = MintTo {
            mint: self.dog_mint.to_account_info(),
            to: self.user_token_ata.to_account_info(),
            authority: self.mint_auth.to_account_info(),
        };

        let mint_key = self.dog_mint.key();
        let seeds = &[&b"auth"[..], mint_key.as_ref(), &[self.dog.auth_bump]];
        let signer_seeds = &[&seeds[..]];

        let ctx = CpiContext::new_with_signer(
            self.token_program.to_account_info(),
            cpi_accounts,
            signer_seeds,
        );
        mint_to(ctx, 1_000_000)?;

        self.dog.pets += 1;
        self.user.last_pet = Clock::get()?.slot;

        // Transfer small SOL fee to dog owner
        let cpi_accounts = Transfer {
            from: self.signer.to_account_info(),
            to: self.owner.to_account_info(),
        };
        let ctx = CpiContext::new(self.system_program.to_account_info(), cpi_accounts);
        transfer(ctx, 1000)?;

        Ok(())
    }
}

#[error_code]
pub enum ErrorCode {
    #[msg("Too many pets in one slot!")]
    TooManyPets,
}
