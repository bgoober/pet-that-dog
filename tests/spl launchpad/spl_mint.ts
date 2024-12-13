// Import necessary modules from the Solana JavaScript API and the SPL Token library
import { Keypair, PublicKey, Connection, Commitment } from "@solana/web3.js";
import { getOrCreateAssociatedTokenAccount, mintTo } from '@solana/spl-token';

// import wallet from "../../Turbin3-wallet.json"
import wallet from "/home/agent/.config/solana/id.json";

// Create a keypair object from the secret key in the wallet
const keypair = Keypair.fromSecretKey(new Uint8Array(wallet));

// Create a connection to the Solana devnet
// The commitment level of "confirmed" means that the node has seen the transaction confirmed by at least 1 cluster
const commitment: Commitment = "confirmed";
const connection = new Connection("https://api.devnet.solana.com", commitment);

// Define the number of decimals for the token
const token_decimals = 1_000_000;

// Define the public key for the mint (from the spl_init.ts script)
const mint = new PublicKey("6NY93SqtrcWEpNisbNh614vrCLSgoeT9hLbg9tVw9N1m");

// Define an asynchronous function that will be immediately invoked
(async () => {
    try {
        // Create or get the associated token account (ATA) for the keypair and mint
        // The ATA is a special type of token account that is associated with a specific mint and owner
        console.log("log message")

        const ata = await getOrCreateAssociatedTokenAccount(connection, keypair, mint, keypair.publicKey);
        console.log(`Your ata is: ${ata.address.toBase58()}`);

        // Mint tokens to the ATA
        // The last argument (100n * token_decimals) is the amount of tokens to mint
        const mintTx = await mintTo(connection, keypair, mint, ata.address, keypair, 100 * token_decimals);
        console.log(`Your mint txid: ${mintTx}`);
    } catch(error) {
        // If there's an error in the try block, log it to the console
        console.log(`Oops, something went wrong: ${error}`)
    }
})()