import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axios from 'axios';
import { redirect } from 'react-router-dom';

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
export const register = createAsyncThunk("user/register", async (data, { rejectWithValue }) => {
  try {
    const response = await axios.post("http://127.0.0.1:8000/api/auth/register", data);
    console.log('Réponse reçue:', response.data);
    return response.data;
  } catch (error) {
    console.error("Erreur Axios:", error);
    return rejectWithValue(error.response?.data || "Une erreur s'est produite");
  }
});
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
  },
  reducers: {
    logout: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.error = null;
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
        state.error = action.payload;
        // En cas d'erreur 401, déconnecter l'utilisateur
        if (action.payload && (
          action.payload.message === 'Unauthenticated.' ||
          action.payload.status === 401
        )) {
          state.isAuthenticated = false;
          state.user = null;
        }
      });
  },
});
export default userSlice.reducer;
