import * as anchor from "@coral-xyz/anchor";
import { Program, web3 } from "@coral-xyz/anchor";
import { PetDatDog } from "../target/types/pet_dat_dog";
import {
  TOKEN_PROGRAM_ID,
  createMint,
  getAssociatedTokenAddress,
  getOrCreateAssociatedTokenAccount,
  mintTo,
} from "@solana/spl-token";
import { Keypair, PublicKey, SystemProgram } from "@solana/web3.js";
import wallet from "/home/agent/.config/solana/id.json";
import { ASSOCIATED_PROGRAM_ID } from "@coral-xyz/anchor/dist/cjs/utils/token";
import { publicKey } from "@coral-xyz/anchor/dist/cjs/utils";

describe("pet-dat-dog", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);
  const program = anchor.workspace.PetDatDog as Program<PetDatDog>;
  const connection = provider.connection;
  const keypair = Keypair.fromSecretKey(new Uint8Array(wallet));

  const confirm = async (signature: string): Promise<string> => {
    const block = await connection.getLatestBlockhash();
    await connection.confirmTransaction({ signature, ...block });
    return signature;
  };

  const log = async (signature: string): Promise<string> => {
    console.log(signature);
    return signature;
  };

  let bonkMint: anchor.web3.PublicKey;
  const dogName = ["Max"];
  const [dog] = web3.PublicKey.findProgramAddressSync(
    [Buffer.from("dog"), Buffer.from(dogName.toString())],
    program.programId
  );

  let dogMint = PublicKey.findProgramAddressSync(
    [Buffer.from("pets"), dog.toBuffer()],
    program.programId
  )[0];

  // Declare dogBonkTa at a higher scope to be accessible in both test cases.
  let dogBonkTa: anchor.web3.PublicKey;

  it("Setup token environment", async () => {
    bonkMint = await createMint(provider.connection, keypair, provider.publicKey, null, 6);
    console.log("Bonk Mint address: ", bonkMint.toBase58());

    const userBonkAta = (
      await getOrCreateAssociatedTokenAccount(provider.connection, keypair, bonkMint, keypair.publicKey)
    ).address;
    await mintTo(provider.connection, keypair, bonkMint, userBonkAta, keypair, 1_000_000_0);
    console.log("User bonkAta address: ", userBonkAta.toBase58());

    // Move the dogBonkTa calculation here and ensure it's assigned to the higher scope variable.
    dogBonkTa = (
      await getOrCreateAssociatedTokenAccount(connection, keypair, bonkMint, dog, true)
    ).address;
    console.log("dogBonkTa address: ", dogBonkTa.toBase58());
  });

  it(`Is initialized! - ${dogName}`, async () => {
    const tx = await program.methods
      .createDog(dogName.toString())
      .accountsPartial({
        dog,
        owner: keypair.publicKey,
        dogMint,
        bonkMint,
        dogBonkTa,
        associatedTokenProgram: ASSOCIATED_PROGRAM_ID,
        tokenProgram: TOKEN_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
      })
      .signers([keypair])
      .rpc()
      .then(confirm)
      .then(log);
  });
});

//   it(`Is pet! - ${dogName}`, async () => {
//     const [dog] = web3.PublicKey.findProgramAddressSync(
//       [
//         Buffer.from("dog"),
//         Buffer.from(dogName),
//         keypair.publicKey.toBuffer(),
//       ],
//       program.programId
//     );

//     const userPetsAta = (
//       await getOrCreateAssociatedTokenAccount(
//         provider.connection,
//         keypair,
//         dogMint,
//         keypair.publicKey
//       )
//     ).address;

//     const tx = await program.methods
//       .pet()
//       .accountsPartial({ owner: keypair.publicKey, dog, dogMint, userPetsAta })
      // .signers([keypair])
      // .rpc()
      // .then(confirm)
      // .then(log);
//     console.log("Your pet tx signature is: ", tx);
//   });

//   it(`Is bonked! - ${dogName}`, async () => {
//     const [dog] = web3.PublicKey.findProgramAddressSync(
//       [
//         Buffer.from("dog"),
//         Buffer.from(dogName),
//         keypair.publicKey.toBuffer(),
//       ],
//       program.programId
//     );

//     const dogBonkAta = (
//       await getOrCreateAssociatedTokenAccount(
//         provider.connection,
//         keypair,
//         bonkMint,
//         dog,
//         true
//       )
//     ).address;

//     const userBonkAta = (
//       await getOrCreateAssociatedTokenAccount(
//         provider.connection,
//         keypair,
//         bonkMint,
//         keypair.publicKey
//       )
//     ).address;

//     const tx = await program.methods
//       .bonk()
//       .accountsPartial({
//         dog,
//         owner: keypair.publicKey,
//         dogBonkAta,
//         bonkMint,
//         userBonkAta,
//       })          
      // .signers([keypair])
      // .rpc()
      // .then(confirm)
      // .then(log);
//     console.log("Your bonk tx signature is: ", tx);
//   });

//   it(`Fetches dog state - ${dogName}`, async () => {
//     const [dog] = web3.PublicKey.findProgramAddressSync(
//       [
//         Buffer.from("dog"),
//         Buffer.from(dogName),
//         keypair.publicKey.toBuffer(),
//       ],
//       program.programId
//     );

//     const dogAccount = await program.account.dog.fetch(dog);

//     console.log(`Dog's pets: ${dogName}`, dogAccount.pets.toString());
//     console.log(`Dog's bonks: ${dogName}`, dogAccount.bonks.toString());

//     // find all the accounts underneath the dog account
//   });
// });
