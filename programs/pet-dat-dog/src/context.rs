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
    token::{mint_to, transfer_checked, Mint, MintTo, Token, TokenAccount, TransferChecked},
};
use std::str::FromStr;

use crate::state::*;

// admin addressed to be changed to Squads DAO/Multisig in the future
const ADMIN: &str = "4QPAeQG6CTq2zMJAVCJnzY9hciQteaMkgBmcyGL7Vrwp";

// this is the main net $BONK Mint address
const BONK_MINT: &str = "DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263";

/// DOCS: GlobalC now inits a global PETS token mint, to be used during any PetC context for any dog.
/// There is now 1 token for ALL dogs made within the program, by any user.
#[derive(Accounts)]
pub struct GlobalC<'info> {
    #[account(mut, constraint = house.key() == Pubkey::from_str(ADMIN).unwrap())]
    pub house: Signer<'info>,

    #[account(init, payer = house, seeds = [b"global", house.key().as_ref()], space = Global::LEN, bump)]
    pub global: Account<'info, Global>,

    #[account(init, payer = house, seeds = [b"pets"], mint::decimals=5, mint::authority = mint_auth, bump)]
    pub pets_mint: Account<'info, Mint>,

    /// CHECK: this is safe
    #[account(
        seeds = [b"auth"],
        bump
    )]
    pub mint_auth: AccountInfo<'info>,

    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub system_program: Program<'info, System>,

    /// CHECK: Validate address by deriving pda
    #[account(
        mut,
        seeds = [b"metadata", token_metadata_program.key().as_ref(), pets_mint.key().as_ref()],
        bump,
        seeds::program = token_metadata_program.key(),
    )]
    pub metadata: AccountInfo<'info>,

    pub token_metadata_program: Program<'info, Metadata>,

    pub rent: Sysvar<'info, Rent>,
}

impl<'info> GlobalC<'info> {
    pub fn init(
        &mut self,
        bumps: &GlobalCBumps,
        token_name: String,
        token_symbol: String,
        token_uri: String,
    ) -> Result<()> {
        self.global.set_inner(Global {
            house: self.house.key(),
            mint: self.pets_mint.key(),
            auth_bump: bumps.mint_auth,
            mint_bump: bumps.pets_mint,
            global_bump: bumps.global,
        });

        let seeds = &[&b"auth"[..], &[self.global.auth_bump]];
        let signer_seeds = &[&seeds[..]];

        // Invoking the create_metadata_account_v3 instruction on the token metadata program
        create_metadata_accounts_v3(
            CpiContext::new_with_signer(
                self.token_metadata_program.to_account_info(),
                CreateMetadataAccountsV3 {
                    metadata: self.metadata.to_account_info(),
                    mint: self.pets_mint.to_account_info(),
                    mint_authority: self.mint_auth.to_account_info(), // is this safe? this makes the mint authority a PDA that is then invoked in the PetC for evey dog.
                    update_authority: self.house.to_account_info(),
                    payer: self.house.to_account_info(),
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
            true, // Is mutable
            true, // Update authority is signer -- what does this mean? Does this mean the mint authority is the signer, or that the update authority is the signer of this particular instruction?
            None, // Collection details
        )?;

        msg!("Token mint created successfully.");
        Ok(())
    }
}

/// DOCS: The DogC now inits a new dog with a name, and an owner.
/// Each dog no longer has its own token, but will instead use the global mint during a PetC context.
/// Each dog retains its own BONK vault, auth, and mini-game.
#[derive(Accounts)]
#[instruction(name: String)]
pub struct DogC<'info> {
    #[account(mut)]
    pub owner: Signer<'info>,

    #[account(init, payer = owner, seeds = [b"dog", name.as_str().as_bytes(), owner.key().as_ref()], space = Dog::LEN, bump)]
    pub dog: Account<'info, Dog>,

    /// CHECK: this is safe
    #[account(
        seeds = [b"auth", dog.key().as_ref()],
        bump
    )]
    pub dog_auth: AccountInfo<'info>,

    /// CHECK: this is the signer of the GlobalC context
    #[account(mut, constraint = house.key() == global.house.key())]
    pub house: AccountInfo<'info>,

    #[account(mut, seeds = [b"global", house.key().as_ref()], bump = global.global_bump)]
    pub global: Account<'info, Global>,

    //bonk mint
    #[account(constraint = bonk_mint.key() == Pubkey::from_str(BONK_MINT).unwrap())]
    pub bonk_mint: Account<'info, Mint>,

    // dog's bonk ata
    #[account(init, payer = owner, associated_token::mint = bonk_mint, associated_token::authority = dog_auth)]
    pub dog_bonk_ata: Account<'info, TokenAccount>,

    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub system_program: Program<'info, System>,
}

impl<'info> DogC<'info> {
    pub fn init(&mut self, name: String, bumps: &DogCBumps) -> Result<()> {
        self.dog.set_inner(Dog {
            name,
            owner: self.owner.key(),
            pets: 0,
            bonks: 0,
            dog_bump: bumps.dog,
            auth_bump: bumps.dog_auth,
        });

        let cpi_accounts = Transfer {
            from: self.owner.to_account_info(),
            to: self.house.to_account_info(),
        };

        let ctx = CpiContext::new(self.system_program.to_account_info(), cpi_accounts);

        transfer(ctx, 10_000_000)?; // this is equal to 10M lamports, or 0.01 SOL. (1/100th SOL)
        Ok(())
    }
}

#[derive(Accounts)]
pub struct PetC<'info> {
    #[account(mut)]
    pub signer: Signer<'info>,

    /// CHECK: this is the signer of the GlobalC context
    #[account(mut, constraint = house.key() == global.house.key())]
    pub house: AccountInfo<'info>,

    /// CHECK: this is the signer of the GlobalC context
    #[account(mut, constraint = owner.key() == dog.owner.key())]
    pub owner: AccountInfo<'info>,

    #[account(mut, seeds = [b"global", house.key().as_ref()], bump = global.global_bump)]
    pub global: Account<'info, Global>,

    #[account(init_if_needed, payer = signer, seeds = [signer.key().as_ref()], space = User::LEN, bump)]
    pub user: Account<'info, User>,

    #[account(mut, seeds = [b"dog", dog.name.as_ref(), dog.owner.as_ref()], bump = dog.dog_bump)]
    pub dog: Account<'info, Dog>,

    #[account(mut, seeds = [b"pets"], bump = global.mint_bump)]
    pub pets_mint: Account<'info, Mint>,

    /// CHECK: this is safe, it is the mint_auth from the GlobalC context
    #[account(
        seeds = [b"auth"],
        bump = global.auth_bump
    )]
    pub mint_auth: AccountInfo<'info>,

    #[account(init_if_needed, payer = signer, associated_token::mint = pets_mint, associated_token::authority = signer)]
    pub user_pets_ata: Account<'info, TokenAccount>,

    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub system_program: Program<'info, System>,
}

impl<'info> PetC<'info> {
    pub fn pet(&mut self) -> Result<()> {
        if self.user.last_pet == Clock::get()?.slot {
            return Err(ErrorCode::TooManyPets.into());
        }
        let cpi_accounts = MintTo {
            mint: self.pets_mint.to_account_info(),
            to: self.user_pets_ata.to_account_info(),
            authority: self.mint_auth.to_account_info(),
        };
        let seeds = &[&b"auth"[..], &[self.global.auth_bump]];
        let signer_seeds = &[&seeds[..]];

        let ctx = CpiContext::new_with_signer(
            self.token_program.to_account_info(),
            cpi_accounts,
            signer_seeds,
        );
        mint_to(ctx, 100_000)?;

        self.dog.pets += 1;

        self.user.last_pet = Clock::get()?.slot;

        // tell how many pets the dog has
        msg!("{} has been pet {} times", self.dog.name, self.dog.pets);

        msg!("User's last pet: {}", self.user.last_pet);

        let cpi_accounts = Transfer {
            from: self.signer.to_account_info(),
            to: self.owner.to_account_info(),
        };

        let ctx = CpiContext::new(self.system_program.to_account_info(), cpi_accounts);

        transfer(ctx, 1000)?; // this is equal 1x10^-6 SOL (1 micro SOL, or 1/1Millionth SOL). 10k pets would repay the dog creation for for the owner. 1 million pets would be 1 SOL.
                              // 10^-6 seems to be the lowest we can go to actually see a change in the account balance on the explorer, anything less and it bleeds the recipient account or doesn't move it at all.
                              // on localnet, the owner is receiving 9.6x10^-7 SOL per pet from a user, or 0.00000096 SOL per pet.
        Ok(())
    }
}

#[derive(Accounts)]
pub struct BonkC<'info> {
    #[account(mut)]
    pub signer: Signer<'info>,

    #[account(init_if_needed, payer = signer, seeds = [signer.key().as_ref()], space = User::LEN, bump)]
    pub user: Account<'info, User>,

    #[account(mut, seeds = [b"dog", dog.name.as_ref(), dog.owner.as_ref()], bump = dog.dog_bump)]
    pub dog: Account<'info, Dog>,

    //bonk mint
    #[account(constraint = bonk_mint.key() == Pubkey::from_str(BONK_MINT).unwrap())]
    pub bonk_mint: Account<'info, Mint>,

    // user's bonk ata
    #[account(mut, associated_token::mint = bonk_mint, associated_token::authority = signer)]
    pub user_bonk_ata: Account<'info, TokenAccount>,

    /// CHECK: this is safe
    #[account(
        seeds = [b"auth", dog.key().as_ref()],
        bump = dog.auth_bump
    )]
    pub dog_auth: AccountInfo<'info>,

    // dog's bonk ata
    #[account(mut, associated_token::mint = bonk_mint, associated_token::authority = dog_auth)]
    pub dog_bonk_ata: Account<'info, TokenAccount>,

    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub system_program: Program<'info, System>,
}

impl<'info> BonkC<'info> {
    pub fn bonk(&mut self) -> Result<()> {
        if self.user.last_bonk == Clock::get()?.slot {
            return Err(ErrorCode::TooManyBonks.into());
        }

        // create a cpi transfer from the user's bonk ata to the dog's bonk ata for 1 $BONK token
        let cpi_accounts = TransferChecked {
            from: self.user_bonk_ata.to_account_info(),
            to: self.dog_bonk_ata.to_account_info(),
            mint: self.bonk_mint.to_account_info(),
            authority: self.signer.to_account_info(),
        };

        let ctx = CpiContext::new(self.token_program.to_account_info(), cpi_accounts);

        transfer_checked(ctx, 100_000, 5)?;

        self.dog.bonks += 1;

        self.user.last_bonk = Clock::get()?.slot;

        // tell how many bonks the dog has
        msg!("{} has been bonked {} times", self.dog.name, self.dog.bonks);

        msg!("User's last bonk: {}", self.user.last_bonk);

        Ok(())
    }
}

#[error_code]
pub enum ErrorCode {
    #[msg("Too many pets in one slot!")]
    TooManyPets,
    #[msg("Too many bonksin one slot!")]
    TooManyBonks,
    #[msg("Session error")]
    SessionError,
}
