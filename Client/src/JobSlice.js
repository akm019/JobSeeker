import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

export const fetchJobs = createAsyncThunk(
  'jobs/fetchJobs',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get("http://localhost:5000/api/JobPost");
      return response.data;
    } catch (error) {
      return rejectWithValue("Failed to load job postings.");
    }
  }
);

export const fetchUserApplications = createAsyncThunk(
  'jobs/fetchUserApplications',
  async (_, { rejectWithValue }) => {
    const token = localStorage.getItem("token");
    if (!token) return [];
    
    try {
      const response = await axios.get(
        "http://localhost:5000/api/my-applications",
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue("Failed to fetch applications.");
    }
  }
);

export const applyToJob = createAsyncThunk(
  'jobs/applyToJob',
  async (jobId, { rejectWithValue }) => {
    const token = localStorage.getItem("token");
    if (!token) {
      return rejectWithValue("Please log in to apply for jobs");
    }

    try {
      const response = await axios.post(
        `http://localhost:5000/api/apply/${jobId}`,
        {
          coverLetter: ""
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      return { jobId, message: response.data.message };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to apply for the job. Please try again."
      );
    }
  }
);

const jobSlice = createSlice({
  name: 'jobs',
  initialState: {
    jobs: [],
    appliedJobs: [], // Changed from Set to array
    userApplications: [],
    loading: true,
    error: null,
    successMessage: null
  },
  reducers: {
    clearMessages: (state) => {
      state.error = null;
      state.successMessage = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchJobs.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchJobs.fulfilled, (state, action) => {
        state.loading = false;
        state.jobs = action.payload;
      })
      .addCase(fetchJobs.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchUserApplications.fulfilled, (state, action) => {
        // Convert to array of job IDs
        state.appliedJobs = action.payload.map(app => app.jobId._id);
        state.userApplications = action.payload;
      })
      .addCase(applyToJob.fulfilled, (state, action) => {
        // Add to array if not already present
        if (!state.appliedJobs.includes(action.payload.jobId)) {
          state.appliedJobs.push(action.payload.jobId);
        }
        state.successMessage = action.payload.message || "Successfully applied for the job.";
      })
      .addCase(applyToJob.rejected, (state, action) => {
        state.error = action.payload;
      });
  }
});

export const { clearMessages } = jobSlice.actions;
export default jobSlice.reducer;