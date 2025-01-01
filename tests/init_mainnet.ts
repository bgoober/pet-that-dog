import * as anchor from "@coral-xyz/anchor";
import { Program, web3 } from "@coral-xyz/anchor";
import { PetThatDog } from "../target/types/pet_that_dog";
import { Keypair, PublicKey, SystemProgram } from "@solana/web3.js";
import wallet from "/home/agent/.config/solana/id.json";

describe("pet-that-dog", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);
  const program = anchor.workspace.PetThatDog as Program<PetThatDog>;
  const connection = provider.connection;
  const keypair = Keypair.fromSecretKey(new Uint8Array(wallet));

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

  // Helper function for transaction signatures only
  const getSolscanLink = (signature: string) => {
    return `https://solscan.io/tx/${signature}`;
  };

  let house = new PublicKey("9tM775Pb7SWT12WZqGvoGKPAttPNwMkYxuq8Yex8AGTX");

  const [global] = web3.PublicKey.findProgramAddressSync(
    [Buffer.from("global")],
    program.programId
  );
  console.log("Global account: ", global.toBase58());

  it("Global is Initialized", async () => {
    const txHash = await program.methods
      .initGlobal()
      .accountsPartial({
        global,
        house,
        payer: keypair.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .rpc()
      .then(confirm)
      .then(log);
    console.log("Your init global tx signature: ", getSolscanLink(txHash));
  });
});
