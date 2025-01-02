'use client';
import React from 'react';

import { clusterApiUrl } from '@solana/web3.js';

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
  const value: ClusterProviderContext = {
    // cluster: { endpoint: clusterApiUrl('devnet') },
    // cluster: { endpoint: 'http://localhost:8899', network: ClusterNetwork.Custom },
    cluster: { endpoint: clusterApiUrl('mainnet-beta') },
  };
  return <Context.Provider value={value}>{children}</Context.Provider>;
}

export function useCluster() {
  return useContext(Context);
}
