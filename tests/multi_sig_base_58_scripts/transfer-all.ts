import {
  Transaction,
  SystemProgram,
  Connection,
  Keypair,
  LAMPORTS_PER_SOL,
  sendAndConfirmTransaction,
  PublicKey,
} from "@solana/web3.js";

// import wallet from ./dev-wallet-1.json
import wallet from "/home/agent/.config/solana/id.json";

// import keypair from ./dev-wallet-1.json
const keypair = Keypair.fromSecretKey(new Uint8Array(wallet));

// define pubkey object to send to
const to = new PublicKey("Eb8p647DM1r4qAK4ApZ2a55SWdNmyxzaRy9fRucYv72X");

// devnet conenction
const connection = new Connection("https://api.mainnet-beta.solana.com");

(async () => {
  try {
    // Get balance of dev wallet
    const balance = await connection.getBalance(keypair.publicKey);

    // Create a test transaction to calculate fees
    const transaction = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: keypair.publicKey,
        toPubkey: to,
        lamports: balance,
      })
    );

    transaction.recentBlockhash = (
      await connection.getLatestBlockhash("confirmed")
    ).blockhash;
    transaction.feePayer = keypair.publicKey;

    // Calculate exact fee rate to transfer entire SOL amount out of account minus fees
    const fee =
      (
        await connection.getFeeForMessage(
          transaction.compileMessage(),
          "confirmed"
        )
      ).value || 0;

    // Remove our transfer instruction to replace it
    transaction.instructions.pop();

    // Now add the instruction back with correct amount of lamports
    transaction.add(
      SystemProgram.transfer({
        fromPubkey: keypair.publicKey,
        toPubkey: to,
        lamports: balance - fee,
      })
    );

    // Sign transaction, broadcast, and confirm
    const signature = await sendAndConfirmTransaction(connection, transaction, [
      keypair,
    ]);

    console.log(
      `Success! Check out your TX here: https://explorer.solana.com/tx/${signature}?cluster=mainnet-beta`
    );
  } catch (e) {
    console.error(`Oops, something went wrong: ${e}`);
  }
})();
