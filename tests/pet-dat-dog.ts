import * as anchor from "@coral-xyz/anchor";
import { Program, web3 } from "@coral-xyz/anchor";
import { PetDatDog } from "../target/types/pet_dat_dog";
import { TOKEN_PROGRAM_ID, createMint, getAssociatedTokenAddressSync, getOrCreateAssociatedTokenAccount, mintTo } from "@solana/spl-token";
import { Transaction, Ed25519Program, Keypair, PublicKey, SystemProgram, LAMPORTS_PER_SOL, SYSVAR_INSTRUCTIONS_PUBKEY, sendAndConfirmTransaction } from "@solana/web3.js";
import wallet from "/home/agent/.config/solana/id.json"

describe("pet-dat-dog", () => {
  // Configure the client to use the local cluster.
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);
  const program = anchor.workspace.PetDatDog as Program<PetDatDog>;

  const keypair = Keypair.fromSecretKey(new Uint8Array(wallet))
  const owner  = keypair.publicKey.toBase58()

  let bonkMint: anchor.web3.PublicKey;
  let dogMint: anchor.web3.PublicKey;

  const user = anchor.web3.Keypair.generate();
  let userBonkAta: anchor.web3.PublicKey;
  let userPetsAta: anchor.web3.PublicKey;

//  const user2 = anchor.web3.Keypair.generate();
  //let user2_bonkAta: anchor.web3.PublicKey;
  //let user2_petsAta: anchor.web3.PublicKey;

  let dogBonkAta: anchor.web3.PublicKey;

  it("Aidrop Sol to user", async () => {
    const tx = await provider.connection.requestAirdrop(user.publicKey, 1000000000);
    await provider.connection.confirmTransaction(tx);
    console.log("user balance: ", await provider.connection.getBalance(user.publicKey));

    //const tx2 = await provider.connection.requestAirdrop(user2.publicKey, 1000000000);
    //await provider.connection.confirmTransaction(tx2);
    //console.log("user2 balance: ", await provider.connection.getBalance(user2.publicKey));

    bonkMint  = await createMint(provider.connection, keypair, provider.publicKey, provider.publicKey, 6);
    console.log("Bonk Mint address: ", bonkMint.toBase58());

    userBonkAta = (await getOrCreateAssociatedTokenAccount(provider.connection, keypair, bonkMint, user.publicKey)).address;

    //user2_bonkAta = (await getOrCreateAssociatedTokenAccount(provider.connection, keypair, bonkMint, user2.publicKey)).address;

    await mintTo(provider.connection, keypair, bonkMint, userBonkAta, provider.publicKey, 1_000_000_0);
    console.log("user bonkAta address: ", userBonkAta.toBase58());
    //await mintTo(provider.connection, keypair, dogMint, user1_petsAta, provider.publicKey, 1_000_000_0);

    //await mintTo(provider.connection, keypair, bonkMint, user2_bonkAta, provider.publicKey, 1_000_000_0);
    //console.log("user2 bonkAta address: ", user2_bonkAta.toBase58());
    //await mintTo(provider.connection, keypair, dogMint, user2_petsAta, provider.publicKey, 1_000_000_0);
  });

  const dogNames = ["Max"];

  for (const dogName of dogNames) {
    it(`Is initialized! - ${dogName}`, async () => {
      try {
        const [dog] = web3.PublicKey.findProgramAddressSync(
          [Buffer.from("dog"), Buffer.from(dogName), keypair.publicKey.toBuffer()],
          program.programId,
        );
        dogMint  = await createMint(provider.connection, keypair, dog, provider.publicKey, 6);
        dogBonkAta = (await getOrCreateAssociatedTokenAccount(provider.connection, keypair, bonkMint, dog, true)).address; // true for allowOwnerOffCurve because the dog is a pda and it is the owner of the ATA
        
        console.log("Dog PETS Mint address: ", dogMint.toBase58());
    
        userPetsAta = (await getOrCreateAssociatedTokenAccount(provider.connection, user, dogMint, user.publicKey)).address;
    
       // user2_petsAta = (await getOrCreateAssociatedTokenAccount(provider.connection, keypair, dogMint, user2.publicKey)).address;
    
        const tx = await program.methods.createDog(dogName).accountsPartial({dog, owner, dogMint, bonkMint, dogBonkAta}).rpc();
        console.log("Your createDog tx signature is: ", tx);

      } catch (error) {
        if (error.logs && error.logs.some((log: string | string[]) => log.includes('Allocate: account Address already in use'))) {
            console.error(`Error: The dog ${dogName} is already initialized.`);
        } else {
            console.error("An unexpected error occurred:", error);
        }
      }
    });

    it(`Is pet! - ${dogName}`, async () => {
      const [dog] = web3.PublicKey.findProgramAddressSync(
        [Buffer.from("dog"), Buffer.from(dogName), keypair.publicKey.toBuffer()],
        program.programId,
      );

      const tx = await program.methods
      .pet()
      .accountsPartial({ owner,
        dog, dogMint, userPetsAta
      })
      .rpc();
      console.log("Your pet tx signature is: ", tx);
    });

    it(`Is bonked! - ${dogName}`, async () => {
      const [dog] = web3.PublicKey.findProgramAddressSync(
        [Buffer.from("dog"), Buffer.from(dogName), keypair.publicKey.toBuffer()],
        program.programId,
      );

      const tx = await program.methods
      .bonk() 
      .accountsPartial({
        dog, owner, dogBonkAta, bonkMint, userBonkAta, 
      })
      .rpc();
      console.log("Your bonk tx signature is: ", tx);
    });

    it(`Fetches dog state - ${dogName}`, async () => {
      const [dog] = web3.PublicKey.findProgramAddressSync(
        [Buffer.from("dog"), Buffer.from(dogName), keypair.publicKey.toBuffer()],
        program.programId,
      );

      const dogAccount = await program.account.dog.fetch(dog);

      console.log(`Dog's pets: ${dogName}`, dogAccount.pets.toString());
      console.log(`Dog's bonks: ${dogName}`, dogAccount.bonks.toString());

      // find all the accounts underneath the dog account
      
    });
  }
});

