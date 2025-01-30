import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Sparkles, ExternalLink, X, ShoppingBag } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";

interface MintSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  nftData: {
    title: string;
    image_url: string;
    minted_nft_address: string;
  } | null;
}

export function MintSuccessModal({ isOpen, onClose, nftData }: MintSuccessModalProps) {
  console.log('nftData => ', nftData);
  const router = useRouter();

  if (!nftData) return null;

  const shortenedAddress = nftData.minted_nft_address 
    ? `${nftData.minted_nft_address.slice(0, 8)}...${nftData.minted_nft_address.slice(-8)}`
    : 'Address not available';

  const explorerUrl = nftData.minted_nft_address
    ? `https://explorer.solana.com/address/${nftData.minted_nft_address}?cluster=devnet`
    : '#';

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md bg-gray-900/95 border-gray-800 p-0 overflow-hidden">
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
            {/* Success Animation */}
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="w-20 h-20 rounded-full bg-purple-500/20 border border-purple-500/30 flex items-center justify-center mx-auto mb-6"
            >
              <motion.div
                initial={{ rotate: -180, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                <Sparkles className="w-8 h-8 text-purple-400" />
              </motion.div>
            </motion.div>

            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-center mb-8"
            >
              <h2 className="text-xl font-medium text-gray-100 mb-2">NFT Minted Successfully!</h2>
              <p className="text-sm text-gray-400">
                Your artwork has been successfully minted as an NFT on the Solana blockchain
              </p>
            </motion.div>

            {/* NFT Preview */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-gray-900/50 border border-gray-800 rounded-lg p-4 mb-6"
            >
              <div className="aspect-square relative rounded-lg overflow-hidden mb-4">
                <Image
                  src={nftData.image_url}
                  alt={nftData.title}
                  fill
                  className="object-cover"
                  unoptimized
                />
                <div className="absolute top-2 right-2">
                  <div className="flex items-center gap-1 bg-purple-500/20 px-2 py-1 rounded-full backdrop-blur-sm border border-purple-500/30">
                    <Sparkles className="h-3 w-3 text-purple-300" />
                    <span className="text-[10px] text-purple-300">NFT</span>
                  </div>
                </div>
              </div>
              <h3 className="text-sm font-medium text-gray-200 mb-2">{nftData.title}</h3>
              {nftData.minted_nft_address ? (
                <a
                  href={explorerUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-purple-300 hover:text-purple-200 flex items-center gap-1 transition-colors"
                >
                  {shortenedAddress}
                  <ExternalLink className="h-3 w-3" />
                </a>
              ) : (
                <p className="text-xs text-gray-400">NFT address not available</p>
              )}
            </motion.div>

            {/* Action Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="flex gap-4"
            >
              <Button
                variant="outline"
                className="flex-1 border-gray-800 text-black"
                onClick={onClose}
              >
                Close
              </Button>
              <Button
                className="flex-1 bg-purple-500 hover:bg-purple-600 text-white"
                onClick={() => router.push('/marketplace')}
              >
                <ShoppingBag className="h-4 w-4 mr-2" />
                Go to Marketplace
              </Button>
            </motion.div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 