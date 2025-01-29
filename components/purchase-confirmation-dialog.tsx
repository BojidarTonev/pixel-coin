import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X, Wallet, ArrowRight, ExternalLink } from 'lucide-react';
import Image from 'next/image';
import { format } from 'date-fns';

interface PurchaseConfirmationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  listing: {
    id: number;
    price: number;
    seller_address: string;
    art: {
      title: string;
      image_url: string;
      created_at: string;
    };
  } | null;
  isLoading?: boolean;
}

export function PurchaseConfirmationDialog({
  isOpen,
  onClose,
  onConfirm,
  listing,
  isLoading
}: PurchaseConfirmationDialogProps) {
  if (!listing) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl bg-gray-900/95 border-gray-800 p-0 overflow-hidden">
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
              <h2 className="text-xl font-medium text-gray-100 mb-2">Confirm Purchase</h2>
              <p className="text-sm text-gray-400">
                Please review the details of your purchase
              </p>
            </div>

            {/* Art Preview */}
            <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-4 mb-6">
              <div className="flex gap-4 items-center">
                <div className="h-16 w-16 relative rounded-lg overflow-hidden">
                  <Image
                    src={listing.art.image_url}
                    alt={listing.art.title}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-200 mb-1">{listing.art.title}</h3>
                  <p className="text-xs text-gray-400">
                    Listed on {format(new Date(listing.art.created_at), 'MMM d, yyyy')}
                  </p>
                </div>
              </div>
            </div>

            {/* Transaction Details */}
            <div className="space-y-4 mb-8">
              <div className="flex justify-between items-center py-3 border-b border-gray-800">
                <span className="text-sm text-gray-400">Price</span>
                <span className="text-sm font-medium text-gray-200">{listing.price} SOL</span>
              </div>
              <div className="flex justify-between items-center py-3 border-b border-gray-800">
                <span className="text-sm text-gray-400">Seller</span>
                <a
                  href={`https://solscan.io/account/${listing.seller_address}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-purple-300 hover:text-purple-200 flex items-center gap-1"
                >
                  {listing.seller_address.slice(0, 4)}...{listing.seller_address.slice(-4)}
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
              <div className="flex justify-between items-center py-3 border-b border-gray-800">
                <span className="text-sm text-gray-400">Network</span>
                <span className="text-sm text-gray-200">Solana Devnet</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4">
              <Button
                variant="outline"
                className="flex-1 border-gray-800 text-gray-300 hover:text-gray-200"
                onClick={onClose}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button
                className="flex-1 bg-purple-500 hover:bg-purple-600 text-white"
                onClick={onConfirm}
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Processing...</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Wallet className="h-4 w-4" />
                    <span>Confirm Purchase</span>
                    <ArrowRight className="h-4 w-4" />
                  </div>
                )}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 
