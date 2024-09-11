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

  // const confirm = async (signature: string): Promise<string> => {
  //   const block = await connection.getLatestBlockhash();
  //   await connection.confirmTransaction({ signature, ...block });
  //   return signature;
  // };

  const log = async (signature: string): Promise<string> => {
    console.log(signature);
    return signature;
  };

  let userPetsAta: anchor.web3.PublicKey;

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

  let user2 = PublicKey.findProgramAddressSync(
    [keypair.publicKey.toBuffer()],
    program.programId
  )[0];

  let user2petsAta = getAssociatedTokenAddressSync(petsMint, keypair.publicKey); 
  console.log("User2 main keypair petsAta account: ", user2petsAta.toBase58());

  userPetsAta = getAssociatedTokenAddressSync(petsMint, player2.publicKey);
  console.log("User petsAta account: ", userPetsAta.toBase58());

  console.log("player 2 public key: ", player2.publicKey.toBase58());

  const dog2Name = ["Petey"];
  const [dog2] = web3.PublicKey.findProgramAddressSync(
    [Buffer.from("dog"), Buffer.from(dog2Name.toString())],
    program.programId
  );
  console.log("Dog account: ", dog2.toBase58());

  const [dog2Auth] = web3.PublicKey.findProgramAddressSync(
    [Buffer.from("auth"), dog2.toBuffer()],
    program.programId
  );
  console.log("Dog Auth account: ", dog2Auth.toBase58());

  let bonkMint = new PublicKey("B7W6Jjc6xe9QsBoqS6vyeB9p9uY1N6EYooQx5H8NP7Z2");

  let dog2BonkAta = getAssociatedTokenAddressSync(bonkMint, dog2Auth, true);
  console.log("dogBonkAta account: ", dog2BonkAta.toBase58());

  it(`Is pet! - ${dogName}`, async () => {
    const tx = await program.methods
      .pet()
      .accountsPartial({
        signer: player2.publicKey,
        house: keypair.publicKey,
        dog,
        user,
        owner: keypair.publicKey,
        petsMint,
        mintAuth,
        userPetsAta: userPetsAta,
        associatedTokenProgram: ASSOCIATED_PROGRAM_ID,
        tokenProgram: TOKEN_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
      })
      .signers([player2])
      .rpc()
      .then()
      .then(log);
    console.log("Your pet tx signature is: ", tx);
  });

  it(`Fetches dog state - ${dogName}`, async () => {
    const dogAccount = await program.account.dog.fetch(dog);

    console.log(`${dogName}'s pets: `, dogAccount.pets.toString());
    console.log(`${dogName}'s bonks:`, dogAccount.bonks.toString());
  });

  it(`Dog created - ${dog2Name}`, async () => {
    let global = new PublicKey("EPEcGyW9uxqbMBkAmFcNZ37iCLFYhmAzzZviJ8jmYeSV");

    const dog2Name = ["Petey"];
    const [dog2] = web3.PublicKey.findProgramAddressSync(
      [Buffer.from("dog"), Buffer.from(dog2Name.toString())],
      program.programId
    );
    console.log("Dog account: ", dog2.toBase58());

    const [dog2Auth] = web3.PublicKey.findProgramAddressSync(
      [Buffer.from("auth"), dog2.toBuffer()],
      program.programId
    );
    console.log("Dog Auth account: ", dog2Auth.toBase58());

    let dog2BonkAta = getAssociatedTokenAddressSync(bonkMint, dog2Auth, true);
    console.log("dogBonkAta account: ", dog2BonkAta.toBase58());

    // console.log("test1");
    // const txHash = await program.methods
    //   .createDog(dog2Name.toString())
    //   .accountsPartial({
    //     dog: dog2,
    //     owner: player2.publicKey,
    //     dogAuth: dog2Auth,
    //     bonkMint,
    //     dogBonkAta: dog2BonkAta,
    //     house: keypair.publicKey, // defined by the local wallet now, but will need to be derived later
    //     global,
    //     tokenProgram: TOKEN_PROGRAM_ID,
    //     associatedTokenProgram: ASSOCIATED_PROGRAM_ID,
    //     systemProgram: SystemProgram.programId,
    //   })
    //   .signers([player2])
    //   .rpc()
    //   .then(confirm)
    //   .then(log);
    // console.log("Your create dog tx signature is: ", txHash);
    // if (!txHash) throw new Error("Failed to initialize.");
  });

  it(`Is pet! - ${dog2Name}`, async () => {
    const tx = await program.methods
      .pet()
      .accountsPartial({
        signer: keypair.publicKey,
        house: keypair.publicKey,
        dog: dog2,
        user: user2,
        owner: player2.publicKey,
        petsMint,
        mintAuth,
        userPetsAta: user2petsAta,
        associatedTokenProgram: ASSOCIATED_PROGRAM_ID,
        tokenProgram: TOKEN_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
      })
      // .signers()
      .rpc()
      .then()
      .then(log);
    console.log("Your pet tx signature is: ", tx);
  });

  // bonk dog2
  it(`Is bonked! - ${dog2Name}`, async () => {

    // player2 bonk ata
    let userBonkAta = getAssociatedTokenAddressSync(bonkMint, player2.publicKey);

    let user = PublicKey.findProgramAddressSync(
      [player2.publicKey.toBuffer()],
      program.programId
    )[0];

    const tx = await program.methods
      .bonk()
      .accountsPartial({
        signer: player2.publicKey,
        dog: dog2,
        user,
        bonkMint,
        dogBonkAta: dog2BonkAta,
        userBonkAta,
        associatedTokenProgram: ASSOCIATED_PROGRAM_ID,
        tokenProgram: TOKEN_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
      })
      .signers([player2])
      .rpc()
      .then()
      .then(log);
    console.log("Your bonk tx signature is: ", tx);
  });

  it(`Fetches dog state - ${dog2Name}`, async () => {
    const dog2Account = await program.account.dog.fetch(dog2);
    // log dog2 account
    console.log(`${dog2Name} account : `, dog2.toBase58());

    console.log(`${dog2Name}'s pets: `, dog2Account.pets.toString());
    console.log(`${dog2Name}'s bonks:`, dog2Account.bonks.toString());
  });
});
