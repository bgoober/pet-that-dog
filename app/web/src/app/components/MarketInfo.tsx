import React, { useEffect, useState } from 'react';
import { PublicKey } from '@solana/web3.js';
import { useConnection } from '@solana/wallet-adapter-react';

const POOL_ID = new PublicKey("72YfqMUzYWx5Y2GSNPkuuZ5Vkm3HHL1hj9cP9xbMXi1c");
const MAXIMILIAN_MINT = new PublicKey("DwbAbiDmZLFHUsKhLKBioTWzhmKVR7HQdH51L8r84iA1");

export const MarketInfo: React.FC = () => {
  const { connection } = useConnection();
  const [marketCap, setMarketCap] = useState<number>(0);
  const [price, setPrice] = useState<number>(0);
  const [supply, setSupply] = useState<number>(0);

  useEffect(() => {
    let subscriptionId: number | undefined;

    const setupSubscription = async () => {
      try {
        // Get token supply
        const tokenSupply = await connection.getTokenSupply(MAXIMILIAN_MINT);
        console.log('Initial supply:', tokenSupply);
        
        // Set supply immediately after getting it
        const currentSupply = tokenSupply.value.uiAmount ?? 0;
        setSupply(currentSupply);

        // Get price from Meteora vault API
        const vaultResponse = await fetch(
          `https://stake-for-fee-api.meteora.ag/vault/filter_vault?pool_address=${POOL_ID.toString()}`,
          {
            mode: 'no-cors',
            method: 'GET',
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json',
            }
          }
        );

        if (!vaultResponse.ok) {
          console.error('Vault fetch failed:', await vaultResponse.text());
          return;
        }

        const vaultData = await vaultResponse.json();
        console.log('Vault data:', vaultData);

        // The response should be an array of vaults, no need to find
        const currentPrice = vaultData?.[0]?.price ?? 0;
        const cap = currentSupply * currentPrice;

        setPrice(currentPrice);
        setMarketCap(cap);

        // Set up WebSocket subscription
        subscriptionId = connection.onAccountChange(
          MAXIMILIAN_MINT,
          async (account) => {
            try {
              const newSupply = await connection.getTokenSupply(MAXIMILIAN_MINT);
              setSupply(newSupply.value.uiAmount ?? 0);
            } catch (error) {
              console.error('Error updating supply:', error);
            }
          },
          'confirmed'
        );

      } catch (error) {
        console.error('Error setting up subscription:', error);
      }
    };

    setupSubscription().catch(console.error);

    return () => {
      if (subscriptionId) {
        connection.removeAccountChangeListener(subscriptionId);
      }
    };
  }, [connection]);

  return (
    <div style={{
      backgroundColor: '#111827',
      padding: '20px',
      borderRadius: '10px',
      color: '#14F195'
    }}>
      <h3>MAXIMILIAN Market Info</h3>
      <div>Price: {price.toFixed(8)} SOL</div>
      <div>Market Cap: {marketCap.toFixed(2)} SOL</div>
      <div>Supply: {supply.toLocaleString()}</div>
    </div>
  );
}; 