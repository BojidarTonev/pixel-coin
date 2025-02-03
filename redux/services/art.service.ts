import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithOnQueryStarted } from './api.utils';

export interface Art {
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

export interface PaginatedResponse<T> {
  data: T[];
  hasMore: boolean;
  total: number;
}

export interface GetArtParams {
  page: number;
  limit: number;
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
    getAllArt: builder.query<PaginatedResponse<Art>, GetArtParams>({
      query: ({ page, limit }) => ({
        url: '/art',
        method: 'GET',
        params: { page, limit }
      }),
      serializeQueryArgs: ({ endpointName }) => {
        return endpointName;
      },
      merge: (currentCache, newItems, { arg: { page } }) => {
        if (page === 1) {
          return newItems;
        }
        if (currentCache && newItems) {
          return {
            ...newItems,
            data: [...(currentCache.data || []), ...newItems.data]
          };
        }
        return newItems;
      },
      forceRefetch({ currentArg, previousArg }) {
        return currentArg?.page !== previousArg?.page;
      },
      keepUnusedDataFor: 0,
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