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
// export const initializePipeline = createAsyncThunk(
//   "prospects/initializePipeline",
//   async ({ id, pipeline_type_id = 1 }, { rejectWithValue }) => {
//     try {
//       const response = await axios.post(
//         `${API_BASE_URL}/prospects/${id}/pipeline/initialize`,
//         { pipeline_type_id },
//         getAuthHeader()
//       );
//       return response.data;
//     } catch (error) {
//       return rejectWithValue(formatErrorMessage(error));
//     }
//   }
// );

// Avancer un prospect dans le pipeline
export const advancePipeline = createAsyncThunk(
  "prospects/advancePipeline",
  async ({ id, stage_id, notes = null, date = null }, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/prospects/${id}/pipeline/advance`,
        { stage_id, notes, date },
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
        `${API_BASE_URL}/prospects/${id}/pipeline/status`, // Correction ici
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
  async ({ id, ...conversionData }, { rejectWithValue }) => {
    try {
      console.log('Conversion data being sent:', conversionData);
      
      const response = await axios.post(
        `${API_BASE_URL}/prospects/${id}/convert-to-investor`,
        { ...conversionData,
        initialize_pipeline: true,},
        getAuthHeader()
      );
      
      console.log('Conversion response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Conversion error:', error);
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error || 
                          error.message || 
                          "Erreur lors de la conversion en investisseur";
      return rejectWithValue(errorMessage);
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
export const getProspectPipeline = createAsyncThunk(
  'prospects/getProspectPipeline',
  async (prospectId, { rejectWithValue }) => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/prospects/${prospectId}/pipeline`,
        getAuthHeader()
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);
export const updateProspectStatus = createAsyncThunk(
  'prospects/updateProspectStatus',
  async ({ id, statut }, { rejectWithValue }) => {
    try {
      const response = await axios.patch(
        `${API_BASE_URL}/prospects/${id}/status`,
        { statut },
        getAuthHeader()
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
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
    //     builder.addCase(initializePipeline.pending, (state) => {
    //       state.operation.loading = true;
    //       state.operation.type = 'initialize_pipeline';
    //       state.operation.error = null;
    //       state.operation.success = false;
    //     });

    // // Initialize Pipeline - Corriger le reducer fulfilled
    // builder.addCase(initializePipeline.fulfilled, (state, action) => {
    //   state.operation.loading = false;
    //   state.operation.success = true;

    //   if (action.payload.data && action.payload.data.prospect) {
    //     // Mettre à jour les données du prospect
    //     state.selectedProspect.data = action.payload.data.prospect;

    //     // Mettre à jour TOUTES les données du pipeline
    //     state.pipeline.data = action.payload.data;
    //     state.pipeline.currentStage = action.payload.data.current_stage;

    //     // Mapper les étapes du pipeline depuis les progressions
    //     if (action.payload.data.prospect.pipeline_progressions) {
    //       state.pipeline.stages = action.payload.data.prospect.pipeline_progressions.map(progression => ({
    //         ...progression.stage,
    //         status: progression.completed ? 'completed' : 'process',
    //         completed: progression.completed,
    //         progression_id: progression.id,
    //         notes: progression.notes,
    //         assigned_to: progression.assigned_to,
    //         completed_at: progression.completed_at
    //       }));
    //     }

    //     console.log('Pipeline initialized in Redux:', {
    //       data: state.pipeline.data,
    //       stages: state.pipeline.stages,
    //       currentStage: state.pipeline.currentStage
    //     });
    //   }
    // });
    //     builder.addCase(initializePipeline.rejected, (state, action) => {
    //       state.operation.loading = false;
    //       state.operation.error = action.payload;
    //     });

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
        // Mettre à jour les données du prospect
        state.selectedProspect.data = action.payload.data.prospect;

        // Mettre à jour TOUTES les données du pipeline
        state.pipeline.data = action.payload.data;
        state.pipeline.currentStage = action.payload.data.current_stage;

        // Mapper les étapes du pipeline depuis les progressions
        if (action.payload.data.prospect.pipeline_progressions) {
          state.pipeline.stages = action.payload.data.prospect.pipeline_progressions.map(progression => ({
            ...progression.stage,
            status: progression.completed ? 'completed' : 'process',
            completed: progression.completed,
            progression_id: progression.id,
            notes: progression.notes,
            assigned_to: progression.assigned_to,
            completed_at: progression.completed_at
          }));
        }
      }
    });
    builder.addCase(advancePipeline.rejected, (state, action) => {
      state.operation.loading = false;
      state.operation.error = action.payload;
    });

    // Get Pipeline Status
    // Get Pipeline Status
    builder.addCase(getPipelineStatus.pending, (state) => {
      state.pipeline.loading = true;
      state.pipeline.error = null;
    });
    builder.addCase(getPipelineStatus.fulfilled, (state, action) => {
      state.pipeline.loading = false;

      if (action.payload.success && action.payload.data) {
        state.pipeline.data = action.payload.data;
        state.pipeline.currentStage = action.payload.data.current_stage;

        // Mapper correctement les étapes avec leur statut depuis la base de données
        if (action.payload.data.stages) {
          state.pipeline.stages = action.payload.data.stages.map(stage => ({
            ...stage,
            status: stage.status || 'wait'
          }));
        } else {
          state.pipeline.stages = [];
        }

        console.log('Pipeline status loaded:', state.pipeline.stages);
      } else {
        // Cas où il n'y a pas de pipeline initialisé
        state.pipeline.data = null;
        state.pipeline.stages = [];
        state.pipeline.currentStage = null;
        console.log('No pipeline found for this prospect');
      }
    });
    builder.addCase(getPipelineStatus.rejected, (state, action) => {
      state.pipeline.loading = false;
      state.pipeline.error = action.payload;

      // Si l'erreur indique qu'il n'y a pas de pipeline, nettoyer l'état
      if (action.payload?.includes('Aucun pipeline')) {
        state.pipeline.data = null;
        state.pipeline.stages = [];
        state.pipeline.currentStage = null;
      }
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
    builder.addCase(getProspectPipeline.pending, (state) => {
      state.pipeline.loading = true;
      state.pipeline.error = null;
    });
    builder.addCase(getProspectPipeline.fulfilled, (state, action) => {
      state.pipeline.loading = false;

      if (action.payload.success && action.payload.data) {
        const data = action.payload.data;

        // Extraire les étapes depuis all_stages (toutes les étapes disponibles)
        state.pipeline.stages = data.all_stages || [];

        // Définir l'étape actuelle
        state.pipeline.currentStage = data.current_stage || null;

        // Extraire les progressions
        state.pipeline.progression = data.progressions || data.pipeline_progressions || [];

        // Stocker les données complètes
        state.pipeline.data = data;

        console.log('Pipeline data mapped correctly:', {
          stages: state.pipeline.stages,
          currentStage: state.pipeline.currentStage,
          progression: state.pipeline.progression
        });
      } else {
        // Si pas de données
        state.pipeline.stages = [];
        state.pipeline.currentStage = null;
        state.pipeline.progression = [];
      }
    });
    builder.addCase(getProspectPipeline.rejected, (state, action) => {
      state.pipeline.loading = false;
      state.pipeline.error = action.payload;
    });

    builder.addCase(updateProspectStatus.pending, (state) => {
      state.operation.loading = true;
      state.operation.error = null;
      state.operation.success = false;
      state.operation.type = 'update_status';
    });
    builder.addCase(updateProspectStatus.fulfilled, (state, action) => {
      state.operation.loading = false;
      state.operation.success = true;
      if (state.selectedProspect.data) {
        state.selectedProspect.data.statut = action.payload.data.statut;
      }
    });
    builder.addCase(updateProspectStatus.rejected, (state, action) => {
      state.operation.loading = false;
      state.operation.error = action.payload;
    });
  }
});

export const { resetOperation, setCurrentPage } = prospectSlice.actions;
export default prospectSlice.reducer;