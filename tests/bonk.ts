import * as anchor from "@coral-xyz/anchor";
import { Program, web3 } from "@coral-xyz/anchor";
import { PetDatDog } from "../target/types/pet_dat_dog";
import {
  TOKEN_PROGRAM_ID,
  getAssociatedTokenAddressSync,
} from "@solana/spl-token";
import { Keypair, PublicKey, SystemProgram } from "@solana/web3.js";
import wallet from "/home/agent/.config/solana/id.json";
import { ASSOCIATED_PROGRAM_ID } from "@coral-xyz/anchor/dist/cjs/utils/token";

// Add helper function
const getSolscanLink = (signature: string) => {
  return `https://solscan.io/tx/${signature}?cluster=custom&customUrl=http://localhost:8899`;
};

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

  // Token variables
  let bonkMint: anchor.web3.PublicKey;
  let pnutMint: anchor.web3.PublicKey;
  let wifMint: anchor.web3.PublicKey;
  
  // User ATAs
  let userBonkAta: anchor.web3.PublicKey;
  let userPnutAta: anchor.web3.PublicKey;
  let userWifAta: anchor.web3.PublicKey;
  
  // Dog ATAs
  let dogBonkAta: anchor.web3.PublicKey;
  let dogPnutAta: anchor.web3.PublicKey;
  let dogWifAta: anchor.web3.PublicKey;

  let petsMint = PublicKey.findProgramAddressSync(
    [Buffer.from("pets")],
    program.programId
  )[0];
  console.log("PETS Mint: ", getSolscanLink(petsMint.toBase58()));

  let mintAuth = PublicKey.findProgramAddressSync(
    [Buffer.from("auth")],
    program.programId
  )[0];
  console.log("PETS Mint Auth: ", getSolscanLink(mintAuth.toBase58()));

  const dogName = ["Max"];
  const [dog] = web3.PublicKey.findProgramAddressSync(
    [
      Buffer.from("dog"),
      Buffer.from(dogName.toString()),
      keypair.publicKey.toBuffer(),
    ],
    program.programId
  );
  console.log("Dog account: ", getSolscanLink(dog.toBase58()));

  const [dogAuth] = web3.PublicKey.findProgramAddressSync(
    [Buffer.from("auth"), dog.toBuffer()],
    program.programId
  );
  console.log("Dog Auth account: ", getSolscanLink(dogAuth.toBase58()));

  let user = PublicKey.findProgramAddressSync(
    [keypair.publicKey.toBuffer()],
    program.programId
  )[0];

  it("Setup token environment", async () => {
    // Use hardcoded mints from the previous test run
    bonkMint = new PublicKey('811z1oa7SyPMP8yUDQmEFD7qaFxg3U3jKmqiDZe2WsqE');  // Get this from pet-dat-dog.ts console output
    pnutMint = new PublicKey('CedVn8RCnoHJtHxcGsYukRFHfaw68hW5m3fLbRrnHCuY');  // Get this from pet-dat-dog.ts console output
    wifMint = new PublicKey('CB2Y4jeFN7u5bMRVTgMUL7ovp61QNiz5nKr78JZsJKzK');   // Get this from pet-dat-dog.ts console output

    // Get user ATAs for existing mints
    userBonkAta = getAssociatedTokenAddressSync(bonkMint, keypair.publicKey);
    userPnutAta = getAssociatedTokenAddressSync(pnutMint, keypair.publicKey);
    userWifAta = getAssociatedTokenAddressSync(wifMint, keypair.publicKey);

    // Get dog ATAs for existing mints
    dogBonkAta = getAssociatedTokenAddressSync(bonkMint, dogAuth, true);
    dogPnutAta = getAssociatedTokenAddressSync(pnutMint, dogAuth, true);
    dogWifAta = getAssociatedTokenAddressSync(wifMint, dogAuth, true);

    // Verify the dog account exists
    const dogAccount = await program.account.dog.fetch(dog);
    console.log("Found existing dog:", dogAccount.name);
  });

  it(`Bonk the dog - ${dogName}`, async () => {
    const tx = await program.methods
      .bonk()
      .accounts({
        signer: keypair.publicKey,
        dog,
        bonkMint,
        userBonkAta,
        dogAuth,
        dogBonkAta,
        tokenProgram: TOKEN_PROGRAM_ID,
        associatedTokenProgram: ASSOCIATED_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
      })
      .rpc()
      .then(confirm)
      .then(log);
    console.log("Your bonk tx signature: ", getSolscanLink(tx));

    const dogBonkBalance = await provider.connection.getTokenAccountBalance(dogBonkAta);
    console.log("Dog BONK balance: ", getSolscanLink(dogBonkAta.toBase58()));
  });

  it(`PNUT the dog - ${dogName}`, async () => {
    const tx = await program.methods
      .pnut()
      .accounts({
        signer: keypair.publicKey,
        dog,
        pnutMint,
        userPnutAta,
        dogAuth,
        dogPnutAta,
        tokenProgram: TOKEN_PROGRAM_ID,
        associatedTokenProgram: ASSOCIATED_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
      })
      .rpc()
      .then(confirm)
      .then(log);
    console.log("Your pnut tx signature: ", getSolscanLink(tx));

    const dogPnutBalance = await provider.connection.getTokenAccountBalance(dogPnutAta);
    console.log("Dog PNUT balance: ", getSolscanLink(dogPnutAta.toBase58()));
  });

  it(`WIF the dog - ${dogName}`, async () => {
    const tx = await program.methods
      .wif()
      .accounts({
        signer: keypair.publicKey,
        dog,
        wifMint,
        userWifAta,
        dogAuth,
        dogWifAta,
        tokenProgram: TOKEN_PROGRAM_ID,
        associatedTokenProgram: ASSOCIATED_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
      })
      .rpc()
      .then(confirm)
      .then(log);
    console.log("Your wif tx signature: ", getSolscanLink(tx));

    const dogWifBalance = await provider.connection.getTokenAccountBalance(dogWifAta);
    console.log("Dog WIF balance: ", getSolscanLink(dogWifAta.toBase58()));
  });

  it("Verify final balances", async () => {
    console.log("\nFinal token balances:");
    console.log("Dog BONK balance:", getSolscanLink(dogBonkAta.toBase58()));
    console.log("Dog PNUT balance:", getSolscanLink(dogPnutAta.toBase58()));
    console.log("Dog WIF balance:", getSolscanLink(dogWifAta.toBase58()));
  });
});