import React, { useEffect, useState, useRef } from 'react';

import * as anchor from "@coral-xyz/anchor";
import { Program, web3 } from "@coral-xyz/anchor";
import { PetDatDog } from "../utils/_";

import {
  TOKEN_PROGRAM_ID,
  createMint,
  getAssociatedTokenAddressSync,
  getOrCreateAssociatedTokenAccount,
  mintTo,
} from "@solana/spl-token";
import { Keypair, PublicKey, SystemProgram } from "@solana/web3.js";
// import wallet from "~/.config/solana/id.json";
import { ASSOCIATED_PROGRAM_ID } from "@coral-xyz/anchor/dist/cjs/utils/token";
import { token } from "@coral-xyz/anchor/dist/cjs/utils";

import { useProgram } from '../utils/useProgram';
import { useAnchorWallet, useConnection } from '@solana/wallet-adapter-react';

// Define the states
const states = {
  intro: { file: "1-sunriseIntro.gif", timeout: 20000, duration: 2600 },
  sitUp: { file: "2-sitUp.gif", timeout: 12000, duration: 2300 },
  pet: { file: "3-petDog.gif", timeout: 12000, duration: 4100 },
  layDown: { file: "4-layDown.gif", timeout: 10000, duration: 1200 },
  idle: { file: "5-idleWind.gif", timeout: 20000, duration: 1750 },
  bonk: { file: "BONK.gif", timeout: 10000, duration: 3300 },
};

// Preload GIFs
const images: { [key: string]: HTMLImageElement } = {};
Object.values(states).forEach((state) => {
  const img = new Image();
  img.src = `../assets/${state.file}`;
  images[state.file] = img;
});

const Dapp: React.FC = () => {
  const [currentState, setCurrentState] = useState<keyof typeof states>("intro");
  const [isAnimating, setIsAnimating] = useState(false);
  const [clicked, setClicked] = useState(false);
  const dogImageRef = useRef<HTMLImageElement>(null);
  const petBoxRef = useRef<HTMLDivElement>(null);
  const bonkBoxRef = useRef<HTMLDivElement>(null);
  const nextTimeoutRef = useRef<number | null>(null);

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
    if (["sitUp", "pet", "bonk"].includes(newState)) {
      if (petBoxRef.current) petBoxRef.current.style.display = "block";
      if (bonkBoxRef.current) bonkBoxRef.current.style.display = "block";
    } else {
      if (petBoxRef.current) petBoxRef.current.style.display = "none";
      if (bonkBoxRef.current) bonkBoxRef.current.style.display = "none";
    }

    setIsAnimating(true);
    setTimeout(() => {
      setIsAnimating(false);
      setClicked(false);
    }, states[newState].duration);

    // Timeout logic to change state if no clicks occur
    nextTimeoutRef.current = window.setTimeout(() => {
      if (!clicked) {
        if (newState === "intro") {
          changeState("idle");
        } else if (newState === "sitUp") {
          changeState("layDown");
        } else if (newState === "pet") {
          changeState("layDown");
        } else if (newState === "bonk") {
          changeState("layDown");
        } else if (newState === "layDown") {
          changeState("idle");
        } else if (newState === "idle") {
          changeState("idle");
        }
      }
    }, states[newState].timeout);
  };

  // Handles click events
  const handleDogImageClick = () => {
    if (isAnimating) return; // Lockout during animation
    console.log(`Image clicked during ${currentState} state`);

    if (currentState === "intro") {
      changeState("sitUp");
    } else if (currentState === "layDown") {
      changeState("sitUp");
    } else if (currentState === "idle") {
      changeState("sitUp");
    }
  };

  const handlePetBoxClick = () => {
    if (isAnimating) return; // Lockout during animation
    if (["sitUp", "pet", "bonk"].includes(currentState)) {
      console.log(`Pet box clicked during ${currentState} state`);
      setClicked(true);
      changeState("pet");
    }
  };

  const handleBonkBoxClick = () => {
    if (isAnimating) return; // Lockout during animation
    if (["sitUp", "pet", "bonk"].includes(currentState)) {
      console.log(`Bonk box clicked during ${currentState} state`);
      setClicked(true);
      changeState("bonk");
    }
  };

  useEffect(() => {
    if (dogImageRef.current) dogImageRef.current.addEventListener("click", handleDogImageClick);
    if (petBoxRef.current) petBoxRef.current.addEventListener("click", handlePetBoxClick);
    if (bonkBoxRef.current) bonkBoxRef.current.addEventListener("click", handleBonkBoxClick);

    // Call changeState function to start the state machine
    changeState(currentState);

    // Cleanup event listeners on component unmount
    return () => {
      clearExistingTimeout();
      if (dogImageRef.current) dogImageRef.current.removeEventListener("click", handleDogImageClick);
      if (petBoxRef.current) petBoxRef.current.removeEventListener("click", handlePetBoxClick);
      if (bonkBoxRef.current) bonkBoxRef.current.removeEventListener("click", handleBonkBoxClick);
    };
  }, []); // Empty dependency array to run only once on mount

  // Global click handler
  const handleBackgroundClick = () => {
    if (isAnimating) return; // Lockout during animation
    console.log(`Background clicked during ${currentState} state`);

    if (["intro", "layDown", "idle"].includes(currentState)) {
      changeState("sitUp");
    }
  };

  return (
    <div id="dog-container" onClick={handleBackgroundClick}>
      <img id="dog-image" ref={dogImageRef} alt="can i pet dat dog?!" />
      <div id="pet-box" ref={petBoxRef} className="bounding-box" onClick={(e) => { e.stopPropagation(); handlePetBoxClick(); }}></div>
      <div id="bonk-box" ref={bonkBoxRef} className="bounding-box" onClick={(e) => { e.stopPropagation(); handleBonkBoxClick(); }}></div>
    </div>
  );
};

export default Dapp;