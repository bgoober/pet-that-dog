import * as anchor from "@coral-xyz/anchor";
import { Program, web3 } from "@coral-xyz/anchor";
import { PetThatDog } from "../target/types/pet_that_dog";
import {
  TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import { Keypair, PublicKey, SystemProgram, TransactionMessage } from "@solana/web3.js";
import wallet from "/home/agent/.config/solana/id.json";
import { ASSOCIATED_PROGRAM_ID } from "@coral-xyz/anchor/dist/cjs/utils/token";
import bs58 from 'bs58';

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

  let house = new PublicKey("CHGqapwv8xzwtUMyoQYGjo37mm7iNyoEQy5LEgz9kGa8");

  const dogName = ["Maximilian I"];
  const [dog] = web3.PublicKey.findProgramAddressSync(
    [
      Buffer.from("dog"),
      Buffer.from(dogName.toString()),
      house.toBuffer(),
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

  const [global] = web3.PublicKey.findProgramAddressSync(
    [Buffer.from("global")],
    program.programId
  );
  console.log("Global account: ", global.toBase58());

  it(`Dog created - ${dogName}`, async () => {
    console.log("\nAccount relationships:");
    console.log("Dog owner:", house.toBase58());
    console.log("Dog PDA:", dog.toBase58());
    console.log("Dog Mint:", dogMint.toBase58());
    console.log("Mint Auth:", mintAuth.toBase58());

    const metadata = {
      name: "Maximilian I",
      symbol: "MAXIMILIAN",
      uri: "https://emerald-electronic-anteater-138.mypinata.cloud/ipfs/bafkreiah2drooi7fmarvpvy46n4ngqcisrltvinppo76v5cbopsy3ggh4i",
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
        owner: house,
        dogMint,
        mintAuth,
        house,
        global,
        tokenProgram: TOKEN_PROGRAM_ID,
        associatedTokenProgram: ASSOCIATED_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
      })
      .instruction();

    // const currentCount = await program.account.counter.fetch(
    //   counterKeypair.publicKey
    // );
    const block = await connection.getLatestBlockhash();

    const message = new TransactionMessage({
      // This should be the Squad vault
      payerKey: house,
      recentBlockhash: block.blockhash,
      instructions: [
        // Replace with your program ix
        // Use Squad vault for relevant ix fields
        txHash,
      ],
    });

    const messageBase58 = bs58.encode(
      message.compileToLegacyMessage().serialize()
    );

    console.log("base58 message: ", messageBase58);
  });
});
