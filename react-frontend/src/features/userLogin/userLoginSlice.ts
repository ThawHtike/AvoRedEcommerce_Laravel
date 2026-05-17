import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../../app/store";

// ── Storage helpers ───────────────────────────────────────────────────────────
const TOKEN_KEY = "auth_token";
const USER_KEY  = "auth_user";

const loadToken = (): string => localStorage.getItem(TOKEN_KEY) ?? "";
const loadUser  = (): AuthUserState | null => {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
};
const persistAuth = (token: string, user: AuthUserState) => {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
};
const clearAuth = () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
};

// ── Types ─────────────────────────────────────────────────────────────────────

export interface AddressType {
  id: string;
  type?: string;
  address1?: string;
  address2?: string;
  city?: string;
  state?: string;
  postcode?: string;   // ← fixes CheckoutShippingAddressShow error
  zip?: string;
  country?: string;
}

// Every field used across the whole app
export interface AuthUserState {
  id?: string;
  first_name?: string;
  last_name?: string;
  name?: string;
  email?: string;
  image_path_url?: string;   // ← fixes Header + UserSidebar errors
  addresses?: AddressType[];
}

export interface UserLoginState {
  token:     string;
  is_auth:   boolean;
  user_info: AuthUserState | null;
  status:    "idle" | "loading" | "succeeded" | "failed";
  error:     string | null;
}

// ── Async thunks ──────────────────────────────────────────────────────────────

export const loginUser = createAsyncThunk(
  "userLogin/loginUser",
  async (credentials: { email: string; password: string }, { rejectWithValue }) => {
    try {
      await fetch("/sanctum/csrf-cookie", { method: "GET", credentials: "include" });
      const response = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        credentials: "include",
        body: JSON.stringify(credentials),
      });
      const data = await response.json();
      if (!response.ok) return rejectWithValue(data.message ?? "Login failed");
      persistAuth(data.token, data.user);
      return data as { token: string; user: AuthUserState };
    } catch (err: any) {
      return rejectWithValue(err.message ?? "Network error");
    }
  }
);

export const logoutUser = createAsyncThunk(
  "userLogin/logoutUser",
  async (_, { rejectWithValue }) => {
    try {
      await fetch("/api/logout", {
        method: "POST",
        headers: { Authorization: `Bearer ${loadToken()}`, Accept: "application/json" },
        credentials: "include",
      });
    } catch (err: any) {
      return rejectWithValue(err.message);
    } finally {
      clearAuth();
    }
  }
);

// ── Slice ─────────────────────────────────────────────────────────────────────

const initialState: UserLoginState = {
  token:     loadToken(),
  is_auth:   !!loadToken(),
  user_info: loadUser(),
  status:    "idle",
  error:     null,
};

export const userLoginSlice = createSlice({
  name: "userLogin",
  initialState,
  reducers: {
    setAuthInfo: (state, action: PayloadAction<{ token: string; user: AuthUserState }>) => {
      state.token     = action.payload.token;
      state.is_auth   = true;
      state.user_info = action.payload.user;
      persistAuth(action.payload.token, action.payload.user);
    },
    setIsAuth: (state, action: PayloadAction<boolean>) => {
      state.is_auth = action.payload;
      if (!action.payload) clearAuth();
    },
    // No argument — fixes "Expected 0 arguments but got 1" in UserLogout.tsx
    performUserLogout: (state) => {
      state.token     = "";
      state.is_auth   = false;
      state.user_info = null;
      state.status    = "idle";
      clearAuth();
    },
    setToken: (state, action: PayloadAction<string>) => {
      state.token   = action.payload;
      state.is_auth = !!action.payload;
      localStorage.setItem(TOKEN_KEY, action.payload);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending,   (state) => { state.status = "loading"; state.error = null; })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.status    = "succeeded";
        state.token     = action.payload.token;
        state.is_auth   = true;
        state.user_info = action.payload.user;
        state.error     = null;
      })
      .addCase(loginUser.rejected,  (state, action) => { state.status = "failed"; state.error = action.payload as string; })
      .addCase(logoutUser.fulfilled, (state) => {
        state.token = ""; state.is_auth = false; state.user_info = null; state.status = "idle";
      });
  },
});

export const { setAuthInfo, setIsAuth, setToken, performUserLogout } = userLoginSlice.actions;

// ── Selectors (every name used anywhere in the project) ───────────────────────
export const isAuth          = (state: RootState): boolean           => state.userLogin.is_auth || !!state.userLogin.token;
export const getAuthUserInfo = (state: RootState): AuthUserState | null => state.userLogin.user_info;
export const authToken       = (state: RootState): string            => state.userLogin.token;
export const authStatus      = (state: RootState)                    => state.userLogin.status;
export const authError       = (state: RootState)                    => state.userLogin.error;
export const currentUser     = getAuthUserInfo; // alias

export default userLoginSlice.reducer;