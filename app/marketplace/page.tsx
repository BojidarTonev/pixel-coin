'use client';

import { useState } from 'react';
import { RootLayout } from '@/components/root-layout';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { Filter, Wallet, Tag, Sparkles, Plus } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { Dialog, DialogContent } from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { format } from 'date-fns';
import { useGetListingsQuery, useGetUserListingsQuery, usePurchaseListingMutation } from '@/redux/services/nft.service';
import { useGetUserArtQuery } from '@/redux/services/art.service';
import Image from 'next/image';
import { useAppSelector } from '@/redux/store';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';

const sortOptions = [
  { value: 'recent', label: 'Most Recent' },
  { value: 'price-low', label: 'Price: Low to High' },
  { value: 'price-high', label: 'Price: High to Low' },
];

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

export default function MarketplacePage() {
  const [viewMode, setViewMode] = useState<'my' | 'all'>('all');
  const [sortBy, setSortBy] = useState('recent');
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddListingOpen, setIsAddListingOpen] = useState(false);
  const { data: allListings = [], isLoading: isLoadingAll } = useGetListingsQuery();
  const { data: userListings = [], isLoading: isLoadingUser } = useGetUserListingsQuery();
  const { data: userArt = [] } = useGetUserArtQuery();
  const [purchaseListing] = usePurchaseListingMutation();
  const { isUserLoggedIn } = useAppSelector(state => state.appState);
  const router = useRouter();

  // Get mintable art (minted but not listed)
  const listableArt = userArt.filter(art => 
    art.is_minted && !allListings.some(listing => listing.art_id === art.id)
  );

  // Get the appropriate listings based on view mode
  const listings = viewMode === 'my' ? userListings : allListings;
  const isLoading = viewMode === 'my' ? isLoadingUser : isLoadingAll;

  // Filter and sort listings
  const filteredListings = listings
    .filter(listing => {
      if (searchQuery) {
        return listing.art.title.toLowerCase().includes(searchQuery.toLowerCase());
      }
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'recent') {
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      } else if (sortBy === 'price-low') {
        return a.price - b.price;
      } else {
        return b.price - a.price;
      }
    });

  const handlePurchase = async (listingId: number) => {
    try {
      toast({
        title: 'Processing Purchase',
        description: 'Please wait while we process your purchase...',
        variant: 'loading'
      });
      await purchaseListing(listingId).unwrap();
      toast({
        title: 'Purchase Complete',
        description: 'You have successfully purchased this NFT!',
        variant: 'default'
      });
    } catch (error) {
      console.error('Purchase error:', error);
      toast({
        title: 'Purchase Failed',
        description: 'Failed to complete purchase. Please try again.',
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

              {/* Search */}
              <div className="flex-1">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search listings..."
                  className="w-full px-4 py-2 text-xs bg-gray-900/50 border border-gray-800 rounded-lg text-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500/30"
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

          {/* Listings Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {isLoading ? (
              <div className="col-span-full text-center py-24">
                <div className="animate-spin w-12 h-12 border-4 border-purple-500/20 border-t-purple-500 rounded-full mx-auto mb-4" />
                <p className="text-gray-400">Loading listings...</p>
              </div>
            ) : !isUserLoggedIn ? (
              <div className="col-span-full text-center py-24">
                <Wallet className="w-12 h-12 text-purple-400 mx-auto mb-6" />
                <h2 className="text-xl font-medium text-gray-200 mb-3">Connect Your Wallet</h2>
                <p className="text-sm text-gray-400 mb-6">
                  Connect your wallet to start buying and selling NFTs
                </p>
              </div>
            ) : viewMode === 'my' && filteredListings.length === 0 ? (
              <div className="col-span-full text-center py-24">
                <Plus className="w-12 h-12 text-purple-400 mx-auto mb-6" />
                <h2 className="text-xl font-medium text-gray-200 mb-3">No Listings Found</h2>
                <p className="text-sm text-gray-400 mb-6">
                  You haven&apos;t listed any NFTs for sale yet
                </p>
                <Button
                  onClick={() => setIsAddListingOpen(true)}
                  className="bg-purple-500/20 hover:bg-purple-500/30 text-purple-100"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Listing
                </Button>
              </div>
            ) : filteredListings.length === 0 ? (
              <div className="col-span-full text-center py-24">
                <Filter className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                <p className="text-gray-400">No listings found</p>
              </div>
            ) : (
              filteredListings.map((listing) => (
                <motion.div
                  key={listing.id}
                  variants={item}
                  className="group relative rounded-xl overflow-hidden bg-gray-900/50 backdrop-blur-sm border border-gray-800 hover:border-purple-500/20 transition-all duration-300"
                >
                  <div className="relative aspect-square">
                    <Image
                      src={listing.art.image_url}
                      alt={listing.art.title}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="absolute bottom-0 left-0 right-0 p-4">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-medium text-gray-100">{listing.art.title}</h3>
                        <div className="flex items-center gap-1 bg-purple-500/20 px-2 py-1 rounded-lg">
                          <Tag className="h-3 w-3 text-purple-300" />
                          <span className="text-xs text-purple-300">{listing.price} SOL</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="text-xs text-gray-400">
                          Listed {format(new Date(listing.created_at), 'MMM d, yyyy')}
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="secondary"
                            size="sm"
                            className="h-7 bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 text-xs"
                            onClick={() => handlePurchase(listing.id)}
                          >
                            <Sparkles className="h-3 w-3 mr-1" />
                            Buy Now
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Add Listing Modal */}
      <Dialog open={isAddListingOpen} onOpenChange={setIsAddListingOpen}>
        <DialogContent className="bg-gray-900/95 border-gray-800 p-6 max-w-2xl">
          <h2 className="text-lg font-medium text-gray-100 mb-4">Add New Listing</h2>
          {listableArt.length === 0 ? (
            <div className="text-center py-12">
              <Sparkles className="w-12 h-12 text-purple-400 mx-auto mb-6" />
              <h3 className="text-lg font-medium text-gray-200 mb-3">No NFTs Available to List</h3>
              <p className="text-sm text-gray-400 mb-6">
                To list artwork in the marketplace, you need to first:
              </p>
              <ol className="text-sm text-gray-400 space-y-2 mb-8 max-w-md mx-auto text-left list-decimal pl-4">
                <li>Create pixel art in the Generate section</li>
                <li>Mint your created artwork as NFTs</li>
                <li>Once minted, you can list them here for sale</li>
              </ol>
              <Button
                onClick={() => {
                  setIsAddListingOpen(false);
                  router.push('/generate');
                }}
                className="bg-purple-500/20 hover:bg-purple-500/30 text-purple-100"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                Generate Art
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              <p className="text-sm text-gray-400">
                Select an NFT to list in the marketplace:
              </p>
              <div className="grid grid-cols-2 gap-4">
                {listableArt.map((art) => (
                  <div
                    key={art.id}
                    className="group relative rounded-lg overflow-hidden bg-gray-900/50 backdrop-blur-sm border border-gray-800 hover:border-purple-500/20 transition-all duration-300 cursor-pointer"
                    onClick={() => {
                      // TODO: Add listing logic
                      toast({
                        title: 'Coming Soon',
                        description: 'Listing functionality will be available soon!',
                        variant: 'default'
                      });
                    }}
                  >
                    <div className="relative aspect-square">
                      <Image
                        src={art.image_url}
                        alt={art.title}
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="absolute bottom-0 left-0 right-0 p-3">
                        <p className="text-sm font-medium text-gray-100 truncate">{art.title}</p>
                        <p className="text-xs text-gray-400">
                          {format(new Date(art.created_at), 'MMM d, yyyy')}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </RootLayout>
  );
} 