'use client';

import { useState, useEffect, useRef } from 'react';
import { RootLayout } from '@/components/root-layout';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { Download, Search, Filter, MessageSquare, Sparkles, Tag, Loader2 } from 'lucide-react';
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
import { useGetAllArtQuery, type Art } from '@/redux/services/art.service';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useAppSelector, type RootState } from '@/redux/store';
import { toast } from '@/hooks/use-toast';
import { useGetListingsQuery, useMintNFTMutation } from '@/redux/services/nft.service';
import { useWallet } from "@solana/wallet-adapter-react";
import { MintSuccessModal } from '@/components/mint-success-modal';

export type ArtPiece = Art;

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

const ITEMS_PER_PAGE = 12;

export default function GalleryPage() {
  const router = useRouter();
  const [viewMode, setViewMode] = useState<'my' | 'all'>('all');
  const [sortBy, setSortBy] = useState('recent');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPiece, setSelectedPiece] = useState<ArtPiece | null>(null);
  const [mintingArtId, setMintingArtId] = useState<number | null>(null);
  const [mintedNFT, setMintedNFT] = useState<{
    title: string;
    image_url: string;
    minted_nft_address: string;
  } | null>(null);
  const [page, setPage] = useState(1);
  const loadingRef = useRef<HTMLDivElement>(null);
  
  const appState = useAppSelector((state: RootState) => state.appState);
  const user = appState.user;
  const currentUserId = user?.id;
  const isUserLoggedIn = !!user;

  // Fetch data with pagination
  const { 
    data: artData, 
    isLoading: isLoadingAll,
    isFetching: isFetchingMore,
    refetch: refetchArt 
  } = useGetAllArtQuery({ 
    page, 
    limit: ITEMS_PER_PAGE 
  }, {
    // Disable automatic re-fetching when window regains focus
    refetchOnFocus: false,
    // Merge the new data with existing data
    serializeQueryArgs: ({ endpointName }) => {
      return endpointName;
    },
    merge: (currentCache, newItems) => {
      if (!currentCache) return newItems;
      return {
        ...newItems,
        data: [...currentCache.data, ...newItems.data],
      };
    },
    forceRefetch({ currentArg, previousArg }) {
      return currentArg !== previousArg;
    },
  });

  const { data: marketplaceListings = [] } = useGetListingsQuery();

  // Intersection Observer for infinite scrolling
  useEffect(() => {
    if (!artData?.hasMore || isFetchingMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setPage((prev) => prev + 1);
        }
      },
      { threshold: 0.1 }
    );

    if (loadingRef.current) {
      observer.observe(loadingRef.current);
    }

    return () => observer.disconnect();
  }, [artData?.hasMore, isFetchingMore]);

  // Get the appropriate art pieces based on view mode
  const artPieces = viewMode === 'my' && currentUserId && artData?.data
    ? artData.data.filter(piece => piece.user_id === currentUserId)
    : artData?.data || [];

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

  const [mintNFT] = useMintNFTMutation();
  const wallet = useWallet();

  const handleMintNFT = async (e: React.MouseEvent, piece: ArtPiece) => {
    e.stopPropagation();
    
    if (!wallet.connected || !wallet.publicKey) {
      toast({
        title: 'Wallet Not Connected',
        description: 'Please connect your wallet to mint NFTs.',
        variant: 'destructive'
      });
      return;
    }

    try {
      setMintingArtId(piece.id);
      toast({
        title: 'Minting NFT',
        description: 'Please approve the transaction in your wallet...',
        variant: 'loading'
      });

      const result = await mintNFT({ 
        artId: piece.id,
        wallet: {
          ...wallet,
          publicKey: wallet.publicKey,
          signTransaction: wallet.signTransaction,
          signAllTransactions: wallet.signAllTransactions,
        }
      }).unwrap();

      console.log('Minting response:', result);

      // Immediately refetch the data after successful minting to get the updated NFT address
      const refetchResult = await refetchArt();
      
      // Get the updated art piece with the NFT address
      const updatedArtPieces = refetchResult.data?.data || [];
      const updatedArt = updatedArtPieces.find(art => art.id === piece.id);
      
      if (updatedArt?.minted_nft_address) {
        setMintedNFT({
          title: updatedArt.title,
          image_url: updatedArt.image_url,
          minted_nft_address: updatedArt.minted_nft_address
        });

        // Clear the loading toast
        toast({
          title: 'NFT Minted Successfully',
          description: 'Your artwork has been minted as an NFT!',
          variant: 'default'
        });
      } else {
        console.error('NFT minted but address not yet available. Initial response:', result, 'Updated art:', updatedArt);
        // Still show success but with a note about the address
        setMintedNFT({
          title: result.art.title,
          image_url: result.art.image_url,
          minted_nft_address: 'Address will be available shortly...'
        });

        toast({
          title: 'NFT Minted Successfully',
          description: 'Your NFT address will be available shortly.',
          variant: 'default'
        });
      }
    } catch (err: unknown) {
      console.error('Minting error:', err);
      
      const error = err as { data?: { message?: string } };
      const errorMessage = error?.data?.message?.includes('insufficient funds')
        ? 'Insufficient SOL balance. Please add more SOL to your wallet.'
        : error?.data?.message || 'Failed to mint NFT. Please try again.';
      
      toast({
        title: 'Minting Failed',
        description: errorMessage,
        variant: 'destructive'
      });
    } finally {
      setMintingArtId(null);
    }
  };

  const handleSuccessModalClose = () => {
    setMintedNFT(null);
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
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          >
            {isLoadingAll && page === 1 ? (
              // Initial loading state
              Array.from({ length: 8 }).map((_, index) => (
                <motion.div
                  key={index}
                  variants={item}
                  className="aspect-square rounded-xl bg-gray-900/50 backdrop-blur-sm border border-gray-800 animate-pulse"
                />
              ))
            ) : !artData?.data || (filteredArt.length === 0 && page === 1) ? (
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
              <>
                {/* Art Grid Items */}
                {filteredArt.map((piece) => (
                  <motion.div
                    key={piece.id}
                    variants={item}
                    className={cn(
                      "group relative rounded-xl overflow-hidden bg-gray-900/50 backdrop-blur-sm border border-gray-800 hover:border-purple-500/20 transition-all duration-300 cursor-pointer",
                      mintingArtId === piece.id && "border-purple-500/20"
                    )}
                    onClick={() => handleArtSelect(piece)}
                  >
                    <div className="relative aspect-square">
                      <Image
                        src={piece.image_url}
                        alt={piece.title}
                        fill
                        className={cn(
                          "object-cover",
                          mintingArtId === piece.id && "opacity-50 blur-sm transition-all duration-300"
                        )}
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
                    <div className={cn(
                      "absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300",
                      mintingArtId === piece.id && "opacity-100"
                    )}>
                      {mintingArtId === piece.id ? (
                        // Minting State
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                          <Loader2 className="h-8 w-8 animate-spin text-purple-400 mb-3" />
                          <p className="text-sm text-purple-200 mb-2">Minting NFT</p>
                          <p className="text-xs text-purple-200/70 px-4 text-center">{piece.title}</p>
                        </div>
                      ) : (
                        // Normal State
                        <>
                          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center gap-3">
                            {currentUserId && piece.user_id === currentUserId && (
                              <>
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
                                {!piece.is_minted && (
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={(e) => handleMintNFT(e, piece)}
                                    disabled={mintingArtId === piece.id}
                                    className="h-8 w-8 bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 hover:text-purple-200 border border-purple-500/30 hover:border-purple-500/50 disabled:opacity-50 disabled:cursor-not-allowed"
                                  >
                                    <Sparkles className="h-4 w-4" />
                                  </Button>
                                )}
                              </>
                            )}
                            {isArtListed(piece.id) && (
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleViewListing(piece.title);
                                }}
                                className="h-8 w-8 bg-green-500/20 hover:bg-green-500/30 text-green-300 hover:text-green-200 border border-green-500/30 hover:border-green-500/50"
                              >
                                <Tag className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                          <div className="absolute bottom-0 left-0 right-0 p-4">
                            <div className="flex items-center justify-between mb-2">
                              <h3 className="text-sm font-medium text-gray-100">{piece.title}</h3>
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
                        </>
                      )}
                    </div>
                  </motion.div>
                ))}

                {/* Loading More Indicator */}
                {artData?.hasMore && (
                  <div 
                    ref={loadingRef} 
                    className="col-span-full flex justify-center py-8"
                  >
                    {isFetchingMore && (
                      <div className="flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin text-purple-400" />
                        <span className="text-sm text-purple-300">Loading more art...</span>
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </motion.div>
        </div>

        {/* Success Modal */}
        <MintSuccessModal
          isOpen={!!mintedNFT}
          onClose={handleSuccessModalClose}
          nftData={mintedNFT}
        />

        {/* Art Details Modal */}
        <ArtDetailsModal
          art={selectedPiece}
          onClose={() => setSelectedPiece(null)}
        />
      </div>
    </RootLayout>
  );
} 