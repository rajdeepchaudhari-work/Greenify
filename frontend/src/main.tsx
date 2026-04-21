import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { WalletProvider } from './hooks/useWallet';
import { TxProvider } from './hooks/useTx';
import ErrorBoundary from './components/ErrorBoundary';
import './styles.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <WalletProvider>
        <TxProvider>
          <BrowserRouter>
            <App />
          </BrowserRouter>
        </TxProvider>
      </WalletProvider>
    </ErrorBoundary>
  </React.StrictMode>,
);
