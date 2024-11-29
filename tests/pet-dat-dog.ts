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
import { expect } from "chai";

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
  let userPetsAta: anchor.web3.PublicKey;
  let userBonkAta: anchor.web3.PublicKey;
  let devuserBonkAta: anchor.web3.PublicKey;

  const DEVNETWALLET = new PublicKey(
    "J4JHaaMFpo8oPKB5DoHh7YZxXLdzkqvkLnMUQiSD3NrF"
  );

  let petsMint = PublicKey.findProgramAddressSync(
    [Buffer.from("pets")],
    program.programId
  )[0];
  console.log("PETS Mint: ", petsMint.toBase58());

  let mintAuth = PublicKey.findProgramAddressSync(
    [Buffer.from("auth")],
    program.programId
  )[0];
  console.log("PETS Mint Auth: ", mintAuth.toBase58());

  const dogName = ["Max"];
  const [dog] = web3.PublicKey.findProgramAddressSync(
    [
      Buffer.from("dog"),
      Buffer.from(dogName.toString()),
      keypair.publicKey.toBuffer(),
    ],
    program.programId
  );
  console.log("Dog account: ", dog.toBase58());

  let user = PublicKey.findProgramAddressSync(
    [keypair.publicKey.toBuffer()],
    program.programId
  )[0];

  const [global] = web3.PublicKey.findProgramAddressSync(
    [Buffer.from("global")],
    program.programId
  );
  console.log("Global account: ", global.toBase58());

  const metadata = {
    name: "pe",
    symbol: "DOGGOS",
    uri: "https://emerald-electronic-anteater-138.mypinata.cloud/ipfs/Qma41jzcPhZ2UspoBrHzKfEX7Ve7fbMV958sQQD3PgvBXW",
  };

  let dogAuth: PublicKey;
  let dogBonkAta: PublicKey;
  let dogPnutAta: PublicKey;
  let dogWifAta: PublicKey;

  let pnutMint: anchor.web3.PublicKey;
  let wifMint: anchor.web3.PublicKey;
  let userPnutAta: anchor.web3.PublicKey;
  let userWifAta: anchor.web3.PublicKey;

  let devuserPnutAta: anchor.web3.PublicKey;
  let devuserWifAta: anchor.web3.PublicKey;

  // Helper function for transaction signatures only
  const getSolscanLink = (signature: string) => {
    return `https://solscan.io/tx/${signature}?cluster=custom&customUrl=http://localhost:8899`;
  };

  it("Setup token environment", async () => {
    bonkMint = await createMint(
      provider.connection,
      keypair,
      provider.publicKey,
      null,
      5
    );
    if (!bonkMint) throw new Error("Failed to create bonkMint");
    console.log("Bonk Mint account: ", bonkMint.toBase58());

    const userBonkAtaResult = await getOrCreateAssociatedTokenAccount(
      provider.connection,
      keypair,
      bonkMint,
      keypair.publicKey
    );
    userBonkAta = userBonkAtaResult.address;
    await mintTo(
      provider.connection,
      keypair,
      bonkMint,
      userBonkAta,
      keypair,
      1_000_000_000
    );
    console.log("User BONK ATA: ", userBonkAta.toBase58());

    // Create and fund devnet wallet BONK ATA
    const devnetwalletBonkAtaResult = await getOrCreateAssociatedTokenAccount(
      provider.connection,
      keypair,
      bonkMint,
      DEVNETWALLET
    );
    devuserBonkAta = devnetwalletBonkAtaResult.address;
    await mintTo(
      provider.connection,
      keypair,
      bonkMint,
      devuserBonkAta,
      keypair,
      1_000_000_000
    );
    console.log("Devnet wallet BONK ATA:", devuserBonkAta.toBase58());

    pnutMint = await createMint(
      provider.connection,
      keypair,
      provider.publicKey,
      null,
      6
    );
    if (!pnutMint) throw new Error("Failed to create pnutMint");
    console.log("PNUT Mint account: ", pnutMint.toBase58());

    const userPnutAtaResult = await getOrCreateAssociatedTokenAccount(
      provider.connection,
      keypair,
      pnutMint,
      keypair.publicKey
    );
    userPnutAta = userPnutAtaResult.address;
    await mintTo(
      provider.connection,
      keypair,
      pnutMint,
      userPnutAta,
      keypair,
      1_000_000_000
    );
    console.log("User PNUT ATA: ", userPnutAta.toBase58());

    // Create and fund devnet wallet PNUT ATA
    const devnetwalletPnutAtaResult = await getOrCreateAssociatedTokenAccount(
      provider.connection,
      keypair,
      pnutMint,
      DEVNETWALLET
    );
    devuserPnutAta = devnetwalletPnutAtaResult.address;
    await mintTo(
      provider.connection,
      keypair,
      pnutMint,
      devuserPnutAta,
      keypair,
      1_000_000_000
    );
    console.log("Devnet wallet PNUT ATA:", devuserPnutAta.toBase58());

    wifMint = await createMint(
      provider.connection,
      keypair,
      provider.publicKey,
      null,
      6
    );
    if (!wifMint) throw new Error("Failed to create wifMint");
    console.log("WIF Mint account: ", wifMint.toBase58());

    const userWifAtaResult = await getOrCreateAssociatedTokenAccount(
      provider.connection,
      keypair,
      wifMint,
      keypair.publicKey
    );
    userWifAta = userWifAtaResult.address;
    await mintTo(
      provider.connection,
      keypair,
      wifMint,
      userWifAta,
      keypair,
      1_000_000_000
    );
    console.log("User WIF ATA: ", userWifAta.toBase58());

    // Create and fund devnet wallet WIF ATA
    const devnetwalletWifAtaResult = await getOrCreateAssociatedTokenAccount(
      provider.connection,
      keypair,
      wifMint,
      DEVNETWALLET
    );
    devuserWifAta = devnetwalletWifAtaResult.address;
    await mintTo(
      provider.connection,
      keypair,
      wifMint,
      devuserWifAta,
      keypair,
      1_000_000_000
    );
    console.log("Devnet wallet WIF ATA:", devuserWifAta.toBase58());

    userPetsAta = getAssociatedTokenAddressSync(petsMint, keypair.publicKey);
    console.log("User PETS ATA: ", userPetsAta.toBase58());
  });

  it("Global is Initialized", async () => {
    const txHash = await program.methods
      .initGlobal(metadata.name, metadata.symbol, metadata.uri)
      .accountsPartial({
        global,
        house: keypair.publicKey,
        petsMint,
        mintAuth,
        tokenProgram: TOKEN_PROGRAM_ID,
        associatedTokenProgram: ASSOCIATED_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
      })
      .rpc()
      .then(confirm)
      .then(log);
    console.log("Your init global tx signature: ", getSolscanLink(txHash));
  });

  it(`Dog created - ${dogName}`, async () => {
    console.log("test1");

    dogAuth = PublicKey.findProgramAddressSync(
      [Buffer.from("auth"), dog.toBuffer()],
      program.programId
    )[0];
    console.log("Dog Auth PDA:", dogAuth.toBase58());

    // Create all dog token accounts
    const dogBonkAtaResult = await getOrCreateAssociatedTokenAccount(
      provider.connection,
      keypair,
      bonkMint,
      dogAuth,
      true
    );
    dogBonkAta = dogBonkAtaResult.address;

    const dogPnutAtaResult = await getOrCreateAssociatedTokenAccount(
      provider.connection,
      keypair,
      pnutMint,
      dogAuth,
      true
    );
    dogPnutAta = dogPnutAtaResult.address;

    const dogWifAtaResult = await getOrCreateAssociatedTokenAccount(
      provider.connection,
      keypair,
      wifMint,
      dogAuth,
      true
    );
    dogWifAta = dogWifAtaResult.address;

    const txHash = await program.methods
      .createDog(dogName.toString())
      .accounts({
        dog,
        owner: keypair.publicKey,
        house: keypair.publicKey,
        global,
        bonkMint,
        dogBonkAta,
        pnutMint,
        dogPnutAta,
        wifMint,
        dogWifAta,
        dogAuth,
        tokenProgram: TOKEN_PROGRAM_ID,
        associatedTokenProgram: ASSOCIATED_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
      })
      .rpc()
      .then(confirm)
      .then(log);
    console.log("Your create dog tx signature: ", getSolscanLink(txHash));
    
    const dogAccount = await program.account.dog.fetch(dog);
    expect(dogAccount.pets.toNumber()).to.equal(0);
  });

  it(`Petting - ${dogName}`, async () => {
    const tx = await program.methods
      .pet()
      .accountsPartial({
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
      .rpc()
      .then(confirm)
      .then(log);
    console.log("Your pet tx signature: ", getSolscanLink(tx));

    const dogAccount = await program.account.dog.fetch(dog);

    expect(dogAccount.pets.toNumber()).to.equal(1);
  });

  it(`Bonk the dog - ${dogName}`, async () => {
    const tx = await program.methods
      .bonk()
      .accountsPartial({
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
    console.log("Dog BONK balance: ", dogBonkBalance.value.uiAmount);
  });

  it(`PNUT the dog - ${dogName}`, async () => {
    const tx = await program.methods
      .pnut()
      .accountsPartial({
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
    console.log("Dog PNUT balance: ", dogPnutBalance.value.uiAmount);
  });

  it(`WIF the dog - ${dogName}`, async () => {
    const tx = await program.methods
      .wif()
      .accountsPartial({
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
    console.log("Dog WIF balance: ", dogWifBalance.value.uiAmount);
  });

  it(`Fetches dog state - ${dogName}`, async () => {
    const dogAccount = await program.account.dog.fetch(dog);
    console.log(`${dogName}'s pets:`, dogAccount.pets.toString());
    expect(dogAccount.pets.toNumber()).to.equal(1);
  });
});
