import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

// Base URL pour les API de tâches
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

// =========== Récupérer toutes les tâches ===========
export const fetchTasks = createAsyncThunk(
  "tasks/fetchTasks",
  async (params = {}, { rejectWithValue }) => {
    try {
      const queryParams = new URLSearchParams();
      Object.keys(params).forEach((key) => {
        if (params[key] !== undefined && params[key] !== null && params[key] !== '') {
          queryParams.append(key, params[key]);
        }
      });

      // Ajouter les paramètres de filtrage
      if (params.status) queryParams.append('status', params.status);
      if (params.priority) queryParams.append('priority', params.priority);
      if (params.type) queryParams.append('type', params.type);
      if (params.start_date) queryParams.append('start_date', params.start_date);
      if (params.end_date) queryParams.append('end_date', params.end_date);
      if (params.assignee_id) queryParams.append('assignee_id', params.assignee_id);
      if (params.user_id) queryParams.append('user_id', params.user_id);
      if (params.sort_field) queryParams.append('sort_field', params.sort_field);
      if (params.sort_direction) queryParams.append('sort_direction', params.sort_direction);
      if (params.per_page) queryParams.append('per_page', params.per_page);
      if (params.page) queryParams.append('page', params.page);

      const url = queryParams.toString()
        ? `${API_BASE_URL}/tasks/all?${queryParams.toString()}`
        : `${API_BASE_URL}/tasks/all`;

      const response = await axios.get(url, getAuthHeader());
      return response.data;
    } catch (error) {
      console.error("Erreur lors du chargement des tâches:", error);
      return rejectWithValue(error.response?.data || "Une erreur s'est produite");
    }
  }
);

// =========== Créer une nouvelle tâche ===========
export const createTask = createAsyncThunk(
  "tasks/createTask",
  async (taskData, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/tasks/`,
        taskData,
        getAuthHeader()
      );
      return response.data;
    } catch (error) {
      console.error("Erreur lors de la création de la tâche:", error);

      // Extraire un message d'erreur utilisable
      let errorMessage;

      if (error.response) {
        // Le serveur a répondu avec un code d'erreur
        if (error.response.data && typeof error.response.data === 'object') {
          // Si le backend renvoie un objet avec une propriété message
          errorMessage = error.response.data.message || JSON.stringify(error.response.data);
        } else {
          errorMessage = error.response.data || `Erreur ${error.response.status}`;
        }
      } else if (error.request) {
        // La requête a été faite mais aucune réponse n'a été reçue
        errorMessage = "Aucune réponse du serveur";
      } else {
        // Une erreur s'est produite lors de la configuration de la requête
        errorMessage = error.message || "Une erreur s'est produite";
      }

      return rejectWithValue(errorMessage);
    }
  }
);

// =========== Récupérer une tâche par ID ===========
export const getTaskById = createAsyncThunk(
  "tasks/getTaskById",
  async (id, { rejectWithValue }) => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/tasks/show/${id}`,
        getAuthHeader()
      );
      return response.data;
    } catch (error) {
      console.error(`Erreur lors de la récupération de la tâche ${id}:`, error);
      return rejectWithValue(error.response?.data || "Une erreur s'est produite");
    }
  }
);

// =========== Mettre à jour une tâche ===========
export const updateTask = createAsyncThunk(
  "tasks/updateTask",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await axios.put(
        `${API_BASE_URL}/tasks/${id}`,
        data,
        getAuthHeader()
      );
      return response.data;
    } catch (error) {
      if (error.response?.status === 403) {
        return rejectWithValue("Vous n'avez pas la permission de modifier cette tâche.");
      }
      console.error(`Erreur lors de la mise à jour de la tâche ${id}:`, error);
      return rejectWithValue(error.response?.data || "Une erreur s'est produite");
    }
  }
);


// =========== Supprimer une tâche ===========
export const deleteTask = createAsyncThunk(
  "tasks/deleteTask",
  async (id, { rejectWithValue }) => {
    try {
      const response = await axios.delete(
        `${API_BASE_URL}/tasks/delete/${id}`,
        getAuthHeader()
      );
      return { id, ...response.data };
    } catch (error) {
      console.error(`Erreur lors de la suppression de la tâche ${id}:`, error);
      return rejectWithValue(error.response?.data || "Une erreur s'est produite");
    }
  }
);

// =========== Mettre à jour le statut d'une tâche ===========
export const updateTaskStatus = createAsyncThunk(
  "tasks/updateTaskStatus",
  async ({ id, status }, { rejectWithValue }) => {
    try {
      const response = await axios.patch(
        `${API_BASE_URL}/tasks/${id}/status`,
        { status },
        getAuthHeader()
      );
      return response.data;
    } catch (error) {
      console.error(`Erreur lors de la mise à jour du statut de la tâche ${task}:`, error);
      return rejectWithValue(error.response?.data || "Une erreur s'est produite");
    }
  }
);

// =========== Récupérer les tâches pour le calendrier ===========
export const getCalendarTasks = createAsyncThunk(
  "tasks/getCalendarTasks",
  async (params = {}, { rejectWithValue }) => {
    try {
      const queryParams = new URLSearchParams();

      // Ajouter les paramètres de filtrage
      if (params.start) queryParams.append('start', params.start);
      if (params.end) queryParams.append('end', params.end);
      if (params.assignee_id) queryParams.append('assignee_id', params.assignee_id);
      if (params.status) queryParams.append('status', params.status);
      if (params.type) queryParams.append('type', params.type);

      const url = queryParams.toString()
        ? `${API_BASE_URL}/tasks/calendar?${queryParams.toString()}`
        : `${API_BASE_URL}/tasks/calendar`;

      const response = await axios.get(url, getAuthHeader());
      return response.data;
    } catch (error) {
      console.error("Erreur lors du chargement des tâches pour le calendrier:", error);
      return rejectWithValue(error.response?.data || "Une erreur s'est produite");
    }
  }
);

// =========== Déplacer une tâche dans le calendrier ===========
export const moveCalendarTask = createAsyncThunk(
  "tasks/moveCalendarTask",
  async ({ id, start, end, allDay }, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/tasks/${id}/move`,
        { start, end, allDay },
        getAuthHeader()
      );
      return response.data;
    } catch (error) {
      console.error(`Erreur lors du déplacement de la tâche ${id}:`, error);
      return rejectWithValue(error.response?.data || "Une erreur s'est produite");
    }
  }
);

// =========== Récupérer mes tâches ===========
export const getMyTasks = createAsyncThunk(
  "tasks/getMyTasks",
  async (params = {}, { rejectWithValue }) => {
    try {
      const queryParams = new URLSearchParams();

      // Ajouter les paramètres de filtrage
      if (params.status) queryParams.append('status', params.status);
      if (params.priority) queryParams.append('priority', params.priority);
      if (params.type) queryParams.append('type', params.type);
      if (params.sort_field) queryParams.append('sort_field', params.sort_field);
      if (params.sort_direction) queryParams.append('sort_direction', params.sort_direction);
      if (params.per_page) queryParams.append('per_page', params.per_page);
      if (params.page) queryParams.append('page', params.page);

      const url = queryParams.toString()
        ? `${API_BASE_URL}/tasks/myTasks?${queryParams.toString()}`
        : `${API_BASE_URL}/tasks/myTasks`;

      const response = await axios.get(url, getAuthHeader());
      return response.data;
    } catch (error) {
      console.error("Erreur lors du chargement de mes tâches:", error);
      return rejectWithValue(error.response?.data || "Une erreur s'est produite");
    }
  }
);

// =========== Récupérer les statistiques du tableau de bord ===========
export const getDashboardStats = createAsyncThunk(
  "tasks/getDashboardStats",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/tasks/dashboard/stats`,
        getAuthHeader()
      );
      return response.data;
    } catch (error) {
      console.error("Erreur lors du chargement des statistiques:", error);
      return rejectWithValue(error.response?.data || "Une erreur s'est produite");
    }
  }
);
// Nouvelle action pour récupérer les tâches de l'utilisateur connecté
export const fetchUserTasks = createAsyncThunk(
  'tasks/fetchUserTasks',
  async (_, { rejectWithValue, getState }) => {
    try {
      const token = getState().user.token || localStorage.getItem('token');

      if (!token) {
        return rejectWithValue('Token d\'authentification non disponible');
      }

      const response = await axios.get(`${API_BASE_URL}/tasks/user`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || 'Erreur lors de la récupération des tâches'
      );
    }
  }
);
export const fetchProjectTasks = createAsyncThunk(
  "tasks/fetchProjectTasks",
  async (projectId, { rejectWithValue }) => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/tasks?project_id=${projectId}`,
        getAuthHeader()
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Erreur lors du chargement des tâches");
    }
  }
);

// =========== Slice ===========
const taskSlice = createSlice({
  name: "tasks",
  initialState: {
    tasks: {
      items: [],
      pagination: null,
      loading: false,
      error: null
    },
    myTasks: {
      items: [],
      pagination: null,
      loading: false,
      error: null
    },
    calendarTasks: {
      items: [],
      loading: false,
      error: null
    },
    dashboardStats: {
      data: null,
      loading: false,
      error: null
    },
    selectedTask: {
      data: null,
      loading: false,
      error: null
    },
    taskOperation: {
      loading: false,
      success: false,
      error: null
    },
    projectTasks: {
      tasks: [],
      loading: false,
      error: null
    }
  },
  reducers: {
    resetTaskOperation: (state) => {
      state.taskOperation = {
        loading: false,
        success: false,
        error: null
      };
    },
    clearSelectedTask: (state) => {
      state.selectedTask = {
        data: null,
        loading: false,
        error: null
      };
    }
  },
  extraReducers: (builder) => {
    // Fetch Tasks
    builder
      .addCase(fetchTasks.pending, (state) => {
        state.tasks.loading = true;
        state.tasks.error = null;
      })
      .addCase(fetchTasks.fulfilled, (state, action) => {
        state.tasks.loading = false;
        state.tasks.items = action.payload.data?.data || action.payload.data || [];
        state.tasks.pagination = action.payload.data?.meta || action.payload.meta || null;
      })
      .addCase(fetchTasks.rejected, (state, action) => {
        state.tasks.loading = false;
        state.tasks.error = action.payload || 'Une erreur est survenue';
      })

      // Create Task
      .addCase(createTask.pending, (state) => {
        state.taskOperation.loading = true;
        state.taskOperation.success = false;
        state.taskOperation.error = null;
      })
      .addCase(createTask.fulfilled, (state) => {
        state.taskOperation.loading = false;
        state.taskOperation.success = true;
      })
      .addCase(createTask.rejected, (state, action) => {
        state.taskOperation.loading = false;
        state.taskOperation.error = action.payload || 'Une erreur est survenue';
      })

      // Get Task By ID
      .addCase(getTaskById.pending, (state) => {
        state.selectedTask.loading = true;
        state.selectedTask.error = null;
      })
      .addCase(getTaskById.fulfilled, (state, action) => {
        state.selectedTask.loading = false;
        state.selectedTask.data = action.payload.data || action.payload;
      })
      .addCase(getTaskById.rejected, (state, action) => {
        state.selectedTask.loading = false;
        state.selectedTask.error = action.payload || 'Une erreur est survenue';
      })

      // Update Task
      .addCase(updateTask.pending, (state) => {
        state.taskOperation.loading = true;
        state.taskOperation.success = false;
        state.taskOperation.error = null;
      })
      .addCase(updateTask.fulfilled, (state) => {
        state.taskOperation.loading = false;
        state.taskOperation.success = true;
      })
      .addCase(updateTask.rejected, (state, action) => {
        state.taskOperation.loading = false;
        state.taskOperation.error = action.payload || 'Une erreur est survenue';
      })

      // Delete Task
      .addCase(deleteTask.pending, (state) => {
        state.taskOperation.loading = true;
        state.taskOperation.success = false;
        state.taskOperation.error = null;
      })
      .addCase(deleteTask.fulfilled, (state) => {
        state.taskOperation.loading = false;
        state.taskOperation.success = true;
      })
      .addCase(deleteTask.rejected, (state, action) => {
        state.taskOperation.loading = false;
        state.taskOperation.error = action.payload || 'Une erreur est survenue';
      })

      // Update Task Status
      .addCase(updateTaskStatus.pending, (state) => {
        state.taskOperation.loading = true;
        state.taskOperation.success = false;
        state.taskOperation.error = null;
      })
      .addCase(updateTaskStatus.fulfilled, (state) => {
        state.taskOperation.loading = false;
        state.taskOperation.success = true;
      })
      .addCase(updateTaskStatus.rejected, (state, action) => {
        state.taskOperation.loading = false;
        state.taskOperation.error = action.payload || 'Une erreur est survenue';
      })

      // Get Calendar Tasks
      .addCase(getCalendarTasks.pending, (state) => {
        state.calendarTasks.loading = true;
        state.calendarTasks.error = null;
      })
      .addCase(getCalendarTasks.fulfilled, (state, action) => {
        state.calendarTasks.loading = false;
        state.calendarTasks.items = action.payload || [];
      })
      .addCase(getCalendarTasks.rejected, (state, action) => {
        state.calendarTasks.loading = false;
        state.calendarTasks.error = action.payload || 'Une erreur est survenue';
      })

      // Move Calendar Task
      .addCase(moveCalendarTask.pending, (state) => {
        state.taskOperation.loading = true;
        state.taskOperation.success = false;
        state.taskOperation.error = null;
      })
      .addCase(moveCalendarTask.fulfilled, (state) => {
        state.taskOperation.loading = false;
        state.taskOperation.success = true;
      })
      .addCase(moveCalendarTask.rejected, (state, action) => {
        state.taskOperation.loading = false;
        state.taskOperation.error = action.payload || 'Une erreur est survenue';
      })

      // Get My Tasks
      .addCase(getMyTasks.pending, (state) => {
        state.myTasks.loading = true;
        state.myTasks.error = null;
      })
      .addCase(getMyTasks.fulfilled, (state, action) => {
        state.myTasks.loading = false;
        state.myTasks.items = action.payload.data?.data || action.payload.data || [];
        state.myTasks.pagination = action.payload.data?.meta || action.payload.meta || null;
      })
      .addCase(getMyTasks.rejected, (state, action) => {
        state.myTasks.loading = false;
        state.myTasks.error = action.payload || 'Une erreur est survenue';
      })

      // Get Dashboard Stats
      .addCase(getDashboardStats.pending, (state) => {
        state.dashboardStats.loading = true;
        state.dashboardStats.error = null;
      })
      .addCase(getDashboardStats.fulfilled, (state, action) => {
        state.dashboardStats.loading = false;
        state.dashboardStats.data = action.payload.data || action.payload;
      })
      .addCase(getDashboardStats.rejected, (state, action) => {
        state.dashboardStats.loading = false;
        state.dashboardStats.error = action.payload || 'Une erreur est survenue';
      })
      // Fetch User Tasks
      .addCase(fetchUserTasks.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserTasks.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload.data || [];
      })
      .addCase(fetchUserTasks.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch Project Tasks
      .addCase(fetchProjectTasks.pending, (state) => {
        state.projectTasks.loading = true;
        state.projectTasks.error = null;
      })
      .addCase(fetchProjectTasks.fulfilled, (state, action) => {
        state.projectTasks.loading = false;
        state.projectTasks.tasks = action.payload.data || action.payload;
      })
      .addCase(fetchProjectTasks.rejected, (state, action) => {
        state.projectTasks.loading = false;
        state.projectTasks.error = action.payload || 'Une erreur est survenue';
      })
  }
});

export const { resetTaskOperation, clearSelectedTask } = taskSlice.actions;

export default taskSlice.reducer;
export {getAuthHeader};