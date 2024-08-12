import * as anchor from "@coral-xyz/anchor";
import { Program, web3 } from "@coral-xyz/anchor";
import { PetDatDog } from "../target/types/pet_dat_dog";
import {
  TOKEN_PROGRAM_ID,
  createMint,
  getAssociatedTokenAddressSync,
  getOrCreateAssociatedTokenAccount,
  mintTo,
} from "@solana/spl-token";
import { Keypair, PublicKey, SystemProgram } from "@solana/web3.js";
// use my local keypair for signing
import wallet from "/home/agent/.config/solana/id.json";
import wallet2 from "../wallet.json";
import { publicKey } from "@coral-xyz/anchor/dist/cjs/utils";

// Get the keypair from the wallet
// const player1 = Keypair.fromSecretKey(new Uint8Array(wallet));

import { ASSOCIATED_PROGRAM_ID } from "@coral-xyz/anchor/dist/cjs/utils/token";

describe("pet-dat-dog", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);
  const program = anchor.workspace.PetDatDog as Program<PetDatDog>;
  const connection = provider.connection;
  const keypair = Keypair.fromSecretKey(new Uint8Array(wallet));
  const player2 = Keypair.fromSecretKey(new Uint8Array(wallet2));

  const confirm = async (signature: string): Promise<string> => {
    const block = await connection.getLatestBlockhash();
    await connection.confirmTransaction({ signature, ...block });
    return signature;
  };

  const log = async (signature: string): Promise<string> => {
    console.log(signature);
    return signature;
  };

  let userPetsAta: anchor.web3.PublicKey

  let petsMint = PublicKey.findProgramAddressSync(
    [Buffer.from("pets"), keypair.publicKey.toBuffer()],
    program.programId
  )[0];
  console.log("PETS Mint: ", petsMint.toBase58());

  let mintAuth = PublicKey.findProgramAddressSync(
    [Buffer.from("auth"), keypair.publicKey.toBuffer()],
    program.programId
  )[0];
  console.log("PETS Mint Auth: ", mintAuth.toBase58());

  const dogName = ["Max"];
  const [dog] = web3.PublicKey.findProgramAddressSync(
    [Buffer.from("dog"), Buffer.from(dogName.toString())],
    program.programId
  );
  console.log("Dog account: ", dog.toBase58());

  const [dogAuth] = web3.PublicKey.findProgramAddressSync(
    [Buffer.from("auth"), dog.toBuffer()],
    program.programId
  );
  console.log("Dog Auth account: ", dogAuth.toBase58());

  let user = PublicKey.findProgramAddressSync(
    [player2.publicKey.toBuffer()],
    program.programId
  )[0];

  userPetsAta = getAssociatedTokenAddressSync(petsMint, player2.publicKey);
  console.log("User petsAta account: ", userPetsAta.toBase58());

  console.log("player 2 public key: ", player2.publicKey.toBase58());

  it(`Is pet! - ${dogName}`, async () => {
    const tx = await program.methods
      .pet()
      .accountsPartial({
        signer: player2.publicKey,
        house: keypair.publicKey,
        dog,
        user,
        petsMint,
        mintAuth,
        userPetsAta: userPetsAta,
        associatedTokenProgram: ASSOCIATED_PROGRAM_ID,
        tokenProgram: TOKEN_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
      })
      .signers([player2])
      .rpc()
      .then(confirm)
      .then(log);
    console.log("Your pet tx signature is: ", tx);
  });
  
  it(`Fetches dog state - ${dogName}`, async () => {
    const dogAccount = await program.account.dog.fetch(dog);

    console.log(`${dogName}'s pets: `, dogAccount.pets.toString());
    console.log(`${dogName}'s bonks:`, dogAccount.bonks.toString());
  });
});