import React from 'react';

export const Trading: React.FC = () => {
  return (
    <div
      style={{
        backgroundColor: '#111827',
        padding: '20px',
        borderRadius: '10px',
        marginTop: '10px',
        position: 'relative',
      }}
    >
      <h3 style={{ color: '#14F195' }}>Trade MAXIMILIAN</h3>
      <div style={{ display: 'flex', gap: '10px', flexDirection: 'column' }}>
        <a
          href="https://jup.ag/swap/SOL-DwbAbiDmZLFHUsKhLKBioTWzhmKVR7HQdH51L8r84iA1?referrer=GsYPUM4FRZXZusnvG2HcjR8tLVWDDejUogackBBqMKwf&feeBps=10"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            fontWeight: 'bold',
            backgroundColor: '#512da8',
            color: '#14F195',
            padding: '10px 20px',
            borderRadius: '5px',
            textDecoration: 'none',
            textAlign: 'center',
            maxWidth: '140px',
            cursor: 'pointer',
          }}
        >
          Trade on Jupiter
        </a>
        <a
          href="https://app.meteora.ag/pools/72YfqMUzYWx5Y2GSNPkuuZ5Vkm3HHL1hj9cP9xbMXi1c"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            fontWeight: 'bold',
            backgroundColor: '#512da8',
            color: '#14F195',
            padding: '10px 20px',
            borderRadius: '5px',
            textDecoration: 'none',
            textAlign: 'center',
            maxWidth: '140px',
            cursor: 'pointer',
          }}
        >
          Trade on Meteora
        </a>
        <a
          href="https://m3m3.meteora.ag/farms/72YfqMUzYWx5Y2GSNPkuuZ5Vkm3HHL1hj9cP9xbMXi1c"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            fontWeight: 'bold',
            backgroundColor: '#512da8',
            color: '#14F195',
            padding: '10px 20px',
            borderRadius: '5px',
            textDecoration: 'none',
            textAlign: 'center',
            maxWidth: '140px',
            cursor: 'pointer',
          }}
        >
          Stake and Earn
        </a>
        
        <div style={{ 
          marginTop: '15px',
          color: '#14F195',
          fontSize: '14px'
        }}>
          <h4 style={{ 
            color: '#14F195',
            marginBottom: '8px',
            fontSize: '15px'
          }}>M3M3 Staking Parameters:</h4>
          <ul style={{ 
            listStyle: 'none',
            padding: 0,
            margin: 0
          }}>
            <li>Top 1000 stakers earn fees</li>
            <li>100% of fees to stakers</li>
            <li>6 hour unstake period</li>
            <li>7 day fee accumulation window</li>
          </ul>
        </div>
      </div>
    </div>
  );
};
