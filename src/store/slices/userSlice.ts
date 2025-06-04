import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

interface UserState {
  photo: string | null;
  email: string | null;
  name: string | null;
  role: string | null;
}

const initialState: UserState = {
  photo: null,
  email: null,
  name: null,
  role: null,
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUserPhoto(state, action: PayloadAction<string | null>) {
      state.photo = action.payload;
    },
    setUserEmail(state, action: PayloadAction<string | null>) {
      state.email = action.payload;
    },
    setUserName(state, action: PayloadAction<string | null>) {
      state.name = action.payload;
    },
    setUserRole(state, action: PayloadAction<string | null>) {
      state.role = action.payload;
    },
  },
});

export const { setUserPhoto, setUserEmail, setUserName, setUserRole } =
  userSlice.actions;

export default userSlice.reducer;
