'use client';

import { useState } from 'react';
import { RootLayout } from '@/components/root-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { motion } from 'framer-motion';
import { 
  Coins, 
  Wallet,
  Sparkles,
  Info,
  ExternalLink,
  Loader2
} from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { useWallet } from '@solana/wallet-adapter-react';
import { toast } from '@/hooks/use-toast';
import { useGetCreditsBalanceQuery, useGetTransactionsQuery, useDepositCreditsMutation } from '@/redux/services/credits.service';
import { useAppSelector } from '@/redux/store';

export default function CreditsPage() {
  const [depositAmount, setDepositAmount] = useState('');
  const [isDepositing, setIsDepositing] = useState(false);
  const { connected, publicKey } = useWallet();
  const { isUserLoggedIn } = useAppSelector(state => state.appState);

  // Fetch credits and transactions
  const { data: credits, isLoading: isLoadingCredits } = useGetCreditsBalanceQuery();
  const { data: transactions, isLoading: isLoadingTransactions } = useGetTransactionsQuery();
  const [depositCredits] = useDepositCreditsMutation();

  const handleDeposit = async () => {
    if (!depositAmount || !connected || !isUserLoggedIn) return;
    
    setIsDepositing(true);
    try {
      // Simulate transaction hash for now
      const transaction_hash = 'demo_' + Date.now().toString();
      await depositCredits({ 
        amount: parseInt(depositAmount), 
        transaction_hash 
      }).unwrap();
      
      toast({
        title: 'Deposit Successful',
        description: `Successfully deposited ${depositAmount} PIXEL tokens`
      });
      setDepositAmount('');
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (e: unknown) {
      toast({
        title: 'Deposit Failed',
        description: 'There was an error processing your deposit. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsDepositing(false);
    }
  };

  const formatWalletAddress = (address: string) => {
    return `${address.slice(0, 4)}...${address.slice(-4)}`;
  };

  return (
    <RootLayout>
      <div className="min-h-screen bg-black/75 backdrop-blur-sm relative">
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/50" />
        
        <div className="container mx-auto px-6 py-12 relative z-10">
          {/* Header */}
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-16"
          >
            <h1 className="text-3xl font-medium text-gray-100 drop-shadow-lg mb-4">
              Manage Your Credits
            </h1>
            <p className="text-sm text-gray-300 max-w-xl mx-auto">
              Use credits to unlock art generation and chat functionality
            </p>
          </motion.div>

          {isUserLoggedIn ? (
            <>
              {/* Credit Balance Card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-md mx-auto mb-12"
              >
                <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-xl p-8 text-center relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-b from-purple-500/5 to-transparent" />
                  <Coins className="w-12 h-12 text-purple-400 mx-auto mb-4" />
                  {isLoadingCredits ? (
                    <Loader2 className="w-6 h-6 animate-spin text-purple-400 mx-auto" />
                  ) : (
                    <>
                      <h2 className="text-4xl font-bold text-gray-100 mb-2">{credits?.credits_balance || 0} Credits</h2>
                      <p className="text-sm text-gray-400">Equivalent to {((credits?.credits_balance || 0) / 100).toFixed(2)} PIXEL</p>
                    </>
                  )}

                  {/* Wallet Info */}
                  <div className="mt-6 pt-6 border-t border-gray-800">
                    <div className="flex items-center justify-center gap-2 text-xs text-gray-400">
                      <span>Connected Wallet:</span>
                      <a
                        href={`https://explorer.solana.com/address/${publicKey?.toBase58()}?cluster=devnet`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center text-purple-300 hover:text-purple-200 transition-colors"
                      >
                        {formatWalletAddress(publicKey?.toBase58() || '')}
                        <ExternalLink className="w-3 h-3 ml-1" />
                      </a>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Deposit Section */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="max-w-md mx-auto mb-12"
              >
                <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-xl p-6">
                  <h3 className="text-sm font-medium text-gray-200 mb-4">Deposit Tokens</h3>
                  <div className="flex gap-4 mb-4">
                    <Input
                      type="number"
                      placeholder="Enter token amount..."
                      value={depositAmount}
                      onChange={(e) => setDepositAmount(e.target.value)}
                      className="flex-1 bg-gray-900/50 border-gray-800 text-gray-300 text-sm"
                    />
                    <Button
                      onClick={handleDeposit}
                      disabled={!depositAmount || isDepositing}
                      className="bg-purple-500 hover:bg-purple-600 text-white shadow-lg shadow-purple-500/20"
                    >
                      {isDepositing ? (
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        >
                          <Coins className="w-4 h-4" />
                        </motion.div>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4 mr-2" />
                          Deposit
                        </>
                      )}
                    </Button>
                  </div>
                  <p className="text-xs text-gray-500 text-center">
                    1 PIXEL = 100 Credits
                  </p>
                </div>
              </motion.div>

              {/* Credit Activity */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="max-w-2xl mx-auto mb-12"
              >
                <h3 className="text-sm font-medium text-gray-200 mb-4">Recent Activity</h3>
                <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-xl overflow-hidden">
                  {isLoadingTransactions ? (
                    <div className="flex items-center justify-center p-8">
                      <Loader2 className="w-6 h-6 animate-spin text-purple-400" />
                    </div>
                  ) : transactions && transactions.length > 0 ? (
                    transactions.map((transaction, index) => (
                      <div
                        key={transaction.id}
                        className={cn(
                          "flex items-center justify-between p-4",
                          index !== transactions.length - 1 && "border-b border-gray-800"
                        )}
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-8 h-8 rounded-full bg-purple-500/10 flex items-center justify-center">
                            {transaction.status === 'completed' ? (
                              <Sparkles className="w-4 h-4 text-purple-400" />
                            ) : transaction.status === 'pending' ? (
                              <Loader2 className="w-4 h-4 text-yellow-400 animate-spin" />
                            ) : (
                              <Info className="w-4 h-4 text-red-400" />
                            )}
                          </div>
                          <div>
                            <p className="text-sm text-gray-300">
                              {transaction.amount > 0 ? 'Deposit' : 'Usage'} - {transaction.status}
                            </p>
                            <p className="text-xs text-gray-500">
                              {format(new Date(transaction.created_at), 'MMM d, yyyy')}
                            </p>
                          </div>
                        </div>
                        <span className={cn(
                          "text-sm font-medium",
                          transaction.amount > 0 ? "text-green-400" : "text-red-400"
                        )}>
                          {transaction.amount > 0 ? '+' : ''}{transaction.amount} Credits
                        </span>
                      </div>
                    ))
                  ) : (
                    <div className="p-8 text-center">
                      <p className="text-sm text-gray-400">No recent activity</p>
                    </div>
                  )}
                </div>
              </motion.div>
            </>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-md mx-auto text-center"
            >
              <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-xl p-8">
                <Wallet className="w-12 h-12 text-purple-400 mx-auto mb-6" />
                <h2 className="text-xl font-medium text-gray-200 mb-3">Connect Your Wallet</h2>
                <p className="text-sm text-gray-400 mb-6">
                  Connect your wallet to view your credits and make deposits
                </p>
              </div>
            </motion.div>
          )}

          {/* How Credits Work */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="max-w-2xl mx-auto mb-12"
          >
            <h3 className="text-sm font-medium text-gray-200 my-4 mt-8">How Credits Work</h3>
            <Accordion type="single" collapsible className="space-y-2">
              <AccordionItem value="item-1" className="border-none">
                <AccordionTrigger className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-lg px-4 hover:no-underline">
                  <div className="flex items-center gap-3">
                    <Coins className="w-4 h-4 text-purple-400" />
                    <span className="text-sm text-gray-300">How to earn credits?</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-4 pt-2 text-sm text-gray-400">
                  Deposit PIXEL tokens to receive credits. Each token gives you 100 credits to use across the platform.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-2" className="border-none">
                <AccordionTrigger className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-lg px-4 hover:no-underline">
                  <div className="flex items-center gap-3">
                    <Sparkles className="w-4 h-4 text-purple-400" />
                    <span className="text-sm text-gray-300">What can I use credits for?</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-4 pt-2 text-sm text-gray-400">
                  Use credits to generate pixel art (2 credits) or chat with your creations (1 credit per message).
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-3" className="border-none">
                <AccordionTrigger className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-lg px-4 hover:no-underline">
                  <div className="flex items-center gap-3">
                    <Info className="w-4 h-4 text-purple-400" />
                    <span className="text-sm text-gray-300">What happens if I run out?</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-4 pt-2 text-sm text-gray-400">
                  When your credits run low, simply deposit more PIXEL tokens to continue using the platform&apos;s features.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </motion.div>

          {/* Footer */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-center text-xs text-gray-500"
          >
            <div className="flex justify-center gap-4 mb-2">
              <button className="hover:text-gray-300 transition-colors">Terms of Use</button>
              <span>•</span>
              <button className="hover:text-gray-300 transition-colors">Support</button>
            </div>
            <p>Powered by AI and Crypto – PixelForge</p>
          </motion.div>
        </div>
      </div>
    </RootLayout>
  );
} 