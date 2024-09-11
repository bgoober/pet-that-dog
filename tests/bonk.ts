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
  let userBonkAta: anchor.web3.PublicKey;

  let petsMint = PublicKey.findProgramAddressSync(
    [Buffer.from("pets"), keypair.publicKey.toBuffer()],
    program.programId
  )[0];
  console.log("PETS Mint: ", petsMint.toBase58());

  let mintAuth = PublicKey.findProgramAddressSync(
    [Buffer.from("auth"), keypair.publicKey.toBuffer()],
    program.programId
  )[0];
  console.log("PETS Mint Auth: ", mintAuth.toBase58());

  const dogName = ["Max"];
  const [dog] = web3.PublicKey.findProgramAddressSync(
    [Buffer.from("dog"), Buffer.from(dogName.toString())],
    program.programId
  );
  console.log("Dog account: ", dog.toBase58());

  const [dogAuth] = web3.PublicKey.findProgramAddressSync(
    [Buffer.from("auth"), dog.toBuffer()],
    program.programId
  );
  console.log("Dog Auth account: ", dogAuth.toBase58());

  let user = PublicKey.findProgramAddressSync(
    [keypair.publicKey.toBuffer()],
    program.programId
  )[0];

  it("Setup token environment", async () => {
    /// DOCS: hardcode bonk mint from main test token environment init
    bonkMint = new PublicKey('B7W6Jjc6xe9QsBoqS6vyeB9p9uY1N6EYooQx5H8NP7Z2');
    // if (!bonkMint) throw new Error("Failed to create bonkMint");
    
    console.log("Bonk Mint : ", bonkMint.toBase58());

    userBonkAta = getAssociatedTokenAddressSync(
      bonkMint,
      keypair.publicKey
    );
    // Verify userBonkAta creation
    if (!userBonkAta) throw new Error("Failed to create or get userBonkAta");
    console.log("userBonkAta : ", userBonkAta.toBase58())

    // refactor the accounts that you have init or init_if_needed to use getAssociatedTokenAddressSync, and remove the await.
    // Move the dogBonkAta calculation here and ensure it's assigned to the higher scope variable.
    dogBonkAta = getAssociatedTokenAddressSync(bonkMint, dogAuth, true);
    console.log("dogBonkAta : ", dogBonkAta.toBase58());

  });

  it(`Is bonked! - ${dogName}`, async () => {
    const tx = await program.methods
      .bonk()
      .accountsPartial({
        dog,
        user,
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

    console.log(`${dogName}'s pets: `, dogAccount.pets.toString());
    console.log(`${dogName}'s bonks:`, dogAccount.bonks.toString());
  });
});