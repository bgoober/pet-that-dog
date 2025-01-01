import * as anchor from "@coral-xyz/anchor";
import { Program, web3 } from "@coral-xyz/anchor";
import { PetThatDog } from "../target/types/pet_that_dog";
import {
  TOKEN_PROGRAM_ID,
  getAssociatedTokenAddressSync,
} from "@solana/spl-token";
import { Keypair, PublicKey, SystemProgram } from "@solana/web3.js";
import wallet from "/home/agent/.config/solana/id.json";
import { ASSOCIATED_PROGRAM_ID } from "@coral-xyz/anchor/dist/cjs/utils/token";
import { assert, expect } from "chai";

describe("pet-that-dog", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);
  const program = anchor.workspace.PetThatDog as Program<PetThatDog>;
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

  // Helper function for transaction signatures only
  const getSolscanLink = (signature: string) => {
    return `https://solscan.io/tx/${signature}?cluster=custom&customUrl=http://localhost:8899`;
  };

  let house = new PublicKey("9tM775Pb7SWT12WZqGvoGKPAttPNwMkYxuq8Yex8AGTX");

  const dogName = ["Maximilian I"];
  const [dog] = web3.PublicKey.findProgramAddressSync(
    [
      Buffer.from("dog"),
      Buffer.from(dogName.toString()),
      keypair.publicKey.toBuffer(),
    ],
    program.programId
  );
  console.log("Dog PDA:", dog.toBase58());

  let dogMint = PublicKey.findProgramAddressSync(
    [Buffer.from("mint"), dog.toBuffer()],
    program.programId
  )[0];
  console.log("Dog Mint PDA:", dogMint.toBase58());

  let mintAuth = PublicKey.findProgramAddressSync(
    [Buffer.from("auth"), dogMint.toBuffer()],
    program.programId
  )[0];
  console.log("Mint Auth PDA:", mintAuth.toBase58());

  let user = PublicKey.findProgramAddressSync(
    [keypair.publicKey.toBuffer()],
    program.programId
  )[0];

  const [global] = web3.PublicKey.findProgramAddressSync(
    [Buffer.from("global")],
    program.programId
  );
  console.log("Global account: ", global.toBase58());

  let userTokenAta = getAssociatedTokenAddressSync(dogMint, keypair.publicKey);

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
      name: "Pie",
      symbol: "PIE",
      uri: "https://devnet.irys.xyz/C343ZFsCgGWGJn84BoaGQNpeDyVkprgoFHzv6HXMdFiH",
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

  it(`Petting ${dogName}`, async () => {
    const tx = await program.methods
      .pet()
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
    console.log("Your pet tx signature: ", getSolscanLink(tx));

    const dogAccount = await program.account.dog.fetch(dog);

    // expect that dogAccount.pets is equal to 1
    expect(dogAccount.pets.toNumber()).to.equal(1);
    await new Promise((resolve) => setTimeout(resolve, 1000));
  });

  it(`Bonking ${dogName}`, async () => {
    const tx = await program.methods
      .bonk()
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
    await new Promise((resolve) => setTimeout(resolve, 1000));
  });

  it(`putting a hat on ${dogName}`, async () => {
    const tx = await program.methods
      .wif()
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
    await new Promise((resolve) => setTimeout(resolve, 1000));
  });

  it(`giving a pnut to ${dogName}`, async () => {
    const tx = await program.methods
      .pnut()
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
    await new Promise((resolve) => setTimeout(resolve, 1000));
  });

  it(`Fetches dog state - ${dogName}`, async () => {
    const dogAccount = await program.account.dog.fetch(dog);

    console.log(`${dogName}'s pets:`, dogAccount.pets.toString());
    console.log(`${dogName}'s bonks:`, dogAccount.bonks.toString());
    console.log(`${dogName}'s wifs:`, dogAccount.wifs.toString());
    console.log(`${dogName}'s pnuts:`, dogAccount.pnuts.toString());

    // expect that dogAccount.pets is equal to 1
    expect(dogAccount.pets.toNumber()).to.equal(1);

    expect(dogAccount.bonks.toNumber()).to.equal(1);

    expect(dogAccount.wifs.toNumber()).to.equal(1);

    expect(dogAccount.pnuts.toNumber()).to.equal(1);
  });

  it("Fails when trying to interact too quickly", async () => {
    try {
        // First interaction succeeds
        await program.methods.pet()
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
            .rpc();

        // Second interaction in same slot should fail
        await program.methods.bonk()
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
            .rpc();

        assert.fail("Expected error TooMuchLove");
    } catch (err: any) {
        // Log the full error to see its structure
        console.log("Error caught:", err);
        expect(err.error?.code === "TooMuchLove" || err.error?.errorCode?.code === "TooMuchLove").to.be.true;
    }
  });

  it(`Closing user account`, async () => {
    const tx = await program.methods
      .closeUser()
      .accountsPartial({
        user,
        authority: keypair.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .rpc()
      .then(confirm)
      .then(log);
    console.log("Your close user tx signature: ", getSolscanLink(tx));
  });

  it("Can kill a dog", async () => {
    const tx = await program.methods
        .killDog()
        .accountsPartial({
            owner: keypair.publicKey,
            dog,
            dogMint,
            mintAuth,
            tokenProgram: TOKEN_PROGRAM_ID,
            systemProgram: SystemProgram.programId,
        })
        .rpc()
        .then(confirm)
        .then(log);
    
    // Verify dog account is closed
    try {
        await program.account.dog.fetch(dog);
        assert.fail("Dog account should be closed");
    } catch (e) {
        expect(e).to.be.an("error");
    }
  });
});
