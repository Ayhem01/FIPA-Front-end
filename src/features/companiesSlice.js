import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// Utiliser import.meta.env pour Vite ou une valeur par défaut
const API_BASE_URL = import.meta.env?.VITE_API_BASE_URL || 'http://localhost:8000/api';

// Configuration axios
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercepteur pour ajouter le token d'authentification
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Actions asynchrones
export const fetchCompanies = createAsyncThunk(
  'companies/fetchCompanies',
  async (params = {}, { rejectWithValue }) => {
    try {
      const queryParams = new URLSearchParams();
      
      // Ajouter les paramètres de requête
      Object.keys(params).forEach(key => {
        if (params[key] !== null && params[key] !== undefined && params[key] !== '') {
          queryParams.append(key, params[key]);
        }
      });

      const response = await api.get(`/entreprises?${queryParams.toString()}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Erreur lors du chargement des entreprises'
      );
    }
  }
);

export const fetchCompanyDetails = createAsyncThunk(
  'companies/fetchCompanyDetails',
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.get(`/entreprises/${id}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Erreur lors du chargement des détails de l\'entreprise'
      );
    }
  }
);

export const createCompany = createAsyncThunk(
  'companies/createCompany',
  async (companyData, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      
      // Ajouter les données au FormData
      Object.keys(companyData).forEach(key => {
        if (companyData[key] !== null && companyData[key] !== undefined) {
          if (key === 'logo' && companyData[key] instanceof File) {
            formData.append(key, companyData[key]);
          } else {
            formData.append(key, companyData[key]);
          }
        }
      });

      const response = await api.post('/entreprises', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || error.response?.data?.errors || 'Erreur lors de la création de l\'entreprise'
      );
    }
  }
);

export const updateCompany = createAsyncThunk(
  'companies/updateCompany',
  async ({ id, companyData }, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      
      // Ajouter la méthode PUT pour Laravel
      formData.append('_method', 'PUT');
      
      // Ajouter les données au FormData
      Object.keys(companyData).forEach(key => {
        if (companyData[key] !== null && companyData[key] !== undefined) {
          if (key === 'logo' && companyData[key] instanceof File) {
            formData.append(key, companyData[key]);
          } else {
            formData.append(key, companyData[key]);
          }
        }
      });

      const response = await api.post(`/entreprises/${id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || error.response?.data?.errors || 'Erreur lors de la mise à jour de l\'entreprise'
      );
    }
  }
);

export const deleteCompany = createAsyncThunk(
  'companies/deleteCompany',
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.delete(`/entreprises/${id}`);
      return { id, message: response.data.message };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Erreur lors de la suppression de l\'entreprise'
      );
    }
  }
);

export const updateCompanyPipelineStage = createAsyncThunk(
  'companies/updatePipelineStage',
  async ({ id, pipeline_stage_id }, { rejectWithValue }) => {
    try {
      const response = await api.patch(`/entreprises/${id}/pipeline-stage`, {
        pipeline_stage_id
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Erreur lors de la mise à jour de l\'étape de pipeline'
      );
    }
  }
);

export const searchCompanies = createAsyncThunk(
  'companies/searchCompanies',
  async ({ term, limit = 10 }, { rejectWithValue }) => {
    try {
      const response = await api.get('/entreprises/search/quick', {
        params: { term, limit }
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Erreur lors de la recherche d\'entreprises'
      );
    }
  }
);

export const fetchCompaniesStats = createAsyncThunk(
  'companies/fetchStats',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/entreprises/dashboard/stats');
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Erreur lors du chargement des statistiques'
      );
    }
  }
);

// État initial
const initialState = {
  // Liste des entreprises
  companies: {
    data: [],
    current_page: 1,
    last_page: 1,
    per_page: 15,
    total: 0,
    from: 0,
    to: 0
  },
  
  // Entreprise sélectionnée pour les détails
  selectedCompany: null,
  
  // Résultats de recherche
  searchResults: [],
  
  // Statistiques
  statistics: {
    total: 0,
    nouveaux: 0,
    par_statut: [],
    par_secteur: [],
    par_proprietaire: []
  },
  
  // États de chargement
  loading: false,
  detailsLoading: false,
  searchLoading: false,
  statsLoading: false,
  
  // Gestion des erreurs
  error: null,
  
  // Gestion des opérations
  operation: {
    type: null, // 'create', 'update', 'delete', 'updateStage'
    loading: false,
    success: false,
    error: null
  },
  
  // Filtres appliqués
  filters: {
    nom: '',
    secteur_id: '',
    statut: '',
    type: '',
    pipeline_stage_id: '',
    proprietaire_id: '',
    sort_by: 'created_at',
    sort_direction: 'desc',
    page: 1,
    per_page: 15
  }
};

// Slice
const companiesSlice = createSlice({
  name: 'companies',
  initialState,
  reducers: {
    // Réinitialiser les erreurs
    clearError: (state) => {
      state.error = null;
      state.operation.error = null;
    },
    
    // Réinitialiser les opérations
    resetOperation: (state) => {
      state.operation = {
        type: null,
        loading: false,
        success: false,
        error: null
      };
    },
    
    // Mettre à jour les filtres
    updateFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    
    // Effacer les filtres
    clearFilters: (state) => {
      state.filters = {
        nom: '',
        secteur_id: '',
        statut: '',
        type: '',
        pipeline_stage_id: '',
        proprietaire_id: '',
        sort_by: 'created_at',
        sort_direction: 'desc',
        page: 1,
        per_page: 15
      };
    },
    
    // Effacer les résultats de recherche
    clearSearchResults: (state) => {
      state.searchResults = [];
    },
    
    // Mettre à jour une entreprise localement
    updateCompanyLocal: (state, action) => {
      const { id, updates } = action.payload;
      const companyIndex = state.companies.data.findIndex(company => company.id === id);
      if (companyIndex !== -1) {
        state.companies.data[companyIndex] = { ...state.companies.data[companyIndex], ...updates };
      }
      
      // Mettre à jour aussi l'entreprise sélectionnée si nécessaire
      if (state.selectedCompany && state.selectedCompany.id === id) {
        state.selectedCompany = { ...state.selectedCompany, ...updates };
      }
    },
    
    // Supprimer une entreprise localement
    removeCompanyLocal: (state, action) => {
      const id = action.payload;
      state.companies.data = state.companies.data.filter(company => company.id !== id);
      state.companies.total = Math.max(0, state.companies.total - 1);
      
      // Effacer l'entreprise sélectionnée si c'est celle supprimée
      if (state.selectedCompany && state.selectedCompany.id === id) {
        state.selectedCompany = null;
      }
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch Companies
      .addCase(fetchCompanies.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCompanies.fulfilled, (state, action) => {
        state.loading = false;
        state.companies = action.payload.data;
        state.error = null;
      })
      .addCase(fetchCompanies.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Fetch Company Details
      .addCase(fetchCompanyDetails.pending, (state) => {
        state.detailsLoading = true;
        state.error = null;
      })
      .addCase(fetchCompanyDetails.fulfilled, (state, action) => {
        state.detailsLoading = false;
        state.selectedCompany = action.payload.data;
        state.error = null;
      })
      .addCase(fetchCompanyDetails.rejected, (state, action) => {
        state.detailsLoading = false;
        state.error = action.payload;
        state.selectedCompany = null;
      })
      
      // Create Company
      .addCase(createCompany.pending, (state) => {
        state.operation = {
          type: 'create',
          loading: true,
          success: false,
          error: null
        };
      })
      .addCase(createCompany.fulfilled, (state, action) => {
        state.operation = {
          type: 'create',
          loading: false,
          success: true,
          error: null
        };
        // Ajouter la nouvelle entreprise au début de la liste
        state.companies.data.unshift(action.payload.data);
        state.companies.total += 1;
      })
      .addCase(createCompany.rejected, (state, action) => {
        state.operation = {
          type: 'create',
          loading: false,
          success: false,
          error: action.payload
        };
      })
      
      // Update Company
      .addCase(updateCompany.pending, (state) => {
        state.operation = {
          type: 'update',
          loading: true,
          success: false,
          error: null
        };
      })
      .addCase(updateCompany.fulfilled, (state, action) => {
        state.operation = {
          type: 'update',
          loading: false,
          success: true,
          error: null
        };
        
        const updatedCompany = action.payload.data;
        const companyIndex = state.companies.data.findIndex(company => company.id === updatedCompany.id);
        if (companyIndex !== -1) {
          state.companies.data[companyIndex] = updatedCompany;
        }
        
        // Mettre à jour l'entreprise sélectionnée si nécessaire
        if (state.selectedCompany && state.selectedCompany.id === updatedCompany.id) {
          state.selectedCompany = updatedCompany;
        }
      })
      .addCase(updateCompany.rejected, (state, action) => {
        state.operation = {
          type: 'update',
          loading: false,
          success: false,
          error: action.payload
        };
      })
      
      // Delete Company
      .addCase(deleteCompany.pending, (state) => {
        state.operation = {
          type: 'delete',
          loading: true,
          success: false,
          error: null
        };
      })
      .addCase(deleteCompany.fulfilled, (state, action) => {
        state.operation = {
          type: 'delete',
          loading: false,
          success: true,
          error: null
        };
        
        const { id } = action.payload;
        state.companies.data = state.companies.data.filter(company => company.id !== id);
        state.companies.total = Math.max(0, state.companies.total - 1);
        
        // Effacer l'entreprise sélectionnée si c'est celle supprimée
        if (state.selectedCompany && state.selectedCompany.id === id) {
          state.selectedCompany = null;
        }
      })
      .addCase(deleteCompany.rejected, (state, action) => {
        state.operation = {
          type: 'delete',
          loading: false,
          success: false,
          error: action.payload
        };
      })
      
      // Update Pipeline Stage
      .addCase(updateCompanyPipelineStage.pending, (state) => {
        state.operation = {
          type: 'updateStage',
          loading: true,
          success: false,
          error: null
        };
      })
      .addCase(updateCompanyPipelineStage.fulfilled, (state, action) => {
        state.operation = {
          type: 'updateStage',
          loading: false,
          success: true,
          error: null
        };
        
        const updatedCompany = action.payload.data;
        const companyIndex = state.companies.data.findIndex(company => company.id === updatedCompany.id);
        if (companyIndex !== -1) {
          state.companies.data[companyIndex] = updatedCompany;
        }
        
        // Mettre à jour l'entreprise sélectionnée si nécessaire
        if (state.selectedCompany && state.selectedCompany.id === updatedCompany.id) {
          state.selectedCompany = updatedCompany;
        }
      })
      .addCase(updateCompanyPipelineStage.rejected, (state, action) => {
        state.operation = {
          type: 'updateStage',
          loading: false,
          success: false,
          error: action.payload
        };
      })
      
      // Search Companies
      .addCase(searchCompanies.pending, (state) => {
        state.searchLoading = true;
      })
      .addCase(searchCompanies.fulfilled, (state, action) => {
        state.searchLoading = false;
        state.searchResults = action.payload.data;
      })
      .addCase(searchCompanies.rejected, (state, action) => {
        state.searchLoading = false;
        state.searchResults = [];
      })
      
      // Fetch Stats
      .addCase(fetchCompaniesStats.pending, (state) => {
        state.statsLoading = true;
      })
      .addCase(fetchCompaniesStats.fulfilled, (state, action) => {
        state.statsLoading = false;
        state.statistics = action.payload.data;
      })
      .addCase(fetchCompaniesStats.rejected, (state, action) => {
        state.statsLoading = false;
        state.error = action.payload;
      });
  }
});

// Export des actions
export const {
  clearError,
  resetOperation,
  updateFilters,
  clearFilters,
  clearSearchResults,
  updateCompanyLocal,
  removeCompanyLocal
} = companiesSlice.actions;

// Sélecteurs
export const selectCompanies = (state) => state.companies.companies;
export const selectSelectedCompany = (state) => state.companies.selectedCompany;
export const selectCompaniesLoading = (state) => state.companies.loading;
export const selectCompaniesDetailsLoading = (state) => state.companies.detailsLoading;
export const selectCompaniesError = (state) => state.companies.error;
export const selectCompaniesOperation = (state) => state.companies.operation;
export const selectCompaniesFilters = (state) => state.companies.filters;
export const selectCompaniesSearchResults = (state) => state.companies.searchResults;
export const selectCompaniesSearchLoading = (state) => state.companies.searchLoading;
export const selectCompaniesStatistics = (state) => state.companies.statistics;
export const selectCompaniesStatsLoading = (state) => state.companies.statsLoading;

// Export du reducer
export default companiesSlice.reducer;