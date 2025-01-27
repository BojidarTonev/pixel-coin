import { NextResponse } from 'next/server';
import Replicate from 'replicate';
import { supabase } from '@/lib/supabase';
import { getUserFromRequest } from '@/lib/auth';

const MODEL_VERSION = "stability-ai/sdxl:39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b";

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN!,
});

async function uploadImageToSupabase(imageUrl: string, userId: number): Promise<string> {
  try {
    // Fetch the image
    const response = await fetch(imageUrl);
    const imageBuffer = await response.arrayBuffer();

    // Generate a unique filename
    const filename = `${userId}_${Date.now()}.png`;
    const filePath = `generated/${filename}`;

    // Upload to Supabase Storage
    const { error } = await supabase.storage
      .from('pixel-coin')
      .upload(filePath, imageBuffer, {
        contentType: 'image/png',
        cacheControl: '3600',
        upsert: false
      });

    if (error) throw error;

    // Get the public URL
    const { data: { publicUrl } } = supabase.storage
      .from('pixel-coin')
      .getPublicUrl(filePath);

    return publicUrl;
  } catch (error) {
    console.error('Upload error:', error);
    throw new Error('Failed to upload image');
  }
}

export async function POST(request: Request) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check credits balance
    const { data: credits, error: creditsError } = await supabase
      .from('credits')
      .select('credits_balance')
      .eq('user_id', user.id)
      .single();

    if (creditsError) throw creditsError;
    if (credits.credits_balance < 1) {
      return NextResponse.json(
        { error: 'Insufficient credits' },
        { status: 400 }
      );
    }

    const { prompt } = await request.json();

    // Generate image using Replicate
    const output = await replicate.run(MODEL_VERSION, {
      input: {
        prompt,
        width: 768,
        height: 768,
        refine: "expert_ensemble_refiner",
        scheduler: "K_EULER",
        lora_scale: 0.6,
        num_outputs: 1,
        guidance_scale: 7.5,
        apply_watermark: false,
        high_noise_frac: 0.8,
        negative_prompt: "",
        prompt_strength: 0.8,
        num_inference_steps: 50
      }
    });

    if (!output || !Array.isArray(output)) {
      throw new Error('Invalid response from Replicate');
    }

    const imageUrl = output[0];

    // Upload to Supabase Storage
    const storedImageUrl = await uploadImageToSupabase(imageUrl, user.id);

    // Save to art table
    const { data: art, error: artError } = await supabase
      .from('art')
      .insert([{
        user_id: user.id,
        title: prompt,
        image_url: storedImageUrl,
      }])
      .select()
      .single();

    if (artError) throw artError;

    // Deduct credits
    const { error: updateError } = await supabase.rpc('use_credits', {
      p_user_id: user.id,
      p_amount: 1
    });

    if (updateError) throw updateError;

    return NextResponse.json({ art });
  } catch (error) {
    console.error('Generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate image' },
      { status: 500 }
    );
  }
} 