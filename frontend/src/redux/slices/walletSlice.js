import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { walletAPI } from '../../services';

export const fetchWallet = createAsyncThunk(
  'wallet/fetchWallet',
  async (_, { rejectWithValue }) => {
    try {
      const response = await walletAPI.getWallet();
      return response.data.data;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const fetchTransactions = createAsyncThunk(
  'wallet/fetchTransactions',
  async (params, { rejectWithValue }) => {
    try {
      const response = await walletAPI.getTransactions(params);
      return response.data.data;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

const walletSlice = createSlice({
  name: 'wallet',
  initialState: {
    wallet: null,
    transactions: [],
    total: 0,
    page: 1,
    totalPages: 1,
    loading: false,
    error: null
  },
  reducers: {
    updateBalance: (state, action) => {
      if (state.wallet) {
        state.wallet.currentBalance = action.payload;
      }
    }
  },
  extraReducers: (builder) => {
    builder
      // Wallet
      .addCase(fetchWallet.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchWallet.fulfilled, (state, action) => {
        state.loading = false;
        state.wallet = action.payload;
      })
      .addCase(fetchWallet.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Transactions
      .addCase(fetchTransactions.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchTransactions.fulfilled, (state, action) => {
        state.loading = false;
        state.transactions = action.payload.transactions;
        state.total = action.payload.total;
        state.page = action.payload.page;
        state.totalPages = action.payload.totalPages;
      })
      .addCase(fetchTransactions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const { updateBalance } = walletSlice.actions;
export const selectWallet = (state) => state.wallet;
export default walletSlice.reducer;
