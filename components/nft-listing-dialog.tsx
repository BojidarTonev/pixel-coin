import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X, Wallet, ArrowRight, Search } from 'lucide-react';
import Image from 'next/image';
import { format } from 'date-fns';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

interface NFT {
  id: number;
  title: string;
  image_url: string;
  created_at: string;
  minted_nft_address: string;
}

interface NFTListingDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onList: (nftId: number, price: number) => void;
  nfts: NFT[];
  isLoading?: boolean;
}

export function NFTListingDialog({
  isOpen,
  onClose,
  onList,
  nfts,
  isLoading
}: NFTListingDialogProps) {
  const [selectedNFT, setSelectedNFT] = useState<NFT | null>(null);
  const [price, setPrice] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');

  const handleList = () => {
    if (selectedNFT && price && !isNaN(parseFloat(price))) {
      onList(selectedNFT.id, parseFloat(price));
    }
  };

  const filteredNFTs = nfts.filter(nft => 
    nft.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl bg-gray-900/95 border-gray-800 p-0 overflow-hidden">
        <div className="relative">
          {/* Close Button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="absolute right-4 top-4 z-50 text-gray-400 hover:text-gray-300"
          >
            <X className="h-4 w-4" />
          </Button>

          <div className="p-6">
            {/* Header */}
            <div className="text-center mb-8">
              <h2 className="text-xl font-medium text-gray-100 mb-2">List NFT for Sale</h2>
              <p className="text-sm text-gray-400">
                Select an NFT from your collection to list on the marketplace
              </p>
            </div>

            {/* Search */}
            <div className="relative mb-6">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
              <Input
                type="text"
                placeholder="Search by title..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-gray-900/50 border-gray-800 text-gray-300 placeholder:text-gray-500"
              />
            </div>

            {/* NFT Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 max-h-[400px] overflow-y-auto mb-6 pr-2 custom-scrollbar">
              {filteredNFTs.map((nft) => (
                <motion.div
                  key={nft.id}
                  layoutId={`nft-${nft.id}`}
                  className={cn(
                    "relative aspect-square rounded-lg overflow-hidden cursor-pointer border-2 transition-all duration-300",
                    selectedNFT?.id === nft.id
                      ? "border-purple-500 shadow-lg shadow-purple-500/20"
                      : "border-gray-800 hover:border-purple-500/50"
                  )}
                  onClick={() => setSelectedNFT(nft)}
                >
                  <Image
                    src={nft.image_url}
                    alt={nft.title}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300">
                    <div className="absolute bottom-2 left-2 right-2">
                      <p className="text-xs font-medium text-gray-100 truncate">{nft.title}</p>
                      <p className="text-xs text-gray-400">
                        {format(new Date(nft.created_at), 'MMM d, yyyy')}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Price Input and List Button */}
            <AnimatePresence>
              {selectedNFT && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-4"
                >
                  <div className="flex gap-4">
                    <div className="flex-1">
                      <label className="block text-sm text-gray-400 mb-2">
                        Price (SOL)
                      </label>
                      <Input
                        type="number"
                        step="0.1"
                        min="0"
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        className="bg-gray-900/50 border-gray-800 text-gray-300"
                        placeholder="Enter price in SOL"
                      />
                    </div>
                    <div className="flex items-end">
                      <Button
                        onClick={handleList}
                        disabled={!price || isLoading}
                        className="bg-purple-500 hover:bg-purple-600 text-white"
                      >
                        {isLoading ? (
                          <div className="flex items-center gap-2">
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            <span>Processing...</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <Wallet className="h-4 w-4" />
                            <span>List for Sale</span>
                            <ArrowRight className="h-4 w-4" />
                          </div>
                        )}
                      </Button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 