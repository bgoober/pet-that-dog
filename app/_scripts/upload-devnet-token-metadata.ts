import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import { irysUploader } from "@metaplex-foundation/umi-uploader-irys";
import { createSignerFromKeypair, signerIdentity, createGenericFile } from "@metaplex-foundation/umi";
import { readFile } from 'fs/promises';
import { join } from 'path';
import wallet from "/home/agent/.config/solana/id.json";

async function uploadTokenMetadata() {
    // Create UMI instance
    const umi = createUmi('https://api.devnet.solana.com');
    const keypair = umi.eddsa.createKeypairFromSecretKey(new Uint8Array(wallet));
    const signer = createSignerFromKeypair(umi, keypair);

    // Setup uploader
    umi.use(irysUploader());
    umi.use(signerIdentity(signer));

    try {
        // Upload image first
        const imagePath = join(__dirname, 'test-assets', 'pie.png');
        const imageBuffer = await readFile(imagePath);
        const imageFile = createGenericFile(
            imageBuffer,
            'image.png',
            {
                contentType: 'image/png',
                tags: [
                    { name: 'Content-Type', value: 'image/png' },
                    { name: 'Title', value: 'Pie' }
                ]
            }
        );

        const [imageUri] = await umi.uploader.upload([imageFile]);
        const irysImageUrl = imageUri.replace('https://arweave.net/', 'https://devnet.irys.xyz/');
        console.log('Token image uploaded to:', irysImageUrl);

        // Create and upload metadata JSON
        const metadata = {
            name: "Pie",
            symbol: "PIE",
            description: "Some pie.",
            image: irysImageUrl
        };

        const metadataFile = createGenericFile(
            Buffer.from(JSON.stringify(metadata, null, 2)),
            'metadata.json',
            {
                contentType: 'application/json',
                tags: [
                    { name: 'Content-Type', value: 'application/json' },
                    { name: 'Title', value: 'Pie Metadata' }
                ]
            }
        );

        const [metadataUri] = await umi.uploader.upload([metadataFile]);
        const irysMetadataUrl = metadataUri.replace('https://arweave.net/', 'https://devnet.irys.xyz/');
        console.log('\nMetadata JSON uploaded to:', irysMetadataUrl);

        // Output the format needed for the program
        console.log('\nUse this in your program:');
        console.log({
            name: "Pie",
            symbol: "PIE",
            uri: irysMetadataUrl  // This is the URL to the JSON file
        });

    } catch (error) {
        console.log("Oops.. Something went wrong", error);
        throw error;
    }
}

uploadTokenMetadata();