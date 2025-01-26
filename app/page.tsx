'use client';

import { RootLayout } from '@/components/root-layout';
import { Button } from '@/components/ui/button';
import { Palette, MessageSquare, Wallet, Image as ImageIcon, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';

interface Feature {
  icon: React.ReactNode;
  title: string;
  description: string;
}

interface Step {
  icon: React.ReactNode;
  title: string;
  description: string;
}

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

const features: Feature[] = [
  {
    icon: <Palette className="h-12 w-12" />,
    title: 'AI-Generated Pixel Art',
    description: 'Transform any image into a medieval pixel masterpiece using our advanced AI technology.',
  },
  {
    icon: <MessageSquare className="h-12 w-12" />,
    title: 'Chat with Your Art',
    description: 'Breathe life into your creations and chat with them in a unique, AI-driven medieval roleplay experience.',
  },
  {
    icon: <Wallet className="h-12 w-12" />,
    title: 'Token-Powered Access',
    description: "Use credits backed by our project token to unlock the platform's features.",
  }
];

const steps: Step[] = [
  {
    icon: <Wallet className="h-8 w-8" />,
    title: 'Connect Wallet',
    description: 'Securely link your crypto wallet to get started.'
  },
  {
    icon: <ImageIcon className="h-8 w-8" />,
    title: 'Generate Art',
    description: 'Upload your image and watch it transform into pixel art.'
  },
  {
    icon: <MessageSquare className="h-8 w-8" />,
    title: 'Chat with Art',
    description: 'Interact with your creations using AI.'
  },
  {
    icon: <Palette className="h-8 w-8" />,
    title: 'Earn & Create',
    description: 'Use your credits to generate more art.'
  }
];

export default function HomePage() {
  return (
    <RootLayout>
      {/* Hero Section */}
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        transition={{ duration: 0.5 }}
        className="relative overflow-hidden bg-black/75 backdrop-blur-sm min-h-screen flex items-center"
      >
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/50" />
        <div className="container mx-auto px-8 py-40 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-center max-w-2xl mx-auto"
          >
            <h1 className="text-3xl font-bold mb-10 bg-clip-text text-transparent bg-gradient-to-r from-purple-300 to-pink-300 drop-shadow-lg">
              Forge Your Medieval Pixel Art
            </h1>
            <p className="text-sm text-gray-100 mb-16 leading-relaxed max-w-xl mx-auto drop-shadow-lg">
              Transform your imagination into stunning medieval pixel art masterpieces powered by AI and blockchain technology.
            </p>
            <div className="flex gap-8 justify-center">
              <Link href="/generate">
                <Button size="default" className="bg-purple-500 hover:bg-purple-600 text-xs px-8 shadow-lg shadow-purple-500/20">
                  Get Started <ArrowRight className="ml-2 h-3 w-3" />
                </Button>
              </Link>
              <Button 
                size="default" 
                className="text-xs px-8 bg-purple-400/10 hover:bg-purple-400/20 text-purple-300 border-purple-500/20 hover:border-purple-500/30 backdrop-blur-sm shadow-lg transition-all duration-300"
              >
                Learn More
              </Button>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </RootLayout>
  );
}
