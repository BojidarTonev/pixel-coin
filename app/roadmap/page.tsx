import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { RootLayout } from '@/components/root-layout';
import { Check, MessageSquare } from 'lucide-react';

interface Milestone {
  id: number;
  title: string;
  description: string;
  date: string;
  status: 'completed' | 'current' | 'upcoming';
  phase: string;
}

const milestones: Milestone[] = [
  {
    id: 1,
    title: 'Project Launch',
    description: 'Initial release of PixelForge with core art generation features.',
    date: 'Q4 2024',
    status: 'completed',
    phase: 'Phase 1: Foundations'
  },
  {
    id: 2,
    title: 'Token Integration',
    description: 'Introduce the token deposit system for credit purchases.',
    date: 'Q1 2025',
    status: 'current',
    phase: 'Phase 2: Core Features'
  },
  {
    id: 3,
    title: 'AI-Powered Chat',
    description: 'Allow users to chat with their pixel creations using AI.',
    date: 'Q2 2025',
    status: 'upcoming',
    phase: 'Phase 2: Core Features'
  },
  {
    id: 4,
    title: 'Community Features',
    description: 'Launch features for sharing and collaborating on pixel art.',
    date: 'Q3 2025',
    status: 'upcoming',
    phase: 'Phase 3: Community Expansion'
  }
];

export default function RoadmapPage() {
  return (
    <RootLayout>
      <div className="min-h-screen p-8 bg-black/40 backdrop-blur-sm">
        {/* Header */}
        <header className="text-center mb-16 space-y-4">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-300 to-pink-300 bg-clip-text text-transparent drop-shadow-sm">
            Project Roadmap
          </h1>
          <p className="text-gray-400">
            Explore our journey and see what lies ahead for PixelForge
          </p>
        </header>

        {/* Timeline */}
        <div className="max-w-4xl mx-auto relative">
          {/* Timeline line */}
          <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-0.5 bg-gradient-to-b from-purple-500/50 to-pink-500/50" />

          {/* Milestones */}
          <div className="space-y-16">
            {milestones.map((milestone, index) => (
              <div key={milestone.id} className="relative">
                {/* Phase label (only show if different from previous) */}
                {(index === 0 || milestones[index - 1].phase !== milestone.phase) && (
                  <div className="text-center mb-8">
                    <span className="px-4 py-2 bg-purple-500/20 backdrop-blur-sm rounded-full text-purple-300 text-sm">
                      {milestone.phase}
                    </span>
                  </div>
                )}

                {/* Milestone card */}
                <div className={cn(
                  "flex items-center gap-8",
                  index % 2 === 0 ? "flex-row" : "flex-row-reverse"
                )}>
                  {/* Content */}
                  <div className={cn(
                    "w-1/2 p-6 rounded-lg transition-all duration-300",
                    "bg-black/80 backdrop-blur-md border border-gray-800",
                    "hover:bg-black/90 hover:border-purple-500/50",
                    milestone.status === 'current' && "border-purple-500/50 shadow-lg shadow-purple-500/20"
                  )}>
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="text-lg font-semibold text-gray-200">
                        {milestone.title}
                      </h3>
                      <span className={cn(
                        "px-2 py-1 rounded text-xs backdrop-blur-sm",
                        milestone.status === 'completed' && "bg-green-500/20 text-green-300",
                        milestone.status === 'current' && "bg-purple-500/20 text-purple-300",
                        milestone.status === 'upcoming' && "bg-gray-500/20 text-gray-300"
                      )}>
                        {milestone.status.charAt(0).toUpperCase() + milestone.status.slice(1)}
                      </span>
                    </div>
                    <p className="text-gray-400 text-sm mb-2">{milestone.description}</p>
                    <span className="text-xs text-gray-500">{milestone.date}</span>
                  </div>

                  {/* Timeline marker */}
                  <div className="relative w-1/2 flex items-center justify-center">
                    <div className={cn(
                      "w-4 h-4 rounded-full border-2 backdrop-blur-sm",
                      milestone.status === 'completed' && "bg-green-500/80 border-green-400",
                      milestone.status === 'current' && "bg-purple-500/80 border-purple-400 animate-pulse",
                      milestone.status === 'upcoming' && "bg-gray-800/80 border-gray-700"
                    )}>
                      {milestone.status === 'completed' && (
                        <Check className="w-3 h-3 text-white" />
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="max-w-2xl mx-auto mt-24 p-8 rounded-lg bg-black/80 backdrop-blur-md border border-gray-800 text-center">
          <p className="text-gray-300 mb-4">Have suggestions for our roadmap? Let us know!</p>
          <Button
            className="bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 hover:text-purple-100 border-purple-500/20 hover:border-purple-500/40 backdrop-blur-sm"
            variant="outline"
          >
            <MessageSquare className="w-4 h-4 mr-2" />
            Submit Feedback
          </Button>
        </div>

        {/* Footer */}
        <footer className="text-center mt-16 text-sm text-gray-500">
          <p>Roadmap is subject to change as we grow and adapt.</p>
        </footer>
      </div>
    </RootLayout>
  );
} 