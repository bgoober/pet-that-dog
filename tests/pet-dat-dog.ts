import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { PetDatDog } from "../target/types/pet_dat_dog";

describe("pet-dat-dog", () => {
  // Configure the client to use the local cluster.
  anchor.setProvider(anchor.AnchorProvider.env());

  const program = anchor.workspace.PetDatDog as Program<PetDatDog>;

  it("Is initialized!", async () => {
    // Add your test here.
    const tx = await program.methods.createDog("Max").rpc();
    console.log("Your transaction signature", tx);
  });

  it("Is pet!", async () => {
    // Add your test here.
    const tx = await program.methods.pet();
    console.log("Your transaction signature", tx);
  });

  it("Is bonked!", async () => {
    // Add your test here.
    const tx = await program.methods.bonk();
    console.log("Your transaction signature", tx);
  });
});
