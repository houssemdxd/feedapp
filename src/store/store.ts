import { configureStore } from '@reduxjs/toolkit';
import backgroundImagesReducer from './slices/backgroundImagesSlice';

export const store = configureStore({
  reducer: {
    backgroundImages: backgroundImagesReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

