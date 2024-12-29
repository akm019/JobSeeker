import { configureStore } from '@reduxjs/toolkit';
import jobReducer from '../JobSlice';

export const store = configureStore({
  reducer: {
    jobs: jobReducer
  }
});