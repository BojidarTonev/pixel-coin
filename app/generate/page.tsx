'use client';

import { useState } from 'react';
import { useGenerateImageMutation } from '@/redux/services/imageGeneration.service';
import { Button } from '@/components/ui/button';
import { Loader2, Download, Share2, RefreshCcw, Coins } from 'lucide-react';
import { Toaster, toast } from 'sonner';
import { FetchBaseQueryError } from '@reduxjs/toolkit/query';
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
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface GeneratedImage {
  id: string;
  url: string;
  prompt: string;
}

interface ErrorResponse {
  error: string;
}

interface GenerateFormData {
  style: string;
  pixelationIntensity: number;
  prompt: string;
}

interface APIError {
  data?: {
    message: string;
  };
}

function formatGenerationPrompt(formData: GenerateFormData): string {
  const { style, pixelationIntensity, prompt } = formData;
  
  // Map pixelation intensity to descriptive terms
  const pixelationDescription = pixelationIntensity <= 25 ? "subtle"
    : pixelationIntensity <= 50 ? "moderate"
    : pixelationIntensity <= 75 ? "pronounced"
    : "intense";

  // Map style to setting descriptions
  const styleSettings: Record<string, string> = {
    'knights': 'castle courtyard',
    'fantasy': 'mystical forest',
    'towns': 'medieval marketplace',
    'dungeons': 'torch-lit dungeon',
    'battles': 'battlefield',
  };

  const setting = styleSettings[style] || 'medieval realm';

  return `Create a pixelated medieval scene featuring ${prompt} in a ${setting}. The scene should incorporate ${style} elements with ${pixelationDescription} pixel art detail, styled in retro pixel art with vibrant, earthy tones and a resolution evocative of classic 16-bit games. Ensure the atmosphere aligns with a medieval fantasy aesthetic, with detailed textures and immersive visuals.`;
}

const styles = [
  { value: 'knights', label: 'Knights & Castles', description: 'Medieval castle and knight themes' },
  { value: 'fantasy', label: 'Medieval Fantasy', description: 'Magical medieval elements' },
  { value: 'towns', label: 'Pixel Towns', description: 'Medieval village aesthetics' },
];

export default function GeneratePage() {
  const [prompt, setPrompt] = useState('');
  const [images, setImages] = useState<GeneratedImage[]>([]);
  const [generateImage, { isLoading }] = useGenerateImageMutation();
  const [intensity, setIntensity] = useState([50]);
  const [style, setStyle] = useState('knights');

  const handleGenerate = async () => {
    if (!prompt) return;

    try {
      const formattedPrompt = formatGenerationPrompt({
        style: style,
        pixelationIntensity: intensity[0],
        prompt: prompt
      });

      const result = await generateImage({ prompt: formattedPrompt }).unwrap();
      setImages(prevImages => [result, ...prevImages]);
      toast.success('Image generated successfully!');
    } catch (error: unknown) {
      const apiError = error as APIError;
      toast.error(apiError?.data?.message || 'Failed to generate image');
    }
  };

  return (
    <RootLayout>
      <div className="min-h-screen bg-black/75 backdrop-blur-sm relative">
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/50" />
        
        <div className="container mx-auto px-8 py-12 relative z-10">
          <Toaster position="top-center" />
          
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
              className="flex items-center gap-2 bg-purple-500/10 px-4 py-2 rounded-lg border border-purple-500/20"
            >
              <Coins className="w-4 h-4 text-purple-400" />
              <span className="text-xs text-purple-300">Credits: 15</span>
            </motion.div>
          </div>

          {/* Main Content */}
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
                  disabled={isLoading || !prompt.trim()}
                  className="w-full bg-purple-500 hover:bg-purple-600 text-white shadow-lg shadow-purple-500/20"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Generating...
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
                      <img
                        src={image.url}
                        alt={image.prompt}
                        className="w-full rounded-lg object-cover"
                      />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-4">
                        <Button
                          variant="secondary"
                          size="icon"
                          onClick={() => window.open(image.url, '_blank')}
                          className="bg-gray-900/50 hover:bg-gray-900/70"
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="secondary"
                          size="icon"
                          onClick={() => {
                            navigator.share({
                              title: 'Generated Image',
                              text: image.prompt,
                              url: image.url,
                            }).catch(console.error);
                          }}
                          className="bg-gray-900/50 hover:bg-gray-900/70"
                        >
                          <Share2 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="secondary"
                          size="icon"
                          onClick={handleGenerate}
                          className="bg-gray-900/50 hover:bg-gray-900/70"
                        >
                          <RefreshCcw className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </RootLayout>
  );
} 