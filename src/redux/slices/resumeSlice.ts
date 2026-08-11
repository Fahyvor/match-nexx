import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { ResumeData } from '../../types/resume';

interface ResumeState {
  resume: ResumeData | null;
}

const initialState: ResumeState = {
  resume: null,
};

export const resumeSlice = createSlice({
  name: 'resume',
  initialState,
  reducers: {
    setResume: (state, action: PayloadAction<ResumeData>) => {
      state.resume = action.payload;
    },
    clearResume: (state) => {
      state.resume = null;
    },
  },
});

export const { setResume, clearResume } = resumeSlice.actions;
export default resumeSlice.reducer;
