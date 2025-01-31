import { createApi } from '@reduxjs/toolkit/query/react';
import { Art, MarketplaceListing } from '@/lib/supabase';
import { Connection, clusterApiUrl } from '@solana/web3.js';
import { Metaplex, walletAdapterIdentity, WalletAdapter } from '@metaplex-foundation/js';
import { baseQueryWithOnQueryStarted } from './api.utils';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';

export interface MintNFTResponse {
  art: Art;
  metadata: {
    name: string;
    description: string;
    image: string;
  };
}

export interface PaginatedResponse<T> {
  data: T[];
  hasMore: boolean;
  total: number;
}

export interface GetListingsParams {
  page?: number;
  limit?: number;
}

export const nftApi = createApi({
  reducerPath: 'nftApi',
  baseQuery: baseQueryWithOnQueryStarted,
  tagTypes: ['NFT', 'Listings'],
  endpoints: (builder) => ({
    mintNFT: builder.mutation<MintNFTResponse, { artId: number, wallet: WalletAdapter }>({
      async queryFn({ artId, wallet }, _queryApi, _extraOptions, fetchWithBQ) {
        try {
          const result = await fetchWithBQ({
            url: `/nft/mint`,
            method: 'POST',
            body: { art_id: artId }
          });
          if (result.error) throw new Error('API request failed');
          
          const response = result.data as MintNFTResponse;

          const connection = new Connection(
            clusterApiUrl(WalletAdapterNetwork.Devnet),
            { commitment: 'confirmed' }
          );

          const metaplex = Metaplex.make(connection)
            .use(walletAdapterIdentity(wallet));

          const metadata = {
            name: response.metadata.name.slice(0, 32),
            description: response.metadata.description,
            image: response.metadata.image
          };

          console.log('Creating NFT with metadata:', metadata);

          // Create NFT with metadata in one step
          const { nft } = await metaplex
            .nfts()
            .create({
              name: metadata.name,
              uri: metadata.image,
              sellerFeeBasisPoints: 500,
              symbol: 'PXART',
              creators: [
                {
                  address: wallet.publicKey!,
                  share: 100
                }
              ],
              maxSupply: null,
              isCollection: false,
              uses: null
            });

          console.log('created nft => ', nft);

          // Update art record with NFT details
          const updateResult = await fetchWithBQ({
            url: `/nft/update`,
            method: 'POST',
            body: {
              art_id: artId,
              is_minted: true,
              minted_nft_address: nft.address.toString(),
              minted_token_uri: metadata.image
            }
          });

          if (updateResult.error) {
            console.error('Failed to update art record:', updateResult.error);
            throw new Error('Failed to update art record after minting');
          }

          return { data: response };
        } catch (error) {
          console.error('Mint NFT error:', error);

          if (error instanceof Error) {
            // Check for specific error types
            if (error.message?.includes('insufficient funds')) {
              return {
                error: {
                  status: 400,
                  data: { message: 'Insufficient SOL balance. Please add more SOL to your wallet.' }
                }
              };
            }

            if (error.message?.includes('not found')) {
              return {
                error: {
                  status: 408,
                  data: { message: 'Transaction timeout. Please check your wallet for status.' }
                }
              };
            }
          }

          return {
            error: {
              status: 500,
              data: { message: 'Failed to mint NFT. Please try again.' }
            }
          };
        }
      }
    }),

    // Marketplace Operations
    createListing: builder.mutation<MarketplaceListing, { artId: number; price: number }>({
      query: ({ artId, price }) => ({
        url: '/marketplace/listings',
        method: 'POST',
        body: {
          art_id: artId,
          price
        }
      }),
      invalidatesTags: ['Listings']
    }),

    getListings: builder.query<PaginatedResponse<MarketplaceListing>, GetListingsParams>({
      query: ({ page = 1, limit = 12 } = {}) => ({
        url: '/marketplace/listings',
        params: { page, limit }
      }),
      providesTags: ['Listings']
    }),

    purchaseListing: builder.mutation<void, number>({
      query: (id) => ({
        url: `/marketplace/purchase/${id}`,
        method: 'POST'
      }),
      invalidatesTags: ['Listings']
    }),

    getUserListings: builder.query<MarketplaceListing[], void>({
      query: () => ({
        url: '/marketplace/listings/user',
        method: 'GET'
      }),
      providesTags: ['Listings']
    })
  })
});

export const {
  useMintNFTMutation,
  useCreateListingMutation,
  useGetListingsQuery,
  usePurchaseListingMutation,
  useGetUserListingsQuery
} = nftApi; 