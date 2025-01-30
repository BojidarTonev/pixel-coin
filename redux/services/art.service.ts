import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithOnQueryStarted } from './api.utils';

interface Art {
  id: number;
  title: string;
  image_url: string;
  created_at: string;
  user_id: number;
  is_minted: boolean;
  minted_nft_address?: string;
  minted_token_uri?: string;
  creator_wallet: string;
  owner_wallet: string;
}

interface Credits {
  credits_balance: number;
}

export const artApi = createApi({
  reducerPath: 'artApi',
  baseQuery: baseQueryWithOnQueryStarted,
  tagTypes: ['Credits'],
  endpoints: (builder) => ({
    generateArt: builder.mutation<Art, { prompt: string }>({
      query: (body) => ({
        url: '/generate',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Credits'],
    }),
    getAllArt: builder.query<Art[], void>({
      query: () => ({
        url: '/art',
        method: 'GET'
      })
    }),
    getUserArt: builder.query<Art[], void>({
      query: () => ({
        url: '/art/user',
        method: 'GET'
      }),
    }),
    deleteArt: builder.mutation<void, number>({
      query: (id) => ({
        url: `/art/${id}`,
        method: 'DELETE'
      }),
    }),
    getUserCredits: builder.query<Credits, void>({
      query: () => ({
        url: '/credits/balance',
        method: 'GET'
      }),
      providesTags: ['Credits'],
    })
  })
});

export const {
  useGenerateArtMutation,
  useGetAllArtQuery,
  useGetUserArtQuery,
  useDeleteArtMutation,
  useGetUserCreditsQuery
} = artApi; 