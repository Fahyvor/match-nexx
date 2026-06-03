import { configureStore } from '@reduxjs/toolkit';
import userReducer from './slices/userSlice';
import applicantReducer from './slices/applicantSlice';
import recruiterReducer from './slices/recruiterSlice';
import jobsReducer from './slices/jobsSlice';
import stateSlice from './slices/stateSlice';

export const store = configureStore({
  reducer: {
    user: userReducer,
    applicant: applicantReducer,
    recruiter: recruiterReducer,
    jobs: jobsReducer,
    states: stateSlice,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types from serialization checks if they contain non-serializable values
        ignoredActions: [],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
