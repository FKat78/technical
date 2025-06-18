import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export interface Project {
  id: number;
  name: string;
  enabled: boolean;
  create_on: string;
  update_on: string;
}

export interface Indicator {
  id: number;
  identifier: string;
  label: string;
  label_short: string;
  timeslots: number;
  position: number;
  asset?: string;
}

export interface IndicatorCategory {
  id: number;
  indicator: number;
  category: number;
  identifier: string;
  label: string;
  color: string;
  color_dark: string;
}

export interface ProjectIndicatorDetail {
  indicator: Indicator;
  categories: IndicatorCategory[];
}

export interface NumericValueResponse {
  time_begin: string;
  time_end: string;
  date: string;
  values: Record<number, number>;
}

export interface ProjectValuesResponse {
  project: Project;
  indicators: Indicator[];
  time_slots: any[];
  values: NumericValueResponse[];
}

// API Functions
export const projectsApi = {
  // Get all projects with optional sorting
  getProjects: async (sortBy?: string, order?: string): Promise<Project[]> => {
    const params = new URLSearchParams();
    if (sortBy) params.append('sort_by', sortBy);
    if (order) params.append('order', order);
    
    const response = await api.get(`/projects?${params.toString()}`);
    return response.data;
  },

  // Get project details
  getProject: async (projectId: number): Promise<Project> => {
    const response = await api.get(`/projects/${projectId}`);
    return response.data;
  },

  // Toggle project status
  toggleProject: async (projectId: number): Promise<{message: string, enabled: boolean}> => {
    const response = await api.put(`/projects/${projectId}/toggle`);
    return response.data;
  },

  // Get project indicators
  getProjectIndicators: async (projectId: number): Promise<ProjectIndicatorDetail[]> => {
    const response = await api.get(`/projects/${projectId}/indicators`);
    return response.data;
  },

  // Get project values
  getProjectValues: async (
    projectId: number, 
    filters?: {
      startDate?: string;
      endDate?: string;
      minValue?: number;
      maxValue?: number;
      sortBy?: string;
      order?: string;
    }
  ): Promise<ProjectValuesResponse> => {
    const params = new URLSearchParams();
    if (filters?.startDate) params.append('start_date', filters.startDate);
    if (filters?.endDate) params.append('end_date', filters.endDate);
    if (filters?.minValue) params.append('min_value', filters.minValue.toString());
    if (filters?.maxValue) params.append('max_value', filters.maxValue.toString());
    if (filters?.sortBy) params.append('sort_by', filters.sortBy);
    if (filters?.order) params.append('order', filters.order);
    
    const response = await api.get(`/projects/${projectId}/values?${params.toString()}`);
    return response.data;
  },
};

// Export functions
export const exportApi = {
  // Export as CSV
  exportCsv: async (projectId: number, aggregateHours: number = 1): Promise<void> => {
    const response = await api.get(`/export/${projectId}/csv?aggregate_hours=${aggregateHours}`, {
      responseType: 'blob'
    });
    
    // Create download link
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `project_${projectId}_data_${aggregateHours}h.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  },

  // Export as JSON
  exportJson: async (projectId: number, aggregateHours: number = 1): Promise<void> => {
    const response = await api.get(`/export/${projectId}/json?aggregate_hours=${aggregateHours}`, {
      responseType: 'blob'
    });
    
    // Create download link
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `project_${projectId}_data_${aggregateHours}h.json`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  },
};

export default api; 