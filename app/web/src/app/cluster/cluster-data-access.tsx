'use client';
import React from 'react';
import { Connection } from '@solana/web3.js';
import { createContext, ReactNode, useContext } from 'react';

export enum ClusterNetwork {
  Mainnet = 'mainnet-beta',
  Testnet = 'testnet',
  Devnet = 'devnet',
  Custom = 'custom',
}

export interface Cluster {
  endpoint: string;
  wsEndpoint?: string; // Optional since devnet/localnet might not have WS
  network?: ClusterNetwork;
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
  const wsEndpoint = process.env.NX_HELIUS_WEBSOCKET;

  // console.log('Environment variables:', {
  //   endpoint,
  //   wsEndpoint,
  //   raw_env: process.env
  // });

  if (!endpoint) {
    console.error('No RPC endpoint found - please configure');
    throw new Error('RPC endpoint not configured');
  }

  // For localnet
  // const endpoint = 'http://localhost:8899';

  // for devnet
  // const endpoint = 'https://api.devnet.solana.com';

  if (!wsEndpoint) {
    console.warn('No WebSocket endpoint found - live updates will be disabled');
  }

  const connection = new Connection(endpoint, {
    commitment: 'confirmed',
    confirmTransactionInitialTimeout: 60000,
  });

  const value: ClusterProviderContext = {
    cluster: {
      endpoint: connection.rpcEndpoint,
      wsEndpoint: wsEndpoint, // Add WebSocket endpoint for mainnet

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
