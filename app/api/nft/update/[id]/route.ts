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

    const { minted_nft_address, minted_token_uri } = await request.json();

    // Update art record with NFT details
    const { error: updateError } = await supabase
      .from('art')
      .update({
        is_minted: true,
        minted_nft_address,
        minted_token_uri
      })
      .eq('id', params.id)
      .eq('user_id', user.id);

    if (updateError) throw updateError;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Update NFT error:', error);
    return NextResponse.json(
      { error: 'Failed to update NFT details' },
      { status: 500 }
    );
  }
} 