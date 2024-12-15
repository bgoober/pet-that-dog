import React from 'react';
import { Navigate, useRoutes } from 'react-router-dom';
import { handleAction, ACTIONS } from '../routes/action-routes';
import { useWallet } from '@solana/wallet-adapter-react';
import Dapp from './dapp';

// Action handler component
function ActionHandler({ action }: { action: 'pet' | 'bonk' | 'pnut' | 'wif' }) {
  const wallet = useWallet();

  // Handle POST request (transaction)
  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const account = params.get('account');
    
    if (account && wallet.connected) {
      const petBox = document.getElementById('pet-box');
      const bonkBox = document.getElementById('bonk-box');

      const handleClick = async () => {
        const response = await handleAction(account, action);
        const gifElement = document.getElementById('action-gif') as HTMLImageElement;
        if (gifElement) {
          gifElement.src = ACTIONS[action].animation;
        }
      };

      if (action === 'pet' && petBox) {
        petBox.addEventListener('click', handleClick);
      }
      if (action === 'bonk' && bonkBox) {
        bonkBox.addEventListener('click', handleClick);
      }

      return () => {
        if (action === 'pet' && petBox) {
          petBox.removeEventListener('click', handleClick);
        }
        if (action === 'bonk' && bonkBox) {
          bonkBox.removeEventListener('click', handleClick);
        }
      };
    }
  }, [action, wallet.connected]);

  return (
    <div id="dog-container">
      <img 
        id="action-gif"
        src={ACTIONS[action].animation}
        alt={ACTIONS[action].title}
      />
      {action === 'pet' && (
        <div 
          id="pet-box" 
          className="bounding-box" 
          style={{ 
            display: 'block',
            position: 'absolute',
            top: '99px',
            left: '181px',
            width: '160px',
            height: '180px',
            cursor: 'pointer',
            opacity: 0
          }} 
        />
      )}
      {action === 'bonk' && (
        <div 
          id="bonk-box" 
          className="bounding-box" 
          style={{ 
            display: 'block',
            position: 'absolute',
            top: '304px',
            left: '89px',
            width: '49px',
            height: '49px',
            cursor: 'pointer',
            opacity: 0
          }} 
        />
      )}
    </div>
  );
}

export function AppRoutes() {
  return useRoutes([
    // Default route redirects to home
    { index: true, element: <Navigate replace to="/home" /> },
    
    // Main app route - shows full interactive experience with wallet connection
    {
      path: '/home',
      element: <Dapp />,
    },

    // Solana Blink Action Routes - for Twitter/X interactions
    {
      path: '/pet',
      element: <ActionHandler action="pet" />,
    },
    {
      path: '/bonk',
      element: <ActionHandler action="bonk" />,
    },
    // TODO: Add animations for these actions
    {
      path: '/pnut',
      element: <ActionHandler action="pnut" />,
    },
    {
      path: '/wif',
      element: <ActionHandler action="wif" />,
    },
    
    // TODO: Future route for dog/token creation page
    // {
    //   path: '/create',
    //   element: <CreateDog />
    // }
  ]);
}
