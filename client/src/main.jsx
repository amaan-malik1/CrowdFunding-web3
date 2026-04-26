import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router } from 'react-router-dom';

import WalletAdapter from './components/WalletAdapter';
import { StateContextProvider } from './context';
import App from './App';
import './index.css';

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <Router>
    <WalletAdapter>
      <StateContextProvider>
        <App />
      </StateContextProvider>
    </WalletAdapter>
  </Router>
);
