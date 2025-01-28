import React, { useEffect, useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { Connection, LAMPORTS_PER_SOL } from '@solana/web3.js';

export function BalanceChecker() {
  const { publicKey, connected } = useWallet();
  const [balance, setBalance] = useState<number | null>(null);

  useEffect(() => {
    if (!connected || !publicKey) return;

    const connection = new Connection(process.env.NEXT_PUBLIC_SOLANA_RPC_URL!);
    
    const checkBalance = async () => {
      try {
        const bal = await connection.getBalance(publicKey);
        setBalance(bal / LAMPORTS_PER_SOL);
      } catch (error) {
        console.error('Error checking balance:', error);
      }
    };

    checkBalance();
    const interval = setInterval(checkBalance, 10000); // Check every 10s
    
    return () => clearInterval(interval);
  }, [connected, publicKey]);

  if (!connected || balance === null) return null;

  return (
    <div className="text-sm text-gray-300">
      Balance: {balance.toFixed(4)} SOL
      {balance < 0.05 && (
        <p className="text-red-400 text-xs mt-1">
          Low balance! Minting requires at least 0.05 SOL
        </p>
      )}
    </div>
  );
} 