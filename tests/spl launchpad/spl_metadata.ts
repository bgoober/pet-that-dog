// import wallet from "../../Turbin3-wallet.json"
import wallet from "/home/agent/.config/solana/id.json";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults"
import { 
    createMetadataAccountV3, 
    CreateMetadataAccountV3InstructionAccounts, 
    CreateMetadataAccountV3InstructionArgs,
    DataV2Args,
} from "@metaplex-foundation/mpl-token-metadata";
import { createSignerFromKeypair, signerIdentity, publicKey } from "@metaplex-foundation/umi";

// Define our Mint address
const mint = publicKey("6NY93SqtrcWEpNisbNh614vrCLSgoeT9hLbg9tVw9N1m")

// Create a UMI connection
const umi = createUmi('https://api.devnet.solana.com');
const keypair = umi.eddsa.createKeypairFromSecretKey(new Uint8Array(wallet));
const signer = createSignerFromKeypair(umi, keypair);
umi.use(signerIdentity(createSignerFromKeypair(umi, keypair)));

(async () => {
    try {
        // Start here
         let accounts: CreateMetadataAccountV3InstructionAccounts = {
             mint,
             mintAuthority: signer,  
         }

         let data: DataV2Args = {
            name: "QWERTY",
            symbol: "QWERTY",
            uri: "",
            sellerFeeBasisPoints: 1, // for the creator of the collection? or for the seller (not collection owner)?
            creators: null,
            collection: null,
            uses: null,
         }

         let args: CreateMetadataAccountV3InstructionArgs = {
             data: data,
             isMutable: true,
             collectionDetails: null
         }

        // tx takes 
        let tx = createMetadataAccountV3(
            umi,
            {
                ...accounts,
                ...args
            }
         )

        let result = await tx.sendAndConfirm(umi).then(r => r.signature.toString());
        console.log(result);
    } catch(e) {
        console.error(`Oops, something went wrong: ${e}`)
    }
})();