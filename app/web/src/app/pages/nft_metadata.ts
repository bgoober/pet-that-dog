import { mplCore } from '@metaplex-foundation/mpl-core'
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults"
import { createGenericFile, createSignerFromKeypair, signerIdentity } from "@metaplex-foundation/umi"
import { irysUploader } from "@metaplex-foundation/umi-uploader-irys"
import wallet from "../../Turbin3-wallet.json"

// Create a devnet connection
const umi = createUmi('https://api.devnet.solana.com');

let keypair = umi.eddsa.createKeypairFromSecretKey(new Uint8Array(wallet));
const signer = createSignerFromKeypair(umi, keypair);

umi.use(irysUploader());
umi.use(signerIdentity(signer));

(async () => {
    try {
        // Follow this JSON structure
        // https://docs.metaplex.com/programs/token-metadata/changelog/v1.0#json-structure

        const image = 'https://devnet.irys.xyz/7epkmEMRy6sy4RFxRqvCEVs8enzZJbJPM47xc4j27SSL'
        const metadata = {
            name: "ORANJ",
            symbol: "ORJ",
            description: "it's orange",
            image: "https://devnet.irys.xyz/7epkmEMRy6sy4RFxRqvCEVs8enzZJbJPM47xc4j27SSL",
            attributes: [
                {trait_type: 'Base Color', value: 'Orange'}
            ],
            properties: {
                files: [
                    {
                        type: "image/png",
                        uri: "https://devnet.irys.xyz/7epkmEMRy6sy4RFxRqvCEVs8enzZJbJPM47xc4j27SSL"
                    },
                ]
            },
            creators: [keypair.publicKey]
        };
        const myUri = await umi.uploader.uploadJson(metadata);
        console.log("Your metadata URI: ", myUri);
    }
    catch(error) {
        console.log("Oops.. Something went wrong", error);
    }
})();


//  console.log("Your image URI: ", myUri.replace("arweave.net", "devnet.irys.xyz"));