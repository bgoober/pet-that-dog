import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import { irysUploader } from "@metaplex-foundation/umi-uploader-irys";
import { createSignerFromKeypair, signerIdentity, createGenericFile } from "@metaplex-foundation/umi";
import { readFile } from 'fs/promises';
import { join } from 'path';
import wallet from "/home/agent/.config/solana/id.json";

async function uploadTokenMetadata() {
    // Create UMI instance for mainnet
    const umi = createUmi('https://api.mainnet-beta.solana.com');
    const keypair = umi.eddsa.createKeypairFromSecretKey(new Uint8Array(wallet));
    const signer = createSignerFromKeypair(umi, keypair);

    // Setup uploader
    umi.use(irysUploader());
    umi.use(signerIdentity(signer));

    try {
        // Upload image first
        const imagePath = join(__dirname, 'assets', 'Maximilian I.png');
        const imageBuffer = await readFile(imagePath);
        const imageFile = createGenericFile(
            imageBuffer,
            'image.png',
            {
                contentType: 'image/png',
                tags: [
                    { name: 'Content-Type', value: 'image/png' },
                    { name: 'Title', value: 'Maximilian I' }
                ]
            }
        );

        const [imageUri] = await umi.uploader.upload([imageFile]);
        console.log('Token image uploaded to:', imageUri); // Will be arweave.net URL

        // Create and upload metadata JSON
        const metadata = {
            name: "Maximilian I",
            symbol: "MAXIMILIAN",
            description: "King Max the First",
            image: imageUri
        };

        const metadataFile = createGenericFile(
            Buffer.from(JSON.stringify(metadata, null, 2)),
            'metadata.json',
            {
                contentType: 'application/json',
                tags: [
                    { name: 'Content-Type', value: 'application/json' },
                    { name: 'Title', value: 'Maximilian I Metadata' }
                ]
            }
        );

        const [metadataUri] = await umi.uploader.upload([metadataFile]);
        console.log('\nMetadata JSON uploaded to:', metadataUri);

        // Output the format needed for the program
        console.log('\nUse this in your program:');
        console.log({
            name: "Maximilian I",
            symbol: "MAXIMILIAN",
            uri: metadataUri  // This is the URL to the JSON file
        });

    } catch (error) {
        console.log("Oops.. Something went wrong", error);
        throw error;
    }
}

uploadTokenMetadata();