import * as anchor from "@coral-xyz/anchor";
import { Program, web3 } from "@coral-xyz/anchor";
import { PetDatDog } from "../target/types/pet_dat_dog";
import {
  TOKEN_PROGRAM_ID,
  createMint,
  getAssociatedTokenAddress,
  getAssociatedTokenAddressSync,
  getOrCreateAssociatedTokenAccount,
  mintTo,
} from "@solana/spl-token";
import { Keypair, PublicKey, SystemProgram } from "@solana/web3.js";
import wallet from "/home/agent/.config/solana/id.json";
import { ASSOCIATED_PROGRAM_ID } from "@coral-xyz/anchor/dist/cjs/utils/token";
import { publicKey } from "@coral-xyz/anchor/dist/cjs/utils";

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
  let dogBonkAta: anchor.web3.PublicKey;
  // let dogAuth: anchor.web3.PublicKey;
  let userPetsAta: anchor.web3.PublicKey;
  let userBonkAta: anchor.web3.PublicKey;

  const dogName = ["Max"];
  const [dog] = web3.PublicKey.findProgramAddressSync(
    [Buffer.from("dog"), Buffer.from(dogName.toString())],
    program.programId
  );
  console.log("Dog account: ", dog.toBase58());

  let dogMint = PublicKey.findProgramAddressSync(
    [Buffer.from("pets"), dog.toBuffer()],
    program.programId
  )[0];
  console.log("Dog Mint account: ", dogMint.toBase58());

  // Declare dogBonkAta at a higher scope to be accessible in both test cases.

  const [auth] = web3.PublicKey.findProgramAddressSync(
    [Buffer.from("auth"), dog.toBuffer()],
    program.programId
  );
  console.log("Dog Auth account: ", auth.toBase58());

  it("Setup token environment", async () => {
    bonkMint = await createMint(
      provider.connection,
      keypair,
      provider.publicKey,
      null,
      6
    );
    if (!bonkMint) throw new Error("Failed to create bonkMint");
    console.log("Bonk Mint account: ", bonkMint.toBase58());

    const resulta = await getAssociatedTokenAddress(bonkMint, keypair.publicKey);
    console.log("user's bonkMint ATA {}", resulta)

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
    console.log("User bonkAta account: ", userBonkAta.toBase58());

    // refactor the accounts that you have init or init_if_needed to use getAssociatedTokenAddressSync, and remove the await.
    // Move the dogBonkAta calculation here and ensure it's assigned to the higher scope variable.
    dogBonkAta = getAssociatedTokenAddressSync(bonkMint, auth, true);
    console.log("dogBonkAta account: ", dogBonkAta.toBase58());

    userPetsAta = getAssociatedTokenAddressSync(dogMint, keypair.publicKey);
    console.log("User petsAta account: ", userPetsAta.toBase58());
  });

  it(`Is initialized! - ${dogName}`, async () => {
    console.log("test1");
    const txHash = await program.methods
      .createDog(dogName.toString())
      .accountsPartial({
        dog,
        owner: keypair.publicKey,
        dogAuth: auth,
        dogMint,
        bonkMint,
        dogBonkAta,
        tokenProgram: TOKEN_PROGRAM_ID,
        associatedTokenProgram: ASSOCIATED_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
      })
      .rpc()
      .then(confirm)
      .then(log);
    console.log("Your pet tx signature is: ", txHash);
    if (!txHash) throw new Error("Failed to initialize.");

  });

  it(`Is pet! - ${dogName}`, async () => {
    console.log("test");

    const tx = await program.methods
      .pet()
      .accountsPartial({
        dog,
        dogAuth: auth as web3.PublicKey,
        dogMint,
        userPetsAta: userPetsAta,
        associatedTokenProgram: ASSOCIATED_PROGRAM_ID,
        tokenProgram: TOKEN_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
      })
      .signers([keypair])
      .rpc()
      .then(confirm)
      .then(log);
    console.log("Your pet tx signature is: ", tx);
  });

  it(`Is bonked! - ${dogName}`, async () => {
    const tx = await program.methods
      .bonk()
      .accountsPartial({
        dog,
        bonkMint,
        dogBonkAta,
        userBonkAta,
        associatedTokenProgram: ASSOCIATED_PROGRAM_ID,
        tokenProgram: TOKEN_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
      })
      .signers([keypair])
      .rpc()
      .then(confirm)
      .then(log);
    console.log("Your bonk tx signature is: ", tx);
  });

  it(`Fetches dog state - ${dogName}`, async () => {
    const dogAccount = await program.account.dog.fetch(dog);

    console.log(`Dog's pets: ${dogName}`, dogAccount.pets.toString());
    console.log(`Dog's bonks: ${dogName}`, dogAccount.bonks.toString());

    // find all the accounts underneath the dog account
  });
});
