'use client';

import { useState, useRef, useEffect } from 'react';
import { RootLayout } from '@/components/root-layout';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { Send, ChevronLeft, ChevronRight, Loader2, ChevronDown, ChevronUp, Coins, Wallet } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useGetUserArtQuery, useGetUserCreditsQuery } from '@/redux/services/art.service';
import { format } from 'date-fns';
import { customToast as toast } from '@/components/ui/toast';
import { useWallet } from '@solana/wallet-adapter-react';
import { useWalletModal } from '@solana/wallet-adapter-react-ui';

// Cost constants
const MESSAGE_COST = 1; // credits per message

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'ai';
  timestamp: Date;
}

interface ArtPiece {
  id: number;
  title: string;
  image_url: string;
  created_at: string;
  user_id: number;
}

const ITEMS_PER_PAGE = 6;

export default function ChatPage() {
  const { data: userArt = [], isLoading: isLoadingArt, error: artError } = useGetUserArtQuery();
  const { data: credits, isLoading: isLoadingCredits } = useGetUserCreditsQuery();
  const [selectedArt, setSelectedArt] = useState<ArtPiece | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [previousConnectionState, setPreviousConnectionState] = useState(false);
  const { connected, publicKey } = useWallet();
  const { setVisible } = useWalletModal();

  // Check wallet connection status and show toasts
  useEffect(() => {
    const checkWalletConnection = () => {
      const walletAddress = window.localStorage.getItem('walletAddress');
      const isCurrentlyLoggedIn = !!walletAddress;
      setIsLoggedIn(isCurrentlyLoggedIn);

      // Show toast only when connection state changes
      if (isCurrentlyLoggedIn && !previousConnectionState) {
        toast.success(
          'Wallet Connected',
          `Connected to ${walletAddress.slice(0, 4)}...${walletAddress.slice(-4)}`
        );
      } else if (!isCurrentlyLoggedIn && previousConnectionState) {
        toast.success('Wallet Disconnected');
        // Clear selected art and messages when disconnected
        setSelectedArt(null);
        setMessages([]);
      }

      setPreviousConnectionState(isCurrentlyLoggedIn);
    };

    // Check when component mounts and when wallet connection changes
    checkWalletConnection();

    // Set up event listener for storage changes
    window.addEventListener('storage', checkWalletConnection);

    return () => {
      window.removeEventListener('storage', checkWalletConnection);
    };
  }, [connected, publicKey, previousConnectionState]);

  // Set initial selected art
  useEffect(() => {
    if (userArt.length > 0 && !selectedArt && isLoggedIn) {
      setSelectedArt(userArt[0]);
      initializeChat(userArt[0]);
    }
  }, [userArt, isLoggedIn]);

  // Scroll to bottom when messages change
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Handle art loading error
  useEffect(() => {
    if (artError) {
      if ('status' in artError && artError.status === 401) {
        toast.error('Authentication required', 'Something went wrong while loading your art pieces');
      } else {
        toast.error('Error loading art', 'Something went wrong while loading your art pieces');
      }
    }
  }, [artError]);

  const initializeChat = (art: ArtPiece) => {
    setMessages([{
      id: '1',
      content: `Greetings! I am your pixel art companion. I see you've selected "${art.title}". What would you like to know about this piece?`,
      sender: 'ai',
      timestamp: new Date()
    }]);
  };

  const handleArtSelect = (art: ArtPiece) => {
    setSelectedArt(art);
    initializeChat(art);
    setInputMessage('');
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || !selectedArt) return;

    // Check if user has enough credits
    if (credits && credits.credits_balance < MESSAGE_COST) {
      toast.error(
        "Insufficient Credits",
        `You need ${MESSAGE_COST} credit to send a message. Current balance: ${credits.credits_balance}`
      );
      return;
    }

    const newMessage: Message = {
      id: Date.now().toString(),
      content: inputMessage,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, newMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: inputMessage,
          artId: selectedArt.id
        })
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Authentication required');
        }
        throw new Error('Failed to send message');
      }

      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        content: 'I shall share my knowledge with you, brave soul. *The knight adjusts their pixelated armor*',
        sender: 'ai',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, aiResponse]);
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === 'Authentication required') {
          toast.error('Authentication required', 'Please connect your wallet to continue chatting');
        } else {
          toast.error('Error sending message', 'Failed to send your message. Please try again.');
        }
        // Remove the failed message from the chat
        setMessages(prev => prev.slice(0, -1));
      }
    } finally {
      setIsLoading(false);
    }
  };

  const totalPages = Math.ceil(userArt.length / ITEMS_PER_PAGE);
  const displayedArt = userArt.slice(
    currentPage * ITEMS_PER_PAGE,
    (currentPage + 1) * ITEMS_PER_PAGE
  );

  const handleConnectWallet = () => {
    setVisible(true);
  };

  return (
    <RootLayout>
      <div className="min-h-screen bg-black/75 backdrop-blur-sm relative overflow-x-hidden">
        <div className="container mx-auto px-4 py-8">
          <div className="flex gap-6">
            {/* Art Selection Sidebar */}
            <div className={cn(
              "bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-xl transition-all duration-300",
              isSidebarOpen ? "w-80" : "w-20"
            )}>
              <div className="p-4 border-b border-gray-800 flex items-center justify-between">
                {isSidebarOpen && (
                  <div className="flex items-center gap-4 flex-1">
                    <h2 className="text-sm font-medium text-gray-300">Your Art Collection</h2>
                    <div className="flex items-center gap-2 bg-purple-500/10 px-3 py-1 rounded-lg border border-purple-500/20 ml-auto">
                      <Coins className="w-3 h-3 text-purple-400" />
                      <span className="text-xs text-purple-300">
                        {!isLoggedIn ? (
                          'Connect wallet'
                        ) : isLoadingCredits ? (
                          '...'
                        ) : (
                          credits?.credits_balance || 0
                        )}
                      </span>
                    </div>
                  </div>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                  className="text-gray-400 hover:text-gray-300"
                >
                  {isSidebarOpen ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                </Button>
              </div>

              {isLoadingArt ? (
                <div className="flex items-center justify-center p-8">
                  <Loader2 className="h-6 w-6 animate-spin text-purple-500" />
                </div>
              ) : !isLoggedIn ? (
                <div className="flex flex-col items-center justify-center p-8 text-center gap-3">
                  <Wallet className="h-8 w-8 text-purple-500/50" />
                  <p className="text-sm text-gray-400">Connect your wallet to view your personal art collection</p>
                  <Button
                    onClick={handleConnectWallet}
                    className="mt-4 bg-purple-500 hover:bg-purple-600 text-white shadow-lg shadow-purple-500/20"
                  >
                    <Wallet className="w-4 h-4 mr-2" />
                    Connect Wallet
                  </Button>
                </div>
              ) : userArt.length === 0 ? (
                <div className="p-4 text-center">
                  <p className="text-sm text-gray-400">No art pieces found</p>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 gap-2 p-2 max-h-[calc(100vh-15rem)] overflow-y-auto">
                    {displayedArt.map((art) => (
                      <button
                        key={art.id}
                        onClick={() => handleArtSelect(art)}
                        className={cn(
                          "relative group rounded-lg overflow-hidden transition-all duration-300",
                          selectedArt?.id === art.id ? "ring-2 ring-purple-500" : "hover:ring-2 hover:ring-purple-500/50"
                        )}
                      >
                        <img
                          src={art.image_url}
                          alt={art.title}
                          className="w-full aspect-square object-cover"
                        />
                        {isSidebarOpen && (
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            <div className="absolute bottom-0 left-0 right-0 p-2">
                              <p className="text-xs font-medium text-gray-100 truncate">{art.title}</p>
                              <p className="text-xs text-gray-400">{format(new Date(art.created_at), 'MMM d, yyyy')}</p>
                            </div>
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                  
                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="p-4 border-t border-gray-800 flex items-center justify-center gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setCurrentPage(prev => Math.max(0, prev - 1))}
                        disabled={currentPage === 0}
                        className="h-8 w-8 text-gray-400 hover:text-gray-300"
                      >
                        <ChevronUp className="h-4 w-4" />
                      </Button>
                      <span className="text-xs text-gray-400">
                        {currentPage + 1} / {totalPages}
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setCurrentPage(prev => Math.min(totalPages - 1, prev + 1))}
                        disabled={currentPage === totalPages - 1}
                        className="h-8 w-8 text-gray-400 hover:text-gray-300"
                      >
                        <ChevronDown className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Chat Section */}
            <div className="flex-1 bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-xl overflow-hidden">
              {!isLoggedIn ? (
                <div className="flex flex-col items-center justify-center h-[calc(100vh-8rem)] text-center p-8">
                  <Wallet className="w-12 h-12 text-purple-400 mb-6" />
                  <h2 className="text-xl font-medium text-gray-200 mb-3">Connect Your Wallet</h2>
                  <p className="text-sm text-gray-400 mb-6 max-w-md">
                    Connect your wallet to chat with your art pieces and bring them to life through AI-driven conversations
                  </p>
                  <Button
                    onClick={handleConnectWallet}
                    className="bg-purple-500 hover:bg-purple-600 text-white shadow-lg shadow-purple-500/20"
                  >
                    <Wallet className="w-4 h-4 mr-2" />
                    Connect Wallet
                  </Button>
                </div>
              ) : selectedArt ? (
                <div className="flex flex-col h-[calc(100vh-8rem)]">
                  {/* Chat Header */}
                  <div className="p-4 border-b border-gray-800">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-lg overflow-hidden">
                          <img
                            src={selectedArt.image_url}
                            alt={selectedArt.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div>
                          <h2 className="text-sm font-medium text-gray-100">{selectedArt.title}</h2>
                          <p className="text-xs text-gray-400">{format(new Date(selectedArt.created_at), 'MMM d, yyyy')}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {messages.map((message) => (
                      <motion.div
                        key={message.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={cn(
                          "flex gap-3 max-w-[80%]",
                          message.sender === 'user' ? "ml-auto" : "mr-auto"
                        )}
                      >
                        {message.sender === 'ai' && (
                          <div className="h-8 w-8 rounded-lg overflow-hidden flex-shrink-0">
                            <img
                              src={selectedArt.image_url}
                              alt="AI"
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}
                        <div className={cn(
                          "rounded-xl p-3 text-sm",
                          message.sender === 'user' 
                            ? "bg-purple-500/20 text-purple-100" 
                            : "bg-gray-800/50 text-gray-300"
                        )}>
                          {message.content}
                        </div>
                      </motion.div>
                    ))}
                    {isLoading && (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex gap-3 max-w-[80%]"
                      >
                        <div className="h-8 w-8 rounded-lg overflow-hidden flex-shrink-0">
                          <img
                            src={selectedArt.image_url}
                            alt="AI"
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="bg-gray-800/50 rounded-xl p-3">
                          <Loader2 className="h-5 w-5 animate-spin text-purple-500" />
                        </div>
                      </motion.div>
                    )}
                    <div ref={chatEndRef} />
                  </div>

                  {/* Input */}
                  <div className="p-4 border-t border-gray-800">
                    <div className="flex gap-2">
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
                        placeholder="Ask about your art..."
                        className="flex-1 bg-gray-900/50 text-gray-100 text-sm rounded-lg border border-gray-800 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500/30"
                      />
                      <Button
                        onClick={handleSendMessage}
                        disabled={!inputMessage.trim() || isLoading}
                        className="bg-purple-500/10 hover:bg-purple-500/20 text-purple-300"
                      >
                        <Send className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="flex items-center justify-between text-sm text-gray-400 mt-2 px-4">
                      <div className="flex items-center gap-2">
                        <Coins className="w-4 h-4" />
                        <span>Cost per message: {MESSAGE_COST} credit</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span>
                          {!isLoggedIn ? (
                            'Connect wallet to view credits'
                          ) : (
                            `Available credits: ${isLoadingCredits ? '...' : credits?.credits_balance || 0}`
                          )}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="h-[calc(100vh-8rem)] flex items-center justify-center">
                  <p className="text-gray-400">Select an art piece to start chatting</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </RootLayout>
  );
} 