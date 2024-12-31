import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { ReactNode, useState } from 'react';
import Dapp from './dapp';
import Modal from './modal';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGithub } from '@fortawesome/free-brands-svg-icons';
import React from 'react';

export function AppLayout({ children }: { children: ReactNode }) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  const toggleModal = () => {
    setShowModal(!showModal);
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
          style={{
            borderRadius: '15px',
            transition: 'opacity 0.5s',
            border: 'none',
          }}
          src="https://open.spotify.com/embed/playlist/0vvXsWCC9xrXsKd4FyS8kM?utm_source=generator&theme=1"
          width="100%"
          height="352"
          allowFullScreen
          allow="autoplay; clipboard-write; encrypted-media"
          loading="lazy"
        ></iframe>
      </div>
      <div style={{ position: 'absolute', bottom: '5px', left: '5px' }}>
        <button
          onClick={toggleModal}
          style={{
            background: '#111827',
            color: '#fffcee',
            border: 'none',
            borderRadius: '5px',
            padding: '10px',
            fontSize: '10px',
            fontFamily: 'Arial, sans-serif',
            textDecoration: 'none',
          }}
        >
          Disclaimer / Terms
        </button>
      </div>
      <Modal show={showModal} onClose={toggleModal}>
        <h4>Disclaimer & Terms</h4>
        <ul>
          <li>
            <strong>Program Usage:</strong>
            <ul>
              <li>This is unaudited software - use at your own risk</li>
              <li>Program usage is entirely voluntary and at your own discretion</li>
              <li>The front-end interface relies on third-party services (e.g., Vercel) and may experience downtime</li>
            </ul>
          </li>

          <li>
            <strong>Costs & Tokenomics:</strong>
            <ul>
              <li>Transaction fees apply to all interactions with any Dog</li>
              <li>Interacting with a Dog: Standard network fee + 0.000001 SOL paid to Dog's owner</li>
              <li>Creating a Dog: Standard network fee + 0.01 SOL paid to the House</li>
              <li>Each interaction mints 1 of the Dog's tokens to your wallet</li>
              <li>Each Dog's token starts with 0 supply (no pre-mine, no insider allocations, no mint control by the Dog's owner)</li>
              <li>YOU MINT YOUR OWN TOKENS!</li>
            </ul>
          </li>

          <li>
            <strong>Non-Investment Notice:</strong>
            <ul>
              <li>This is not an investment product or financial instrument</li>
              <li>No expectation of profit from developer's work, your Dog, or any Dog's tokens</li>
              <li>Fees paid and tokens received do not constitute an investment</li>
            </ul>
          </li>

          <li>
            <strong>Liability Disclaimer:</strong>
            <ul>
              <li>We are not liable for any damages including loss of use, funds, profits, or data</li>
              <li>Users are solely responsible for their actions and transactions</li>
              <li>If the dog/app's artwork is glitching or resetting/looping oddly, reload the page (Ctrl+R) and ensure your wallet is connected</li>
            </ul>
          </li>
        </ul>
      </Modal>
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
      <div style={{ position: 'absolute', bottom: '5px', right: '5px' }}>
        <a
          href="https://github.com/bgoober/pet-dat-dog"
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: '#fffcee' }}
        >
          <FontAwesomeIcon icon={faGithub} size="2x" />
        </a>
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
