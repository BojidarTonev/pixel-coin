import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { GeneratedImage } from '../features/imageSlice';

interface GenerateImageRequest {
  prompt: string;
  width?: number;
  height?: number;
}

export const imageGenerationService = createApi({
  reducerPath: 'imageGenerationApi',
  baseQuery: fetchBaseQuery({ baseUrl: '/api' }),
  endpoints: (builder) => ({
    generateImage: builder.mutation<GeneratedImage, GenerateImageRequest>({
      query: (requestBody) => ({
        url: '/generate',
        method: 'POST',
        body: requestBody,
      }),
    }),
    getAllImages: builder.query<GeneratedImage[], void>({
      query: () => 'images',
    }),
  }),
});

export const { 
  useGenerateImageMutation,
  useGetAllImagesQuery,
} = imageGenerationService; 