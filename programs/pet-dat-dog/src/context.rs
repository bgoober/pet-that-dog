// use solana_program::pubkey;
use anchor_lang::prelude::*;
use anchor_spl::{
    associated_token::AssociatedToken, metadata::{create_metadata_accounts_v3, mpl_token_metadata::types::DataV2, CreateMetadataAccountsV3, Metadata}, token::{mint_to, transfer_checked, Mint, MintTo, Token, TokenAccount, TransferChecked}
    associated_token::AssociatedToken,
    metadata::{create_metadata_accounts_v3, CreateMetadataAccountsV3, Metadata,},
    token::{mint_to, transfer_checked, Mint, MintTo, Token, TokenAccount, TransferChecked},
};

use mpl_token_metadata::accounts::{
    // MasterEdition,
    Metadata as MetadataAccount,
};
use mpl_token_metadata::types::DataV2;

use crate::state::*;

// const ADMIN_PUBKEY: Pubkey = pubkey!("4QPAeQG6CTq2zMJAVCJnzY9hciQteaMkgBmcyGL7Vrwp");

/// DOCS: GlobalC now inits a global PETS token mint, to be used during any PetC context for any dog.
/// There is now 1 token for ALL dogs made within the program, by any user.
#[derive(Accounts)]
pub struct GlobalC<'info> {
    #[account(
        mut,
        // address = ADMIN_PUBKEY
    )]
    pub house: Signer<'info>,

    #[account(init, payer = house, seeds = [b"global", house.key().as_ref()], space = Global::LEN, bump)]
    pub global: Account<'info, Global>,

    #[account(init, payer = house, seeds = [b"pets", house.key().as_ref()], mint::decimals=0, mint::authority = mint_auth, bump)]
    pub pets_mint: Account<'info, Mint>,

    /// CHECK: this is safe
    #[account(
        seeds = [b"auth", house.key().as_ref()],
        bump
    )]
    pub mint_auth: UncheckedAccount<'info>,

    ///CHECK: Using "address" constraint to validate metadata account address
    #[account(
        mut,
        address = MetadataAccount::find_pda(&pets_mint.key()).0,
    )]
    pub metadata_account: UncheckedAccount<'info>,

    pub token_program: Program<'info, Token>,
    pub token_metadata_program: Program<'info, Metadata>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,

    /// CHECK: Validate address by deriving pda
    #[account(
        mut,
        seeds = [b"metadata", token_metadata_program.key().as_ref(), pets_mint.key().as_ref()],
        bump,
        seeds::program = token_metadata_program.key(),
    )]
    pub metadata: UncheckedAccount<'info>,
    
    pub token_metadata_program: Program<'info, Metadata>,

    pub rent: Sysvar<'info, Rent>,
}

impl<'info> GlobalC<'info> {
    pub fn init(&mut self, bumps: &GlobalCBumps, token_name: String, token_symbol: String, token_uri: String) -> Result<()> {
        self.global.set_inner(Global {
            house: self.house.key(),
            mint: self.pets_mint.key(),
            auth_bump: bumps.mint_auth,
            mint_bump: bumps.pets_mint,
            global_bump: bumps.global,
        });

        let seeds = &[
            &b"auth"[..],
            &self.house.key().to_bytes()[..],
            &[self.global.auth_bump],
        ];
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
                signer_seeds
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
            false, // Is mutable
            true,  // Update authority is signer
            None,  // Collection details
        )?;

        msg!("Token mint created successfully.");
        Ok(())
    }

    pub fn create_mint(&mut self, uri: String, name: String, symbol: String) -> Result<()> {
        let seeds = &[
            &b"auth"[..],
            &self.house.key().to_bytes()[..],
            &[self.global.auth_bump],
        ];
        let signer_seeds = &[&seeds[..]];


        // On-chain token metadata for the mint
        let data_v2 = DataV2 {
            name,
            symbol,
            uri,
            seller_fee_basis_points: 0,
            creators: None,
            collection: None,
            uses: None,
        };

        // CPI Context
        let cpi_ctx = CpiContext::new_with_signer(
            self.token_metadata_program.to_account_info(),
            CreateMetadataAccountsV3 {
                // the metadata account being created
                metadata: self.metadata_account.to_account_info(),
                // the mint account of the metadata account
                mint: self.pets_mint.to_account_info(),
                // the mint authority of the mint account
                mint_authority: self.mint_auth.to_account_info(),
                // the update authority of the metadata account
                update_authority: self.house.to_account_info(),
                // the payer for creating the metadata account
                payer: self.house.to_account_info(),
                // the system program account
                system_program: self.system_program.to_account_info(),
                // the rent sysvar account
                rent: self.rent.to_account_info(),
            },
            signer_seeds,
        );

        create_metadata_accounts_v3(
            cpi_ctx, // cpi context
            data_v2, // token metadata
            true,    // is_mutable
            true,    // update_authority_is_signer
            None,    // collection details
        )?;

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

    #[account(init, payer = owner, seeds = [b"dog", name.as_str().as_bytes()], space = Dog::LEN, bump)]
    pub dog: Account<'info, Dog>,

    /// CHECK: this is safe
    #[account(
        seeds = [b"auth", dog.key().as_ref()],
        bump
    )]
    pub dog_auth: UncheckedAccount<'info>,

    //bonk mint
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
            pets: 0,
            bonks: 0,
            dog_bump: bumps.dog,
            auth_bump: bumps.dog_auth,
        });
        Ok(())
    }
}

#[derive(Accounts)]
pub struct PetC<'info> {
    #[account(mut)]
    pub signer: Signer<'info>,

    /// CHECK: this is the signer of the GlobalC context
    #[account()]
    pub house: UncheckedAccount<'info>,

    #[account(mut, seeds = [b"global", house.key().as_ref()], bump = global.global_bump)]
    pub global: Account<'info, Global>,

    #[account(init_if_needed, payer = signer, seeds = [signer.key().as_ref()], space = User::LEN, bump)]
    pub user: Account<'info, User>,

    #[account(mut, seeds = [b"dog", dog.name.as_ref()], bump = dog.dog_bump)]
    pub dog: Account<'info, Dog>,

    #[account(mut, seeds = [b"pets", house.key().as_ref()], bump = global.mint_bump)]
    pub pets_mint: Account<'info, Mint>,

    /// CHECK: this is safe, it is the mint_auth from the GlobalC context
    #[account(
        seeds = [b"auth", house.key().as_ref()],
        bump = global.auth_bump
    )]
    pub mint_auth: UncheckedAccount<'info>,

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
        let seeds = &[
            &b"auth"[..],
            &self.house.key().to_bytes()[..],
            &[self.global.auth_bump],
        ];
        let signer_seeds = &[&seeds[..]];

        let ctx = CpiContext::new_with_signer(
            self.token_program.to_account_info(),
            cpi_accounts,
            signer_seeds,
        );
        mint_to(ctx, 1)?;

        self.dog.pets += 1;

        self.user.last_pet = Clock::get()?.slot;

        // tell how many pets the dog has
        msg!("{} has been pet {} times", self.dog.name, self.dog.pets);

        msg!("User's last pet: {}", self.user.last_pet);

        Ok(())
    }
}

#[derive(Accounts)]
pub struct BonkC<'info> {
    #[account(mut)]
    pub signer: Signer<'info>,

    #[account(mut, seeds = [signer.key().as_ref()], bump)]
    pub user: Account<'info, User>,

    #[account(mut, seeds = [b"dog", dog.name.as_ref()], bump = dog.dog_bump)]
    pub dog: Account<'info, Dog>,

    //bonk mint
    //    #[account(mut)]
    pub bonk_mint: Account<'info, Mint>,

    // user's bonk ata
    #[account(mut, associated_token::mint = bonk_mint, associated_token::authority = signer)]
    pub user_bonk_ata: Account<'info, TokenAccount>,

    /// CHECK: this is safe
    #[account(
        seeds = [b"auth", dog.key().as_ref()],
        bump = dog.auth_bump
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

        transfer_checked(ctx, 1_000_000, 6)?;

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
