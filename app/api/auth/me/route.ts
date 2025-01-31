import { NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const user = await getUserFromRequest(request);
    
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error('Get current user error:', error);
    return NextResponse.json(
      { error: 'Failed to get current user' },
      { status: 500 }
    );
  }
} 