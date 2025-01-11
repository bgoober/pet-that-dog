import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { ReactNode, useState, useEffect } from 'react';
import Dapp from './dapp';
import Modal from './modal';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGithub, faXTwitter } from '@fortawesome/free-brands-svg-icons';
import React from 'react';
import { TokenCounter } from './components/TokenCounter';
import { PublicKey } from '@solana/web3.js';
import { useWallet } from '@solana/wallet-adapter-react';
import { useWalletModal } from '@solana/wallet-adapter-react-ui';
import { HeroSwap } from './components/HeroSwap';
import { MarketInfo } from './components/MarketInfo';
import { Trading } from './components/Trading';

export function AppLayout({ children }: { children: ReactNode }) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [isFirstLoad, setIsFirstLoad] = useState(true);
  const { publicKey } = useWallet();
  const { setVisible } = useWalletModal();

  useEffect(() => {
    if (isFirstLoad) {
      const timer = setTimeout(() => {
        if (!publicKey) {
          setVisible(true);
        }
        setIsFirstLoad(false);
      }, 500); // 500ms delay

      return () => clearTimeout(timer); // Cleanup timeout
    }
  }, [publicKey, setVisible, isFirstLoad]);

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  const toggleModal = () => {
    setShowModal(!showModal);
  };

  // Constants for Maximilian I's mint
  const dogMint = PublicKey.findProgramAddressSync(
    [Buffer.from('mint'), Buffer.from('Maximilian I')],
    new PublicKey('5MAGgYWgNF8KtNegKMhZxNbugrgzkLDUe9Vy2y4STRwX')
  )[0];

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
      <div
        style={{
          position: 'absolute',
          top: '6px',
          right: '6px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '20px',
        }}
      >
        <WalletMultiButton />
        <HeroSwap />
      </div>
      <div
        style={{
          position: 'absolute',
          top: '5px',
          left: '5px',
          alignItems: 'left',
          // zIndex: -1,
          flexDirection: 'column',
          gap: '20px',
          // outline: '1px solid #14F195',
        }}
      >
        <TokenCounter />
        {/* <MarketInfo /> */}
        <Trading />
      </div>
      {/* <div
        style={{
          position: 'absolute',
          top: '100px',  // Adjust based on your layout
          right: '6px',
          display: 'flex',
          flexDirection: 'column',
          gap: '20px',
          zIndex: -1,
        }}
      >
        <MarketInfo />
        <Trading />
      </div> */}
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
            cursor: 'pointer',
          }}
        >
          Disclaimer / Terms / How it Works
        </button>
      </div>
      <Modal show={showModal} onClose={toggleModal}>
        <div
          style={{
            maxHeight: '80vh',
            overflowY: 'auto',
            padding: '0 20px',
            fontSize: '14px',
          }}
        >
          <h4
            style={{
              position: 'sticky',
              top: 0,
              background: '#512da8',
              padding: '10px 0',
            }}
          >
            Disclaimer / Terms / How it Works
          </h4>
          <ul style={{ lineHeight: '1.4' }}>
            <li>
              <strong>Program Usage:</strong>
              <ul>
                <li>This is unaudited software - use at your own risk</li>
                <li>
                  Program usage is entirely voluntary and at your own discretion
                </li>
                <li>
                  The front-end interface relies on third-party services (e.g.,
                  Vercel) and may experience downtime
                </li>
                <li>
                  If the dog/app's artwork is glitching or resetting/looping
                  oddly, reload the page (Ctrl+R) and ensure your wallet is
                  connected
                </li>
              </ul>
            </li>

            <li>
              <strong>Costs & Tokenomics:</strong>
              <ul>
                <li>Click to interact with a Dog.</li>
                <li>Transaction fees apply to all interactions with any Dog</li>
                <li>
                  Interacting with a Dog: Standard network fee + 0.000001 SOL
                  paid to Dog's owner
                </li>
                <li>
                  Creating a Dog: Standard network fee + 0.01 SOL paid to the
                  House
                </li>
                <li>
                  Each interaction mints 1 of the Dog's tokens to your wallet
                </li>
                <li>
                  Each Dog's token starts with 0 supply (no pre-mine, no insider
                  allocations, no mint control by the Dog's owner)
                </li>
                <li>
                  Token metadata is immutable once created and can not be
                  updated or changed by anyone including the Dog's owner or the
                  program
                </li>
                <li>YOU MINT YOUR OWN TOKENS!</li>
              </ul>
            </li>

            <li>
              <strong>Non-Investment Notice:</strong>
              <ul>
                <li>
                  This is not an investment product or financial instrument
                </li>
                <li>
                  No expectation of profit from developer's work, your Dog, or
                  any Dog's tokens
                </li>
                <li>
                  Fees paid and tokens received do not constitute an investment
                </li>
              </ul>
            </li>

            <li>
              <strong>Liability Disclaimer:</strong>
              <ul>
                <li>
                  We are not liable for any damages including loss of use,
                  funds, profits, or data
                </li>
                <li>
                  Users are solely responsible for their actions and
                  transactions
                </li>
              </ul>
            </li>

            <li>
              <strong>Cookie & Storage Notice:</strong>
              <ul>
                <li>
                  This app uses third-party services (including but not limited
                  to Spotify, wallet adapters, and hosting services) that may
                  store cookies and local data on your device
                </li>
                <li>
                  These services require data storage to enable features like
                  music playback, wallet connections, and basic functionality
                </li>
                <li>
                  While we do not directly collect or sell any personal data,
                  through our hosting provider (Vercel) we may collect anonymous
                  usage metrics for performance monitoring and analytics
                </li>
                <li>
                  By using this app, you acknowledge and consent to this data
                  storage
                </li>
                <li>
                  You can manage cookie and storage settings through your
                  browser preferences
                </li>
              </ul>
            </li>
            <li>
              <strong>Affiliate Links:</strong>
              <ul>
                <li>
                  The HeroSwap widget is an affiliate link. We receive 50% of
                  the fees on any swaps made through the widget.
                </li>
                <li>
                  We have not altered HeroSwap's widget in any way except
                  cosmetically. Use of the widget is governed by HeroSwap's
                  terms, found {' '}
                  <a
                    href="https://docs.google.com/document/d/1TGeQ9YDHeorG90iu6SJFcbWmR1wpL2wnQk1cekjeSTw/edit?usp=sharing"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: '#14F195' }}
                  >
                    here
                  </a>
                  .
                </li>
                {/* <li>
                  The Solana Dust Vaccuum link is an affiliate link. We receive
                  33% commission on any SOL reclaimed through use of the link.
                  We have no control over the Solana Dust Vaccuum site or its
                  program.
                </li>
                <li>Use both of these services at your own risk.</li> */}
                <li>
                  The "Trade on Jupiter" link is a referral link. We receive
                  0.10% referral fees on any swaps you make through the link.
                  This referrer code was created using Jupiter's {' '}
                  <a
                    href="https://referral.jup.ag/dashboard"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: '#14F195' }}
                  >
                    referral dashboard
                  </a>
                  .
                </li>
                <li>
                  You can voluntarily remove this 0.10% referral fee on
                  Jupiter's trading interface.
                </li>
              </ul>
            </li>
          </ul>
        </div>
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
      <div
        style={{
          position: 'absolute',
          bottom: '5px',
          right: '5px',
          display: 'flex',
          gap: '20px',
        }}
      >
        <a
          href="https://x.com/pet_thatdog"
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: '#fffcee' }}
        >
          <FontAwesomeIcon icon={faXTwitter} size="2x" />
        </a>
        <a
          href="https://github.com/bgoober/pet-that-dog"
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
        
        div::-webkit-scrollbar {
          width: 8px;
        }
        
        div::-webkit-scrollbar-track {
          background: #2d3748;
        }
        
        div::-webkit-scrollbar-thumb {
          background: #4a5568;
          border-radius: 4px;
        }
        
        div::-webkit-scrollbar-thumb:hover {
          background: #718096;
        }
      `}</style>
    </div>
  );
}
