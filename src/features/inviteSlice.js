import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { getAuthHeader } from "./taskSlice";

const API_BASE_URL = "http://localhost:8000/api";

// Fonction utilitaire pour formater les erreurs
const formatErrorMessage = (error) => {
  if (!error) return "Une erreur inconnue est survenue";
  
  // Si l'erreur est déjà une chaîne, la retourner directement
  if (typeof error === 'string') return error;
  
  // Gérer le format d'erreur Laravel typique
  if (error.message) return error.message;
  
  if (error.response?.data?.message) return error.response.data.message;
  
  // Si data contient un objet d'erreur Laravel complet
  if (error.response?.data && typeof error.response.data === 'object') {
    // Si c'est un objet d'exception Laravel
    if (error.response.data.message) {
      return error.response.data.message;
    }
    
    // Si c'est un objet de validation Laravel
    if (error.response.data.errors) {
      // Joindre tous les messages d'erreur
      return Object.values(error.response.data.errors)
        .flat()
        .join(', ');
    }
  }
  
  return "Une erreur est survenue lors de la communication avec le serveur";
};

// ===== Thunks pour les invités =====
export const fetchInvites = createAsyncThunk(
  "invites/fetchInvites",
  async (params = {}, { rejectWithValue }) => {
    try {
      const queryParams = new URLSearchParams();
      Object.keys(params).forEach((key) => {
        if (params[key] !== undefined && params[key] !== null && params[key] !== "") {
          queryParams.append(key, params[key]);
        }
      });

      const response = await axios.get(
        `${API_BASE_URL}/invites?${queryParams.toString()}`,
        getAuthHeader()
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(formatErrorMessage(error));
    }
  }
);

export const getInviteById = createAsyncThunk(
  "invites/getInviteById",
  async (id, { rejectWithValue }) => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/invites/${id}`,
        getAuthHeader()
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(formatErrorMessage(error));
    }
  }
);

export const createInvite = createAsyncThunk(
  "invites/createInvite",
  async (inviteData, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/invites`,
        inviteData,
        getAuthHeader()
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(formatErrorMessage(error));
    }
  }
);

export const updateInvite = createAsyncThunk(
  "invites/updateInvite",
  async ({ id, inviteData }, { rejectWithValue }) => {
    try {
      const response = await axios.put(
        `${API_BASE_URL}/invites/${id}`,
        inviteData,
        getAuthHeader()
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(formatErrorMessage(error));
    }
  }
);

export const updateInviteStatus = createAsyncThunk(
  "invites/updateInviteStatus",
  async ({ id, statut }, { rejectWithValue }) => {
    try {
      const response = await axios.patch(
        `${API_BASE_URL}/invites/${id}/status`,
        { statut },
        getAuthHeader()
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(formatErrorMessage(error));
    }
  }
);

export const deleteInvite = createAsyncThunk(
  "invites/deleteInvite",
  async (id, { rejectWithValue }) => {
    try {
      await axios.delete(`${API_BASE_URL}/invites/${id}`, getAuthHeader());
      return id;
    } catch (error) {
      return rejectWithValue(formatErrorMessage(error));
    }
  }
);

export const fetchInvitesByEntreprise = createAsyncThunk(
  "invites/fetchInvitesByEntreprise",
  async (entrepriseId, { rejectWithValue }) => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/invites/entreprise/${entrepriseId}`,
        getAuthHeader()
      );
      return { entrepriseId, data: response.data };
    } catch (error) {
      return rejectWithValue(formatErrorMessage(error));
    }
  }
);
// Fetch entreprises (liste paginée ou complète selon backend)
export const fetchEntreprises = createAsyncThunk(
  "invites/fetchEntreprises",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/entreprises`,
        getAuthHeader()
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(formatErrorMessage(error));
    }
  }
);
export const fetchActions = createAsyncThunk(
  "invites/fetchActions",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/actions`,
        getAuthHeader()
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(formatErrorMessage(error));
    }
  }
);
export const fetchEtapesByAction = createAsyncThunk(
  "invites/fetchEtapesByAction",
  async (actionId, { rejectWithValue }) => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/etapes/action/${actionId}`,
        getAuthHeader()
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(formatErrorMessage(error));
    }
  }
);

const inviteSlice = createSlice({
  name: "invites",
  initialState: {
    items: [],
    pagination: {
      current: 1,
      pageSize: 10,
      total: 0
    },
    loading: false,
    error: null,
    filters: {},
    selectedInvite: {
      data: null,
      loading: false,
      error: null
    },
    operation: {
      type: null,
      loading: false,
      success: false,
      error: null,
      targetId: null
    },
    entrepriseInvites: {
      items: [],
      loading: false,
      error: null,
      entrepriseId: null
    },
    entreprises: {
      items: [],
      loading: false,
      error: null
    },
    actions: {
      items: [],
      loading: false,
      error: null
    },
    etapes: {
      items: [],
      loading: false,
      error: null
    }
  },
  reducers: {
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = {};
    },
    resetOperation: (state) => {
      state.operation = {
        type: null,
        loading: false,
        success: false,
        error: null,
        targetId: null
      };
    }
  },
  extraReducers: (builder) => {
    builder
      // fetchInvites
      .addCase(fetchInvites.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchInvites.fulfilled, (state, action) => {
        state.loading = false;
        const paginated = action.payload.data;
        state.items = Array.isArray(paginated?.data) ? paginated.data : [];
        state.pagination = {
          current: paginated?.current_page || 1,
          pageSize: paginated?.per_page || 10,
          total: paginated?.total || 0
        };
      })
      .addCase(fetchInvites.rejected, (state, action) => {
        state.loading = false;
        state.error = typeof action.payload === 'string' 
          ? action.payload 
          : "Erreur lors de la récupération des invités";
      })

      // getInviteById
      .addCase(getInviteById.pending, (state) => {
        state.selectedInvite.loading = true;
        state.selectedInvite.error = null;
      })
      .addCase(getInviteById.fulfilled, (state, action) => {
        state.selectedInvite.loading = false;
        state.selectedInvite.data = action.payload.data || action.payload;
      })
      .addCase(getInviteById.rejected, (state, action) => {
        state.selectedInvite.loading = false;
        state.selectedInvite.error = typeof action.payload === 'string'
          ? action.payload
          : "Erreur lors de la récupération de l'invité";
      })

      // createInvite
      .addCase(createInvite.pending, (state) => {
        state.operation = {
          type: "create",
          loading: true,
          success: false,
          error: null
        };
      })
      .addCase(createInvite.fulfilled, (state) => {
        state.operation = {
          type: "create",
          loading: false,
          success: true,
          error: null
        };
      })
      .addCase(createInvite.rejected, (state, action) => {
        state.operation = {
          type: "create",
          loading: false,
          success: false,
          error: typeof action.payload === 'string'
            ? action.payload
            : "Erreur lors de la création de l'invité"
        };
      })

      // updateInvite
      .addCase(updateInvite.pending, (state, action) => {
        state.operation = {
          type: "update",
          loading: true,
          success: false,
          error: null,
          targetId: action.meta?.arg?.id
        };
      })
      .addCase(updateInvite.fulfilled, (state, action) => {
        state.operation = {
          type: "update",
          loading: false,
          success: true,
          error: null,
          targetId: action.meta?.arg?.id
        };
      })
      .addCase(updateInvite.rejected, (state, action) => {
        state.operation = {
          type: "update",
          loading: false,
          success: false,
          error: typeof action.payload === 'string'
            ? action.payload
            : "Erreur lors de la mise à jour de l'invité",
          targetId: action.meta?.arg?.id
        };
      })

      // updateInviteStatus
      .addCase(updateInviteStatus.pending, (state, action) => {
        state.operation = {
          type: "update_status",
          loading: true,
          success: false,
          error: null,
          targetId: action.meta?.arg?.id
        };
      })
      .addCase(updateInviteStatus.fulfilled, (state, action) => {
        state.operation = {
          type: "update_status",
          loading: false,
          success: true,
          error: null,
          targetId: action.meta?.arg?.id
        };
      
        // Correction : utiliser la réponse du backend pour mettre à jour l'invité
        if (state.selectedInvite.data && action.payload.data) {
          Object.assign(state.selectedInvite.data, action.payload.data);
        }
      
        // Mettre à jour le statut dans la liste si besoin
        const inviteIndex = state.items.findIndex(invite => invite.id === action.meta?.arg?.id);
        if (inviteIndex !== -1 && action.payload.data) {
          Object.assign(state.items[inviteIndex], action.payload.data);
        }
      })
      .addCase(updateInviteStatus.rejected, (state, action) => {
        state.operation = {
          type: "update_status",
          loading: false,
          success: false,
          error: typeof action.payload === 'string'
            ? action.payload
            : "Erreur lors de la mise à jour du statut",
          targetId: action.meta?.arg?.id
        };
      })

      // deleteInvite
      .addCase(deleteInvite.pending, (state, action) => {
        state.operation = {
          type: "delete",
          loading: true,
          success: false,
          error: null,
          targetId: action.meta?.arg
        };
      })
      .addCase(deleteInvite.fulfilled, (state, action) => {
        state.operation = {
          type: "delete",
          loading: false,
          success: true,
          error: null,
          targetId: action.meta?.arg
        };
        state.items = state.items.filter(invite => invite.id !== action.meta?.arg);
        
        if (state.selectedInvite.data && state.selectedInvite.data.id === action.meta?.arg) {
          state.selectedInvite.data = null;
        }
      })
      .addCase(deleteInvite.rejected, (state, action) => {
        state.operation = {
          type: "delete",
          loading: false,
          success: false,
          error: typeof action.payload === 'string'
            ? action.payload
            : "Erreur lors de la suppression de l'invité",
          targetId: action.meta?.arg
        };
      })

      // fetchInvitesByEntreprise
      .addCase(fetchInvitesByEntreprise.pending, (state) => {
        state.entrepriseInvites.loading = true;
        state.entrepriseInvites.error = null;
      })
      .addCase(fetchInvitesByEntreprise.fulfilled, (state, action) => {
        state.entrepriseInvites.loading = false;
        state.entrepriseInvites.items = action.payload.data?.data || action.payload.data || [];
        state.entrepriseInvites.entrepriseId = action.payload.entrepriseId;
      })
      .addCase(fetchInvitesByEntreprise.rejected, (state, action) => {
        state.entrepriseInvites.loading = false;
        state.entrepriseInvites.error = typeof action.payload === 'string'
          ? action.payload
          : "Erreur lors de la récupération des invités";
      })
      .addCase(fetchEntreprises.pending, (state) => {
        state.entreprises.loading = true;
        state.entreprises.error = null;
      })
      .addCase(fetchEntreprises.fulfilled, (state, action) => {
        // Pagination Laravel ou liste simple
        const data = action.payload.data?.data || action.payload.data || [];
        state.entreprises.items = Array.isArray(data) ? data : [];
        state.entreprises.loading = false;
      })
      .addCase(fetchEntreprises.rejected, (state, action) => {
        state.entreprises.loading = false;
        state.entreprises.error = typeof action.payload === 'string'
          ? action.payload
          : "Erreur lors du chargement des entreprises";
      })
      .addCase(fetchActions.pending, (state) => {
        state.actions.loading = true;
        state.actions.error = null;
      })
      .addCase(fetchActions.fulfilled, (state, action) => {
        const data = action.payload.data?.data || action.payload.data || [];
        state.actions.items = Array.isArray(data) ? data : [];
        state.actions.loading = false;
      })
      .addCase(fetchActions.rejected, (state, action) => {
        state.actions.loading = false;
        state.actions.error = typeof action.payload === 'string'
          ? action.payload
          : "Erreur lors du chargement des actions";
      })
      .addCase(fetchEtapesByAction.pending, (state) => {
        state.etapes.loading = true;
        state.etapes.error = null;
      })
      .addCase(fetchEtapesByAction.fulfilled, (state, action) => {
        const data = action.payload.data?.data || action.payload.data || [];
        state.etapes.items = Array.isArray(data) ? data : [];
        state.etapes.loading = false;
      })
      .addCase(fetchEtapesByAction.rejected, (state, action) => {
        state.etapes.loading = false;
        state.etapes.error = typeof action.payload === 'string'
          ? action.payload
          : "Erreur lors du chargement des étapes";
      });
  }
});

export const { setFilters, clearFilters, resetOperation } = inviteSlice.actions;
export default inviteSlice.reducer;