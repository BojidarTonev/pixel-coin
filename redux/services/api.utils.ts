/* eslint-disable @typescript-eslint/no-explicit-any */
import { fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { setUserLoggedOut } from '../features/app-state-slice';
import { toast } from '@/hooks/use-toast';

const baseUrl = '/api';

const createBaseQuery = fetchBaseQuery({
  baseUrl,
  prepareHeaders: (headers) => {
    // Get wallet address from localStorage
    const walletAddress = window.localStorage.getItem('walletAddress');
    if (walletAddress) {
      headers.set('authorization', walletAddress);
    }
    return headers;
  }
});

export const baseQueryWithOnQueryStarted = async (
  args: any,
  api: any,
  extraOptions: any,
): Promise<any> => {
  try {
    const result = await createBaseQuery(args, api, extraOptions);
    const { error } = result;
    const { dispatch } = api;

    if (error) {
      const { status } = error;
      if (status == 401) {
        dispatch(setUserLoggedOut());
        toast({
          variant: 'destructive',
          title: 'Authentication Error',
          description: 'Your session has expired. Please log in again.',
        });
      }
    }
    return result;
  } catch (error) {
    console.error('Error during baseQuery execution:', error);
  }
};
