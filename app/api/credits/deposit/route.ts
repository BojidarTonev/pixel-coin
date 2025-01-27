import { NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';
import { supabase } from '@/lib/supabase';

export async function POST(request: Request) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      return new NextResponse(
        JSON.stringify({ error: 'Authentication required' }),
        { status: 401 }
      );
    }

    const body = await request.json();
    const { amount, transaction_hash } = body;

    if (!amount || !transaction_hash) {
      return new NextResponse(
        JSON.stringify({ error: 'Amount and transaction hash are required' }),
        { status: 400 }
      );
    }

    // Start a transaction to update credits and create transaction record
    const { data: { session } } = await supabase.auth.getSession();
    const { error: transactionError } = await supabase.rpc('deposit_credits', {
      p_user_id: user.id,
      p_amount: amount,
      p_transaction_hash: transaction_hash
    });

    if (transactionError) {
      console.error('Error processing deposit:', transactionError);
      return new NextResponse(
        JSON.stringify({ error: 'Failed to process deposit' }),
        { status: 500 }
      );
    }

    return new NextResponse(
      JSON.stringify({ success: true }),
      { status: 200 }
    );

  } catch (error) {
    console.error('Error in deposit endpoint:', error);
    return new NextResponse(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500 }
    );
  }
} 