import apiClient from './client';

export const resultsApi = {
    // ─── Parties ────────────────────────────────────────────────────
    getParties: async () => {
        const res = await apiClient.get('/results/parties');
        return res.data;
    },

    createParty: async (formData: FormData) => {
        const res = await apiClient.post('/results/parties', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        return res.data;
    },

    updateParty: async (id: string, formData: FormData) => {
        const res = await apiClient.patch(`/results/parties/${id}`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        return res.data;
    },

    deleteParty: async (id: string) => {
        const res = await apiClient.delete(`/results/parties/${id}`);
        return res.data;
    },

    // ─── MLAs ───────────────────────────────────────────────────────
    getMlas: async () => {
        const res = await apiClient.get('/results/mlas');
        return res.data;
    },

    createMla: async (formData: FormData) => {
        const res = await apiClient.post('/results/mlas', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        return res.data;
    },

    updateMla: async (id: string, formData: FormData) => {
        const res = await apiClient.patch(`/results/mlas/${id}`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        return res.data;
    },

    deleteMla: async (id: string) => {
        const res = await apiClient.delete(`/results/mlas/${id}`);
        return res.data;
    },

    // ─── Booths ─────────────────────────────────────────────────────
    getBooths: async () => {
        const res = await apiClient.get('/results/booths');
        return res.data;
    },

    createBooth: async (data: any) => {
        const res = await apiClient.post('/results/booths', data);
        return res.data;
    },

    updateBooth: async (id: string, data: any) => {
        const res = await apiClient.patch(`/results/booths/${id}`, data);
        return res.data;
    },

    deleteBooth: async (id: string) => {
        const res = await apiClient.delete(`/results/booths/${id}`);
        return res.data;
    },

    // ─── Constituencies ─────────────────────────────────────────────
    getConstituencies: async () => {
        const res = await apiClient.get('/results/constituencies');
        return res.data;
    },

    // ─── Election Results ───────────────────────────────────────────
    getElectionResults: async () => {
        const res = await apiClient.get('/results/election-results');
        return res.data;
    },

    createElectionResult: async (data: any) => {
        const res = await apiClient.post('/results/election-results', data);
        return res.data;
    },

    updateElectionResult: async (id: string, data: any) => {
        const res = await apiClient.patch(`/results/election-results/${id}`, data);
        return res.data;
    },

    deleteElectionResult: async (id: string) => {
        const res = await apiClient.delete(`/results/election-results/${id}`);
        return res.data;
    },
};
