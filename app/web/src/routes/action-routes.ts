import { Connection, PublicKey, SystemProgram, Transaction } from '@solana/web3.js';
import { TOKEN_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID, getAssociatedTokenAddressSync } from '@solana/spl-token';
import * as anchor from '@coral-xyz/anchor';
import idl from '../utils/pet_dat_dog.json';

export const ACTIONS: Record<'pet' | 'bonk' | 'pnut' | 'wif', { title: string, description: string, animation: string }> = {
  pet: {
    title: "can i pet that dog?!",
    description: "my name is Maximilian I, but you can call me Max!",
    animation: "https://pet-dat-3iwenptv0-bg3xyz-projects.vercel.app/assets/3-petDog.gif"
  },
  bonk: {
    title: "LetsBONK!",
    description: "hey whatcha got there?",
    animation: "https://pet-dat-3iwenptv0-bg3xyz-projects.vercel.app/assets/BONK.gif"
  },
  pnut: {
    title: "give me a treat",
    description: "his name was Pnut",
    animation: "https://pet-dat-3iwenptv0-bg3xyz-projects.vercel.app/assets/3-petDog.gif" // TODO: Add animation URL for this action that is not the pet animation
  },
  wif: {
    title: "The hat stays on",
    description: "literally just a dog wif a hat",
    animation: "https://pet-dat-3iwenptv0-bg3xyz-projects.vercel.app/assets/3-petDog.gif" // TODO: Add animation URL for this action that is not the pet animation
  }
};

// Create the blink URLs with your Vercel deployment
const VERCEL_URL = "https://pet-dat-3iwenptv0-bg3xyz-projects.vercel.app";
export const BLINK_URLS = {
  pet: `https://blink.solana.com/?action=solana-action%3A${encodeURIComponent(VERCEL_URL + '/pet')}`,
  bonk: `https://blink.solana.com/?action=solana-action%3A${encodeURIComponent(VERCEL_URL + '/bonk')}`,
};

type ActionType = 'pet' | 'bonk' | 'pnut' | 'wif';

// Action handler that returns metadata for GET requests
export function getActionMetadata(action: ActionType) {
  return {
    type: "action",
    icon: ACTIONS[action].animation, // Use the animation GIF directly as the icon
    title: ACTIONS[action].title,
    description: ACTIONS[action].description,
    label: ACTIONS[action].title,
  };
}

// Action handler that returns transaction for POST requests
export async function handleAction(account: string, action: ActionType) {
//   const connection = new Connection("https://api.devnet.solana.com");
const connection = new Connection("http://localhost:8899");
  const userPubkey = new PublicKey(account);
  
  const provider = new anchor.AnchorProvider(
    connection,
    { publicKey: userPubkey } as any,
    { commitment: 'confirmed' }
  );
  
  const program = new anchor.Program(
    idl as any,
    provider
  );

  const house2 = new PublicKey("4QPAeQG6CTq2zMJAVCJnzY9hciQteaMkgBmcyGL7Vrwp");
  const dogName = ["Maximilian I"];
  const [dog] = PublicKey.findProgramAddressSync(
    [Buffer.from("dog"), Buffer.from(dogName.toString()), house2.toBuffer()],
    program.programId
  );

  const [dogMint] = PublicKey.findProgramAddressSync(
    [Buffer.from("mint"), dog.toBuffer()],
    program.programId
  );

  const [mintAuth] = PublicKey.findProgramAddressSync(
    [Buffer.from("auth"), dogMint.toBuffer()],
    program.programId
  );

  const userTokenAta = getAssociatedTokenAddressSync(dogMint, userPubkey);

  const ix = await program.methods[action]()
    .accountsPartial({
      dog,
      user: userPubkey,
      owner: house2,
      dogMint,
      mintAuth,
      userTokenAta,
      associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
      tokenProgram: TOKEN_PROGRAM_ID,
      systemProgram: SystemProgram.programId,
    })
    .instruction();

  const transaction = new Transaction().add(ix);
  
  return {
    transaction: transaction.serialize({
      requireAllSignatures: false,
      verifySignatures: false
    }).toString('base64'),
    message: `${ACTIONS[action].title}`
  };
} 