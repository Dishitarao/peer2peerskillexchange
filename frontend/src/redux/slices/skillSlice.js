import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { skillAPI } from '../../services';

export const fetchCategories = createAsyncThunk(
  'skills/fetchCategories',
  async (_, { rejectWithValue }) => {
    try {
      const response = await skillAPI.getCategories();
      return response.data.data;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const searchSkills = createAsyncThunk(
  'skills/searchSkills',
  async (params, { rejectWithValue }) => {
    try {
      const response = await skillAPI.searchSkills(params);
      return response.data.data;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const fetchTrendingSkills = createAsyncThunk(
  'skills/fetchTrending',
  async (_, { rejectWithValue }) => {
    try {
      const response = await skillAPI.getTrendingSkills();
      return response.data.data;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const fetchRecommendedMentors = createAsyncThunk(
  'skills/fetchRecommendations',
  async (_, { rejectWithValue }) => {
    try {
      const response = await skillAPI.getRecommendations();
      return response.data.data;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const fetchMySkills = createAsyncThunk(
  'skills/fetchMySkills',
  async (_, { rejectWithValue }) => {
    try {
      const response = await skillAPI.getMySkills();
      return response.data.data;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

const skillSlice = createSlice({
  name: 'skills',
  initialState: {
    skills: [],
    trendingSkills: [],
    recommendedMentors: [],
    mySkills: [],
    categories: [],
    total: 0,
    page: 1,
    totalPages: 1,
    loading: false,
    error: null,
    filters: {
      search: '',
      category: 'All',
      level: 'All',
      minRating: 0,
      sortBy: 'newest'
    }
  },
  reducers: {
    setFilter: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
      state.page = 1; // Reset page on filter change
    },
    resetFilters: (state) => {
      state.filters = {
        search: '',
        category: 'All',
        level: 'All',
        minRating: 0,
        sortBy: 'newest'
      };
      state.page = 1;
    },
    setPage: (state, action) => {
      state.page = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      // Categories
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.categories = action.payload;
      })
      // Search
      .addCase(searchSkills.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(searchSkills.fulfilled, (state, action) => {
        state.loading = false;
        state.skills = action.payload.skills;
        state.total = action.payload.total;
        state.page = action.payload.page;
        state.totalPages = action.payload.totalPages;
      })
      .addCase(searchSkills.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Trending
      .addCase(fetchTrendingSkills.fulfilled, (state, action) => {
        state.trendingSkills = action.payload;
      })
      // Recommendations
      .addCase(fetchRecommendedMentors.fulfilled, (state, action) => {
        state.recommendedMentors = action.payload;
      })
      // My Skills
      .addCase(fetchMySkills.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchMySkills.fulfilled, (state, action) => {
        state.loading = false;
        state.mySkills = action.payload;
      })
      .addCase(fetchMySkills.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const { setFilter, resetFilters, setPage } = skillSlice.actions;
export const selectSkills = (state) => state.skills;
export default skillSlice.reducer;
