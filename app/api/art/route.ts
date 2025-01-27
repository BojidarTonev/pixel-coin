import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  try {
    const { data: art, error } = await supabase
      .from('art')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json(art);
  } catch (error) {
    console.error('Get art error:', error);
    return NextResponse.json(
      { error: 'Failed to get art' },
      { status: 500 }
    );
  }
} 