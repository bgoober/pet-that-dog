import React, { useEffect, useState } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';
import { getAssociatedTokenAddressSync } from '@solana/spl-token';
import { useCluster } from '../cluster/cluster-data-access';

export const TokenCounter: React.FC = () => {
  const [tokenCount, setTokenCount] = useState<number | null>(null);
  const [totalSupply, setTotalSupply] = useState<number | null>(null);
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
  const DOG_NAME = 'Maximilian I';
  const TOKEN_SYMBOL = 'MAXIMILIAN';
  const house = new PublicKey('9tM775Pb7SWT12WZqGvoGKPAttPNwMkYxuq8Yex8AGTX');
  const programId = new PublicKey(
    '5MAGgYWgNF8KtNegKMhZxNbugrgzkLDUe9Vy2y4STRwX'
  );

  // Separate function to fetch and subscribe to total supply
  const fetchTotalSupply = async () => {
    try {
      const [dog] = PublicKey.findProgramAddressSync(
        [Buffer.from('dog'), Buffer.from(DOG_NAME), house.toBuffer()],
        programId
      );

      const [dogMint] = PublicKey.findProgramAddressSync(
        [Buffer.from('mint'), dog.toBuffer()],
        programId
      );

      // Get initial mint supply
      const mintInfo = await connection.getTokenSupply(dogMint);
      setTotalSupply(Number(mintInfo.value.amount) / 1_000_000);

      if (wsEndpoint) {
        const ws = new WebSocket(wsEndpoint);

        ws.onopen = () => {
          // Subscribe only to mint
          ws.send(
            JSON.stringify({
              jsonrpc: '2.0',
              id: 1,
              method: 'accountSubscribe',
              params: [
                dogMint.toBase58(),
                {
                  encoding: 'jsonParsed',
                  commitment: 'confirmed',
                },
              ],
            })
          );
        };

        ws.onmessage = (event) => {
          const response = JSON.parse(event.data);
          // console.log('Mint WebSocket message:', response);

          if (response.result !== undefined) {
            // console.log('Mint subscription confirmed, id:', response.id);
            return;
          }

          if (response.method === 'accountNotification') {
            try {
              const accountData = response.params.result.value.data.parsed.info;
              if (accountData.supply !== undefined) {
                const newSupply = Number(accountData.supply) / 1_000_000;
                // console.log('New total supply:', newSupply);
                setTotalSupply(newSupply);
              }
            } catch (error) {
              console.error('Error parsing mint update:', error);
            }
          }
        };

        return () => ws.close();
      }
    } catch (error) {
      console.error('Error fetching total supply:', error);
    }
  };

  // Modified fetchData to only handle wallet-specific data
  const fetchWalletData = async () => {
    if (!wallet.publicKey) {
      setCurrentAta(null);
      setTokenCount(null);
      return;
    }

    try {
      const [dog] = PublicKey.findProgramAddressSync(
        [Buffer.from('dog'), Buffer.from(DOG_NAME), house.toBuffer()],
        programId
      );

      const [dogMint] = PublicKey.findProgramAddressSync(
        [Buffer.from('mint'), dog.toBuffer()],
        programId
      );

      const ata = getAssociatedTokenAddressSync(dogMint, wallet.publicKey);
      const ataString = ata.toBase58();
      //   console.log('User ATA for this mint:', ataString);
      setCurrentAta(ataString);

      // Initial balance fetch
      const balance = await connection.getTokenAccountBalance(ata);
      //   console.log('Initial balance fetch:', Number(balance.value.amount) / 1_000_000);
      setTokenCount(Number(balance.value.amount) / 1_000_000);

      if (wsEndpoint) {
        const ws = new WebSocket(wsEndpoint);

        ws.onopen = () => {
          // Subscribe to both ATA and mint
          ws.send(
            JSON.stringify({
              jsonrpc: '2.0',
              id: 1,
              method: 'accountSubscribe',
              params: [
                ataString,
                {
                  encoding: 'jsonParsed',
                  commitment: 'confirmed',
                },
              ],
            })
          );

          ws.send(
            JSON.stringify({
              jsonrpc: '2.0',
              id: 2,
              method: 'accountSubscribe',
              params: [
                dogMint.toBase58(),
                {
                  encoding: 'jsonParsed',
                  commitment: 'confirmed',
                },
              ],
            })
          );
        };

        ws.onmessage = (event) => {
          const response = JSON.parse(event.data);
          // console.log('ATA WebSocket message:', response);

          if (response.result !== undefined) {
            // console.log('ATA subscription confirmed, id:', response.id);
            return;
          }

          if (response.method === 'accountNotification') {
            try {
              const accountData = response.params.result.value.data.parsed.info;
              if (accountData.tokenAmount) {
                const newBalance =
                  Number(accountData.tokenAmount.amount) / 1_000_000;
                // console.log('New wallet balance:', newBalance);
                setTokenCount(newBalance);
              }
            } catch (error) {
              console.error('Error parsing ATA update:', error);
            }
          }
        };

        return () => {
          ws.close();
        };
      }
    } catch (error) {
      console.error('Error fetching wallet data:', error);
    }
  };

  // Separate effects for total supply and wallet data
  useEffect(() => {
    let cleanupFn: (() => void) | undefined;
    fetchTotalSupply().then((cleanup) => {
      cleanupFn = cleanup;
    });
    return () => {
      if (cleanupFn) cleanupFn();
    };
  }, []); // Run once on mount

  useEffect(() => {
    let cleanupFn: (() => void) | undefined;
    fetchWalletData().then((cleanup) => {
      cleanupFn = cleanup;
    });
    return () => {
      if (cleanupFn) cleanupFn();
    };
  }, [wallet.publicKey]); // Run when wallet changes

  return (
    <div
      className="token-counter"
      style={{
        background: 'transparent',
        padding: '0 10px',
        height: 'auto',
        borderRadius: '4px',
        color: '#fffcee',
        fontSize: '17px',
        fontFamily: 'Arial, sans-serif',
        cursor: 'default',
        textAlign: 'left',
        marginTop: '15px',
      }}
    >
      <span>This dog's name is {DOG_NAME}</span>
      <br />
      <br />
      {!wallet.publicKey ? (
        <span>Your {TOKEN_SYMBOL} balance is ...</span>
      ) : tokenCount !== null ? (
        <span>
          Your {TOKEN_SYMBOL} balance is {tokenCount}
        </span>
      ) : (
        <span>Loading your {TOKEN_SYMBOL} balance...</span>
      )}
      <br />
      <br />
      <span>
        Total {TOKEN_SYMBOL} supply: {totalSupply}
      </span>
      <br />
      <br />
      {tokenCount !== null && totalSupply !== null && totalSupply > 0 ? (
        <span>
          You own {((tokenCount / totalSupply) * 100).toFixed(2)}% of the{' '}
          {TOKEN_SYMBOL} supply!
        </span>
      ) : (
        <span></span>
      )}
    </div>
  );
};
