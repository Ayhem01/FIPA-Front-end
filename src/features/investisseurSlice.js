import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_BASE_URL = "http://localhost:8000/api";

// Configuration de l'instance axios
const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
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

// Fonction utilitaire pour formater les erreurs
const formatErrorMessage = (error) => {
    if (!error) return "Une erreur inconnue est survenue";

    if (typeof error === 'string') return error;

    if (error.message) return error.message;

    if (error.response?.data?.message) return error.response.data.message;

    if (error.response?.data && typeof error.response.data === 'object') {
        if (error.response.data.message) {
            return error.response.data.message;
        }

        if (error.response.data.errors) {
            return Object.values(error.response.data.errors)
                .flat()
                .join(', ');
        }
    }

    return "Une erreur est survenue lors de la communication avec le serveur";
};

// Actions asynchrones
export const getInvestisseurs = createAsyncThunk(
    'investisseurs/getInvestisseurs',
    async (params = {}, { rejectWithValue }) => {
        try {
            const response = await api.get('/investisseurs', { params });
            return response.data;
        } catch (error) {
            return rejectWithValue(formatErrorMessage(error));
        }
    }
);

export const getInvestisseurById = createAsyncThunk(
    'investisseurs/getInvestisseurById',
    async (id, { rejectWithValue }) => {
        try {
            console.log('Fetching investisseur with ID:', id);
            const response = await api.get(`/investisseurs/${id}`);
            console.log('API Response:', response.data);
            return response.data.data;
        } catch (error) {
            console.error('Error fetching investisseur:', error);
            return rejectWithValue(formatErrorMessage(error));
        }
    }
);

export const createInvestisseur = createAsyncThunk(
    'investisseurs/createInvestisseur',
    async (data, { rejectWithValue }) => {
        try {
            const response = await api.post('/investisseurs', data);
            return response.data;
        } catch (error) {
            return rejectWithValue(formatErrorMessage(error));
        }
    }
);

export const updateInvestisseur = createAsyncThunk(
    'investisseurs/updateInvestisseur',
    async ({ id, data }, { rejectWithValue }) => {
        try {
            const response = await api.put(`/investisseurs/${id}`, data);
            return response.data;
        } catch (error) {
            return rejectWithValue(formatErrorMessage(error));
        }
    }
);

export const deleteInvestisseur = createAsyncThunk(
    'investisseurs/deleteInvestisseur',
    async (id, { rejectWithValue }) => {
        try {
            const response = await api.delete(`/investisseurs/${id}`);
            return { id, message: response.data.message };
        } catch (error) {
            return rejectWithValue(formatErrorMessage(error));
        }
    }
);

export const updateInvestisseurStatus = createAsyncThunk(
    'investisseurs/updateStatus',
    async ({ id, statut }, { rejectWithValue }) => {
        try {
            const response = await api.patch(`/investisseurs/${id}/status`, { statut });
            return response.data;
        } catch (error) {
            return rejectWithValue(formatErrorMessage(error));
        }
    }
);

export const getInvestisseurStats = createAsyncThunk(
    'investisseurs/getStats',
    async (_, { rejectWithValue }) => {
        try {
            const response = await api.get('/investisseurs/stats');
            return response.data.data;
        } catch (error) {
            return rejectWithValue(formatErrorMessage(error));
        }
    }
);

export const initializePipeline = createAsyncThunk(
    'investisseurs/initializePipeline',
    async ({ id }, { rejectWithValue }) => {
        try {
            const response = await api.post(`/investisseurs/${id}/pipeline/initialize`);
            return response.data;
        } catch (error) {
            return rejectWithValue(formatErrorMessage(error));
        }
    }
);

export const advancePipeline = createAsyncThunk(
    'investisseurs/advancePipeline',
    async ({ id, stage_id, notes, date }, { rejectWithValue }) => {
        try {
            const response = await api.post(`/investisseurs/${id}/pipeline/advance`, {
                stage_id,
                notes,
                date
            });
            return response.data;
        } catch (error) {
            return rejectWithValue(formatErrorMessage(error));
        }
    }
);

export const getPipelineStatus = createAsyncThunk(
    'investisseurs/getPipelineStatus',
    async (id, { rejectWithValue }) => {
        try {
            console.log('Fetching pipeline for investisseur:', id);
            const response = await api.get(`/investisseurs/${id}/pipeline`);
            console.log('Pipeline response:', response.data);

            const data = response.data?.data || {};
            // Normalisation: extraire partout où ça peut être
            const stages = data.stages || data.all_stages || [];
            const currentStage = data.current_stage || data.currentStage || null;
            const progression =
                data.progressions ||
                data.pipeline_progressions ||
                data.investisseur?.pipeline_progressions ||
                [];

            // Pourcentage fallback si backend ne le donne pas
            const completedCount = Array.isArray(progression)
                ? progression.filter(p => p?.completed === true || p?.completed === 1).length
                : 0;
            const progressionPercentage = data.progression_percentage ??
                (stages.length > 0 ? Math.round((completedCount / stages.length) * 100) : 0);

            return {
                stages,
                currentStage,
                progression,
                progressionPercentage,
                investisseur: data.investisseur || null,
                canConvertToProject: data.can_convert_to_project ?? false,
                raw: data // debug
            };
        } catch (error) {
            console.error('Error fetching pipeline:', error);
            if (error.response?.status === 404) return null;
            return rejectWithValue(formatErrorMessage(error));
        }
    }
);


export const convertToProject = createAsyncThunk(
    'investisseurs/convertToProject',
    async ({ id, data }, { rejectWithValue }) => {
        try {
            const response = await api.post(`/investisseurs/${id}/convert-to-project`, data);
            return response.data;
        } catch (error) {
            return rejectWithValue(formatErrorMessage(error));
        }
    }
);

const initialState = {
    items: [],
    selectedInvestisseur: {
        data: null,
        loading: false,
        error: null
    },
    pipeline: {
        data: null,
        stages: [],
        currentStage: null,
        progression: [],
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
    },
    loading: false,
    error: null,
    pagination: {
        current: 1,
        pageSize: 15,
        total: 0
    }
};

const investisseurSlice = createSlice({
    name: 'investisseurs',
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
        clearSelectedInvestisseur: (state) => {
            state.selectedInvestisseur = {
                data: null,
                loading: false,
                error: null
            };
        },
        clearPipeline: (state) => {
            state.pipeline = {
                data: null,
                stages: [],
                currentStage: null,
                loading: false,
                error: null
            };
        }
    },
    extraReducers: (builder) => {
        builder
            // Get investisseurs
            .addCase(getInvestisseurs.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getInvestisseurs.fulfilled, (state, action) => {
                state.loading = false;
                
                // Handle different possible response structures
                let responseData = action.payload;
                let itemsArray = [];
                
                if (responseData.data) {
                    // If data is nested (Laravel pagination format)
                    if (Array.isArray(responseData.data.data)) {
                        itemsArray = responseData.data.data;
                        state.pagination = {
                            current: responseData.data.current_page || 1,
                            pageSize: responseData.data.per_page || 15,
                            total: responseData.data.total || 0
                        };
                    } else if (Array.isArray(responseData.data)) {
                        // If data is direct array
                        itemsArray = responseData.data;
                        if (responseData.current_page) {
                            state.pagination = {
                                current: responseData.current_page,
                                pageSize: responseData.per_page || 15,
                                total: responseData.total || itemsArray.length
                            };
                        }
                    }
                } else if (Array.isArray(responseData)) {
                    // If response is direct array
                    itemsArray = responseData;
                }
                
                // Ensure items is always an array
                state.items = Array.isArray(itemsArray) ? itemsArray : [];
            })
            .addCase(getInvestisseurs.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
                // Ensure items is always an array even on error
                state.items = [];
            })

            // Get investisseur by ID
            .addCase(getInvestisseurById.pending, (state) => {
                state.selectedInvestisseur.loading = true;
                state.selectedInvestisseur.error = null;
            })
            .addCase(getInvestisseurById.fulfilled, (state, action) => {
                state.selectedInvestisseur.loading = false;
                state.selectedInvestisseur.data = action.payload;
            })
            .addCase(getInvestisseurById.rejected, (state, action) => {
                state.selectedInvestisseur.loading = false;
                state.selectedInvestisseur.error = action.payload;
            })

            // Create investisseur
            .addCase(createInvestisseur.pending, (state) => {
                state.operation = { type: 'create', loading: true, success: false, error: null };
            })
            .addCase(createInvestisseur.fulfilled, (state, action) => {
                state.operation = { type: 'create', loading: false, success: true, error: null };
                if (action.payload.data) {
                    state.items.unshift(action.payload.data);
                }
            })
            .addCase(createInvestisseur.rejected, (state, action) => {
                state.operation = { type: 'create', loading: false, success: false, error: action.payload };
            })

            // Update investisseur
            .addCase(updateInvestisseur.pending, (state) => {
                state.operation = { type: 'update', loading: true, success: false, error: null };
            })
            .addCase(updateInvestisseur.fulfilled, (state, action) => {
                state.operation = { type: 'update', loading: false, success: true, error: null };
                if (action.payload.data) {
                    const index = state.items.findIndex(item => item.id === action.payload.data.id);
                    if (index !== -1) {
                        state.items[index] = action.payload.data;
                    }
                    if (state.selectedInvestisseur.data?.id === action.payload.data.id) {
                        state.selectedInvestisseur.data = action.payload.data;
                    }
                }
            })
            .addCase(updateInvestisseur.rejected, (state, action) => {
                state.operation = { type: 'update', loading: false, success: false, error: action.payload };
            })

            // Delete investisseur
            .addCase(deleteInvestisseur.pending, (state) => {
                state.operation = { type: 'delete', loading: true, success: false, error: null };
            })
            .addCase(deleteInvestisseur.fulfilled, (state, action) => {
                state.operation = { type: 'delete', loading: false, success: true, error: null };
                state.items = state.items.filter(item => item.id !== action.payload.id);
                if (state.selectedInvestisseur.data?.id === action.payload.id) {
                    state.selectedInvestisseur.data = null;
                }
            })
            .addCase(deleteInvestisseur.rejected, (state, action) => {
                state.operation = { type: 'delete', loading: false, success: false, error: action.payload };
            })

            // Update status
            .addCase(updateInvestisseurStatus.pending, (state) => {
                state.operation = { type: 'update_status', loading: true, success: false, error: null };
            })
            .addCase(updateInvestisseurStatus.fulfilled, (state, action) => {
                state.operation = { type: 'update_status', loading: false, success: true, error: null };
                if (action.payload.data) {
                    const index = state.items.findIndex(item => item.id === action.payload.data.id);
                    if (index !== -1) {
                        state.items[index] = action.payload.data;
                    }
                    if (state.selectedInvestisseur.data?.id === action.payload.data.id) {
                        state.selectedInvestisseur.data = action.payload.data;
                    }
                }
            })
            .addCase(updateInvestisseurStatus.rejected, (state, action) => {
                state.operation = { type: 'update_status', loading: false, success: false, error: action.payload };
            })

            // Get stats
            .addCase(getInvestisseurStats.pending, (state) => {
                state.stats.loading = true;
                state.stats.error = null;
            })
            .addCase(getInvestisseurStats.fulfilled, (state, action) => {
                state.stats.loading = false;
                state.stats.data = action.payload;
            })
            .addCase(getInvestisseurStats.rejected, (state, action) => {
                state.stats.loading = false;
                state.stats.error = action.payload;
            })

            // Initialize pipeline
            .addCase(initializePipeline.pending, (state) => {
                state.operation = { type: 'initialize_pipeline', loading: true, success: false, error: null };
            })
            .addCase(initializePipeline.fulfilled, (state, action) => {
                state.operation = { type: 'initialize_pipeline', loading: false, success: true, error: null };

                console.log('Initialize pipeline response:', action.payload);

                // Votre backend retourne: { success: true, data: { investisseur: {...}, stages: [...], current_stage: {...}, ... } }
                if (action.payload && action.payload.data) {
                    // Mettre à jour l'investisseur si présent
                    if (action.payload.data.investisseur) {
                        state.selectedInvestisseur.data = action.payload.data.investisseur;
                    }

                    // Mettre à jour les données du pipeline
                    state.pipeline.data = action.payload.data;
                    state.pipeline.stages = action.payload.data.stages || [];
                    state.pipeline.currentStage = action.payload.data.current_stage || null;

                    console.log('Pipeline initialized in state:', {
                        hasData: !!state.pipeline.data,
                        stagesCount: state.pipeline.stages.length,
                        currentStage: state.pipeline.currentStage
                    });
                }
            })
            .addCase(initializePipeline.rejected, (state, action) => {
                state.operation = { type: 'initialize_pipeline', loading: false, success: false, error: action.payload };
            })

            // Advance pipeline
            .addCase(advancePipeline.pending, (state) => {
                state.operation = { type: 'advance_pipeline', loading: true, success: false, error: null };
            })

            .addCase(advancePipeline.fulfilled, (state, action) => {
                state.operation = { type: 'advance_pipeline', loading: false, success: true, error: null };

                console.log('Advance pipeline response:', action.payload);

                if (action.payload && action.payload.data) {
                    if (action.payload.data.investisseur) {
                        state.selectedInvestisseur.data = action.payload.data.investisseur;
                    }

                    state.pipeline.data = action.payload.data;
                    state.pipeline.stages = action.payload.data.stages || [];
                    state.pipeline.currentStage = action.payload.data.current_stage || null;

                    // Mettre à jour le statut des étapes basé sur la progression
                    if (action.payload.data.stages) {
                        state.pipeline.stages = action.payload.data.stages.map(stage => ({
                            ...stage,
                            // S'assurer que le statut est correctement défini
                            status: stage.status || (stage.id === action.payload.data.current_stage?.id ? 'current' : 'wait')
                        }));
                    }
                }
            })
            .addCase(advancePipeline.rejected, (state, action) => {
                state.operation = { type: 'advance_pipeline', loading: false, success: false, error: action.payload };
            })

            // Get pipeline status
            .addCase(getPipelineStatus.pending, (state) => {
                state.pipeline.loading = true;
                state.pipeline.error = null;
            })
.addCase(getPipelineStatus.fulfilled, (state, action) => {
    state.pipeline.loading = false;
    console.log('✅ Pipeline action payload received (normalized):', action.payload);

    if (action.payload) {
        // payload normalisé
        state.pipeline.data = action.payload;
        state.pipeline.stages = action.payload.stages || [];
        state.pipeline.currentStage = action.payload.currentStage || null;
        state.pipeline.progression = Array.isArray(action.payload.progression)
            ? action.payload.progression
            : [];

        if (action.payload.investisseur) {
            state.selectedInvestisseur.data = action.payload.investisseur;
        }

        console.log('✅ Pipeline state updated:', {
            stagesCount: state.pipeline.stages.length,
            currentStage: state.pipeline.currentStage?.name,
            progressionCount: state.pipeline.progression.length
        });
    } else {
        state.pipeline.data = null;
        state.pipeline.stages = [];
        state.pipeline.currentStage = null;
        state.pipeline.progression = [];
    }
})
            .addCase(getPipelineStatus.rejected, (state, action) => {
                state.pipeline.loading = false;
                state.pipeline.error = action.payload;
            })

            // Convert to project
            .addCase(convertToProject.pending, (state) => {
                state.operation = { type: 'convert_to_project', loading: true, success: false, error: null };
            })
            .addCase(convertToProject.fulfilled, (state, action) => {
                state.operation = { type: 'convert_to_project', loading: false, success: true, error: null };
                if (state.selectedInvestisseur.data && action.payload.data?.investisseur) {
                    state.selectedInvestisseur.data = action.payload.data.investisseur;
                }
            })
            .addCase(convertToProject.rejected, (state, action) => {
                state.operation = { type: 'convert_to_project', loading: false, success: false, error: action.payload };
            });
    }
});

export const { resetOperation, clearSelectedInvestisseur, clearPipeline } = investisseurSlice.actions;
export default investisseurSlice.reducer;