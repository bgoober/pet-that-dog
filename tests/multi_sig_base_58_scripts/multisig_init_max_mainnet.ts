import * as anchor from "@coral-xyz/anchor";
import { Program, web3 } from "@coral-xyz/anchor";
import { PetThatDog } from "../../target/types/pet_that_dog";
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";
import {
  PublicKey,
  SystemProgram,
  TransactionMessage,
} from "@solana/web3.js";
import { ASSOCIATED_PROGRAM_ID } from "@coral-xyz/anchor/dist/cjs/utils/token";
import bs58 from "bs58";

describe("pet-that-dog", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);
  const program = anchor.workspace.PetThatDog as Program<PetThatDog>;
  const connection = provider.connection;

  const log = async (signature: string): Promise<string> => {
    console.log(signature);
    return signature;
  };

  let house = new PublicKey("9tM775Pb7SWT12WZqGvoGKPAttPNwMkYxuq8Yex8AGTX");

  const dogName = ["Maximilian I"];
  const [dog] = web3.PublicKey.findProgramAddressSync(
    [Buffer.from("dog"), Buffer.from(dogName.toString()), house.toBuffer()],
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
    const metadata = {
      name: "Maximilian I",
      symbol: "MAXIMILIAN",
      uri: "https://tearvq4mogxqsylsqoa4tlkkx2kpx6lor24ntgw4wepu25g6egua.arweave.net/mQEaw4xxrwlhcoOBya1KvpT7-W6OuNma3LEfTXTeIag", // the arweave link that stores the token metadata JSON
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
