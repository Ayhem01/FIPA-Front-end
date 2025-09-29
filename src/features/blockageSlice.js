import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from "axios";
import { getAuthHeader } from "./taskSlice";

const API_URL = "http://localhost:8000/api";

// Thunks
export const fetchBlockages = createAsyncThunk(
  'blockages/fetchBlockages',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/blockages`);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Erreur lors du chargement des blocages');
    }
  }
);
export const fetchBlockagesByEntity = createAsyncThunk(
    'blockages/fetchBlockagesByEntity',
    async ({ blockableType, blockableId }, { rejectWithValue }) => {
      try {
        console.log(`Récupération des blocages pour ${blockableType} #${blockableId}`);
        const response = await axios.get(`${API_URL}/blockages`, {
          params: {
            blockable_type: blockableType,
            blockable_id: blockableId
          },
          ...getAuthHeader()
        });
        
        return response.data.data;
      } catch (error) {
        console.error("Erreur lors de la récupération des blocages:", error);
        return rejectWithValue(error.response?.data?.message || 'Erreur lors du chargement des blocages');
      }
    }
  );
  export const fetchBlockagesForStage = createAsyncThunk(
    'blockages/fetchBlockagesForStage',
    async ({ entityType, entityId, stageId }, { rejectWithValue }) => {
      try {
        console.log(`Récupération des blocages pour ${entityType} #${entityId} à l'étape ${stageId}`);
        
        // Utiliser la route API correcte
        const response = await axios.get(
          `${API_URL}/blockages/${entityType}/${entityId}/stage/${stageId}`,
          getAuthHeader()
        );
        
        console.log('Réponse API blockages par stage:', response.data);
        
        // Correction importante ici - data est déjà le tableau de blocages
        if (response.data.success) {
          // Retourner directement le tableau des blocages
          return response.data.data || [];
        }
        
        return [];
      } catch (error) {
        console.error("Erreur lors de la récupération des blocages par étape:", error);
        return rejectWithValue(error.response?.data?.message || 'Erreur lors du chargement des blocages');
      }
    }
  );

  export const getBlockagesByStage = createAsyncThunk(
    'blockages/getByStage',
    async ({ entityType, entityId, stageType, stageId, filters = {} }, { rejectWithValue }) => {
      try {
        const response = await axios.get(
          `${API_BASE_URL}/blockages/by-stage`,
          {
            params: {
              blockable_type: entityType,
              blockable_id: entityId,
              pipeline_stageable_type: stageType,
              pipeline_stageable_id: stageId,
              ...filters
            },
            ...getAuthHeader()
          }
        );
        return response.data.data;
      } catch (error) {
        return rejectWithValue(
          error.response?.data?.message || error.message
        );
      }
    }
  );

// Dans blockageSlice.js
export const createBlockage = createAsyncThunk(
  'blockages/createBlockage',
  async (blockageData, { rejectWithValue }) => {
    try {
      console.log("📤 Données envoyées à l'API:", blockageData);

      const response = await axios.post(
        `${API_URL}/blockages`,
        blockageData,
        getAuthHeader() // 🔑 ajoute le token automatiquement
      );

      return response.data.data;
    } catch (error) {
      console.error("❌ Erreur lors de la création du blocage:", error.response || error);
      return rejectWithValue(
        error.response?.data?.message || 
        error.message || 
        'Erreur lors de la création du blocage'
      );
    }
  }
);

  
  
  

export const updateBlockage = createAsyncThunk(
  'blockages/updateBlockage',
  async ({ id, blockageData }, { rejectWithValue }) => {
    try {
      const response = await axios.put(`${API_URL}/blockages/${id}`, blockageData,getAuthHeader());
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Erreur lors de la mise à jour du blocage');
    }
  }
);

export const resolveBlockage = createAsyncThunk(
  'blockages/resolveBlockage',
  async ({ id }, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        `${API_URL}/blockages/${id}/resolve`,
        {},
        getAuthHeader()
      );
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Erreur lors de la résolution');
    }
  }
);

export const deleteBlockage = createAsyncThunk(
  'blockages/deleteBlockage',
  async (id, { rejectWithValue }) => {
    try {
      await axios.delete(`${API_URL}/blockages/${id}`,getAuthHeader());
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Erreur lors de la suppression du blocage');
    }
  }
);

export const escalateBlockage = createAsyncThunk(
  'blockages/escalateBlockage',
  async ({ id, adminId }, { rejectWithValue }) => {
    try {
      // Ajout des headers d'authentification
      const response = await axios.post(
        `${API_URL}/blockages/${id}/escalate`, 
        { admin_id: adminId },
        getAuthHeader() // Ajout des headers d'authentification
      );
      
      return response.data.data;
    } catch (error) {
      console.error("Erreur d'escalade:", error.response || error);
      return rejectWithValue(
        error.response?.data?.message || 
        "Erreur lors de l'escalade du blocage"
      );
    }
  }
);
export const fetchInviteProgressionById = createAsyncThunk(
  'invite/fetchInviteProgressionById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await axios.get(
        `${API_URL}/invites/${id}/progression`,
        getAuthHeader()
      );
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 
        'Erreur lors de la récupération de la progression'
      );
    }
  }
);

    const blockageSlice = createSlice({
        name: 'blockages',
        initialState: {
          list: [],
          entityBlockages: [],
          stageBlockages: [],
          loading: false,
          error: null,
          operation: {
            success: false,
            error: null
          }
        },
  reducers: {
    resetOperation: (state) => {
      state.operation = { type: null, success: false, error: null };
    }
  },
  extraReducers: (builder) => {
    // Fetch blockages
    builder.addCase(fetchBlockages.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(fetchBlockages.fulfilled, (state, action) => {
      state.list = action.payload; // pas "items"
      state.loading = false;
      state.error = null;
    });
    builder.addCase(fetchBlockages.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload || 'Erreur inconnue';
    });
    // Fetch blockages by entity
    builder.addCase(fetchBlockagesByEntity.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      builder.addCase(fetchBlockagesByEntity.fulfilled, (state, action) => {
        state.loading = false;
        state.entityBlockages = action.payload;
      })
      builder.addCase(fetchBlockagesByEntity.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Create blockage
    builder.addCase(createBlockage.pending, (state) => {
      state.operation = { type: 'create', success: false, error: null };
    });
    builder.addCase(createBlockage.fulfilled, (state, action) => {
        state.list.push(action.payload); // Changé de state.items à state.list
        state.operation = { type: 'create', success: true, error: null };
      });
    builder.addCase(createBlockage.rejected, (state, action) => {
      state.operation = { type: 'create', success: false, error: action.payload || 'Erreur inconnue' };
    });

    // Update blockage
    builder.addCase(updateBlockage.pending, (state) => {
      state.operation = { type: 'update', success: false, error: null };
    });
    builder.addCase(updateBlockage.fulfilled, (state, action) => {
      // Mettre à jour dans la liste principale
      const index = state.list.findIndex(item => item.id === action.payload.id);
      if (index !== -1) {
        state.list[index] = action.payload;
      }
      
      // Mettre également à jour dans entityBlockages
      const entityIndex = state.entityBlockages.findIndex(item => item.id === action.payload.id);
      if (entityIndex !== -1) {
        state.entityBlockages[entityIndex] = action.payload;
      }
      
      state.operation = { type: 'update', success: true, error: null };
    });
    builder.addCase(updateBlockage.rejected, (state, action) => {
      state.operation = { type: 'update', success: false, error: action.payload || 'Erreur inconnue' };
    });

    // Resolve blockage
    builder.addCase(resolveBlockage.pending, (state) => {
      state.operation = { type: 'resolve', success: false, error: null };
    });
    builder.addCase(resolveBlockage.fulfilled, (state, action) => {
      // Mettre à jour dans la liste principale
      const index = state.list.findIndex(item => item.id === action.payload.id);
      if (index !== -1) {
        state.list[index] = action.payload;
      }
      
      // Mettre également à jour dans entityBlockages
      const entityIndex = state.entityBlockages.findIndex(item => item.id === action.payload.id);
      if (entityIndex !== -1) {
        state.entityBlockages[entityIndex] = action.payload;
      }
      
      state.operation = { type: 'resolve', success: true, error: null };
    });
    builder.addCase(resolveBlockage.rejected, (state, action) => {
      state.operation = { type: 'resolve', success: false, error: action.payload || 'Erreur inconnue' };
    });

    // Delete blockage
    builder.addCase(deleteBlockage.pending, (state) => {
      state.operation = { type: 'delete', success: false, error: null };
    });
    builder.addCase(deleteBlockage.fulfilled, (state, action) => {
      // Supprimer de la liste principale
      state.list = state.list.filter(item => item.id !== action.payload);
      
      // Supprimer également de entityBlockages
      state.entityBlockages = state.entityBlockages.filter(item => item.id !== action.payload);
      
      state.operation = { type: 'delete', success: true, error: null };
    });
    builder.addCase(deleteBlockage.rejected, (state, action) => {
      state.operation = { type: 'delete', success: false, error: action.payload || 'Erreur inconnue' };
    });
    // Fetch invite progression by ID
    builder.addCase(fetchInviteProgressionById.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchInviteProgressionById.fulfilled, (state, action) => {
      state.progression = action.payload;
      state.loading = false;
    });
    builder.addCase(fetchInviteProgressionById.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload || 'Erreur inconnue';
    });

    // Escalate blockage
    builder.addCase(escalateBlockage.pending, (state) => {
      state.operation = { type: 'escalate', success: false, error: null };
    });
    builder.addCase(escalateBlockage.fulfilled, (state, action) => {
      // Mettre à jour dans la liste principale
      const index = state.list.findIndex(item => item.id === action.payload.id);
      if (index !== -1) {
        state.list[index] = action.payload;
      }
      
      // Mettre également à jour dans entityBlockages
      const entityIndex = state.entityBlockages.findIndex(item => item.id === action.payload.id);
      if (entityIndex !== -1) {
        state.entityBlockages[entityIndex] = action.payload;
      }
      
      state.operation = { type: 'escalate', success: true, error: null };
    });
    builder.addCase(escalateBlockage.rejected, (state, action) => {
      state.operation = { type: 'escalate', success: false, error: action.payload || 'Erreur inconnue' };
    });

    builder.addCase(getBlockagesByStage.pending, (state) => {
      state.loading = true;
      state.error = null;
    })
    builder.addCase(getBlockagesByStage.fulfilled, (state, action) => {
      state.loading = false;
      state.stageBlockages = action.payload;
    })
    builder.addCase(getBlockagesByStage.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload;
    });
    builder.addCase(fetchBlockagesForStage.pending, (state) => {
      state.loading = true;
      state.error = null;
    })
    builder.addCase(fetchBlockagesForStage.fulfilled, (state, action) => {
      state.loading = false;
      state.stageBlockages = action.payload;
    })
    builder.addCase(fetchBlockagesForStage.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload;
    });
  }
});

export const { resetOperation } = blockageSlice.actions;
export default blockageSlice.reducer;