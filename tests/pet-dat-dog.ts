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
import { expect } from "chai";

describe("pet-dat-dog", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);
  const program = anchor.workspace.PetDatDog as Program<PetDatDog>;
  const connection = provider.connection;
  const keypair = Keypair.fromSecretKey(new Uint8Array(wallet));

  // Helper function for transaction confirmation
  const confirm = async (signature: string): Promise<string> => {
    const block = await connection.getLatestBlockhash();
    await connection.confirmTransaction({ signature, ...block });
    return signature;
  };

  // Helper function for logging
  const log = async (signature: string): Promise<string> => {
    console.log(signature);
    return signature;
  };

  // Helper function for transaction signatures only
  const getSolscanLink = (signature: string) => {
    return `https://solscan.io/tx/${signature}?cluster=custom&customUrl=http://localhost:8899`;
  };

  // Helper function for interactions
  const interactWithDog = async (
    action: "pet" | "bonk" | "wif" | "pnut",
    dog: PublicKey,
    user: PublicKey,
    dogMint: PublicKey,
    mintAuth: PublicKey,
    userTokenAta: PublicKey
  ) => {
    const tx = await program.methods[action]()
      .accountsPartial({
        dog,
        user,
        owner: keypair.publicKey,
        dogMint,
        mintAuth,
        userTokenAta,
        associatedTokenProgram: ASSOCIATED_PROGRAM_ID,
        tokenProgram: TOKEN_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
      })
      .rpc()
      .then(confirm)
      .then(log);

    console.log(`Your ${action} tx signature: `, getSolscanLink(tx));
    await new Promise((resolve) => setTimeout(resolve, 1000)); // Add delay between actions
  };

  let house = new PublicKey("CHGqapwv8xzwtUMyoQYGjo37mm7iNyoEQy5LEgz9kGa8");

  const dogName = ["Maximilian I"];
  const [dog] = web3.PublicKey.findProgramAddressSync(
    [
      Buffer.from("dog"),
      Buffer.from(dogName.toString()),
      keypair.publicKey.toBuffer(),
    ],
    program.programId
  );

  let dogMint = PublicKey.findProgramAddressSync(
    [Buffer.from("mint"), dog.toBuffer()],
    program.programId
  )[0];

  let mintAuth = PublicKey.findProgramAddressSync(
    [Buffer.from("auth"), dogMint.toBuffer()],
    program.programId
  )[0];

  let user = PublicKey.findProgramAddressSync(
    [keypair.publicKey.toBuffer()],
    program.programId
  )[0];

  let userTokenAta = getAssociatedTokenAddressSync(dogMint, keypair.publicKey);

  const [global] = web3.PublicKey.findProgramAddressSync(
    [Buffer.from("global")],
    program.programId
  );

  // Tests
  it("Global is Initialized", async () => {
    const txHash = await program.methods
      .initGlobal()
      .accountsPartial({
        global,
        house,
        payer: keypair.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .rpc()
      .then(confirm)
      .then(log);
    console.log("Your init global tx signature: ", getSolscanLink(txHash));
  });

  it(`Dog created - ${dogName}`, async () => {
    console.log("\nAccount relationships:");
    console.log("Dog owner:", keypair.publicKey.toBase58());
    console.log("Dog PDA:", dog.toBase58());
    console.log("Dog Mint:", dogMint.toBase58());
    console.log("Mint Auth:", mintAuth.toBase58());

    const metadata = {
      name: "Maximilian I",
      symbol: "MAXIMILIAN",
      uri: "https://emerald-electronic-anteater-138.mypinata.cloud/ipfs/bafkreiah2drooi7fmarvpvy46n4ngqcisrltvinppo76v5cbopsy3ggh4i",
    };
    const txHash = await program.methods
      .createDog(
        dogName.toString(),
        metadata.name,
        metadata.symbol,
        metadata.uri
      )
      .accountsPartial({
        dog,
        owner: keypair.publicKey,
        dogMint,
        mintAuth,
        house,
        global,
        tokenProgram: TOKEN_PROGRAM_ID,
        associatedTokenProgram: ASSOCIATED_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
      })
      .rpc()
      .then(confirm)
      .then(log);
    console.log("Your create dog tx signature: ", getSolscanLink(txHash));
    const dogAccount = await program.account.dog.fetch(dog);

    // expect that dogAccount.pets is equal to 0
    expect(dogAccount.pets.toNumber()).to.equal(0);

    // add a delay between actions
    await new Promise((resolve) => setTimeout(resolve, 1000));
  });

  it("Performs all interactions with the dog", async () => {
    // Pet the dog
    await interactWithDog("pet", dog, user, dogMint, mintAuth, userTokenAta);
    let dogAccount = await program.account.dog.fetch(dog);
    expect(dogAccount.pets.toNumber()).to.equal(1);

    // Bonk the dog
    await interactWithDog("bonk", dog, user, dogMint, mintAuth, userTokenAta);
    dogAccount = await program.account.dog.fetch(dog);
    expect(dogAccount.bonks.toNumber()).to.equal(1);

    // Wif the dog
    await interactWithDog("wif", dog, user, dogMint, mintAuth, userTokenAta);
    dogAccount = await program.account.dog.fetch(dog);
    expect(dogAccount.wifs.toNumber()).to.equal(1);

    // Give pnut to dog
    await interactWithDog("pnut", dog, user, dogMint, mintAuth, userTokenAta);
    dogAccount = await program.account.dog.fetch(dog);
    expect(dogAccount.pnuts.toNumber()).to.equal(1);

    // Final state check
    console.log(`${dogName}'s pets:`, dogAccount.pets.toString());
    console.log(`${dogName}'s bonks:`, dogAccount.bonks.toString());
    console.log(`${dogName}'s wifs:`, dogAccount.wifs.toString());
    console.log(`${dogName}'s pnuts:`, dogAccount.pnuts.toString());
  });
});
