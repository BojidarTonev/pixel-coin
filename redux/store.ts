import { combineReducers, configureStore } from '@reduxjs/toolkit';
import { TypedUseSelectorHook, useSelector } from 'react-redux';
import { imageGenerationService } from './services/imageGeneration.service';
import { imageSlice } from './features/imageSlice';

export interface RootState {
  images: ReturnType<typeof imageSlice.reducer>;
  [imageGenerationService.reducerPath]: ReturnType<typeof imageGenerationService.reducer>;
}

const rootReducer = combineReducers({
  // slices
  images: imageSlice.reducer,
  // services
  [imageGenerationService.reducerPath]: imageGenerationService.reducer,
});

export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat([
      imageGenerationService.middleware,
    ]),
});

export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

export default store;
