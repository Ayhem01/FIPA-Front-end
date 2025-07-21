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

            // Ajouter les paramètres de filtrage spécifiques aux projets
            if (params.sector_id) queryParams.append('sector_id', params.sector_id);
            if (params.governorate_id) queryParams.append('governorate_id', params.governorate_id);
            if (params.status) queryParams.append('status', params.status);
            if (params.pipeline_type_id) queryParams.append('pipeline_type_id', params.pipeline_type_id);
            if (params.pipeline_stage_id) queryParams.append('pipeline_stage_id', params.pipeline_stage_id);
            if (params.search) queryParams.append('search', params.search);

            const url = queryParams.toString()
                ? `${API_BASE_URL}/projects/all?${queryParams.toString()}`
                : `${API_BASE_URL}/projects/all`;

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
                `${API_BASE_URL}/projects/show/${id}`,
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
                `${API_BASE_URL}/projects/`,
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
                `${API_BASE_URL}/projects/delete/${id}`,
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
            const response = await axios.put(
                `${API_BASE_URL}/projects/${id}/status`,
                { status },
                getAuthHeader()
            );
            message.success('Statut du projet mis à jour avec succès');
            return { id, data: response.data.data };
        } catch (error) {
            console.error(`Erreur lors de la mise à jour du statut du projet ${id}:`, error);
            message.error('Erreur lors de la mise à jour du statut');
            return rejectWithValue(error.response?.data || "Une erreur s'est produite");
        }
    }
);

// ====================== THUNKS POUR LES PIPELINES ======================

// Récupérer tous les types de pipeline
export const fetchPipelineTypes = createAsyncThunk(
    "projects/fetchPipelineTypes",
    async (params = {}, { rejectWithValue }) => {
        try {
            const queryParams = new URLSearchParams();

            // Ajouter les paramètres de filtrage
            if (params.is_active !== undefined) {
                queryParams.append('is_active', params.is_active);
            }

            const url = queryParams.toString()
                ? `${API_BASE_URL}/pipeline/types/all?${queryParams.toString()}`
                : `${API_BASE_URL}/pipeline/types/all`;

            const response = await axios.get(url, getAuthHeader());
            return response.data;
        } catch (error) {
            console.error("Erreur lors du chargement des types de pipeline:", error);
            return rejectWithValue(error.response?.data || "Une erreur s'est produite");
        }
    }
);

// Récupérer un type de pipeline avec ses étapes
export const getPipelineTypeWithStages = createAsyncThunk(
    "projects/getPipelineTypeWithStages",
    async (id, { rejectWithValue }) => {
        try {
            const response = await axios.get(
                `${API_BASE_URL}/pipeline/types/show/${id}`,
                getAuthHeader()
            );
            return response.data;
        } catch (error) {
            console.error(`Erreur lors de la récupération du type de pipeline ${id}:`, error);
            return rejectWithValue(error.response?.data || "Une erreur s'est produite");
        }
    }
);

// Récupérer les étapes d'un pipeline
export const getPipelineStages = createAsyncThunk(
    "projects/getPipelineStages",
    async (pipelineTypeId, { rejectWithValue }) => {
        try {
            const response = await axios.get(
                `${API_BASE_URL}/pipeline/types/${pipelineTypeId}/stages`,
                getAuthHeader()
            );
            return response.data;
        } catch (error) {
            console.error(`Erreur lors de la récupération des étapes du pipeline ${pipelineTypeId}:`, error);
            return rejectWithValue(error.response?.data || "Une erreur s'est produite");
        }
    }
);

// Mettre à jour l'étape du pipeline d'un projet
export const updatePipelineStage = createAsyncThunk(
    "projects/updatePipelineStage",
    async ({ id, pipelineStageId }, { rejectWithValue }) => {
        try {
            const response = await axios.put(
                `${API_BASE_URL}/projects/${id}/pipeline-stage`,
                { pipeline_stage_id: pipelineStageId },
                getAuthHeader()
            );
            message.success('Étape du pipeline mise à jour avec succès');
            return { id, data: response.data.data };
        } catch (error) {
            console.error(`Erreur lors de la mise à jour de l'étape du pipeline ${id}:`, error);
            message.error('Erreur lors de la mise à jour de l\'étape');
            return rejectWithValue(error.response?.data || "Une erreur s'est produite");
        }
    }
);

// Ajouter un blocage au projet
export const addBlockage = createAsyncThunk(
    "projects/addBlockage",
    async ({ projectId, blockageData }, { rejectWithValue }) => {
        try {
            const response = await axios.post(
                `${API_BASE_URL}/blockages/project/${projectId}`,
                blockageData,
                getAuthHeader()
            );
            message.success('Blocage ajouté avec succès');
            return response.data;
        } catch (error) {
            console.error(`Erreur lors de l'ajout d'un blocage:`, error);
            message.error('Erreur lors de l\'ajout du blocage');
            return rejectWithValue(error.response?.data || "Une erreur s'est produite");
        }
    }
);

// Résoudre un blocage
export const resolveBlockage = createAsyncThunk(
    "projects/resolveBlockage",
    async (blockageId, { rejectWithValue }) => {
        try {
            const response = await axios.put(
                `${API_BASE_URL}/blockages/${blockageId}/resolve`,
                {},
                getAuthHeader()
            );
            message.success('Blocage résolu avec succès');
            return response.data;
        } catch (error) {
            console.error(`Erreur lors de la résolution du blocage ${blockageId}:`, error);
            message.error('Erreur lors de la résolution du blocage');
            return rejectWithValue(error.response?.data || "Une erreur s'est produite");
        }
    }
);
// ====================== THUNKS POUR LES SUIVIS DE PROJET ======================

// Récupérer les suivis à venir
export const fetchUpcomingFollowUps = createAsyncThunk(
    "projects/fetchUpcomingFollowUps",
    async (params = {}, { rejectWithValue }) => {
      try {
        const queryParams = new URLSearchParams();
        
        if (params.user_id) {
          queryParams.append('user_id', params.user_id);
        }
        
        if (params.limit) {
          queryParams.append('limit', params.limit);
        }
  
        const url = queryParams.toString()
          ? `${API_BASE_URL}/follow-ups/upcoming?${queryParams.toString()}`
          : `${API_BASE_URL}/follow-ups/upcoming`;
  
        const response = await axios.get(url, getAuthHeader());
        return response.data;
      } catch (error) {
        console.error("Erreur lors du chargement des suivis à venir:", error);
        return rejectWithValue(error.response?.data || "Une erreur s'est produite");
      }
    }
  );
  
  // Récupérer un suivi par ID
  export const getFollowUpById = createAsyncThunk(
    "projects/getFollowUpById",
    async (id, { rejectWithValue }) => {
      try {
        const response = await axios.get(
          `${API_BASE_URL}/follow-ups/show/${id}`,
          getAuthHeader()
        );
        return response.data;
      } catch (error) {
        console.error(`Erreur lors de la récupération du suivi ${id}:`, error);
        return rejectWithValue(error.response?.data || "Une erreur s'est produite");
      }
    }
  );
  
  // Mettre à jour un suivi
  export const updateFollowUp = createAsyncThunk(
    "projects/updateFollowUp",
    async ({ id, data }, { rejectWithValue }) => {
      try {
        const response = await axios.put(
          `${API_BASE_URL}/follow-ups/${id}`,
          data,
          getAuthHeader()
        );
        message.success('Suivi mis à jour avec succès');
        return response.data.data;
      } catch (error) {
        console.error(`Erreur lors de la mise à jour du suivi ${id}:`, error);
        message.error('Erreur lors de la mise à jour du suivi');
        return rejectWithValue(error.response?.data || "Une erreur s'est produite");
      }
    }
  );
  
  // Supprimer un suivi
  export const deleteFollowUp = createAsyncThunk(
    "projects/deleteFollowUp",
    async (id, { rejectWithValue }) => {
      try {
        await axios.delete(
          `${API_BASE_URL}/follow-ups/delete/${id}`,
          getAuthHeader()
        );
        message.success('Suivi supprimé avec succès');
        return id;
      } catch (error) {
        console.error(`Erreur lors de la suppression du suivi ${id}:`, error);
        message.error('Erreur lors de la suppression du suivi');
        return rejectWithValue(error.response?.data || "Une erreur s'est produite");
      }
    }
  );
// Ajouter des fonctions pour les suivis de projets
export const fetchProjectFollowUps = createAsyncThunk(
    "projects/fetchProjectFollowUps",
    async (projectId, { rejectWithValue }) => {
        try {
            const response = await axios.get(
                `${API_BASE_URL}/follow-ups/all?project_id=${projectId}`,
                getAuthHeader()
            );
            return response.data;
        } catch (error) {
            console.error("Erreur lors du chargement des suivis de projet:", error);
            return rejectWithValue(error.response?.data || "Une erreur s'est produite");
        }
    }
);

export const addFollowUp = createAsyncThunk(
    "projects/addFollowUp",
    async ({ projectId, followUpData }, { rejectWithValue }) => {
        try {
            const response = await axios.post(
                `${API_BASE_URL}/follow-ups/project/${projectId}`,
                followUpData,
                getAuthHeader()
            );
            message.success('Suivi ajouté avec succès');
            return response.data;
        } catch (error) {
            console.error(`Erreur lors de l'ajout d'un suivi:`, error);
            message.error('Erreur lors de l\'ajout du suivi');
            return rejectWithValue(error.response?.data || "Une erreur s'est produite");
        }
    }
);

export const completeFollowUp = createAsyncThunk(
    "projects/completeFollowUp",
    async (followUpId, { rejectWithValue }) => {
        try {
            const response = await axios.put(
                `${API_BASE_URL}/follow-ups/${followUpId}/complete`,
                {},
                getAuthHeader()
            );
            message.success('Suivi marqué comme complété');
            return response.data;
        } catch (error) {
            console.error(`Erreur lors de la complétion du suivi ${followUpId}:`, error);
            message.error('Erreur lors de la mise à jour du suivi');
            return rejectWithValue(error.response?.data || "Une erreur s'est produite");
        }
    }
);

// ====================== THUNKS POUR LES PIPELINE STAGES ======================

// Récupérer toutes les étapes de pipeline
export const fetchAllPipelineStages = createAsyncThunk(
    "projects/fetchAllPipelineStages",
    async (_, { rejectWithValue }) => {
        try {
            const response = await axios.get(
                `${API_BASE_URL}/pipeline/stages/all`,
                getAuthHeader()
            );
            return response.data;
        } catch (error) {
            console.error("Erreur lors du chargement des étapes de pipeline:", error);
            return rejectWithValue(error.response?.data || "Une erreur s'est produite");
        }
    }
);

// Récupérer une étape de pipeline par ID
export const getPipelineStageById = createAsyncThunk(
    "projects/getPipelineStageById",
    async (id, { rejectWithValue }) => {
        try {
            const response = await axios.get(
                `${API_BASE_URL}/pipeline/stages/show/${id}`,
                getAuthHeader()
            );
            return response.data;
        } catch (error) {
            console.error(`Erreur lors de la récupération de l'étape de pipeline ${id}:`, error);
            return rejectWithValue(error.response?.data || "Une erreur s'est produite");
        }
    }
);

// Créer une nouvelle étape de pipeline
export const createPipelineStage = createAsyncThunk(
    "projects/createPipelineStage",
    async (stageData, { rejectWithValue }) => {
        try {
            const response = await axios.post(
                `${API_BASE_URL}/pipeline/stages`,
                stageData,
                getAuthHeader()
            );
            message.success('Étape de pipeline créée avec succès');
            return response.data.data;
        } catch (error) {
            console.error("Erreur lors de la création de l'étape de pipeline:", error);
            message.error("Erreur lors de la création de l'étape");
            return rejectWithValue(error.response?.data || "Une erreur s'est produite");
        }
    }
);



// Supprimer une étape de pipeline
export const deletePipelineStage = createAsyncThunk(
    "projects/deletePipelineStage",
    async (id, { rejectWithValue }) => {
        try {
            await axios.delete(
                `${API_BASE_URL}/pipeline/stages/delete/${id}`,
                getAuthHeader()
            );
            message.success('Étape de pipeline supprimée avec succès');
            return id;
        } catch (error) {
            console.error(`Erreur lors de la suppression de l'étape de pipeline ${id}:`, error);
            message.error('Erreur lors de la suppression de l\'étape');
            return rejectWithValue(error.response?.data || "Une erreur s'est produite");
        }
    }
);

// Réorganiser les étapes de pipeline
export const reorderPipelineStages = createAsyncThunk(
    "projects/reorderPipelineStages",
    async (stagesOrder, { rejectWithValue }) => {
        try {
            const response = await axios.put(
                `${API_BASE_URL}/pipeline/stages/reorder`,
                { stages: stagesOrder },
                getAuthHeader()
            );
            message.success('Ordre des étapes mis à jour avec succès');
            return stagesOrder;
        } catch (error) {
            console.error("Erreur lors de la réorganisation des étapes:", error);
            message.error('Erreur lors de la réorganisation des étapes');
            return rejectWithValue(error.response?.data || "Une erreur s'est produite");
        }
    }
);

// Cette fonction est similaire à getPipelineStages existante mais avec un nom plus explicite
export const getPipelineStagesByType = createAsyncThunk(
    "projects/getPipelineStagesByType",
    async (pipelineTypeId, { rejectWithValue }) => {
        try {
            const response = await axios.get(
                `${API_BASE_URL}/pipeline/types/${pipelineTypeId}/stages`,
                getAuthHeader()
            );
            return response.data;
        } catch (error) {
            console.error(`Erreur lors de la récupération des étapes du type ${pipelineTypeId}:`, error);
            return rejectWithValue(error.response?.data || "Une erreur s'est produite");
        }
    }
);

// ====================== THUNKS POUR LES BLOCAGES ======================

// Récupérer les blocages d'un projet
export const fetchBlockages = createAsyncThunk(
    "projects/fetchBlockages",
    async (params = {}, { rejectWithValue }) => {
        try {
            const queryParams = new URLSearchParams();

            // Ajouter les paramètres de filtrage
            if (params.projectId) queryParams.append('project_id', params.projectId);
            if (params.status) queryParams.append('status', params.status);
            if (params.priority) queryParams.append('priority', params.priority);
            if (params.assigned_to) queryParams.append('assigned_to', params.assigned_to);
            if (params.with) queryParams.append('with', params.with);
            if (params.sort_by) {
                queryParams.append('sort_by', params.sort_by);
                queryParams.append('sort_direction', params.sort_direction || 'desc');
            }
            if (params.page) queryParams.append('page', params.page);
            if (params.per_page) queryParams.append('per_page', params.per_page);

            const url = queryParams.toString()
                ? `${API_BASE_URL}/blockages/all?${queryParams.toString()}`
                : `${API_BASE_URL}/blockages/all`;

            const response = await axios.get(url, getAuthHeader());
            return response.data;
        } catch (error) {
            console.error("Erreur lors du chargement des blocages:", error);
            return rejectWithValue(error.response?.data || "Une erreur s'est produite");
        }
    }
);

// Récupérer un blocage par son ID
export const getBlockageById = createAsyncThunk(
    "projects/getBlockageById",
    async (id, { rejectWithValue }) => {
        try {
            const response = await axios.get(
                `${API_BASE_URL}/blockages/show/${id}`,
                getAuthHeader()
            );
            return response.data;
        } catch (error) {
            console.error(`Erreur lors de la récupération du blocage ${id}:`, error);
            return rejectWithValue(error.response?.data || "Une erreur s'est produite");
        }
    }
);

// Mettre à jour un blocage
export const updateBlockage = createAsyncThunk(
    "projects/updateBlockage",
    async ({ id, data }, { rejectWithValue }) => {
        try {
            const response = await axios.put(
                `${API_BASE_URL}/blockages/${id}`,
                data,
                getAuthHeader()
            );
            message.success('Blocage mis à jour avec succès');
            return response.data.data;
        } catch (error) {
            console.error(`Erreur lors de la mise à jour du blocage ${id}:`, error);
            message.error('Erreur lors de la mise à jour du blocage');
            return rejectWithValue(error.response?.data || "Une erreur s'est produite");
        }
    }
);

// Supprimer un blocage
export const deleteBlockage = createAsyncThunk(
    "projects/deleteBlockage",
    async (id, { rejectWithValue }) => {
        try {
            await axios.delete(
                `${API_BASE_URL}/blockages/delete/${id}`,
                getAuthHeader()
            );
            message.success('Blocage supprimé avec succès');
            return id;
        } catch (error) {
            console.error(`Erreur lors de la suppression du blocage ${id}:`, error);
            message.error('Erreur lors de la suppression du blocage');
            return rejectWithValue(error.response?.data || "Une erreur s'est produite");
        }
    }
);
// ====================== THUNKS POUR LES CONTACTS DE PROJET ======================

// Récupérer les contacts d'un projet
export const fetchProjectContacts = createAsyncThunk(
    "projects/fetchProjectContacts",
    async (projectId, { rejectWithValue }) => {
        try {
            const response = await axios.get(
                `${API_BASE_URL}/contacts?project_id=${projectId}`,
                getAuthHeader()
            );
            return response.data;
        } catch (error) {
            console.error(`Erreur lors de la récupération des contacts du projet ${projectId}:`, error);
            return rejectWithValue(error.response?.data || "Une erreur s'est produite");
        }
    }
);

// Ajouter un contact à un projet
export const addProjectContact = createAsyncThunk(
    "projects/addProjectContact",
    async (contactData, { rejectWithValue }) => {
        try {
            const response = await axios.post(
                `${API_BASE_URL}/contacts`,
                contactData,
                getAuthHeader()
            );
            message.success('Contact ajouté avec succès');
            return response.data.data;
        } catch (error) {
            console.error("Erreur lors de l'ajout du contact:", error);
            message.error('Erreur lors de l\'ajout du contact');
            return rejectWithValue(error.response?.data || "Une erreur s'est produite");
        }
    }
);

// Mettre à jour un contact
export const updateProjectContact = createAsyncThunk(
    "projects/updateProjectContact",
    async ({ id, data }, { rejectWithValue }) => {
        try {
            const response = await axios.put(
                `${API_BASE_URL}/contacts/${id}`,
                data,
                getAuthHeader()
            );
            message.success('Contact mis à jour avec succès');
            return response.data.data;
        } catch (error) {
            console.error(`Erreur lors de la mise à jour du contact ${id}:`, error);
            message.error('Erreur lors de la mise à jour du contact');
            return rejectWithValue(error.response?.data || "Une erreur s'est produite");
        }
    }
);

// Définir un contact comme principal
export const setContactAsPrimary = createAsyncThunk(
    "projects/setContactAsPrimary",
    async (id, { rejectWithValue }) => {
        try {
            const response = await axios.put(
                `${API_BASE_URL}/contacts/${id}/set-primary`,
                {},
                getAuthHeader()
            );
            message.success('Contact défini comme principal');
            return response.data.data;
        } catch (error) {
            console.error(`Erreur lors de la définition du contact principal ${id}:`, error);
            message.error('Erreur lors de la définition du contact principal');
            return rejectWithValue(error.response?.data || "Une erreur s'est produite");
        }
    }
);

// Supprimer un contact
export const deleteProjectContact = createAsyncThunk(
    "projects/deleteProjectContact",
    async ({ id, projectId }, { rejectWithValue }) => {
        try {
            await axios.delete(
                `${API_BASE_URL}/contacts/${id}`,
                getAuthHeader()
            );
            message.success('Contact supprimé avec succès');
            return { id, projectId };
        } catch (error) {
            console.error(`Erreur lors de la suppression du contact ${id}:`, error);
            message.error('Erreur lors de la suppression du contact');
            return rejectWithValue(error.response?.data || "Une erreur s'est produite");
        }
    }
);
export const fetchSecteurs = createAsyncThunk(
    "projects/fetchSecteurs",
    async (_, { rejectWithValue }) => {
        try {
            console.log("Début de la requête pour récupérer les secteurs");
            const response = await axios.get(
                `${API_BASE_URL}/secteur/all`,  // Assurez-vous que l'URL correspond à votre route API
                getAuthHeader()
            );
            console.log("Réponse secteurs reçue:", response.data);
            return response.data;
        } catch (error) {
            console.error("Erreur lors du chargement des secteurs:", error);
            return rejectWithValue(error.response?.data || "Une erreur s'est produite");
        }
    }
);
// ====================== THUNKS POUR LES STATISTIQUES ======================

// Récupérer les statistiques des projets par statut
export const fetchProjectsByStatusStats = createAsyncThunk(
    "projects/fetchProjectsByStatusStats",
    async (params = {}, { rejectWithValue }) => {
        try {
            const queryParams = new URLSearchParams();

            // Ajouter le paramètre de période si fourni
            if (params.period) {
                queryParams.append('period', params.period);
            }

            // Ajouter les dates personnalisées si nécessaire
            if (params.period === 'custom') {
                if (params.from) queryParams.append('from', params.from);
                if (params.to) queryParams.append('to', params.to);
            }

            const url = queryParams.toString()
                ? `${API_BASE_URL}/stats/projects-by-status?${queryParams.toString()}`
                : `${API_BASE_URL}/stats/projects-by-status`;

            const response = await axios.get(url, getAuthHeader());
            return response.data;
        } catch (error) {
            console.error("Erreur lors du chargement des statistiques par statut:", error);
            return rejectWithValue(error.response?.data || "Une erreur s'est produite");
        }
    }
);

// Récupérer les statistiques des projets par secteur
export const fetchProjectsBySectorStats = createAsyncThunk(
    "projects/fetchProjectsBySectorStats",
    async (params = {}, { rejectWithValue }) => {
        try {
            const queryParams = new URLSearchParams();

            // Ajouter le paramètre de période si fourni
            if (params.period) {
                queryParams.append('period', params.period);
            }

            // Ajouter les dates personnalisées si nécessaire
            if (params.period === 'custom') {
                if (params.from) queryParams.append('from', params.from);
                if (params.to) queryParams.append('to', params.to);
            }

            // Inclure les montants d'investissement et emplois si demandé
            if (params.includeInvestment) {
                queryParams.append('include_investment', 'true');
            }

            if (params.includeJobs) {
                queryParams.append('include_jobs', 'true');
            }

            const url = queryParams.toString()
                ? `${API_BASE_URL}/stats/projects-by-sector?${queryParams.toString()}`
                : `${API_BASE_URL}/stats/projects-by-sector`;

            const response = await axios.get(url, getAuthHeader());
            return response.data;
        } catch (error) {
            console.error("Erreur lors du chargement des statistiques par secteur:", error);
            return rejectWithValue(error.response?.data || "Une erreur s'est produite");
        }
    }
);

// Récupérer les statistiques des investissements par région
export const fetchInvestmentByRegionStats = createAsyncThunk(
    "projects/fetchInvestmentByRegionStats",
    async (params = {}, { rejectWithValue }) => {
        try {
            const queryParams = new URLSearchParams();

            // Ajouter le paramètre de période si fourni
            if (params.period) {
                queryParams.append('period', params.period);
            }

            // Ajouter le paramètre de statut si fourni
            if (params.status) {
                queryParams.append('status', params.status);
            }

            // Ajouter les dates personnalisées si nécessaire
            if (params.period === 'custom') {
                if (params.from) queryParams.append('from', params.from);
                if (params.to) queryParams.append('to', params.to);
            }

            const url = queryParams.toString()
                ? `${API_BASE_URL}/stats/investment-by-region?${queryParams.toString()}`
                : `${API_BASE_URL}/stats/investment-by-region`;

            const response = await axios.get(url, getAuthHeader());
            return response.data;
        } catch (error) {
            console.error("Erreur lors du chargement des statistiques d'investissement par région:", error);
            return rejectWithValue(error.response?.data || "Une erreur s'est produite");
        }
    }
);

// Récupérer les statistiques des emplois créés
export const fetchJobsCreatedStats = createAsyncThunk(
    "projects/fetchJobsCreatedStats",
    async (params = {}, { rejectWithValue }) => {
        try {
            const queryParams = new URLSearchParams();

            // Ajouter le paramètre de période si fourni
            if (params.period) {
                queryParams.append('period', params.period);
            }

            // Ajouter le paramètre de statut si fourni
            if (params.status) {
                queryParams.append('status', params.status);
            }

            // Ajouter les dates personnalisées si nécessaire
            if (params.period === 'custom') {
                if (params.from) queryParams.append('from', params.from);
                if (params.to) queryParams.append('to', params.to);
            }

            const url = queryParams.toString()
                ? `${API_BASE_URL}/stats/jobs-created?${queryParams.toString()}`
                : `${API_BASE_URL}/stats/jobs-created`;

            const response = await axios.get(url, getAuthHeader());
            return response.data;
        } catch (error) {
            console.error("Erreur lors du chargement des statistiques d'emplois:", error);
            return rejectWithValue(error.response?.data || "Une erreur s'est produite");
        }
    }
);

// Récupérer les statistiques du tableau de bord
export const fetchDashboardStats = createAsyncThunk(
    "projects/fetchDashboardStats",
    async (_, { rejectWithValue }) => {
        try {
            const response = await axios.get(
                `${API_BASE_URL}/stats/dashboard`,
                getAuthHeader()
            );
            return response.data;
        } catch (error) {
            console.error("Erreur lors du chargement des statistiques du tableau de bord:", error);
            return rejectWithValue(error.response?.data || "Une erreur s'est produite");
        }
    }
);
// Créer un nouveau type de pipeline
export const createPipelineType = createAsyncThunk(
    "projects/createPipelineType",
    async (typeData, { rejectWithValue }) => {
      try {
        const response = await axios.post(
          `${API_BASE_URL}/pipeline/types/`,
          typeData,
          getAuthHeader()
        );
        message.success('Type de pipeline créé avec succès');
        return response.data.data;
      } catch (error) {
        console.error("Erreur lors de la création du type de pipeline:", error);
        message.error("Erreur lors de la création du type de pipeline");
        return rejectWithValue(error.response?.data || "Une erreur s'est produite");
      }
    }
  );
  
  // Mettre à jour un type de pipeline
  export const updatePipelineType = createAsyncThunk(
    "projects/updatePipelineType",
    async ({ id, data }, { rejectWithValue }) => {
      try {
        const response = await axios.put(
          `${API_BASE_URL}/pipeline/types/${id}`,
          data,
          getAuthHeader()
        );
        message.success('Type de pipeline mis à jour avec succès');
        return response.data.data;
      } catch (error) {
        console.error(`Erreur lors de la mise à jour du type de pipeline ${id}:`, error);
        message.error("Erreur lors de la mise à jour du type de pipeline");
        return rejectWithValue(error.response?.data || "Une erreur s'est produite");
      }
    }
  );
  
  // Supprimer un type de pipeline
  export const deletePipelineType = createAsyncThunk(
    "projects/deletePipelineType",
    async (id, { rejectWithValue }) => {
      try {
        await axios.delete(
          `${API_BASE_URL}/pipeline/types/delete/${id}`,
          getAuthHeader()
        );
        message.success('Type de pipeline supprimé avec succès');
        return id;
      } catch (error) {
        console.error(`Erreur lors de la suppression du type de pipeline ${id}:`, error);
        message.error(error.response?.data?.message || 'Erreur lors de la suppression du type de pipeline');
        return rejectWithValue(error.response?.data || "Une erreur s'est produite");
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

        // État des pipelines (fusionné)
        pipelineTypes: {
            items: [],
            loading: false,
            error: null
        },
        selectedPipelineType: {
            data: null,
            stages: [],
            loading: false,
            error: null
        },
        pipelineStages: {
            items: [],
            selectedStage: null,
            loading: false,
            error: null,
            operationLoading: false,
            operationError: null
        },
        blockageOperation: {
            loading: false,
            success: false,
            error: null,
            type: null
        },
        blockages: {
            items: [],
            pagination: {
                current: 1,
                pageSize: 15,
                total: 0
            },
            loading: false,
            error: null,
            filters: {}
        },
        selectedBlockage: {
            data: null,
            loading: false,
            error: null
        },
        // État pour les suivis de projet
        followUps: {
            items: [],
            upcomingItems: [],
            selectedFollowUp: null,
            loading: false,
            error: null
          },
        followUpOperation: {
            loading: false,
            success: false,
            error: null,
            type: null
        },
        contacts: {
            items: [],
            loading: false,
            error: null
        },
        contactOperation: {
            loading: false,
            success: false,
            error: null,
            type: null
        },
        secteurs: {
            items: [],
            loading: false,
            error: null
        },
        statistics: {
            projectsByStatus: {
                data: null,
                loading: false,
                error: null
            },
            projectsBySector: {
                data: null,
                loading: false,
                error: null
            },
            investmentByRegion: {
                data: null,
                loading: false,
                error: null
            },
            jobsCreated: {
                data: null,
                loading: false,
                error: null
            },
            dashboard: {
                data: null,
                loading: false,
                error: null
            }
        },
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

        // Reducers pour les pipelines
        resetBlockageOperation: (state) => {
            state.blockageOperation = {
                loading: false,
                success: false,
                error: null,
                type: null
            };
        },

        // Reducer pour les suivis
        resetFollowUpOperation: (state) => {
            state.followUpOperation = {
                loading: false,
                success: false,
                error: null,
                type: null
            };
        },
        resetContactOperation: (state) => {
            state.contactOperation = {
                loading: false,
                success: false,
                error: null,
                type: null
            };
        },

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
                state.items = action.payload.data;
                state.pagination = {
                    current: action.payload.current_page,
                    pageSize: action.payload.per_page,
                    total: action.payload.total
                };
            })
            .addCase(fetchProjects.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload?.message || 'Erreur lors de la récupération des projets';
            })

            // Gestion getProjectById
            .addCase(getProjectById.pending, (state) => {
                state.selectedProject.loading = true;
                state.selectedProject.error = null;
            })
            .addCase(getProjectById.fulfilled, (state, action) => {
                state.selectedProject.loading = false;
                state.selectedProject.data = action.payload;
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
                state.items.unshift(action.payload);
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

                // Mettre à jour le projet dans la liste si présent
                const index = state.items.findIndex(item => item.id === action.meta.arg.id);
                if (index !== -1) {
                    state.items[index] = action.payload;
                }

                // Mettre à jour le projet sélectionné si c'est le même
                if (state.selectedProject.data?.id === action.meta.arg.id) {
                    state.selectedProject.data = action.payload;
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

            // ================ Gestion des pipelines ================
            // Gestion fetchPipelineTypes
            .addCase(fetchPipelineTypes.pending, (state) => {
                state.pipelineTypes.loading = true;
                state.pipelineTypes.error = null;
            })
            .addCase(fetchPipelineTypes.fulfilled, (state, action) => {
                state.pipelineTypes.loading = false;
                state.pipelineTypes.items = action.payload;
            })
            .addCase(fetchPipelineTypes.rejected, (state, action) => {
                state.pipelineTypes.loading = false;
                state.pipelineTypes.error = action.payload?.message || "Erreur lors du chargement des types de pipeline";
            })

            // Gestion getPipelineTypeWithStages
            .addCase(getPipelineTypeWithStages.pending, (state) => {
                state.selectedPipelineType.loading = true;
                state.selectedPipelineType.error = null;
            })
            .addCase(getPipelineTypeWithStages.fulfilled, (state, action) => {
                state.selectedPipelineType.loading = false;
                state.selectedPipelineType.data = action.payload;
                state.selectedPipelineType.stages = action.payload.stages || [];
            })
            .addCase(getPipelineTypeWithStages.rejected, (state, action) => {
                state.selectedPipelineType.loading = false;
                state.selectedPipelineType.error = action.payload?.message || "Erreur lors du chargement du type de pipeline";
            })

            // Gestion getPipelineStages
            .addCase(getPipelineStages.pending, (state) => {
                state.pipelineStages.loading = true;
                state.pipelineStages.error = null;
            })
            .addCase(getPipelineStages.fulfilled, (state, action) => {
                state.pipelineStages.loading = false;
                state.pipelineStages.items = action.payload;
            })
            .addCase(getPipelineStages.rejected, (state, action) => {
                state.pipelineStages.loading = false;
                state.pipelineStages.error = action.payload?.message || "Erreur lors du chargement des étapes";
            })

            // Gestion updatePipelineStage
            .addCase(updatePipelineStage.pending, (state, action) => {
                state.operation = {
                    type: 'pipeline_stage',
                    loading: true,
                    success: false,
                    error: null,
                    targetId: action.meta.arg.id
                };
            })
            .addCase(updatePipelineStage.fulfilled, (state, action) => {
                state.operation = {
                    type: 'pipeline_stage',
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
            .addCase(updatePipelineStage.rejected, (state, action) => {
                state.operation = {
                    type: 'pipeline_stage',
                    loading: false,
                    success: false,
                    error: action.payload?.message || 'Erreur lors de la mise à jour de l\'étape du pipeline',
                    targetId: action.meta.arg.id
                };
            })

            // Gestion addBlockage
            .addCase(addBlockage.pending, (state) => {
                state.blockageOperation = {
                    loading: true,
                    success: false,
                    error: null,
                    type: 'add'
                };
            })
            .addCase(addBlockage.fulfilled, (state) => {
                state.blockageOperation = {
                    loading: false,
                    success: true,
                    error: null,
                    type: 'add'
                };
            })
            .addCase(addBlockage.rejected, (state, action) => {
                state.blockageOperation = {
                    loading: false,
                    success: false,
                    error: action.payload?.message || "Erreur lors de l'ajout du blocage",
                    type: 'add'
                };
            })

            // Gestion resolveBlockage
            .addCase(resolveBlockage.pending, (state) => {
                state.blockageOperation = {
                    loading: true,
                    success: false,
                    error: null,
                    type: 'resolve'
                };
            })
            .addCase(resolveBlockage.fulfilled, (state) => {
                state.blockageOperation = {
                    loading: false,
                    success: true,
                    error: null,
                    type: 'resolve'
                };
            })
            .addCase(resolveBlockage.rejected, (state, action) => {
                state.blockageOperation = {
                    loading: false,
                    success: false,
                    error: action.payload?.message || "Erreur lors de la résolution du blocage",
                    type: 'resolve'
                };
            })

            // ================ Gestion des suivis de projet ================
            // Gestion fetchProjectFollowUps
            .addCase(fetchProjectFollowUps.pending, (state) => {
                state.followUps.loading = true;
                state.followUps.error = null;
            })
            .addCase(fetchProjectFollowUps.fulfilled, (state, action) => {
                state.followUps.loading = false;
                state.followUps.items = action.payload;
            })
            .addCase(fetchProjectFollowUps.rejected, (state, action) => {
                state.followUps.loading = false;
                state.followUps.error = action.payload?.message || "Erreur lors du chargement des suivis";
            })

            // Gestion addFollowUp
            .addCase(addFollowUp.pending, (state) => {
                state.followUpOperation = {
                    loading: true,
                    success: false,
                    error: null,
                    type: 'add'
                };
            })
            .addCase(addFollowUp.fulfilled, (state, action) => {
                state.followUpOperation = {
                    loading: false,
                    success: true,
                    error: null,
                    type: 'add'
                };
                state.followUps.items.unshift(action.payload);
            })
            .addCase(addFollowUp.rejected, (state, action) => {
                state.followUpOperation = {
                    loading: false,
                    success: false,
                    error: action.payload?.message || "Erreur lors de l'ajout du suivi",
                    type: 'add'
                };
            })

            // Gestion completeFollowUp
            .addCase(completeFollowUp.pending, (state) => {
                state.followUpOperation = {
                    loading: true,
                    success: false,
                    error: null,
                    type: 'complete'
                };
            })
            .addCase(completeFollowUp.fulfilled, (state, action) => {
                state.followUpOperation = {
                    loading: false,
                    success: true,
                    error: null,
                    type: 'complete'
                };

                // Mettre à jour le suivi dans la liste
                const index = state.followUps.items.findIndex(item => item.id === action.meta.arg);
                if (index !== -1) {
                    state.followUps.items[index] = { ...state.followUps.items[index], ...action.payload };
                }
            })
            .addCase(completeFollowUp.rejected, (state, action) => {
                state.followUpOperation = {
                    loading: false,
                    success: false,
                    error: action.payload?.message || "Erreur lors de la complétion du suivi",
                    type: 'complete'
                };
            })



            // Gestion fetchBlockages
            .addCase(fetchBlockages.pending, (state) => {
                state.blockages.loading = true;
                state.blockages.error = null;
            })
            .addCase(fetchBlockages.fulfilled, (state, action) => {
                state.blockages.loading = false;
                state.blockages.items = action.payload.data;
                state.blockages.pagination = {
                    current: action.payload.current_page,
                    pageSize: action.payload.per_page,
                    total: action.payload.total
                };
            })
            .addCase(fetchBlockages.rejected, (state, action) => {
                state.blockages.loading = false;
                state.blockages.error = action.payload?.message || 'Erreur lors du chargement des blocages';
            })

            // Gestion getBlockageById
            .addCase(getBlockageById.pending, (state) => {
                state.selectedBlockage.loading = true;
                state.selectedBlockage.error = null;
            })
            .addCase(getBlockageById.fulfilled, (state, action) => {
                state.selectedBlockage.loading = false;
                state.selectedBlockage.data = action.payload;
            })
            .addCase(getBlockageById.rejected, (state, action) => {
                state.selectedBlockage.loading = false;
                state.selectedBlockage.error = action.payload?.message || 'Erreur lors du chargement du blocage';
            })

            // Gestion updateBlockage
            .addCase(updateBlockage.pending, (state) => {
                state.blockageOperation = {
                    loading: true,
                    success: false,
                    error: null,
                    type: 'update'
                };
            })
            .addCase(updateBlockage.fulfilled, (state, action) => {
                state.blockageOperation = {
                    loading: false,
                    success: true,
                    error: null,
                    type: 'update'
                };
                // Mettre à jour le blocage dans la liste si présent
                const index = state.blockages.items.findIndex(item => item.id === action.meta.arg.id);
                if (index !== -1) {
                    state.blockages.items[index] = action.payload;
                }
                // Mettre à jour le blocage sélectionné
                if (state.selectedBlockage.data?.id === action.meta.arg.id) {
                    state.selectedBlockage.data = action.payload;
                }
            })
            .addCase(updateBlockage.rejected, (state, action) => {
                state.blockageOperation = {
                    loading: false,
                    success: false,
                    error: action.payload?.message || 'Erreur lors de la mise à jour du blocage',
                    type: 'update'
                };
            })

            // Gestion deleteBlockage
            .addCase(deleteBlockage.pending, (state, action) => {
                state.blockageOperation = {
                    loading: true,
                    success: false,
                    error: null,
                    type: 'delete',
                    targetId: action.meta.arg
                };
            })
            .addCase(deleteBlockage.fulfilled, (state, action) => {
                state.blockageOperation = {
                    loading: false,
                    success: true,
                    error: null,
                    type: 'delete',
                    targetId: action.meta.arg
                };
                state.blockages.items = state.blockages.items.filter(
                    item => item.id !== action.payload
                );
                if (state.selectedBlockage.data?.id === action.payload) {
                    state.selectedBlockage.data = null;
                }
            })
            .addCase(deleteBlockage.rejected, (state, action) => {
                state.blockageOperation = {
                    loading: false,
                    success: false,
                    error: action.payload?.message || 'Erreur lors de la suppression du blocage',
                    type: 'delete',
                    targetId: action.meta.arg
                };
            })
            // Dans extraReducers

            // Gestion fetchProjectContacts
            .addCase(fetchProjectContacts.pending, (state) => {
                state.contacts.loading = true;
                state.contacts.error = null;
            })
            .addCase(fetchProjectContacts.fulfilled, (state, action) => {
                state.contacts.loading = false;
                state.contacts.items = action.payload.data;
            })
            .addCase(fetchProjectContacts.rejected, (state, action) => {
                state.contacts.loading = false;
                state.contacts.error = action.payload?.message || 'Erreur lors du chargement des contacts';
            })

            // Gestion addProjectContact
            .addCase(addProjectContact.pending, (state) => {
                state.contactOperation = {
                    loading: true,
                    success: false,
                    error: null,
                    type: 'add'
                };
            })
            .addCase(addProjectContact.fulfilled, (state, action) => {
                state.contactOperation = {
                    loading: false,
                    success: true,
                    error: null,
                    type: 'add'
                };
                state.contacts.items.unshift(action.payload);
            })
            .addCase(addProjectContact.rejected, (state, action) => {
                state.contactOperation = {
                    loading: false,
                    success: false,
                    error: action.payload?.errors || 'Erreur lors de l\'ajout du contact',
                    type: 'add'
                };
            })

            // Gestion updateProjectContact
            .addCase(updateProjectContact.pending, (state) => {
                state.contactOperation = {
                    loading: true,
                    success: false,
                    error: null,
                    type: 'update'
                };
            })
            .addCase(updateProjectContact.fulfilled, (state, action) => {
                state.contactOperation = {
                    loading: false,
                    success: true,
                    error: null,
                    type: 'update'
                };
                const index = state.contacts.items.findIndex(item => item.id === action.meta.arg.id);
                if (index !== -1) {
                    state.contacts.items[index] = action.payload;
                }
            })
            .addCase(updateProjectContact.rejected, (state, action) => {
                state.contactOperation = {
                    loading: false,
                    success: false,
                    error: action.payload?.errors || 'Erreur lors de la mise à jour du contact',
                    type: 'update'
                };
            })

            // Gestion setContactAsPrimary
            .addCase(setContactAsPrimary.pending, (state) => {
                state.contactOperation = {
                    loading: true,
                    success: false,
                    error: null,
                    type: 'primary'
                };
            })
            .addCase(setContactAsPrimary.fulfilled, (state, action) => {
                state.contactOperation = {
                    loading: false,
                    success: true,
                    error: null,
                    type: 'primary'
                };

                // Mettre à jour le statut primary de tous les contacts
                state.contacts.items.forEach(contact => {
                    contact.is_primary = contact.id === action.meta.arg;
                });
            })
            .addCase(setContactAsPrimary.rejected, (state, action) => {
                state.contactOperation = {
                    loading: false,
                    success: false,
                    error: action.payload?.message || 'Erreur lors de la définition du contact principal',
                    type: 'primary'
                };
            })

            // Gestion deleteProjectContact
            .addCase(deleteProjectContact.pending, (state, action) => {
                state.contactOperation = {
                    loading: true,
                    success: false,
                    error: null,
                    type: 'delete'
                };
            })
            .addCase(deleteProjectContact.fulfilled, (state, action) => {
                state.contactOperation = {
                    loading: false,
                    success: true,
                    error: null,
                    type: 'delete'
                };
                state.contacts.items = state.contacts.items.filter(item => item.id !== action.meta.arg.id);
            })
            .addCase(deleteProjectContact.rejected, (state, action) => {
                state.contactOperation = {
                    loading: false,
                    success: false,
                    error: action.payload?.message || 'Erreur lors de la suppression du contact',
                    type: 'delete'
                };
            })
            .addCase(fetchSecteurs.pending, (state) => {
                state.secteurs.loading = true;
                state.secteurs.error = null;
            })
            .addCase(fetchSecteurs.fulfilled, (state, action) => {
                state.secteurs.loading = false;

                // Gérer les différentes structures possibles de réponse
                if (Array.isArray(action.payload)) {
                    state.secteurs.items = action.payload;
                } else if (action.payload && action.payload.data) {
                    state.secteurs.items = action.payload.data;
                } else {
                    state.secteurs.items = [];
                    console.error("Format de données inattendu pour les secteurs:", action.payload);
                }
            })
            .addCase(fetchSecteurs.rejected, (state, action) => {
                state.secteurs.loading = false;
                state.secteurs.error = action.payload?.message || "Erreur lors du chargement des secteurs";
            })
            // Dans le builder.addCase de extraReducers:

            // Gestion fetchAllPipelineStages
            .addCase(fetchAllPipelineStages.pending, (state) => {
                state.pipelineStages.loading = true;
                state.pipelineStages.error = null;
            })
            .addCase(fetchAllPipelineStages.fulfilled, (state, action) => {
                state.pipelineStages.loading = false;
                state.pipelineStages.items = action.payload;
            })
            .addCase(fetchAllPipelineStages.rejected, (state, action) => {
                state.pipelineStages.loading = false;
                state.pipelineStages.error = action.payload?.message || "Erreur lors du chargement des étapes";
            })

            // Gestion getPipelineStageById
            .addCase(getPipelineStageById.pending, (state) => {
                state.pipelineStages.loading = true;
                state.pipelineStages.error = null;
            })
            .addCase(getPipelineStageById.fulfilled, (state, action) => {
                state.pipelineStages.loading = false;
                state.pipelineStages.selectedStage = action.payload;
            })
            .addCase(getPipelineStageById.rejected, (state, action) => {
                state.pipelineStages.loading = false;
                state.pipelineStages.error = action.payload?.message || "Erreur lors du chargement de l'étape";
            })

            // Gestion createPipelineStage
            .addCase(createPipelineStage.pending, (state) => {
                state.pipelineStages.operationLoading = true;
                state.pipelineStages.operationError = null;
            })
            .addCase(createPipelineStage.fulfilled, (state, action) => {
                state.pipelineStages.operationLoading = false;
                state.pipelineStages.items.push(action.payload);
            })
            .addCase(createPipelineStage.rejected, (state, action) => {
                state.pipelineStages.operationLoading = false;
                state.pipelineStages.operationError = action.payload?.message || "Erreur lors de la création de l'étape";
            })

            // Gestion updatePipelineStage
            // .addCase(updatePipelineStage.pending, (state) => {
            //     state.pipelineStages.operationLoading = true;
            //     state.pipelineStages.operationError = null;
            // })
            // .addCase(updatePipelineStage.fulfilled, (state, action) => {
            //     state.pipelineStages.operationLoading = false;
            //     const index = state.pipelineStages.items.findIndex(item => item.id === action.meta.arg.id);
            //     if (index !== -1) {
            //         state.pipelineStages.items[index] = action.payload;
            //     }
            // })
            // .addCase(updatePipelineStage.rejected, (state, action) => {
            //     state.pipelineStages.operationLoading = false;
            //     state.pipelineStages.operationError = action.payload?.message || "Erreur lors de la mise à jour de l'étape";
            // })

            // Gestion deletePipelineStage
            .addCase(deletePipelineStage.pending, (state) => {
                state.pipelineStages.operationLoading = true;
                state.pipelineStages.operationError = null;
            })
            .addCase(deletePipelineStage.fulfilled, (state, action) => {
                state.pipelineStages.operationLoading = false;
                state.pipelineStages.items = state.pipelineStages.items.filter(item => item.id !== action.payload);
            })
            .addCase(deletePipelineStage.rejected, (state, action) => {
                state.pipelineStages.operationLoading = false;
                state.pipelineStages.operationError = action.payload?.message || "Erreur lors de la suppression de l'étape";
            })

            // Gestion reorderPipelineStages
            .addCase(reorderPipelineStages.pending, (state) => {
                state.pipelineStages.operationLoading = true;
                state.pipelineStages.operationError = null;
            })
            .addCase(reorderPipelineStages.fulfilled, (state, action) => {
                state.pipelineStages.operationLoading = false;
                // Mettre à jour l'ordre des étapes existantes
                action.payload.forEach(stageData => {
                    const index = state.pipelineStages.items.findIndex(item => item.id === stageData.id);
                    if (index !== -1) {
                        state.pipelineStages.items[index].order = stageData.order;
                    }
                });
                // Trier les étapes par leur nouvel ordre
                state.pipelineStages.items.sort((a, b) => a.order - b.order);
            })
            .addCase(reorderPipelineStages.rejected, (state, action) => {
                state.pipelineStages.operationLoading = false;
                state.pipelineStages.operationError = action.payload?.message || "Erreur lors de la réorganisation des étapes";
            })

            // Gestion getPipelineStagesByType (identique à l'existant getPipelineStages)
            .addCase(getPipelineStagesByType.pending, (state) => {
                state.pipelineStages.loading = true;
                state.pipelineStages.error = null;
            })
            .addCase(getPipelineStagesByType.fulfilled, (state, action) => {
                state.pipelineStages.loading = false;
                state.pipelineStages.items = action.payload.stages || [];
            })
            .addCase(getPipelineStagesByType.rejected, (state, action) => {
                state.pipelineStages.loading = false;
                state.pipelineStages.error = action.payload?.message || "Erreur lors du chargement des étapes";
            })
            // À ajouter dans builder.addCase dans extraReducers:

            // Gestion fetchProjectsByStatusStats
            .addCase(fetchProjectsByStatusStats.pending, (state) => {
                state.statistics.projectsByStatus.loading = true;
                state.statistics.projectsByStatus.error = null;
            })
            .addCase(fetchProjectsByStatusStats.fulfilled, (state, action) => {
                state.statistics.projectsByStatus.loading = false;
                state.statistics.projectsByStatus.data = action.payload;
            })
            .addCase(fetchProjectsByStatusStats.rejected, (state, action) => {
                state.statistics.projectsByStatus.loading = false;
                state.statistics.projectsByStatus.error = action.payload?.message || "Erreur lors du chargement des statistiques";
            })

            // Gestion fetchProjectsBySectorStats
            .addCase(fetchProjectsBySectorStats.pending, (state) => {
                state.statistics.projectsBySector.loading = true;
                state.statistics.projectsBySector.error = null;
            })
            .addCase(fetchProjectsBySectorStats.fulfilled, (state, action) => {
                state.statistics.projectsBySector.loading = false;
                state.statistics.projectsBySector.data = action.payload;
            })
            .addCase(fetchProjectsBySectorStats.rejected, (state, action) => {
                state.statistics.projectsBySector.loading = false;
                state.statistics.projectsBySector.error = action.payload?.message || "Erreur lors du chargement des statistiques";
            })

            // Gestion fetchInvestmentByRegionStats
            .addCase(fetchInvestmentByRegionStats.pending, (state) => {
                state.statistics.investmentByRegion.loading = true;
                state.statistics.investmentByRegion.error = null;
            })
            .addCase(fetchInvestmentByRegionStats.fulfilled, (state, action) => {
                state.statistics.investmentByRegion.loading = false;
                state.statistics.investmentByRegion.data = action.payload;
            })
            .addCase(fetchInvestmentByRegionStats.rejected, (state, action) => {
                state.statistics.investmentByRegion.loading = false;
                state.statistics.investmentByRegion.error = action.payload?.message || "Erreur lors du chargement des statistiques";
            })

            // Gestion fetchJobsCreatedStats
            .addCase(fetchJobsCreatedStats.pending, (state) => {
                state.statistics.jobsCreated.loading = true;
                state.statistics.jobsCreated.error = null;
            })
            .addCase(fetchJobsCreatedStats.fulfilled, (state, action) => {
                state.statistics.jobsCreated.loading = false;
                state.statistics.jobsCreated.data = action.payload;
            })
            .addCase(fetchJobsCreatedStats.rejected, (state, action) => {
                state.statistics.jobsCreated.loading = false;
                state.statistics.jobsCreated.error = action.payload?.message || "Erreur lors du chargement des statistiques";
            })

            // Gestion fetchDashboardStats
            .addCase(fetchDashboardStats.pending, (state) => {
                state.statistics.dashboard.loading = true;
                state.statistics.dashboard.error = null;
            })
            .addCase(fetchDashboardStats.fulfilled, (state, action) => {
                state.statistics.dashboard.loading = false;
                state.statistics.dashboard.data = action.payload;
            })
            .addCase(fetchDashboardStats.rejected, (state, action) => {
                state.statistics.dashboard.loading = false;
                state.statistics.dashboard.error = action.payload?.message || "Erreur lors du chargement des statistiques";
            })
            // À ajouter dans builder.addCase dans extraReducers après les autres cas de followUp:

// Gestion fetchUpcomingFollowUps
.addCase(fetchUpcomingFollowUps.pending, (state) => {
    state.followUps.loading = true;
    state.followUps.error = null;
  })
  .addCase(fetchUpcomingFollowUps.fulfilled, (state, action) => {
    state.followUps.loading = false;
    state.followUps.upcomingItems = action.payload;
  })
  .addCase(fetchUpcomingFollowUps.rejected, (state, action) => {
    state.followUps.loading = false;
    state.followUps.error = action.payload?.message || "Erreur lors du chargement des suivis à venir";
  })
  
  // Gestion getFollowUpById
  .addCase(getFollowUpById.pending, (state) => {
    state.followUps.loading = true;
    state.followUps.error = null;
  })
  .addCase(getFollowUpById.fulfilled, (state, action) => {
    state.followUps.loading = false;
    state.followUps.selectedFollowUp = action.payload;
  })
  .addCase(getFollowUpById.rejected, (state, action) => {
    state.followUps.loading = false;
    state.followUps.error = action.payload?.message || "Erreur lors du chargement du suivi";
  })
  
  // Gestion updateFollowUp
  .addCase(updateFollowUp.pending, (state) => {
    state.followUpOperation = {
      loading: true,
      success: false,
      error: null,
      type: 'update'
    };
  })
  .addCase(updateFollowUp.fulfilled, (state, action) => {
    state.followUpOperation = {
      loading: false,
      success: true,
      error: null,
      type: 'update'
    };
    
    // Mettre à jour le suivi dans la liste principale si présent
    const index = state.followUps.items.findIndex(item => item.id === action.meta.arg.id);
    if (index !== -1) {
      state.followUps.items[index] = action.payload;
    }
    
    // Mettre à jour le suivi dans la liste des suivis à venir si présent
    if (state.followUps.upcomingItems) {
      const upcomingIndex = state.followUps.upcomingItems.findIndex(item => item.id === action.meta.arg.id);
      if (upcomingIndex !== -1) {
        state.followUps.upcomingItems[upcomingIndex] = action.payload;
      }
    }
    
    // Mettre à jour le suivi sélectionné si c'est le même
    if (state.followUps.selectedFollowUp?.id === action.meta.arg.id) {
      state.followUps.selectedFollowUp = action.payload;
    }
  })
  .addCase(updateFollowUp.rejected, (state, action) => {
    state.followUpOperation = {
      loading: false,
      success: false,
      error: action.payload?.message || "Erreur lors de la mise à jour du suivi",
      type: 'update'
    };
  })
  
  // Gestion deleteFollowUp
  .addCase(deleteFollowUp.pending, (state) => {
    state.followUpOperation = {
      loading: true,
      success: false,
      error: null,
      type: 'delete'
    };
  })
  .addCase(deleteFollowUp.fulfilled, (state, action) => {
    state.followUpOperation = {
      loading: false,
      success: true,
      error: null,
      type: 'delete'
    };
    
    // Supprimer le suivi de la liste principale
    state.followUps.items = state.followUps.items.filter(item => item.id !== action.payload);
    
    // Supprimer le suivi de la liste des suivis à venir
    if (state.followUps.upcomingItems) {
      state.followUps.upcomingItems = state.followUps.upcomingItems.filter(item => item.id !== action.payload);
    }
    
    // Réinitialiser le suivi sélectionné s'il a été supprimé
    if (state.followUps.selectedFollowUp?.id === action.payload) {
      state.followUps.selectedFollowUp = null;
    }
  })
  .addCase(deleteFollowUp.rejected, (state, action) => {
    state.followUpOperation = {
      loading: false,
      success: false,
      error: action.payload?.message || "Erreur lors de la suppression du suivi",
      type: 'delete'
    };
  })
  // Dans le builder.addCase de extraReducers:

// Gestion createPipelineType
.addCase(createPipelineType.pending, (state) => {
    state.operation = {
      type: 'create_pipeline_type',
      loading: true,
      success: false,
      error: null
    };
  })
  .addCase(createPipelineType.fulfilled, (state, action) => {
    state.operation = {
      type: 'create_pipeline_type',
      loading: false,
      success: true,
      error: null
    };
    state.pipelineTypes.items.push(action.payload);
  })
  .addCase(createPipelineType.rejected, (state, action) => {
    state.operation = {
      type: 'create_pipeline_type',
      loading: false,
      success: false,
      error: action.payload?.message || 'Erreur lors de la création du type de pipeline'
    };
  })
  
  // Gestion updatePipelineType
  .addCase(updatePipelineType.pending, (state) => {
    state.operation = {
      type: 'update_pipeline_type',
      loading: true,
      success: false,
      error: null,
      targetId: action.meta?.arg?.id
    };
  })
  .addCase(updatePipelineType.fulfilled, (state, action) => {
    state.operation = {
      type: 'update_pipeline_type',
      loading: false,
      success: true,
      error: null,
      targetId: action.meta.arg.id
    };
    
    // Mettre à jour le type dans la liste si présent
    const index = state.pipelineTypes.items.findIndex(item => item.id === action.meta.arg.id);
    if (index !== -1) {
      state.pipelineTypes.items[index] = action.payload;
    }
    
    // Mettre à jour le type sélectionné si c'est le même
    if (state.selectedPipelineType.data?.id === action.meta.arg.id) {
      state.selectedPipelineType.data = action.payload;
    }
  })
  .addCase(updatePipelineType.rejected, (state, action) => {
    state.operation = {
      type: 'update_pipeline_type',
      loading: false,
      success: false,
      error: action.payload?.message || 'Erreur lors de la mise à jour du type de pipeline',
      targetId: action.meta.arg.id
    };
  })
  
  // Gestion deletePipelineType
  .addCase(deletePipelineType.pending, (state, action) => {
    state.operation = {
      type: 'delete_pipeline_type',
      loading: true,
      success: false,
      error: null,
      targetId: action.meta.arg
    };
  })
  .addCase(deletePipelineType.fulfilled, (state, action) => {
    state.operation = {
      type: 'delete_pipeline_type',
      loading: false,
      success: true,
      error: null,
      targetId: action.meta.arg
    };
    state.pipelineTypes.items = state.pipelineTypes.items.filter(item => item.id !== action.payload);
    
    // Réinitialiser le type sélectionné s'il a été supprimé
    if (state.selectedPipelineType.data?.id === action.payload) {
      state.selectedPipelineType.data = null;
      state.selectedPipelineType.stages = [];
    }
  })
  .addCase(deletePipelineType.rejected, (state, action) => {
    state.operation = {
      type: 'delete_pipeline_type',
      loading: false,
      success: false,
      error: action.payload?.message || 'Erreur lors de la suppression du type de pipeline',
      targetId: action.meta.arg
    };
  });




    }
});

export const {
    setFilters,
    clearFilters,
    resetOperation,
    resetBlockageOperation,
    resetFollowUpOperation,
    resetContactOperation
} = projectSlice.actions;

export default projectSlice.reducer;