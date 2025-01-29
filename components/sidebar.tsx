'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  Home,
  Palette,
  Image,
  MessageSquare,
  CreditCard,
  Wallet,
  Map,
  ChevronLeft,
  ChevronRight,
  Tag,
  Loader2
} from 'lucide-react';
import { Button } from './ui/button';
import { useWallet } from '@solana/wallet-adapter-react';
import { useWalletModal } from '@solana/wallet-adapter-react-ui';
import { toast } from '@/hooks/use-toast';
import { useAuthenticateUserMutation } from '@/redux/services/user.service';
import { motion } from 'framer-motion';
import { useAppSelector } from '@/redux/store';
import { useDispatch } from 'react-redux';
import { setUserLoggedIn, setUserLoggedOut } from '@/redux/features/app-state-slice';

const sidebarItems = [
  { name: 'Home', href: '/', icon: Home },
  { name: 'Art Generation', href: '/generate', icon: Palette },
  { name: 'Art Gallery', href: '/gallery', icon: Image },
  { name: 'NFT Marketplace', href: '/marketplace', icon: Tag },
  { name: 'Chat with Art', href: '/chat', icon: MessageSquare },
  { name: 'Credits', href: '/credits', icon: CreditCard },
  { name: 'Roadmap', href: '/roadmap', icon: Map },
];

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

export function Sidebar({ isOpen, onToggle }: SidebarProps) {
  const pathname = usePathname();
  const dispatch = useDispatch();
  const { isUserLoggedIn } = useAppSelector(state => state.appState)
  const { connected, publicKey, disconnect } = useWallet();
  const { setVisible } = useWalletModal();
  const [authenticateUser] = useAuthenticateUserMutation();

  const handleConnectWallet = async () => {
    try {
      if (connected && publicKey) {
        toast({
          title: 'Connecting Wallet',
          description: (
            <div className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Authenticating your wallet...</span>
            </div>
          ),
          variant: 'loading'
        });

        const walletAddress = publicKey.toBase58();
        window.localStorage.setItem('walletAddress', walletAddress);

        const response = await authenticateUser({ 
          wallet_address: walletAddress 
        }).unwrap();

        dispatch(setUserLoggedIn(response.user));

        toast({
          title: response.isNewUser ? 'Account Created' : 'Wallet Connected',
          description: `${response.isNewUser ? 'Welcome! Your account has been created' : 'Welcome back!'} and connected to ${walletAddress.slice(0, 4)}...${walletAddress.slice(-4)}`,
          variant: 'default'
        });
      } else {
        // Show guiding toast for wallet connection
        toast({
          title: 'Connect Wallet',
          description: 'Please select a wallet and approve the connection request.',
          variant: 'loading'
        });
        // Open wallet modal
        setVisible(true);
      }
    } catch (error) {
      console.error('Authentication error:', error);
      window.localStorage.removeItem('walletAddress');
      await disconnect();
      dispatch(setUserLoggedOut());
      
      toast({
        title: 'Authentication Failed',
        description: 'Failed to authenticate with wallet. Please try again.',
        variant: 'destructive'
      });
    }
  };

  const handleDisconnectWallet = async () => {
    try {
      await disconnect();
      window.localStorage.removeItem('walletAddress');
      dispatch(setUserLoggedOut());
      toast({
        title: 'Wallet Disconnected',
        description: 'Your wallet has been disconnected.',
        variant: 'default'
      });
    } catch {
      toast({
        title: 'Disconnection Failed',
        description: 'Failed to disconnect wallet. Please try again.',
        variant: 'destructive'
      });
    }
  };

  const formatWalletAddress = (address: string) => {
    return `${address.slice(0, 4)}...${address.slice(-4)}`;
  };

  return (
    <motion.div
      className={cn(
        "fixed top-0 left-0 h-screen bg-gray-900/50 backdrop-blur-md border-r border-gray-800 transition-all duration-300 z-50",
        isOpen ? "w-[240px]" : "w-[80px]"
      )}
      initial={false}
    >
      <div className="flex flex-col h-full">
        <div className="p-6 flex items-center justify-between">
          {isOpen && (
            <motion.h1
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-lg font-medium text-gray-100"
            >
              PixelCoin
            </motion.h1>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggle}
            className={cn(
              "h-8 w-8 bg-gray-900/50 hover:bg-purple-500/20 text-gray-400 hover:text-purple-300 border border-gray-800 hover:border-purple-500/30 transition-all duration-300",
              !isOpen && "mx-auto"
            )}
          >
            {isOpen ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </Button>
        </div>

        <nav className="flex-1 px-3 space-y-1">
          {sidebarItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link key={item.href} href={item.href}>
                <span className={cn(
                  "flex items-center transition-colors duration-200 rounded-lg text-sm my-2",
                  pathname === item.href
                    ? "bg-purple-500/20 text-purple-300"
                    : "text-gray-400 hover:text-gray-300 hover:bg-gray-800/50",
                  isOpen ? "px-3 py-2 gap-3" : "p-2 justify-center"
                )}>
                  <Icon className="h-4 w-4" />
                  {isOpen && <span>{item.name}</span>}
                </span>
              </Link>
            );
          })}
        </nav>

        {/* Wallet Connection */}
        <div className={cn(
          "p-4 mt-auto border-t border-gray-800",
          !isOpen && "p-2"
        )}>
          {isUserLoggedIn ? (
            <div className="space-y-2">
              {isOpen && (
                <div className="flex items-center justify-between text-xs text-gray-400">
                  <span>Connected:</span>
                  {publicKey && (
                    <span className="text-purple-300">{formatWalletAddress(publicKey.toBase58())}</span>
                  )}
                </div>
              )}
              <Button
                variant="outline"
                size={isOpen ? "default" : "icon"}
                onClick={handleDisconnectWallet}
                className={cn(
                  "w-full text-xs bg-purple-500/10 hover:bg-purple-500/30 text-purple-300 hover:text-purple-100 border-purple-500/20 hover:border-purple-500/40 transition-all duration-300",
                  !isOpen && "h-10 w-10 p-0 mx-auto"
                )}
              >
                <Wallet className={cn(
                  "h-3 w-3",
                  isOpen ? "mr-2" : "h-4 w-4"
                )} />
                {isOpen && "Disconnect"}
              </Button>
            </div>
          ) : (
            <Button
              variant="outline"
              size={isOpen ? "default" : "icon"}
              onClick={handleConnectWallet}
              className={cn(
                "w-full text-xs bg-purple-500/10 hover:bg-purple-500/30 text-purple-300 hover:text-purple-100 border-purple-500/20 hover:border-purple-500/40 transition-all duration-300",
                !isOpen && "h-10 w-10 p-0 mx-auto"
              )}
            >
              <Wallet className={cn(
                "h-3 w-3",
                isOpen ? "mr-2" : "h-4 w-4"
              )} />
              {isOpen && "Connect Wallet"}
            </Button>
          )}
        </div>
      </div>
    </motion.div>
  );
} 