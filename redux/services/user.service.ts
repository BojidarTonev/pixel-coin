import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithOnQueryStarted } from './api.utils';

interface User {
  id: number;
  wallet_address: string;
  created_at: string;
}

interface UserResponse {
  user: User;
  isNewUser: boolean;
}

export const userApi = createApi({
  reducerPath: 'userApi',
  baseQuery: baseQueryWithOnQueryStarted,
  tagTypes: ['User'],
  endpoints: (builder) => ({
    authenticateUser: builder.mutation<UserResponse, { wallet_address: string }>({
      query: (credentials) => ({
        url: '/auth',
        method: 'POST',
        body: credentials,
      }),
      invalidatesTags: ['User'],
    }),
    
    getCurrentUser: builder.query<User, void>({
      query: () => ({
        url: '/auth/me',
        method: 'GET'
      }),
      providesTags: ['User'],
    }),
  }),
});

export const {
  useAuthenticateUserMutation,
  useGetCurrentUserQuery,
} = userApi; 