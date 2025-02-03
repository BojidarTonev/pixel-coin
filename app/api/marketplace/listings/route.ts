import { NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';
import { supabase } from '@/lib/supabase';

export async function POST(request: Request) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    console.log('Creating listing...', request);
    const { art_id, price, token_account } = await request.json();


    // Get the art piece to verify ownership and minting status
    const { data: art, error: fetchError } = await supabase
      .from('art')
      .select('*')
      .eq('id', art_id)
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

    // Check if minted
    if (!art.is_minted) {
      return NextResponse.json(
        { error: 'Art must be minted before listing' },
        { status: 400 }
      );
    }

    // Create listing
    const { data: listing, error: createError } = await supabase
      .from('marketplace_listings')
      .insert([{
        user_id: user.id,
        art_id: art_id,
        nft_address: art.minted_nft_address,
        price: price,
        status: 'active',
        token_account: token_account
      }])

      .select()
      .single();

    if (createError) throw createError;

    return NextResponse.json(listing);
  } catch (error) {
    console.error('Create listing error:', error);
    return NextResponse.json(
      { error: 'Failed to create listing' },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    // Get all active listings with art details
    const { data: listings, error } = await supabase
      .from('marketplace_listings')
      .select(`
        *,
        art:art_id (*)
      `)
      .eq('status', 'active')
      .order('created_at', { ascending: false });

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12');
    const offset = (page - 1) * limit;

    const { count } = await supabase
      .from('marketplace_listings')
      .select('*', { count: 'exact', head: true });
    if (error) throw error;

    return NextResponse.json({
      data: listings,
      hasMore: offset + limit < (count || 0),
      total: count
    });
  } catch (error) {
    console.error('Get listings error:', error);
    return NextResponse.json(
      { error: 'Failed to get listings' },
      { status: 500 }
    );
  }
} 