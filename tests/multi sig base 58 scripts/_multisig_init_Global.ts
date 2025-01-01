import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { PublicKey, SystemProgram, TransactionMessage } from "@solana/web3.js";
import { PetThatDog } from "../../target/types/pet_that_dog";
import bs58 from "bs58";

describe("multisig init's global", () => {
  // Configure the client to use the local cluster.
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);
  const connection = provider.connection;

  const program = anchor.workspace.PetThatDog as Program<PetThatDog>;

  const multisig = new PublicKey(
    "9tM775Pb7SWT12WZqGvoGKPAttPNwMkYxuq8Yex8AGTX"
  );

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
        payer: multisig,
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
