import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { PetDatDog } from "../target/types/pet_dat_dog";

describe("pet-dat-dog", () => {
  // Configure the client to use the local cluster.
  anchor.setProvider(anchor.AnchorProvider.env());

  const program = anchor.workspace.PetDatDog as Program<PetDatDog>;

  it("Querying program accounts", async () => {
    const accounts = await program.provider.connection.getProgramAccounts(
      program.programId
    );
    // number of accounts
    console.log("number of accounts: ", accounts.length);

    console.log(accounts);

    // account 0 owner
    //console.log("account 0 owner: ", accounts[0].account.owner.toBase58());
    // account 1 data
    // console.log("account 1 data: ", accounts[1].account.data);

    // account 0 pubkey
    console.log("account 0 pubkey: ", accounts[0].pubkey.toBase58());

    // account 1 pubkey
    console.log("account 1 pubkey: ", accounts[1].pubkey.toBase58());

    // account 2 pubkey
    console.log("account 2 pubkey: ", accounts[2].pubkey.toBase58());
  });
});

// other anchor CLI queries using the pubkey's of the accounts

// Global Program return structure
// anchor account pet_that_dog.Global 2S1oBtxp6TUHWRHhJgmLAkqAZSvU2c2s43JDLaY9k1AD

// Return for the Leaderboard ?
// anchor account pet_that_dog.UserStruct 2S1oBtxp6TUHWRHhJgmLAkqAZSvU2c2s43JDLaY9k1AD

// returns data for the 
// anchor account pet_that_dog.User 2S1oBtxp6TUHWRHhJgmLAkqAZSvU2c2s43JDLaY9k1AD

// Returns the lastPet slot and the number of pets (not sure if total pets or pets for all users just the user's pets)
// anchor account pet_that_dog.User 8beeDUsgaz9RqncSeXRU53y4Xe1peuu39RMT7fdj51hj

// multiple users now needed to be tested to see if the differences in accounts and the data returned, plus the leaderboard