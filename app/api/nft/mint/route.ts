import { NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';
import { db } from '@/lib/db';

export async function POST(req: Request) {
  try {
    const user = await getUserFromRequest(req);
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { art_id } = await req.json();

    if (!art_id) {
      return NextResponse.json(
        { error: 'Art ID is required' },
        { status: 400 }
      );
    }

    // Get the art piece and verify ownership
    const { data: art, error: artError } = await db
      .from('art')
      .select(`
        *,
        user:user_id (
          id,
          wallet_address
        )
      `)
      .eq('id', art_id)
      .single();

    if (artError || !art) {
      console.error('Art fetch error:', artError);
      return NextResponse.json(
        { error: 'Art not found' },
        { status: 404 }
      );
    }

    if (art.user_id !== user.id) {
      return NextResponse.json(
        { error: 'Unauthorized - You can only mint your own artwork' },
        { status: 403 }
      );
    }

    if (art.is_minted) {
      return NextResponse.json(
        { error: 'Art is already minted' },
        { status: 400 }
      );
    }

    // Prepare metadata for the NFT
    const metadata = {
      name: art.title,
      description: art.description || `Pixel Art created by ${user.wallet_address}`,
      image: art.image_url,
      attributes: [
        {
          trait_type: 'Creator',
          value: user.wallet_address || 'Anonymous'
        },
        {
          trait_type: 'Created Date',
          value: new Date(art.created_at).toISOString().split('T')[0]
        }
      ]
    };

    // Return the art and metadata for client-side minting
    return NextResponse.json({
      art,
      metadata
    });
  } catch (error) {
    console.error('NFT metadata preparation error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
} 
