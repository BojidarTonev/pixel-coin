'use client';

import { RootLayout } from '@/components/root-layout';
import { motion } from 'framer-motion';
import { 
  Sparkles, 
  Rocket, 
  Star, 
  Zap,
  Shield,
  Palette,
  MessageSquare,
  Coins,
  Globe,
  Cpu
} from 'lucide-react';

export default function RoadmapPage() {
  const phases = [
    {
      title: "Phase 1: Foundation",
      status: "completed",
      items: [
        { icon: <Shield className="w-4 h-4" />, text: "Secure wallet integration" },
        { icon: <Palette className="w-4 h-4" />, text: "Basic pixel art generation" },
        { icon: <MessageSquare className="w-4 h-4" />, text: "Chat functionality" },
        { icon: <Coins className="w-4 h-4" />, text: "Credits system implementation" }
      ]
    },
    {
      title: "Phase 2: Enhancement",
      status: "in-progress",
      items: [
        { icon: <Star className="w-4 h-4" />, text: "Advanced art styles and customization" },
        { icon: <Zap className="w-4 h-4" />, text: "Improved AI interactions" },
        { icon: <Globe className="w-4 h-4" />, text: "Community features" },
        { icon: <Cpu className="w-4 h-4" />, text: "Performance optimizations" }
      ]
    },
    {
      title: "Phase 3: Expansion",
      status: "planned",
      items: [
        { icon: <Sparkles className="w-4 h-4" />, text: "NFT marketplace integration" },
        { icon: <Rocket className="w-4 h-4" />, text: "Cross-chain support" },
        { icon: <Star className="w-4 h-4" />, text: "Advanced AI features" },
        { icon: <Globe className="w-4 h-4" />, text: "Global art competitions" }
      ]
    }
  ];

  return (
    <RootLayout>
      <div className="min-h-screen bg-black/75 backdrop-blur-sm relative">
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/50" />
        
        <div className="container mx-auto px-6 py-12 relative z-10">
          {/* Header */}
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-16"
          >
            <h1 className="text-3xl font-medium text-gray-100 drop-shadow-lg mb-4">
              Project Roadmap
            </h1>
            <p className="text-sm text-gray-300 max-w-xl mx-auto">
              Our vision for the future of PixelForge, bringing together AI, blockchain, and creativity
            </p>
          </motion.div>

          {/* Roadmap Timeline */}
          <div className="max-w-4xl mx-auto">
            {phases.map((phase, phaseIndex) => (
              <motion.div
                key={phase.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: phaseIndex * 0.1 }}
                className="mb-12 last:mb-0"
              >
                <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-xl p-6 relative overflow-hidden">
                  {/* Background Gradient */}
                  <div className="absolute inset-0 bg-gradient-to-b from-purple-500/5 to-transparent" />
                  
                  {/* Status Badge */}
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-medium text-gray-100">{phase.title}</h3>
                    <span className={`
                      px-3 py-1 rounded-full text-xs font-medium
                      ${phase.status === 'completed' ? 'bg-green-500/10 text-green-400' : 
                        phase.status === 'in-progress' ? 'bg-yellow-500/10 text-yellow-400' :
                        'bg-purple-500/10 text-purple-400'}
                    `}>
                      {phase.status === 'completed' ? 'Completed' :
                       phase.status === 'in-progress' ? 'In Progress' :
                       'Planned'}
                    </span>
                  </div>

                  {/* Items Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {phase.items.map((item, index) => (
                      <div 
                        key={index}
                        className="flex items-center gap-3 p-4 bg-gray-900/30 rounded-lg border border-gray-800/50"
                      >
                        <div className="w-8 h-8 rounded-full bg-purple-500/10 flex items-center justify-center text-purple-400">
                          {item.icon}
                        </div>
                        <span className="text-sm text-gray-300">{item.text}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Footer */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-center mt-16"
          >
            <p className="text-sm text-gray-400 max-w-xl mx-auto">
              Our roadmap is continuously evolving based on community feedback and technological advancements.
              Stay tuned for more exciting updates!
            </p>
          </motion.div>
        </div>
      </div>
    </RootLayout>
  );
} 