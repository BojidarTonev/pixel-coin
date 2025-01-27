import { supabase } from './supabase';

interface User {
  id: number;
  wallet_address: string;
  created_at: string;
}

export async function getUserFromRequest(request: Request): Promise<User | null> {
  try {
    // Get the wallet address from the Authorization header
    const authHeader = request.headers.get('Authorization');
    if (!authHeader) return null;

    const wallet_address = authHeader.replace('Bearer ', '');
    if (!wallet_address) return null;

    // Get user from database
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('wallet_address', wallet_address)
      .single();

    if (error) throw error;
    return user;
  } catch (error) {
    console.error('Get user error:', error);
    return null;
  }
} 