import { create } from 'zustand';

const candidateStore = create((set) => ({
    candidate: null,
    candidateToken: localStorage.getItem('candidateToken') || null,
    testSetting: null,

    setCandidate: (candidate) => set({ candidate }),
    setCandidateToken: (candidateToken) => {
        localStorage.setItem('candidateToken', candidateToken);
        set({ candidateToken });
    },
    setTestSetting: (testSetting) => set({ testSetting }),
    logoutCandidate: () => {
        localStorage.removeItem('candidateToken');
        set({ candidate: null, candidateToken: null, testSetting: null });
    },
}));

export default candidateStore;
