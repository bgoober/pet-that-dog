import * as anchor from "@coral-xyz/anchor";
import { Program, web3 } from "@coral-xyz/anchor";
import { PetThatDog } from "../target/types/pet_that_dog";
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";
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

  const log = async (signature: string): Promise<string> => {
    console.log(signature);
    return signature;
  };

  const ADMIN = new PublicKey("4QPAeQG6CTq2zMJAVCJnzY9hciQteaMkgBmcyGL7Vrwp");

  const HOUSE = new PublicKey("9tM775Pb7SWT12WZqGvoGKPAttPNwMkYxuq8Yex8AGTX");

  let mint = PublicKey.findProgramAddressSync(
    [Buffer.from("mint")],
    program.programId
  )[0];
  console.log("MINT: ", mint.toBase58());

  let mintAuth = PublicKey.findProgramAddressSync(
    [Buffer.from("auth")],
    program.programId
  )[0];
  console.log("MINT Auth: ", mintAuth.toBase58());

  const dogName = ["Maximilian I"];
  const [dog] = web3.PublicKey.findProgramAddressSync(
    [
      Buffer.from("dog"),
      Buffer.from(dogName.toString()),
      keypair.publicKey.toBuffer(),
    ],
    program.programId
  );
  console.log("Dog account: ", dog.toBase58());

  const [dogAuth] = web3.PublicKey.findProgramAddressSync(
    [Buffer.from("auth"), dog.toBuffer()],
    program.programId
  );
  console.log("Dog Auth account: ", dogAuth.toBase58());

  const metadata = {
    name: "Maximilian I",
    symbol: "MILI",
    uri: "https://emerald-electronic-anteater-138.mypinata.cloud/ipfs/QmXtZSbZqd1TkPZFgtx8eTcH2LNDKwGfbVBktj26UeNsk9",
  };

  it("Global is Initialized", async () => {
    const txHash = await program.methods
      .initGlobal()
      .accountsPartial({
        house: keypair.publicKey,
        associatedTokenProgram: ASSOCIATED_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
      })
      .rpc()
      .then(confirm)
      .then(log);
    console.log("Your init global tx signature is: ", txHash);
    if (!txHash) throw new Error("Failed to initialize.");
  });

  it(`Dog created - ${dogName}`, async () => {
    let global = new PublicKey("EPEcGyW9uxqbMBkAmFcNZ37iCLFYhmAzzZviJ8jmYeSV");

    console.log("test1");
    const txHash = await program.methods
      .createDog(
        dogName.toString(),
        metadata.name,
        metadata.symbol,
        metadata.uri
      )
      .accountsPartial({
        dog,
        owner: keypair.publicKey,
        house: HOUSE,
        global,
        tokenProgram: TOKEN_PROGRAM_ID,
        associatedTokenProgram: ASSOCIATED_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
      })
      .rpc()
      .then(confirm)
      .then(log);
    console.log("Your create dog tx signature is: ", txHash);
    if (!txHash) throw new Error("Failed to initialize.");
  });
});
