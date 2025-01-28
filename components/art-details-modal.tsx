import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Share2, Download, X, MessageCircle, Sparkles, Tag } from 'lucide-react';
import { format } from 'date-fns';
import Image from 'next/image';
import { useState } from 'react';
import { Input } from "@/components/ui/input";
import { useMintNFTMutation, useCreateListingMutation } from '@/redux/services/nft.service';
import { toast } from 'sonner';
import { Art } from '@/lib/supabase';
import { useWallet } from '@solana/wallet-adapter-react';

interface ArtDetailsModalProps {
  art: Art | null;
  onClose: () => void;
}

export function ArtDetailsModal({ art, onClose }: ArtDetailsModalProps) {
  const [price, setPrice] = useState('');
  const [mintNFT] = useMintNFTMutation();
  const [createListing] = useCreateListingMutation();
  const wallet = useWallet();

  if (!art) return null;

  const handleMint = async () => {
    if (!wallet.connected) {
      toast.error('Wallet Not Connected', {
        description: 'Please connect your wallet to mint NFTs.'
      });
      return;
    }

    const toastId = toast.loading('Minting NFT', {
      description: 'Please wait while we mint your NFT...'
    });
    try {
      await mintNFT({ artId: art.id, wallet }).unwrap();
      toast.dismiss(toastId);
      toast.success('NFT Minted', {
        description: 'Your art has been successfully minted as an NFT!'
      });
      onClose();
    } catch (error) {
      console.error('Mint error:', error);
      toast.dismiss(toastId);
      toast.error('Minting Failed', {
        description: error.data.message || 'Failed to mint NFT. Please try again.'
      });
    }
  };

  const handleList = async () => {
    if (!price) return;

    const toastId = toast.loading('Creating Listing', {
      description: 'Please wait while we create your listing...'
    });
    try {
      await createListing({
        art_id: art.id,
        price: parseFloat(price)
      }).unwrap();
      toast.dismiss(toastId);
      toast.success('Listing Created', {
        description: 'Your NFT has been listed for sale!'
      });
      onClose();
    } catch (error) {
      console.error('Listing error:', error);
      toast.dismiss(toastId);
      toast.error('Listing Failed', {
        description: 'Failed to create listing. Please try again.'
      });
    }
  };

  return (
    <Dialog open={!!art} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-4xl bg-gray-900/95 border-gray-800 p-0 overflow-hidden">
        <div className="relative h-full">
          {/* Close Button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="absolute right-4 top-4 z-50 text-gray-400 hover:text-gray-300"
          >
            <X className="h-4 w-4" />
          </Button>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
            {/* Image Section */}
            <div className="relative aspect-square">
              <Image
                src={art.imageUrl}
                alt={art.title}
                fill
                className="object-cover"
                unoptimized
              />
            </div>

            {/* Details Section */}
            <div className="p-6 bg-gray-900/50 backdrop-blur-sm">
              <div className="space-y-6">
                {/* Header */}
                <div>
                  <h2 className="text-xl font-medium text-gray-100 mb-2">{art.title}</h2>
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-lg overflow-hidden relative">
                      <Image
                        src={art.imageUrl}
                        alt={art.title}
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    </div>
                    <div className="flex items-center gap-4 text-xs text-gray-400">
                      <span>Created {format(new Date(art.createdAt), 'MMM d, yyyy')}</span>
                    </div>
                  </div>
                </div>

                {/* NFT Status */}
                {art.isMinted ? (
                  <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-4">
                    <div className="flex items-center gap-2 text-purple-300 text-sm mb-2">
                      <Sparkles className="h-4 w-4" />
                      <span>Minted as NFT</span>
                    </div>
                    <p className="text-xs text-gray-400">
                      NFT Address: {art.mintedNftAddress?.slice(0, 8)}...{art.mintedNftAddress?.slice(-8)}
                    </p>
                  </div>
                ) : (
                  <Button
                    onClick={handleMint}
                    className="w-full bg-purple-500 hover:bg-purple-600 text-white"
                  >
                    <Sparkles className="h-4 w-4 mr-2" />
                    Mint as NFT
                  </Button>
                )}

                {/* List for Sale (only show if minted) */}
                {art.isMinted && (
                  <div className="space-y-4">
                    <div className="flex gap-4">
                      <Input
                        type="number"
                        placeholder="Price in SOL..."
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        className="flex-1 bg-gray-900/50 border-gray-800 text-gray-300 text-sm"
                      />
                      <Button
                        onClick={handleList}
                        disabled={!price}
                        className="bg-purple-500/10 hover:bg-purple-500/20 text-purple-300"
                      >
                        <Tag className="h-4 w-4 mr-2" />
                        List for Sale
                      </Button>
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-4">
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 border-purple-500/20 hover:border-purple-500/30"
                  >
                    <MessageCircle className="h-3 w-3 mr-2" />
                    Chat with Art
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs bg-gray-800/50 hover:bg-gray-800/70 text-gray-300 border-gray-700"
                    onClick={() => window.open(art.imageUrl, '_blank')}
                  >
                    <Download className="h-3 w-3 mr-2" />
                    Download
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs bg-gray-800/50 hover:bg-gray-800/70 text-gray-300 border-gray-700"
                    onClick={() => {
                      navigator.share({
                        title: art.title,
                        text: `Check out this pixel art: ${art.title}`,
                        url: art.imageUrl,
                      }).catch(console.error);
                    }}
                  >
                    <Share2 className="h-3 w-3 mr-2" />
                    Share
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 