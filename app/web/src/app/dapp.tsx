import * as anchor from '@coral-xyz/anchor';

import idl from '../utils/pet_dat_dog.json';
import {
  TOKEN_PROGRAM_ID,
  getAssociatedTokenAddressSync,
} from '@solana/spl-token';
import { PublicKey, SystemProgram } from '@solana/web3.js';
// import wallet from "~/.config/solana/id.json";
import { ASSOCIATED_PROGRAM_ID } from '@coral-xyz/anchor/dist/cjs/utils/token';

import { useAnchorWallet, useConnection } from '@solana/wallet-adapter-react';

import React, { useEffect, useState, useRef } from 'react';

// Helper function for transaction signatures only
const getSolscanLink = (signature: string) => {
  return `https://solscan.io/tx/${signature}?cluster=custom&customUrl=http://localhost:8899`;
};

// Define the states
const states = {
  intro: { file: '1-sunriseIntro.gif', timeout: 12000, duration: 2700 },
  sitUp: { file: '2-sitUp.gif', timeout: 30000, duration: 1000 },
  pet: { file: '3-petDog.gif', timeout: 30000, duration: 2000 },
  layDown: { file: '4-layDown.gif', timeout: 10000, duration: 1200 },
  idle: { file: '5-idleWind.gif', timeout: 20000, duration: 1750 },
  bonk: { file: 'BONK.gif', timeout: 30000, duration: 2700 },
};

// Preload GIFs
const images: { [key: string]: HTMLImageElement } = {};
Object.values(states).forEach((state) => {
  const img = new Image();
  img.src = `../assets/${state.file}`;
  images[state.file] = img;
});

const Dapp: React.FC = () => {
  const [currentState, setCurrentState] =
    useState<keyof typeof states>('intro');
  const [isAnimating, setIsAnimating] = useState(false);
  const [clicked, setClicked] = useState(false);
  const dogImageRef = useRef<HTMLImageElement>(null);
  const petBoxRef = useRef<HTMLDivElement>(null);
  const bonkBoxRef = useRef<HTMLDivElement>(null);
  const nextTimeoutRef = useRef<number | null>(null);

  const wallet = useAnchorWallet();
  const { connection } = useConnection(); // Extract the connection object

  // Create Anchor provider if wallet is connected
  const provider = wallet
    ? new anchor.AnchorProvider(connection, wallet, {
        preflightCommitment: 'confirmed',
        commitment: 'confirmed',
      })
    : null;

  // Create program instance if provider is available
  const program = provider
    ? new anchor.Program(idl as anchor.Idl, provider)
    : null;

  let house = new PublicKey('4QPAeQG6CTq2zMJAVCJnzY9hciQteaMkgBmcyGL7Vrwp');

  let petsMint = PublicKey.findProgramAddressSync(
    [Buffer.from('pets')],
    program?.programId || PublicKey.default
  )[0];
  // console.log("PETS Mint: ", petsMint.toBase58());

  let mintAuth = PublicKey.findProgramAddressSync(
    [Buffer.from('auth')],
    program?.programId || PublicKey.default
  )[0];
  // console.log("PETS Mint Auth: ", mintAuth.toBase58());

  const dogName = ['Max'];
  const [dog] = PublicKey.findProgramAddressSync(
    [Buffer.from('dog'), Buffer.from(dogName.toString()), house.toBuffer()],
    program?.programId || PublicKey.default
  );
  // console.log("Dog account: ", dog.toBase58());

  const [dogAuth] = PublicKey.findProgramAddressSync(
    [Buffer.from('auth'), dog.toBuffer()],
    program?.programId || PublicKey.default
  );
  // console.log("Dog Auth account: ", dogAuth.toBase58());

  // for testnet
  // let bonkMint = new PublicKey('Az8AfogXAE3XgiqeBuJg9pjNKTPhgkBtijR7CjToT8pM');

  // for devnet and mainnet -- actual BONK mint address
  let bonkMint = new PublicKey('4GtBDByccFJbUM2iS9RHyGLKNm4UktTunZASVMTMNZvN');

  let dogBonkAta = getAssociatedTokenAddressSync(bonkMint, dogAuth, true);
  // console.log("dogBonkAta account: ", dogBonkAta.toBase58());

  let userPetsAta = wallet
    ? getAssociatedTokenAddressSync(petsMint, wallet.publicKey)
    : PublicKey.default;
  // console.log("User petsAta account: ", userPetsAta.toBase58());

  let userBonkAta = wallet
    ? getAssociatedTokenAddressSync(bonkMint, wallet.publicKey)
    : PublicKey.default;
  // console.log("User bonkAta account: ", userBonkAta.toBase58());

  // console.log('Program ID: ', program?.programId.toBase58());
  let user = wallet
    ? PublicKey.findProgramAddressSync(
        [wallet.publicKey.toBuffer()],
        program?.programId || PublicKey.default
      )[0]
    : PublicKey.default;
  // console.log('User account: ', user.toBase58());

  // console.log the rpc and network we are connected to
  // console.log('RPC URL: ', connection);

  const handlePetInstruction = async () => {
    if (!program || !wallet) return;
    try {
      const tx = await program.methods
        .pet()
        .accountsPartial({

          house,
          dog,
          user,
          owner: house,
          petsMint,
          mintAuth,
          userPetsAta,
          associatedTokenProgram: ASSOCIATED_PROGRAM_ID,
          tokenProgram: TOKEN_PROGRAM_ID,
          systemProgram: SystemProgram.programId,
        })
        .rpc()
      //   .then(confirm);
      console.log('Your pet tx signature: ', getSolscanLink(tx));
      changeState('pet');
    } catch (error) {
      console.error('Error executing instruction', error);
    }
  };

  const handleBonkInstruction = async () => {
    if (!program || !wallet) return;
    try {
      const tx = await program.methods
        .bonk()
        .accountsPartial({
          dog,
          user,
          bonkMint,
          dogBonkAta,
          userBonkAta,
          associatedTokenProgram: ASSOCIATED_PROGRAM_ID,
          tokenProgram: TOKEN_PROGRAM_ID,
          systemProgram: SystemProgram.programId,
        })
        .rpc()
      //   .then(confirm);
      console.log('Your bonk tx signature: ', getSolscanLink(tx));
      changeState('bonk');
    } catch (error) {
      console.error('Error executing instruction', error);
    }
  };

  // Clears any existing timeout
  const clearExistingTimeout = () => {
    if (nextTimeoutRef.current) {
      clearTimeout(nextTimeoutRef.current);
      nextTimeoutRef.current = null;
    }
  };

  // Change state logic
  const changeState = (newState: keyof typeof states) => {
    if (isAnimating) return;

    console.log(`Changing state to ${newState}`);
    const img = images[states[newState].file];
    if (!img.complete) {
      img.onload = () => {
        changeState(newState);
      };
      return;
    }

    clearExistingTimeout();
    setCurrentState(newState);
    if (dogImageRef.current) {
      dogImageRef.current.src = img.src;
    }
    console.log(`State changed to ${newState}`);

    // Show or hide bounding boxes based on the current state
    if (['sitUp', 'pet', 'bonk'].includes(newState)) {
      if (petBoxRef.current) petBoxRef.current.style.display = 'block';
      if (bonkBoxRef.current) bonkBoxRef.current.style.display = 'block';
    } else {
      if (petBoxRef.current) petBoxRef.current.style.display = 'none';
      if (bonkBoxRef.current) bonkBoxRef.current.style.display = 'none';
    }

    setIsAnimating(true);
    setTimeout(() => {
      setIsAnimating(false);
      setClicked(false);
    }, states[newState].duration);

    // Timeout logic to change state if no clicks occur
    nextTimeoutRef.current = window.setTimeout(() => {
      if (!clicked) {
        if (newState === 'intro') {
          changeState('idle');
        } else if (newState === 'sitUp') {
          changeState('layDown');
        } else if (newState === 'pet') {
          changeState('layDown');
        } else if (newState === 'bonk') {
          changeState('layDown');
        } else if (newState === 'layDown') {
          changeState('idle');
        } else if (newState === 'idle') {
          changeState('idle');
        }
      }
    }, states[newState].timeout);
  };

  // Handles click events
  const handleDogImageClick = () => {
    if (isAnimating) return; // Lockout during animation
    console.log(`Image clicked during ${currentState} state`);

    if (currentState === 'intro') {
      changeState('sitUp');
    } else if (currentState === 'layDown') {
      changeState('sitUp');
    } else if (currentState === 'idle') {
      changeState('sitUp');
    }
  };

  const handlePetBoxClick = async () => {
    if (isAnimating) return; // Lockout during animation
    // Call pet instruction and wait for confirmation
    await handlePetInstruction();
    if (['sitUp', 'pet', 'bonk'].includes(currentState)) {
      console.log(`Pet box clicked during ${currentState} state`);
      setClicked(true);
      changeState('pet');
    }
  };

  const handleBonkBoxClick = async () => {
    if (isAnimating) return; // Lockout during animation
    // Call bonk instruction and wait for confirmation
    // await handleBonkInstruction();
    if (['sitUp', 'pet', 'bonk'].includes(currentState)) {
      console.log(`Bonk box clicked during ${currentState} state`);
      setClicked(true);
      changeState('bonk');
    }
  };

  useEffect(() => {
    if (dogImageRef.current)
      dogImageRef.current.addEventListener('click', handleDogImageClick);
    if (petBoxRef.current)
      petBoxRef.current.addEventListener('click', handlePetBoxClick);
    if (bonkBoxRef.current)
      bonkBoxRef.current.addEventListener('click', handleBonkBoxClick);

    // Call changeState function to start the state machine
    changeState(currentState);

    // Cleanup event listeners on component unmount
    return () => {
      clearExistingTimeout();
      if (dogImageRef.current)
        dogImageRef.current.removeEventListener('click', handleDogImageClick);
      if (petBoxRef.current)
        petBoxRef.current.removeEventListener('click', handlePetBoxClick);
      if (bonkBoxRef.current)
        bonkBoxRef.current.removeEventListener('click', handleBonkBoxClick);
    };
  }, [wallet, connection]); // Ensure hooks are called consistently

  // Global click handler
  const handleBackgroundClick = () => {
    if (isAnimating) return; // Lockout during animation
    console.log(`Background clicked during ${currentState} state`);

    if (currentState === 'intro') {
      changeState('sitUp');
    } else if (currentState === 'layDown') {
      changeState('sitUp');
    } else if (currentState === 'idle') {
      changeState('sitUp');
    }
  };

  return (
    <div id="dog-container" onClick={handleBackgroundClick}>
      <img id="dog-image" ref={dogImageRef} alt="pet dat dog" />
      <div
        id="pet-box"
        ref={petBoxRef}
        className="bounding-box"
        onClick={(e) => {
          e.stopPropagation();
          handlePetBoxClick();
        }}
      ></div>
      <div
        id="bonk-box"
        ref={bonkBoxRef}
        className="bounding-box"
        onClick={(e) => {
          e.stopPropagation();
          handleBonkBoxClick();
        }}
      ></div>
    </div>
  );
};

export default Dapp;
