/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState } from 'react';
import { RootLayout } from '@/components/root-layout';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { Filter, Wallet, Tag, Sparkles, Plus, ExternalLink } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { format } from 'date-fns';
import { useGetUserArtQuery } from '@/redux/services/art.service';
import Image from 'next/image';
import { useAppSelector } from '@/redux/store';
import { cn } from '@/lib/utils';
import { NFTListingDialog } from '@/components/nft-listing-dialog';
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { PurchaseSuccessModal } from '@/components/purchase-success-modal';
import { useWallet } from "@solana/wallet-adapter-react";
import { useExecutePurchaseMutation, useCreateListingMutation, useGetAllListingsQuery } from '@/redux/services/auctionHouse.service';
import type { AuctionHouseListing } from '@/redux/services/auctionHouse.service';

const sortOptions = [
  { value: 'recent', label: 'Most Recent' },
  { value: 'price-low', label: 'Price: Low to High' },
  { value: 'price-high', label: 'Price: High to Low' },
];

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

interface ListingDetailsModalProps {
  listing: AuctionHouseListing | null;
  onClose: () => void;
  onPurchase: (listing: AuctionHouseListing) => void;
  isOwner: boolean;
  isLoggedIn: boolean;
}

const ListingDetailsModal: React.FC<ListingDetailsModalProps> = ({
  listing,
  onClose,
  onPurchase,
  isOwner,
  isLoggedIn
}) => {
  const [isConfirmingPurchase, setIsConfirmingPurchase] = useState(false);

  if (!listing) return null;

  const handlePurchaseClick = () => {
    setIsConfirmingPurchase(true);
  };

  const handleConfirmPurchase = () => {
    onPurchase(listing);
    setIsConfirmingPurchase(false);
  };

  return (
    <Dialog open={!!listing} onOpenChange={() => onClose()}>
      <DialogContent className="bg-gray-900/95 border-gray-800 p-0 max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="relative flex-1 overflow-y-auto">
          <div className="relative aspect-square">
            <Image
              src={listing.uri}
              alt={listing.name}
              fill
              className="object-cover"
              unoptimized
            />
          </div>
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-medium text-gray-100">{listing.name}</h2>
              <div className="flex items-center gap-2 bg-purple-500/20 px-3 py-1.5 rounded-lg">
                <Tag className="h-4 w-4 text-purple-300" />
                <span className="text-sm text-purple-300">{listing.price} SOL</span>
              </div>
            </div>

            <div className="space-y-4 mb-6">
              <div className="flex items-center justify-between py-2 border-b border-gray-800">
                <span className="text-sm text-gray-400">Listed On</span>
                <span className="text-sm text-gray-200">
                  {format(new Date(listing.createdAt), 'MMMM d, yyyy')}
                </span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-gray-800">
                <span className="text-sm text-gray-400">Seller</span>
                <a
                  href={`https://explorer.solana.com/address/${listing.seller}?cluster=devnet`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-purple-300 hover:text-purple-200 flex items-center gap-1"
                >
                  {listing.seller.slice(0, 4)}...{listing.seller.slice(-4)}
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-gray-800">
                <span className="text-sm text-gray-400">Mint address</span>
                <a
                  href={`https://explorer.solana.com/address/${listing.mintAddress}?cluster=devnet`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-purple-300 hover:text-purple-200 flex items-center gap-1"
                >
                  {listing.mintAddress.slice(0, 4)}...{listing.mintAddress.slice(-4)}
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            </div>

            {!isOwner && isLoggedIn && (
              <div className="flex gap-4 sticky bottom-0 bg-gray-900/95 py-4 border-t border-gray-800">
                <Button
                  className="flex-1 bg-gray-800 hover:bg-gray-700 text-gray-300"
                  onClick={onClose}
                >
                  Cancel
                </Button>
                <Button
                  className="flex-1 bg-purple-500 hover:bg-purple-600 text-white"
                  onClick={handlePurchaseClick}
                >
                  <Sparkles className="h-4 w-4 mr-2" />
                  Buy Now for {listing.price} SOL
                </Button>
              </div>
            )}
          </div>
        </div>
      </DialogContent>

      {/* Purchase Confirmation Dialog */}
      <Dialog open={isConfirmingPurchase} onOpenChange={setIsConfirmingPurchase}>
        <DialogContent className="bg-gray-900/95 border-gray-800 p-6 max-w-md">
          <h3 className="text-lg font-medium text-gray-100 mb-2">Confirm Purchase</h3>
          <p className="text-sm text-gray-400 mb-6">
            Are you sure you want to purchase this NFT for {listing.price} SOL?
          </p>
          <div className="flex gap-4">
            <Button
              className="flex-1 bg-gray-800 hover:bg-gray-700 text-gray-300"
              onClick={() => setIsConfirmingPurchase(false)}
            >
              Cancel
            </Button>
            <Button
              className="flex-1 bg-purple-500 hover:bg-purple-600 text-white"
              onClick={handleConfirmPurchase}
            >
              Confirm Purchase
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </Dialog>
  );
};

export default function MarketplacePage() {
  const wallet = useWallet();
  const [viewMode, setViewMode] = useState<'my' | 'all'>('all');
  const [sortBy, setSortBy] = useState('recent');
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddListingOpen, setIsAddListingOpen] = useState(false);
  const { data: allListings = { data: [], hasMore: false, total: 0 }, isLoading: isLoadingAll } = useGetAllListingsQuery({ 
    publicKey: wallet.publicKey?.toString() 
  });
  const { data: userArt = [] } = useGetUserArtQuery();
  const [purchaseListing] = useExecutePurchaseMutation();
  const [createListing] = useCreateListingMutation();
  const { isUserLoggedIn, user } = useAppSelector(state => state.appState);
  const [selectedListing, setSelectedListing] = useState<AuctionHouseListing | null>(null);
  const [purchasedNFT, setPurchasedNFT] = useState<{
    title: string;
    image_url: string;
    price: number;
  } | null>(null);

  // Get mintable art (unminted art owned by current user)
  const listableArt = userArt
    .filter(art => 
      art.user_id === user?.id && // Only user's own art
      art.minted_nft_address && // Must be minted
      !allListings.data?.some(listing => listing.uri === art.image_url) // Not already listed
    )
    .map(art => ({
      id: art.id,
      title: art.title,
      image_url: art.image_url,
      created_at: art.created_at,
      minted_nft_address: art.minted_nft_address
    }));

  // Get the appropriate listings based on view mode
  const listings = viewMode === 'my' && wallet.publicKey
    ? (allListings.data || []).filter((listing: AuctionHouseListing) => 
        listing.seller === wallet.publicKey?.toString()
      )
    : (allListings.data || []);

  // Filter and sort listings
  const filteredListings = (listings || [])
    .filter((listing: AuctionHouseListing) => {
      if (searchQuery) {
        return listing.name.toLowerCase().includes(searchQuery.toLowerCase());
      }
      return true;
    })
    .sort((a: AuctionHouseListing, b: AuctionHouseListing) => {
      if (sortBy === 'recent') {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      } else if (sortBy === 'price-low') {
        return Number(a.price) - Number(b.price);
      } else {
        return Number(b.price) - Number(a.price);
      }
    });

  const handlePurchase = async (listing: AuctionHouseListing) => {
    if (!wallet.publicKey || !wallet.connected) {
      toast({
        title: 'Error',
        description: 'Please connect your wallet first',
        variant: 'destructive',
      });
      return;
    }

    try {
      const result = await purchaseListing({
        nftMint: listing.mintAddress,
        price: Number(listing.price),
        sellerTradeState: listing.tradeState,
        wallet
      }).unwrap();

      if (result && 'error' in result) {
        throw new Error(result.error as string);
      }

      setPurchasedNFT({
        title: listing.name,
        image_url: listing.uri,
        price: Number(listing.price)
      });

      toast({
        title: 'Success',
        description: 'NFT purchased successfully!',
      });
    } catch (error) {
      console.error('Purchase error:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to purchase NFT',
        variant: 'destructive',
      });
    }
  };

  const handleCreateListing = async (artId: number, price: number) => {
    if (!artId || isNaN(price)) {
      toast({
        title: 'Invalid Input',
        description: 'Please select an NFT and enter a valid price.',
        variant: 'destructive'
      });
      return;
    }

    try {
      // Find the art details from listableArt
      const artToList = listableArt.find(art => art.id === artId);
      if (!artToList || !artToList.minted_nft_address) {
        throw new Error('NFT not found or not minted');
      }

      console.log('Creating listing with params:', {
        nftMint: artToList.minted_nft_address,
        price,
        wallet
      });

      const result = await createListing({
        nftMint: artToList.minted_nft_address,
        price,
        wallet
      }).unwrap();

      if (result && 'error' in result) {
        throw new Error(result.error as string);
      }
      
      setIsAddListingOpen(false);
      
      toast({
        title: 'Listing Created',
        description: 'Your NFT has been listed for sale!',
      });
    } catch (error) {
      console.error('Listing error:', error);
      toast({
        title: 'Listing Failed',
        description: error instanceof Error ? error.message : 'Failed to create listing',
        variant: 'destructive'
      });
    }
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
              NFT Marketplace
            </h1>
            <p className="text-sm text-gray-300">
              Discover and collect unique pixel art NFTs
            </p>
          </motion.div>

          {/* Filters */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-xl p-6 mb-12"
          >
            <div className="flex flex-col md:flex-row gap-6">
              {/* View Mode Toggle */}
              <div className="flex rounded-lg overflow-hidden border border-gray-800">
                <button
                  onClick={() => setViewMode('all')}
                className={cn(
                    "px-4 py-2 text-xs transition-colors",
                    viewMode === 'all'
                      ? "bg-purple-500/20 text-purple-300"
                      : "text-gray-400 hover:text-gray-300"
                )}
              >
                All Listings
                </button>
                <button
                  onClick={() => setViewMode('my')}
                className={cn(
                    "px-4 py-2 text-xs transition-colors",
                    viewMode === 'my'
                      ? "bg-purple-500/20 text-purple-300"
                      : "text-gray-400 hover:text-gray-300"
                )}
              >
                My Listings
                </button>
              </div>

              {/* Search and Sort */}
              <div className="flex-1 flex gap-4">
              <div className="flex-1">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search listings..."
                    className="w-full px-4 py-2 text-xs bg-gray-900/50 border border-gray-800 rounded-lg text-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500/30"
                />
              </div>

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

                {/* Add Listing Button - Always visible when logged in */}
            {isUserLoggedIn && (
              <Button
                onClick={() => setIsAddListingOpen(true)}
                    className="bg-purple-500/20 hover:bg-purple-500/30 text-purple-100 border border-purple-500/30 hover:border-purple-500/50"
              >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Listing
              </Button>
            )}
              </div>
            </div>
          </motion.div>

          {/* Listings Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {isLoadingAll ? (
              <div className="col-span-full text-center py-24">
                <div className="animate-spin w-12 h-12 border-4 border-purple-500/20 border-t-purple-500 rounded-full mx-auto mb-4" />
                <p className="text-gray-400">Loading listings...</p>
              </div>
            ) : viewMode === 'my' && !isUserLoggedIn ? (
              <div className="col-span-full text-center py-24">
                <Wallet className="w-12 h-12 text-purple-400 mx-auto mb-6" />
                <h2 className="text-xl font-medium text-gray-200 mb-3">Connect Your Wallet</h2>
                <p className="text-sm text-gray-400 mb-6">
                  Connect your wallet to view your listings
                </p>
              </div>
            ) : filteredListings.length === 0 && viewMode === 'my' ? (
              <div className="col-span-full text-center py-24">
                <Plus className="w-12 h-12 text-purple-400 mx-auto mb-6" />
                <h2 className="text-xl font-medium text-gray-200 mb-3">No Listings Found</h2>
                <p className="text-sm text-gray-400 mb-6">
                  You haven&apos;t listed any NFTs for sale yet
                </p>
                {isUserLoggedIn && (
                  <Button
                    onClick={() => setIsAddListingOpen(true)}
                    className="bg-purple-500/20 hover:bg-purple-500/30 text-purple-100 border border-purple-500/30 hover:border-purple-500/50"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Listing
                  </Button>
                )}
              </div>
            ) : filteredListings.length === 0 ? (
              <div className="col-span-full text-center py-24">
                <Filter className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                <p className="text-gray-400">No listings found</p>
              </div>
            ) : (
              filteredListings.map((listing) => {
                const isListingOwner = wallet.publicKey?.toString() === listing.seller;
                return (
                  <motion.div
                    key={`${listing.tradeState}-${listing.seller}`}
                    variants={item}
                    className="group relative rounded-xl overflow-hidden bg-gray-900/50 backdrop-blur-sm border border-gray-800 hover:border-purple-500/20 transition-all duration-300 cursor-pointer"
                    onClick={() => setSelectedListing(listing)}
                  >
                    <div className="relative aspect-square">
                      <Image
                        src={listing.uri}
                        alt={listing.name}
                        fill
                        className="object-cover"
                        unoptimized
                      />
                      <div className="absolute top-2 right-2 flex items-center gap-1 bg-purple-500/20 px-2 py-1 rounded-lg backdrop-blur-sm">
                        <Tag className="h-3 w-3 text-purple-300" />
                        <span className="text-xs text-purple-300">{listing.price} SOL</span>
                      </div>
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="absolute bottom-0 left-0 right-0 p-4">
                        <h3 className="text-sm font-medium text-gray-100 mb-2">{listing.name}</h3>
                        <div className="flex items-center justify-between">
                          <div className="text-xs text-gray-400">
                            Listed {format(new Date(listing.createdAt), 'MMM d, yyyy')}
                          </div>
                          {!isListingOwner && isUserLoggedIn && (
                            <Button
                              variant="secondary"
                              size="sm"
                              className="h-7 bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 text-xs"
                              onClick={(e) => {
                                e.stopPropagation();
                                handlePurchase(listing as AuctionHouseListing);
                              }}
                            >
                              <Sparkles className="h-3 w-3 mr-1" />
                              Buy Now
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Listing Details Modal */}
      <ListingDetailsModal
        listing={selectedListing}
        onClose={() => setSelectedListing(null)}
        onPurchase={handlePurchase}
        isOwner={selectedListing?.seller === wallet.publicKey?.toString()}
        isLoggedIn={isUserLoggedIn}
      />

      {/* NFT Listing Dialog */}
      <NFTListingDialog
        isOpen={isAddListingOpen}
        onClose={() => setIsAddListingOpen(false)}
        onList={handleCreateListing}
        nfts={listableArt}
        isLoading={isLoadingAll}
      />

      {/* Purchase Success Modal */}
      <PurchaseSuccessModal
        isOpen={!!purchasedNFT}
        onClose={() => setPurchasedNFT(null)}
        nftData={purchasedNFT}
      />
    </RootLayout>
  );
} 