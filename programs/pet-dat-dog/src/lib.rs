use anchor_lang::prelude::*;

use mpl_core::{
    accounts::BaseCollectionV1,
    instructions::{CreateCollectionV2CpiBuilder, CreateV2CpiBuilder},
    types::{Creator, Plugin, PluginAuthority, PluginAuthorityPair, Royalties, RuleSet},
    ID as MPL_CORE_PROGRAM_ID,
};

use std::str::FromStr;

mod context;

use context::*;

mod state;

declare_id!("DNHVjKARnjUuTykjqhbrQ1veV8YFkmqiwP65EKd19YPT");

#[program]
pub mod pet_dat_dog {

    use super::*;

    pub fn init_global(
        ctx: Context<GlobalC>,
        token_name: String,
        token_symbol: String,
        token_uri: String,
    ) -> Result<()> {
        ctx.accounts
            .init(&ctx.bumps, token_name, token_symbol, token_uri)?;
        Ok(())
    }

    pub fn create_collection(ctx: Context<CreateCollection>) -> Result<()> {
        // sumwut srs. house address
        let creator1 = Pubkey::from_str("4QPAeQG6CTq2zMJAVCJnzY9hciQteaMkgBmcyGL7Vrwp").unwrap();
        // pet dat dog! squads multi-sig
        let creator2 = Pubkey::from_str("4QPAeQG6CTq2zMJAVCJnzY9hciQteaMkgBmcyGL7Vrwp").unwrap();
        // flarnrule's address
        let creator3 = Pubkey::from_str("4QPAeQG6CTq2zMJAVCJnzY9hciQteaMkgBmcyGL7Vrwp").unwrap();

        let mut collection_plugins = vec![];

        collection_plugins.push(PluginAuthorityPair {
            plugin: Plugin::Royalties(Royalties {
                basis_points: 200,
                creators: vec![
                    Creator {
                        address: creator1,
                        percentage: 50,
                    },
                    Creator {
                        address: creator2,
                        percentage: 40,
                    },
                    Creator {
                        address: creator3,
                        percentage: 10,
                    },
                ],
                rule_set: RuleSet::None,
            }),
            // set the plugin update authority to the payer, which should be our own house address
            authority: Some(PluginAuthority::Address {
                address: ctx.accounts.payer.key(),
            }),
        });
        CreateCollectionV2CpiBuilder::new(&ctx.accounts.mpl_core_program.to_account_info())
            .collection(&ctx.accounts.collection.to_account_info())
            .payer(&ctx.accounts.payer.to_account_info())
            .system_program(&ctx.accounts.system_program.to_account_info())
            .name("pet dat dog!".to_string())
            .uri("https://example.com".to_string())
            .plugins(collection_plugins)
            .invoke()?;

        Ok(())
    }

    pub fn create_asset(ctx: Context<CreateAsset>) -> Result<()> {
        CreateV2CpiBuilder::new(&ctx.accounts.mpl_core_program.to_account_info())
            .asset(&ctx.accounts.asset.to_account_info())
            .collection(Some(&ctx.accounts.collection.to_account_info()))
            .payer(&ctx.accounts.payer.to_account_info())
            .system_program(&ctx.accounts.system_program.to_account_info())
            .name("Max".to_string())
            .uri("https://example.com".to_string())
            .invoke()?;

        Ok(())
    }

    pub fn create_dog(ctx: Context<DogC>, name: String) -> Result<()> {
        ctx.accounts.init(name, &ctx.bumps)?;
        Ok(())
    }

    // pet, taking a User as context
    pub fn pet(ctx: Context<PetC>) -> Result<()> {
        ctx.accounts.pet()?;
        Ok(())
    }

    // bonk, taking a User as context
    pub fn bonk(ctx: Context<BonkC>) -> Result<()> {
        ctx.accounts.bonk()?;
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
