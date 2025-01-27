'use client';

import { useState, useEffect } from 'react';
import { RootLayout } from '@/components/root-layout';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { Heart, MessageSquare, Share2, Download, Search, Calendar, Filter, Wallet } from 'lucide-react';
import { useWallet } from '@solana/wallet-adapter-react';
import { useWalletModal } from '@solana/wallet-adapter-react-ui';
import { customToast as toast } from '@/components/ui/toast';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { ArtDetailsModal } from '@/components/art-details-modal';
import { useGetAllArtQuery, useGetUserArtQuery } from '@/redux/services/art.service';
import { useRouter } from 'next/navigation';

interface ArtPiece {
  id: number;
  title: string;
  image_url: string;
  user_id: number;
  created_at: string;
}

const categories = [
  { value: 'all', label: 'All Categories' },
  { value: 'knights', label: 'Knights & Castles' },
  { value: 'fantasy', label: 'Medieval Fantasy' },
  { value: 'towns', label: 'Pixel Towns' },
];

const sortOptions = [
  { value: 'recent', label: 'Most Recent' },
  { value: 'oldest', label: 'Oldest First' },
];

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

export default function GalleryPage() {
  const router = useRouter();
  const [viewMode, setViewMode] = useState<'my' | 'all'>('my');
  const [category, setCategory] = useState('all');
  const [sortBy, setSortBy] = useState('recent');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPiece, setSelectedPiece] = useState<ArtPiece | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const { connected, publicKey } = useWallet();
  const { setVisible } = useWalletModal();
  const [previousConnectionState, setPreviousConnectionState] = useState(false);

  // Fetch data based on view mode
  const { data: allArt = [], isLoading: isLoadingAll } = useGetAllArtQuery();
  const { data: userArt = [], isLoading: isLoadingUser } = useGetUserArtQuery();

  // Check wallet connection status and show toasts
  useEffect(() => {
    const checkWalletConnection = () => {
      const walletAddress = window.localStorage.getItem('walletAddress');
      const isCurrentlyLoggedIn = !!walletAddress;
      setIsLoggedIn(isCurrentlyLoggedIn);

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

  const handleConnectWallet = () => {
    setVisible(true);
  };

  // Get the appropriate art pieces based on view mode
  const artPieces = viewMode === 'my' ? userArt : allArt;

  // Apply filters and sorting
  const filteredArt = artPieces
    .filter(piece => {
      if (searchQuery) {
        return piece.title.toLowerCase().includes(searchQuery.toLowerCase());
      }
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'recent') {
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      } else {
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      }
    });

  return (
    <RootLayout>
      <div className="min-h-screen bg-black/75 backdrop-blur-sm relative overflow-x-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/50" />
        
        <div className="container mx-auto px-8 py-12 relative z-10">
          {/* Header */}
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-16"
          >
            <h1 className="text-3xl font-medium text-gray-100 drop-shadow-lg mb-4">
              Pixel Art Gallery
            </h1>
            <p className="text-sm text-gray-300">
              Discover your creations and explore the world of pixel art
            </p>
          </motion.div>

          {/* Filters */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-xl p-6 mb-12"
          >
            <div className="flex flex-col md:flex-row gap-6">
              {/* View Mode */}
              <div className="flex rounded-lg overflow-hidden border border-gray-800">
                <Button
                  variant="ghost"
                  onClick={() => setViewMode('my')}
                  className={cn(
                    'rounded-none text-xs px-6 transition-all duration-300',
                    viewMode === 'my' 
                      ? 'bg-purple-500/20 text-purple-300 hover:bg-purple-500/30 border-purple-500/30' 
                      : 'text-gray-400 hover:bg-purple-500/10 hover:text-purple-300'
                  )}
                >
                  My Creations
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => setViewMode('all')}
                  className={cn(
                    'rounded-none text-xs px-6 transition-all duration-300',
                    viewMode === 'all' 
                      ? 'bg-purple-500/20 text-purple-300 hover:bg-purple-500/30 border-purple-500/30' 
                      : 'text-gray-400 hover:bg-purple-500/10 hover:text-purple-300'
                  )}
                >
                  All Creations
                </Button>
              </div>

              {/* Search */}
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                <input
                  type="text"
                  placeholder="Search by title..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 text-xs bg-gray-900/50 border border-gray-800 rounded-lg text-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500/30"
                />
              </div>

              {/* Sort */}
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[180px] text-xs bg-gray-900/50 border-gray-800 text-gray-300">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent className="bg-gray-900/95 border-gray-800">
                  {sortOptions.map((option) => (
                    <SelectItem 
                      key={option.value} 
                      value={option.value}
                      className="text-xs text-gray-300 focus:bg-purple-500/20 focus:text-purple-300"
                    >
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </motion.div>

          {/* Gallery Grid */}
          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          >
            {isLoadingAll || isLoadingUser ? (
              <motion.div 
                variants={item}
                className="col-span-full text-center py-24"
              >
                <div className="animate-spin w-12 h-12 border-4 border-purple-500/20 border-t-purple-500 rounded-full mx-auto mb-4" />
                <p className="text-gray-400">Loading art pieces...</p>
              </motion.div>
            ) : viewMode === 'my' && !isLoggedIn ? (
              <motion.div
                variants={item}
                className="col-span-full text-center py-24"
              >
                <Wallet className="w-12 h-12 text-purple-400 mx-auto mb-6" />
                <h2 className="text-xl font-medium text-gray-200 mb-3">Connect Your Wallet</h2>
                <p className="text-sm text-gray-400 mb-6">
                  Connect your wallet to view your personal art collection
                </p>
                <Button
                  onClick={handleConnectWallet}
                  className="bg-purple-500 hover:bg-purple-600 text-white shadow-lg shadow-purple-500/20"
                >
                  <Wallet className="w-4 h-4 mr-2" />
                  Connect Wallet
                </Button>
              </motion.div>
            ) : filteredArt.length === 0 ? (
              <motion.div 
                variants={item}
                className="col-span-full text-center py-24"
              >
                <Filter className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                <p className="text-gray-400 mb-6">No art pieces found</p>
                <Button 
                  variant="outline"
                  className="text-xs bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 border-purple-500/20 hover:border-purple-500/30"
                  onClick={() => router.push('/generate')}
                >
                  Generate New Art
                </Button>
              </motion.div>
            ) : (
              filteredArt.map((piece) => (
                <motion.div
                  key={piece.id}
                  variants={item}
                  className="group relative rounded-xl overflow-hidden bg-gray-900/50 backdrop-blur-sm border border-gray-800 hover:border-purple-500/20 transition-all duration-300 cursor-pointer"
                  onClick={() => setSelectedPiece(piece)}
                >
                  <img
                    src={piece.image_url}
                    alt={piece.title}
                    className="w-full aspect-square object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="absolute bottom-0 left-0 right-0 p-4">
                      <h3 className="text-sm font-medium text-gray-100 mb-2">{piece.title}</h3>
                      <div className="flex items-center justify-between">
                        <div className="text-xs text-gray-300">
                          {format(new Date(piece.created_at), 'MMM d, yyyy')}
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="secondary"
                            size="icon"
                            className="h-7 w-7 bg-gray-900/50 hover:bg-gray-900/70"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigator.share({
                                title: piece.title,
                                text: `Check out this pixel art: ${piece.title}`,
                                url: piece.image_url,
                              }).catch(console.error);
                            }}
                          >
                            <Share2 className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="secondary"
                            size="icon"
                            className="h-7 w-7 bg-gray-900/50 hover:bg-gray-900/70"
                            onClick={(e) => {
                              e.stopPropagation();
                              window.open(piece.image_url, '_blank');
                            }}
                          >
                            <Download className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </motion.div>
        </div>

        {/* Art Details Modal */}
        <ArtDetailsModal
          art={selectedPiece ? {
            id: selectedPiece.id.toString(),
            title: selectedPiece.title,
            imageUrl: selectedPiece.image_url,
            creator: `User ${selectedPiece.user_id}`,
            createdAt: new Date(selectedPiece.created_at),
            likes: 0,
            comments: 0,
            category: 'pixel-art'
          } : null}
          onClose={() => setSelectedPiece(null)}
        />
      </div>
    </RootLayout>
  );
} 