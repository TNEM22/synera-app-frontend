import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

interface NavigationState {
  hasEntered: boolean;
  theme: string;
}

const initialState: NavigationState = {
  hasEntered: false,
  theme: 'light',
};

const navigationSlice = createSlice({
  name: 'navigation',
  initialState,
  reducers: {
    setHasEntered(state, action: PayloadAction<boolean>) {
      state.hasEntered = action.payload;
    },
    setTheme(state, action: PayloadAction<string>) {
      state.theme = action.payload;
    },
  },
});

export const { setHasEntered, setTheme } = navigationSlice.actions;
export default navigationSlice.reducer;
