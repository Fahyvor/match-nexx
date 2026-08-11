import { configureStore } from '@reduxjs/toolkit';
import userReducer from './slices/userSlice';
import applicantReducer from './slices/applicantSlice';
import recruiterReducer from './slices/recruiterSlice';
import jobsReducer from './slices/jobsSlice';
import stateSlice from './slices/stateSlice';
import resumeReducer from './slices/resumeSlice';
import templateReducer from './slices/templateSlice';

export const store = configureStore({
  reducer: {
    user: userReducer,
    applicant: applicantReducer,
    recruiter: recruiterReducer,
    jobs: jobsReducer,
    states: stateSlice,
    resume: resumeReducer,
    template: templateReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
