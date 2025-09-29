import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const API_BASE_URL = "http://localhost:8000/api";

// Thunks pour les appels API
export const fetchProjectsByStatus = createAsyncThunk(
  "dashboard/fetchProjectsByStatus",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/projects/projects-by-status`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch data");
    }
  }
);

export const fetchActionsTreemapData = createAsyncThunk(
  "dashboard/fetchActionsTreemapData",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/actions/actions-treemap-data`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch data");
    }
  }
);

export const fetchInvitesByCountry = createAsyncThunk(
  "dashboard/fetchInvitesByCountry",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/invites/invites-by-country`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      console.log("Invites By Country API Response:", response.data); // Vérifiez les données ici
      return response.data.data; // Retourner uniquement `data`
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch data");
    }
  }
);
// export const fetchProjectsBySector = createAsyncThunk(
//     "dashboard/fetchProjectsBySector",
//     async (_, { rejectWithValue }) => {
//       try {
//         const response = await axios.get(`${API_BASE_URL}/projects/projects-by-sector`, {
//           headers: {
//             Authorization: `Bearer ${localStorage.getItem("token")}`,
//           },
//         });
//         return response.data;
//       } catch (error) {
//         return rejectWithValue(error.response?.data?.message || "Failed to fetch data");
//       }
//     }
//   );
  export const fetchTotalJobs = createAsyncThunk(
    "dashboard/fetchTotalJobs",
    async (_, { rejectWithValue }) => {
      try {
        const response = await axios.get(`${API_BASE_URL}/projects/total-jobs`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        return response.data;
      } catch (error) {
        return rejectWithValue(error.response?.data?.message || "Failed to fetch data");
      }
    }
  );
  export const fetchInvestmentBySector = createAsyncThunk(
    "dashboard/fetchInvestmentBySector",
    async (_, { rejectWithValue }) => {
      try {
        const response = await axios.get(`${API_BASE_URL}/projects/investment-by-sector`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        return response.data;
      } catch (error) {
        return rejectWithValue(error.response?.data?.message || "Failed to fetch data");
      }
    }
  );
  export const fetchTotalBlockedProjects = createAsyncThunk(
    "dashboard/fetchTotalBlockedProjects",
    async (_, { rejectWithValue }) => {
      try {
        const response = await axios.get(`${API_BASE_URL}/projects/total-blocked-projects`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        return response.data;
      } catch (error) {
        return rejectWithValue(error.response?.data?.message || "Failed to fetch data");
      }
    }
  );
  export const fetchTotalInProductionProjects = createAsyncThunk(
    "dashboard/fetchTotalInProductionProjects",
    async (_, { rejectWithValue }) => {
      try {
        const response = await axios.get(`${API_BASE_URL}/projects/total-in-production-projects`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        return response.data;
      } catch (error) {
        return rejectWithValue(error.response?.data?.message || "Failed to fetch data");
      }
    }
  );
  
  export const fetchTotalInProgressProjects = createAsyncThunk(
    "dashboard/fetchTotalInProgressProjects",
    async (_, { rejectWithValue }) => {
      try {
        const response = await axios.get(`${API_BASE_URL}/projects/total-in-progress-projects`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        return response.data;
      } catch (error) {
        return rejectWithValue(error.response?.data?.message || "Failed to fetch data");
      }
    }
  );
  export const fetchTotalIdeaProjects = createAsyncThunk(
    "dashboard/fetchTotalIdeaProjects",
    async (_, { rejectWithValue }) => {
      try {
        const response = await axios.get(`${API_BASE_URL}/projects/total-idea-projects`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        return response.data;
      } catch (error) {
        return rejectWithValue(error.response?.data?.message || "Failed to fetch data");
      }
    }
  );
  export const fetchDelayedProjects = createAsyncThunk(
    "dashboard/fetchDelayedProjects",
    async (_, { rejectWithValue }) => {
      try {
        const response = await axios.get(`${API_BASE_URL}/projects/delayed-projects`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        return response.data;
      } catch (error) {
        return rejectWithValue(error.response?.data?.message || "Failed to fetch data");
      }
    }
  );
  export const fetchJobsBySector = createAsyncThunk(
    "dashboard/fetchJobsBySector",
    async (_, { rejectWithValue }) => {
      try {
        const response = await axios.get(`${API_BASE_URL}/projects/jobs-by-sector`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        return response.data;
      } catch (error) {
        return rejectWithValue(error.response?.data?.message || "Failed to fetch data");
      }
    }
  );
  export const fetchProjectsByMonth = createAsyncThunk(
    "dashboard/fetchProjectsByMonth",
    async (_, { rejectWithValue }) => {
      try {
        const response = await axios.get(`${API_BASE_URL}/projects/projects-by-month`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        console.log("Projects By Month API Response:", response.data); // Vérifiez les données ici
        return response.data.data; // Retourner uniquement `data`
      } catch (error) {
        return rejectWithValue(error.response?.data?.message || "Failed to fetch data");
      }
    }
  )
  export const fetchProjectsByYear = createAsyncThunk(
    "dashboard/fetchProjectsByYear",
    async (_, { rejectWithValue }) => {
      try {
        const response = await axios.get(`${API_BASE_URL}/projects/projects-by-year`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        console.log("Projects By Year API Response:", response.data); // Vérifiez les données ici
        return response.data.data; // Retourner uniquement `data`
      } catch (error) {
        return rejectWithValue(error.response?.data?.message || "Failed to fetch data");
      }
    }
  );
  export const fetchHighInvestmentProjects = createAsyncThunk(
    "dashboard/fetchHighInvestmentProjects",
    async (threshold = 1000000, { rejectWithValue }) => {
      try {
        const response = await axios.get(`${API_BASE_URL}/projects/high-investment-projects`, {
          params: { threshold }, // Passer le seuil comme paramètre
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        console.log("High Investment Projects API Response:", response.data); // Vérifiez les données ici
        return response.data.data; // Retourner uniquement `data`
      } catch (error) {
        return rejectWithValue(error.response?.data?.message || "Failed to fetch data");
      }
    }
  );
  export const fetchHierarchicalProjectsBySector = createAsyncThunk(
    "dashboard/fetchHierarchicalProjectsBySector",
    async (_, { rejectWithValue }) => {
      try {
        const response = await axios.get(`${API_BASE_URL}/projects/hierarchical-projects-by-sector`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        console.log("Hierarchical Projects By Sector API Response:", response.data); // Vérifiez les données ici
        return response.data.data; // Retourner uniquement `data`
      } catch (error) {
        return rejectWithValue(error.response?.data?.message || "Failed to fetch data");
      }
    }
  );
  export const fetchPipelineProgression = createAsyncThunk(
    "dashboard/fetchPipelineProgression",
    async (_, { rejectWithValue }) => {
      try {
        const response = await axios.get(`${API_BASE_URL}/projects/pipeline-progression`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        console.log("Pipeline Progression API Response:", response.data);
  
        // Trier les données par ordre ascendant
        const sortedData = response.data.data.sort((a, b) => a.order - b.order);
  
        return sortedData; // Retourner les données triées
      } catch (error) {
        return rejectWithValue(error.response?.data?.message || "Failed to fetch data");
      }
    }
  );
  export const fetchInvestmentByRegion = createAsyncThunk(
    "dashboard/fetchInvestmentByRegion",
    async (_, { rejectWithValue }) => {
      try {
        const response = await axios.get(`${API_BASE_URL}/projects/investment-by-region`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        console.log("Investment By Region API Response:", response.data); // Vérifiez les données ici
        return response.data.data; // Retourner uniquement `data`
      } catch (error) {
        return rejectWithValue(error.response?.data?.message || "Failed to fetch data");
      }
    }
  );
  

// Slice
const dashboardSlice = createSlice({
  name: "dashboard",
  initialState: {
    projectsByStatus: { data: [], loading: false, error: null },
    actionsTreemapData: { data: [], loading: false, error: null },
    invitesByCountry: { data: [], loading: false, error: null },
    // projectsBySector: { data: [], loading: false, error: null }, // Ajout de l'état pour `projectsBySector`
    totalJobs: { data: null, loading: false, error: null },
    investmentBySector: { data: [], loading: false, error: null },
    totalBlockedProjects: { data: null, loading: false, error: null },
    totalInProductionProjects: { data: null, loading: false, error: null },
    totalInProgressProjects: { data: null, loading: false, error: null },
    totalIdeaProjects: { data: null, loading: false, error: null },
    delayedProjects: { data: null, loading: false, error: null },
    projectsByStatus: { data: [], loading: false, error: null },
    jobsBySector: { data: [], loading: false, error: null },
    projectsByMonth: { data: [], loading: false, error: null },
    projectsByYear: { data: [], loading: false, error: null },
    highInvestmentProjects: { data: [], loading: false, error: null },
    hierarchicalProjectsBySector: { data: [], loading: false, error: null },
    pipelineProgression: { data: [], loading: false, error: null },
    investmentByRegion: { data: [], loading: false, error: null },
  

  },
  reducers: {},
  extraReducers: (builder) => {
    // Projects by Status
    builder
      .addCase(fetchProjectsByStatus.pending, (state) => {
        state.projectsByStatus.loading = true;
        state.projectsByStatus.error = null;
      })
      .addCase(fetchProjectsByStatus.fulfilled, (state, action) => {
        console.log("Fetched Projects By Status:", action.payload);
        state.projectsByStatus.loading = false;
        state.projectsByStatus.data = action.payload.data; // Assurez-vous que `action.payload.data` contient le tableau attendu
      })
      .addCase(fetchProjectsByStatus.rejected, (state, action) => {
        state.projectsByStatus.loading = false;
        state.projectsByStatus.error = action.payload;
      });

    // Actions Treemap Data
    builder
      .addCase(fetchActionsTreemapData.pending, (state) => {
        state.actionsTreemapData.loading = true;
        state.actionsTreemapData.error = null;
      })
      .addCase(fetchActionsTreemapData.fulfilled, (state, action) => {
        console.log("Fetched Actions Treemap Data:", action.payload);
        state.actionsTreemapData.loading = false;
        state.actionsTreemapData.data = action.payload.data; // Assurez-vous que `action.payload.data` contient le tableau attendu
      })
      .addCase(fetchActionsTreemapData.rejected, (state, action) => {
        state.actionsTreemapData.loading = false;
        state.actionsTreemapData.error = action.payload;
      });

    // Invites by Country
    builder
      .addCase(fetchInvitesByCountry.pending, (state) => {
        state.invitesByCountry.loading = true;
        state.invitesByCountry.error = null;
      })
      .addCase(fetchInvitesByCountry.fulfilled, (state, action) => {
        console.log("Fetched Invites By Country:", action.payload);
        state.invitesByCountry.loading = false;
        state.invitesByCountry.data = action.payload; // Assurez-vous que `action.payload` contient `{ success: true, data: [...] }`
      })
      .addCase(fetchInvitesByCountry.rejected, (state, action) => {
        state.invitesByCountry.loading = false;
        state.invitesByCountry.error = action.payload;
      })
    //   .addCase(fetchProjectsBySector.pending, (state) => {
    //     state.projectsBySector.loading = true;
    //     state.projectsBySector.error = null;
    //   })
    //   .addCase(fetchProjectsBySector.fulfilled, (state, action) => {
    //     console.log("Fetched Projects By Sector:", action.payload);
    //     state.projectsBySector.loading = false;
    //     state.projectsBySector.data = action.payload.data; // Assurez-vous que `action.payload.data` contient le tableau attendu
    //   })
    //   .addCase(fetchProjectsBySector.rejected, (state, action) => {
    //     state.projectsBySector.loading = false;
    //     state.projectsBySector.error = action.payload;
    //   })
      .addCase(fetchTotalJobs.pending, (state) => {
        state.totalJobs.loading = true;
        state.totalJobs.error = null;
      })
      .addCase(fetchTotalJobs.fulfilled, (state, action) => {
        state.totalJobs.loading = false;
        state.totalJobs.data = action.payload.data;
      })
      .addCase(fetchTotalJobs.rejected, (state, action) => {
        state.totalJobs.loading = false;
        state.totalJobs.error = action.payload;
      })
      .addCase(fetchInvestmentBySector.pending, (state) => {
        state.investmentBySector.loading = true;
        state.investmentBySector.error = null;
      })
      .addCase(fetchInvestmentBySector.fulfilled, (state, action) => {
        state.investmentBySector.loading = false;
        state.investmentBySector.data = action.payload.data;
      })
      .addCase(fetchInvestmentBySector.rejected, (state, action) => {
        state.investmentBySector.loading = false;
        state.investmentBySector.error = action.payload;
      })
      .addCase(fetchTotalBlockedProjects.pending, (state) => {
        state.totalBlockedProjects.loading = true;
        state.totalBlockedProjects.error = null;
      })
      .addCase(fetchTotalBlockedProjects.fulfilled, (state, action) => {
        state.totalBlockedProjects.loading = false;
        state.totalBlockedProjects.data = action.payload.data;
      })
      .addCase(fetchTotalBlockedProjects.rejected, (state, action) => {
        state.totalBlockedProjects.loading = false;
        state.totalBlockedProjects.error = action.payload;
      })
      .addCase(fetchTotalInProductionProjects.pending, (state) => {
        state.totalInProductionProjects.loading = true;
        state.totalInProductionProjects.error = null;
      })
      .addCase(fetchTotalInProductionProjects.fulfilled, (state, action) => {
        state.totalInProductionProjects.loading = false;
        state.totalInProductionProjects.data = action.payload.data;
      })
      .addCase(fetchTotalInProductionProjects.rejected, (state, action) => {
        state.totalInProductionProjects.loading = false;
        state.totalInProductionProjects.error = action.payload;
      })
      .addCase(fetchTotalInProgressProjects.pending, (state) => {
        state.totalInProgressProjects.loading = true;
        state.totalInProgressProjects.error = null;
      })
      .addCase(fetchTotalInProgressProjects.fulfilled, (state, action) => {
        state.totalInProgressProjects.loading = false;
        state.totalInProgressProjects.data = action.payload.data;
      })
      .addCase(fetchTotalInProgressProjects.rejected, (state, action) => {
        state.totalInProgressProjects.loading = false;
        state.totalInProgressProjects.error = action.payload;
      })
      .addCase(fetchTotalIdeaProjects.pending, (state) => {
        state.totalIdeaProjects.loading = true;
        state.totalIdeaProjects.error = null;
      })
      .addCase(fetchTotalIdeaProjects.fulfilled, (state, action) => {
        state.totalIdeaProjects.loading = false;
        state.totalIdeaProjects.data = action.payload.data;
      })
      .addCase(fetchTotalIdeaProjects.rejected, (state, action) => {
        state.totalIdeaProjects.loading = false;
        state.totalIdeaProjects.error = action.payload;
      })
      .addCase(fetchDelayedProjects.pending, (state) => {
        state.delayedProjects.loading = true;
        state.delayedProjects.error = null;
      })
      .addCase(fetchDelayedProjects.fulfilled, (state, action) => {
        state.delayedProjects.loading = false;
        state.delayedProjects.data = action.payload.data; // Assurez-vous que `action.payload.data` contient la valeur attendue
      })
      .addCase(fetchDelayedProjects.rejected, (state, action) => {
        state.delayedProjects.loading = false;
        state.delayedProjects.error = action.payload;
      })
      .addCase(fetchJobsBySector.pending, (state) => {
        state.jobsBySector.loading = true;
        state.jobsBySector.error = null;
      })
      .addCase(fetchJobsBySector.fulfilled, (state, action) => {
        state.jobsBySector.loading = false;
        state.jobsBySector.data = action.payload.data; // Assurez-vous que `action.payload.data` contient le tableau attendu
      })
      .addCase(fetchJobsBySector.rejected, (state, action) => {
        state.jobsBySector.loading = false;
        state.jobsBySector.error = action.payload;
      })
      .addCase(fetchProjectsByMonth.pending, (state) => {
        state.projectsByMonth.loading = true;
        state.projectsByMonth.error = null;
      })
      .addCase(fetchProjectsByMonth.fulfilled, (state, action) => {
        console.log("Fetched Projects By Month:", action.payload);
        state.projectsByMonth.loading = false;
        state.projectsByMonth.data = action.payload; // Assurez-vous que `action.payload` contient le tableau attendu
      })
      .addCase(fetchProjectsByMonth.rejected, (state, action) => {
        state.projectsByMonth.loading = false;
        state.projectsByMonth.error = action.payload;
      })
      .addCase(fetchProjectsByYear.pending, (state) => {
        state.projectsByYear.loading = true;
        state.projectsByYear.error = null;
      })
      .addCase(fetchProjectsByYear.fulfilled, (state, action) => {
        console.log("Fetched Projects By Year:", action.payload);
        state.projectsByYear.loading = false;
        state.projectsByYear.data = action.payload; // Assurez-vous que `action.payload` contient le tableau attendu
      })
      .addCase(fetchProjectsByYear.rejected, (state, action) => {
        state.projectsByYear.loading = false;
        state.projectsByYear.error = action.payload;
      })
      .addCase(fetchHighInvestmentProjects.pending, (state) => {
        state.highInvestmentProjects.loading = true;
        state.highInvestmentProjects.error = null;
      })
      .addCase(fetchHighInvestmentProjects.fulfilled, (state, action) => {
        console.log("Fetched High Investment Projects:", action.payload);
        state.highInvestmentProjects.loading = false;
        state.highInvestmentProjects.data = action.payload; // Assurez-vous que `action.payload` contient le tableau attendu
      })
      .addCase(fetchHighInvestmentProjects.rejected, (state, action) => {
        state.highInvestmentProjects.loading = false;
        state.highInvestmentProjects.error = action.payload;
      })
      .addCase(fetchHierarchicalProjectsBySector.pending, (state) => {
        state.hierarchicalProjectsBySector.loading = true;
        state.hierarchicalProjectsBySector.error = null;
      })
      .addCase(fetchHierarchicalProjectsBySector.fulfilled, (state, action) => {
        console.log("Fetched Hierarchical Projects By Sector:", action.payload);
        state.hierarchicalProjectsBySector.loading = false;
        state.hierarchicalProjectsBySector.data = action.payload; // Assurez-vous que `action.payload` contient le tableau attendu
      })
      .addCase(fetchHierarchicalProjectsBySector.rejected, (state, action) => {
        state.hierarchicalProjectsBySector.loading = false;
        state.hierarchicalProjectsBySector.error = action.payload;
      })
      .addCase(fetchPipelineProgression.pending, (state) => {
        state.pipelineProgression.loading = true;
        state.pipelineProgression.error = null;
      })
      .addCase(fetchPipelineProgression.fulfilled, (state, action) => {
        console.log("Fetched Pipeline Progression:", action.payload);
        state.pipelineProgression.loading = false;
        state.pipelineProgression.data = action.payload; // Assurez-vous que `action.payload` contient le tableau attendu
      })
      .addCase(fetchPipelineProgression.rejected, (state, action) => {
        state.pipelineProgression.loading = false;
        state.pipelineProgression.error = action.payload;
      })
      .addCase(fetchInvestmentByRegion.pending, (state) => {
        state.investmentByRegion.loading = true;
        state.investmentByRegion.error = null;
      })
      .addCase(fetchInvestmentByRegion.fulfilled, (state, action) => {
        console.log("Fetched Investment By Region:", action.payload);
        state.investmentByRegion.loading = false;
        state.investmentByRegion.data = action.payload; // Assurez-vous que `action.payload` contient le tableau attendu
      })
      .addCase(fetchInvestmentByRegion.rejected, (state, action) => {
        state.investmentByRegion.loading = false;
        state.investmentByRegion.error = action.payload;
      });
  },
});

export default dashboardSlice.reducer;