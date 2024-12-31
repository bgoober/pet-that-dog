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
        <h4>Disclaimer / Terms</h4>
        <ul>
          <li>
            The code for this program is unaudited. Use it at your own risk.
          </li>
          <li>
            The front-end user interface relies on 3rd party applications, such
            as Vercel, and may not always be available.
          </li>
          <li>
            Interacting with a Dog costs a transaction fee, plus 0.000001 SOL
            paid to the Dog's owner.
          </li>
          <li>Creating your own Dog costs a transaction fee plus 0.01 SOL.</li>
          <li>
            Each Dog mints 1 of its tokens to you every time you interact with
            it.
          </li>
          <li>
            Each individual Dog's token has an initial supply of 0. There is no
            pre-mine, no insider allocations, and no VC's. YOU MINT YOUR OWN
            TOKENS BY INTERACTING WITH THAT DOG!
          </li>
          <li>
            Expect no return nor expectation of profit from the developer's
            continued work, your Dog, someone ele's Dog, or any Dog's token.
          </li>
          <li>
            In no event shall the owners of, or contributors to this application
            and website be liable for any damages of any kind; including, but
            not limited to, loss of use, loss of funds, loss of profits, or loss
            of data arising out of or in any way connected with the use of the
            website or application and its instructions and functions.
          </li>
          <li>
            The use of this program, its instructions, and its front end is
            entirely of your own volition.
          </li>
          <li>
            If the dog/app's artwork is glitching or resetting/looping oddly
            when you click, then reload the web page with Ctrl+R and make sure
            your wallet is connected.
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
