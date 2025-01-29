import { combineReducers, configureStore } from '@reduxjs/toolkit';
import { TypedUseSelectorHook, useSelector } from 'react-redux';
import { imageSlice } from './features/image-slice';
import { artApi } from './services/art.service';
import { creditsApi } from './services/credits.service';
import { nftApi } from './services/nft.service';
import appStateSlice from './features/app-state-slice';
import { userApi } from './services/user.service';

interface User {
  id: number;
  wallet_address: string;
}

export interface AppState {
  isUserLoggedIn: boolean;
  user: User | null;
}

export interface RootState {
  images: ReturnType<typeof imageSlice.reducer>;  
  appState: ReturnType<typeof appStateSlice.reducer>;
  [artApi.reducerPath]: ReturnType<typeof artApi.reducer>;
  [creditsApi.reducerPath]: ReturnType<typeof creditsApi.reducer>;
  [nftApi.reducerPath]: ReturnType<typeof nftApi.reducer>;
  [userApi.reducerPath]: ReturnType<typeof userApi.reducer>;
}

const rootReducer = combineReducers({
  // slices
  images: imageSlice.reducer,
  appState: appStateSlice.reducer,
  // services
  [artApi.reducerPath]: artApi.reducer,
  [creditsApi.reducerPath]: creditsApi.reducer,
  [nftApi.reducerPath]: nftApi.reducer,
  [userApi.reducerPath]: userApi.reducer
});

export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat([
      artApi.middleware,
      creditsApi.middleware,
      nftApi.middleware,
      userApi.middleware
    ]),
});

export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

export default store;
