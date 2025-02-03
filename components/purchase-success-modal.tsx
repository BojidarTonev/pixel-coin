import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";

interface PurchaseSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  nftData: {
    title: string;
    image_url: string;
    price: number;
  } | null;
}

export function PurchaseSuccessModal({
  isOpen,
  onClose,
  nftData
}: PurchaseSuccessModalProps) {
  const router = useRouter();

  if (!nftData) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-gray-900/95 border-gray-800 p-6 max-w-md">
        <div className="text-center">
          <div className="relative w-32 h-32 mx-auto mb-4 rounded-lg overflow-hidden border border-purple-500/30">
            <Image
              src={nftData.image_url}
              alt={nftData.title}
              fill
              className="object-cover"
              unoptimized
            />
          </div>
          
          <div className="inline-flex items-center gap-2 bg-purple-500/20 px-3 py-1.5 rounded-lg mb-4">
            <Sparkles className="h-4 w-4 text-purple-300" />
            <span className="text-sm text-purple-300">NFT Purchased!</span>
          </div>

          <h3 className="text-lg font-medium text-gray-100 mb-2">
            Congratulations!
          </h3>
          <p className="text-sm text-gray-400 mb-6">
            You are now the proud owner of &#34;{nftData.title}&#34;. 
            You can view your new NFT in the &#34;My Creations&#34; section of the gallery.
          </p>

          <div className="flex gap-3">
            <Button
              className="flex-1 bg-gray-800 hover:bg-gray-700 text-gray-300"
              onClick={onClose}
            >
              Close
            </Button>
            <Button
              className="flex-1 bg-purple-500 hover:bg-purple-600 text-white"
              onClick={() => router.push('/gallery?view=my')}
            >
              View My NFTs
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 