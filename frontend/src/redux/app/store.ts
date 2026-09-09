import { configureStore, type Action, type ThunkAction } from '@reduxjs/toolkit';
import authReducer from "../features/auth/authSlice";
import { apiSlice } from '../features/api/apiSlice/apiSlice';
import { setupListeners } from '@reduxjs/toolkit/query';

export const store = configureStore({
    reducer: {
        [apiSlice.reducerPath]: apiSlice.reducer,
        auth: authReducer
    },
    middleware: (getDefaultMiddlewares) => {
        return getDefaultMiddlewares().concat(apiSlice.middleware);
    }
});

// Enables refetchOnFocus / refetchOnReconnect behavior in RTK Query —
// without this, those options in apiSlice.ts are silently ignored.
setupListeners(store.dispatch);

export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;
export type AppThunk<ReturnType = void> = ThunkAction<
    ReturnType,
    RootState,
    unknown,
    Action<string>
>;