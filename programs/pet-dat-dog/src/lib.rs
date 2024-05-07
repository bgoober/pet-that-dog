use anchor_lang::prelude::*;

declare_id!("4Z2Tjaw2a4tMUnefnPExQ7sE4UfYSZhZT1pMDKfvAofL");

#[program]
pub mod pet_dat_dog {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize {}
