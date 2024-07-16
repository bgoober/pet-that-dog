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
import wallet from "/home/agent/.config/solana/id.json";
import { ASSOCIATED_PROGRAM_ID } from "@coral-xyz/anchor/dist/cjs/utils/token";

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

  let userPetsAta: anchor.web3.PublicKey

  const dogName = ["Max"];
  const [dog] = web3.PublicKey.findProgramAddressSync(
    [Buffer.from("dog"), Buffer.from(dogName.toString())],
    program.programId
  );
  console.log("Dog : ", dog.toBase58());

  let dogMint = PublicKey.findProgramAddressSync(
    [Buffer.from("pets"), dog.toBuffer()],
    program.programId
  )[0];
  console.log("Dog Mint : ", dogMint.toBase58());

  // Declare dogBonkAta at a higher scope to be accessible in both test cases.

  const [auth] = web3.PublicKey.findProgramAddressSync(
    [Buffer.from("auth"), dog.toBuffer()],
    program.programId
  );
  console.log("Dog Auth : ", auth.toBase58());

  userPetsAta = getAssociatedTokenAddressSync(dogMint, keypair.publicKey);


  it(`Is pet! - ${dogName}`, async () => {
    console.log("test");

    let user = PublicKey.findProgramAddressSync(
      [keypair.publicKey.toBuffer()],
      program.programId
    )[0];

    console.log("User pda: ", user.toBase58())

    const tx = await program.methods
      .pet()
      .accountsPartial({
        dog,
        user,
        dogAuth: auth as web3.PublicKey,
        dogMint,
        userPetsAta: userPetsAta,
        associatedTokenProgram: ASSOCIATED_PROGRAM_ID,
        tokenProgram: TOKEN_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
      })
      .signers([keypair])
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