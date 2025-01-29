import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithOnQueryStarted } from './api.utils';

interface Credits {
  credits_balance: number;
}

interface Transaction {
  id: number;
  user_id: number;
  amount: number;
  status: 'completed' | 'pending' | 'failed';
  transaction_hash: string;
  created_at: string;
}

interface DepositCreditsRequest {
  amount: number;
  transaction_hash: string;
}

export const creditsApi = createApi({
  reducerPath: 'creditsApi',
  baseQuery: baseQueryWithOnQueryStarted,
  tagTypes: ['Credits', 'Transactions'],
  endpoints: (builder) => ({
    getCreditsBalance: builder.query<Credits, void>({
      query: () => '/credits/balance',
      providesTags: ['Credits']
    }),
    getTransactions: builder.query<Transaction[], void>({
      query: () => '/credits/transactions',
      providesTags: ['Transactions']
    }),
    depositCredits: builder.mutation<void, DepositCreditsRequest>({
      query: (body) => ({
        url: '/credits/deposit',
        method: 'POST',
        body
      }),
      invalidatesTags: ['Credits', 'Transactions']
    })
  })
});

export const {
  useGetCreditsBalanceQuery,
  useGetTransactionsQuery,
  useDepositCreditsMutation
} = creditsApi; 