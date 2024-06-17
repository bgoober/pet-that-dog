import * as anchor from "@coral-xyz/anchor";
import { Program, web3 } from "@coral-xyz/anchor";
import { PetDatDog } from "../target/types/pet_dat_dog";
import { PublicKey } from '@solana/web3.js';

describe("pet-dat-dog", () => {
  // Configure the client to use the local cluster.
  anchor.setProvider(anchor.AnchorProvider.env());

  const program = anchor.workspace.PetDatDog as Program<PetDatDog>;

  const owner = new PublicKey('4QPAeQG6CTq2zMJAVCJnzY9hciQteaMkgBmcyGL7Vrwp');

  const dogNames = ["Max", "Petey"];

  for (const dogName of dogNames) {
    it(`Is initialized! - ${dogName}`, async () => {
      try {
        await program.methods.createDog(dogName).rpc();
      } catch (error) {
        if (error.logs && error.logs.some((log: string | string[]) => log.includes('Allocate: account Address already in use'))) {
            console.error(`Error: The dog ${dogName} is already initialized.`);
        } else {
            console.error("An unexpected error occurred:", error);
        }
      }
    });

    it(`Is pet! - ${dogName}`, async () => {
      const [dog] = web3.PublicKey.findProgramAddressSync(
        [Buffer.from("dog"), Buffer.from(dogName), owner.toBuffer()],
        program.programId,
      );

      const tx = await program.methods
      .pet()
      .accountsPartial({
        dog,
        owner,
      })
      .rpc();
      console.log("Your pet tx signature is: ", tx);
    });

    it(`Is bonked! - ${dogName}`, async () => {
      const [dog] = web3.PublicKey.findProgramAddressSync(
        [Buffer.from("dog"), Buffer.from(dogName), owner.toBuffer()],
        program.programId,
      );

      const tx = await program.methods
      .bonk()
      .accountsPartial({
        dog,
        owner,
      })
      .rpc();
      console.log("Your bonk tx signature is: ", tx);
    });

    it(`Fetches dog state - ${dogName}`, async () => {
      const [dog] = web3.PublicKey.findProgramAddressSync(
        [Buffer.from("dog"), Buffer.from(dogName), owner.toBuffer()],
        program.programId,
      );

      const dogAccount = await program.account.dog.fetch(dog);

      console.log(`Dog's pets: ${dogName}`, dogAccount.pets.toString());
      console.log(`Dog's bonks: ${dogName}`, dogAccount.bonks.toString());

      // find all the accounts underneath the dog account
      
    });
  }
});