import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface GeneratedImage {
  id: string;
  url: string;
  prompt: string;
  createdAt: string;
}

interface ImageState {
  generatedImages: GeneratedImage[];
  isGenerating: boolean;
  error: string | null;
}

const initialState: ImageState = {
  generatedImages: [],
  isGenerating: false,
  error: null,
};

export const imageSlice = createSlice({
  name: 'images',
  initialState,
  reducers: {
    setGenerating: (state, action: PayloadAction<boolean>) => {
      state.isGenerating = action.payload;
    },
    addGeneratedImage: (state, action: PayloadAction<GeneratedImage>) => {
      state.generatedImages.unshift(action.payload);
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
});

export const { setGenerating, addGeneratedImage, setError } = imageSlice.actions;

export default imageSlice; 