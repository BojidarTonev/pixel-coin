import { createApi } from '@reduxjs/toolkit/query/react';
import { Art } from '@/lib/supabase';
import { Connection, clusterApiUrl } from '@solana/web3.js';
import { Metaplex, walletAdapterIdentity } from '@metaplex-foundation/js';
import { baseQueryWithOnQueryStarted } from './api.utils';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { WalletContextState } from '@solana/wallet-adapter-react';

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
    mintNFT: builder.mutation<MintNFTResponse, { artId: number, wallet: WalletContextState }>({
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
              uses: null,
              isMutable: true,
            });

          // Update art record with NFT details
          const updateResult = await fetchWithBQ({
            url: `/nft/update`,
            method: 'POST',
            body: {
              art_id: artId,
              is_minted: true,
              minted_nft_address: nft.address.toString(),
              minted_token_uri: metadata.image,
              owner_wallet: wallet.publicKey!.toString(),
              creator_wallet: wallet.publicKey!.toString(),
              update_authority: wallet.publicKey!.toString()
            }
          });

          if (updateResult.error) {
            console.error('Failed to update art record:', updateResult.error);
            throw new Error('Failed to update art record after minting');
          }

          return { data: response };
        } catch (error) {
          console.error('Minting error:', error);
          const errorMessage = error instanceof Error ? error.message : 'Failed to mint NFT';
          return { error: { message: errorMessage } };
        }
      }
    }),
  })
});

export const {
  useMintNFTMutation,
} = nftApi; 