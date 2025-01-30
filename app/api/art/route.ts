import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12');
    const offset = (page - 1) * limit;

    // Get total count
    const { count } = await supabase
      .from('art')
      .select('*', { count: 'exact', head: true });

    // Get paginated data
    const { data: art, error } = await supabase
      .from('art')
      .select('*')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;

    return NextResponse.json({
      data: art,
      hasMore: offset + limit < (count || 0),
      total: count
    });
  } catch (error) {
    console.error('Get art error:', error);
    return NextResponse.json(
      { error: 'Failed to get art' },
      { status: 500 }
    );
  }
} 