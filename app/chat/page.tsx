'use client';

import { useState, useRef, useEffect } from 'react';
import { RootLayout } from '@/components/root-layout';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Book, ChevronDown, Image as ImageIcon, Loader2, Wallet } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from '@/lib/utils';

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'ai';
  timestamp: Date;
}

interface ArtPiece {
  id: string;
  title: string;
  imageUrl: string;
  description: string;
  style: string;
}

// Temporary mock data
const mockArtPieces: ArtPiece[] = [
  {
    id: '1',
    title: 'Knight of Dawn',
    imageUrl: 'https://via.placeholder.com/400x400',
    description: 'A noble knight created in the Knights & Castles style.',
    style: 'knights'
  },
  // Add more mock items as needed
];

export default function ChatPage() {
  const [selectedArt, setSelectedArt] = useState<ArtPiece>(mockArtPieces[0]);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: 'Greetings, adventurer. What wisdom do you seek?',
      sender: 'ai',
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      content: inputMessage,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, newMessage]);
    setInputMessage('');
    setIsLoading(true);

    // Simulate AI response
    setTimeout(() => {
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        content: 'I shall share my knowledge with you, brave soul. *The knight adjusts their pixelated armor*',
        sender: 'ai',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, aiResponse]);
      setIsLoading(false);
    }, 1500);
  };

  return (
    <RootLayout>
      <div className="min-h-screen bg-black/75 backdrop-blur-sm relative">
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/50" />
        
        <div className="relative z-10 flex h-screen">
          {/* Main Chat Area */}
          <div className={cn(
            "flex-1 flex flex-col transition-all duration-300",
            isSidebarOpen ? "lg:mr-[320px]" : "lg:mr-[60px]"
          )}>
            {/* Header */}
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-6 border-b border-gray-800 flex items-center justify-between bg-gray-900/50"
            >
              <div className="flex items-center gap-4">
                <div className="relative">
                  <img
                    src={selectedArt.imageUrl}
                    alt={selectedArt.title}
                    className="w-12 h-12 rounded-full object-cover border-2 border-purple-500/20"
                  />
                  <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-purple-500 rounded-full border-2 border-gray-900" />
                </div>
                <div>
                  <h1 className="text-sm font-medium text-gray-100">{selectedArt.title}</h1>
                  <p className="text-xs text-gray-400">{selectedArt.style}</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="text-gray-400 hover:text-gray-300 lg:hidden"
              >
                <Book className="h-4 w-4" />
              </Button>
            </motion.div>

            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              <AnimatePresence initial={false}>
                {messages.map((message) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className={cn(
                      "flex",
                      message.sender === 'user' ? "justify-end" : "justify-start"
                    )}
                  >
                    <div
                      className={cn(
                        "max-w-[80%] rounded-2xl px-4 py-2 text-sm",
                        message.sender === 'user'
                          ? "bg-purple-500/20 text-purple-100"
                          : "bg-gray-900/50 text-gray-300 border border-gray-800"
                      )}
                    >
                      {message.content}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
              {isLoading && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex justify-start"
                >
                  <div className="bg-gray-900/50 rounded-2xl px-4 py-2 text-sm text-gray-400 border border-gray-800">
                    <Loader2 className="h-4 w-4 animate-spin" />
                  </div>
                </motion.div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-6 border-t border-gray-800 bg-gray-900/50">
              <div className="flex gap-4">
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  placeholder="Ask your creation something..."
                  className="flex-1 bg-gray-900/50 border border-gray-800 rounded-lg px-4 py-2 text-sm text-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500/30"
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={!inputMessage.trim() || isLoading}
                  className="bg-purple-500 hover:bg-purple-600 text-white shadow-lg shadow-purple-500/20"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
              <p className="mt-2 text-xs text-gray-500 text-center">1 credit per message</p>
            </div>
          </div>

          {/* Sidebar */}
          <motion.div
            initial={{ width: 320 }}
            animate={{ 
              width: isSidebarOpen ? 320 : 60,
              padding: isSidebarOpen ? 24 : 12
            }}
            transition={{ duration: 0.3 }}
            className={cn(
              "fixed right-0 top-0 h-full border-l border-gray-800 bg-gray-900/50 backdrop-blur-sm",
              "hidden lg:block"
            )}
          >
            <div className={cn(
              "h-full flex flex-col",
              isSidebarOpen ? "space-y-6" : "space-y-4"
            )}>
              {/* Toggle Button */}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="self-end text-gray-400 hover:text-gray-300"
              >
                <ChevronDown className={cn(
                  "h-4 w-4 transition-transform duration-300",
                  isSidebarOpen ? "rotate-0" : "rotate-180"
                )} />
              </Button>

              {/* Art Preview */}
              <div>
                {isSidebarOpen ? (
                  <>
                    <h2 className="text-sm font-medium text-gray-200 mb-2">Selected Art</h2>
                    <img
                      src={selectedArt.imageUrl}
                      alt={selectedArt.title}
                      className="w-full aspect-square rounded-lg object-cover mb-4 border border-gray-800"
                    />
                    <p className="text-xs text-gray-400 leading-relaxed">
                      {selectedArt.description}
                    </p>
                  </>
                ) : (
                  <div className="relative">
                    <img
                      src={selectedArt.imageUrl}
                      alt={selectedArt.title}
                      className="w-9 h-9 rounded-full object-cover border border-gray-800"
                    />
                    <div className="absolute -bottom-1 -right-1 w-2 h-2 bg-purple-500 rounded-full border border-gray-900" />
                  </div>
                )}
              </div>

              {/* Art Switcher */}
              <div className={cn(
                "space-y-2",
                !isSidebarOpen && "w-9"
              )}>
                {isSidebarOpen && (
                  <label className="text-xs text-gray-400">Switch Art</label>
                )}
                <Select value={selectedArt.id} onValueChange={(value) => {
                  const art = mockArtPieces.find(a => a.id === value);
                  if (art) setSelectedArt(art);
                }}>
                  <SelectTrigger className={cn(
                    "text-xs bg-gray-900/50 border-gray-800 text-gray-300",
                    isSidebarOpen ? "w-full" : "w-9 h-9 p-0"
                  )}>
                    {isSidebarOpen ? (
                      <SelectValue placeholder="Select art" />
                    ) : (
                      <ImageIcon className="h-4 w-4 text-gray-400" />
                    )}
                  </SelectTrigger>
                  <SelectContent className="bg-gray-900/95 border-gray-800">
                    {mockArtPieces.map((art) => (
                      <SelectItem 
                        key={art.id} 
                        value={art.id}
                        className="text-xs text-gray-300 focus:bg-purple-500/20 focus:text-purple-300"
                      >
                        {art.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Main Content Area */}
              <div className="flex-1 min-h-0 overflow-y-auto">
                {/* Add any additional content here */}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </RootLayout>
  );
} 