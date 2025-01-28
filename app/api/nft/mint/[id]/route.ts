import { NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';
import { supabase } from '@/lib/supabase';

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

    // Get the art piece
    const { data: art, error: fetchError } = await supabase
      .from('art')
      .select('*')
      .eq('id', params.id)
      .single();

    if (fetchError) throw fetchError;
    if (!art) {
      return NextResponse.json(
        { error: 'Art not found' },
        { status: 404 }
      );
    }

    // Check ownership
    if (art.user_id !== user.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    // Check if already minted
    if (art.is_minted) {
      return NextResponse.json(
        { error: 'Art is already minted' },
        { status: 400 }
      );
    }

    // Return metadata for client-side minting
    return NextResponse.json({
      art,
      metadata: {
        name: art.title,
        description: `Pixel Art created by ${user.wallet_address}`,
        image: art.imageUrl,
      }
    });
  } catch (error) {
    console.error('Mint NFT error:', error);
    return NextResponse.json(
      { error: 'Failed to prepare NFT metadata' },
      { status: 500 }
    );
  }
} 