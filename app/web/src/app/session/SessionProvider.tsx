// components/SessionProvider.tsx
// The SessionProvider component initializes the SessionKeyManager and provides it to its children via context.
// Wrap any component that needs access to the SessionKeyManager with this provider.

import { SessionWalletProvider, useSessionKeyManager } from '@magicblock-labs/gum-react-sdk';
import { AnchorWallet, useAnchorWallet, useConnection } from '@solana/wallet-adapter-react';
import React from 'react';

interface SessionProviderProps {
  children: React.ReactNode;
}

const SessionProvider: React.FC<SessionProviderProps> = ({ children }) => {
  const { connection } = useConnection();
  const anchorWallet = useAnchorWallet() as AnchorWallet;
  const cluster = "localnet"; // or "mainnet-beta", "testnet", "devnet"
  const sessionWallet = useSessionKeyManager(anchorWallet, connection, cluster);

  return (
    <SessionWalletProvider sessionWallet={sessionWallet}>
      {children}
    </SessionWalletProvider>
  );
};

export default SessionProvider;
