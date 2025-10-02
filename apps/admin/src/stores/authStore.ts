import { create } from "zustand";

type AuthState = {
  userId?: string;
  adminName?: string;
  accessToken?: string;
  isAuthed: boolean;
  setAuth: (p: {
    userId: string;
    adminName: string;
    accessToken: string;
  }) => void;
  updateToken: (token: string) => void;
  clear: () => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  userId: undefined,
  adminName: undefined,
  accessToken: undefined,
  isAuthed: false,

  setAuth: ({ userId, adminName, accessToken }) =>
    set({ userId, adminName, accessToken, isAuthed: true }),
  updateToken: (accessToken) => set({ accessToken }),
  clear: () =>
    set({
      userId: undefined,
      adminName: undefined,
      accessToken: undefined,
      isAuthed: false,
    }),
}));
