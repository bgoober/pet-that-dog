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
import wallet2 from "../wallet.json";
import { ASSOCIATED_PROGRAM_ID } from "@coral-xyz/anchor/dist/cjs/utils/token";
import { publicKey, token } from "@coral-xyz/anchor/dist/cjs/utils";

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

  const ADMIN = new PublicKey(
    "4QPAeQG6CTq2zMJAVCJnzY9hciQteaMkgBmcyGL7Vrwp"
  );
  const BONK_MINT = new PublicKey(
    "DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263"
  );

  let dogBonkAta: anchor.web3.PublicKey;
  let userBonkAta: anchor.web3.PublicKey;

  let petsMint = PublicKey.findProgramAddressSync(
    [Buffer.from("pets")],
    program.programId
  )[0];
  console.log("PETS Mint: ", petsMint.toBase58());

  let mintAuth = PublicKey.findProgramAddressSync(
    [Buffer.from("auth")],
    program.programId
  )[0];
  console.log("PETS Mint Auth: ", mintAuth.toBase58());

  const dogName = ["Max"];
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
    name: "pet dat dog",
    symbol: "PETS",
    uri: "https://emerald-electronic-anteater-138.mypinata.cloud/ipfs/Qma41jzcPhZ2UspoBrHzKfEX7Ve7fbMV958sQQD3PgvBXW",
  };

  it("Setup token environment", async () => {

    const DEVNETWALLET = new PublicKey(
        "J4JHaaMFpo8oPKB5DoHh7YZxXLdzkqvkLnMUQiSD3NrF"
      );

    const userBonkAtaResult = await getOrCreateAssociatedTokenAccount(
      provider.connection,
      keypair,
      BONK_MINT,
      DEVNETWALLET
    );
    userBonkAta = userBonkAtaResult.address;
    // Verify userBonkAta creation
    if (!userBonkAta) throw new Error("Failed to create or get userBonkAta");

    dogBonkAta = getAssociatedTokenAddressSync(BONK_MINT, dogAuth, true);
    console.log("dogBonkAta account: ", dogBonkAta.toBase58());
  });

  it("Global is Initialized", async () => {
    const txHash = await program.methods
      .initGlobal(metadata.name, metadata.symbol, metadata.uri)
      .accountsPartial({
        house: keypair.publicKey,
        petsMint,
        mintAuth,
        tokenProgram: TOKEN_PROGRAM_ID,
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
      .createDog(dogName.toString())
      .accountsPartial({
        dog,
        owner: keypair.publicKey,
        // dogAuth,
        // bonkMint: BONK_MINT,
        // dogBonkAta,
        house: ADMIN, // defined by the local wallet now, but will need to be derived later
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
