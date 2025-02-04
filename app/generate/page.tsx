'use client';

import { useState } from 'react';
import { useGenerateArtMutation, useGetUserCreditsQuery } from '@/redux/services/art.service';
import { Button } from '@/components/ui/button';
import { Loader2, Download, Share2, RefreshCcw, Coins, Wallet, Image as ImageIcon } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { RootLayout } from '@/components/root-layout';
import { motion } from 'framer-motion';
import { Slider } from '@/components/ui/slider';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAppSelector } from '@/redux/store';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

// Cost constants
const GENERATION_COST = 5; // credits per generation

interface GeneratedImage {
  id: string;
  url: string;
  prompt: string;
}

const styles = [
  { value: 'knights', label: 'Knights & Castles', description: 'Medieval castle and knight themes' },
  { value: 'fantasy', label: 'Medieval Fantasy', description: 'Magical medieval elements' },
  { value: 'towns', label: 'Pixel Towns', description: 'Medieval village aesthetics' },
];

export default function GeneratePage() {
  const router = useRouter();
  const [prompt, setPrompt] = useState('');
  const [images, setImages] = useState<GeneratedImage[]>([]);
  const [generateArt, { isLoading: isGenerating }] = useGenerateArtMutation();
  const { data: credits, isLoading: isLoadingCredits } = useGetUserCreditsQuery();
  const [intensity, setIntensity] = useState([50]);
  const [style, setStyle] = useState('knights');
  const { isUserLoggedIn } = useAppSelector(state => state.appState)

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    
    const formattedPrompt = prompt.trim();
    
    if (!credits || credits.credits_balance < GENERATION_COST) {
      toast({
        title: 'Insufficient Credits',
        description: 'You need at least 5 credits to generate art. Please deposit more credits.',
        variant: 'destructive'
      });
      return;
    }

    toast({
      title: 'Generating Art',
      description: (
        <div className="flex items-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Please wait while we create your masterpiece...</span>
        </div>
      ),
      variant: 'loading'
    });

    try {
      const result = await generateArt({ prompt: formattedPrompt }).unwrap();
      
      if (!result.image_url) {
        throw new Error('No image URL in response');
      }

      setImages(prevImages => [{
        id: result.id ? result.id.toString() : Date.now().toString(),
        url: result.image_url,
        prompt: formattedPrompt
      }, ...prevImages]);

      toast({
        title: 'Art Generated',
        description: 'Your pixel art has been created successfully!',
        variant: 'default'
      });
    } catch (error: unknown) {
      const err = error as { status?: number; data?: { error?: string } };
      if (err.status === 401) {
        toast({
          title: 'Authentication Required',
          description: 'Please connect your wallet to generate art.',
          variant: 'destructive'
        });
      } else {
        toast({
          title: 'Generation Failed',
          description: err.data?.error || 'Failed to generate art. Please try again.',
          variant: 'destructive'
        });
      }
    }
  };

  const handleReset = () => {
    setPrompt('');
    setImages(prevImages => prevImages.filter(img => img.id !== images[0].id));
    toast({
      title: 'Reset Complete',
      description: 'Ready for a new generation!',
      variant: 'default'
    });
  };

  return (
    <RootLayout>
      <div className="min-h-screen bg-black/75 backdrop-blur-sm relative overflow-x-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/50" />
        
        <div className="container mx-auto px-8 py-12 relative z-10">
          {/* Header */}
          <div className="flex justify-between items-center mb-12">
            <motion.h1 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-2xl font-medium text-gray-100 drop-shadow-lg"
            >
              Generate Medieval Pixel Art
            </motion.h1>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-4"
            >
              <div className="flex items-center gap-2 bg-purple-500/10 px-4 py-2 rounded-lg border border-purple-500/20">
                <Coins className="w-4 h-4 text-purple-400" />
                <span className="text-xs text-purple-300">
                  {!isUserLoggedIn ? (
                    'Connect wallet'
                  ) : isLoadingCredits ? (
                    <Loader2 className="w-3 h-3 animate-spin" />
                  ) : (
                    `Credits: ${credits?.credits_balance || 0}`
                  )}
                </span>
              </div>
              <div className="text-xs text-gray-400">
                Cost per generation: {GENERATION_COST} credits
              </div>
            </motion.div>
          </div>

          {/* Main Content */}
          {!isUserLoggedIn ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-md mx-auto text-center"
            >
              <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-xl p-8">
                <Wallet className="w-12 h-12 text-purple-400 mx-auto mb-6" />
                <h2 className="text-xl font-medium text-gray-200 mb-3">Connect Your Wallet</h2>
                <p className="text-sm text-gray-400 mb-6">
                  Connect your wallet to start generating medieval pixel art
                </p>
              </div>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              {/* Left Column - Settings */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-8"
              >
                {/* Settings */}
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-xs text-gray-400">Style</label>
                    <Select value={style} onValueChange={setStyle}>
                      <SelectTrigger className="w-full text-xs bg-gray-900/50 border-gray-800 text-gray-300">
                        <SelectValue placeholder="Select style" />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-900/95 border-gray-800">
                        {styles.map((s) => (
                          <SelectItem 
                            key={s.value} 
                            value={s.value}
                            className="text-xs text-gray-300 focus:bg-purple-500/20 focus:text-purple-300"
                          >
                            {s.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs text-gray-400">Pixelation Intensity</label>
                    <Slider
                      value={intensity}
                      onValueChange={setIntensity}
                      max={100}
                      step={1}
                      className="py-4"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs text-gray-400">Prompt</label>
                    <textarea
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      placeholder="Describe what you want to generate..."
                      className="w-full px-4 py-3 rounded-lg text-xs bg-gray-900/50 border border-gray-800 text-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500/30 min-h-[100px]"
                    />
                  </div>

                  <Button
                    onClick={handleGenerate}
                    disabled={isLoadingCredits || !prompt.trim() || isGenerating}
                    className="w-full bg-purple-500 hover:bg-purple-600 text-white shadow-lg shadow-purple-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating Masterpiece...
                      </>
                    ) : (
                      'Generate Pixel Art'
                    )}
                  </Button>
                </div>
              </motion.div>

              {/* Right Column - Preview */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-8"
              >
                {images.length === 0 ? (
                  <div className="rounded-xl border border-gray-800 bg-gray-900/50 backdrop-blur-sm p-12 flex flex-col items-center justify-center min-h-[400px]">
                    <p className="text-sm text-gray-500">
                      Your generated art will appear here
                    </p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {images.map((image) => (
                      <div
                        key={image.id}
                        className="relative group rounded-xl overflow-hidden bg-gray-900/50 backdrop-blur-sm border border-gray-800 p-4"
                      >
                        <div className="relative aspect-square">
                          <Image
                            src={image.url}
                            alt={image.prompt}
                            fill
                            className="object-cover rounded-lg"
                            unoptimized
                          />
                        </div>
                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center gap-3">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => window.open(image.url, '_blank')}
                              className="h-8 w-8 bg-gray-900/50 hover:bg-purple-500/20 text-gray-300 hover:text-purple-300 border border-gray-800 hover:border-purple-500/30"
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                navigator.share({
                                  title: 'Generated Image',
                                  text: image.prompt,
                                  url: image.url,
                                }).catch(console.error);
                              }}
                              className="h-8 w-8 bg-gray-900/50 hover:bg-purple-500/20 text-gray-300 hover:text-purple-300 border border-gray-800 hover:border-purple-500/30"
                            >
                              <Share2 className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={handleReset}
                              className="h-8 w-8 bg-gray-900/50 hover:bg-purple-500/20 text-gray-300 hover:text-purple-300 border border-gray-800 hover:border-purple-500/30"
                            >
                              <RefreshCcw className="h-4 w-4" />
                            </Button>
                          </div>
                          <div className="absolute bottom-6 left-0 right-0 flex justify-center">
                            <Button
                              variant="secondary"
                              onClick={() => router.push('/gallery')}
                              className="bg-purple-500/20 hover:bg-purple-500/30 text-purple-100 border border-purple-500/30 hover:border-purple-500/50 shadow-lg shadow-purple-500/20"
                            >
                              <ImageIcon className="h-4 w-4 mr-2" />
                              See in Gallery
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            </div>
          )}
        </div>
      </div>
    </RootLayout>
  );
} 