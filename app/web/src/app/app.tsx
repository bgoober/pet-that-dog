import React from 'react';
import { AppLayout } from './app-layout';
import { AppRoutes } from './app-routes';
import { ClusterProvider } from './cluster/cluster-data-access';
import { SolanaProvider } from './solana/solana-provider';
import SessionProvider from './session/SessionProvider'; 

export function App() {
  return (
    <ClusterProvider>
      <SolanaProvider>
      <SessionProvider>
          <AppLayout>
            <AppRoutes />
          </AppLayout>
        </SessionProvider>
      </SolanaProvider>
    </ClusterProvider>
  );
}
