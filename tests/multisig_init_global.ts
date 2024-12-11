import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { PublicKey, SystemProgram, TransactionMessage } from "@solana/web3.js";
import { PetDatDog } from "../target/types/pet_dat_dog";
import bs58 from "bs58";

describe("multisig init's global", () => {
  // Configure the client to use the local cluster.
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);
  const payer = provider.wallet as anchor.Wallet;
  const connection = provider.connection;

  const program = anchor.workspace.PetDatDog as Program<PetDatDog>;

  const multisig = new PublicKey(
    "CHGqapwv8xzwtUMyoQYGjo37mm7iNyoEQy5LEgz9kGa8"
  );

  const confirm = async (signature: string): Promise<string> => {
    const block = await connection.getLatestBlockhash();
    await connection.confirmTransaction({
      signature,
      ...block,
    });
    return signature;
  };

  const log = async (signature: string, name?: string): Promise<string> => {
    console.log(
      `${name}: Your transaction signature: https://explorer.solana.com/transaction/${signature}?cluster=custom&customUrl=${connection.rpcEndpoint}`
    );
    return signature;
  };

  const [global] = PublicKey.findProgramAddressSync(
    [Buffer.from("global")],
    program.programId
  );

  it("Increment Counter", async () => {
    const ix = await program.methods
      .initGlobal()
      .accountsPartial({
        global,
        house: multisig,
        payer: payer.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .instruction();

    const block = await connection.getLatestBlockhash();

    const message = new TransactionMessage({
      // This should be the Squad vault
      payerKey: multisig,
      recentBlockhash: block.blockhash,
      instructions: [
        // Replace with your program ix
        // Use Squad vault for relevant ix fields
        ix,
      ],
    });

    const messageBase58 = bs58.encode(
      message.compileToLegacyMessage().serialize()
    );

    console.log(messageBase58);
  });
});
