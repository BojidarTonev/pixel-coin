'use client';

import { useState } from 'react';
import { RootLayout } from '@/components/root-layout';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { Download, Search, Filter, Wallet, MessageSquare, Sparkles, Tag } from 'lucide-react';
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
import { useGetAllArtQuery } from '@/redux/services/art.service';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useAppSelector, type RootState } from '@/redux/store';
import { toast } from '@/hooks/use-toast';
import { useGetListingsQuery } from '@/redux/services/nft.service';

export interface ArtPiece {
  id: number;
  title: string;
  image_url: string;
  user_id: number;
  created_at: string;
  is_minted: boolean;
  minted_nft_address?: string;
  minted_token_uri?: string;
  creator_wallet?: string;
  owner_wallet?: string;
}

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
  const [viewMode, setViewMode] = useState<'my' | 'all'>('all');
  const [sortBy, setSortBy] = useState('recent');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPiece, setSelectedPiece] = useState<ArtPiece | null>(null);
  
  const appState = useAppSelector((state: RootState) => state.appState);
  const isUserLoggedIn = appState.isUserLoggedIn;
  const user = appState.user;
  const currentUserId = user?.id;

  // Fetch data based on view mode
  const { data: allArt = [], isLoading: isLoadingAll } = useGetAllArtQuery();
  const { data: marketplaceListings = [] } = useGetListingsQuery();

  // Get the appropriate art pieces based on view mode
  const artPieces = viewMode === 'my' && currentUserId 
    ? allArt.filter(piece => piece.user_id === currentUserId)
    : allArt;

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

    console.log('asd => ',filteredArt);

  const handleArtSelect = (art: ArtPiece) => {
    setSelectedPiece(art);
  };

  // Check if art piece is listed in marketplace
  const isArtListed = (artId: number) => {
    return marketplaceListings.some(listing => listing.art.id === artId && listing.status === 'active');
  };

  // Handle view listing click
  const handleViewListing = (title: string) => {
    router.push(`/marketplace?search=${encodeURIComponent(title)}`);
  };

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
            {isLoadingAll ? (
              <motion.div 
                variants={item}
                className="col-span-full text-center py-24"
              >
                <div className="animate-spin w-12 h-12 border-4 border-purple-500/20 border-t-purple-500 rounded-full mx-auto mb-4" />
                <p className="text-gray-400">Loading art pieces...</p>
              </motion.div>
            ) : viewMode === 'my' && !isUserLoggedIn ? (
              <motion.div
                variants={item}
                className="col-span-full text-center py-24"
              >
                <Wallet className="w-12 h-12 text-purple-400 mx-auto mb-6" />
                <h2 className="text-xl font-medium text-gray-200 mb-3">Connect Your Wallet</h2>
                <p className="text-sm text-gray-400 mb-6">
                  Connect your wallet to view your personal art collection
                </p>
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
                  onClick={() => handleArtSelect(piece)}
                >
                  <div className="relative aspect-square">
                    <Image
                      src={piece.image_url}
                      alt={piece.title}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                    <div className="absolute top-2 right-2 flex flex-col gap-2">
                      {piece.is_minted && (
                        <div className="flex items-center gap-1 bg-purple-500/20 px-2 py-1 rounded-full backdrop-blur-sm border border-purple-500/30">
                          <Sparkles className="h-3 w-3 text-purple-300" />
                          <span className="text-[10px] text-purple-300">NFT</span>
                        </div>
                      )}
                      {isArtListed(piece.id) && (
                        <div className="flex items-center gap-1 bg-green-500/20 px-2 py-1 rounded-full backdrop-blur-sm border border-green-500/30">
                          <Tag className="h-3 w-3 text-green-300" />
                          <span className="text-[10px] text-green-300">Listed</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    {currentUserId && piece.user_id === currentUserId && (
                      <>
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center gap-3">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={(e) => {
                              e.stopPropagation();
                              window.open(piece.image_url, '_blank');
                            }}
                            className="h-8 w-8 bg-gray-900/50 hover:bg-purple-500/20 text-gray-300 hover:text-purple-300 border border-gray-800 hover:border-purple-500/30"
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={(e) => {
                              e.stopPropagation();
                              router.push('/chat');
                            }}
                            className="h-8 w-8 bg-gray-900/50 hover:bg-purple-500/20 text-gray-300 hover:text-purple-300 border border-gray-800 hover:border-purple-500/30"
                          >
                            <MessageSquare className="h-4 w-4" />
                          </Button>
                        </div>
                        {!piece.is_minted && (
                          <div className="absolute bottom-12 left-0 right-0 flex justify-center">
                            <Button
                              variant="secondary"
                              onClick={(e) => {
                                e.stopPropagation();
                                toast({
                                  title: 'Preparing NFT',
                                  description: 'Starting the minting process...',
                                  variant: 'loading'
                                });
                                // TODO: Add NFT minting logic
                              }}
                              className="bg-purple-500/20 hover:bg-purple-500/30 text-purple-100 border border-purple-500/30 hover:border-purple-500/50"
                            >
                              <Sparkles className="h-4 w-4 mr-2" />
                              Mint as NFT
                            </Button>
                          </div>
                        )}
                      </>
                    )}
                    <div className="absolute bottom-0 left-0 right-0 p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-sm font-medium text-gray-100">{piece.title}</h3>
                        {isArtListed(piece.id) && (
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleViewListing(piece.title);
                            }}
                            className="h-7 bg-green-500/20 hover:bg-green-500/30 text-green-300 text-xs"
                          >
                            <Tag className="h-3 w-3 mr-1" />
                            View Listing
                          </Button>
                        )}
                      </div>
                      <div className="flex items-center justify-between">
                        <p className="text-xs text-gray-400">
                          {format(new Date(piece.created_at), 'MMM d, yyyy')}
                        </p>
                        <p className="text-xs text-purple-300/80">
                          {piece.creator_wallet ? 
                            `${piece.creator_wallet.slice(0, 4)}...${piece.creator_wallet.slice(-4)}` : 
                            'No wallet linked'
                          }
                        </p>
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
          art={selectedPiece}
          onClose={() => setSelectedPiece(null)}
        />
      </div>
    </RootLayout>
  );
} 