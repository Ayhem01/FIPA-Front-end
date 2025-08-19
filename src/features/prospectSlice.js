import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { getAuthHeader } from "./taskSlice";

const API_BASE_URL = "http://localhost:8000/api";

// Format des messages d'erreur
const formatErrorMessage = (error) => {
  if (error.response?.data?.message) return error.response.data.message;
  if (error.response?.data?.error) return error.response.data.error;
  if (error.message) return error.message;
  return "Une erreur est survenue";
};

// Récupérer tous les prospects avec pagination et filtres
export const fetchProspects = createAsyncThunk(
  "prospects/fetchAll",
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/prospects`,
        {
          ...getAuthHeader(),
          params
        }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(formatErrorMessage(error));
    }
  }
);

// Récupérer un prospect par son ID
export const getProspectById = createAsyncThunk(
  "prospects/getById",
  async (id, { rejectWithValue }) => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/prospects/${id}`,
        getAuthHeader()
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(formatErrorMessage(error));
    }
  }
);

// Créer un nouveau prospect
export const createProspect = createAsyncThunk(
  "prospects/create",
  async (prospectData, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/prospects`,
        prospectData,
        getAuthHeader()
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(formatErrorMessage(error));
    }
  }
);

// Mettre à jour un prospect
export const updateProspect = createAsyncThunk(
  "prospects/update",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await axios.put(
        `${API_BASE_URL}/prospects/${id}`,
        data,
        getAuthHeader()
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(formatErrorMessage(error));
    }
  }
);

// Supprimer un prospect
export const deleteProspect = createAsyncThunk(
  "prospects/delete",
  async (id, { rejectWithValue }) => {
    try {
      const response = await axios.delete(
        `${API_BASE_URL}/prospects/${id}`,
        getAuthHeader()
      );
      return { id, ...response.data };
    } catch (error) {
      return rejectWithValue(formatErrorMessage(error));
    }
  }
);

// Initialiser le pipeline pour un prospect
export const initializePipeline = createAsyncThunk(
  "prospects/initializePipeline",
  async ({ id, pipeline_type_id = null }, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/prospects/${id}/initialize-pipeline`,
        { pipeline_type_id },
        getAuthHeader()
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(formatErrorMessage(error));
    }
  }
);

// Avancer un prospect dans le pipeline
export const advancePipeline = createAsyncThunk(
  "prospects/advancePipeline",
  async ({ id, notes = null }, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/prospects/${id}/advance-stage`,
        { notes },
        getAuthHeader()
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(formatErrorMessage(error));
    }
  }
);

// Récupérer le statut du pipeline d'un prospect
export const getPipelineStatus = createAsyncThunk(
  "prospects/getPipeline",
  async (id, { rejectWithValue }) => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/prospects/${id}/pipeline`,
        getAuthHeader()
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(formatErrorMessage(error));
    }
  }
);

// Convertir un prospect en investisseur
export const convertToInvestor = createAsyncThunk(
  "prospects/convertToInvestor",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/prospects/${id}/convert-to-investor`,
        data,
        getAuthHeader()
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(formatErrorMessage(error));
    }
  }
);

// Récupérer les statistiques des prospects
export const getProspectStats = createAsyncThunk(
  "prospects/getStats",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/prospects/stats`,
        getAuthHeader()
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(formatErrorMessage(error));
    }
  }
);

// Slice initial
const initialState = {
  list: {
    items: [],
    loading: false,
    error: null,
    meta: {
      total: 0,
      current_page: 1,
      per_page: 15,
      last_page: 1
    }
  },
  selectedProspect: {
    data: null,
    loading: false,
    error: null
  },
  pipeline: {
    data: null,
    stages: [],
    currentStage: null,
    loading: false,
    error: null
  },
  stats: {
    data: null,
    loading: false,
    error: null
  },
  operation: {
    type: null,
    loading: false,
    success: false,
    error: null
  }
};

// Création du slice Redux
const prospectSlice = createSlice({
  name: "prospects",
  initialState,
  reducers: {
    resetOperation: (state) => {
      state.operation = {
        type: null,
        loading: false,
        success: false,
        error: null
      };
    },
    setCurrentPage: (state, action) => {
      state.list.meta.current_page = action.payload;
    }
  },
  extraReducers: (builder) => {
    // Fetch Prospects
    builder.addCase(fetchProspects.pending, (state) => {
      state.list.loading = true;
      state.list.error = null;
    });
    builder.addCase(fetchProspects.fulfilled, (state, action) => {
      state.list.loading = false;
      state.list.items = action.payload.data.data;
      state.list.meta = action.payload.meta;
    });
    builder.addCase(fetchProspects.rejected, (state, action) => {
      state.list.loading = false;
      state.list.error = action.payload;
    });

    // Get Prospect by ID
    builder.addCase(getProspectById.pending, (state) => {
      state.selectedProspect.loading = true;
      state.selectedProspect.error = null;
    });
    builder.addCase(getProspectById.fulfilled, (state, action) => {
      state.selectedProspect.loading = false;
      state.selectedProspect.data = action.payload.data;
    });
    builder.addCase(getProspectById.rejected, (state, action) => {
      state.selectedProspect.loading = false;
      state.selectedProspect.error = action.payload;
    });

    // Create Prospect
    builder.addCase(createProspect.pending, (state) => {
      state.operation.loading = true;
      state.operation.type = 'create';
      state.operation.error = null;
      state.operation.success = false;
    });
    builder.addCase(createProspect.fulfilled, (state, action) => {
      state.operation.loading = false;
      state.operation.success = true;
      if (state.list.items.length > 0) {
        state.list.items.unshift(action.payload.data);
      }
    });
    builder.addCase(createProspect.rejected, (state, action) => {
      state.operation.loading = false;
      state.operation.error = action.payload;
    });

    // Update Prospect
    builder.addCase(updateProspect.pending, (state) => {
      state.operation.loading = true;
      state.operation.type = 'update';
      state.operation.error = null;
      state.operation.success = false;
    });
    builder.addCase(updateProspect.fulfilled, (state, action) => {
      state.operation.loading = false;
      state.operation.success = true;
      if (state.selectedProspect.data && state.selectedProspect.data.id === action.payload.data.id) {
        state.selectedProspect.data = action.payload.data;
      }
    });
    builder.addCase(updateProspect.rejected, (state, action) => {
      state.operation.loading = false;
      state.operation.error = action.payload;
    });

    // Delete Prospect
    builder.addCase(deleteProspect.pending, (state) => {
      state.operation.loading = true;
      state.operation.type = 'delete';
      state.operation.error = null;
      state.operation.success = false;
    });
    builder.addCase(deleteProspect.fulfilled, (state) => {
      state.operation.loading = false;
      state.operation.success = true;
    });
    builder.addCase(deleteProspect.rejected, (state, action) => {
      state.operation.loading = false;
      state.operation.error = action.payload;
    });

    // Initialize Pipeline
    builder.addCase(initializePipeline.pending, (state) => {
      state.operation.loading = true;
      state.operation.type = 'initialize_pipeline';
      state.operation.error = null;
      state.operation.success = false;
    });
    builder.addCase(initializePipeline.fulfilled, (state, action) => {
      state.operation.loading = false;
      state.operation.success = true;
      if (action.payload.data && action.payload.data.prospect) {
        state.selectedProspect.data = action.payload.data.prospect;
        state.pipeline.currentStage = action.payload.data.current_stage;
      }
    });
    builder.addCase(initializePipeline.rejected, (state, action) => {
      state.operation.loading = false;
      state.operation.error = action.payload;
    });

    // Advance Pipeline
    builder.addCase(advancePipeline.pending, (state) => {
      state.operation.loading = true;
      state.operation.type = 'advance_pipeline';
      state.operation.error = null;
      state.operation.success = false;
    });
    builder.addCase(advancePipeline.fulfilled, (state, action) => {
      state.operation.loading = false;
      state.operation.success = true;
      if (action.payload.data && action.payload.data.prospect) {
        state.selectedProspect.data = action.payload.data.prospect;
        state.pipeline.currentStage = action.payload.data.current_stage;
      }
    });
    builder.addCase(advancePipeline.rejected, (state, action) => {
      state.operation.loading = false;
      state.operation.error = action.payload;
    });

    // Get Pipeline Status
    builder.addCase(getPipelineStatus.pending, (state) => {
      state.pipeline.loading = true;
      state.pipeline.error = null;
    });
    builder.addCase(getPipelineStatus.fulfilled, (state, action) => {
      state.pipeline.loading = false;
      state.pipeline.data = action.payload.data;
      state.pipeline.stages = action.payload.data.stages || [];
      state.pipeline.currentStage = action.payload.data.current_stage;
    });
    builder.addCase(getPipelineStatus.rejected, (state, action) => {
      state.pipeline.loading = false;
      state.pipeline.error = action.payload;
    });

    // Convert to Investor
    builder.addCase(convertToInvestor.pending, (state) => {
      state.operation.loading = true;
      state.operation.type = 'convert_to_investor';
      state.operation.error = null;
      state.operation.success = false;
    });
    builder.addCase(convertToInvestor.fulfilled, (state, action) => {
      state.operation.loading = false;
      state.operation.success = true;
      if (action.payload.data && action.payload.data.prospect) {
        state.selectedProspect.data = action.payload.data.prospect;
      }
    });
    builder.addCase(convertToInvestor.rejected, (state, action) => {
      state.operation.loading = false;
      state.operation.error = action.payload;
    });

    // Get Stats
    builder.addCase(getProspectStats.pending, (state) => {
      state.stats.loading = true;
      state.stats.error = null;
    });
    builder.addCase(getProspectStats.fulfilled, (state, action) => {
      state.stats.loading = false;
      state.stats.data = action.payload.data;
    });
    builder.addCase(getProspectStats.rejected, (state, action) => {
      state.stats.loading = false;
      state.stats.error = action.payload;
    });
  }
});

export const { resetOperation, setCurrentPage } = prospectSlice.actions;
export default prospectSlice.reducer;