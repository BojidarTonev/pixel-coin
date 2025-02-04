'use client';

import { useMemo } from 'react';
import { Provider } from 'react-redux';
import { store } from '@/redux/store';
import {
  ConnectionProvider,
  WalletProvider
} from '@solana/wallet-adapter-react';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { PhantomWalletAdapter } from '@solana/wallet-adapter-phantom';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { clusterApiUrl } from '@solana/web3.js';

// Import wallet adapter CSS
// eslint-disable-next-line @typescript-eslint/no-require-imports
require('@solana/wallet-adapter-react-ui/styles.css');

export function Providers({ children }: { children: React.ReactNode }) {
  // Change from devnet to mainnet
  const network = WalletAdapterNetwork.Devnet
  const endpoint = useMemo(() => clusterApiUrl(network), [network]);
  const wallets = useMemo(() => [new PhantomWalletAdapter()], []);

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          <Provider store={store}>
            {children}
          </Provider>
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
} 