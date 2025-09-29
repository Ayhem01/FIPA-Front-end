import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { message } from 'antd';

const API_BASE_URL = "http://localhost:8000/api";

const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
};

// Récupérer toutes les étapes pour un type d'entité
export const fetchPipelineStages = createAsyncThunk(
  'pipelineStages/fetchAll',
  async (entityType, { rejectWithValue }) => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/pipeline-stages/${entityType}`,
        getAuthHeader()
      );
      return { entityType, data: response.data.data };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Une erreur s'est produite");
    }
  }
);

// Ajouter une nouvelle étape
export const addPipelineStage = createAsyncThunk(
  'pipelineStages/add',
  async ({ entityType, stageData }, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/pipeline-stages/${entityType}`,
        stageData,
        getAuthHeader()
      );
      message.success('Étape de pipeline ajoutée avec succès');
      return { entityType, data: response.data.data };
    } catch (error) {
      message.error('Erreur lors de l\'ajout de l\'étape');
      return rejectWithValue(error.response?.data?.message || "Une erreur s'est produite");
    }
  }
);

// Mettre à jour une étape existante
export const updatePipelineStage = createAsyncThunk(
  'pipelineStages/update',
  async ({ entityType, id, stageData }, { rejectWithValue }) => {
    try {
      const response = await axios.put(
        `${API_BASE_URL}/pipeline-stages/${entityType}/${id}`,
        stageData,
        getAuthHeader()
      );
      message.success('Étape de pipeline mise à jour avec succès');
      return { entityType, data: response.data.data };
    } catch (error) {
      message.error('Erreur lors de la mise à jour de l\'étape');
      return rejectWithValue(error.response?.data?.message || "Une erreur s'est produite");
    }
  }
);

// Supprimer une étape
export const deletePipelineStage = createAsyncThunk(
  'pipelineStages/delete',
  async ({ entityType, id }, { rejectWithValue }) => {
    try {
      await axios.delete(
        `${API_BASE_URL}/pipeline-stages/${entityType}/${id}`,
        getAuthHeader()
      );
      message.success('Étape de pipeline supprimée avec succès');
      return { entityType, id };
    } catch (error) {
      message.error('Erreur lors de la suppression de l\'étape');
      return rejectWithValue(error.response?.data?.message || "Une erreur s'est produite");
    }
  }
);

// Récupérer les détails d'une étape spécifique
// export const getStageDetails = createAsyncThunk(
//   'pipelineStages/getStageDetails',
//   async ({ entityType, id }, { rejectWithValue }) => {
//     try {
//       const response = await axios.get(
//         `${API_BASE_URL}/pipeline-stages/${entityType}/${id}`,
//         getAuthHeader() // 🔹 Fix: auth header obligatoire
//       );
//       return response.data;
//     } catch (error) {
//       return rejectWithValue(error.response?.data?.message || error.message);
//     }
//   }
// );
export const getStageDetails = createAsyncThunk(
  'pipelineStages/getStageDetails',
  async ({ entityType, entityId, stageId }, { rejectWithValue }) => {
    try {
      // ✅ Correction de l'URL pour correspondre à votre route
      const response = await axios.get(
        `${API_BASE_URL}/pipeline-stages/${entityType}/${entityId}/stage/${stageId}`,
        getAuthHeader()
      );
      
      // ✅ Retourner les données selon le format de votre API
      return response.data.data; // Votre API retourne { success: true, data: {...} }
    } catch (error) {
      console.error('Erreur getStageDetails:', error);
      return rejectWithValue(
        error.response?.data?.message || 
        error.response?.data?.errors || 
        error.message
      );
    }
  }
);
// Réordonner les étapes
  export const reorderPipelineStages = createAsyncThunk(
    'pipelineStages/reorderPipelineStages',
    async ({ entityType, stages }, { rejectWithValue }) => {
      try {
        const response = await axios.post(
          `${API_BASE_URL}/pipeline-stages/${entityType}/reorder`,
          { stages },
          getAuthHeader() // 🔹 Fix: auth header obligatoire
        );
        return response.data;
      } catch (error) {
        return rejectWithValue(error.response?.data?.message || error.message);
      }
    }
  );

  const pipelineStageSlice = createSlice({
    name: 'pipelineStages',
    initialState: {
      stages: {
        items: [],
        loading: false,
        error: null
      },
      selectedStage: {
        data: null,
        loading: false,
        error: null
      },
      operation: {
        loading: false,
        success: false,
        error: null,
        type: null
      },
      invite: { items: [], loading: false, error: null },
      prospect: { items: [], loading: false, error: null },
      investor: { items: [], loading: false, error: null }, // 🔹 fix
      projet: { items: [], loading: false, error: null }
    },
    reducers: {
      resetOperation: (state) => {
        state.operation = {
          loading: false,
          success: false,
          error: null,
          type: null
        };
      }
    },
 
  
  extraReducers: (builder) => {
    // Fetch pipeline stages
    builder.addCase(fetchPipelineStages.pending, (state) => {
      state.stages.loading = true;
      state.stages.error = null;
    });
    builder.addCase(fetchPipelineStages.fulfilled, (state, action) => {
      state.stages.loading = false;
      state.stages.items = action.payload.data || [];
    });
    builder.addCase(fetchPipelineStages.rejected, (state, action) => {
      state.stages.loading = false;
      state.stages.error = action.payload || action.error.message;
    });

    // Get Stage Details
    // builder.addCase(getStageDetails.pending, (state) => {
    //   state.selectedStage.loading = true;
    //   state.selectedStage.error = null;
    // });
    // builder.addCase(getStageDetails.fulfilled, (state, action) => {
    //   state.selectedStage.loading = false;
    //   state.selectedStage.data = action.payload.data;
    // });
    // builder.addCase(getStageDetails.rejected, (state, action) => {
    //   state.selectedStage.loading = false;
    //   state.selectedStage.error = action.payload || action.error.message;
    // });
    builder.addCase(getStageDetails.pending, (state) => {
      state.loading = true;
      state.error = null;
    })
    builder.addCase(getStageDetails.fulfilled, (state, action) => {
      state.loading = false;
      state.stageDetails = action.payload;
    })
    builder.addCase(getStageDetails.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload;
    });

    // Add Pipeline Stage
    builder.addCase(addPipelineStage.pending, (state) => {
      state.operation.loading = true;
      state.operation.error = null;
      state.operation.success = false;
      state.operation.type = 'add';
    });
    builder.addCase(addPipelineStage.fulfilled, (state) => {
      state.operation.loading = false;
      state.operation.success = true;
    });
    builder.addCase(addPipelineStage.rejected, (state, action) => {
      state.operation.loading = false;
      state.operation.error = action.payload || action.error.message;
    });

    // Update Pipeline Stage
    builder.addCase(updatePipelineStage.pending, (state) => {
      state.operation.loading = true;
      state.operation.error = null;
      state.operation.success = false;
      state.operation.type = 'update';
    });
    builder.addCase(updatePipelineStage.fulfilled, (state) => {
      state.operation.loading = false;
      state.operation.success = true;
    });
    builder.addCase(updatePipelineStage.rejected, (state, action) => {
      state.operation.loading = false;
      state.operation.error = action.payload || action.error.message;
    });

    // Delete Pipeline Stage
    builder.addCase(deletePipelineStage.pending, (state) => {
      state.operation.loading = true;
      state.operation.error = null;
      state.operation.success = false;
      state.operation.type = 'delete';
    });
    builder.addCase(deletePipelineStage.fulfilled, (state) => {
      state.operation.loading = false;
      state.operation.success = true;
    });
    builder.addCase(deletePipelineStage.rejected, (state, action) => {
      state.operation.loading = false;
      state.operation.error = action.payload || action.error.message;
    });

    // Reorder Pipeline Stages
    builder.addCase(reorderPipelineStages.pending, (state) => {
      state.operation.loading = true;
      state.operation.error = null;
      state.operation.success = false;
      state.operation.type = 'reorder';
    });
    builder.addCase(reorderPipelineStages.fulfilled, (state) => {
      state.operation.loading = false;
      state.operation.success = true;
    });
    builder.addCase(reorderPipelineStages.rejected, (state, action) => {
      state.operation.loading = false;
      state.operation.error = action.payload || action.error.message;
    });
  }
});


export const { resetOperation } = pipelineStageSlice.actions;
export default pipelineStageSlice.reducer;