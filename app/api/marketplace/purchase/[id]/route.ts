import { NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';
import { supabase } from '@/lib/supabase';
import { Connection, PublicKey } from '@solana/web3.js';
import { Metaplex } from '@metaplex-foundation/js';

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get the listing with art details
    const { data: listing, error: fetchError } = await supabase
      .from('marketplace_listings')
      .select(`
        *,
        art:art_id (*)
      `)
      .eq('id', params.id)
      .single();

    if (fetchError) throw fetchError;
    if (!listing) {
      return NextResponse.json(
        { error: 'Listing not found' },
        { status: 404 }
      );
    }

    // Check if listing is active
    if (listing.status !== 'active') {
      return NextResponse.json(
        { error: 'Listing is not active' },
        { status: 400 }
      );
    }

    // Initialize Solana connection
    const connection = new Connection(process.env.NEXT_PUBLIC_SOLANA_RPC_URL!);
    const metaplex = new Metaplex(connection);

    // Transfer NFT ownership
    const nft = await metaplex.nfts().findByMint({ mintAddress: new PublicKey(listing.nft_address) });
    
    // Update listing status
    const { error: updateListingError } = await supabase
      .from('marketplace_listings')
      .update({ status: 'sold' })
      .eq('id', listing.id);

    if (updateListingError) throw updateListingError;

    // Update art ownership
    const { error: updateArtError } = await supabase
      .from('art')
      .update({ user_id: user.id })
      .eq('id', listing.art_id);

    if (updateArtError) throw updateArtError;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Purchase error:', error);
    return NextResponse.json(
      { error: 'Failed to complete purchase' },
      { status: 500 }
    );
  }
} 