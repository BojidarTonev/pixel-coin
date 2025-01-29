import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Download, Share2, MessageSquare, Sparkles, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { useRouter } from "next/navigation";
import { toast } from "@/hooks/use-toast";
import { useAppSelector } from "@/redux/store";
import Image from "next/image";
import { ArtPiece } from "@/app/gallery/page";
import { useMintNFTMutation } from "@/redux/services/nft.service";
import { useWallet } from "@solana/wallet-adapter-react";
import { useState } from "react";

interface ArtDetailsModalProps {
  art: ArtPiece | null;
  onClose: () => void;
}

export function ArtDetailsModal({ art, onClose }: ArtDetailsModalProps) {
  const router = useRouter();
  const { user } = useAppSelector(state => state.appState);
  const currentUserId = user?.id;
  const isOwner = currentUserId && art?.user_id === currentUserId;
  const [isMinting, setIsMinting] = useState(false);
  const [mintNFT] = useMintNFTMutation();
  const wallet = useWallet();

  if (!art) return null;

  const handleShare = async () => {
    try {
      await navigator.share({
        title: art.title,
        url: art.image_url,
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const handleMint = async () => {
    if (!wallet.connected || !wallet.publicKey) {
      toast({
        title: 'Wallet Not Connected',
        description: 'Please connect your wallet to mint NFTs.',
        variant: 'destructive'
      });
      return;
    }

    try {
      setIsMinting(true);
      toast({
        title: 'Minting NFT',
        description: 'Please approve the transaction in your wallet...',
        variant: 'loading'
      });

      await mintNFT({ 
        artId: art.id,
        wallet: {
          ...wallet,
          publicKey: wallet.publicKey,
          signTransaction: wallet.signTransaction,
          signAllTransactions: wallet.signAllTransactions,
        }
      }).unwrap();

      toast({
        title: 'NFT Minted Successfully',
        description: 'Your artwork has been minted as an NFT!',
        variant: 'default'
      });

      onClose();
      router.push('/marketplace');
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
      setIsMinting(false);
    }
  };

  return (
    <Dialog open={!!art} onOpenChange={() => onClose()}>
      <DialogContent className="bg-gray-900/95 border-gray-800 p-0 max-w-2xl">
        <div className="relative aspect-square">
          <Image
            src={art.image_url}
            alt={art.title}
            fill
            className="object-cover"
            unoptimized
          />
        </div>
        <div className="p-6">
          <h2 className="text-lg font-medium text-gray-100 mb-2">{art.title}</h2>
          <div className="space-y-2 mb-6">
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <span>Created on {format(new Date(art.created_at), 'MMMM d, yyyy')}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-400">Creator:</span>
              {art.creator_wallet ? (
                <a
                  href={`https://explorer.solana.com/address/${art.creator_wallet}?cluster=devnet`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-purple-300 hover:text-purple-200 transition-colors"
                >
                  {art.creator_wallet.slice(0, 4)}...{art.creator_wallet.slice(-4)}
                </a>
              ) : (
                <span className="text-xs text-gray-500">No wallet linked</span>
              )}
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            {/* Share button always visible */}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleShare}
              className="bg-gray-900/50 hover:bg-purple-500/20 text-gray-300 hover:text-purple-300 border border-gray-800 hover:border-purple-500/30"
            >
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </Button>

            {/* Owner-only actions */}
            {isOwner && (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => window.open(art.image_url, '_blank')}
                  className="bg-gray-900/50 hover:bg-purple-500/20 text-gray-300 hover:text-purple-300 border border-gray-800 hover:border-purple-500/30"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => router.push('/chat')}
                  className="bg-gray-900/50 hover:bg-purple-500/20 text-gray-300 hover:text-purple-300 border border-gray-800 hover:border-purple-500/30"
                >
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Chat with Art
                </Button>

                {!art.is_minted && (
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={handleMint}
                    disabled={isMinting || !wallet.connected || !wallet.publicKey}
                    className="bg-purple-500/20 hover:bg-purple-500/30 text-purple-100 border border-purple-500/30 hover:border-purple-500/50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isMinting ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Minting...
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-4 w-4 mr-2" />
                        Mint as NFT
                      </>
                    )}
                  </Button>
                )}
              </>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 