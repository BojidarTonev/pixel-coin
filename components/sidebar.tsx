import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  Home,
  Palette,
  Image,
  MessageSquare,
  CreditCard,
  Menu,
  X,
  Wallet,
  ExternalLink,
  Map
} from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';
import { Button } from './ui/button';
import { useWallet } from '@solana/wallet-adapter-react';
import { useWalletModal } from '@solana/wallet-adapter-react-ui';
import { customToast as toast } from '@/components/ui/toast';
import { useAuthenticateUserMutation } from '@/redux/services/user.service';
import { Coins } from 'lucide-react';

const sidebarItems = [
  { name: 'Home', href: '/', icon: Home },
  { name: 'Art Generation', href: '/generate', icon: Palette },
  { name: 'Art Gallery', href: '/gallery', icon: Image },
  { name: 'Chat with Art', href: '/chat', icon: MessageSquare },
  { name: 'Credits', href: '/credits', icon: CreditCard },
  { name: 'Roadmap', href: '/roadmap', icon: Map },
];

interface SidebarProps {
  onStateChange?: (isOpen: boolean) => void;
}

export function Sidebar({ onStateChange }: SidebarProps) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(true);
  const { connected, publicKey, disconnect } = useWallet();
  const { setVisible } = useWalletModal();
  const [authenticateUser] = useAuthenticateUserMutation();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [previousConnectionState, setPreviousConnectionState] = useState(false);

  // Check localStorage on mount and when connection state changes
  useEffect(() => {
    const checkWalletConnection = () => {
      const walletAddress = window.localStorage.getItem('walletAddress');
      setIsLoggedIn(!!walletAddress);
    };

    // Initial check
    checkWalletConnection();

    // Set up event listener for storage changes
    window.addEventListener('storage', checkWalletConnection);

    return () => {
      window.removeEventListener('storage', checkWalletConnection);
    };
  }, []);

  // Handle wallet connection changes
  useEffect(() => {
    const handleConnection = async () => {
      if (connected && publicKey) {
        const walletAddress = publicKey.toBase58();
        try {
          // Store wallet address in localStorage
          window.localStorage.setItem('walletAddress', walletAddress);
          setIsLoggedIn(true);

          // Try to authenticate user with wallet address
          const response = await authenticateUser({ 
            wallet_address: walletAddress 
          }).unwrap();

          // Show appropriate toast message
          if (response.isNewUser) {
            toast.success(
              'Account Created',
              `Welcome! Your account has been created and connected to ${walletAddress.slice(0, 4)}...${walletAddress.slice(-4)}`
            );
          } else if (!previousConnectionState) {
            // Only show welcome back message when newly connected
            toast.success(
              'Wallet Connected',
              `Welcome back! Connected to ${walletAddress.slice(0, 4)}...${walletAddress.slice(-4)}`
            );
          }
        } catch (error) {
          console.error('Authentication error:', error);
          toast.error(
            'Authentication Failed',
            'Failed to authenticate with wallet. Please try again.'
          );
          // Remove wallet address from localStorage
          window.localStorage.removeItem('walletAddress');
          setIsLoggedIn(false);
          // Disconnect wallet if authentication fails
          await disconnect();
        }
      } else if (!connected && previousConnectionState) {
        // Only show disconnection toast when actually disconnecting
        window.localStorage.removeItem('walletAddress');
        setIsLoggedIn(false);
        toast.success('Wallet Disconnected');
      }

      setPreviousConnectionState(connected);
    };

    handleConnection();
  }, [connected, publicKey, previousConnectionState, authenticateUser, disconnect]);

  useEffect(() => {
    onStateChange?.(isOpen);
  }, [isOpen, onStateChange]);

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  const handleConnectWallet = () => {
    setVisible(true);
  };

  const handleDisconnectWallet = async () => {
    try {
      await disconnect();
      window.localStorage.removeItem('walletAddress');
      setIsLoggedIn(false);
    } catch {
      toast.error(
        'Disconnection Failed',
        'Failed to disconnect wallet. Please try again.'
      );
    }
  };

  const formatWalletAddress = (address: string) => {
    return `${address.slice(0, 4)}...${address.slice(-4)}`;
  };

  return (
    <>
      <Button
        size="icon"
        variant="ghost"
        onClick={toggleSidebar}
        className={cn(
          "fixed top-4 z-50 transition-all duration-300",
          isOpen ? "left-52" : "left-16"
        )}
      >
        {isOpen ? (
          <X className="h-4 w-4 text-gray-200" />
        ) : (
          <Menu className="h-4 w-4 text-gray-200" />
        )}
      </Button>
      <div className={cn(
        "fixed left-0 top-0 h-full bg-black/60 backdrop-blur-md border-r border-gray-800 transition-all duration-300 z-40",
        isOpen ? "w-64" : "w-20"
      )}>
        <div className="flex flex-col h-full">
          <div className={cn(
            "flex items-center px-6 py-4",
            !isOpen && "justify-center px-4"
          )}>
            {isOpen && <span className="text-xl font-medium text-gray-200">Pixel Art</span>}
          </div>
          
          <nav className={cn(
            "flex-1 px-4 space-y-2",
            !isOpen && "px-2"
          )}>
            {sidebarItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'flex items-center px-4 py-2.5 rounded-lg transition-all duration-200 text-sm relative overflow-hidden',
                    'hover:bg-gray-800/50',
                    isOpen ? 'space-x-3' : 'justify-center',
                    isActive
                      ? 'bg-purple-500/20 text-purple-300 border-l-2 border-purple-400'
                      : 'text-gray-400 hover:text-gray-200'
                  )}
                >
                  <Icon className="w-4 h-4" />
                  {isOpen && <span>{item.name}</span>}
                  {isActive && (
                    <div className="absolute inset-0 bg-purple-400/10 animate-pulse" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Wallet Connection */}
          <div className={cn(
            "p-4 mt-auto border-t border-gray-800",
            !isOpen && "p-2"
          )}>
            {isLoggedIn ? (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs text-gray-400">
                  <span>Connected:</span>
                  {publicKey && (
                    <span className="text-purple-300">{formatWalletAddress(publicKey.toBase58())}</span>
                  )}
                </div>
                <Button
                  variant="outline"
                  size="default"
                  onClick={handleDisconnectWallet}
                  className="w-full text-xs bg-purple-500/10 hover:bg-purple-500/30 text-purple-300 hover:text-purple-100 border-purple-500/20 hover:border-purple-500/40 transition-all duration-300"
                >
                  <Wallet className="h-3 w-3 mr-2" />
                  Disconnect
                </Button>
              </div>
            ) : (
              <Button
                variant="outline"
                size={isOpen ? "default" : "icon"}
                onClick={handleConnectWallet}
                className={cn(
                  "w-full text-xs bg-purple-500/10 hover:bg-purple-500/30 text-purple-300 hover:text-purple-100 border-purple-500/20 hover:border-purple-500/40 transition-all duration-300",
                  !isOpen && "h-10 w-10 p-0"
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
      </div>
    </>
  );
} 