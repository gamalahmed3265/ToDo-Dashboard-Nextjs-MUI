import { create } from "zustand";

interface TaskUIState {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  isCreateModalOpen: boolean;
  setCreateModalOpen: (open: boolean) => void;
}

export const useTaskStore = create<TaskUIState>((set) => ({
  searchQuery: "",
  setSearchQuery: (query) => set({ searchQuery: query }),
  isCreateModalOpen: false,
  setCreateModalOpen: (open) => set({ isCreateModalOpen: open }),
}));
