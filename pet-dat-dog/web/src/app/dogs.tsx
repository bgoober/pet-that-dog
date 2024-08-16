import React, { useEffect, useState, useRef } from 'react';

const DogAnimation = () => {
  // Define the states
  type State = {
    nextState: any; file: string; timeout: number; duration: number 
  }
  
  const states: { [key: string]: State } = {
    intro: {
      file: "1-sunriseIntro.gif", timeout: 20000, duration: 2600,
      nextState: undefined
    },
    sitUp: {
      file: "2-sitUp.gif", timeout: 12000, duration: 2300,
      nextState: undefined
    },
    pet: {
      file: "3-petDog.gif", timeout: 12000, duration: 4100,
      nextState: undefined
    },
    layDown: {
      file: "4-layDown.gif", timeout: 10000, duration: 1200,
      nextState: undefined
    },
    idle: {
      file: "5-idleWind.gif", timeout: 20000, duration: 1750,
      nextState: undefined
    },
    bonk: {
      file: "BONK.gif", timeout: 10000, duration: 3300,
      nextState: undefined
    }
  };

  // Preload GIFs
  const images: { [key: string]: HTMLImageElement } = {};
  Object.values(states).forEach((state) => {
    const img = new Image();
    img.src = `./assets/${state.file}`;
    images[state.file] = img;
  });

  const [currentState, setCurrentState] = useState('intro');
  const [isAnimating, setIsAnimating] = useState(false);
  const [clicked, setClicked] = useState(false);
  const dogImageRef = useRef<HTMLImageElement>(null);
  const petBoxRef = useRef<HTMLDivElement>(null);
  const bonkBoxRef = useRef<HTMLDivElement>(null);
  const nextTimeoutRef = useRef<null | NodeJS.Timeout>(null);

  // Clears any existing timeout
  const clearExistingTimeout = () => {
    if (nextTimeoutRef.current) {
      clearTimeout(nextTimeoutRef.current);
      nextTimeoutRef.current = null;
    }
  };

  const changeState = (newState: React.SetStateAction<string>) => {
    if (isAnimating) return;
  
    const resolvedState = typeof newState === 'function' ? newState(currentState) : newState;
  
    console.log(`Changing state to ${resolvedState}`);
    const img = images[states[resolvedState].file];
    if (!img.complete) {
      img.onload = () => {
        changeState(resolvedState);
      };
      return;
    }
  
    clearExistingTimeout();
    setCurrentState(resolvedState);
    setIsAnimating(true);
    if (dogImageRef.current) {
      dogImageRef.current.src = img.src;
    }
    console.log(`State changed to ${resolvedState}`);
  
    // Show or hide bounding boxes based on the current state
    if (["sitUp", "pet", "bonk"].includes(resolvedState)) {
      if (petBoxRef.current) {
        petBoxRef.current.style.display = "block";
      }
      if (bonkBoxRef.current) {
        bonkBoxRef.current.style.display = "block";
      }
    } else {
      if (petBoxRef.current) {
        petBoxRef.current.style.display = "none";
      }
      if (bonkBoxRef.current) {
        bonkBoxRef.current.style.display = "none";
      }
    }
  
    nextTimeoutRef.current = setTimeout(() => {
      if (states[resolvedState].nextState) {
        changeState(states[resolvedState].nextState);
      }
    }, states[resolvedState].timeout);

    // Lockout period during the GIF's rendering duration
    setTimeout(() => {
      setIsAnimating(false);
    }, states[resolvedState].duration);
  };

  // Timeout logic to change state if no clicks occur
  useEffect(() => {
    nextTimeoutRef.current = setTimeout(() => {
      if (!clicked) {
        if (currentState === "intro") {
          changeState("idle");
        } else if (currentState === "sitUp") {
          changeState("layDown");
        } else if (currentState === "pet") {
          changeState("layDown");
        } else if (currentState === "bonk") {
          changeState("layDown");
        } else if (currentState === "layDown") {
          changeState("idle");
        } else if (currentState === "idle") {
          changeState("idle");
        }
      }
    }, states[currentState].timeout);
  }, [currentState, clicked]);

  // Handles click events
  const handleDogImageClick = () => {
    if (isAnimating) return;
    console.log(`Image clicked during ${currentState} state`);
  
    if (currentState === "intro") {
      changeState("sitUp");
    } else if (currentState === "layDown") {
      changeState("sitUp");
    } else if (currentState === "idle") {
      changeState("sitUp");
    }
  };

  // Add event listeners to the bounding boxes
  const handlePetBoxClick = () => {
    if (isAnimating) return;
    if (["sitUp", "pet", "bonk"].includes(currentState)) {
      console.log(`Pet box clicked during ${currentState} state`);
      setClicked(true);
      changeState("pet");
    }
  };

  const handleBonkBoxClick = () => {
    if (isAnimating) return;
    if (["sitUp", "pet", "bonk"].includes(currentState)) {
      console.log(`Bonk box clicked during ${currentState} state`);
      setClicked(true);
      changeState("bonk");
    }
  };

  useEffect(() => {
    changeState(currentState);
  }, []);

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <img
        id="dog-image"
        ref={dogImageRef}
        src={`../assets/${states[currentState].file}`}
        alt="Dog Animation"
        onClick={handleDogImageClick}
        style={{ display: 'block', margin: 'auto' }}
      />
      <div
        id="pet-box"
        ref={petBoxRef}
        className="pet-box"
        onClick={handlePetBoxClick}
      >
      </div>
      <div
        id="bonk-box"
        ref={bonkBoxRef}
        className="bonk-box"
        onClick={handleBonkBoxClick}
      >
      </div>
    </div>
  );
};

export default DogAnimation;