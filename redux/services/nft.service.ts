import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { Art, MarketplaceListing } from '@/lib/supabase';
import { Connection } from '@solana/web3.js';
import { Metaplex, walletAdapterIdentity, WalletAdapter } from '@metaplex-foundation/js';

interface MintNFTResponse {
  art: Art;
  metadata: {
    name: string;
    description: string;
    image: string;
  };
}

interface CreateListingRequest {
  art_id: number;
  price: number;
}

export const nftApi = createApi({
  reducerPath: 'nftApi',
  baseQuery: fetchBaseQuery({
    baseUrl: '/api',
    prepareHeaders: (headers) => {
      const walletAddress = window.localStorage.getItem('walletAddress');
      if (walletAddress) {
        headers.set('authorization', `Bearer ${walletAddress}`);
      }
      return headers;
    }
  }),
  tagTypes: ['NFT', 'Listing'],
  endpoints: (builder) => ({
    // NFT Operations
    mintNFT: builder.mutation<MintNFTResponse, { artId: number, wallet: WalletAdapter }>({
      async queryFn({ artId, wallet }, _queryApi, _extraOptions, fetchWithBQ) {
        try {
          const result = await fetchWithBQ({
            url: `/nft/mint/${artId}`,
            method: 'POST'
          });
          if (result.error) throw new Error('API request failed');
          
          const response = result.data as MintNFTResponse;

          // Initialize Solana connection and Metaplex
          const connection = new Connection(process.env.NEXT_PUBLIC_SOLANA_RPC_URL!);
          const metaplex = new Metaplex(connection).use(walletAdapterIdentity(wallet));

          try {
            // Upload metadata
            const { uri: metadataUri } = await metaplex.nfts().uploadMetadata(response.metadata);

            // Mint NFT
            const { nft } = await metaplex.nfts().create({
              uri: metadataUri,
              name: response.metadata.name,
              sellerFeeBasisPoints: 500, // 5% royalty
            });

            // Update art record with NFT details
            await fetchWithBQ({
              url: `/nft/update/${artId}`,
              method: 'POST',
              body: {
                minted_nft_address: nft.address.toString(),
                minted_token_uri: metadataUri
              }
            });

            return { data: response };
          } catch (error: any) {
            console.error('Mint NFT error:', error);
            
            // Check for insufficient funds error
            if (error.message?.includes('insufficient funds for rent')) {
              return {
                error: {
                  status: 400,
                  data: { 
                    message: 'Insufficient SOL balance. Please add more SOL to your wallet to cover the minting costs.'
                  }
                }
              };
            }

            return {
              error: {
                status: 500,
                data: { message: 'Failed to mint NFT. Please try again.' }
              }
            };
          }
        } catch (error) {
          console.error('API error:', error);   
          return {
            error: {
              status: 500,
              data: { message: 'Failed to prepare NFT metadata' }
            }
          };
        }
      }
    }),

    // Marketplace Operations
    createListing: builder.mutation<MarketplaceListing, CreateListingRequest>({
      query: (body) => ({
        url: '/marketplace/listings',
        method: 'POST',
        body
      }),
      invalidatesTags: ['Listing']
    }),

    getListings: builder.query<MarketplaceListing[], void>({
      query: () => '/marketplace/listings',
      providesTags: ['Listing']
    }),

    purchaseListing: builder.mutation<void, number>({
      query: (listingId) => ({
        url: `/marketplace/purchase/${listingId}`,
        method: 'POST'
      }),
      invalidatesTags: ['Listing', 'NFT']
    }),

    getUserListings: builder.query<MarketplaceListing[], void>({
      query: () => '/marketplace/listings/user',
      providesTags: ['Listing']
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