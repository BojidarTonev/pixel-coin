'use client';

import { useState } from 'react';
import { RootLayout } from '@/components/root-layout';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { Heart, MessageSquare, Share2, Download, Search, Calendar, Filter } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { ArtDetailsModal } from '@/components/art-details-modal';

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

// Temporary mock data
const mockArtPieces: ArtPiece[] = [
  {
    id: '1',
    title: 'Castle of Dreams',
    imageUrl: 'https://via.placeholder.com/400x400',
    creator: 'Artist1',
    createdAt: new Date(),
    likes: 120,
    comments: 15,
    category: 'knights'
  },
  // Add more mock items as needed
];

const categories = [
  { value: 'all', label: 'All Categories' },
  { value: 'knights', label: 'Knights & Castles' },
  { value: 'fantasy', label: 'Medieval Fantasy' },
  { value: 'towns', label: 'Pixel Towns' },
];

const sortOptions = [
  { value: 'popular', label: 'Most Popular' },
  { value: 'recent', label: 'Most Recent' },
  { value: 'likes', label: 'Most Liked' },
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

export default function GalleryPage() {
  const [viewMode, setViewMode] = useState<'my' | 'all'>('my');
  const [category, setCategory] = useState('all');
  const [sortBy, setSortBy] = useState('recent');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPiece, setSelectedPiece] = useState<ArtPiece | null>(null);

  return (
    <RootLayout>
      <div className="min-h-screen bg-black/75 backdrop-blur-sm relative">
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/50" />
        
        <div className="container mx-auto px-8 py-12 relative z-10">
          {/* Header */}
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-16"
          >
            <h1 className="text-3xl font-medium text-gray-100 drop-shadow-lg mb-4">
              Pixel Art Gallery
            </h1>
            <p className="text-sm text-gray-300">
              Discover your creations and explore the world of pixel art
            </p>
          </motion.div>

          {/* Filters */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-xl p-6 mb-12"
          >
            <div className="flex flex-col md:flex-row gap-6">
              {/* View Mode */}
              <div className="flex rounded-lg overflow-hidden border border-gray-800">
                <Button
                  variant="ghost"
                  onClick={() => setViewMode('my')}
                  className={cn(
                    'rounded-none text-xs px-6',
                    viewMode === 'my' 
                      ? 'bg-purple-500/20 text-purple-300 hover:bg-purple-500/30' 
                      : 'text-gray-400 hover:text-gray-300'
                  )}
                >
                  My Creations
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => setViewMode('all')}
                  className={cn(
                    'rounded-none text-xs px-6',
                    viewMode === 'all' 
                      ? 'bg-purple-500/20 text-purple-300 hover:bg-purple-500/30' 
                      : 'text-gray-400 hover:text-gray-300'
                  )}
                >
                  All Creations
                </Button>
              </div>

              {/* Search */}
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                <input
                  type="text"
                  placeholder="Search by title or creator..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 text-xs bg-gray-900/50 border border-gray-800 rounded-lg text-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500/30"
                />
              </div>

              {/* Category Filter */}
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger className="w-[180px] text-xs bg-gray-900/50 border-gray-800 text-gray-300">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent className="bg-gray-900/95 border-gray-800">
                  {categories.map((cat) => (
                    <SelectItem 
                      key={cat.value} 
                      value={cat.value}
                      className="text-xs text-gray-300 focus:bg-purple-500/20 focus:text-purple-300"
                    >
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

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

          {/* Gallery Grid */}
          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          >
            {mockArtPieces.length === 0 ? (
              <motion.div 
                variants={item}
                className="col-span-full text-center py-24"
              >
                <Filter className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                <p className="text-gray-400 mb-6">No art pieces found</p>
                <Button 
                  variant="outline"
                  className="text-xs bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 border-purple-500/20 hover:border-purple-500/30"
                >
                  Generate New Art
                </Button>
              </motion.div>
            ) : (
              mockArtPieces.map((piece) => (
                <motion.div
                  key={piece.id}
                  variants={item}
                  className="group relative rounded-xl overflow-hidden bg-gray-900/50 backdrop-blur-sm border border-gray-800 hover:border-purple-500/20 transition-all duration-300 cursor-pointer"
                  onClick={() => setSelectedPiece(piece)}
                >
                  <img
                    src={piece.imageUrl}
                    alt={piece.title}
                    className="w-full aspect-square object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="absolute bottom-0 left-0 right-0 p-4">
                      <h3 className="text-sm font-medium text-gray-100 mb-2">{piece.title}</h3>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 text-xs text-gray-300">
                          <span className="flex items-center gap-1">
                            <Heart className="w-3 h-3" /> {piece.likes}
                          </span>
                          <span className="flex items-center gap-1">
                            <MessageSquare className="w-3 h-3" /> {piece.comments}
                          </span>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="secondary"
                            size="icon"
                            className="h-7 w-7 bg-gray-900/50 hover:bg-gray-900/70"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigator.share({
                                title: piece.title,
                                text: `Check out this pixel art: ${piece.title}`,
                                url: piece.imageUrl,
                              }).catch(console.error);
                            }}
                          >
                            <Share2 className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="secondary"
                            size="icon"
                            className="h-7 w-7 bg-gray-900/50 hover:bg-gray-900/70"
                            onClick={(e) => {
                              e.stopPropagation();
                              window.open(piece.imageUrl, '_blank');
                            }}
                          >
                            <Download className="h-3 w-3" />
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

        {/* Art Details Modal */}
        <ArtDetailsModal
          art={selectedPiece}
          onClose={() => setSelectedPiece(null)}
        />
      </div>
    </RootLayout>
  );
} 