import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2 } from 'lucide-react';
import Image from 'next/image';
import { useState } from 'react';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";

interface NFT {
  id: number;
  title: string;
  image_url: string;
  created_at: string;
  minted_nft_address?: string;
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
  // const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();

  const handleList = () => {
    if (selectedNFT && price && !isNaN(parseFloat(price))) {
      onList(selectedNFT.id, parseFloat(price));
    }
  };

  // const filteredNFTs = nfts.filter(nft => 
  //   nft.title.toLowerCase().includes(searchQuery.toLowerCase())
  // );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-gray-900/95 border-gray-800 p-6 max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-medium text-gray-100">List NFT for Sale</DialogTitle>
          <DialogDescription className="text-sm text-gray-400">
            Choose an art piece to list on the marketplace
          </DialogDescription>
        </DialogHeader>

        {nfts.length === 0 ? (
          <div className="text-center py-8">
            <h3 className="text-lg font-medium text-gray-200 mb-2">No Art Available</h3>
            <p className="text-sm text-gray-400 mb-4">
              You don&rsquo;t have any unminted art pieces available to list.
              Generate some art first!
            </p>
            <Button
              variant="outline"
              onClick={() => router.push('/generate')}
              className="bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 border-purple-500/20 hover:border-purple-500/30"
            >
              Generate Art
            </Button>
          </div>
        ) : (
          <>
            <div className="space-y-4 my-4">
              <div className="space-y-2">
                <Label htmlFor="nft">Select Art</Label>
                <Select
                  value={selectedNFT?.id.toString()}
                  onValueChange={(value) => setSelectedNFT(nfts.find(nft => nft.id.toString() === value) || null)}
                >
                  <SelectTrigger className="bg-gray-900/50 border-gray-800 text-gray-300">
                    <SelectValue placeholder="Choose an art piece" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-900/95 border-gray-800">
                    {nfts.map((nft) => (
                      <SelectItem
                        key={nft.id}
                        value={nft.id.toString()}
                        className="text-gray-300 focus:bg-purple-500/20 focus:text-purple-300"
                      >
                        {nft.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedNFT && (
                <div className="relative aspect-square rounded-lg overflow-hidden border border-gray-800">
                  <Image
                    src={selectedNFT.image_url}
                    alt={selectedNFT.title}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="price">Price (SOL)</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.1"
                  min="0"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="bg-gray-900/50 border-gray-800 text-gray-300"
                />
              </div>
            </div>

            <DialogFooter>
              <Button
                variant="ghost"
                onClick={onClose}
                className="bg-gray-800 hover:bg-gray-700 text-gray-300"
              >
                Cancel
              </Button>
              <Button
                onClick={handleList}
                disabled={!selectedNFT || !price || isLoading}
                className="bg-purple-500 hover:bg-purple-600 text-white disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creating Listing...
                  </>
                ) : (
                  'Create Listing'
                )}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
} 