import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Heart, MessageSquare, Share2, Download, X, MessageCircle } from 'lucide-react';
import { format } from 'date-fns';
import Image from 'next/image';

interface ArtPiece {
  id: string;
  title: string;
  imageUrl: string;
  creator: string;
  createdAt: Date;
  likes: number;
  comments: number;
  category: string;
}

interface ArtDetailsModalProps {
  art: ArtPiece | null;
  onClose: () => void;
}

export function ArtDetailsModal({ art, onClose }: ArtDetailsModalProps) {
  if (!art) return null;

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
                unoptimized // Since we're using external URLs
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
                      <span>by {art.creator}</span>
                      <span>{format(art.createdAt, 'MMM d, yyyy')}</span>
                    </div>
                  </div>
                </div>

                {/* Stats */}
                <div className="flex items-center gap-6">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs text-gray-300 hover:text-purple-300 hover:bg-purple-500/10"
                  >
                    <Heart className="h-3 w-3 mr-1" />
                    {art.likes}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs text-gray-300 hover:text-purple-300 hover:bg-purple-500/10"
                  >
                    <MessageSquare className="h-3 w-3 mr-1" />
                    {art.comments}
                  </Button>
                </div>

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
                  >
                    <Download className="h-3 w-3 mr-2" />
                    Download
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs bg-gray-800/50 hover:bg-gray-800/70 text-gray-300 border-gray-700"
                  >
                    <Share2 className="h-3 w-3 mr-2" />
                    Share
                  </Button>
                </div>

                {/* Comments Section */}
                <div className="space-y-4">
                  <h3 className="text-sm font-medium text-gray-200">Comments</h3>
                  <div className="space-y-4 max-h-[300px] overflow-y-auto pr-4">
                    {/* Sample Comments */}
                    <div className="bg-gray-800/50 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-medium text-gray-300">User123</span>
                        <span className="text-xs text-gray-500">2 hours ago</span>
                      </div>
                      <p className="text-xs text-gray-400">
                        This is amazing! Love the medieval vibes in this piece.
                      </p>
                    </div>
                    {/* Add more comments as needed */}
                  </div>

                  {/* Comment Input */}
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Add a comment..."
                      className="w-full px-4 py-2 text-xs bg-gray-800/50 border border-gray-700 rounded-lg text-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500/30"
                    />
                    <Button
                      size="sm"
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 text-xs bg-purple-500/10 hover:bg-purple-500/20 text-purple-300"
                    >
                      Post
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 