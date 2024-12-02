import * as anchor from "@coral-xyz/anchor";
import { Program, web3 } from "@coral-xyz/anchor";
import { PetDatDog } from "../target/types/pet_dat_dog";
import {
  TOKEN_PROGRAM_ID,
  getAssociatedTokenAddressSync,
} from "@solana/spl-token";
import { Keypair, PublicKey, SystemProgram } from "@solana/web3.js";
import wallet from "/home/agent/.config/solana/id.json"; // Local wallet (stranger)
import wallet2 from "../wallet.json"; // Player 2 (Petey's owner)
import { ASSOCIATED_PROGRAM_ID } from "@coral-xyz/anchor/dist/cjs/utils/token";
import { expect } from "chai";

describe("pet-dat-dog", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);
  const program = anchor.workspace.PetDatDog as Program<PetDatDog>;
  const connection = provider.connection;
  const stranger = Keypair.fromSecretKey(new Uint8Array(wallet));
  const player2 = Keypair.fromSecretKey(new Uint8Array(wallet2));

  before(async () => {
    const airdropSignature = await connection.requestAirdrop(
      player2.publicKey,
      web3.LAMPORTS_PER_SOL // Amount of SOL to airdrop (1 SOL in this case)
    );
    await connection.confirmTransaction(airdropSignature);
    console.log("Airdropped 1 SOL to player2");
  });
  const confirm = async (signature: string): Promise<string> => {
    const block = await connection.getLatestBlockhash();
    await connection.confirmTransaction({ signature, ...block });
    return signature;
  };

  const log = async (signature: string): Promise<string> => {
    console.log(signature);
    return signature;
  };

  // Derive Petey's accounts
  const dogName = ["Petey"];
  const [dog] = web3.PublicKey.findProgramAddressSync(
    [
      Buffer.from("dog"),
      Buffer.from(dogName.toString()),
      player2.publicKey.toBuffer(),
    ],
    program.programId
  );
  console.log("Petey's Dog PDA:", dog.toBase58());

  let dogMint = PublicKey.findProgramAddressSync(
    [Buffer.from("mint"), dog.toBuffer()],
    program.programId
  )[0];
  console.log("Petey's Token Mint:", dogMint.toBase58());

  let mintAuth = PublicKey.findProgramAddressSync(
    [Buffer.from("auth"), dogMint.toBuffer()],
    program.programId
  )[0];
  console.log("Petey's Mint Auth:", mintAuth.toBase58());

  // Derive PDAs for both users
  let player2User = PublicKey.findProgramAddressSync(
    [player2.publicKey.toBuffer()],
    program.programId
  )[0];

  let strangerUser = PublicKey.findProgramAddressSync(
    [stranger.publicKey.toBuffer()],
    program.programId
  )[0];

  // Get token accounts for both users
  let player2TokenAta = getAssociatedTokenAddressSync(
    dogMint,
    player2.publicKey
  );
  let strangerTokenAta = getAssociatedTokenAddressSync(
    dogMint,
    stranger.publicKey
  );

  const [global] = web3.PublicKey.findProgramAddressSync(
    [Buffer.from("global")],
    program.programId
  );

  it("Player 2 creates Petey", async () => {
    const metadata = {
      name: "Petey",
      symbol: "PETEY",
      uri: "https://emerald-electronic-anteater-138.mypinata.cloud/ipfs/Qma41jzcPhZ2UspoBrHzKfEX7Ve7fbMV958sQQD3PgvBXW",
    };

    const tx = await program.methods
      .createDog(
        dogName.toString(),
        metadata.name,
        metadata.symbol,
        metadata.uri
      )
      .accountsPartial({
        dog,
        owner: player2.publicKey,
        dogMint,
        mintAuth,
        house: stranger.publicKey,
        global,
        tokenProgram: TOKEN_PROGRAM_ID,
        associatedTokenProgram: ASSOCIATED_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
      })
      .signers([player2])
      .rpc()
      .then(confirm)
      .then(log);
    console.log("Petey creation tx:", tx);
  });

  it("Player 2 (owner) pets Petey", async () => {
    const tx = await program.methods
      .pet()
      .accountsPartial({
        signer: player2.publicKey,
        dog,
        user: player2User,
        owner: player2.publicKey,
        dogMint,
        mintAuth,
        userTokenAta: player2TokenAta,
        tokenProgram: TOKEN_PROGRAM_ID,
        associatedTokenProgram: ASSOCIATED_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
      })
      .signers([player2])
      .rpc()
      .then(confirm)
      .then(log);
    console.log("Owner petting tx:", tx);
  });

  it("Stranger pets Petey", async () => {
    const tx = await program.methods
      .pet()
      .accountsPartial({
        signer: stranger.publicKey,
        dog,
        user: strangerUser,
        owner: player2.publicKey,
        dogMint,
        mintAuth,
        userTokenAta: strangerTokenAta,
        tokenProgram: TOKEN_PROGRAM_ID,
        associatedTokenProgram: ASSOCIATED_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
      })
      .signers([stranger])
      .rpc()
      .then(confirm)
      .then(log); 
    console.log("Stranger petting tx:", tx);

    await new Promise(resolve => setTimeout(resolve, 1000));
  });

  // stranger bonks, wifs, and pnuts Petey
  it("Stranger bonks Petey", async () => {
    const tx = await program.methods.bonk().accountsPartial({
      dog,
      user: strangerUser,
      owner: player2.publicKey,
      dogMint,
      mintAuth,
      userTokenAta: strangerTokenAta,
    }).signers([stranger]).rpc().then(confirm).then(log);

    await new Promise(resolve => setTimeout(resolve, 1000));
  });

  it("Stranger wifs Petey", async () => {
    const tx = await program.methods.wif().accountsPartial({
      dog,
      user: strangerUser,
      owner: player2.publicKey,
      dogMint,
      mintAuth,
      userTokenAta: strangerTokenAta,
    }).signers([stranger]).rpc().then(confirm).then(log);

    await new Promise(resolve => setTimeout(resolve, 1000));
  });

  it("Stranger pnuts Petey", async () => {
    const tx = await program.methods.pnut().accountsPartial({
      dog,
      user: strangerUser,
      owner: player2.publicKey,
      dogMint,
      mintAuth,
      userTokenAta: strangerTokenAta,
    }).signers([stranger]).rpc().then(confirm).then(log); 

    await new Promise(resolve => setTimeout(resolve, 1000));
  });

  it("Verify Petey's state", async () => {
    const dogAccount = await program.account.dog.fetch(dog);
    console.log("Petey's pets:", dogAccount.pets.toString());

    // Check token balances
    const player2Balance = await provider.connection.getTokenAccountBalance(
      player2TokenAta
    );
    const strangerBalance = await provider.connection.getTokenAccountBalance(
      strangerTokenAta
    );
    console.log("Owner's PETEY balance:", player2Balance.value.uiAmount);
    console.log("Stranger's PETEY balance:", strangerBalance.value.uiAmount);

  });
});
