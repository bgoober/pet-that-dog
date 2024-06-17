use anchor_lang::prelude::*;

mod state;

mod contexts;

use contexts::*;


declare_id!("4QPAeQG6CTq2zMJAVCJnzY9hciQteaMkgBmcyGL7Vrwp");

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


#[error_code]
pub enum ErrorCode {
    #[msg("Too many pets in one slot")]
    TooManyPets,
    #[msg("Session error")]
    SessionError,
}




