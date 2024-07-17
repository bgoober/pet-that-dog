'use client';

// Importing necessary libraries and components
import { FC, useEffect, useRef, useState } from "react";
import { useAnchorWallet, useConnection } from "@solana/wallet-adapter-react";
import type { NextPage } from "next";
import { useProgram } from "../../utils/useProgram";

import Head from "next/head";

import Image from "next/image";

import { web3 } from "@coral-xyz/anchor";


// Defining the Home component
const Home: NextPage = (props) => {
  // Using hooks to get wallet and connection
  const wallet = useAnchorWallet();
  const { connection } = useConnection();
  const { program } = useProgram({ connection, wallet });

  // Defining states for different dog actions
  const states = {
    intro: { name: "intro", file: "1-sunriseIntro.gif", timeout: 20000, duration: 2600 },
    sitUp: { name: "sitUp", file: "2-sitUp.gif", timeout: 12000, duration: 2300 },
    pet: { name: "pet", file: "3-petDog.gif", timeout: 12000, duration: 4100 },
    bonk: { name: "bonk", file: "BONK.gif", timeout: 10000, duration: 3300 },
    standBy: { name: "standby", file: "standby.png", timeout: 0, duration: 0},
    layDown: { name: "layDown", file: "4-layDown.gif", timeout: 10000, duration: 1200 },
    idle: { name: "idle", file: "5-idleWind.gif", timeout: 20000, duration: 1750 },
  };

  // Using useState hook to manage state and timeoutId
  const [state, setState] = useState(states.intro);
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null);
  const [timeoutActive, setTimeOutActive] = useState<NodeJS.Timeout | null>(null);
  const refImage = useRef<any>()
  const refCoin = useRef<any>()
  const refDog = useRef<any>()


  // Using useEffect hook to set a timeout to change the state
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setState(states.sitUp);
    }, state.duration);
    setTimeoutId(timeoutId);

    // Cleanup function to clear the timeout
    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, []);

  // Using useEffect hook to listen for PetEvent and fetch leaderboard
  useEffect(() => {
    if (!program) return;

    const listener = program.addEventListener(
      "PetEvent",
      async (event, _slot, _sig) => {
        // console.log(event.address.toString());
        // console.log(event.pets.toString())
        // console.log(event.position);
      }
    );
    (async () => {
    })();
    return () => {
      program.removeEventListener(listener);
    };
  }, [program]);


  useEffect(() => {
    const getSizeImage = () => {
      if (refImage && refImage.current) {
        const container = refImage.current.parentNode;
        const widthContainer = container.offsetWidth;
        const heightContainer = container.offsetHeight;
        const imageAspectRatio = refImage.current.naturalWidth / refImage.current.naturalHeight;
        let widthImage = widthContainer;
        let heightImage = widthContainer / imageAspectRatio;

        if (heightImage > heightContainer) {
          heightImage = heightContainer;
          widthImage = heightContainer * imageAspectRatio;
        }
        refCoin.current.style.top = `calc(50% + ${((heightImage / 2) * 60) / 100}px)`
      }
    };
    if(state.name !== "intro" && state.name !== "idle"){
      getSizeImage();
      window.addEventListener('resize', getSizeImage);
    }
    return () => {
      window.removeEventListener('resize', getSizeImage);
    };
  }, [refImage, state]);

  useEffect(() => {
    if (state?.name === "sitUp") {
      const promiseLayDown = new Promise((resolve) => {
        const timeout = setTimeout(() => {
          setState(states.layDown)
          resolve("layDown")
        }, state.timeout)
        setTimeOutActive(timeout)
      })
      promiseLayDown.then((res) => {
        if (res === "layDown") {
          setTimeout(() => {
            console.log("idle")
            setState(states.idle)
          }, states[res].timeout)
        }
      })
    } else if (state?.name === "bonk" || state?.name === "pet") {
      
      const promiseLayDown = new Promise((resolve) => {
        const timeout = setTimeout(() => {
          setState(states.layDown)
          console.log("layDown")
          resolve("layDown")
        }, state.timeout)
        setTimeOutActive(timeout)
      })
      promiseLayDown.then((res) => {
        if (res === "layDown") {
          setTimeout(() => {
            console.log("idle")
            setState(states.idle)
          }, states[res].timeout)
        }
      })
    }
  }, [state])


  // const handleSendTransaction = async () => {
  //   if (!program) {
  //     console.error("Program not found");
  //     return;
  //   }

  //   const payer = wallet.publicKey;
  //   const [global] = web3.PublicKey.findProgramAddressSync(
  //     [Buffer.from("global")],
  //     program.programId,
  //   )
  //   const [userPets] = web3.PublicKey.findProgramAddressSync(
  //     [Buffer.from("user"), global.toBuffer(), payer.toBuffer()],
  //     program.programId,
  //   )
  //   console.log
  //   const userPetsPDA = await program.account.userPets.fetch(userPets).catch((err) => { console.log(err) });
  //   if (!userPetsPDA) {
  //     const tx = await program.methods
  //       .firstPet()
  //       .accounts({
  //         payer: payer,
  //         userPets,
  //         global,
  //         sessionToken: await sessionWallet.sessionToken,
  //       })
  //       .rpc({ skipPreflight: true })
  //     console.log(tx)
  //   } else {
  //     const tx = await program.methods
  //       .petDog()
  //       .accounts({
  //         signer: sessionWallet?.publicKey ?? payer,
  //         player: payer,
  //         userPets,
  //         global,
  //         sessionToken: sessionWallet.sessionToken,
  //       })
  //       .transaction();
  //     const txids = await sessionWallet.signAndSendTransaction!(tx, undefined, { skipPreflight: true });

  //     if (txids && txids.length > 0) {
  //       console.log("Transaction sent:", txids);
  //     } else {
  //       console.error("Failed to send transaction");
  //     }
  //   }
  // };

  // const handleRevokeSession = async () => {
  //   await sessionWallet.revokeSession();
  //   console.log("Session revoked");
  // };

  // const bonk = async () => {

  //   const payer = wallet.publicKey;
  //   const [global] = web3.PublicKey.findProgramAddressSync(
  //     [Buffer.from("bonk")],
  //     program.programId,
  //   )
  //   const [userBonks] = web3.PublicKey.findProgramAddressSync(
  //     [Buffer.from("user"), global.toBuffer(), payer.toBuffer()],
  //     program.programId,
  //   )
  //   const userPetsPDA = await program.account.userPets.fetch(userBonks).catch((err) => { console.log(err) });

  //     const tx = await program.methods
  //       .bonk()
  //       .accounts({
  //         signer: sessionWallet?.publicKey ?? payer,
  //         player: payer,
  //         userBonks,
  //         global,
  //         sessionToken: sessionWallet.sessionToken,
  //       })
  //       .transaction();
  //     const txids = await sessionWallet.signAndSendTransaction!(tx, undefined, { skipPreflight: true });

  //     if (txids && txids.length > 0) {
  //       console.log("Transaction sent:", txids);
  //     } else {
  //       console.error("Failed to send transaction");
  //     }
    
  // }

  // Rendering the component
  return (
    <>
      <Head>
        {Object.values(states).map((state, index) => (
          <link key={index} rel="preload" as="image" href={`/${state.file}`} />
        ))}
      </Head>
      <div
        className="relative"
        id="dog-container"
      >
        <img
          id="dog-image"
          ref={refImage}
          src={`/${state?.file ?? "1-sunriseIntro.gif"}`}
          alt="dog"
          // style={{ height: "100%", width: "auto" }}
          onClick={() => {
            console.log(`petDog is being called in the ${state.file} state`);
            setState(states.sitUp)
            // handleSendTransaction()
          }}
        />
        {
          state.name !== "intro" && state.name !== "idle" 
          &&
          <>
            < div
              ref={refCoin}
              onClick={() => {
                new Promise ((resolve)=>{ 
                  setState(states.standBy)
                  // bonk()
                  resolve("standBy")
                }).then(()=>{
                  // clearTimeout(timeoutActive)
                  setState(states.bonk)
                })
              }}
              className="absolute top-1/2 aspect-square -translate-y-1/2 left-[23%] w-[9%]"
            />
            <div
              ref={refDog}
              onClick={() => {
                new Promise ((resolve)=>{ 
                  setState(states.standBy)
                  resolve("standBy")
                }).then(()=>{
                  // clearTimeout(timeoutActive)
                  setState(states.pet)
                })
              }}
              className="absolute top-1/2 aspect-square translate-y-[calc(-50%_-_10%)] right-[20%] w-[40%]"
            />
          </>
        }
      </div>

    </>
  );
};

// Exporting the Home component
export default Home;
