import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../../app/store";

// ── Storage helpers ──────────────────────────────────────────────────────────

const TOKEN_KEY = "auth_token";
const USER_KEY  = "auth_user";

const loadToken = (): string => localStorage.getItem(TOKEN_KEY) ?? "";
const loadUser  = (): UserInfo | null => {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

const persistAuth = (token: string, user: UserInfo) => {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
};

const clearAuth = () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
};

// ── Types ────────────────────────────────────────────────────────────────────

export interface UserInfo {
  id: number;
  name: string;
  email: string;
}

export interface UserLoginState {
  token: string;
  user: UserInfo | null;
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
}

// ── Async thunk: login via Laravel Sanctum ───────────────────────────────────

export const loginUser = createAsyncThunk(
  "userLogin/loginUser",
  async (
    credentials: { email: string; password: string },
    { rejectWithValue }
  ) => {
    try {
      // Step 1: Get CSRF cookie (required for Sanctum)
      await fetch("/sanctum/csrf-cookie", {
        method: "GET",
        credentials: "include",
      });

      // Step 2: Login
      const response = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        credentials: "include",
        body: JSON.stringify(credentials),
      });

      const data = await response.json();

      if (!response.ok) {
        return rejectWithValue(data.message ?? "Login failed");
      }

      // data = { token: "...", user: { id, name, email } }
      persistAuth(data.token, data.user);
      return data as { token: string; user: UserInfo };
    } catch (err: any) {
      return rejectWithValue(err.message ?? "Network error");
    }
  }
);

// ── Async thunk: logout ──────────────────────────────────────────────────────

export const logoutUser = createAsyncThunk(
  "userLogin/logoutUser",
  async (_, { rejectWithValue }) => {
    try {
      await fetch("/api/logout", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${loadToken()}`,
          Accept: "application/json",
        },
        credentials: "include",
      });
      clearAuth();
    } catch (err: any) {
      clearAuth(); // clear locally even if request fails
      return rejectWithValue(err.message);
    }
  }
);

// ── Slice ────────────────────────────────────────────────────────────────────

const initialState: UserLoginState = {
  token:  loadToken(),
  user:   loadUser(),
  status: "idle",
  error:  null,
};

export const userLoginSlice = createSlice({
  name: "userLogin",
  initialState,
  reducers: {
    // Manual token set (e.g. if you already have a token from another flow)
    setToken: (state, action: PayloadAction<string>) => {
      state.token = action.payload;
      localStorage.setItem(TOKEN_KEY, action.payload);
    },
  },
  extraReducers: (builder) => {
    builder
      // ── login ──────────────────────────────────────────────────────────
      .addCase(loginUser.pending, (state) => {
        state.status = "loading";
        state.error  = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.token  = action.payload.token;
        state.user   = action.payload.user;
        state.error  = null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.status = "failed";
        state.error  = action.payload as string;
      })
      // ── logout ─────────────────────────────────────────────────────────
      .addCase(logoutUser.fulfilled, (state) => {
        state.token  = "";
        state.user   = null;
        state.status = "idle";
        state.error  = null;
      });
  },
});

export const { setToken } = userLoginSlice.actions;

// ── Selectors ─────────────────────────────────────────────────────────────────

export const isAuth      = (state: RootState): boolean => !!state.userLogin.token;
export const authToken   = (state: RootState): string  => state.userLogin.token;
export const currentUser = (state: RootState): UserInfo | null => state.userLogin.user;
export const authStatus  = (state: RootState) => state.userLogin.status;
export const authError   = (state: RootState) => state.userLogin.error;

export default userLoginSlice.reducer;




