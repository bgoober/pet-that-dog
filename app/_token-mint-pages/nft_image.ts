import wallet from "../../Turbin3-wallet.json";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import {
  createGenericFile,
  createSignerFromKeypair,
  signerIdentity,
} from "@metaplex-foundation/umi";
import { irysUploader } from "@metaplex-foundation/umi-uploader-irys";
import { readFile } from "fs/promises";
import { createObjectCsvWriter } from 'csv-writer'

// Create a devnet connection
const umi = createUmi("https://api.devnet.solana.com");

let keypair = umi.eddsa.createKeypairFromSecretKey(new Uint8Array(wallet));
const signer = createSignerFromKeypair(umi, keypair);

umi.use(irysUploader());
umi.use(signerIdentity(signer));

(async () => {
    try {
      const imageFiles = [];
      for (let i = 0; i < 8; i++) {
        // Load image
        const file = await readFile(`/home/agent/Ben_Sol_2Q24/ts/rugs/${i}.png`);
        // Convert image to generic file
        const image = createGenericFile(file, `${i}`, {
          contentType: "image/png",
        });
        imageFiles.push(image);
      }
  
      // Upload all images
      const uris = await umi.uploader.upload(imageFiles);
  
      // Create CSV writer
      const csvWriter = createObjectCsvWriter({
        path: '/home/agent/Ben_Sol_2Q24/ts/rugs/image_uris.csv',
        header: [
          { id: 'fileName', title: 'File Name' },
          { id: 'uri', title: 'URI' }
        ]
      });
  
      // Prepare data for CSV
      const records = uris.map((uri, index) => ({
        fileName: `${index}.png`,
        uri: uri
      }));
  
      // Write to CSV
      await csvWriter.writeRecords(records);
      console.log("CSV file created successfully with image URIs.");
    } catch (error) {
      console.log("Oops.. Something went wrong", error);
    }
  })();
