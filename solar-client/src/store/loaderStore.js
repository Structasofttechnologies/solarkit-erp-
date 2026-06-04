import { create } from 'zustand';

const useLoaderStore = create((set) => ({
    activeRequests: 0,
    startRequest: () => set((state) => ({ activeRequests: state.activeRequests + 1 })),
    endRequest: () => set((state) => ({ activeRequests: Math.max(0, state.activeRequests - 1) })),
    reset: () => set({ activeRequests: 0 })
}));

export default useLoaderStore;
