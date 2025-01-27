import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: Request) {
  try {
    const { wallet_address } = await request.json();

    if (!wallet_address) {
      return NextResponse.json(
        { error: 'Wallet address is required' },
        { status: 400 }
      );
    }

    // Check if user exists
    const { data: existingUser, error: fetchError } = await supabase
      .from('users')
      .select('*')
      .eq('wallet_address', wallet_address)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') {
      throw fetchError;
    }

    let user = existingUser;
    let isNewUser = false;

    // If user doesn't exist, create new user and initialize credits
    if (!existingUser) {
      isNewUser = true;

      // Create user
      const { data: newUser, error: createError } = await supabase
        .from('users')
        .insert([{ wallet_address }])
        .select()
        .single();

      if (createError) throw createError;
      user = newUser;

      // Initialize credits for new user
      const { error: creditsError } = await supabase
        .from('credits')
        .insert([{ user_id: user.id, credits_balance: 0 }]);

      if (creditsError) throw creditsError;
    }

    return NextResponse.json({ user, isNewUser });
  } catch (error) {
    console.error('Auth error:', error);
    return NextResponse.json(
      { error: 'Authentication failed' },
      { status: 500 }
    );
  }
} 