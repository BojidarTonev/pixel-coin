'use client';

import { useState } from 'react';
import { RootLayout } from '@/components/root-layout';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { Share2, Download, Search, Filter, Wallet, Tag, Sparkles } from 'lucide-react';
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
import { useGetListingsQuery, usePurchaseListingMutation } from '@/redux/services/nft.service';
import Image from 'next/image';

const sortOptions = [
  { value: 'recent', label: 'Most Recent' },
  { value: 'price-low', label: 'Price: Low to High' },
  { value: 'price-high', label: 'Price: High to Low' },
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

export default function MarketplacePage() {
  const [sortBy, setSortBy] = useState('recent');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const { connected, publicKey } = useWallet();
  const { setVisible } = useWalletModal();
  const { data: listings = [], isLoading } = useGetListingsQuery();
  const [purchaseListing] = usePurchaseListingMutation();

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

  const handleConnectWallet = () => {
    setVisible(true);
  };

  const handlePurchase = async (listingId: number) => {
    try {
      toast.loading('Processing Purchase', 'Please wait while we process your purchase...');
      await purchaseListing(listingId).unwrap();
      toast.success('Purchase Complete', 'You have successfully purchased this NFT!');
    } catch (error) {
      console.error('Purchase error:', error);
      toast.error(
        'Purchase Failed',
        'Failed to complete purchase. Please try again.'
      );
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

          {/* Listings Grid */}
          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          >
            {isLoading ? (
              <motion.div 
                variants={item}
                className="col-span-full text-center py-24"
              >
                <div className="animate-spin w-12 h-12 border-4 border-purple-500/20 border-t-purple-500 rounded-full mx-auto mb-4" />
                <p className="text-gray-400">Loading listings...</p>
              </motion.div>
            ) : !connected ? (
              <motion.div
                variants={item}
                className="col-span-full text-center py-24"
              >
                <Wallet className="w-12 h-12 text-purple-400 mx-auto mb-6" />
                <h2 className="text-xl font-medium text-gray-200 mb-3">Connect Your Wallet</h2>
                <p className="text-sm text-gray-400 mb-6">
                  Connect your wallet to start buying and selling NFTs
                </p>
                <Button
                  onClick={handleConnectWallet}
                  className="bg-purple-500 hover:bg-purple-600 text-white shadow-lg shadow-purple-500/20"
                >
                  <Wallet className="w-4 h-4 mr-2" />
                  Connect Wallet
                </Button>
              </motion.div>
            ) : filteredListings.length === 0 ? (
              <motion.div 
                variants={item}
                className="col-span-full text-center py-24"
              >
                <Filter className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                <p className="text-gray-400">No listings found</p>
              </motion.div>
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
          </motion.div>
        </div>
      </div>
    </RootLayout>
  );
} 