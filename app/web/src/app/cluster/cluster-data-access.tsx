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
  const endpoint = process.env.NX_REACT_APP_RPC_URL;

  if (!endpoint) {
    console.error('No RPC endpoint found - please configure');
    throw new Error('RPC endpoint not configured');
  }

  const connection = new Connection(endpoint, {
    commitment: 'confirmed',
    confirmTransactionInitialTimeout: 60000,
  });

  const value: ClusterProviderContext = {
    cluster: {
      endpoint: connection.rpcEndpoint,
      network: ClusterNetwork.Mainnet,
    },
  };

  return <Context.Provider value={value}>{children}</Context.Provider>;
}

export function useCluster() {
  return useContext(Context);
}
