import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { PetDatDog } from "../target/types/pet_dat_dog";

describe("pet-dat-dog", () => {
  // Configure the client to use the local cluster.
  anchor.setProvider(anchor.AnchorProvider.env());

  const program = anchor.workspace.PetDatDog as Program<PetDatDog>;

//   const payer = (program.provider as anchor.AnchorProvider).wallet;
//   const [global] = web3.PublicKey.findProgramAddressSync(
//     [Buffer.from("global")],
//     program.programId,
//   )
//   const [user] = web3.PublicKey.findProgramAddressSync(
//     [Buffer.from("user"), global.toBuffer(), payer.publicKey.toBuffer()],
//     program.programId,
//   )

  it("Petting Dog!", async () => {
    const tx = await program.methods
      .pet()
      .rpc({
        skipPreflight:true
      });

    console.log("Your transaction signature is: ", tx);
  });
});