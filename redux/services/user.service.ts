import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

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
  baseQuery: fetchBaseQuery({ baseUrl: '/api' }),
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
    
    getCurrentUser: builder.query<User | null, void>({
      query: () => '/auth/me',
      providesTags: ['User'],
    }),
  }),
});

export const {
  useAuthenticateUserMutation,
  useGetCurrentUserQuery,
} = userApi; 