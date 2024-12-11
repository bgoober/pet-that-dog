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

use std::str::FromStr;

use crate::state::*;

// HOUSE addressed to be changed to Squads DAO/Multisig in the future
const HOUSE: &str = "CHGqapwv8xzwtUMyoQYGjo37mm7iNyoEQy5LEgz9kGa8";

#[derive(Accounts)]
pub struct GlobalC<'info> {
    /// CHECK: This account will be constrained to the Squads/Programs/Dev Team's multi-sig account
    #[account(mut, constraint = house.key() == Pubkey::from_str(HOUSE).unwrap())]
    // #[account()]
    pub house: AccountInfo<'info>,

    // #[account(mut)]
    #[account(mut, constraint = payer.key() == Pubkey::from_str(HOUSE).unwrap())]
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
pub struct CreateDogC<'info> {
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

impl<'info> CreateDogC<'info> {
    pub fn init(
        &mut self,
        name: String,
        token_name: String,
        token_symbol: String,
        token_uri: String,
        bumps: &CreateDogCBumps,
    ) -> Result<()> {
        // Only charge if not the house
        if self.owner.key() != self.house.key() {
            let cpi_accounts = Transfer {
                from: self.owner.to_account_info(),
                to: self.house.to_account_info(),
            };
            let ctx = CpiContext::new(self.system_program.to_account_info(), cpi_accounts);
            transfer(ctx, 12_500_000)?; // 0.0125 SOL
        }

        self.dog.set_inner(Dog {
            name,
            owner: self.owner.key(),
            pets: 0,
            bonks: 0,
            wifs: 0,
            pnuts: 0,
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
            true,
            true,
            None,
        )?;

        // msg!("Token mint created successfully.");
        Ok(())
    }
}

#[derive(Accounts)]
pub struct InteractC<'info> {
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

impl<'info> InteractC<'info> {
    pub fn pet(&mut self, bumps: &InteractCBumps) -> Result<()> {
        if self.user.authority != self.signer.key() {
            self.user.set_inner(User {
                authority: self.signer.key(),
                last_action: 0,
                bump: bumps.user,
            });
        }

        if self.user.last_action == Clock::get()?.slot {
            return Err(ErrorCode::TooMuchLove.into());
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

        self.transfer_fee()?;

        self.user.last_action = Clock::get()?.slot;

        Ok(())
    }

    pub fn bonk(&mut self, bumps: &InteractCBumps) -> Result<()> {
        if self.user.authority != self.signer.key() {
            self.user.set_inner(User {
                authority: self.signer.key(),
                last_action: 0,
                bump: bumps.user,
            });
        }

        if self.user.last_action == Clock::get()?.slot {
            return Err(ErrorCode::TooMuchLove.into());
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

        self.dog.bonks += 1;

        self.transfer_fee()?;

        self.user.last_action = Clock::get()?.slot;
        Ok(())
    }

    pub fn wif(&mut self, bumps: &InteractCBumps) -> Result<()> {
        if self.user.authority != self.signer.key() {
            self.user.set_inner(User {
                authority: self.signer.key(),
                last_action: 0,
                bump: bumps.user,
            });
        }

        if self.user.last_action == Clock::get()?.slot {
            return Err(ErrorCode::TooMuchLove.into());
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

        self.dog.wifs += 1;

        self.transfer_fee()?;

        self.user.last_action = Clock::get()?.slot;
        Ok(())
    }

    pub fn pnut(&mut self, bumps: &InteractCBumps) -> Result<()> {
        if self.user.authority != self.signer.key() {
            self.user.set_inner(User {
                authority: self.signer.key(),
                last_action: 0,
                bump: bumps.user,
            });
        }

        if self.user.last_action == Clock::get()?.slot {
            return Err(ErrorCode::TooMuchLove.into());
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

        self.dog.pnuts += 1;

        self.transfer_fee()?;

        self.user.last_action = Clock::get()?.slot;
        Ok(())
    }

    // Helper function for the SOL fee transfer
    fn transfer_fee(&self) -> Result<()> {
        let cpi_accounts = Transfer {
            from: self.signer.to_account_info(),
            to: self.owner.to_account_info(),
        };
        let ctx = CpiContext::new(self.system_program.to_account_info(), cpi_accounts);
        transfer(ctx, 1000)?;
        Ok(())
    }
}

#[derive(Accounts)]
pub struct KillDogC<'info> {
    #[account(mut)]
    pub owner: Signer<'info>,

    #[account(
        mut,
        seeds = [b"dog", dog.name.as_ref(), owner.key().as_ref()],
        bump = dog.dog_bump,
        has_one = owner,
        close = owner
    )]
    pub dog: Account<'info, Dog>,

    #[account(
        seeds = [b"mint", dog.key().as_ref()],
        bump = dog.mint_bump,
        mint::authority = mint_auth,
    )]
    pub dog_mint: Account<'info, Mint>,

    /// CHECK: this is safe
    #[account(
        seeds = [b"auth", dog_mint.key().as_ref()],
        bump = dog.auth_bump
    )]
    pub mint_auth: AccountInfo<'info>,

    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
}

impl<'info> KillDogC<'info> {
    pub fn kill(&mut self) -> Result<()> {
        // Only owner can close the dog account
        require!(
            self.owner.key() == self.dog.owner,
            ErrorCode::UnauthorizedClose
        );
        msg!("Dog account closed and rent returned to owner.");
        Ok(())
    }
}

#[error_code]
pub enum ErrorCode {
    #[msg("Too much love at one time! Don't hog all the love!")]
    TooMuchLove,
    #[msg("Unauthorized close attempt")]
    UnauthorizedClose,
}
