import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithOnQueryStarted } from './api.utils';

interface ErrorResponse {
  status: number;
  data: {
    message: string;
  };
}

interface Art {
  id: number;
  title: string;
  image_url: string;
  created_at: string;
  user_id: number;
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
      transformErrorResponse: (response: ErrorResponse) => {
        if (response.status === 401) {
          return { status: 401, data: { message: 'Authentication required' } };
        }
        return response;
      }
    }),
    getAllArt: builder.query<Art[], void>({
      query: () => ({
        url: '/art',
        method: 'GET'
      }),
      transformErrorResponse: (response: ErrorResponse) => {
        if (response.status === 401) {
          return { status: 401, data: { message: 'Authentication required' } };
        }
        return response;
      }
    }),
    getUserArt: builder.query<Art[], void>({
      query: () => ({
        url: '/art/user',
        method: 'GET'
      }),
      transformErrorResponse: (response: ErrorResponse) => {
        if (response.status === 401) {
          return { status: 401, data: { message: 'Authentication required' } };
        }
        return response;
      }
    }),
    deleteArt: builder.mutation<void, number>({
      query: (id) => ({
        url: `/art/${id}`,
        method: 'DELETE'
      }),
      transformErrorResponse: (response: ErrorResponse) => {
        if (response.status === 401) {
          return { status: 401, data: { message: 'Authentication required' } };
        }
        return response;
      }
    }),
    getUserCredits: builder.query<Credits, void>({
      query: () => ({
        url: '/credits/balance',
        method: 'GET'
      }),
      providesTags: ['Credits'],
      transformErrorResponse: (response: ErrorResponse) => {
        if (response.status === 401) {
          return { status: 401, data: { message: 'Authentication required' } };
        }
        return response;
      }
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