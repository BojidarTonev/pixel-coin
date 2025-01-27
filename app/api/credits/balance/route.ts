import { NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';
import { supabase } from '@/lib/supabase';

export async function GET(request: Request) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      return new NextResponse(
        JSON.stringify({ error: 'Authentication required' }),
        { status: 401 }
      );
    }

    // Get user's credits from the database
    const { data, error } = await supabase
      .from('credits')
      .select('credits_balance')
      .eq('user_id', user.id)
      .single();

    if (error) {
      console.error('Error fetching credits:', error);
      return new NextResponse(
        JSON.stringify({ error: 'Failed to fetch credits' }),
        { status: 500 }
      );
    }

    // If no credits record exists, return 0
    if (!data) {
      return new NextResponse(
        JSON.stringify({ credits_balance: 0 }),
        { status: 200 }
      );
    }

    return new NextResponse(
      JSON.stringify(data),
      { status: 200 }
    );

  } catch (error) {
    console.error('Error in credits balance endpoint:', error);
    return new NextResponse(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500 }
    );
  }
} 