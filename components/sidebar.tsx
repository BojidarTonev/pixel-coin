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

  // Handle wallet connection changes
  useEffect(() => {
    if (connected && publicKey) {
      toast.success(
        'Wallet Connected',
        `Connected to ${publicKey.toBase58().slice(0, 4)}...${publicKey.toBase58().slice(-4)}`
      );
    }
  }, [connected, publicKey]);

  useEffect(() => {
    onStateChange?.(isOpen);
  }, [isOpen, onStateChange]);

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  const handleWalletClick = useCallback(async () => {
    if (connected) {
      const loadingToastId = toast.loading('Disconnecting wallet...');
      try {
        await disconnect();
        toast.success('Wallet Disconnected', 'Your wallet has been disconnected');
      } catch (error) {
        toast.error(
          'Failed to disconnect',
          'Please try again or check your wallet'
        );
      }
    } else {
      setVisible(true);
    }
  }, [connected, disconnect, setVisible]);

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
            {connected && publicKey && isOpen ? (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs text-gray-400">
                  <span>Connected:</span>
                  <a
                    href={`https://explorer.solana.com/address/${publicKey.toBase58()}?cluster=devnet`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center hover:text-purple-300 transition-colors"
                  >
                    {formatWalletAddress(publicKey.toBase58())}
                    <ExternalLink className="w-3 h-3 ml-1" />
                  </a>
                </div>
                <Button
                  variant="outline"
                  size="default"
                  onClick={handleWalletClick}
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
                onClick={handleWalletClick}
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