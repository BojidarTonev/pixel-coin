import { NextResponse } from 'next/server';
import Replicate from 'replicate';

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

const MODEL_VERSION = "7762fd07cf82c948538e41f63f77d685e02b063e37e496e96eefd46c929f9bdc";

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json();

    if (!prompt) {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      );
    }

    if (!process.env.REPLICATE_API_TOKEN) {
      return NextResponse.json(
        { error: 'Replicate API token is not configured' },
        { status: 500 }
      );
    }

    console.log('Generating image with prompt:', prompt);

    // Create the prediction
    const prediction = await replicate.predictions.create({
      version: MODEL_VERSION,
      input: {
        prompt,
        width: 768,
        height: 768,
        num_outputs: 1,
        scheduler: "K_EULER",
        num_inference_steps: 25,
        guidance_scale: 7.5,
        refine: "expert_ensemble_refiner",
        high_noise_frac: 0.8,
        prompt_strength: 0.8,
        apply_watermark: false,
      },
    });

    console.log('Prediction created:', prediction);

    // Wait for the prediction to complete
    const output = await replicate.wait(prediction);
    console.log('Prediction completed:', output);

    const imageUrl = Array.isArray(output.output) ? output.output[0] : output.output;

    if (!imageUrl || typeof imageUrl !== 'string' || !imageUrl.startsWith('http')) {
      console.error('Invalid image URL:', imageUrl);
      throw new Error('Invalid image URL received from the model');
    }

    const generatedImage = {
      id: Date.now().toString(),
      url: imageUrl,
      prompt,
      created_at: new Date().toISOString(),
    };

    return NextResponse.json(generatedImage);
  } catch (error) {
    console.error('Error generating image:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to generate image' },
      { status: 500 }
    );
  }
} 