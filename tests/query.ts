import * as anchor from "@coral-xyz/anchor";
import { Program, web3 } from "@coral-xyz/anchor";
import { PetThatDog } from "../target/types/pet_that_dog";
import { PublicKey } from '@solana/web3.js';


describe("pet-that-dog", () => {
  anchor.setProvider(anchor.AnchorProvider.env());

  const program = anchor.workspace.PetThatDog as Program<PetThatDog>;

  const owner = new PublicKey('4QPAeQG6CTq2zMJAVCJnzY9hciQteaMkgBmcyGL7Vrwp');

  const dogNames = ["Max", "Petey"];

  for (const dogName of dogNames) {

    it(`Fetches dog state - ${dogName}`, async () => {
      const [dog] = web3.PublicKey.findProgramAddressSync(
        [Buffer.from("dog"), Buffer.from(dogName), owner.toBuffer()],
        program.programId,
      );

      const dogAccount = await program.account.dog.fetch(dog);

      // console.log the dog account's key
      console.log(`Dog's key: ${dogName}`, dog.toString());

      console.log(`Dog's pets: ${dogName}`, dogAccount.pets.toString());
      // console.log(`Dog's bonks: ${dogName}`, dogAccount.bonks.toString());
    });
  }
});