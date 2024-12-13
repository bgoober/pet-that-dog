// Import necessary modules from the Solana JavaScript API and the SPL Token library
import { Keypair, Connection, Commitment } from "@solana/web3.js";
import { createMint } from '@solana/spl-token';

// Import a JSON file that contains the secret key for a wallet
// import wallet from "../../Turbin3-wallet.json"
import wallet from "/home/agent/.config/solana/id.json";


// Import the connect function from the http2 module
import { connect } from "http2";

// Create a keypair object from the secret key in the wallet
// Keypair is a pair of a secret key and a public key
const keypair = Keypair.fromSecretKey(new Uint8Array(wallet)); 

// Create a connection to the Solana devnet
// The commitment level of "confirmed" means that the node has seen the transaction confirmed by at least 1 cluster
const commitment: Commitment = "confirmed";
const connection = new Connection("https://api.devnet.solana.com", commitment);

// Define an asynchronous function that will be immediately invoked
(async () => {
    try {
        // Create a new mint with the keypair as the mint authority
        // The mint authority is the entity that is allowed to mint new tokens
        // The last argument (6) is the number of decimal places for the token
        // freezeAuthority is null because we don't want to freeze the mint
        const mint = await createMint(connection, keypair, keypair.publicKey, null, 6);

        // Log the address of the new mint to the console
        console.log(`Your mint address is: ${mint.toBase58()}`);
    } catch(error) {
        // If there's an error in the try block, log it to the console
        console.log(`Oops, something went wrong: ${error}`)
    }
})()