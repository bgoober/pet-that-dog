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
import { Keypair, PublicKey, SystemProgram, LAMPORTS_PER_SOL } from "@solana/web3.js";
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
  let pnutMint: PublicKey;
  let wifMint: PublicKey;
  let userPnutAta: PublicKey;
  let userWifAta: PublicKey;
  let devuserPnutAta: PublicKey;
  let devuserWifAta: PublicKey;

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
    name: "pet dat dog",
    symbol: "PETS",
    uri: "https://emerald-electronic-anteater-138.mypinata.cloud/ipfs/Qma41jzcPhZ2UspoBrHzKfEX7Ve7fbMV958sQQD3PgvBXW",
  };

  const player2 = Keypair.generate();
  let player2BonkAta: PublicKey;
  let player2PnutAta: PublicKey;
  let player2WifAta: PublicKey;
  let player2PetsAta: PublicKey;
  let player2User: PublicKey;

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
    // Verify userBonkAta creation
    if (!userBonkAta) throw new Error("Failed to create or get userBonkAta");

    await mintTo(
      provider.connection,
      keypair,
      bonkMint,
      userBonkAta,
      keypair,
      1_000_000_000
    );

    // devnet wallet bonk ata + mint to bonk ata
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
    console.log("User bonkAta account: ", userBonkAta.toBase58());

    userPetsAta = getAssociatedTokenAddressSync(petsMint, keypair.publicKey);
    console.log("User petsAta account: ", userPetsAta.toBase58());

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
    if (!userPnutAta) throw new Error("Failed to create or get userPnutAta");

    await mintTo(
      provider.connection,
      keypair,
      pnutMint,
      userPnutAta,
      keypair,
      1_000_000_000
    );
    console.log("User pnutAta account: ", userPnutAta.toBase58());

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
    console.log("Devnet wallet pnutAta account: ", devuserPnutAta.toBase58());

    // Setup WIF
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
    if (!userWifAta) throw new Error("Failed to create or get userWifAta");

    await mintTo(
      provider.connection,
      keypair,
      wifMint,
      userWifAta,
      keypair,
      1_000_000_000
    );
    console.log("User wifAta account: ", userWifAta.toBase58());

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
    console.log("Devnet wallet wifAta account: ", devuserWifAta.toBase58());
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
    console.log("Your init global tx signature is: ", txHash);
  });

  it("Setup player 2", async () => {
    // Airdrop SOL
    const airdropSig = await provider.connection.requestAirdrop(
      player2.publicKey,
      2 * LAMPORTS_PER_SOL
    );
    await provider.connection.confirmTransaction(airdropSig);
    
    // Create ATAs for player2
    const player2BonkAtaResult = await getOrCreateAssociatedTokenAccount(
      provider.connection,
      keypair, // Payer is still original keypair
      bonkMint,
      player2.publicKey
    );
    player2BonkAta = player2BonkAtaResult.address;

    // Mint BONK to player2
    await mintTo(
      provider.connection,
      keypair,
      bonkMint,
      player2BonkAta,
      keypair,
      1_000_000_000
    );
    console.log("Player 2 BONK ATA:", player2BonkAta.toBase58());

    const player2PnutAtaResult = await getOrCreateAssociatedTokenAccount(
      provider.connection,
      keypair,
      pnutMint,
      player2.publicKey
    );
    player2PnutAta = player2PnutAtaResult.address;

    await mintTo(
      provider.connection,
      keypair,
      pnutMint,
      player2PnutAta,
      keypair,
      1_000_000_000
    );
    console.log("Player 2 PNUT ATA:", player2PnutAta.toBase58());

    const player2WifAtaResult = await getOrCreateAssociatedTokenAccount(
      provider.connection,
      keypair,
      wifMint,
      player2.publicKey
    );
    player2WifAta = player2WifAtaResult.address;

    await mintTo(
      provider.connection,
      keypair,
      wifMint,
      player2WifAta,
      keypair,
      1_000_000_000
    );
    console.log("Player 2 WIF ATA:", player2WifAta.toBase58());

    // Create PETS ATA for player2
    const player2PetsAtaResult = await getOrCreateAssociatedTokenAccount(
      provider.connection,
      keypair,
      petsMint,
      player2.publicKey
    );
    player2PetsAta = player2PetsAtaResult.address;
    console.log("Player 2 PETS ATA:", player2PetsAta.toBase58());

    player2User = PublicKey.findProgramAddressSync(
      [player2.publicKey.toBuffer()],
      program.programId
    )[0];
    console.log("Player 2 User PDA:", player2User.toBase58());

    console.log("Player 2 setup complete");
    console.log("Player 2 public key:", player2.publicKey.toBase58());
  });

  it(`Dog created - ${dogName}`, async () => {
    console.log("test1");
    const txHash = await program.methods
      .createDog(dogName.toString())
      .accountsPartial({
        dog,
        owner: keypair.publicKey,
        house: keypair.publicKey,
        global,
        bonkMint,
        pnutMint,
        wifMint,
        ownerBonkAta: userBonkAta,
        ownerPnutAta: userPnutAta,
        ownerWifAta: userWifAta,
        tokenProgram: TOKEN_PROGRAM_ID,
        associatedTokenProgram: ASSOCIATED_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
      })
      .rpc()
      .then(confirm)
      .then(log);
    console.log("Your create dog tx signature is: ", txHash);
    const dogAccount = await program.account.dog.fetch(dog);

    // expect that dogAccount.pets is equal to 0
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
    console.log("Your pet tx signature is: ", tx);

    const dogAccount = await program.account.dog.fetch(dog);
    console.log("Max's pets count: ", dogAccount.pets.toNumber());


    // expect that dogAccount.pets is equal to 1
    expect(dogAccount.pets.toNumber()).to.equal(1);
  });

  it(`Fetches dog state - ${dogName}`, async () => {
    const dogAccount = await program.account.dog.fetch(dog);

    console.log(`Dog's pets: ${dogName}`, dogAccount.pets.toString());
    // console.log(`Dog's bonks: ${dogName}`, dogAccount.bonks.toString());

    // expect that dogAccount.pets is equal to 1
    expect(dogAccount.pets.toNumber()).to.equal(1);
  });

  it(`Player 2 pets dog - ${dogName}`, async () => {
    const tx = await program.methods
      .pet()
      .accountsPartial({
        signer: player2.publicKey,
        house: keypair.publicKey,
        dog,
        user: player2User,
        owner: keypair.publicKey,
        petsMint,
        mintAuth,
        userPetsAta: player2PetsAta,
        associatedTokenProgram: ASSOCIATED_PROGRAM_ID,
        tokenProgram: TOKEN_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
      })
      .signers([player2])
      .rpc()
      .then(confirm)
      .then(log);
    console.log("Player 2's pet tx signature: ", tx);

    const dogAccount = await program.account.dog.fetch(dog);
    console.log("Max's pets count: ", dogAccount.pets.toNumber());
    expect(dogAccount.pets.toNumber()).to.equal(2);
  });

  it(`Player 2 bonks dog - ${dogName}`, async () => {
    const tx = await program.methods
      .bonk()
      .accountsPartial({
        signer: player2.publicKey,
        dog,
        bonkMint,
        userBonkAta: player2BonkAta,
        ownerBonkAta: userBonkAta,
        associatedTokenProgram: ASSOCIATED_PROGRAM_ID,
        tokenProgram: TOKEN_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
      })
      .signers([player2])
      .rpc()
      .then(confirm)
      .then(log);
    console.log("Player 2's bonk tx signature: ", tx);

    // Verify token transfer
    const ownerBonkBalance = await provider.connection.getTokenAccountBalance(userBonkAta);
    console.log("Owner BONK balance: ", ownerBonkBalance.value.uiAmount);
    
  });

  it(`Player 2 give the dog a pnut- ${dogName}`, async () => {
    const tx = await program.methods
      .pnut()
      .accountsPartial({
        signer: player2.publicKey,
        dog,
        pnutMint,
        userPnutAta: player2PnutAta,
        ownerPnutAta: userPnutAta,
        associatedTokenProgram: ASSOCIATED_PROGRAM_ID,
        tokenProgram: TOKEN_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
      })
      .signers([player2])
      .rpc()
      .then(confirm)
      .then(log);
    console.log("Player 2's pnut tx signature: ", tx);

    // Verify token transfer
    const ownerPnutBalance = await provider.connection.getTokenAccountBalance(userPnutAta);
    console.log("Owner PNUT balance: ", ownerPnutBalance.value.uiAmount);
  });

  it(`Player 2 puts the hat on the dog - ${dogName}`, async () => {
    const tx = await program.methods
      .wif()
      .accountsPartial({
        signer: player2.publicKey,
        dog,
        wifMint,
        userWifAta: player2WifAta,
        ownerWifAta: userWifAta,
        associatedTokenProgram: ASSOCIATED_PROGRAM_ID,
        tokenProgram: TOKEN_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
      })
      .signers([player2])
      .rpc()
      .then(confirm)
      .then(log);
    console.log("Player 2's wif tx signature: ", tx);

    // Verify token transfer
    const ownerWifBalance = await provider.connection.getTokenAccountBalance(userWifAta);
    console.log("Owner WIF balance: ", ownerWifBalance.value.uiAmount);
  });
});
