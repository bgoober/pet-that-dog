import { TOKEN_PROGRAM_ID, createMint, getAssociatedTokenAddressSync, getOrCreateAssociatedTokenAccount, mintTo } from "@solana/spl-token";
import NodeWallet from "@coral-xyz/anchor/dist/cjs/nodewallet";
import { randomBytes } from "crypto";
import { ASSOCIATED_PROGRAM_ID } from "@coral-xyz/anchor/dist/cjs/utils/token";
import * as anchor from "@coral-xyz/anchor";
import { Program, web3 } from "@coral-xyz/anchor";
import { PetDatDog } from "../target/types/pet_dat_dog";
import { PublicKey } from '@solana/web3.js';

describe("pet-dat-dog", () => {
  // Configure the client to use the local cluster.
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.PetDatDog as Program<PetDatDog>;

  const house = new PublicKey('4QPAeQG6CTq2zMJAVCJnzY9hciQteaMkgBmcyGL7Vrwp');

  const dogName = "Max";

  let bonkMint: anchor.web3.PublicKey;
  let petsMint: anchor.web3.PublicKey;

  const user1 = anchor.web3.Keypair.generate();
  let user1_bonkAta: anchor.web3.PublicKey;
  let user1_petsAta: anchor.web3.PublicKey;

  const user2 = anchor.web3.Keypair.generate();
  let user2_bonkAta: anchor.web3.PublicKey;
  let user2_petsAta: anchor.web3.PublicKey;

  const dog = anchor.web3.PublicKey.findProgramAddressSync(
    [Buffer.from("dog"), house.toBuffer(), =],
    program.programId
  )[0];

  it("Aidrop Sol to maker and taker", async () => {
    const tx = await provider.connection.requestAirdrop(user1.publicKey, 1000000000);
    await provider.connection.confirmTransaction(tx);
    console.log("Maker balance: ", await provider.connection.getBalance(user1.publicKey));

    const tx2 = await provider.connection.requestAirdrop(user2.publicKey, 1000000000);
    await provider.connection.confirmTransaction(tx2);
    console.log("Taker balance: ", await provider.connection.getBalance(user2.publicKey));
  });

  it("Create Tokens and Mint Tokens", async () => {
    bonkMint  = await createMint(provider.connection, wallet.payer, provider.publicKey, provider.publicKey, 6);
    console.log("Mint A: ", bonkMint.toBase58());
    petsMint  = await createMint(provider.connection, wallet.payer, provider.publicKey, provider.publicKey, 6);
    console.log("Mint B: ", petsMint.toBase58());

    makerAtaA = (await getOrCreateAssociatedTokenAccount(provider.connection, wallet.payer, bonkMint, maker.publicKey)).address;
    makerAtaB = (await getOrCreateAssociatedTokenAccount(provider.connection, wallet.payer, petsMint, maker.publicKey)).address;

    takerAtaA = (await getOrCreateAssociatedTokenAccount(provider.connection, wallet.payer, bonkMint, taker.publicKey)).address;
    takerAtaB = (await getOrCreateAssociatedTokenAccount(provider.connection, wallet.payer, petsMint, taker.publicKey)).address;

    await mintTo(provider.connection, wallet.payer, bonkMint, user1_bonkAta, provider.publicKey, 1_000_000_0);
    await mintTo(provider.connection, wallet.payer, petsMint, user1_petsAta, provider.publicKey, 1_000_000_0);

    await mintTo(provider.connection, wallet.payer, bonkMint, user2_bonkAta, provider.publicKey, 1_000_000_0);
    await mintTo(provider.connection, wallet.payer, petsMint, user2_petsAta, provider.publicKey, 1_000_000_0);
  });

  it("Is initialized!", async () => {
    // Add your test here.
    const vault = getAssociatedTokenAddressSync(bonkMint, escrow, true);

    const tx = await program.methods
    .make(seed, new anchor.BN(1_000_000), new anchor.BN(1_000_000))
    .accountsPartial({
      maker: maker.publicKey,
      mintA,
      mintB,
      makerAta: makerAtaA,
      escrow,
      vault,
      associatedTokenProgram: ASSOCIATED_PROGRAM_ID,
      tokenProgram: TOKEN_PROGRAM_ID,
      systemProgram: anchor.web3.SystemProgram.programId,
    })
    .signers([maker])
    .rpc();
    console.log("Your transaction signature", tx);
  });
});
