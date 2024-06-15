use anchor_lang::prelude::*;

use crate::state::Dog;
//use crate::state::Team;

#[derive(Accounts)]
#[instruction(name: String)]
pub struct DogC<'info> {

    #[account(mut)]
    pub owner: Signer<'info>,

    #[account(init, payer = owner, seeds = [b"dog", name.as_bytes(), owner.key().as_ref()], space = Dog::LEN, bump)]
    pub dog: Account<'info, Dog>,

    // #[account(init, payer = owner, seeds = [b"team"], space = Team::LEN, bump)]
    // pub team: Account<'info, Team>,

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

    pub system_program: Program<'info, System>,
}

impl<'info> PetC<'info> {
    pub fn pet(&mut self) -> Result<()> {
        self.dog.pets += 1;

        // tell how many pets the dog has
        msg!("{} has been pet {} times", self.dog.name, self.dog.pets);
        Ok(())
    }
}

#[derive(Accounts)]
pub struct BonkC<'info> {

    #[account(mut)]
    pub user: Signer<'info>,

    pub owner: SystemAccount<'info>,

    #[account(mut, seeds = [b"dog", dog.name.as_ref(), owner.key().as_ref()], bump)]
    pub dog: Account<'info, Dog>,

    pub system_program: Program<'info, System>,
}

impl<'info> BonkC<'info> {
    pub fn bonk(&mut self) -> Result<()> {
        self.dog.bonks += 1;

        // tell how many bonks the dog has
        msg!("{} has been bonked {} times", self.dog.name, self.dog.bonks);
        Ok(())
    }
}
