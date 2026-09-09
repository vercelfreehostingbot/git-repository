import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { InitialState } from "./types";

const initialState: InitialState = {
    accessToken: null,
    user: null
}

export const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        userLoggedIn: (state, action: PayloadAction<InitialState>) => {
            state.accessToken = action.payload.accessToken;
            state.user = action.payload.user;
        },

        // Used after a token refresh, where the backend only returns a new
        // accessToken (no user object) — separate from userLoggedIn so we
        // don't accidentally wipe `user` on every refresh.
        accessTokenUpdated: (state, action: PayloadAction<string>) => {
            state.accessToken = action.payload;
        },

        userLoggedOut: (state) => {
            state.accessToken = null;
            state.user = null;
        }
    }
});

export const { userLoggedIn, accessTokenUpdated, userLoggedOut } = authSlice.actions;
export default authSlice.reducer;