import React from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { DogCreation } from './pages/dog-creation';
import { Home } from './pages/home';
import { useWallet } from '@solana/wallet-adapter-react';

export function AppRoutes() {
  const { connected } = useWallet();

  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route 
        path="/create-dog" 
        element={connected ? <DogCreation /> : <Navigate to="/" replace />} 
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
