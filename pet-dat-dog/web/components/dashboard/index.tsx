'use client';


// Define the states
const states: { [key: string]: { file: string; timeout: number; duration: number } } = {
  intro: { file: "1-sunriseIntro.gif", timeout: 20000, duration: 2600 },
  sitUp: { file: "2-sitUp.gif", timeout: 12000, duration: 2300 },
  pet: { file: "3-petDog.gif", timeout: 12000, duration: 4100 },
  layDown: { file: "4-layDown.gif", timeout: 10000, duration: 1200 },
  idle: { file: "5-idleWind.gif", timeout: 20000, duration: 1750 },
  bonk: { file: "BONK.gif", timeout: 10000, duration: 3300 },
};

// Preload GIFs and add load event listener
const images: { [key: string]: HTMLImageElement } = {};
Object.values(states).forEach((state) => {
  const img = new Image();
  img.src = `../media/${state.file}`;
  images[state.file] = img;
});

const dogImage: HTMLImageElement | null = document.getElementById("dog-image") as HTMLImageElement;
const petBox = document.getElementById("pet-box");
const bonkBox = document.getElementById("bonk-box");

let currentState = "intro";
let nextTimeout: string | number | NodeJS.Timeout | null | undefined;
let clicked = false;

// create an isAnimating variable to prevent the user from spamming the click event and locking the animations in a loop that never completes
let isAnimating = false;

// Clears any existing timeout
function clearExistingTimeout() {
  if (nextTimeout) {
    clearTimeout(nextTimeout);
    nextTimeout = null;
  }
}

// change state logic
function changeState(newState: string) {
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
  currentState = newState;
  if (dogImage) {
    dogImage.src = img.src;
  }
  console.log(`State changed to ${newState}`);

  // // Show or hide bounding boxes based on the current state
  // if (["sitUp", "pet", "bonk"].includes(newState)) {
  //   if (petBox) {
  //     petBox.style.display = "block";
  //   }
  //   if (bonkBox) {
  //     bonkBox.style.display = "block";
  //   }
  // } else {
  //   if (petBox) {
  //     petBox.style.display = "none";
  //   }
  //   if (bonkBox) {
  //     bonkBox.style.display = "none";
  //   }
  // }

  isAnimating = true;
  setTimeout(() => {
    isAnimating = false;
    clicked = false;
  }, states[newState].duration);

  // timeout logic to change state if no clicks occur
  nextTimeout = setTimeout(() => {
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
  }, states[newState].timeout);
}

// Handles click events
dogImage.addEventListener("click", () => {
  console.log(`Image clicked during ${currentState} state`);

  if (currentState === "intro") {
    changeState("sitUp");
  } else if (currentState === "layDown") {
    changeState("sitUp");
  } else if (currentState === "idle") {
    changeState("sitUp");
  }
});

// // Add event listeners to the bounding boxes
// if (petBox) {
//   petBox.addEventListener("click", () => {
//     // Event listener logic here
//   });
// }
//   if (["sitUp", "pet", "bonk"].includes(currentState)) {
//     console.log(`Pet box clicked during ${currentState} state`);
//     clicked = true;
//     changeState("pet");
//   }

// if (bonkBox) {
//   bonkBox.addEventListener("click", () => {
//     if (["sitUp", "pet", "bonk"].includes(currentState)) {
//       console.log(`Bonk box clicked during ${currentState} state`);
//       clicked = true;
//       changeState("bonk");
//     }
//   });
// }
//   if (["sitUp", "pet", "bonk"].includes(currentState)) {
//     console.log(`Bonk box clicked during ${currentState} state`);
//     clicked = true;
//     changeState("bonk");
//   }

// Call changeState function to start the state machine
changeState(currentState);

