import { create } from "zustand";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "../../lib/supabaseClient";

export type UserRole = "coach" | "client";

type AuthState = {
  initialized: boolean;
  loading: boolean;
  session: Session | null;
  user: User | null;
  role: UserRole | null;
  selectedClientId: string;
  selectedCoachId: string;
  error: string | null;
  initialize: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signUp: (params: { email: string; password: string; role: UserRole; fullName?: string }) => Promise<{ error: string | null }>;
  setRole: (role: UserRole) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  setSelectedClientId: (clientId: string) => void;
  setSelectedCoachId: (coachId: string) => void;
  loginAs: (role: UserRole) => void;
  logout: () => Promise<void>;
};

let authListenerBound = false;

async function fetchRole(userId: string): Promise<UserRole | null> {
  const { data, error } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", userId)
    .maybeSingle();

  if (error) {
    return null;
  }

  return (data?.role as UserRole | undefined) ?? null;
}

function mapAuthError(message?: string) {
  if (!message) return "Erreur d'authentification.";
  const normalized = message.toLowerCase();
  if (normalized.includes("invalid login credentials")) {
    return "Identifiants invalides.";
  }
  if (normalized.includes("email not confirmed")) {
    return "Email non confirme. Verifiez votre boite mail.";
  }
  return message;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  initialized: false,
  loading: false,
  session: null,
  user: null,
  role: null,
  selectedClientId: "c-001",
  selectedCoachId: "",
  error: null,

  initialize: async () => {
    if (get().initialized) {
      return;
    }

    set({ loading: true, error: null });

    const { data, error } = await supabase.auth.getSession();
    if (error) {
      set({ initialized: true, loading: false, error: mapAuthError(error.message) });
      return;
    }

    const session = data.session ?? null;
    const user = session?.user ?? null;
    const role = user ? await fetchRole(user.id) : null;

    set({
      session,
      user,
      role,
      initialized: true,
      loading: false,
      error: null,
    });

    if (!authListenerBound) {
      authListenerBound = true;
      supabase.auth.onAuthStateChange(async (_event, nextSession) => {
        const previousUserId = get().user?.id ?? null;
        const nextUser = nextSession?.user ?? null;
        const nextRole = nextUser ? await fetchRole(nextUser.id) : null;
        set({
          session: nextSession ?? null,
          user: nextUser,
          role: nextRole,
          selectedCoachId: previousUserId !== (nextUser?.id ?? null) ? "" : get().selectedCoachId,
          initialized: true,
          loading: false,
          error: null,
        });
      });
    }
  },

  signIn: async (email, password) => {
    set({ loading: true, error: null });
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      const message = mapAuthError(error.message);
      set({ loading: false, error: message });
      return { error: message };
    }

    const userId = (await supabase.auth.getUser()).data.user?.id;
    const role = userId ? await fetchRole(userId) : null;

    set({ role, loading: false, error: null });
    return { error: null };
  },

  signUp: async ({ email, password, role, fullName }) => {
    set({ loading: true, error: null });

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          role,
          full_name: fullName ?? null,
        },
      },
    });

    if (error) {
      const message = mapAuthError(error.message);
      set({ loading: false, error: message });
      return { error: message };
    }

    const userId = data.user?.id;
    if (userId) {
      const { error: upsertError } = await supabase.from("profiles").upsert(
        {
          id: userId,
          role,
          full_name: fullName ?? null,
        },
        { onConflict: "id" },
      );

      if (upsertError) {
        const message = mapAuthError(upsertError.message);
        set({ loading: false, error: message });
        return { error: message };
      }
    }

    set({ loading: false, role, error: null });
    return { error: null };
  },

  setRole: async (role) => {
    const user = get().user;

    if (!user) {
      set({ role });
      return { error: null };
    }

    set({ loading: true, error: null });
    const { error } = await supabase.from("profiles").upsert(
      {
        id: user.id,
        role,
        full_name: user.user_metadata?.full_name ?? null,
      },
      { onConflict: "id" },
    );

    if (error) {
      const message = mapAuthError(error.message);
      set({ loading: false, error: message });
      return { error: message };
    }

    set({ role, loading: false, error: null });
    return { error: null };
  },

  signOut: async () => {
    await supabase.auth.signOut();
    set({ session: null, user: null, role: null, selectedCoachId: "", error: null });
  },

  setSelectedClientId: (clientId) => set({ selectedClientId: clientId }),
  setSelectedCoachId: (coachId) => set({ selectedCoachId: coachId }),

  loginAs: (role) => {
    set({ role });
  },

  logout: async () => {
    await get().signOut();
  },
}));
