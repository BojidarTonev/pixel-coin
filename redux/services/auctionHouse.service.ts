import { createApi } from '@reduxjs/toolkit/query/react';
import { Metaplex, walletAdapterIdentity, PublicKey, toBigNumber } from '@metaplex-foundation/js';
import { Connection, clusterApiUrl } from '@solana/web3.js';
import { WalletContextState } from '@solana/wallet-adapter-react';
import { baseQueryWithOnQueryStarted } from './api.utils';
import { formatCreateAt, formatPrice } from '@/lib/utils';

// Constants
export const AUCTION_HOUSE_ADDRESS = new PublicKey('EahHyjr179Yn63Hp5Ly5WA6rSy1YTEgMNDrCS1c6qbUG'); // TODO: Replace with your deployed Auction House address

// Add type export at the top of the file
export interface AuctionHouseListing {
  tradeState: string;
  price: string;
  seller: string;
  createdAt: string;
  name: string;
  uri: string;
  mintAddress: string;
}

// Helper function to get Metaplex instance
export const getMetaplex = (wallet: WalletContextState) => {
  const connection = new Connection(clusterApiUrl('devnet'), 'confirmed');
  return Metaplex.make(connection).use(walletAdapterIdentity(wallet));
};

// Helper function to get Auction House instance
export const getAuctionHouse = async (metaplex: Metaplex) => {
  return await metaplex
    .auctionHouse()
    .findByAddress({ address: AUCTION_HOUSE_ADDRESS });
};

export const auctionHouseApi = createApi({
  reducerPath: 'auctionHouseApi',
  baseQuery: baseQueryWithOnQueryStarted,
  endpoints: (builder) => ({
    getAllListings: builder.query({
      async queryFn({ publicKey, page = 1, limit = 12 }) {
        try {
          if (!publicKey) {
            return { data: { data: [], hasMore: false, total: 0 } };
          }

          const connection = new Connection(clusterApiUrl('devnet'), 'confirmed');
          const metaplex = Metaplex.make(connection);

          const auctionHouse = await metaplex
            .auctionHouse()
            .findByAddress({ address: AUCTION_HOUSE_ADDRESS });

          const listings = await metaplex
            .auctionHouse()
            .findListings({
              auctionHouse,
            });

          // Filter out cancelled listings
          const activeListings = listings.filter(
            listing => !listing.canceledAt
          );
          // Calculate pagination
          const startIndex = (page - 1) * limit;
          const endIndex = startIndex + limit;
          const paginatedListings = activeListings.slice(startIndex, endIndex);
          const total = activeListings.length;
          const hasMore = endIndex < total;

          const enrichedListings = await Promise.all(
            paginatedListings.map(async listing => {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              const metadataAddress = (listing as any).metadataAddress;
              let nftMetadata = null;
              try {
                nftMetadata = await metaplex.nfts().findByMetadata({ metadata: metadataAddress });
                console.log('nftMetadata', nftMetadata);
              } catch (err) {
                console.error(
                  'Error fetching NFT metadata for mint:',
                  metadataAddress.toString(),
                  err
                );
              }

              return {
                tradeState: listing.tradeStateAddress.toString(),
                price: formatPrice(listing.price),
                seller: listing.sellerAddress.toString(),
                createdAt: formatCreateAt(listing.createdAt.toNumber()),
                name: nftMetadata ? nftMetadata.name : 'Unknown',
                uri: nftMetadata ? nftMetadata.uri : '',
                mintAddress: nftMetadata ? nftMetadata.mint.address.toString() : '',
              };
            })
          );

          return { 
            data: {
              data: enrichedListings,
              hasMore,
              total
            }
          };

        } catch (error) {
          console.error('Failed to fetch listings:', error);
          return {
            error: {
              message: error instanceof Error ? error.message : 'Failed to fetch listings',
            },
          };
        }
      },
    }),
    createListing: builder.mutation({
      async queryFn({ nftMint, price, wallet }) {
        try {
          if (!nftMint) {
            throw new Error('NFT mint address is required');
          }

          const metaplex = getMetaplex(wallet);
          const auctionHouse = await getAuctionHouse(metaplex);

          const humanReadablePrice = parseFloat(price);
          const priceInLamports = Math.floor(humanReadablePrice * Math.pow(10, 9));

          const { listing, sellerTradeState } = await metaplex
            .auctionHouse()
            .list({
              auctionHouse,
              mintAccount: new PublicKey(nftMint),
              price: { 
                basisPoints: toBigNumber(priceInLamports), 
                currency: { symbol: 'SOL', decimals: 9, namespace: 'spl-token' } 
              },
              tokens: { 
                basisPoints: toBigNumber(1), 
                currency: { decimals: 0, symbol: 'SOL', namespace: 'spl-token' } 
              },
            });

          return {
            data: {
              listing,
              sellerTradeState: sellerTradeState.toString(),
            },
          };
        } catch (error) {
          console.error('Failed to create listing:', error);
          return {
            error: {
              message: error instanceof Error ? error.message : 'Failed to create listing',
            },
          };
        }
      },
    }),

    executePurchase: builder.mutation({
      async queryFn({ sellerTradeState, wallet }) {
        try {
          if (!wallet.publicKey) {
            throw new Error('Wallet not connected');
          }

          const metaplex = getMetaplex(wallet);
          const auctionHouse = await getAuctionHouse(metaplex);

          // Find the listing by trade state
          const listing = await metaplex
            .auctionHouse()
            .findListingByTradeState({ 
              tradeStateAddress: new PublicKey(sellerTradeState),
              auctionHouse
            });

          if (!listing) {
            throw new Error('Listing not found');
          }

          // Create a bid matching the listing exactly
          const { bid } = await metaplex
            .auctionHouse()
            .bid({
              auctionHouse,
              buyer: metaplex.identity(),
              mintAccount: listing.asset.mint.address,
              price: listing.price,
              tokens: listing.tokens,
              seller: listing.sellerAddress
            });

          // Execute the sale with the created bid
          const { purchase } = await metaplex
            .auctionHouse()
            .executeSale({
              auctionHouse,
              bid,
              listing
            });

          return {
            data: {
              purchase,
              buyerTradeState: purchase.buyerAddress.toString(),
            },
          };
        } catch (error) {
          console.error('Failed to execute purchase:', error);
          return {
            error: {
              message: error instanceof Error ? error.message : 'Failed to execute purchase',
            },
          };
        }
      },
    }),

    cancelListing: builder.mutation({
      async queryFn({ listing, wallet }) {
        try {
          const metaplex = getMetaplex(wallet);
          const auctionHouse = await getAuctionHouse(metaplex);

          const result = await metaplex
            .auctionHouse()
            .cancelListing({
              auctionHouse,
              listing,
            });

          return { data: result };
        } catch (error) {
          console.error('Failed to cancel listing:', error);
          return {
            error: {
              message: error instanceof Error ? error.message : 'Failed to cancel listing',
            },
          };
        }
      },
    }),
  }),
});

export const {
  useCreateListingMutation,
  useExecutePurchaseMutation,
  useCancelListingMutation,
  useGetAllListingsQuery,
} = auctionHouseApi; 
