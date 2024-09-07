import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { ReactNode } from 'react';
import Dapp from './dapp'; // Import the Dapp component

import { Link } from 'react-router-dom';
import React from 'react';

export function AppLayout({ children }: { children: ReactNode }) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        width: '100vw',
        position: 'relative',
      }}
    >
      <div style={{ position: 'absolute', top: '5px', right: '5px' }}>
        <WalletMultiButton />
      </div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          flexGrow: 1,
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            // transform: 'scale(2)',
            overflow: 'hidden',
          }}
        >
          <Dapp />
        </div>
      </div>
    </div>
  );
}
