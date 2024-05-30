// the dog context inits a dog and its pda's, including a vault

use std::fs::Metadata;

use anchor_lang::{prelude::*, solana_program::stake::state::Meta};
use anchor_spl::{associated_token::AssociatedToken, token::{self, initialize_mint, transfer, InitializeMint, Mint, Token, TokenAccount, Transfer}};

use crate::state::Board;
use crate::state::Dog;
use crate::state::Team;

#[derive(Accounts)]
#[instruction(name: String, params: InitTokenParams)]
pub struct DogC<'info> {
    #[account(mut)]
    pub owner: Signer<'info>,

    // init a Dog account with seeds [b"dog", owner.key().as_ref(), name.to_le_bytes()]
    #[account(init, payer = owner, seeds = [b"dog", name.as_bytes(), owner.key.as_ref()], bump, space = Dog::INIT_SPACE)]
    pub dog: Account<'info, Dog>,

    /// CHECK: New Metaplex Account being created
    #[account(mut)]
    pub metadata: UncheckedAccount<'info>,

    
    #[account(
        init,
        seeds = [b"mint", dog.key().as_ref()],
        bump,
        payer = owner,
        mint::decimals = params.decimals,
        mint::authority = mint,
    )]
    pub mint: Account<'info, Mint>,

    // init a pets Board account with seeds [b"pets", owner.key().as_ref()]
    #[account(init, payer = owner, seeds = [b"pets", dog.key().as_ref()], bump, space = Board::INIT_SPACE)]
    pub petsboard: Account<'info, Board>,

    // init a bonks Board account with seeds [b"bonks", owner.key().as_ref()]
    #[account(init, payer = owner, seeds = [b"bonks", dog.key().as_ref()], bump, space = Board::INIT_SPACE)]
    pub bonkboard: Account<'info, Board>,

    // init a team Board account with seeds [b"team", owner.key().as_ref()]
    #[account(init, payer = owner, seeds = [b"team", dog.key().as_ref()], bump, space = Team::INIT_SPACE)]
    pub teamboard: Account<'info, Team>,

    /// CHECK: this is safe. The system needs this auth account to sign transactions for the program. Since no token or SOL balance will be held with this account, you dont need to init the account, just use its seeds for signing on behalf of the program.
    // #[account(seeds = [b"auth", dog.key().as_ref()], bump)]
    // pub auth: UncheckedAccount<'info>,

    /// DOCS: using a Box wrapping a InterfaceAccount is used because it is compatible with token2022 standard
    // mint account for the vault
    // #[account(init, payer = owner, seeds = [b"mint", dog.key().as_ref()], mint::decimals = 6, mint::authority = auth, bump)]
    // pub mint: InterfaceAccount<'info, Mint>,

    // define a vault account with seeds [b"vault", owner.key().as_ref()] within the system program
    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, Token>,


}

impl<'info> DogC<'info> {
    pub fn init(&mut self, name: String, team: Vec<(Pubkey, u8)>, params: InitTokenParams, bumps: &DogCBumps) -> Result<()> {
        self.dog.set_inner(Dog {
            name,
            pets: 0,
            bonks: 0,
            bump: bumps.dog,
        });

        // get the current slot from the chain
        let slot = Clock::get()?.slot;
        let target = slot + 1000;

        self.petsboard.set_inner(Board {
            members: Vec::with_capacity(11),
            target,
            bump: bumps.petsboard,
        });

        self.bonkboard.set_inner(Board {
            members: Vec::with_capacity(11),
            target,
            bump: bumps.bonkboard,
        });

        self.teamboard.set_inner(Team {
            members: team.into_iter().map(|(key, value)| (key, value)).collect(),
            bump: bumps.teamboard,
        });

        let seeds = &["mint".as_bytes(), &[bumps.mint]];
        let signer = [&seeds[..]];

        let cpi_program = self.token_program.to_account_info();

        let metadata: InitTokenParams = InitTokenParams {
            name: params.name,
            symbol: params.symbol,
            uri: params.uri,
            decimals: params.decimals,
        };  


        let init_context = CpiContext::new_with_signer(cpi_program, , signer);

        initialize_mint(init_context, 6, auth)?;

        Ok(())
    }
}

// 5. Define the init token params
#[derive(AnchorSerialize, AnchorDeserialize, Debug, Clone)]
pub struct InitTokenParams {
    pub name: String,
    pub symbol: String,
    pub uri: String,
    pub decimals: u8,
}