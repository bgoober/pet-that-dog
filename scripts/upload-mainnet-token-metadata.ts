import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import { createIrysUploader } from "@metaplex-foundation/umi-uploader-irys";
import { createSignerFromKeypair, signerIdentity } from "@metaplex-foundation/umi";
import { readFile } from 'fs/promises';
import wallet from "/home/agent/.config/solana/id.json";

async function uploadTokenMetadata() {
    // Create UMI instance
    const umi = createUmi('https://api.mainnet-beta.solana.com');
    const keypair = umi.eddsa.createKeypairFromSecretKey(new Uint8Array(wallet));

    // Setup uploader directly
    umi.uploader = createIrysUploader(umi);
    umi.use(signerIdentity(createSignerFromKeypair(umi, keypair)));

    try {
        // Upload image first
        const imageBuffer = await readFile('./assets/token-image.png');
        const imageFile = {
            buffer: imageBuffer,
            fileName: 'image.png',
            displayName: 'image.png',
            uniqueName: 'image.png',
            contentType: 'image/png',
            extension: 'png',
            tags: []
        };
        const [imageUri] = await umi.uploader.upload([imageFile]);
        console.log('Token image uploaded to:', imageUri);

        // Create and upload metadata
        const metadata = {
            name: "Your Token Name",
            symbol: "TOKEN",
            description: "Your token description",
            image: imageUri,
            properties: {
                files: [
                    {
                        uri: imageUri,
                        type: "image/png"
                    }
                ]
            }
        };

        // Create metadata file
        const metadataFile = {
            buffer: Buffer.from(JSON.stringify(metadata)),
            fileName: 'metadata.json',
            displayName: 'metadata.json',
            uniqueName: 'metadata.json',
            contentType: 'application/json',
            extension: 'json',
            tags: []
        };

        // Upload metadata to Arweave via Irys
        const [metadataUri] = await umi.uploader.upload([metadataFile]);
        console.log('Token metadata uploaded to:', metadataUri);
        console.log('\nUse this URI in your token metadata:', metadataUri);
    } catch (error) {
        console.error('Error:', error);
        throw error;
    }
}

uploadTokenMetadata(); 