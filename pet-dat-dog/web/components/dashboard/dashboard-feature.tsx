'use client';

// import { AppHero } from '../ui/ui-layout';

// const links: { label: string; href: string }[] = [
//   { label: 'Solana Docs', href: 'https://docs.solana.com/' },
//   { label: 'Solana Faucet', href: 'https://faucet.solana.com/' },
//   { label: 'Solana Cookbook', href: 'https://solanacookbook.com/' },
//   { label: 'Solana Stack Overflow', href: 'https://solana.stackexchange.com/' },
//   {
//     label: 'Solana Developers GitHub',
//     href: 'https://github.com/solana-developers/',
//   },
// ];

const states = {
  intro: { name: "intro", file: "1-sunriseIntro.gif", timeout: 20000, duration: 2600 },
  sitUp: { name: "sitUp", file: "2-sitUp.gif", timeout: 12000, duration: 2300 },
  pet: { name: "pet", file: "3-petDog.gif", timeout: 12000, duration: 4100 },
  bonk: { name: "bonk", file: "BONK.gif", timeout: 10000, duration: 3300 },
  standBy: { name: "standby", file: "standby.png", timeout: 0, duration: 0},
  layDown: { name: "layDown", file: "4-layDown.gif", timeout: 10000, duration: 1200 },
  idle: { name: "idle", file: "5-idleWind.gif", timeout: 20000, duration: 1750 },
};

export default function DashboardFeature() {
  return (
    <div>
      <img src="../public/1-sunriseIntro.gif" />
    </div>
  );
}
