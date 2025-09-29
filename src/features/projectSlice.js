import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { message } from "antd";

// Base URL pour les API
const API_BASE_URL = "http://127.0.0.1:8000/api";

// Helper pour obtenir le token d'authentification
const getAuthHeader = () => {
    const token = localStorage.getItem("token");
    if (!token) {
        throw new Error("Aucun token trouvé dans le localStorage");
    }
    return {
        headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
        },
    };
};

// ====================== THUNKS POUR LES PROJETS ======================

// Récupérer tous les projets
export const fetchProjects = createAsyncThunk(
    "projects/fetchProjects",
    async (params = {}, { rejectWithValue }) => {
        try {
            const queryParams = new URLSearchParams();
            Object.keys(params).forEach((key) => {
                if (params[key] !== undefined && params[key] !== null && params[key] !== '') {
                    queryParams.append(key, params[key]);
                }
            });

            const url = queryParams.toString()
                ? `${API_BASE_URL}/projects?${queryParams.toString()}`
                : `${API_BASE_URL}/projects`;

            const response = await axios.get(url, getAuthHeader());
            return response.data;
        } catch (error) {
            console.error("Erreur lors du chargement des projets:", error);
            return rejectWithValue(error.response?.data || "Une erreur s'est produite");
        }
    }
);

// Récupérer un projet par ID
export const getProjectById = createAsyncThunk(
    "projects/getProjectById",
    async (id, { rejectWithValue }) => {
        try {
            const response = await axios.get(
                `${API_BASE_URL}/projects/${id}`,
                getAuthHeader()
            );
            return response.data;
        } catch (error) {
            console.error(`Erreur lors de la récupération du projet ${id}:`, error);
            return rejectWithValue(error.response?.data || "Une erreur s'est produite");
        }
    }
);

// Créer un nouveau projet
export const createProject = createAsyncThunk(
    "projects/createProject",
    async (projectData, { rejectWithValue }) => {
        try {
            const response = await axios.post(
                `${API_BASE_URL}/projects`,
                projectData,
                getAuthHeader()
            );
            message.success('Projet créé avec succès');
            return response.data;
        } catch (error) {
            console.error("Erreur lors de la création du projet:", error);
            message.error('Erreur lors de la création du projet');
            return rejectWithValue(error.response?.data || "Une erreur s'est produite");
        }
    }
);

// Finaliser le pipeline d'un projet
export const finalizeProjectPipeline = createAsyncThunk(
    "projects/finalizeProjectPipeline",
    async (id, { rejectWithValue }) => {
        try {
            const response = await axios.post(
                `${API_BASE_URL}/projects/${id}/finalize-pipeline`,
                {},
                getAuthHeader()
            );
            message.success('Pipeline finalisé avec succès');
            return response.data;
        } catch (error) {
            console.error(`Erreur lors de la finalisation du pipeline du projet ${id}:`, error);
            message.error('Erreur lors de la finalisation du pipeline');
            return rejectWithValue(error.response?.data || "Une erreur s'est produite");
        }
    }
);

// Mettre à jour un projet
export const updateProject = createAsyncThunk(
    "projects/updateProject",
    async ({ id, data }, { rejectWithValue }) => {
        try {
            const response = await axios.put(
                `${API_BASE_URL}/projects/${id}`,
                data,
                getAuthHeader()
            );
            message.success('Projet mis à jour avec succès');
            return response.data;
        } catch (error) {
            console.error(`Erreur lors de la mise à jour du projet ${id}:`, error);
            message.error('Erreur lors de la mise à jour du projet');
            return rejectWithValue(error.response?.data || "Une erreur s'est produite");
        }
    }
);

// Supprimer un projet
export const deleteProject = createAsyncThunk(
    "projects/deleteProject",
    async (id, { rejectWithValue }) => {
        try {
            await axios.delete(
                `${API_BASE_URL}/projects/${id}`,
                getAuthHeader()
            );
            message.success('Projet supprimé avec succès');
            return id;
        } catch (error) {
            console.error(`Erreur lors de la suppression du projet ${id}:`, error);
            message.error('Erreur lors de la suppression du projet');
            return rejectWithValue(error.response?.data || "Une erreur s'est produite");
        }
    }
);

// Mettre à jour le statut d'un projet
export const updateProjectStatus = createAsyncThunk(
    "projects/updateProjectStatus",
    async ({ id, status }, { rejectWithValue }) => {
      try {
        // S'assurer que le statut est une chaîne de caractères
        const statusString = String(status);
        
        // Utiliser un objet pour les données
        const response = await axios.patch(
            `${API_BASE_URL}/projects/${id}/status`,
            { status: statusString },  // Envoyer le statut comme un objet avec clé "status"
          getAuthHeader()
        );
  
        return response.data;
      } catch (error) {
        console.error(`Erreur lors de la mise à jour du statut du projet ${id}:`, error);
        return rejectWithValue(
          error.response?.data || "Erreur lors de la mise à jour du statut"
        );
      }
    }
  );

// Récupérer les projets par secteur
export const getProjectsBySecteur = createAsyncThunk(
    "projects/getProjectsBySecteur",
    async (secteurId, { rejectWithValue }) => {
        try {
            const response = await axios.get(
                `${API_BASE_URL}/projects/secteur/${secteurId}`,
                getAuthHeader()
            );
            return response.data;
        } catch (error) {
            console.error(`Erreur lors de la récupération des projets du secteur ${secteurId}:`, error);
            return rejectWithValue(error.response?.data || "Une erreur s'est produite");
        }
    }
);

// Récupérer les statistiques des projets
export const fetchProjectStats = createAsyncThunk(
    "projects/fetchProjectStats",
    async (_, { rejectWithValue }) => {
        try {
            const response = await axios.get(
                `${API_BASE_URL}/projects/stats`,
                getAuthHeader()
            );
            return response.data;
        } catch (error) {
            console.error("Erreur lors du chargement des statistiques:", error);
            return rejectWithValue(error.response?.data || "Une erreur s'est produite");
        }
    }
);

// ====================== THUNKS POUR LES PIPELINES DE PROJET ======================

// Initialiser le pipeline d'un projet
export const initializeProjectPipeline = createAsyncThunk(
    "projects/initializeProjectPipeline",
    async ({ id, pipelineData = {} }, { rejectWithValue }) => {
        try {
            const response = await axios.post(
                `${API_BASE_URL}/projects/${id}/pipeline/initialize`,
                pipelineData,
                getAuthHeader()
            );
            message.success('Pipeline initialisé avec succès');
            return response.data;
        } catch (error) {
            console.error(`Erreur lors de l'initialisation du pipeline du projet ${id}:`, error);
            message.error('Erreur lors de l\'initialisation du pipeline');
            return rejectWithValue(error.response?.data || "Une erreur s'est produite");
        }
    }
);

// Avancer dans le pipeline d'un projet
export const advanceProjectPipeline = createAsyncThunk(
    "projects/advanceProjectPipeline",
    async ({ id, stageData }, { rejectWithValue }) => {
        try {
            const response = await axios.post(
                `${API_BASE_URL}/projects/${id}/pipeline/advance`,
                stageData,
                getAuthHeader()
            );
            message.success('Étape du pipeline avancée avec succès');
            return response.data;
        } catch (error) {
            console.error(`Erreur lors de l'avancement du pipeline du projet ${id}:`, error);
            message.error('Erreur lors de l\'avancement du pipeline');
            return rejectWithValue(error.response?.data || "Une erreur s'est produite");
        }
    }
);

// Mettre à jour l'étape du pipeline d'un projet
export const updateProjectPipelineStage = createAsyncThunk(
    "projects/updateProjectPipelineStage",
    async ({ id, stageData }, { rejectWithValue }) => {
        try {
            const response = await axios.patch(
                `${API_BASE_URL}/projects/${id}/pipeline/stage`,
                stageData,
                getAuthHeader()
            );
            message.success('Étape du pipeline mise à jour avec succès');
            return { id, data: response.data };
        } catch (error) {
            console.error(`Erreur lors de la mise à jour de l'étape du pipeline ${id}:`, error);
            message.error('Erreur lors de la mise à jour de l\'étape');
            return rejectWithValue(error.response?.data || "Une erreur s'est produite");
        }
    }
);

// Récupérer le statut du pipeline d'un projet
export const getProjectPipelineStatus = createAsyncThunk(
    "projects/getProjectPipelineStatus",
    async (id, { rejectWithValue }) => {
        try {
            const response = await axios.get(
                `${API_BASE_URL}/projects/${id}/pipeline`,
                getAuthHeader()
            );
            return { projectId: id, data: response.data };
        } catch (error) {
            console.error(`Erreur lors de la récupération du pipeline du projet ${id}:`, error);
            return rejectWithValue(error.response?.data || "Une erreur s'est produite");
        }
    }
);
// Ajoutez ces deux nouvelles méthodes après la méthode createProject (ligne 91) :

// Créer un projet à partir d'un investisseur
export const createProjectFromInvestisseur = createAsyncThunk(
    "projects/createProjectFromInvestisseur",
    async (projectData, { rejectWithValue }) => {
        try {
            const response = await axios.post(
                `${API_BASE_URL}/projects/from-investisseur`,
                projectData,
                getAuthHeader()
            );
            message.success('Projet créé avec succès à partir de l\'investisseur');
            return response.data;
        } catch (error) {
            console.error("Erreur lors de la création du projet depuis l'investisseur:", error);
            message.error('Erreur lors de la création du projet');
            return rejectWithValue(error.response?.data || "Une erreur s'est produite");
        }
    }
);

// Récupérer les données d'un investisseur pour créer un projet
export const getInvestisseurDataForProject = createAsyncThunk(
    "projects/getInvestisseurDataForProject",
    async (investisseurId, { rejectWithValue }) => {
        try {
            const response = await axios.get(
                `${API_BASE_URL}/projects/investisseur/${investisseurId}/data`,
                getAuthHeader()
            );
            return response.data;
        } catch (error) {
            console.error(`Erreur lors de la récupération des données de l'investisseur ${investisseurId}:`, error);
            return rejectWithValue(error.response?.data || "Une erreur s'est produite");
        }
    }
);
export const fetchTotalJobs = createAsyncThunk(
    "projects/fetchTotalJobs",
    async (_, { rejectWithValue }) => {
      try {
        const response = await axios.get(`${API_BASE_URL}/projects/total-jobs`, getAuthHeader());
        return response.data;
      } catch (error) {
        return rejectWithValue(error.response?.data || "Erreur lors de la récupération des emplois");
      }
    }
  );
  
  // Récupérer le montant total d'investissement par secteur
  export const fetchInvestmentBySector = createAsyncThunk(
    "projects/fetchInvestmentBySector",
    async (_, { rejectWithValue }) => {
      try {
        const response = await axios.get(`${API_BASE_URL}/projects/investment-by-sector`, getAuthHeader());
        return response.data;
      } catch (error) {
        return rejectWithValue(error.response?.data || "Erreur lors de la récupération des investissements par secteur");
      }
    }
  );
  
  // Récupérer le nombre de projets par statut
  export const fetchProjectsByStatus = createAsyncThunk(
    "projects/fetchProjectsByStatus",
    async (_, { rejectWithValue }) => {
      try {
        const response = await axios.get(`${API_BASE_URL}/projects/projects-by-status`, getAuthHeader());
        return response.data;
      } catch (error) {
        return rejectWithValue(error.response?.data || "Erreur lors de la récupération des projets par statut");
      }
    }
  );
  
  // Récupérer le nombre total d'emplois par secteur
  export const fetchJobsBySector = createAsyncThunk(
    "projects/fetchJobsBySector",
    async (_, { rejectWithValue }) => {
      try {
        const response = await axios.get(`${API_BASE_URL}/projects/jobs-by-sector`, getAuthHeader());
        return response.data;
      } catch (error) {
        return rejectWithValue(error.response?.data || "Erreur lors de la récupération des emplois par secteur");
      }
    }
  );
  

// ====================== SLICE ======================
const projectSlice = createSlice({
    name: "projects",
    initialState: {
        // État des projets
        items: [],
        pagination: {
            current: 1,
            pageSize: 15,
            total: 0
        },
        loading: false,
        error: null,
        filters: {},
        selectedProject: {
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

        // État des pipelines de projet
        projectPipeline: {
            data: null,
            loading: false,
            error: null
        },

        // État des statistiques
        statistics: {
            data: null,
            loading: false,
            error: null
        },

        // État des projets par secteur
        projectsBySecteur: {
            items: [],
            loading: false,
            error: null
        },
        investisseurData: {
            data: null,
            loading: false,
            error: null
        },
        statistics: {
            totalJobs: null,
            investmentBySector: [],
            projectsByStatus: [],
            jobsBySector: [],
            loading: false,
            error: null,
          }
    },
    reducers: {
        // Reducers pour les projets
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
        },
        resetProjectPipeline: (state) => {
            state.projectPipeline = {
                data: null,
                loading: false,
                error: null
            };
        },
        resetInvestisseurData: (state) => {
            state.investisseurData = {
                data: null,
                loading: false,
                error: null
            };
        }
    },
    extraReducers: (builder) => {
        builder
            // ================ Gestion des projets ================
            // Gestion fetchProjects
            .addCase(fetchProjects.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchProjects.fulfilled, (state, action) => {
                state.loading = false;
                console.log('fetchProjects response:', action.payload); // Pour debug
                
                // Gérer les différents formats de réponse possible
                let projectsData = [];
                let paginationData = {};
                
                if (action.payload) {
                    // Format Laravel avec pagination : { data: { data: [...], meta: {...} } }
                    if (action.payload.data && Array.isArray(action.payload.data.data)) {
                        projectsData = action.payload.data.data;
                        paginationData = {
                            current: action.payload.data.current_page || 1,
                            pageSize: action.payload.data.per_page || 15,
                            total: action.payload.data.total || 0
                        };
                    }
                    // Format Laravel avec pagination : { data: [...], current_page: ..., per_page: ..., total: ... }
                    else if (Array.isArray(action.payload.data) && action.payload.current_page !== undefined) {
                        projectsData = action.payload.data;
                        paginationData = {
                            current: action.payload.current_page || 1,
                            pageSize: action.payload.per_page || 15,
                            total: action.payload.total || 0
                        };
                    }
                    // Format simple avec pagination : { data: [...], meta: {...} }
                    else if (Array.isArray(action.payload.data) && action.payload.meta) {
                        projectsData = action.payload.data;
                        paginationData = {
                            current: action.payload.meta.current_page || 1,
                            pageSize: action.payload.meta.per_page || 15,
                            total: action.payload.meta.total || 0
                        };
                    }
                    // Format tableau simple : { data: [...] }
                    else if (Array.isArray(action.payload.data)) {
                        projectsData = action.payload.data;
                        paginationData = {
                            current: 1,
                            pageSize: projectsData.length,
                            total: projectsData.length
                        };
                    }
                    // Format tableau direct : [...]
                    else if (Array.isArray(action.payload)) {
                        projectsData = action.payload;
                        paginationData = {
                            current: 1,
                            pageSize: projectsData.length,
                            total: projectsData.length
                        };
                    }
                    // Format avec success: { success: true, data: [...] }
                    else if (action.payload.success && Array.isArray(action.payload.data)) {
                        projectsData = action.payload.data;
                        paginationData = {
                            current: 1,
                            pageSize: projectsData.length,
                            total: projectsData.length
                        };
                    }
                }
                
                // S'assurer que projectsData est toujours un tableau
                state.items = Array.isArray(projectsData) ? projectsData : [];
                state.pagination = paginationData;
                
                console.log('Projects stored in state:', state.items.length, 'items');
            })
            .addCase(fetchProjects.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload?.message || 'Erreur lors de la récupération des projets';
                // S'assurer que items reste un tableau même en cas d'erreur
                if (!Array.isArray(state.items)) {
                    state.items = [];
                }
                console.error('Erreur fetchProjects:', action.payload);
            })

            // Gestion getProjectById
            .addCase(getProjectById.pending, (state) => {
                state.selectedProject.loading = true;
                state.selectedProject.error = null;
            })
            .addCase(getProjectById.fulfilled, (state, action) => {
                state.selectedProject.loading = false;
                state.selectedProject.data = action.payload.data || action.payload;
            })
            .addCase(getProjectById.rejected, (state, action) => {
                state.selectedProject.loading = false;
                state.selectedProject.error = action.payload?.message || 'Erreur lors de la récupération du projet';
            })

            // Gestion createProject
            .addCase(createProject.pending, (state) => {
                state.operation = {
                    type: 'create',
                    loading: true,
                    success: false,
                    error: null
                };
            })
            .addCase(createProject.fulfilled, (state, action) => {
                state.operation = {
                    type: 'create',
                    loading: false,
                    success: true,
                    error: null
                };
                const newProject = action.payload.data || action.payload;
                state.items.unshift(newProject);
            })
            .addCase(createProject.rejected, (state, action) => {
                state.operation = {
                    type: 'create',
                    loading: false,
                    success: false,
                    error: action.payload?.message || 'Erreur lors de la création du projet'
                };
            })

            // Gestion updateProject
            .addCase(updateProject.pending, (state, action) => {
                state.operation = {
                    type: 'update',
                    loading: true,
                    success: false,
                    error: null,
                    targetId: action.meta.arg.id
                };
            })
            .addCase(updateProject.fulfilled, (state, action) => {
                state.operation = {
                    type: 'update',
                    loading: false,
                    success: true,
                    error: null,
                    targetId: action.meta.arg.id
                };

                const updatedProject = action.payload.data || action.payload;
                
                // Mettre à jour le projet dans la liste si présent
                const index = state.items.findIndex(item => item.id === action.meta.arg.id);
                if (index !== -1) {
                    state.items[index] = updatedProject;
                }

                // Mettre à jour le projet sélectionné si c'est le même
                if (state.selectedProject.data?.id === action.meta.arg.id) {
                    state.selectedProject.data = updatedProject;
                }
            })
            .addCase(updateProject.rejected, (state, action) => {
                state.operation = {
                    type: 'update',
                    loading: false,
                    success: false,
                    error: action.payload?.message || 'Erreur lors de la mise à jour du projet',
                    targetId: action.meta.arg.id
                };
            })

            // Gestion deleteProject
            .addCase(deleteProject.pending, (state, action) => {
                state.operation = {
                    type: 'delete',
                    loading: true,
                    success: false,
                    error: null,
                    targetId: action.meta.arg
                };
            })
            .addCase(deleteProject.fulfilled, (state, action) => {
                state.operation = {
                    type: 'delete',
                    loading: false,
                    success: true,
                    error: null,
                    targetId: action.meta.arg
                };
                state.items = state.items.filter(item => item.id !== action.payload);
                if (state.selectedProject.data?.id === action.payload) {
                    state.selectedProject.data = null;
                }
            })
            .addCase(deleteProject.rejected, (state, action) => {
                state.operation = {
                    type: 'delete',
                    loading: false,
                    success: false,
                    error: action.payload?.message || 'Erreur lors de la suppression du projet',
                    targetId: action.meta.arg
                };
            })

            // Gestion updateProjectStatus
            .addCase(updateProjectStatus.pending, (state, action) => {
                state.operation = {
                    type: 'status',
                    loading: true,
                    success: false,
                    error: null,
                    targetId: action.meta.arg.id
                };
            })
            .addCase(updateProjectStatus.fulfilled, (state, action) => {
                state.operation = {
                    type: 'status',
                    loading: false,
                    success: true,
                    error: null,
                    targetId: action.meta.arg.id
                };

                // Mettre à jour le projet dans la liste si présent
                const index = state.items.findIndex(item => item.id === action.meta.arg.id);
                if (index !== -1) {
                    state.items[index] = { ...state.items[index], ...action.payload.data };
                }

                // Mettre à jour le projet sélectionné si c'est le même
                if (state.selectedProject.data?.id === action.meta.arg.id) {
                    state.selectedProject.data = { ...state.selectedProject.data, ...action.payload.data };
                }
            })
            .addCase(updateProjectStatus.rejected, (state, action) => {
                state.operation = {
                    type: 'status',
                    loading: false,
                    success: false,
                    error: action.payload?.message || 'Erreur lors de la mise à jour du statut',
                    targetId: action.meta.arg.id
                };
            })

            // ================ Gestion des projets par secteur ================
            .addCase(getProjectsBySecteur.pending, (state) => {
                state.projectsBySecteur.loading = true;
                state.projectsBySecteur.error = null;
            })
            .addCase(getProjectsBySecteur.fulfilled, (state, action) => {
                state.projectsBySecteur.loading = false;
                state.projectsBySecteur.items = action.payload.data || action.payload;
            })
            .addCase(getProjectsBySecteur.rejected, (state, action) => {
                state.projectsBySecteur.loading = false;
                state.projectsBySecteur.error = action.payload?.message || 'Erreur lors de la récupération des projets';
            })

            // ================ Gestion des statistiques ================
            .addCase(fetchProjectStats.pending, (state) => {
                state.statistics.loading = true;
                state.statistics.error = null;
            })
            .addCase(fetchProjectStats.fulfilled, (state, action) => {
                state.statistics.loading = false;
                state.statistics.data = action.payload;
            })
            .addCase(fetchProjectStats.rejected, (state, action) => {
                state.statistics.loading = false;
                state.statistics.error = action.payload?.message || 'Erreur lors du chargement des statistiques';
            })

            // ================ Gestion des pipelines de projet ================
            .addCase(initializeProjectPipeline.pending, (state) => {
                state.operation = {
                    type: 'initialize_pipeline',
                    loading: true,
                    success: false,
                    error: null,
                    targetId: null
                };
            })
            .addCase(initializeProjectPipeline.fulfilled, (state, action) => {
                state.operation = {
                    type: 'initialize_pipeline',
                    loading: false,
                    success: true,
                    error: null,
                    targetId: null
                };
                
                const payload = action.payload;
                
                if (payload && payload.success && payload.data) {
                    // Mettre à jour les données du pipeline dans l'état
                    state.projectPipeline.data = payload.data;
                    
                    // Si les données contiennent les informations du pipeline, les extraire
                    if (payload.data.stages) {
                        state.projectPipeline.stages = payload.data.stages;
                    }
                    if (payload.data.current_stage) {
                        state.projectPipeline.currentStage = payload.data.current_stage;
                    }
                }
            })
            .addCase(initializeProjectPipeline.rejected, (state, action) => {
                state.operation = {
                    type: 'initialize_pipeline',
                    loading: false,
                    success: false,
                    error: action.payload?.message || 'Erreur lors de l\'initialisation du pipeline',
                    targetId: null
                };
            })

            .addCase(advanceProjectPipeline.pending, (state) => {
                state.operation = {
                    type: 'advance_pipeline',
                    loading: true,
                    success: false,
                    error: null
                };
            })
            .addCase(advanceProjectPipeline.fulfilled, (state, action) => {
                state.operation = {
                    type: 'advance_pipeline',
                    loading: false,
                    success: true,
                    error: null
                };
                state.projectPipeline.data = action.payload;
            })
            .addCase(advanceProjectPipeline.rejected, (state, action) => {
                state.operation = {
                    type: 'advance_pipeline',
                    loading: false,
                    success: false,
                    error: action.payload?.message || 'Erreur lors de l\'avancement du pipeline'
                };
            })

            .addCase(updateProjectPipelineStage.pending, (state, action) => {
                state.operation = {
                    type: 'update_pipeline_stage',
                    loading: true,
                    success: false,
                    error: null,
                    targetId: action.meta.arg.id
                };
            })
            .addCase(updateProjectPipelineStage.fulfilled, (state, action) => {
                state.operation = {
                    type: 'update_pipeline_stage',
                    loading: false,
                    success: true,
                    error: null,
                    targetId: action.meta.arg.id
                };

                // Mettre à jour le projet dans la liste si présent
                const index = state.items.findIndex(item => item.id === action.meta.arg.id);
                if (index !== -1) {
                    state.items[index] = { ...state.items[index], ...action.payload.data };
                }

                // Mettre à jour le projet sélectionné si c'est le même
                if (state.selectedProject.data?.id === action.meta.arg.id) {
                    state.selectedProject.data = { ...state.selectedProject.data, ...action.payload.data };
                }
            })
            .addCase(updateProjectPipelineStage.rejected, (state, action) => {
                state.operation = {
                    type: 'update_pipeline_stage',
                    loading: false,
                    success: false,
                    error: action.payload?.message || 'Erreur lors de la mise à jour de l\'étape du pipeline',
                    targetId: action.meta.arg.id
                };
            })

            .addCase(getProjectPipelineStatus.pending, (state) => {
                state.projectPipeline.loading = true;
                state.projectPipeline.error = null;
            })
.addCase(getProjectPipelineStatus.fulfilled, (state, action) => {
    state.projectPipeline.loading = false;
    
    const payload = action.payload;
    console.log("Pipeline data received:", payload); // Aide au débogage
    
    // La structure de réponse est { success: true, data: {...} } ou { projectId: id, data: { success: true, data: {...} } }
    if (payload) {
        let responseData;
        
        // Gérer les deux formats possibles de réponse
        if (payload.projectId && payload.data) {
            // Format { projectId, data: { success, data } }
            if (payload.data.success) {
                responseData = payload.data.data;
            }
        } else if (payload.success && payload.data) {
            // Format { success, data }
            responseData = payload.data;
        }
        
        if (responseData) {
            // Stocker les données complètes
            state.projectPipeline.data = responseData;
            
            // Extraire les données spécifiques pour faciliter l'accès
            state.projectPipeline.stages = responseData.stages || [];
            state.projectPipeline.currentStage = responseData.current_stage || null;
            state.projectPipeline.progression = responseData.stage_history || [];
        }
    }
})
            .addCase(getProjectPipelineStatus.rejected, (state, action) => {
                state.projectPipeline.loading = false;
                state.projectPipeline.error = action.payload?.message || 'Erreur lors de la récupération du pipeline';
            })

            // Gestion createProjectFromInvestisseur
            .addCase(createProjectFromInvestisseur.pending, (state) => {
                state.operation = {
                    type: 'create_from_investisseur',
                    loading: true,
                    success: false,
                    error: null
                };
            })
            .addCase(createProjectFromInvestisseur.fulfilled, (state, action) => {
                state.operation = {
                    type: 'create_from_investisseur',
                    loading: false,
                    success: true,
                    error: null
                };
                const newProject = action.payload.data || action.payload;
                state.items.unshift(newProject);
            })
            .addCase(createProjectFromInvestisseur.rejected, (state, action) => {
                state.operation = {
                    type: 'create_from_investisseur',
                    loading: false,
                    success: false,
                    error: action.payload?.message || 'Erreur lors de la création du projet depuis l\'investisseur'
                };
            })

            // Gestion getInvestisseurDataForProject
            .addCase(getInvestisseurDataForProject.pending, (state) => {
                state.investisseurData.loading = true;
                state.investisseurData.error = null;
            })
            .addCase(getInvestisseurDataForProject.fulfilled, (state, action) => {
                state.investisseurData.loading = false;
                state.investisseurData.data = action.payload.data || action.payload;
            })
            .addCase(getInvestisseurDataForProject.rejected, (state, action) => {
                state.investisseurData.loading = false;
                state.investisseurData.error = action.payload?.message || 'Erreur lors de la récupération des données de l\'investisseur';
            })
            .addCase(fetchTotalJobs.pending, (state) => {
                state.statistics.loading = true;
                state.statistics.error = null;
              })
              .addCase(fetchTotalJobs.fulfilled, (state, action) => {
                state.statistics.totalJobs = action.payload.data || 0;
                state.statistics.loading = false;
              })
              .addCase(fetchTotalJobs.rejected, (state, action) => {
                state.statistics.loading = false;
                state.statistics.error = action.payload || "Erreur lors de la récupération des emplois";
              })
        
              // Gestion fetchInvestmentBySector
              .addCase(fetchInvestmentBySector.pending, (state) => {
                state.statistics.loading = true;
                state.statistics.error = null;
              })
              .addCase(fetchInvestmentBySector.fulfilled, (state, action) => {
                state.statistics.investmentBySector = action.payload.data || [];
                state.statistics.loading = false;
              })
              .addCase(fetchInvestmentBySector.rejected, (state, action) => {
                state.statistics.loading = false;
                state.statistics.error = action.payload || "Erreur lors de la récupération des investissements par secteur";
              })
              .addCase(fetchProjectsByStatus.pending, (state) => {
                state.statistics.loading = true;
                state.statistics.error = null;
              })
              .addCase(fetchProjectsByStatus.fulfilled, (state, action) => {
                state.statistics.projectsByStatus = action.payload.data || [];
                state.statistics.loading = false;
              })
              .addCase(fetchProjectsByStatus.rejected, (state, action) => {
                state.statistics.loading = false;
                state.statistics.error = action.payload || "Erreur lors de la récupération des projets par statut";
              })
        
              // Gestion fetchJobsBySector
              .addCase(fetchJobsBySector.pending, (state) => {
                state.statistics.loading = true;
                state.statistics.error = null;
              })
              .addCase(fetchJobsBySector.fulfilled, (state, action) => {
                state.statistics.jobsBySector = action.payload.data || [];
                state.statistics.loading = false;
              })
              .addCase(fetchJobsBySector.rejected, (state, action) => {
                state.statistics.loading = false;
                state.statistics.error = action.payload || "Erreur lors de la récupération des emplois par secteur";
              });

    }
});

export const {
    setFilters,
    clearFilters,
    resetOperation,
    resetProjectPipeline,
    resetInvestisseurData
} = projectSlice.actions;

export default projectSlice.reducer;