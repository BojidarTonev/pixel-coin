import { combineReducers, configureStore } from '@reduxjs/toolkit';
import { TypedUseSelectorHook, useSelector } from 'react-redux';
import { imageSlice } from './features/imageSlice';
import { artApi } from './services/art.service';
import { creditsApi } from './services/credits.service';
import { nftApi } from './services/nft.service';

export interface RootState {
  images: ReturnType<typeof imageSlice.reducer>;
  [artApi.reducerPath]: ReturnType<typeof artApi.reducer>;
  [creditsApi.reducerPath]: ReturnType<typeof creditsApi.reducer>;
  [nftApi.reducerPath]: ReturnType<typeof nftApi.reducer>;
}

const rootReducer = combineReducers({
  // slices
  images: imageSlice.reducer,
  // services
  [artApi.reducerPath]: artApi.reducer,
  [creditsApi.reducerPath]: creditsApi.reducer,
  [nftApi.reducerPath]: nftApi.reducer,
});

export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat([
      artApi.middleware,
      creditsApi.middleware,
      nftApi.middleware
    ]),
});

export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

export default store;
