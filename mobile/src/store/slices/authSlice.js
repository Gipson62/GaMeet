import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { loginUserApi, setAuthToken } from '../../services/api';

// Clés pour AsyncStorage
const TOKEN_KEY = 'auth_token';
const USER_KEY = 'auth_user';
const LANG_KEY = 'app_language';

// Thunk pour charger la session au démarrage
export const loadUserSession = createAsyncThunk(
  'auth/loadSession',
  async (_, { dispatch }) => {
    try {
      const token = await AsyncStorage.getItem(TOKEN_KEY);
      const userStr = await AsyncStorage.getItem(USER_KEY);
      const lang = await AsyncStorage.getItem(LANG_KEY);

      if (token) {
        setAuthToken(token);
        const user = userStr ? JSON.parse(userStr) : null;
        return { token, user, language: lang || 'fr' };
      }
      
      return { token: null, user: null, language: lang || 'fr' };
    } catch (error) {
      console.error("Erreur chargement session:", error);
      return { token: null, user: null, language: 'fr' };
    }
  }
);

// Thunk pour gérer le login asynchrone
export const login = createAsyncThunk(
  'auth/login',
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const data = await loginUserApi({ email, password });
      
      // Sauvegarde persistante
      await AsyncStorage.setItem(TOKEN_KEY, data.token);
      if (data.user) {
        await AsyncStorage.setItem(USER_KEY, JSON.stringify(data.user));
      }
      
      setAuthToken(data.token);
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Erreur de connexion');
    }
  }
);

// Thunk pour le logout (pour nettoyer AsyncStorage)
export const logout = createAsyncThunk(
  'auth/logout',
  async () => {
    await AsyncStorage.removeItem(TOKEN_KEY);
    await AsyncStorage.removeItem(USER_KEY);
    setAuthToken(null);
    return null;
  }
);

// Thunk pour changer la langue (et persister)
export const setLanguage = createAsyncThunk(
  'auth/setLanguage',
  async (lang) => {
    await AsyncStorage.setItem(LANG_KEY, lang);
    return lang;
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    token: null,
    user: null,
    isLoading: true,
    error: null,
    language: 'fr',
    isInitialized: false,
  },
  reducers: {
    clearAuthError: (state) => {
      state.error = null;
    },
    // Nouvelle action pour mettre à jour l'utilisateur dans le store
    updateUser: (state, action) => {
      state.user = action.payload;
      // On met aussi à jour le stockage persistant
      AsyncStorage.setItem(USER_KEY, JSON.stringify(action.payload)).catch(err => console.error("Erreur sauvegarde user", err));
    },
  },
  extraReducers: (builder) => {
    builder
      // Load Session
      .addCase(loadUserSession.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(loadUserSession.fulfilled, (state, action) => {
        state.token = action.payload.token;
        state.user = action.payload.user;
        state.language = action.payload.language;
        state.isLoading = false;
        state.isInitialized = true;
      })
      .addCase(loadUserSession.rejected, (state) => {
        state.isLoading = false;
        state.isInitialized = true;
        state.token = null;
      })
      
      // Login
      .addCase(login.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.isLoading = false;
        state.token = action.payload.token;
        state.user = action.payload.user;
      })
      .addCase(login.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // Logout
      .addCase(logout.fulfilled, (state) => {
        state.token = null;
        state.user = null;
        state.error = null;
      })

      // Language
      .addCase(setLanguage.fulfilled, (state, action) => {
        state.language = action.payload;
      });
  },
});

export const { clearAuthError, updateUser } = authSlice.actions;
export default authSlice.reducer;
