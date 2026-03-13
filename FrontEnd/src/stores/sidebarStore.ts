import { create } from "zustand";
import { persist } from "zustand/middleware";

type SidebarLevel = 1 | 2;

interface SidebarState {
  level: SidebarLevel;
  toggle: () => void;
  setLevel: (l: SidebarLevel) => void;
}

export const useSidebarStore = create<SidebarState>()(
  persist(
    (set, get) => ({
      level: 1,
      toggle: () => set({ level: get().level === 1 ? 2 : 1 }),
      setLevel: (level) => set({ level }),
    }),
    { name: "sidebar_level" }
  )
);
