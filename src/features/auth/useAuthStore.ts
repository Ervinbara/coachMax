import { create } from "zustand";
import type { UserRole } from "../../mocks";

type AuthState = {
  role: UserRole | null;
  selectedClientId: string;
  loginAs: (role: UserRole) => void;
  logout: () => void;
  setSelectedClientId: (clientId: string) => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  role: null,
  selectedClientId: "c-001",
  loginAs: (role) => set({ role }),
  logout: () => set({ role: null }),
  setSelectedClientId: (clientId) => set({ selectedClientId: clientId }),
}));
