import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { sessionAPI } from '../../services';

export const fetchUpcomingSessions = createAsyncThunk(
  'sessions/fetchUpcoming',
  async (_, { rejectWithValue }) => {
    try {
      const response = await sessionAPI.getUpcomingSessions();
      return response.data.data;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const fetchIncomingRequests = createAsyncThunk(
  'sessions/fetchIncoming',
  async (_, { rejectWithValue }) => {
    try {
      const response = await sessionAPI.getIncomingRequests();
      return response.data.data;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const fetchOutgoingRequests = createAsyncThunk(
  'sessions/fetchOutgoing',
  async (_, { rejectWithValue }) => {
    try {
      const response = await sessionAPI.getOutgoingRequests();
      return response.data.data;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const fetchMySessions = createAsyncThunk(
  'sessions/fetchMySessions',
  async (params, { rejectWithValue }) => {
    try {
      const response = await sessionAPI.getMySessions(params);
      return response.data.data;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

const sessionSlice = createSlice({
  name: 'sessions',
  initialState: {
    upcomingSessions: [],
    incomingRequests: [],
    outgoingRequests: [],
    sessionsList: [],
    total: 0,
    page: 1,
    totalPages: 1,
    loading: false,
    error: null,
    actionLoading: false
  },
  reducers: {
    clearSessionError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Upcoming
      .addCase(fetchUpcomingSessions.fulfilled, (state, action) => {
        state.upcomingSessions = action.payload;
      })
      // Incoming
      .addCase(fetchIncomingRequests.fulfilled, (state, action) => {
        state.incomingRequests = action.payload;
      })
      // Outgoing
      .addCase(fetchOutgoingRequests.fulfilled, (state, action) => {
        state.outgoingRequests = action.payload;
      })
      // My Sessions List
      .addCase(fetchMySessions.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchMySessions.fulfilled, (state, action) => {
        state.loading = false;
        state.sessionsList = action.payload.sessions;
        state.total = action.payload.total;
        state.page = action.payload.page;
        state.totalPages = action.payload.totalPages;
      })
      .addCase(fetchMySessions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const { clearSessionError } = sessionSlice.actions;
export const selectSessions = (state) => state.sessions;
export default sessionSlice.reducer;
