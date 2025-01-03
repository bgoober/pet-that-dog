'use client';
import React from 'react';

import { Connection } from '@solana/web3.js';

import { createContext, ReactNode, useContext } from 'react';

export interface Cluster {
  endpoint: string;
  network?: ClusterNetwork;
}

export enum ClusterNetwork {
  Mainnet = 'mainnet-beta',
  Testnet = 'testnet',
  Devnet = 'devnet',
  Custom = 'custom',
}

export interface ClusterProviderContext {
  cluster: Cluster;
}

const Context = createContext<ClusterProviderContext>(
  {} as ClusterProviderContext
);

export function ClusterProvider({ children }: { children: ReactNode }) {
  // For mainnet
  const endpoint = process.env.NX_REACT_APP_RPC_URL;
  if (!endpoint) {
    console.error('No RPC endpoint found - please configure');
    throw new Error('RPC endpoint not configured');
  }

  // For localnet
  // const endpoint = 'http://localhost:8899';

  // for devnet
  // const endpoint = 'https://api.devnet.solana.com';

  const connection = new Connection(endpoint, {
    commitment: 'confirmed',
    confirmTransactionInitialTimeout: 60000,
  });

  const value: ClusterProviderContext = {
    cluster: {
      endpoint: connection.rpcEndpoint,
      // For mainnet use
      network: ClusterNetwork.Mainnet,

      // for localnet
      // network: ClusterNetwork.Custom,

      // for devnet
      // network: ClusterNetwork.Devnet,  
    },
  };

  return <Context.Provider value={value}>{children}</Context.Provider>;
}

export function useCluster() {
  return useContext(Context);
}
