import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';




export const applyToJob = createAsyncThunk(
  'jobs/applyToJob',
  async (jobId, { rejectWithValue }) => {
    const token = localStorage.getItem("token");
    if (!token) {
      return rejectWithValue("Please log in to apply for jobs");
    }

    try {
      const response = await axios.post(
        `https://jobseeker-1-1buy.onrender.com/api/apply/${jobId}`,
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


// export const fetchJobs = createAsyncThunk(
//   'jobs/fetchJobs',
//   async (_, { rejectWithValue }) => {
//     try {
//       const response = await axios.get("http://localhost:5000/api/JobPost");
//       return response.data;
//     } catch (error) {
//       return rejectWithValue("Failed to load job postings.");
//     }
//   }
// );

export const fetchJobs = createAsyncThunk(
  'jobs/fetchJobs',
  async (_, { getState, rejectWithValue }) => {
    try {
      const response = await axios.get("https://jobseeker-1-1buy.onrender.com/api/JobPost");
      const { userApplications } = getState().jobs;
      
      // Merge job data with application status
      const jobsWithStatus = response.data.map(job => {
        const application = userApplications.find(app => app.jobId?._id === job._id);
        return {
          ...job,
          applicationStatus: application?.status || null
        };
      });
      
      return jobsWithStatus;
    } catch (error) {
      return rejectWithValue("Failed to load job postings.");
    }
  }
);

export const fetchUserApplications = createAsyncThunk(
  'jobs/fetchUserApplications',
  async (_, { dispatch, rejectWithValue }) => {
    const token = localStorage.getItem("token");
    if (!token) return [];
    
    try {
      const response = await axios.get(
        "https://jobseeker-1-1buy.onrender.com/api/my-applications",
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      // After fetching applications, refresh jobs to update statuses
      dispatch(fetchJobs());
      return response.data;
    } catch (error) {
      return rejectWithValue("Failed to fetch applications.");
    }
  }
);

const jobSlice = createSlice({
  name: 'jobs',
  initialState: {
    jobs: [],
    appliedJobs: [],
    userApplications: [],
    loading: true,
    error: null,
    successMessage: null
  },
  reducers: {
    clearMessages: (state) => {
      state.error = null;
      state.successMessage = null;
    },
    updateApplicationStatus: (state, action) => {
      const { jobId, status } = action.payload;
      const job = state.jobs.find(j => j._id === jobId);
      if (job) {
        job.applicationStatus = status;
      }
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
        state.userApplications = action.payload;
        state.appliedJobs = action.payload
          .filter(app => app.jobId && app.jobId._id)
          .map(app => app.jobId._id);
      })
      .addCase(applyToJob.fulfilled, (state, action) => {
        if (!state.appliedJobs.includes(action.payload.jobId)) {
          state.appliedJobs.push(action.payload.jobId);
        }
        state.successMessage = action.payload.message;
      });
  }
});

export const { clearMessages, updateApplicationStatus } = jobSlice.actions;
export default jobSlice.reducer;