import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { getUserFromRequest } from '@/lib/auth';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Query single art piece by ID
    const { data: art, error } = await supabase
      .from('art')
      .select(`
        *,
        marketplace_listings (*)
      `)
      .eq('id', params.id)
      .single();

    if (error) throw error;

    if (!art) {
      return NextResponse.json(
        { error: 'Art not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(art);

  } catch (error) {
    console.error('Error fetching art:', error);
    return NextResponse.json(
      { error: 'Failed to fetch art' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get the art piece to check ownership and get the image URL
    const { data: art, error: fetchError } = await supabase
      .from('art')
      .select('*')
      .eq('id', params.id)
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

    // Extract filename from the URL
    const urlParts = art.image_url.split('/');
    const filename = urlParts[urlParts.length - 1];
    const filePath = `generated/${filename}`;

    // Delete from storage
    const { error: storageError } = await supabase.storage
      .from('images')
      .remove([filePath]);

    if (storageError) throw storageError;

    // Delete from database
    const { error: deleteError } = await supabase
      .from('art')
      .delete()
      .eq('id', params.id);

    if (deleteError) throw deleteError;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete art error:', error);
    return NextResponse.json(
      { error: 'Failed to delete art' },
      { status: 500 }
    );
  }
} 