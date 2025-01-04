import React, { useEffect, useState } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';
import { getAssociatedTokenAddressSync } from '@solana/spl-token';
import { useCluster } from '../cluster/cluster-data-access';

export const TokenCounter: React.FC = () => {
  const [tokenCount, setTokenCount] = useState<number | null>(null);
  const [currentAta, setCurrentAta] = useState<string | null>(null);
  const { connection } = useConnection();
  const wallet = useWallet();
  const { cluster } = useCluster();
  const wsEndpoint = cluster.wsEndpoint;
//   console.log('Cluster:', {
//     rpc: cluster.endpoint,
//     ws: wsEndpoint,
//     network: cluster.network
//   });

  // Constants from init script
  const DOG_NAME = "Maximilian I";
  const TOKEN_SYMBOL = "MAXIMILIAN";
  const house = new PublicKey('9tM775Pb7SWT12WZqGvoGKPAttPNwMkYxuq8Yex8AGTX');
  const programId = new PublicKey('5MAGgYWgNF8KtNegKMhZxNbugrgzkLDUe9Vy2y4STRwX');

  const fetchData = async () => {
    if (!wallet.publicKey) {
    //   console.log('No wallet connected, clearing token ATA and balance states');
      setCurrentAta(null);
      setTokenCount(null);
      return;
    }

    try {
      console.log('Wallet connected:', wallet.publicKey.toBase58());
      
      const [dog] = PublicKey.findProgramAddressSync(
        [Buffer.from('dog'), Buffer.from(DOG_NAME), house.toBuffer()],
        programId
      );
    //   console.log('Derived dog PDA:', dog.toBase58());

      const [dogMint] = PublicKey.findProgramAddressSync(
        [Buffer.from('mint'), dog.toBuffer()],
        programId
      );
    //   console.log('Derived dog mint:', dogMint.toBase58());

      const ata = getAssociatedTokenAddressSync(dogMint, wallet.publicKey);
      const ataString = ata.toBase58();
    //   console.log('User ATA for this mint:', ataString);
      setCurrentAta(ataString);

      // Initial balance fetch
      const balance = await connection.getTokenAccountBalance(ata);
    //   console.log('Initial balance fetch:', Number(balance.value.amount) / 1_000_000);
      setTokenCount(Number(balance.value.amount) / 1_000_000);

      if (wsEndpoint) {
        // console.log('Creating WebSocket endpoint.');
        const ws = new WebSocket(wsEndpoint);
        
        ws.onerror = (error) => {
        //   console.error('WebSocket connection error:', error);
        };
        
        ws.onopen = () => {
        //   console.log('WebSocket opened, sending subscription request');
          ws.send(JSON.stringify({
            jsonrpc: "2.0",
            id: 1,
            method: "accountSubscribe",
            params: [
              ataString,
              {
                encoding: "jsonParsed",
                commitment: "confirmed"
              }
            ]
          }));
        };
        
        ws.onmessage = (event) => {
          const response = JSON.parse(event.data);
          
          if (response.result) {
            // console.log('Subscription confirmed for ATA:', ataString);
            return;
          }

          // Verify we're still looking at the right ATA
          if (response.method === "accountNotification" && ataString === currentAta) {
            const tokenAmount = response.params?.result?.value?.data?.parsed?.info?.tokenAmount?.amount;
            if (tokenAmount !== undefined) {
              const newBalance = Number(tokenAmount) / 1_000_000;
            //   console.log(`New balance for ATA ${ataString}:`, newBalance);
              setTokenCount(newBalance);
            }
          }
        };

        return () => {
        //   console.log('Closing WebSocket for ATA:', ataString);
          ws.close();
        };
      } else {
        console.warn('No endpoint available - live updates disabled');
      }
    } catch (error) {
      console.error('Error in fetchData:', error);
      setTokenCount(0);
    }
  };

  useEffect(() => {
    let cleanupFn: (() => void) | undefined;
    
    fetchData().then(cleanup => {
      cleanupFn = cleanup;
    });

    return () => {
      if (cleanupFn) cleanupFn();
    };
  }, [wallet.publicKey]); // This will re-run when wallet changes

  return (
    <div className="token-counter" style={{
      background: 'transparent',
      padding: '0 10px',
      height: 'auto',
      borderRadius: '4px',
      color: '#fffcee',
      fontSize: '16px',
      fontFamily: 'Arial, sans-serif',
      cursor: 'default',
      textAlign: 'left',
      marginTop: '15px'
    }}>
      <span>This dog's name is {DOG_NAME}</span>
      <br />
      <br />
      {!wallet.publicKey ? (
        <span>Your {TOKEN_SYMBOL} balance is ...</span>
      ) : tokenCount !== null ? (
        <span>Your {TOKEN_SYMBOL} balance is {tokenCount}</span>
      ) : (
        <span>Loading your {TOKEN_SYMBOL} balance...</span>
      )}
    </div>
  );
}; 