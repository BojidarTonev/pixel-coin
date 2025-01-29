import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface User {
  id: number;
  wallet_address: string;
  created_at: string;
}

export interface AppState {
  isUserLoggedIn: boolean;
  user: User | null;
}

const initialState: AppState = {
  isUserLoggedIn: false,
  user: null,
};

export const appStateSlice = createSlice({
  name: 'appState',
  initialState,
  reducers: {
    setUserLoggedIn(state, action: PayloadAction<User>) {
      state.isUserLoggedIn = true;
      state.user = action.payload;
    },
    setUserLoggedOut(state) {
      state.isUserLoggedIn = false;
      state.user = null;
    },
  },
});

export const { setUserLoggedIn, setUserLoggedOut } = appStateSlice.actions;

export default appStateSlice.reducer; 