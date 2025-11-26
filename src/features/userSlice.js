import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axios from 'axios';
import { redirect } from 'react-router-dom';
const API_BASE_URL = 'http://127.0.0.1:8000/api';


// 👉 Définition de l'asyncThunk pour la connexion
export const login = createAsyncThunk("user/login", async (data, { rejectWithValue }) => {
  try {
    const response = await axios.post("http://127.0.0.1:8000/api/auth/login", data);
    console.log('Réponse reçue:', response.data);

    // Vérifier si l'authentification à deux facteurs est requise
    if (response.data.requires_2fa) {
      console.log('Authentification à deux facteurs requise');

      // Stocker le token temporaire dans localStorage
      localStorage.setItem("temp_token", response.data.temp_token);
      localStorage.setItem("user_email", response.data.user_email || data.email);

      // Retourner les informations pour la redirection 2FA
      return {
        requires_2fa: true,
        temp_token: response.data.temp_token,
        user_email: response.data.user_email || data.email
      };
    }

    // Pour l'authentification standard (sans 2FA)
    const accessToken = response.data.access_token;
    if (!accessToken) {
      throw new Error("Aucun token reçu dans la réponse");
    }

    // Sauvegarder le token dans le localStorage
    localStorage.setItem("token", accessToken);

    // Si la réponse contient des infos utilisateur, les stocker aussi
    if (response.data.user) {
      localStorage.setItem("user", JSON.stringify(response.data.user));
    }

    // Retourner les données utilisateur et le token
    return {
      token: accessToken,
      user: response.data.user || { email: data.email },
      requires_2fa: false
    };
  } catch (error) {
    console.error("Erreur Axios:", error);
    return rejectWithValue(error.response?.data || "Une erreur s'est produite");
  }
});
export const logout = createAsyncThunk("user/logout", async (_, { rejectWithValue }) => {
  try {
    const token = localStorage.getItem("token");

    if (!token) {
      throw new Error("Aucun token trouvé dans le localStorage");
    }
    await axios.get("http://127.0.0.1:8000/api/auth/logout", {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
    });
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("temp_token");
    localStorage.removeItem("user_email");
    sessionStorage.removeItem('temp_2fa_qr');
    sessionStorage.removeItem('temp_2fa_secret');
    sessionStorage.removeItem('temp_2fa_user_id');

    return { message: "Déconnexion réussie" };
  } catch (error) {
    console.error("Erreur Axios:", error);

    if (error.response) {
      return rejectWithValue(error.response.data);
    }
    return rejectWithValue({ message: "Une erreur s'est produite lors de la déconnexion" });
  }
});
export const register = createAsyncThunk(
  "user/register",
  async (data, { rejectWithValue }) => {
    try {
      const raw =
        localStorage.getItem("token") ||
        JSON.parse(localStorage.getItem("user") || "{}")?.token ||
        "";
      const token = String(raw).replace(/^Bearer\s+/i, "");

      if (!token) {
        return rejectWithValue({ message: "Token d'authentification non disponible" });
      }

      const response = await axios.post(
        `${API_BASE_URL}/auth/register`,
        data,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          withCredentials: false, // n'envoie pas les cookies
        }
      );

      return response.data?.data || response.data?.user || response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: error.message || "Une erreur s'est produite" });
    }
  }
);
export const forgotPassword = createAsyncThunk(
  "user/forgotPassword",
  async (email, { rejectWithValue }) => {
    try {
      const response = await axios.post("http://127.0.0.1:8000/api/auth/forgot-password", { email });
      console.log("Réponse reçue:", response.data);
      return response.data; // Retourner la réponse de l'API
    } catch (error) {
      console.error("Erreur Axios:", error);
      return rejectWithValue(error.response?.data || "Une erreur s'est produite");
    }
  }
);
export const changePassword = createAsyncThunk(
  "user/changePassword",
  async (passwordData, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        throw new Error("Aucun token trouvé dans le localStorage");
      }

      const response = await axios.post(
        "http://127.0.0.1:8000/api/auth/change-password",
        passwordData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        }
      );
      console.log('Mot de passe changé avec succès:', response.data);
      return response.data;
    } catch (error) {
      console.error("Erreur lors du changement de mot de passe:", error);
      return rejectWithValue(error.response?.data || "Une erreur s'est produite lors du changement de mot de passe");
    }
  }
);
// Ajouter cette nouvelle fonction dans userSlice.js
export const verifyTwoFactor = createAsyncThunk(
  "user/verifyTwoFactor",
  async ({ code, tempToken }, { rejectWithValue }) => {
    try {
      const config = {
        headers: {
          'Authorization': `Bearer ${tempToken}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      };

      const response = await axios.post(
        "http://127.0.0.1:8000/api/auth/verify-login-2fa",
        { code: parseInt(code, 10) },
        config
      );

      console.log('Réponse vérification 2FA:', response.data);

      // Après vérification réussie, on nettoie les tokens temporaires
      localStorage.removeItem("temp_token");
      localStorage.removeItem("user_email");

      // Et on stocke le vrai token d'accès
      localStorage.setItem("token", response.data.access_token);

      // Si la réponse contient des infos utilisateur, les stocker aussi
      if (response.data.user) {
        localStorage.setItem("user", JSON.stringify(response.data.user));
      }

      return {
        token: response.data.access_token,
        user: response.data.user
      };
    } catch (error) {
      console.error("Erreur lors de la vérification 2FA:", error);
      return rejectWithValue(error.response?.data || "Erreur lors de la vérification du code");
    }

  }


);
// Ajouter cette nouvelle fonction async thunk
export const getCurrentUser = createAsyncThunk(
  'user/getCurrentUser',
  async (_, { rejectWithValue }) => {
    try {
      // Récupérer le token depuis localStorage
      const token = localStorage.getItem('token');

      if (!token) {
        return rejectWithValue('Token d\'authentification non disponible');
      }

      // Appeler l'API pour récupérer les informations de l'utilisateur connecté
      const response = await axios.get('http://127.0.0.1:8000/api/auth/user', {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json'
        }
      });

      // Si la réponse contient des infos utilisateur, les stocker aussi
      if (response.data.user || response.data.data) {
        const userData = response.data.user || response.data.data;
        localStorage.setItem('user', JSON.stringify(userData));
        return userData;
      }

      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération du profil:', error);

      // Si la demande échoue avec une erreur 401, c'est que le token est invalide/expiré
      if (error.response && error.response.status === 401) {
        // Nettoyer localStorage pour forcer une nouvelle connexion
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }

      return rejectWithValue(
        error.response?.data || 'Erreur lors de la récupération du profil utilisateur'
      );
    }
  }
);

export const fetchAllUsers = createAsyncThunk(
  'users/fetchAll',
  async (_, { rejectWithValue, getState }) => {
    try {
      // Récupérer le token depuis le state ou localStorage
      const token = getState().user.token || localStorage.getItem('token');

      if (!token) {
        return rejectWithValue('Token d\'authentification non disponible');
      }

      const response = await axios.get(`http://127.0.0.1:8000/api/auth/users`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || 'Erreur lors de la récupération des utilisateurs'
      );
    }
  }
);
export const fetchMe = createAsyncThunk(
  'user/fetchMe',
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return rejectWithValue('Token d\'authentification non disponible');

      const { data } = await axios.get(`${API_BASE_URL}/users/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Persister dans localStorage
      localStorage.setItem('user', JSON.stringify(data));
      return data;
    } catch (error) {
      if (error.response?.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
      return rejectWithValue(error.response?.data || 'Erreur lors de la récupération du profil');
    }
  }
);

// Mettre à jour le profil (infos personnelles + photo) /users/me/profile
// 👉 CORRECTION: Améliorer updateMyProfile pour suivre la logique des companies
export const updateMyProfile = createAsyncThunk(
  'user/updateMyProfile',
  async (payload, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return rejectWithValue('Token d\'authentification non disponible');

      console.log('Token utilisé:', token);
      console.log('Payload envoyé:', payload);

      // 👉 CORRECTION: Vérifier si c'est un FormData (photo) ou des données normales
      const isFormData = payload instanceof FormData;
      
      // 👉 CORRECTION: Configuration headers comme dans companiesSlice
      const headers = {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json',
        // Ne pas définir Content-Type pour FormData, laisser axios le faire automatiquement
        ...(isFormData ? {} : { 'Content-Type': 'application/json' })
      };

      // 👉 CORRECTION: Utiliser POST avec _method si FormData (comme updateCompany)
      let response;
      if (isFormData) {
        // Pour les uploads de fichiers, utiliser POST avec _method (comme companies)
        response = await axios.post(
          `${API_BASE_URL}/users/me/profile`,
          payload,
          { headers }
        );
      } else {
        // Pour les données normales, utiliser PUT
        response = await axios.put(
          `${API_BASE_URL}/users/me/profile`,
          payload,
          { headers }
        );
      }

      console.log('Réponse du serveur:', response.data);

      // 👉 CORRECTION: Traitement de la réponse (même logique que companies)
      let userData;
      if (response.data?.success && response.data?.user) {
        userData = response.data.user;
      } else if (response.data?.data) {
        userData = response.data.data;
      } else if (response.data?.user) {
        userData = response.data.user;
      } else {
        userData = response.data;
      }

      // 👉 CORRECTION: Mettre à jour le localStorage avec les nouvelles données
      if (userData) {
        const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
        const updatedUser = { ...currentUser, ...userData };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        return updatedUser;
      }

      return userData || response.data;
    } catch (error) {
      console.error('Erreur updateMyProfile:', error);
      console.error('Réponse d\'erreur:', error.response?.data);
      
      return rejectWithValue(
        error.response?.data || 'Erreur lors de la mise à jour du profil'
      );
    }
  }
);


// ---------------------------
// APIs Admin utilisateurs (/api/users/*)
// ---------------------------

// Liste paginée + recherche
export const fetchUsers = createAsyncThunk(
  'user/fetchUsers',
  async ({ q = '', page = 1, per_page = 15 } = {}, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return rejectWithValue('Token d\'authentification non disponible');

      const { data } = await axios.get(`${API_BASE_URL}/users/all`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { q, page, per_page }
      });

      return data; // Paginator Laravel
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Erreur lors du chargement des utilisateurs');
    }
  }
);

// Détail utilisateur
export const fetchUserById = createAsyncThunk(
  'user/fetchUserById',
  async (id, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return rejectWithValue('Token d\'authentification non disponible');

      // Note: routes fournies => prefix 'users' + 'users/{id}'
      const { data } = await axios.get(`${API_BASE_URL}/users/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Erreur lors du chargement de l’utilisateur');
    }
  }
);

// Création utilisateur
export const createUser = createAsyncThunk(
  'user/createUser',
  async (payload, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return rejectWithValue('Token d\'authentification non disponible');

      const { data } = await axios.post(`${API_BASE_URL}/users`, payload, {
        headers: { Authorization: `Bearer ${token}` }
      });

      return data.user || data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Erreur lors de la création de l’utilisateur');
    }
  }
);

// Mise à jour utilisateur
export const updateUserById = createAsyncThunk(
  'user/updateUserById',
  async ({ id, payload }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return rejectWithValue('Token d\'authentification non disponible');

      const { data } = await axios.put(`${API_BASE_URL}/users/${id}`, payload, {
        headers: { Authorization: `Bearer ${token}` }
      });

      return data.user || data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Erreur lors de la mise à jour de l’utilisateur');
    }
  }
);

// Suppression utilisateur
export const deleteUserById = createAsyncThunk(
  'user/deleteUserById',
  async (id, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return rejectWithValue('Token d\'authentification non disponible');

      const { data } = await axios.delete(`${API_BASE_URL}/users/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      return { id, message: data?.message || 'Utilisateur supprimé' };
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Erreur lors de la suppression de l’utilisateur');
    }
  }
);

// Assigner des rôles
export const assignRoles = createAsyncThunk(
  'user/assignRoles',
  async ({ id, roles }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return rejectWithValue('Token d\'authentification non disponible');

      const { data } = await axios.post(`${API_BASE_URL}/users/${id}/roles`, { roles }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      return { id, roles: data.roles };
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Erreur lors de l’assignation des rôles');
    }
  }
);

// Assigner des permissions
export const assignPermissions = createAsyncThunk(
  'user/assignPermissions',
  async ({ id, permissions }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return rejectWithValue('Token d\'authentification non disponible');

      const { data } = await axios.post(`${API_BASE_URL}/users/${id}/permissions`, { permissions }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      return { id, permissions: data.permissions };
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Erreur lors de l’assignation des permissions');
    }
  }
);
export const fetchMyActions = createAsyncThunk(
  'user/fetchMyActions',
  async (params = {}, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return rejectWithValue('Token d\'authentification non disponible');

      const queryParams = new URLSearchParams();
      
      // Paramètres de filtrage
      if (params.statut) queryParams.append('statut', params.statut);
      if (params.type) queryParams.append('type', params.type);
      if (params.periode) queryParams.append('periode', params.periode);
      
      // Paramètres de tri
      if (params.sort_by) queryParams.append('sort_by', params.sort_by);
      if (params.sort_direction) queryParams.append('sort_direction', params.sort_direction);
      
      // Pagination
      if (params.page) queryParams.append('page', params.page);
      if (params.per_page) queryParams.append('per_page', params.per_page);

      const { data } = await axios.get(
        `${API_BASE_URL}/users/me/actions?${queryParams.toString()}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      return data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || 'Erreur lors du chargement de mes actions'
      );
    }
  }
);

// Récupérer les statistiques des actions de l'utilisateur connecté
export const fetchMyActionsStats = createAsyncThunk(
  'user/fetchMyActionsStats',
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return rejectWithValue('Token d\'authentification non disponible');

      const { data } = await axios.get(
        `${API_BASE_URL}/users/me/actions/stats`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      return data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || 'Erreur lors du chargement des statistiques'
      );
    }
  }
);

const userSlice = createSlice({
  name: 'user',
  initialState: {
    user: null,
    users: [],
    list: [],
    token: localStorage.getItem('token'),
    temp_token: localStorage.getItem('temp_token'), // Ajouter ceci
    isAuthenticated: !!localStorage.getItem('token'),
    isRegistered: false,
    loading: false,
    error: null,
    registerForm: {
      name: "",
      email: "",
      password: "",
      password_confirmation: "",
    },
     profileUpdating: false,
    usersPage: null,          
    selectedUser: null, 
    myActions: {
      items: [],
      pagination: null,
      loading: false,
      error: null
    },
    myActionsStats: {
      data: null,
      loading: false,
      error: null
    },
  },
  
  reducers: {
        logoutSync: (state) => {
        state.user = null;
        state.isAuthenticated = false;
        state.token = null;
        state.error = null;
        localStorage.removeItem("token");
        localStorage.removeItem("user");
    },
    login: (state, action) => {
      state.user = action.payload.user; // Stocker les données utilisateur
      state.token = action.payload.token; // Stocker le token
      state.isAuthenticated = true;
      state.error = null;
    }

  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        // Vérifier si c'est une réponse 2FA ou une connexion standard
        if (action.payload.requires_2fa) {
          // Pour 2FA: stocker le token temporaire mais ne pas authentifier complètement
          state.temp_token = action.payload.temp_token;
          // Ne pas modifier isAuthenticated car l'authentification n'est pas complète
        } else {
          // Pour connexion standard: mettre à jour tous les champs
          state.user = action.payload.user;
          state.token = action.payload.token;
          state.isAuthenticated = true;
        }
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload; // Stocker l'erreur
      })
      .addCase(logout.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(logout.fulfilled, (state, action) => {
        state.loading = false;
        state.user = null;
        state.isAuthenticated = false;
      })
      .addCase(logout.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(register.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.isRegistered = true;
        state.registerForm = {
          name: "",
          email: "",
          password: "",
          password_confirmation: "",
        };
      })
      .addCase(register.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(forgotPassword.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(forgotPassword.fulfilled, (state, action) => {
        state.loading = false;
        console.log("E-mail de réinitialisation envoyé:", action.payload);
      })
      .addCase(forgotPassword.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(verifyTwoFactor.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(verifyTwoFactor.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
        state.temp_token = null; // Effacer le token temporaire
      })
      .addCase(verifyTwoFactor.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(changePassword.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(changePassword.fulfilled, (state, action) => {
        state.loading = false;
        state.passwordChanged = true;
      })
      .addCase(changePassword.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchAllUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllUsers.fulfilled, (state, action) => {
        state.list = action.payload;
        state.loading = false;
      })
      .addCase(fetchAllUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Ajouter ces cas dans le builder des extraReducers
      .addCase(getCurrentUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getCurrentUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
      })
     .addCase(getCurrentUser.rejected, (state, action) => {
    state.loading = false;

    // Token invalide → déconnexion totale
    state.isAuthenticated = false;
    state.user = null;
    state.token = null;

    localStorage.removeItem("token");
    localStorage.removeItem("user");

    state.error = action.payload || "Unauthenticated";
})
      .addCase(fetchMe.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMe.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
      })
      .addCase(fetchMe.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.isAuthenticated = false;
        state.user = null;
      })

      // Update profil
      .addCase(updateMyProfile.pending, (state) => {
  state.profileUpdating = true;
})
.addCase(updateMyProfile.fulfilled, (state, action) => {
  state.profileUpdating = false;
  state.user = { ...state.user, ...action.payload };
})
.addCase(updateMyProfile.rejected, (state, action) => {
  state.profileUpdating = false;
  state.error = action.payload;
})

      // Admin: liste paginée
      .addCase(fetchUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.usersPage = action.payload; // { data: [...], current_page, total, ... }
        state.users = action.payload?.data || [];
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Admin: détail
      .addCase(fetchUserById.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.selectedUser = null;
      })
      .addCase(fetchUserById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedUser = action.payload;
      })
      .addCase(fetchUserById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Admin: création
      .addCase(createUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createUser.fulfilled, (state, action) => {
        state.loading = false;
        // insérer en tête si la liste actuelle existe
        if (state.users) state.users.unshift(action.payload);
      })
      .addCase(createUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Admin: mise à jour
      .addCase(updateUserById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateUserById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedUser = action.payload;
        state.users = state.users.map(u => u.id === action.payload.id ? action.payload : u);
      })
      .addCase(updateUserById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Admin: suppression
      .addCase(deleteUserById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteUserById.fulfilled, (state, action) => {
        state.loading = false;
        state.users = state.users.filter(u => u.id !== action.payload.id);
        if (state.selectedUser?.id === action.payload.id) state.selectedUser = null;
      })
      .addCase(deleteUserById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Admin: assign rôles
      .addCase(assignRoles.fulfilled, (state, action) => {
        const { id, roles } = action.payload;
        if (state.selectedUser?.id === id) {
          state.selectedUser.roles_list = roles;
        }
        state.users = state.users.map(u => u.id === id ? { ...u, roles_list: roles } : u);
      })
      // Admin: assign permissions
      .addCase(assignPermissions.fulfilled, (state, action) => {
        const { id, permissions } = action.payload;
        if (state.selectedUser?.id === id) {
          state.selectedUser.permissions_list = permissions;
        }
        state.users = state.users.map(u => u.id === id ? { ...u, permissions_list: permissions } : u);
      })
      .addCase(fetchMyActions.pending, (state) => {
        state.myActions.loading = true;
        state.myActions.error = null;
      })
      .addCase(fetchMyActions.fulfilled, (state, action) => {
        state.myActions.loading = false;
        state.myActions.items = action.payload.data?.data || [];
        state.myActions.pagination = {
          current_page: action.payload.data?.current_page,
          last_page: action.payload.data?.last_page,
          per_page: action.payload.data?.per_page,
          total: action.payload.data?.total
        };
      })
      .addCase(fetchMyActions.rejected, (state, action) => {
        state.myActions.loading = false;
        state.myActions.error = action.payload;
      })

      // 👉 NOUVEAU: Statistiques de mes actions
      .addCase(fetchMyActionsStats.pending, (state) => {
        state.myActionsStats.loading = true;
        state.myActionsStats.error = null;
      })
      .addCase(fetchMyActionsStats.fulfilled, (state, action) => {
        state.myActionsStats.loading = false;
        state.myActionsStats.data = action.payload.data;
      })
      .addCase(fetchMyActionsStats.rejected, (state, action) => {
        state.myActionsStats.loading = false;
        state.myActionsStats.error = action.payload;
      });
  
  },
});
export default userSlice.reducer;
