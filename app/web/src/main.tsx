import { StrictMode } from 'react';
import * as ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import './polyfills';
import React from 'react';
import { SpeedInsights } from "@vercel/speed-insights/react";

import { App } from './app/app';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <StrictMode>
    <SpeedInsights />
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>
);
