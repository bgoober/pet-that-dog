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
          Disclaimer / Terms of Service
        </button>
      </div>
      <Modal show={showModal} onClose={toggleModal}>
        <h4>Disclaimer / Terms of Service</h4>
        <ul>
          <li>
            The code for this program is unaudited; including the use of Session
            Keys for signing transactions.
          </li>
          <li>
            The front-end user interface relies on 3rd party applications, such
            as Vercel for the front end and may not always be available.
          </li>
          <li>
            The use of this program, its instructions, and its front end is
            entirely of your own volition. Use at your own risk.
          </li>
          <li>
            Petting a Dog costs a transaction fee, plus 0.000001 SOL paid to the
            Dog's owner.
          </li>
          <li>
            BONK'ing a Dog costs a transaction fee, plus 1 $BONK token paid to
            the Dog.
          </li>
          <li>Creating your own Dog costs 0.01 SOL.</li>
          <li>Mint 1 $PETS token to your wallet by petting a Dog.</li>
          <li>
            The $PETS token has an initial supply of 0. There is no pre-mine, no
            insider allocations, nor VC's.
          </li>
          <li>
            Expect no return nor expectation of profit from the developer's
            continued work, your Dog, or the $PETS token.
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
