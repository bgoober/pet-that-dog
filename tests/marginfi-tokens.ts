import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { PetDatDog } from "../target/types/pet_dat_dog";
import { PublicKey, Keypair, Connection } from "@solana/web3.js";
import { getOrCreateAssociatedTokenAccount, createMint, mintTo } from "@solana/spl-token";
import { MarginfiClient } from "@mrgnlabs/marginfi-client-v2";

describe("marginfi-tokens", () => {
  // Configure for devnet
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);
  const program = anchor.workspace.PetDatDog as Program<PetDatDog>;
  
  // Token mints on devnet
  const PNUT_MINT = new PublicKey("2qEHjDLDLbuBgRYvsxhc5D6uDWAivNFZGan56P1tpump");
  const WIF_MINT = new PublicKey("EKpQGSJtjMFqKZ9KQanSqYXRcF8fBopzLHYxdM65zcjm");
  const BONK_MINT = new PublicKey("DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263");

  // MarginFi constants
  const MARGINFI_GROUP = new PublicKey("4qp6Fx6tnZkY5Wropq9wUYgtFxXKwE6viZxFHg3rdAG8");
  
  let marginfiClient: MarginfiClient;
  let marginfiAccount: any; // Will store the user's MarginFi account
  let userBonkAta: any;
  let userPnutAta: any;
  let userWifAta: any;
  let dogPda: PublicKey;

  before(async () => {
    // Initialize MarginFi client
    marginfiClient = await MarginfiClient.fetch(
      provider.connection,
      "devnet",
      program.programId,
      MARGINFI_GROUP
    );

    // Create MarginFi account if needed
    marginfiAccount = await marginfiClient.createMarginfiAccount();
    console.log("MarginFi Account:", marginfiAccount.publicKey.toBase58());

    // Setup test dog
    const [dogPdaAddress] = PublicKey.findProgramAddressSync(
      [
        Buffer.from("dog"),
        Buffer.from("TestDog"),
        provider.wallet.publicKey.toBuffer(),
      ],
      program.programId
    );
    dogPda = dogPdaAddress;

    // Create dog if it doesn't exist
    try {
      await program.methods
        .createDog("TestDog")
        .accounts({
          owner: provider.wallet.publicKey,
          dog: dogPda,
          house: provider.wallet.publicKey, // Using wallet as house for testing
          // Add other required accounts
        })
        .rpc();
      console.log("Created test dog");
    } catch (e) {
      console.log("Dog might already exist:", e);
    }

    // Get or create token ATAs
    userBonkAta = await getOrCreateAssociatedTokenAccount(
      provider.connection,
      provider.wallet,
      BONK_MINT,
      provider.wallet.publicKey
    );

    userPnutAta = await getOrCreateAssociatedTokenAccount(
      provider.connection,
      provider.wallet,
      PNUT_MINT,
      provider.wallet.publicKey
    );

    userWifAta = await getOrCreateAssociatedTokenAccount(
      provider.connection,
      provider.wallet,
      WIF_MINT,
      provider.wallet.publicKey
    );
  });

  it("Can deposit BONK to MarginFi", async () => {
    try {
      await program.methods
        .bonk()
        .accounts({
          signer: provider.wallet.publicKey,
          dog: dogPda,
          bonkMint: BONK_MINT,
          userBonkAta: userBonkAta.address,
          marginfiProgram: marginfiClient.program.programId,
          marginfiGroup: MARGINFI_GROUP,
          marginfiAccount: marginfiAccount.publicKey,
          // Add other required accounts
        })
        .rpc();

      // Verify deposit
      const balance = await marginfiAccount.getBalance(BONK_MINT);
      console.log("MarginFi BONK balance:", balance.toString());
    } catch (e) {
      console.error("BONK deposit failed:", e);
      throw e;
    }
  });

  it("Can deposit PNUT to MarginFi", async () => {
    try {
      await program.methods
        .pnut()
        .accounts({
          signer: provider.wallet.publicKey,
          dog: dogPda,
          pnutMint: PNUT_MINT,
          userPnutAta: userPnutAta.address,
          marginfiProgram: marginfiClient.program.programId,
          marginfiGroup: MARGINFI_GROUP,
          marginfiAccount: marginfiAccount.publicKey,
          // Add other required accounts
        })
        .rpc();

      // Verify deposit
      const balance = await marginfiAccount.getBalance(PNUT_MINT);
      console.log("MarginFi PNUT balance:", balance.toString());
    } catch (e) {
      console.error("PNUT deposit failed:", e);
      throw e;
    }
  });

  it("Can deposit WIF to MarginFi", async () => {
    try {
      await program.methods
        .wif()
        .accounts({
          signer: provider.wallet.publicKey,
          dog: dogPda,
          wifMint: WIF_MINT,
          userWifAta: userWifAta.address,
          marginfiProgram: marginfiClient.program.programId,
          marginfiGroup: MARGINFI_GROUP,
          marginfiAccount: marginfiAccount.publicKey,
          // Add other required accounts
        })
        .rpc();

      // Verify deposit
      const balance = await marginfiAccount.getBalance(WIF_MINT);
      console.log("MarginFi WIF balance:", balance.toString());
    } catch (e) {
      console.error("WIF deposit failed:", e);
      throw e;
    }
  });
}); 