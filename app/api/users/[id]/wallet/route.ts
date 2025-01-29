import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { data: user, error } = await supabase
      .from('users')
      .select('wallet_address')
      .eq('id', params.id)
      .single();

    if (error) throw error;
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error('Error fetching user wallet:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user wallet' },
      { status: 500 }
    );
  }
} 