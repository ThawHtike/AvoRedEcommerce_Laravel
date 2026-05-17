import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../../app/store';

// ── Persist visitor_id across page refreshes ──────────────────────────────
const STORAGE_KEY = 'cart_visitor_id';

const loadVisitorId = (): string => {
  try {
    return localStorage.getItem(STORAGE_KEY) ?? '';
  } catch {
    return '';
  }
};

const saveVisitorId = (id: string) => {
  try {
    localStorage.setItem(STORAGE_KEY, id);
  } catch {
    // Storage unavailable — silently ignore
  }
};

// ── State ─────────────────────────────────────────────────────────────────

export interface CartState {
  visitor_id: string;
}

const initialState: CartState = {
  visitor_id: loadVisitorId(),
};

// ── Slice ─────────────────────────────────────────────────────────────────

export const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    setVisitorId: (state, action: PayloadAction<string>) => {
      state.visitor_id = action.payload;
      saveVisitorId(action.payload);
    },
    clearVisitorId: (state) => {
      state.visitor_id = '';
      saveVisitorId('');
    },
  },
});

export const { setVisitorId, clearVisitorId } = cartSlice.actions;

// ── Selectors ─────────────────────────────────────────────────────────────

export const visitorId = (state: RootState) => state.cart.visitor_id;

export default cartSlice.reducer;