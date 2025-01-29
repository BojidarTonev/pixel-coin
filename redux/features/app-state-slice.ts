import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface IAlert {
  isOpen: boolean;
  text: string;
  title: string;
}

export interface IAppState {
  isUserLoggedIn: boolean;
  user: object | null;
  alert: IAlert
}

const initialState: IAppState = {
  isUserLoggedIn: false,
  user: null,
  alert: {
    isOpen: false,
    text: '',
    title: ''
  }
};

export const imageSlice = createSlice({
  name: 'appState',
  initialState,
  reducers: {
    setUserLoggedIn: (state, action: PayloadAction<object | null>) => {
      state.isUserLoggedIn = true;
      state.user = action.payload;
    },
    setUserLoggedOut: (state) => {
      state.isUserLoggedIn = false;
      state.user = null;
    },
    openAlert: (state, action: PayloadAction<IAlert>) => {
      const { isOpen, text, title } = action.payload;
      state.alert.isOpen = isOpen;
      state.alert.text = text;
      state.alert.title = title;
    },
    closeAlert: (state) => {
      state.alert = initialState.alert;
    }
  },
});

export const { setUserLoggedIn, setUserLoggedOut, openAlert, closeAlert } = imageSlice.actions;

export default imageSlice; 