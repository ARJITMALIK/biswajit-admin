import client from './client';

export interface Report {
  id: string;
  user_id: number;
  reporter_name: string;
  target_type: string;
  target_id: string;
  reason: string;
  status: 'PENDING' | 'RESOLVED';
  created_at: string;
}

export interface GetReportsParams {
  status?: string;
  target_type?: string;
  page?: number;
  limit?: number;
}

export const reportsService = {
  getReports: async (params: GetReportsParams = {}) => {
    const response = await client.get('/reports', { params });
    return response.data;
  },

  getReportDetails: async (id: string) => {
    const response = await client.get(`/reports/${id}`);
    return response.data;
  },

  resolveReport: async (id: string, action: string) => {
    const response = await client.patch(`/reports/${id}/resolve`, { action });
    return response.data;
  },
};
