import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

interface TemplateState {
  selectedTemplateId: string;
}

const initialState: TemplateState = {
  selectedTemplateId: 'minimal',
};

export const templateSlice = createSlice({
  name: 'template',
  initialState,
  reducers: {
    setTemplate: (state, action: PayloadAction<string>) => {
      state.selectedTemplateId = action.payload;
    },
  },
});

export const { setTemplate } = templateSlice.actions;
export default templateSlice.reducer;
