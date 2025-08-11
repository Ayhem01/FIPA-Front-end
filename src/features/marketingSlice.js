import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axios from 'axios';

// Base URL pour les API marketing
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

// =========== Séminaires ===========
export const fetchSeminaires = createAsyncThunk(
  "marketing/fetchSeminaires",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/seminaire_jipays/all`, getAuthHeader());
      return response.data;
    } catch (error) {
      console.error("Erreur lors du chargement des séminaires:", error);
      return rejectWithValue(error.response?.data || "Une erreur s'est produite");
    }
  }
);

export const addSeminaire = createAsyncThunk(
  "marketing/addSeminaire",
  async (seminaireData, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/seminaire_jipays/`,
        seminaireData,
        getAuthHeader()
      );
      return response.data;
    } catch (error) {
      console.error("Erreur lors de l'ajout du séminaire:", error);
      return rejectWithValue(error.response?.data || "Une erreur s'est produite");
    }
  }
);

export const updateSeminaire = createAsyncThunk(
  "marketing/updateSeminaire",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await axios.put(
        `${API_BASE_URL}/seminaire_jipays/${id}`,
        data,
        getAuthHeader()
      );
      return response.data;
    } catch (error) {
      console.error("Erreur lors de la mise à jour du séminaire:", error);
      return rejectWithValue(error.response?.data || "Une erreur s'est produite");
    }
  }
);

export const deleteSeminaire = createAsyncThunk(
  "marketing/deleteSeminaire",
  async (id, { rejectWithValue }) => {
    try {
      const response = await axios.delete(
        `${API_BASE_URL}/seminaire_jipays/delete/${id}`,
        getAuthHeader()
      );
      return { id, ...response.data };
    } catch (error) {
      console.error("Erreur lors de la suppression du séminaire:", error);
      return rejectWithValue(error.response?.data || "Une erreur s'est produite");
    }
  }
);

export const getSeminaireById = createAsyncThunk(
  "marketing/getSeminaireById",
  async (id, { rejectWithValue }) => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/seminaire_jipays/show/${id}`,
        getAuthHeader()
      );
      return response.data;
    } catch (error) {
      console.error("Erreur lors de la récupération du séminaire:", error);
      return rejectWithValue(error.response?.data || "Une erreur s'est produite");
    }
  }
);

// =========== Salons ===========
export const fetchSalons = createAsyncThunk(
  "marketing/fetchSalons",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/salon/all`, getAuthHeader());
      return response.data;
    } catch (error) {
      console.error("Erreur lors du chargement des salons:", error);
      return rejectWithValue(error.response?.data || "Une erreur s'est produite");
    }
  }
);

export const addSalon = createAsyncThunk(
  "marketing/addSalon",
  async (salonData, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/salon/`,
        salonData,
        getAuthHeader()
      );
      return response.data;
    } catch (error) {
      console.error("Erreur lors de l'ajout du salon:", error);
      return rejectWithValue(error.response?.data || "Une erreur s'est produite");
    }
  }
);

export const updateSalon = createAsyncThunk(
  "marketing/updateSalon",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await axios.put(
        `${API_BASE_URL}/salon/${id}`,
        data,
        getAuthHeader()
      );
      return response.data;
    } catch (error) {
      console.error("Erreur lors de la mise à jour du salon:", error);
      return rejectWithValue(error.response?.data || "Une erreur s'est produite");
    }
  }
);

export const deleteSalon = createAsyncThunk(
  "marketing/deleteSalon",
  async (id, { rejectWithValue }) => {
    try {
      const response = await axios.delete(
        `${API_BASE_URL}/salon/delete/${id}`,
        getAuthHeader()
      );
      return { id, ...response.data };
    } catch (error) {
      console.error("Erreur lors de la suppression du salon:", error);
      return rejectWithValue(error.response?.data || "Une erreur s'est produite");
    }
  }
);

export const getSalonById = createAsyncThunk(
  "marketing/getSalonById",
  async (id, { rejectWithValue }) => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/salon/show/${id}`,
        getAuthHeader()
      );
      return response.data;
    } catch (error) {
      console.error("Erreur lors de la récupération du salon:", error);
      return rejectWithValue(error.response?.data || "Une erreur s'est produite");
    }
  }
);

// =========== CTE ===========
export const fetchCtes = createAsyncThunk(
  "marketing/fetchCtes",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/cte/all`, getAuthHeader());
      return response.data;
    } catch (error) {
      console.error("Erreur lors du chargement des CTEs:", error);
      return rejectWithValue(error.response?.data || "Une erreur s'est produite");
    }
  }
);

export const addCte = createAsyncThunk(
  "marketing/addCte",
  async (cteData, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/cte/`,
        cteData,
        getAuthHeader()
      );
      return response.data;
    } catch (error) {
      console.error("Erreur lors de l'ajout du CTE:", error);
      return rejectWithValue(error.response?.data || "Une erreur s'est produite");
    }
  }
);

export const updateCte = createAsyncThunk(
  "marketing/updateCte",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await axios.put(
        `${API_BASE_URL}/cte/${id}`,
        data,
        getAuthHeader()
      );
      return response.data;
    } catch (error) {
      console.error("Erreur lors de la mise à jour du CTE:", error);
      return rejectWithValue(error.response?.data || "Une erreur s'est produite");
    }
  }
);

export const deleteCte = createAsyncThunk(
  "marketing/deleteCte",
  async (id, { rejectWithValue }) => {
    try {
      const response = await axios.delete(
        `${API_BASE_URL}/cte/delete/${id}`,
        getAuthHeader()
      );
      return { id, ...response.data };
    } catch (error) {
      console.error("Erreur lors de la suppression du CTE:", error);
      return rejectWithValue(error.response?.data || "Une erreur s'est produite");
    }
  }
);

export const getCteById = createAsyncThunk(
  "marketing/getCteById",
  async (id, { rejectWithValue }) => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/cte/show/${id}`,
        getAuthHeader()
      );
      return response.data;
    } catch (error) {
      console.error("Erreur lors de la récupération du CTE:", error);
      return rejectWithValue(error.response?.data || "Une erreur s'est produite");
    }
  }
);

// =========== Media ===========
export const fetchMedias = createAsyncThunk(
  "marketing/fetchMedias",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/media/all`, getAuthHeader());
      return response.data;
    } catch (error) {
      console.error("Erreur lors du chargement des médias:", error);
      return rejectWithValue(error.response?.data || "Une erreur s'est produite");
    }
  }
);

export const addMedia = createAsyncThunk(
  "marketing/addMedia",
  async (mediaData, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/media/`,
        mediaData,
        getAuthHeader()
      );
      return response.data;
    } catch (error) {
      console.error("Erreur lors de l'ajout du média:", error);
      return rejectWithValue(error.response?.data || "Une erreur s'est produite");
    }
  }
);

export const updateMedia = createAsyncThunk(
  "marketing/updateMedia",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await axios.put(
        `${API_BASE_URL}/media/${id}`,
        data,
        getAuthHeader()
      );
      return response.data;
    } catch (error) {
      console.error("Erreur lors de la mise à jour du média:", error);
      return rejectWithValue(error.response?.data || "Une erreur s'est produite");
    }
  }
);

export const deleteMedia = createAsyncThunk(
  "marketing/deleteMedia",
  async (id, { rejectWithValue }) => {
    try {
      const response = await axios.delete(
        `${API_BASE_URL}/media/delete/${id}`,
        getAuthHeader()
      );
      return { id, ...response.data };
    } catch (error) {
      console.error("Erreur lors de la suppression du média:", error);
      return rejectWithValue(error.response?.data || "Une erreur s'est produite");
    }
  }
);

export const getMediaById = createAsyncThunk(
  "marketing/getMediaById",
  async (id, { rejectWithValue }) => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/media/show/${id}`,
        getAuthHeader()
      );
      return response.data;
    } catch (error) {
      console.error("Erreur lors de la récupération du média:", error);
      return rejectWithValue(error.response?.data || "Une erreur s'est produite");
    }
  }
);


// =========== Séminaires Secteur ===========
export const fetchSeminairesSecteur = createAsyncThunk(
  "marketing/fetchSeminairesSecteur",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/seminaire_ji_secteur/all`, getAuthHeader());
      return response.data;
    } catch (error) {
      console.error("Erreur lors du chargement des séminaires secteur:", error);
      return rejectWithValue(error.response?.data || "Une erreur s'est produite");
    }
  }
);

export const addSeminaireSecteur = createAsyncThunk(
  "marketing/addSeminaireSecteur",
  async (seminaireData, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/seminaire_ji_secteur/`,
        seminaireData,
        getAuthHeader()
      );
      return response.data;
    } catch (error) {
      console.error("Erreur lors de l'ajout du séminaire secteur:", error);
      return rejectWithValue(error.response?.data || "Une erreur s'est produite");
    }
  }
);

export const updateSeminaireSecteur = createAsyncThunk(
  "marketing/updateSeminaireSecteur",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await axios.put(
        `${API_BASE_URL}/seminaire_ji_secteur/${id}`,
        data,
        getAuthHeader()
      );
      return response.data;
    } catch (error) {
      console.error("Erreur lors de la mise à jour du séminaire secteur:", error);
      return rejectWithValue(error.response?.data || "Une erreur s'est produite");
    }
  }
);

export const deleteSeminaireSecteur = createAsyncThunk(
  "marketing/deleteSeminaireSecteur",
  async (id, { rejectWithValue }) => {
    try {
      const response = await axios.delete(
        `${API_BASE_URL}/seminaire_ji_secteur/delete/${id}`,
        getAuthHeader()
      );
      return { id, ...response.data };
    } catch (error) {
      console.error("Erreur lors de la suppression du séminaire secteur:", error);
      return rejectWithValue(error.response?.data || "Une erreur s'est produite");
    }
  }
);

export const getSeminaireSecteurById = createAsyncThunk(
  "marketing/getSeminaireSecteurById",
  async (id, { rejectWithValue }) => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/seminaire_ji_secteur/show/${id}`,
        getAuthHeader()
      );
      return response.data;
    } catch (error) {
      console.error("Erreur lors de la récupération du séminaire secteur:", error);
      return rejectWithValue(error.response?.data || "Une erreur s'est produite");
    }
  }
);

// =========== Salons Sectoriels ===========
export const fetchSalonsSectoriels = createAsyncThunk(
  "marketing/fetchSalonsSectoriels",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/salon_sectoriel/all`, getAuthHeader());
      return response.data;
    } catch (error) {
      console.error("Erreur lors du chargement des salons sectoriels:", error);
      return rejectWithValue(error.response?.data || "Une erreur s'est produite");
    }
  }
);

export const addSalonSectoriel = createAsyncThunk(
  "marketing/addSalonSectoriel",
  async (salonData, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/salon_sectoriel/`,
        salonData,
        getAuthHeader()
      );
      return response.data;
    } catch (error) {
      console.error("Erreur lors de l'ajout du salon sectoriel:", error);
      return rejectWithValue(error.response?.data || "Une erreur s'est produite");
    }
  }
);

export const updateSalonSectoriel = createAsyncThunk(
  "marketing/updateSalonSectoriel",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await axios.put(
        `${API_BASE_URL}/salon_sectoriel/${id}`,
        data,
        getAuthHeader()
      );
      return response.data;
    } catch (error) {
      console.error("Erreur lors de la mise à jour du salon sectoriel:", error);
      return rejectWithValue(error.response?.data || "Une erreur s'est produite");
    }
  }
);

export const deleteSalonSectoriel = createAsyncThunk(
  "marketing/deleteSalonSectoriel",
  async (id, { rejectWithValue }) => {
    try {
      const response = await axios.delete(
        `${API_BASE_URL}/salon_sectoriel/delete/${id}`,
        getAuthHeader()
      );
      return { id, ...response.data };
    } catch (error) {
      console.error("Erreur lors de la suppression du salon sectoriel:", error);
      return rejectWithValue(error.response?.data || "Une erreur s'est produite");
    }
  }
);

export const getSalonSectorielById = createAsyncThunk(
  "marketing/getSalonSectorielById",
  async (id, { rejectWithValue }) => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/salon_sectoriel/show/${id}`,
        getAuthHeader()
      );
      return response.data;
    } catch (error) {
      console.error("Erreur lors de la récupération du salon sectoriel:", error);
      return rejectWithValue(error.response?.data || "Une erreur s'est produite");
    }
  }
);
// =========== Démarchage Direct ===========
export const fetchDemarchagesDirect = createAsyncThunk(
  "marketing/fetchDemarchagesDirect",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/demarchage_direct/all`, getAuthHeader());
      return response.data;
    } catch (error) {
      console.error("Erreur lors du chargement des démarchages directs:", error);
      return rejectWithValue(error.response?.data || "Une erreur s'est produite");
    }
  }
);

export const addDemarchageDirect = createAsyncThunk(
  "marketing/addDemarchageDirect",
  async (demarchageData, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/demarchage_direct/`,
        demarchageData,
        getAuthHeader()
      );
      return response.data;
    } catch (error) {
      console.error("Erreur lors de l'ajout du démarchage direct:", error);
      return rejectWithValue(error.response?.data || "Une erreur s'est produite");
    }
  }
);

export const updateDemarchageDirect = createAsyncThunk(
  "marketing/updateDemarchageDirect",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await axios.put(
        `${API_BASE_URL}/demarchage_direct/${id}`,
        data,
        getAuthHeader()
      );
      return response.data;
    } catch (error) {
      console.error("Erreur lors de la mise à jour du démarchage direct:", error);
      return rejectWithValue(error.response?.data || "Une erreur s'est produite");
    }
  }
);

export const deleteDemarchageDirect = createAsyncThunk(
  "marketing/deleteDemarchageDirect",
  async (id, { rejectWithValue }) => {
    try {
      const response = await axios.delete(
        `${API_BASE_URL}/demarchage_direct/delete/${id}`,
        getAuthHeader()
      );
      return { id, ...response.data };
    } catch (error) {
      console.error("Erreur lors de la suppression du démarchage direct:", error);
      return rejectWithValue(error.response?.data || "Une erreur s'est produite");
    }
  }
);

export const getDemarchageDirectById = createAsyncThunk(
  "marketing/getDemarchageDirectById",
  async (id, { rejectWithValue }) => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/demarchage_direct/show/${id}`,
        getAuthHeader()
      );
      return response.data;
    } catch (error) {
      console.error("Erreur lors de la récupération du démarchage direct:", error);
      return rejectWithValue(error.response?.data || "Une erreur s'est produite");
    }
  }
);
// =========== Délégations ===========
export const fetchDelegations = createAsyncThunk(
  "marketing/fetchDelegations",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/delegations/all`, getAuthHeader());
      return response.data;
    } catch (error) {
      console.error("Erreur lors du chargement des délégations:", error);
      return rejectWithValue(error.response?.data || "Une erreur s'est produite");
    }
  }
);

export const addDelegation = createAsyncThunk(
  "marketing/addDelegation",
  async (delegationData, { rejectWithValue }) => {
    try {
      const formData = new FormData();

      // Ajouter tous les champs de texte
      Object.keys(delegationData).forEach(key => {
        if (key !== 'liste_membres_pdf') {
          formData.append(key, delegationData[key]);
        }
      });

      // Ajouter le fichier PDF s'il existe
      if (delegationData.liste_membres_pdf && delegationData.liste_membres_pdf.file) {
        formData.append('liste_membres_pdf', delegationData.liste_membres_pdf.file);
      }

      const response = await axios.post(
        `${API_BASE_URL}/delegations/`,
        formData,
        {
          ...getAuthHeader(),
          headers: {
            ...getAuthHeader().headers,
            'Content-Type': 'multipart/form-data'
          }
        }
      );
      return response.data;
    } catch (error) {
      console.error("Erreur lors de l'ajout de la délégation:", error);
      return rejectWithValue(error.response?.data || "Une erreur s'est produite");
    }
  }
);

export const updateDelegation = createAsyncThunk(
  "marketing/updateDelegation",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const formData = new FormData();

      // Ajouter tous les champs de texte
      Object.keys(data).forEach(key => {
        if (key !== 'liste_membres_pdf') {
          formData.append(key, data[key]);
        }
      });

      // Ajouter le fichier PDF s'il existe
      if (data.liste_membres_pdf && data.liste_membres_pdf.file) {
        formData.append('liste_membres_pdf', data.liste_membres_pdf.file);
      }

      const response = await axios.post(
        `${API_BASE_URL}/delegations/${id}?_method=PUT`,
        formData,
        {
          ...getAuthHeader(),
          headers: {
            ...getAuthHeader().headers,
            'Content-Type': 'multipart/form-data'
          }
        }
      );
      return response.data;
    } catch (error) {
      console.error("Erreur lors de la mise à jour de la délégation:", error);
      return rejectWithValue(error.response?.data || "Une erreur s'est produite");
    }
  }
);

export const deleteDelegation = createAsyncThunk(
  "marketing/deleteDelegation",
  async (id, { rejectWithValue }) => {
    try {
      const response = await axios.delete(
        `${API_BASE_URL}/delegations/delete/${id}`,
        getAuthHeader()
      );
      return { id, ...response.data };
    } catch (error) {
      console.error("Erreur lors de la suppression de la délégation:", error);
      return rejectWithValue(error.response?.data || "Une erreur s'est produite");
    }
  }
);

export const getDelegationById = createAsyncThunk(
  "marketing/getDelegationById",
  async (id, { rejectWithValue }) => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/delegations/show/${id}`,
        getAuthHeader()
      );
      return response.data;
    } catch (error) {
      console.error("Erreur lors de la récupération de la délégation:", error);
      return rejectWithValue(error.response?.data || "Une erreur s'est produite");
    }
  }
);
// =========== Visites Entreprise ===========
export const fetchVisitesEntreprise = createAsyncThunk(
  "marketing/fetchVisitesEntreprise",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/visites_entreprises/all`, getAuthHeader());
      return response.data;
    } catch (error) {
      console.error("Erreur lors du chargement des visites d'entreprise:", error);
      return rejectWithValue(error.response?.data || "Une erreur s'est produite");
    }
  }
);

export const addVisiteEntreprise = createAsyncThunk(
  "marketing/addVisiteEntreprise",
  async (visiteData, { rejectWithValue }) => {
    try {
      const formData = new FormData();

      // Ajouter tous les champs de texte
      Object.keys(visiteData).forEach(key => {
        if (key !== 'programme_pdf') {
          formData.append(key, visiteData[key]);
        }
      });

      // Ajouter le fichier PDF s'il existe
      if (visiteData.programme_pdf && visiteData.programme_pdf.file) {
        formData.append('programme_pdf', visiteData.programme_pdf.file);
      }

      const response = await axios.post(
        `${API_BASE_URL}/visites_entreprises/`,
        formData,
        {
          ...getAuthHeader(),
          headers: {
            ...getAuthHeader().headers,
            'Content-Type': 'multipart/form-data'
          }
        }
      );
      return response.data;
    } catch (error) {
      console.error("Erreur lors de l'ajout de la visite d'entreprise:", error);
      return rejectWithValue(error.response?.data || "Une erreur s'est produite");
    }
  }
);

export const updateVisiteEntreprise = createAsyncThunk(
  "marketing/updateVisiteEntreprise",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const formData = new FormData();

      // Ajouter tous les champs de texte
      Object.keys(data).forEach(key => {
        if (key !== 'programme_pdf') {
          formData.append(key, data[key]);
        }
      });

      // Ajouter le fichier PDF s'il existe
      if (data.programme_pdf && data.programme_pdf.file) {
        formData.append('programme_pdf', data.programme_pdf.file);
      }

      const response = await axios.post(
        `${API_BASE_URL}/visites_entreprises/${id}?_method=PUT`,
        formData,
        {
          ...getAuthHeader(),
          headers: {
            ...getAuthHeader().headers,
            'Content-Type': 'multipart/form-data'
          }
        }
      );
      return response.data;
    } catch (error) {
      console.error("Erreur lors de la mise à jour de la visite d'entreprise:", error);
      return rejectWithValue(error.response?.data || "Une erreur s'est produite");
    }
  }
);

export const deleteVisiteEntreprise = createAsyncThunk(
  "marketing/deleteVisiteEntreprise",
  async (id, { rejectWithValue }) => {
    try {
      const response = await axios.delete(
        `${API_BASE_URL}/visites_entreprises/delete/${id}`,
        getAuthHeader()
      );
      return { id, ...response.data };
    } catch (error) {
      console.error("Erreur lors de la suppression de la visite d'entreprise:", error);
      return rejectWithValue(error.response?.data || "Une erreur s'est produite");
    }
  }
);

export const getVisiteEntrepriseById = createAsyncThunk(
  "marketing/getVisiteEntrepriseById",
  async (id, { rejectWithValue }) => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/visites_entreprises/show/${id}`,
        getAuthHeader()
      );
      return response.data;
    } catch (error) {
      console.error("Erreur lors de la récupération de la visite d'entreprise:", error);
      return rejectWithValue(error.response?.data || "Une erreur s'est produite");
    }
  }
);



export const fetchGroupes = createAsyncThunk(
  "marketing/fetchGroupes",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/groupe/all`, getAuthHeader());
      return response.data;
    } catch (error) {
      console.error("Erreur lors du chargement des groupes:", error);
      return rejectWithValue(error.response?.data || "Une erreur s'est produite");
    }
  }
);


export const fetchNationalites = createAsyncThunk(
  "marketing/fetchNationalites",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/nationalite/all`, getAuthHeader());
      return response.data;
    } catch (error) {
      console.error("Erreur lors du chargement des nationalités:", error);
      return rejectWithValue(error.response?.data || "Une erreur s'est produite");
    }
  }
);
export const fetchResponsablesBureaux = createAsyncThunk(
  "marketing/fetchResponsablesBureaux",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/responsablebureaumedia/all`, getAuthHeader());
      return response.data;
    } catch (error) {
      console.error("Erreur lors du chargement des responsables de bureaux:", error);
      return rejectWithValue(error.response?.data || "Une erreur s'est produite");
    }
  }
);
export const fetchVavSiege = createAsyncThunk(
  "marketing/fetchVavSiege",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/vavsiegemedia/all`, getAuthHeader());
      return response.data;
    } catch (error) {
      console.error("Erreur lors du chargement des VAV siège:", error);
      return rejectWithValue(error.response?.data || "Une erreur s'est produite");
    }
  }
);
export const fetchInitiateurs = createAsyncThunk(
  "marketing/fetchInitiateurs",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/initiateur/all`, getAuthHeader());
      return response.data;
    } catch (error) {
      console.error("Erreur lors du chargement des initiateurs:", error);
      return rejectWithValue(error.response?.data || "Une erreur s'est produite");
    }
  }
);

export const fetchPays = createAsyncThunk(
  "marketing/fetchPays",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/pays/all`, getAuthHeader());
      return response.data;
    } catch (error) {
      console.error("Erreur lors du chargement des pays:", error);
      return rejectWithValue(error.response?.data || "Une erreur s'est produite");
    }
  }
);

export const fetchSecteurs = createAsyncThunk(
  "marketing/fetchSecteurs",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/secteur/all`, getAuthHeader());
      return response.data;
    } catch (error) {
      console.error("Erreur lors du chargement des secteurs:", error);
      return rejectWithValue(error.response?.data || "Une erreur s'est produite");
    }
  }
);
export const fetchBinomes = createAsyncThunk(
  "marketing/fetchBinomes",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/binome/all`, getAuthHeader());
      return response.data;
    } catch (error) {
      console.error("Erreur lors du chargement des binômes:", error);
      return rejectWithValue(error.response?.data || "Une erreur s'est produite");
    }
  }
);
export const fetchResponsableFipa = createAsyncThunk(
  "marketing/fetchResponsableFipa",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/responsable_fipa/all`, getAuthHeader());
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Une erreur s'est produite");
    }
  }
);
export const fetchResponsableSuivi = createAsyncThunk(
  "marketing/fetchResponsableSuivi",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/responsable_suivi/all`, getAuthHeader());
      return response.data;
    } catch (error) {
      console.error("Erreur lors du chargement des responsables de suivi:", error);
      return rejectWithValue(error.response?.data || "Une erreur s'est produite");
    }
  }
);
// =========== Actions principales ===========

// Liste des actions avec filtres
// Modifier le thunk fetchActions pour gérer tous les paramètres disponibles dans l'API
export const fetchActions = createAsyncThunk(
  "marketing/fetchActions",
  async (params = {}, { rejectWithValue }) => {
    try {
      const queryParams = new URLSearchParams();
      
      // Paramètres de recherche et filtres
      if (params.nom) queryParams.append('nom', params.nom);
      if (params.type) queryParams.append('type', params.type);
      if (params.statut) queryParams.append('statut', params.statut);
      if (params.responsable_id) queryParams.append('responsable_id', params.responsable_id);
      if (params.periode) queryParams.append('periode', params.periode);
      
      // Paramètres de tri
      if (params.sort_by) queryParams.append('sort_by', params.sort_by);
      if (params.sort_direction) queryParams.append('sort_direction', params.sort_direction);
      
      // Pagination
      if (params.page) queryParams.append('page', params.page);
      if (params.per_page) queryParams.append('per_page', params.per_page);

      const response = await axios.get(
        `${API_BASE_URL}/actions?${queryParams.toString()}`,
        getAuthHeader()
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Erreur lors du chargement des actions");
    }
  }
);

// Récupérer une action spécifique
export const getActionById = createAsyncThunk(
  "marketing/getActionById",
  async (id, { rejectWithValue }) => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/actions/${id}`,
        getAuthHeader()
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Erreur lors de la récupération de l'action");
    }
  }
);

// Créer une action principale (et son entité spécifique)
export const addAction = createAsyncThunk(
  "marketing/addAction",
  async (actionData, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/actions`,
        actionData,
        getAuthHeader()
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Erreur lors de la création de l'action");
    }
  }
);

// Mettre à jour une action principale
export const updateAction = createAsyncThunk(
  "marketing/updateAction",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await axios.put(
        `${API_BASE_URL}/actions/${id}`,
        data,
        getAuthHeader()
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Erreur lors de la mise à jour de l'action");
    }
  }
);

// Supprimer une action principale
export const deleteAction = createAsyncThunk(
  "marketing/deleteAction",
  async (id, { rejectWithValue }) => {
    try {
      const response = await axios.delete(
        `${API_BASE_URL}/actions/${id}`,
        getAuthHeader()
      );
      return { id, ...response.data };
    } catch (error) {
      return rejectWithValue(error.response?.data || "Erreur lors de la suppression de l'action");
    }
  }
);

// Mettre à jour le statut d'une action
export const updateActionStatus = createAsyncThunk(
  "marketing/updateActionStatus",
  async ({ id, statut }, { rejectWithValue }) => {
    try {
      const response = await axios.put(
        `${API_BASE_URL}/actions/${id}/status`,
        { statut },
        getAuthHeader()
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Erreur lors de la mise à jour du statut");
    }
  }
);


// =========== Slice ===========
const marketingSlice = createSlice({
  name: 'marketing',
  initialState: {
    seminaires: {
      items: [],
      selectedItem: null,
      loading: false,
      error: null
    },
    salons: {
      items: [],
      selectedItem: null,
      loading: false,
      error: null
    },
    ctes: {
      items: [],
      selectedItem: null,
      loading: false,
      error: null
    },
    medias: {
      items: [],
      selectedItem: null,
      loading: false,
      error: null
    },
    nationalites: {
      items: [],
      loading: false,
      error: null
    },
    responsablesBureaux: {
      items: [],
      loading: false,
      error: null
    },
    vavSiege: {
      items: [],
      loading: false,
      error: null
    },
    initiateurs: {
      items: [],
      loading: false,
      error: null
    },
    pays: {
      items: [],
      loading: false,
      error: null
    },
    secteurs: {
      items: [],
      loading: false,
      error: null
    },
    binomes: {
      items: [],
      loading: false,
      error: null
    },
    responsableFipa: {
      items: [],
      loading: false,
      error: null
    },
    seminairesSecteur: {
      items: [],
      selectedItem: null,
      loading: false,
      error: null
    },
    groupes: {
      items: [],
      loading: false,
      error: null
    },
    salonsSectoriels: {
      items: [],
      selectedItem: null,
      loading: false,
      error: null
    },
    demarchagesDirect: {
      items: [],
      selectedItem: null,
      loading: false,
      error: null
    },
    delegations: {
      items: [],
      selectedItem: null,
      loading: false,
      error: null
    },
    visitesEntreprise: {
      items: [],
      selectedItem: null,
      loading: false,
      error: null
    },
    responsableSuivi: {
      items: [],
      loading: false,
      error: null
    },
    actions: {
      items: [],
      selectedItem: null,
      loading: false,
      error: null
    },

  },
  reducers: {
    clearErrors: (state) => {
      state.seminaires.error = null;
      state.salons.error = null;
      state.ctes.error = null;
      state.medias.error = null;
    },
    resetSelectedItem: (state, action) => {
      const category = action.payload;
      if (state[category]) {
        state[category].selectedItem = null;
      }
    }
  },
  extraReducers: (builder) => {
    // Séminaires
    builder
      .addCase(fetchSeminaires.pending, (state) => {
        state.seminaires.loading = true;
        state.seminaires.error = null;
      })
      .addCase(fetchSeminaires.fulfilled, (state, action) => {
        state.seminaires.loading = false;
        state.seminaires.items = action.payload.data || action.payload;
      })
      .addCase(fetchSeminaires.rejected, (state, action) => {
        state.seminaires.loading = false;
        state.seminaires.error = action.payload;
      })
      .addCase(addSeminaire.pending, (state) => {
        state.seminaires.loading = true;
        state.seminaires.error = null;
      })
      .addCase(addSeminaire.fulfilled, (state, action) => {
        state.seminaires.loading = false;
        state.seminaires.items.push(action.payload.data || action.payload);
      })
      .addCase(addSeminaire.rejected, (state, action) => {
        state.seminaires.loading = false;
        state.seminaires.error = action.payload;
      })
      .addCase(updateSeminaire.pending, (state) => {
        state.seminaires.loading = true;
        state.seminaires.error = null;
      })
      .addCase(updateSeminaire.fulfilled, (state, action) => {
        state.seminaires.loading = false;
        const updatedItem = action.payload.data || action.payload;
        const index = state.seminaires.items.findIndex(item => item.id === updatedItem.id);
        if (index !== -1) {
          state.seminaires.items[index] = updatedItem;
        }
      })
      .addCase(updateSeminaire.rejected, (state, action) => {
        state.seminaires.loading = false;
        state.seminaires.error = action.payload;
      })
      .addCase(deleteSeminaire.pending, (state) => {
        state.seminaires.loading = true;
        state.seminaires.error = null;
      })
      .addCase(deleteSeminaire.fulfilled, (state, action) => {
        state.seminaires.loading = false;
        state.seminaires.items = state.seminaires.items.filter(
          item => item.id !== action.payload.id
        );
      })
      .addCase(deleteSeminaire.rejected, (state, action) => {
        state.seminaires.loading = false;
        state.seminaires.error = action.payload;
      })
      .addCase(getSeminaireById.pending, (state) => {
        state.seminaires.loading = true;
        state.seminaires.error = null;
      })
      .addCase(getSeminaireById.fulfilled, (state, action) => {
        state.seminaires.loading = false;
        state.seminaires.selectedItem = action.payload.data || action.payload;
      })
      .addCase(getSeminaireById.rejected, (state, action) => {
        state.seminaires.loading = false;
        state.seminaires.error = action.payload;
      })

      // Salons
      .addCase(fetchSalons.pending, (state) => {
        state.salons.loading = true;
        state.salons.error = null;
      })
      .addCase(fetchSalons.fulfilled, (state, action) => {
        state.salons.loading = false;
        state.salons.items = action.payload.data || action.payload;
      })
      .addCase(fetchSalons.rejected, (state, action) => {
        state.salons.loading = false;
        state.salons.error = action.payload;
      })
      .addCase(addSalon.pending, (state) => {
        state.salons.loading = true;
        state.salons.error = null;
      })
      .addCase(addSalon.fulfilled, (state, action) => {
        state.salons.loading = false;
        state.salons.items.push(action.payload.data || action.payload);
      })
      .addCase(addSalon.rejected, (state, action) => {
        state.salons.loading = false;
        state.salons.error = action.payload;
      })
      .addCase(updateSalon.pending, (state) => {
        state.salons.loading = true;
        state.salons.error = null;
      })
      .addCase(updateSalon.fulfilled, (state, action) => {
        state.salons.loading = false;
        const updatedItem = action.payload.data || action.payload;
        const index = state.salons.items.findIndex(item => item.id === updatedItem.id);
        if (index !== -1) {
          state.salons.items[index] = updatedItem;
        }
      })
      .addCase(updateSalon.rejected, (state, action) => {
        state.salons.loading = false;
        state.salons.error = action.payload;
      })
      .addCase(deleteSalon.pending, (state) => {
        state.salons.loading = true;
        state.salons.error = null;
      })
      .addCase(deleteSalon.fulfilled, (state, action) => {
        state.salons.loading = false;
        state.salons.items = state.salons.items.filter(
          item => item.id !== action.payload.id
        );
      })
      .addCase(deleteSalon.rejected, (state, action) => {
        state.salons.loading = false;
        state.salons.error = action.payload;
      })
      .addCase(getSalonById.pending, (state) => {
        state.salons.loading = true;
        state.salons.error = null;
      })
      .addCase(getSalonById.fulfilled, (state, action) => {
        state.salons.loading = false;
        state.salons.selectedItem = action.payload.data || action.payload;
      })
      .addCase(getSalonById.rejected, (state, action) => {
        state.salons.loading = false;
        state.salons.error = action.payload;
      })

      // CTEs
      .addCase(fetchCtes.pending, (state) => {
        state.ctes.loading = true;
        state.ctes.error = null;
      })
      .addCase(fetchCtes.fulfilled, (state, action) => {
        state.ctes.loading = false;
        state.ctes.items = action.payload.data || action.payload;
      })
      .addCase(fetchCtes.rejected, (state, action) => {
        state.ctes.loading = false;
        state.ctes.error = action.payload;
      })
      .addCase(addCte.pending, (state) => {
        state.ctes.loading = true;
        state.ctes.error = null;
      })
      .addCase(addCte.fulfilled, (state, action) => {
        state.ctes.loading = false;
        state.ctes.items.push(action.payload.data || action.payload);
      })
      .addCase(addCte.rejected, (state, action) => {
        state.ctes.loading = false;
        state.ctes.error = action.payload;
      })
      .addCase(updateCte.pending, (state) => {
        state.ctes.loading = true;
        state.ctes.error = null;
      })
      .addCase(updateCte.fulfilled, (state, action) => {
        state.ctes.loading = false;
        const updatedItem = action.payload.data || action.payload;
        const index = state.ctes.items.findIndex(item => item.id === updatedItem.id);
        if (index !== -1) {
          state.ctes.items[index] = updatedItem;
        }
      })
      .addCase(updateCte.rejected, (state, action) => {
        state.ctes.loading = false;
        state.ctes.error = action.payload;
      })
      .addCase(deleteCte.pending, (state) => {
        state.ctes.loading = true;
        state.ctes.error = null;
      })
      .addCase(deleteCte.fulfilled, (state, action) => {
        state.ctes.loading = false;
        state.ctes.items = state.ctes.items.filter(
          item => item.id !== action.payload.id
        );
      })
      .addCase(deleteCte.rejected, (state, action) => {
        state.ctes.loading = false;
        state.ctes.error = action.payload;
      })
      .addCase(getCteById.pending, (state) => {
        state.ctes.loading = true;
        state.ctes.error = null;
      })
      .addCase(getCteById.fulfilled, (state, action) => {
        state.ctes.loading = false;
        state.ctes.selectedItem = action.payload.data || action.payload;
      })
      .addCase(getCteById.rejected, (state, action) => {
        state.ctes.loading = false;
        state.ctes.error = action.payload;
      })

      // Medias
      .addCase(fetchMedias.pending, (state) => {
        state.medias.loading = true;
        state.medias.error = null;
      })
      .addCase(fetchMedias.fulfilled, (state, action) => {
        state.medias.loading = false;
        state.medias.items = action.payload.data || action.payload;
      })
      .addCase(fetchMedias.rejected, (state, action) => {
        state.medias.loading = false;
        state.medias.error = action.payload;
      })
      .addCase(addMedia.pending, (state) => {
        state.medias.loading = true;
        state.medias.error = null;
      })
      .addCase(addMedia.fulfilled, (state, action) => {
        state.medias.loading = false;
        state.medias.items.push(action.payload.data || action.payload);
      })
      .addCase(addMedia.rejected, (state, action) => {
        state.medias.loading = false;
        state.medias.error = action.payload;
      })
      .addCase(updateMedia.pending, (state) => {
        state.medias.loading = true;
        state.medias.error = null;
      })
      .addCase(updateMedia.fulfilled, (state, action) => {
        state.medias.loading = false;
        const updatedItem = action.payload.data || action.payload;
        const index = state.medias.items.findIndex(item => item.id === updatedItem.id);
        if (index !== -1) {
          state.medias.items[index] = updatedItem;
        }
      })
      .addCase(updateMedia.rejected, (state, action) => {
        state.medias.loading = false;
        state.medias.error = action.payload;
      })
      .addCase(deleteMedia.pending, (state) => {
        state.medias.loading = true;
        state.medias.error = null;
      })
      .addCase(deleteMedia.fulfilled, (state, action) => {
        state.medias.loading = false;
        state.medias.items = state.medias.items.filter(
          item => item.id !== action.payload.id
        );
      })
      .addCase(deleteMedia.rejected, (state, action) => {
        state.medias.loading = false;
        state.medias.error = action.payload;
      })
      .addCase(getMediaById.pending, (state) => {
        state.medias.loading = true;
        state.medias.error = null;
      })
      .addCase(getMediaById.fulfilled, (state, action) => {
        state.medias.loading = false;
        state.medias.selectedItem = action.payload.data || action.payload;
      })
      .addCase(getMediaById.rejected, (state, action) => {
        state.medias.loading = false;
        state.medias.error = action.payload;
      })
      // Séminaires Secteur
      // Ajouter aux extraReducers
      .addCase(fetchSeminairesSecteur.pending, (state) => {
        state.seminairesSecteur.loading = true;
        state.seminairesSecteur.error = null;
      })
      .addCase(fetchSeminairesSecteur.fulfilled, (state, action) => {
        state.seminairesSecteur.loading = false;
        state.seminairesSecteur.items = action.payload.data || action.payload;
      })
      .addCase(fetchSeminairesSecteur.rejected, (state, action) => {
        state.seminairesSecteur.loading = false;
        state.seminairesSecteur.error = action.payload;
      })
      .addCase(addSeminaireSecteur.pending, (state) => {
        state.seminairesSecteur.loading = true;
        state.seminairesSecteur.error = null;
      })
      .addCase(addSeminaireSecteur.fulfilled, (state, action) => {
        state.seminairesSecteur.loading = false;
        state.seminairesSecteur.items.push(action.payload.data || action.payload);
      })
      .addCase(addSeminaireSecteur.rejected, (state, action) => {
        state.seminairesSecteur.loading = false;
        state.seminairesSecteur.error = action.payload;
      })
      .addCase(updateSeminaireSecteur.pending, (state) => {
        state.seminairesSecteur.loading = true;
        state.seminairesSecteur.error = null;
      })
      .addCase(updateSeminaireSecteur.fulfilled, (state, action) => {
        state.seminairesSecteur.loading = false;
        const updatedItem = action.payload.data || action.payload;
        const index = state.seminairesSecteur.items.findIndex(item => item.id === updatedItem.id);
        if (index !== -1) {
          state.seminairesSecteur.items[index] = updatedItem;
        }
      })
      .addCase(updateSeminaireSecteur.rejected, (state, action) => {
        state.seminairesSecteur.loading = false;
        state.seminairesSecteur.error = action.payload;
      })
      .addCase(deleteSeminaireSecteur.pending, (state) => {
        state.seminairesSecteur.loading = true;
        state.seminairesSecteur.error = null;
      })
      .addCase(deleteSeminaireSecteur.fulfilled, (state, action) => {
        state.seminairesSecteur.loading = false;
        state.seminairesSecteur.items = state.seminairesSecteur.items.filter(
          item => item.id !== action.payload.id
        );
      })
      .addCase(deleteSeminaireSecteur.rejected, (state, action) => {
        state.seminairesSecteur.loading = false;
        state.seminairesSecteur.error = action.payload;
      })
      .addCase(getSeminaireSecteurById.pending, (state) => {
        state.seminairesSecteur.loading = true;
        state.seminairesSecteur.error = null;
      })
      .addCase(getSeminaireSecteurById.fulfilled, (state, action) => {
        state.seminairesSecteur.loading = false;
        state.seminairesSecteur.selectedItem = action.payload.data || action.payload;
      })
      .addCase(getSeminaireSecteurById.rejected, (state, action) => {
        state.seminairesSecteur.loading = false;
        state.seminairesSecteur.error = action.payload;
      })
      .addCase(fetchGroupes.pending, (state) => {
        state.groupes.loading = true;
        state.groupes.error = null;
      })
      .addCase(fetchGroupes.fulfilled, (state, action) => {
        state.groupes.loading = false;
        state.groupes.items = action.payload.data || action.payload;
      })
      .addCase(fetchGroupes.rejected, (state, action) => {
        state.groupes.loading = false;
        state.groupes.error = action.payload;
      })
      // Nationalités
      .addCase(fetchNationalites.pending, (state) => {
        state.nationalites.loading = true;
        state.nationalites.error = null;
      })
      .addCase(fetchNationalites.fulfilled, (state, action) => {
        state.nationalites.loading = false;
        state.nationalites.items = action.payload.data || action.payload;
      })
      .addCase(fetchNationalites.rejected, (state, action) => {
        state.nationalites.loading = false;
        state.nationalites.error = action.payload;
      })
      // Responsables Bureaux
      .addCase(fetchResponsablesBureaux.pending, (state) => {
        state.responsablesBureaux.loading = true;
        state.responsablesBureaux.error = null;
      })
      .addCase(fetchResponsablesBureaux.fulfilled, (state, action) => {
        state.responsablesBureaux.loading = false;
        state.responsablesBureaux.items = action.payload.data || action.payload;
      })
      .addCase(fetchResponsablesBureaux.rejected, (state, action) => {
        state.responsablesBureaux.loading = false;
        state.responsablesBureaux.error = action.payload;
      })
      .addCase(fetchVavSiege.pending, (state) => {
        state.vavSiege.loading = true;
        state.vavSiege.error = null;
      })
      .addCase(fetchVavSiege.fulfilled, (state, action) => {
        state.vavSiege.loading = false;
        state.vavSiege.items = action.payload.data || action.payload;
      })
      .addCase(fetchVavSiege.rejected, (state, action) => {
        state.vavSiege.loading = false;
        state.vavSiege.error = action.payload;
      })
      .addCase(fetchInitiateurs.pending, (state) => {
        state.initiateurs.loading = true;
        state.initiateurs.error = null;
      })
      .addCase(fetchInitiateurs.fulfilled, (state, action) => {
        state.initiateurs.loading = false;
        state.initiateurs.items = action.payload.data || action.payload;
      })
      .addCase(fetchInitiateurs.rejected, (state, action) => {
        state.initiateurs.loading = false;
        state.initiateurs.error = action.payload;
      })
      // Pays
      .addCase(fetchPays.pending, (state) => {
        state.pays.loading = true;
        state.pays.error = null;
      })
      .addCase(fetchPays.fulfilled, (state, action) => {
        state.pays.loading = false;
        state.pays.items = action.payload.data || action.payload;
      })
      .addCase(fetchPays.rejected, (state, action) => {
        state.pays.loading = false;
        state.pays.error = action.payload;
      })
      // Secteurs
      .addCase(fetchSecteurs.pending, (state) => {
        state.secteurs.loading = true;
        state.secteurs.error = null;
      })
      .addCase(fetchSecteurs.fulfilled, (state, action) => {
        state.secteurs.loading = false;
        state.secteurs.items = action.payload.data || action.payload;
      })
      .addCase(fetchSecteurs.rejected, (state, action) => {
        state.secteurs.loading = false;
        state.secteurs.error = action.payload;
      })
      // Binomes
      .addCase(fetchBinomes.pending, (state) => {
        state.binomes.loading = true;
        state.binomes.error = null;
      })
      .addCase(fetchBinomes.fulfilled, (state, action) => {
        state.binomes.loading = false;
        state.binomes.items = action.payload.data || action.payload;
      })
      .addCase(fetchBinomes.rejected, (state, action) => {
        state.binomes.loading = false;
        state.binomes.error = action.payload;
      })
      .addCase(fetchResponsableFipa.pending, (state) => {
        state.responsableFipa.loading = true;
        state.responsableFipa.error = null;
      })
      .addCase(fetchResponsableFipa.fulfilled, (state, action) => {
        state.responsableFipa.loading = false;
        state.responsableFipa.items = action.payload.data || action.payload;
      })
      .addCase(fetchResponsableFipa.rejected, (state, action) => {
        state.responsableFipa.loading = false;
        state.responsableFipa.error = action.payload;
      })
      // Salons Sectoriels
      .addCase(fetchSalonsSectoriels.pending, (state) => {
        state.salonsSectoriels.loading = true;
        state.salonsSectoriels.error = null;
      })
      .addCase(fetchSalonsSectoriels.fulfilled, (state, action) => {
        state.salonsSectoriels.loading = false;
        state.salonsSectoriels.items = action.payload.data || action.payload;
      })
      .addCase(fetchSalonsSectoriels.rejected, (state, action) => {
        state.salonsSectoriels.loading = false;
        state.salonsSectoriels.error = action.payload;
      })
      .addCase(addSalonSectoriel.pending, (state) => {
        state.salonsSectoriels.loading = true;
        state.salonsSectoriels.error = null;
      })
      .addCase(addSalonSectoriel.fulfilled, (state, action) => {
        state.salonsSectoriels.loading = false;
        state.salonsSectoriels.items.push(action.payload.data || action.payload);
      })
      .addCase(addSalonSectoriel.rejected, (state, action) => {
        state.salonsSectoriels.loading = false;
        state.salonsSectoriels.error = action.payload;
      })
      .addCase(updateSalonSectoriel.pending, (state) => {
        state.salonsSectoriels.loading = true;
        state.salonsSectoriels.error = null;
      })
      .addCase(updateSalonSectoriel.fulfilled, (state, action) => {
        state.salonsSectoriels.loading = false;
        const updatedItem = action.payload.data || action.payload;
        const index = state.salonsSectoriels.items.findIndex(item => item.id === updatedItem.id);
        if (index !== -1) {
          state.salonsSectoriels.items[index] = updatedItem;
        }
      })
      .addCase(updateSalonSectoriel.rejected, (state, action) => {
        state.salonsSectoriels.loading = false;
        state.salonsSectoriels.error = action.payload;
      })
      .addCase(deleteSalonSectoriel.pending, (state) => {
        state.salonsSectoriels.loading = true;
        state.salonsSectoriels.error = null;
      })
      .addCase(deleteSalonSectoriel.fulfilled, (state, action) => {
        state.salonsSectoriels.loading = false;
        state.salonsSectoriels.items = state.salonsSectoriels.items.filter(
          item => item.id !== action.payload.id
        );
      })
      .addCase(deleteSalonSectoriel.rejected, (state, action) => {
        state.salonsSectoriels.loading = false;
        state.salonsSectoriels.error = action.payload;
      })
      .addCase(getSalonSectorielById.pending, (state) => {
        state.salonsSectoriels.loading = true;
        state.salonsSectoriels.error = null;
      })
      .addCase(getSalonSectorielById.fulfilled, (state, action) => {
        state.salonsSectoriels.loading = false;
        state.salonsSectoriels.selectedItem = action.payload.data || action.payload;
      })
      .addCase(getSalonSectorielById.rejected, (state, action) => {
        state.salonsSectoriels.loading = false;
        state.salonsSectoriels.error = action.payload;
      })
      // Démarchage Direct
      .addCase(fetchDemarchagesDirect.pending, (state) => {
        state.demarchagesDirect.loading = true;
        state.demarchagesDirect.error = null;
      })
      .addCase(fetchDemarchagesDirect.fulfilled, (state, action) => {
        state.demarchagesDirect.loading = false;
        state.demarchagesDirect.items = action.payload.data || action.payload;
      })
      .addCase(fetchDemarchagesDirect.rejected, (state, action) => {
        state.demarchagesDirect.loading = false;
        state.demarchagesDirect.error = action.payload;
      })
      .addCase(addDemarchageDirect.pending, (state) => {
        state.demarchagesDirect.loading = true;
        state.demarchagesDirect.error = null;
      })
      .addCase(addDemarchageDirect.fulfilled, (state, action) => {
        state.demarchagesDirect.loading = false;
        state.demarchagesDirect.items.push(action.payload.data || action.payload);
      })
      .addCase(addDemarchageDirect.rejected, (state, action) => {
        state.demarchagesDirect.loading = false;
        state.demarchagesDirect.error = action.payload;
      })
      .addCase(updateDemarchageDirect.pending, (state) => {
        state.demarchagesDirect.loading = true;
        state.demarchagesDirect.error = null;
      })
      .addCase(updateDemarchageDirect.fulfilled, (state, action) => {
        state.demarchagesDirect.loading = false;
        const updatedItem = action.payload.data || action.payload;
        const index = state.demarchagesDirect.items.findIndex(item => item.id === updatedItem.id);
        if (index !== -1) {
          state.demarchagesDirect.items[index] = updatedItem;
        }
      })
      .addCase(updateDemarchageDirect.rejected, (state, action) => {
        state.demarchagesDirect.loading = false;
        state.demarchagesDirect.error = action.payload;
      })
      .addCase(deleteDemarchageDirect.pending, (state) => {
        state.demarchagesDirect.loading = true;
        state.demarchagesDirect.error = null;
      })
      .addCase(deleteDemarchageDirect.fulfilled, (state, action) => {
        state.demarchagesDirect.loading = false;
        state.demarchagesDirect.items = state.demarchagesDirect.items.filter(
          item => item.id !== action.payload.id
        );
      })
      .addCase(deleteDemarchageDirect.rejected, (state, action) => {
        state.demarchagesDirect.loading = false;
        state.demarchagesDirect.error = action.payload;
      })
      .addCase(getDemarchageDirectById.pending, (state) => {
        state.demarchagesDirect.loading = true;
        state.demarchagesDirect.error = null;
      })
      .addCase(getDemarchageDirectById.fulfilled, (state, action) => {
        state.demarchagesDirect.loading = false;
        state.demarchagesDirect.selectedItem = action.payload.data || action.payload;
      })
      .addCase(getDemarchageDirectById.rejected, (state, action) => {
        state.demarchagesDirect.loading = false;
        state.demarchagesDirect.error = action.payload;
      })
      // Délégations
      .addCase(fetchDelegations.pending, (state) => {
        state.delegations.loading = true;
        state.delegations.error = null;
      })
      .addCase(fetchDelegations.fulfilled, (state, action) => {
        state.delegations.loading = false;
        state.delegations.items = action.payload.data || action.payload;
      })
      .addCase(fetchDelegations.rejected, (state, action) => {
        state.delegations.loading = false;
        state.delegations.error = action.payload;
      })
      .addCase(addDelegation.pending, (state) => {
        state.delegations.loading = true;
        state.delegations.error = null;
      })
      .addCase(addDelegation.fulfilled, (state, action) => {
        state.delegations.loading = false;
        state.delegations.items.push(action.payload.data || action.payload);
      })
      .addCase(addDelegation.rejected, (state, action) => {
        state.delegations.loading = false;
        state.delegations.error = action.payload;
      })
      .addCase(updateDelegation.pending, (state) => {
        state.delegations.loading = true;
        state.delegations.error = null;
      })
      .addCase(updateDelegation.fulfilled, (state, action) => {
        state.delegations.loading = false;
        const updatedItem = action.payload.data || action.payload;
        const index = state.delegations.items.findIndex(item => item.id === updatedItem.id);
        if (index !== -1) {
          state.delegations.items[index] = updatedItem;
        }
      })
      .addCase(updateDelegation.rejected, (state, action) => {
        state.delegations.loading = false;
        state.delegations.error = action.payload;
      })
      .addCase(deleteDelegation.pending, (state) => {
        state.delegations.loading = true;
        state.delegations.error = null;
      })
      .addCase(deleteDelegation.fulfilled, (state, action) => {
        state.delegations.loading = false;
        state.delegations.items = state.delegations.items.filter(
          item => item.id !== action.payload.id
        );
      })
      .addCase(deleteDelegation.rejected, (state, action) => {
        state.delegations.loading = false;
        state.delegations.error = action.payload;
      })
      .addCase(getDelegationById.pending, (state) => {
        state.delegations.loading = true;
        state.delegations.error = null;
      })
      .addCase(getDelegationById.fulfilled, (state, action) => {
        state.delegations.loading = false;
        state.delegations.selectedItem = action.payload.data || action.payload;
      })
      .addCase(getDelegationById.rejected, (state, action) => {
        state.delegations.loading = false;
        state.delegations.error = action.payload;
      })
      // Visites Entreprise
      .addCase(fetchVisitesEntreprise.pending, (state) => {
        state.visitesEntreprise.loading = true;
        state.visitesEntreprise.error = null;
      })
      .addCase(fetchVisitesEntreprise.fulfilled, (state, action) => {
        state.visitesEntreprise.loading = false;
        state.visitesEntreprise.items = action.payload.data || action.payload;
      })
      .addCase(fetchVisitesEntreprise.rejected, (state, action) => {
        state.visitesEntreprise.loading = false;
        state.visitesEntreprise.error = action.payload;
      })
      .addCase(addVisiteEntreprise.pending, (state) => {
        state.visitesEntreprise.loading = true;
        state.visitesEntreprise.error = null;
      })
      .addCase(addVisiteEntreprise.fulfilled, (state, action) => {
        state.visitesEntreprise.loading = false;
        state.visitesEntreprise.items.push(action.payload.data || action.payload);
      })
      .addCase(addVisiteEntreprise.rejected, (state, action) => {
        state.visitesEntreprise.loading = false;
        state.visitesEntreprise.error = action.payload;
      })
      .addCase(updateVisiteEntreprise.pending, (state) => {
        state.visitesEntreprise.loading = true;
        state.visitesEntreprise.error = null;
      })
      .addCase(updateVisiteEntreprise.fulfilled, (state, action) => {
        state.visitesEntreprise.loading = false;
        const updatedItem = action.payload.data || action.payload;
        const index = state.visitesEntreprise.items.findIndex(item => item.id === updatedItem.id);
        if (index !== -1) {
          state.visitesEntreprise.items[index] = updatedItem;
        }
      })
      .addCase(updateVisiteEntreprise.rejected, (state, action) => {
        state.visitesEntreprise.loading = false;
        state.visitesEntreprise.error = action.payload;
      })
      .addCase(deleteVisiteEntreprise.pending, (state) => {
        state.visitesEntreprise.loading = true;
        state.visitesEntreprise.error = null;
      })
      .addCase(deleteVisiteEntreprise.fulfilled, (state, action) => {
        state.visitesEntreprise.loading = false;
        state.visitesEntreprise.items = state.visitesEntreprise.items.filter(
          item => item.id !== action.payload.id
        );
      })
      .addCase(deleteVisiteEntreprise.rejected, (state, action) => {
        state.visitesEntreprise.loading = false;
        state.visitesEntreprise.error = action.payload;
      })
      .addCase(getVisiteEntrepriseById.pending, (state) => {
        state.visitesEntreprise.loading = true;
        state.visitesEntreprise.error = null;
      })
      .addCase(getVisiteEntrepriseById.fulfilled, (state, action) => {
        state.visitesEntreprise.loading = false;
        state.visitesEntreprise.selectedItem = action.payload.data || action.payload;
      })
      .addCase(getVisiteEntrepriseById.rejected, (state, action) => {
        state.visitesEntreprise.loading = false;
        state.visitesEntreprise.error = action.payload;
      })
      .addCase(fetchResponsableSuivi.pending, (state) => {
        state.responsableSuivi.loading = true;
        state.responsableSuivi.error = null;
      })
      .addCase(fetchResponsableSuivi.fulfilled, (state, action) => {
        state.responsableSuivi.loading = false;
        state.responsableSuivi.items = action.payload.data || action.payload;
      })
      .addCase(fetchResponsableSuivi.rejected, (state, action) => {
        state.responsableSuivi.loading = false;
        state.responsableSuivi.error = action.payload;
      })
      .addCase(fetchActions.pending, (state) => {
        state.actions.loading = true;
        state.actions.error = null;
      })
      .addCase(fetchActions.fulfilled, (state, action) => {
        state.actions.loading = false;
        state.actions.items = action.payload.data || []; // Assurez-vous de toujours avoir un tableau
        state.actions.error = null;
      })
      .addCase(fetchActions.rejected, (state, action) => {
        state.actions.loading = false;
        state.actions.error = action.payload;
      })
      .addCase(addAction.pending, (state) => {
        state.actions.loading = true;
        state.actions.error = null;
      })
      .addCase(addAction.fulfilled, (state, action) => {
        state.actions.loading = false;
        
        // Vérifier si items est un tableau, sinon l'initialiser
        if (!Array.isArray(state.actions.items)) {
          state.actions.items = [];
        }
        
        // Ensuite ajouter l'élément
        state.actions.items.push(action.payload.data || action.payload);
      })
      .addCase(addAction.rejected, (state, action) => {
        state.actions.loading = false;
        state.actions.error = action.payload;
      })
      .addCase(updateAction.pending, (state) => {
        state.actions.loading = true;
        state.actions.error = null;
      })
      .addCase(updateAction.fulfilled, (state, action) => {
        state.actions.loading = false;
        const updatedItem = action.payload.data || action.payload;
        const index = state.actions.items.findIndex(item => item.id === updatedItem.id);
        if (index !== -1) {
          state.actions.items[index] = updatedItem;
        }
      })
      .addCase(updateAction.rejected, (state, action) => {
        state.actions.loading = false;
        state.actions.error = action.payload;
      })
      .addCase(deleteAction.pending, (state) => {
        state.actions.loading = true;
        state.actions.error = null;
      })
      .addCase(deleteAction.fulfilled, (state, action) => {
        state.actions.loading = false;
        state.actions.items = state.actions.items.filter(
          item => item.id !== action.payload.id
        );
      })
      .addCase(deleteAction.rejected, (state, action) => {
        state.actions.loading = false;
        state.actions.error = action.payload;
      })
      .addCase(getActionById.pending, (state) => {
        state.actions.loading = true;
        state.actions.error = null;
      })
      .addCase(getActionById.fulfilled, (state, action) => {
        state.actions.loading = false;
        state.actions.selectedItem = action.payload.data || action.payload;
      })
      .addCase(getActionById.rejected, (state, action) => {
        state.actions.loading = false;
        state.actions.error = action.payload;
      })
      .addCase(updateActionStatus.pending, (state) => {
        state.actions.loading = true;
        state.actions.error = null;
      })
      .addCase(updateActionStatus.fulfilled, (state, action) => {
        state.actions.loading = false;
        const updatedItem = action.payload.data || action.payload;
        const index = state.actions.items.findIndex(item => item.id === updatedItem.id);
        if (index !== -1) {
          state.actions.items[index] = updatedItem;
        }
        // Optionnel : mettre à jour selectedItem si c'est celui modifié
        if (state.actions.selectedItem && state.actions.selectedItem.id === updatedItem.id) {
          state.actions.selectedItem = updatedItem;
        }
      })
      .addCase(updateActionStatus.rejected, (state, action) => {
        state.actions.loading = false;
        state.actions.error = action.payload;
      });


  },
});

export const { clearErrors, resetSelectedItem } = marketingSlice.actions;

export default marketingSlice.reducer;