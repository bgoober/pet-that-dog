import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import { createIrysUploader } from "@metaplex-foundation/umi-uploader-irys";
import { createSignerFromKeypair, signerIdentity } from "@metaplex-foundation/umi";
import { readFile, readdir } from 'fs/promises';
import { join } from 'path';
import wallet from "/home/agent/.config/solana/id.json";

async function getAllFiles(dirPath: string, arrayOfFiles: string[] = []) {
    const files = await readdir(dirPath, { withFileTypes: true });

    for (const file of files) {
        const fullPath = join(dirPath, file.name);
        if (file.isDirectory()) {
            await getAllFiles(fullPath, arrayOfFiles);
        } else {
            arrayOfFiles.push(fullPath);
        }
    }

    return arrayOfFiles;
}

async function getContentType(filename: string): Promise<string> {
    const ext = filename.split('.').pop()?.toLowerCase();
    const contentTypes: { [key: string]: string } = {
        'html': 'text/html',
        'js': 'application/javascript',
        'css': 'text/css',
        'png': 'image/png',
        'jpg': 'image/jpeg',
        'jpeg': 'image/jpeg',
        'gif': 'image/gif',
        'svg': 'image/svg+xml',
        'json': 'application/json',
        'ico': 'image/x-icon',
    };
    return contentTypes[ext || ''] || 'application/octet-stream';
}

async function uploadAppToArweave() {
    // Create UMI instance
    // const umi = createUmi('https://api.mainnet-beta.solana.com');
    const umi = createUmi('https://api.devnet.solana.com');
    const keypair = umi.eddsa.createKeypairFromSecretKey(new Uint8Array(wallet));

    // Setup uploader
    umi.uploader = createIrysUploader(umi);
    umi.use(signerIdentity(createSignerFromKeypair(umi, keypair)));

    try {
        // Path to your built React app
        const buildPath = './dist/web';
        
        // Get all files from build directory
        const files = await getAllFiles(buildPath);
        
        // Prepare files for upload
        const uploadFiles = await Promise.all(files.map(async (filePath) => {
            const buffer = await readFile(filePath);
            const relativePath = filePath.replace(buildPath, '');
            
            return {
                buffer,
                fileName: relativePath,
                displayName: relativePath,
                uniqueName: relativePath,
                contentType: await getContentType(filePath),
                extension: filePath.split('.').pop() || '',
                tags: [
                    { name: 'App-Name', value: 'Pet-That-Dog' },
                    { name: 'Content-Type', value: 'application/x-directory' },
                    { name: 'Title', value: 'Can I Pet That Dog?!' }
                ]
            };
        }));

        // Upload all files
        const uris = await umi.uploader.upload(uploadFiles);
        
        console.log('Deployment successful!');
        console.log('Main entry point:', uris[0]);
        console.log('All uploaded files:');
        uris.forEach((uri, index) => {
            console.log(`${files[index].replace(buildPath, '')}: ${uri}`);
        });

        // Create manifest file for better organization
        const manifest = {
            name: 'Pet Dat Dog',
            description: 'Pet Dat Dog Web Application',
            timestamp: new Date().toISOString(),
            files: uris.map((uri, index) => ({
                path: files[index].replace(buildPath, ''),
                uri
            }))
        };

        // Upload manifest
        const manifestFile = {
            buffer: Buffer.from(JSON.stringify(manifest, null, 2)),
            fileName: 'manifest.json',
            displayName: 'manifest.json',
            uniqueName: 'manifest.json',
            contentType: 'application/json',
            extension: 'json',
            tags: [
                { name: 'App-Name', value: 'Pet-Dat-Dog' },
                { name: 'Content-Type', value: 'application/json' }
            ]
        };

        const [manifestUri] = await umi.uploader.upload([manifestFile]);
        console.log('\nManifest URI:', manifestUri);
        
    } catch (error) {
        console.error('Error deploying app:', error);
        throw error;
    }
}

uploadAppToArweave();