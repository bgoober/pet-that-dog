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

  // Helper function for transaction signatures only
  const getSolscanLink = (signature: string) => {
    return `https://solscan.io/tx/${signature}?cluster=custom&customUrl=http://localhost:8899`;
  };

  const log = async (signature: string): Promise<string> => {
    console.log(signature);
    return signature;
  };

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

  it(`Is bonked! - ${dogName}`, async () => {
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
      .signers([keypair])
      .rpc()
      .then(confirm)
      .then(log);
    // console.log("Your bonk tx signature is: ", tx);
    console.log("Your bonk tx signature link is: ", getSolscanLink(tx));
  });

  it(`Fetches dog state - ${dogName}`, async () => {
    const dogAccount = await program.account.dog.fetch(dog);

    console.log(`${dogName}'s pets: `, dogAccount.pets.toString());
    // console.log(`${dogName}'s bonks:`, dogAccount.bonks.toString());
  });
});
