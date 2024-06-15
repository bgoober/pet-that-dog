use anchor_lang::prelude::*;

mod state;

mod contexts;

use contexts::*;


declare_id!("4Z2Tjaw2a4tMUnefnPExQ7sE4UfYSZhZT1pMDKfvAofL");

#[program]
pub mod pet_dat_dog {

    use super::*;

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







