import { createClient } from '@supabase/supabase-js';

// Define database types
export interface Art {
  id: number;
  userId: number;
  title: string;
  imageUrl: string;
  createdAt: string;
  mintedNftAddress?: string;
  mintedTokenUri?: string;
  isMinted: boolean;
}

export interface MarketplaceListing {
  id: number;
  userId: number;
  artId: number;
  nftAddress: string;
  price: number;
  status: 'active' | 'sold' | 'canceled';
  createdAt: string;
}

if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
  throw new Error('Missing env.NEXT_PUBLIC_SUPABASE_URL');
}
if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error('Missing env.SUPABASE_SERVICE_ROLE_KEY');
}

// Create a Supabase client with the service role key for admin access
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);