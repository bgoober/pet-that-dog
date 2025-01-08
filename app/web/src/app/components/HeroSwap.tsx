import React, { useState } from 'react';

export const HeroSwap: React.FC = () => {
  const [showIframe, setShowIframe] = useState(false);

  const toggleIframe = () => {
    setShowIframe(!showIframe);
  };

  return (
    <div>
      <button
        onClick={toggleIframe}
        style={{
          backgroundColor: '#111827',
          color: '#14F195',
          border: 'none',
          borderRadius: '5px',
          padding: '0 24px',
          height: '36px',
          fontSize: '16px',
          fontFamily: 'Arial, sans-serif',
          fontWeight: 'bold',
          cursor: 'pointer',
        }}
      >
        HeroSwap ⇌ SOL
      </button>
      {showIframe && (
        <div
          style={{
            position: 'absolute',
            top: '50px',
            right: '5px',
            zIndex: 1000,
            backgroundColor: '#111827',
            padding: '0',
            borderRadius: '10px',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
            overflow: 'hidden',
          }}
        >
          <button
            onClick={toggleIframe}
            style={{
              position: 'absolute',
              right: '10px',
              top: '10px',
              background: 'none',
              border: 'none',
              color: '#fffcee',
              cursor: 'pointer',
              fontSize: '20px',
              zIndex: 1001,
            }}
          >
            ×
          </button>
          <iframe
            src="https://heroswap.com/widget?affiliateName=sumwutsrs&theme=dark-icy&depositTicker=ETH&destinationTicker=SOL"
            style={{
              width: '450px',
              height: '398px',
              border: 'none',
              borderRadius: '20px',
              backgroundColor: '#111827',
              display: 'block',
              overflow: 'hidden',
              scrollbarColor: '#111827',
            }}
            title="HeroSwap Widget"
          />
        </div>
      )}
    </div>
  );
};
