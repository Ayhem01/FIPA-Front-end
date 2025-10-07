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

export const fetchBlockagesAdmin = createAsyncThunk(
  'blockages/fetchBlockagesAdmin',
  async (filters = {}, { rejectWithValue }) => {
    try {
      console.log('Récupération des blocages avec filtres:', filters);
      
      // Préparer les paramètres avec validation
      const params = {
        page: filters.page || 1,
        per_page: filters.per_page || 15,
        sort_by: filters.sort_by || 'created_at',
        sort_direction: filters.sort_direction || 'desc'
      };
      
      // Ajouter les filtres seulement s'ils sont définis
      if (filters.status && filters.status !== 'all') {
        params.status = filters.status;
      }
      
      if (filters.priority && filters.priority !== 'all') {
        params.priority = filters.priority;
      }
      
      if (filters.blockage_type && filters.blockage_type !== 'all') {
        params.blockage_type = filters.blockage_type;
      }
      
      if (filters.blockable_type && filters.blockable_type !== 'all') {
        params.blockable_type = filters.blockable_type;
      }
      
      if (filters.is_escalated !== undefined && filters.is_escalated !== null && filters.is_escalated !== 'all') {
        params.is_escalated = filters.is_escalated;
      }
      
      if (filters.assigned_to) {
        params.assigned_to = filters.assigned_to;
      }
      
      if (filters.created_by) {
        params.created_by = filters.created_by;
      }
      
      if (filters.date_from) {
        params.date_from = filters.date_from;
      }
      
      if (filters.date_to) {
        params.date_to = filters.date_to;
      }
      
      // Ajouter la recherche
      if (filters.search && filters.search.trim()) {
        params.search = filters.search.trim();
      }
      
      console.log('Paramètres finaux envoyés:', params);
      
      const response = await axios.get(`${API_URL}/blockages/all`, {
        params,
        ...getAuthHeader()
      });
      
      console.log('Réponse API blockages admin:', response.data);
      
      // CORRECTION: Retourner la structure correcte selon la réponse API
      return {
        blockages: response.data.data, // La pagination Laravel complète
        statistics: response.data.statistics,
        filters_applied: response.data.filters_applied
      };
    } catch (error) {
      console.error("Erreur lors de la récupération des blocages:", error);
      console.error("Détails de l'erreur:", error.response?.data);
      return rejectWithValue(error.response?.data?.message || 'Erreur lors du chargement des blocages');
    }
  }
);

  export const updateBlockage = createAsyncThunk(
    'blockages/updateBlockage',
    async ({ id, blockageData }, { rejectWithValue }) => {
      try {
        console.log('Mise à jour du blocage:', { id, blockageData });
        
        const response = await axios.put(
          `${API_URL}/blockages/${id}`, 
          blockageData,
          getAuthHeader()
        );
        
        console.log('Réponse mise à jour:', response.data);
        return response.data.data || response.data;
      } catch (error) {
        console.error('Erreur mise à jour blocage:', error.response?.data);
        return rejectWithValue(
          error.response?.data?.message || 'Erreur lors de la mise à jour du blocage'
        );
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
export const fetchBlockageDetails = createAsyncThunk(
  'blockages/fetchBlockageDetails',
  async (id, { rejectWithValue }) => {
    try {
      console.log(`Récupération des détails du blocage #${id}`);
      
      const response = await axios.get(
        `${API_URL}/blockages/${id}`,
        getAuthHeader()
      );
      
      console.log('Détails du blocage récupérés:', response.data);
      return response.data.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des détails:', error);
      return rejectWithValue(
        error.response?.data?.message || 'Erreur lors de la récupération des détails du blocage'
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
    selectedBlockage: null, 
    detailsLoading: false,  
    adminBlockages: {
      data: [],
      current_page: 1,
      last_page: 1,
      per_page: 15,
      total: 0,
      from: 0,
      to: 0,
      first_page_url: '',
      last_page_url: '',
      next_page_url: null,
      prev_page_url: null,
      path: '',
      links: []
    },
    statistics: {
      total: 0,
      by_status: {
        active: 0,
        resolved: 0,
        cancelled: 0
      },
      by_priority: {
        low: 0,
        medium: 0,
        high: 0,
        critical: 0
      },
      by_type: {
        process: 0,
        data: 0,
        technical: 0,
        other: 0
      },
      escalated_count: 0,
      unassigned_count: 0
    },
    filters: {
      status: null,
      priority: null,
      blockage_type: null,
      blockable_type: null,
      is_escalated: null,
      date_from: null,
      date_to: null
    },
    progression: [],
    loading: false,
    error: null,
    operation: {
      type: null,
      success: false,
      error: null
    }
  },
         
        reducers: {
          resetOperation: (state) => {
            state.operation = { type: null, success: false, error: null };
          },
          updateFilters: (state, action) => {
            state.filters = { ...state.filters, ...action.payload };
          },
          clearFilters: (state) => {
            state.filters = {
              status: null,
              priority: null,
              blockage_type: null,
              blockable_type: null,
              is_escalated: null,
              date_from: null,
              date_to: null
            };
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
    builder.addCase(updateBlockage.fulfilled, (state, action) => {
      // Mettre à jour dans la liste principale
      const index = state.list.findIndex(item => item.id === action.payload.id);
      if (index !== -1) {
        state.list[index] = action.payload;
      }
      
      // Mettre à jour dans entityBlockages
      const entityIndex = state.entityBlockages.findIndex(item => item.id === action.payload.id);
      if (entityIndex !== -1) {
        state.entityBlockages[entityIndex] = action.payload;
      }
      
      // Mettre à jour dans adminBlockages
      if (state.adminBlockages && state.adminBlockages.data) {
        const adminIndex = state.adminBlockages.data.findIndex(item => item.id === action.payload.id);
        if (adminIndex !== -1) {
          state.adminBlockages.data[adminIndex] = action.payload;
        }
      }
      
      state.operation = { type: 'update', success: true, error: null };
    })
    .addCase(updateBlockage.rejected, (state, action) => {
      state.operation = { type: 'update', success: false, error: action.payload };
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
    })
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
    })
    builder.addCase(fetchBlockagesAdmin.pending, (state) => {
      state.loading = true;
      state.error = null;
    })
    builder.addCase(fetchBlockagesAdmin.fulfilled, (state, action) => {
      state.loading = false;
      // CORRECTION: Stocker correctement la structure de pagination Laravel
      state.adminBlockages = action.payload.blockages;
      state.statistics = action.payload.statistics;
      state.filters = { ...state.filters, ...action.payload.filters_applied };
      state.error = null;
    })
    builder.addCase(fetchBlockagesAdmin.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload || 'Erreur inconnue';
    });
    builder.addCase(fetchBlockageDetails.pending, (state) => {
      state.detailsLoading = true;
      state.error = null;
    });
    builder.addCase(fetchBlockageDetails.fulfilled, (state, action) => {
      state.detailsLoading = false;
      state.selectedBlockage = action.payload;
      state.error = null;
    });
    builder.addCase(fetchBlockageDetails.rejected, (state, action) => {
      state.detailsLoading = false;
      state.error = action.payload;
      state.selectedBlockage = null;
    });
    // builder.addCase(fetchBlockages.pending, (state) => {
    //   state.loading = true;
    // });
    // builder.addCase(fetchBlockages.fulfilled, (state, action) => {
    //   state.list = action.payload;
    //   state.loading = false;
    //   state.error = null;
    // });
    // builder.addCase(fetchBlockages.rejected, (state, action) => {
    //   state.loading = false;
    //   state.error = action.payload || 'Erreur inconnue';
    // });
  }
});

export const { resetOperation, updateFilters, clearFilters } = blockageSlice.actions;
export default blockageSlice.reducer;