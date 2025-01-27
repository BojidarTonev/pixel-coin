'use client';

import { useEffect, useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { customToast as toast } from '@/components/ui/toast';

export function WalletConnectionHandler() {
  const { connected, publicKey } = useWallet();
  const [previousConnectionState, setPreviousConnectionState] = useState(false);

  useEffect(() => {
    const checkWalletConnection = () => {
      const walletAddress = window.localStorage.getItem('walletAddress');
      const isCurrentlyLoggedIn = !!walletAddress;

      // Show toast only when connection state changes
      if (isCurrentlyLoggedIn && !previousConnectionState) {
        toast.success(
          'Wallet Connected',
          `Connected to ${walletAddress.slice(0, 4)}...${walletAddress.slice(-4)}`
        );
      } else if (!isCurrentlyLoggedIn && previousConnectionState) {
        toast.success('Wallet Disconnected');
      }

      setPreviousConnectionState(isCurrentlyLoggedIn);
    };

    // Check when component mounts and when wallet connection changes
    checkWalletConnection();

    // Set up event listener for storage changes
    window.addEventListener('storage', checkWalletConnection);

    return () => {
      window.removeEventListener('storage', checkWalletConnection);
    };
  }, [connected, publicKey, previousConnectionState]);

  return null; // This component doesn't render anything
} 