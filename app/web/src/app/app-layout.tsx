import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { ReactNode, useState } from 'react';
import Dapp from './dapp'; // Import the Dapp component

import { Link } from 'react-router-dom';
import React from 'react';

export function AppLayout({ children }: { children: ReactNode }) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

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
      <div style={{ position: 'absolute', top: '5px', left: '5px' }}>
        <button
          onClick={toggleCollapse}
          style={{
            marginBottom: '5px',
            background: '#512da8',
            color: '#fffcee',
            border: 'none',
            borderRadius: '5px',
            fontSize: '15px',
            fontFamily: 'Arial, sans-serif',
          }}
        >
          {isCollapsed ? 'Show Spotify' : 'Hide Spotify'}
        </button>
        <iframe
          className={isCollapsed ? 'collapsed' : ''}
          style={{ borderRadius: '15px', transition: 'opacity 0.5s', border: 'none' }}
          src="https://open.spotify.com/embed/playlist/0vvXsWCC9xrXsKd4FyS8kM?utm_source=generator&theme=1"
          width="100%"
          height="352"
          allowFullScreen
          allow="autoplay; clipboard-write; encrypted-media"
          loading="lazy"
        ></iframe>
      </div>
      <div style={{ position: 'absolute', bottom: '10px', left: '5px' }}>
        <a
          href="#"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            // background: '#512da8',
            color: '#fffcee',
            border: 'none',
            borderRadius: '5px',
            padding: '10px',
            fontSize: '12px',
            fontFamily: 'Arial, sans-serif',
            textDecoration: 'none',
          }}
        >
          Disclaimer / Terms of Service
        </a>
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
            overflow: 'hidden',
          }}
        >
          <Dapp />
        </div>
      </div>
      <style>{`
        .collapsed {
          opacity: 0;
          pointer-events: none;
        }
      `}</style>
    </div>
  );
}
