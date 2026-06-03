import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

interface StateData {
  states: string[];
  lgas: Record<string, string[]>;
  loading: boolean;
  error: string | null;
}

const initialState: StateData = {
  states: [],
  lgas: {},
  loading: false,
  error: null,
};

// Fetch all states and their LGAs
export const fetchStatesAndLgas = createAsyncThunk(
  'states/fetchStatesAndLgas',
  async (_, { rejectWithValue }) => {
    try {
      const statesResponse = await axios.get('https://nga-states-lga.onrender.com/fetch');
      const states: string[] = statesResponse.data;
      states.sort();
      console.log("States:", states);

      const lgaPromises = states.map(async (stateName) => {
        const res = await axios.get(`https://nga-states-lga.onrender.com/?state=${stateName}`);
        return { stateName, lgas: res.data };
      });

    //   console.log("LGAs:", lgaPromises);

      const lgasData = await Promise.all(lgaPromises);

      const lgaMap: Record<string, string[]> = {};
      lgasData.forEach(({ stateName, lgas }) => {
        lgaMap[stateName] = lgas;
      });

      return {
        states,
        lgas: lgaMap,
      };
    } catch (error: unknown) {
      if (axios.isAxiosError(error) && error.message) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue('Failed to fetch states and LGAs');
    }
  }
);

const stateSlice = createSlice({
  name: 'states',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchStatesAndLgas.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchStatesAndLgas.fulfilled, (state, action) => {
        state.loading = false;
        state.states = action.payload.states;
        state.lgas = action.payload.lgas;
      })
      .addCase(fetchStatesAndLgas.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export default stateSlice.reducer;