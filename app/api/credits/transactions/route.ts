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

    // Get user's credit transactions from the database
    const { data, error } = await supabase
      .from('credit_transactions')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(10);

    if (error) {
      console.error('Error fetching transactions:', error);
      return new NextResponse(
        JSON.stringify({ error: 'Failed to fetch transactions' }),
        { status: 500 }
      );
    }

    return new NextResponse(
      JSON.stringify(data || []),
      { status: 200 }
    );

  } catch (error) {
    console.error('Error in transactions endpoint:', error);
    return new NextResponse(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500 }
    );
  }
} 