import axios from 'axios';
import {
  UserProfile,
  SkillMaster,
  UserSkill,
  JobRoleSummary,
  JobRoleDetail,
  AnalysisResponse,
  RoleComparisonItem,
  RoadmapResponse,
  RoadmapMilestone,
  LearningResource,
  ProgressSummary,
  ProgressHistoryItem,
  PersonaPreset,
} from '../types';

const API_BASE = '/api/v1';

const apiClient = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const api = {
  // Profile
  getProfile: async (): Promise<UserProfile> => {
    const res = await apiClient.get<UserProfile>('/profile');
    return res.data;
  },

  updateProfile: async (data: Partial<UserProfile>): Promise<UserProfile> => {
    const res = await apiClient.put<UserProfile>('/profile', data);
    return res.data;
  },

  getAllSkills: async (): Promise<SkillMaster[]> => {
    const res = await apiClient.get<SkillMaster[]>('/profile/skills/catalog');
    return res.data;
  },

  addUserSkill: async (skillId: number, proficiencyLevel: number, yearsExperience: number = 1.0): Promise<UserSkill> => {
    const res = await apiClient.post<UserSkill>('/profile/skills', {
      skill_id: skillId,
      proficiency_level: proficiencyLevel,
      years_experience: yearsExperience,
    });
    return res.data;
  },

  updateUserSkill: async (userSkillId: number, proficiencyLevel: number, yearsExperience: number): Promise<UserSkill> => {
    const res = await apiClient.put<UserSkill>(`/profile/skills/${userSkillId}`, {
      proficiency_level: proficiencyLevel,
      years_experience: yearsExperience,
    });
    return res.data;
  },

  deleteUserSkill: async (userSkillId: number): Promise<void> => {
    await apiClient.delete(`/profile/skills/${userSkillId}`);
  },

  getPresets: async (): Promise<PersonaPreset[]> => {
    const res = await apiClient.get<PersonaPreset[]>('/profile/presets');
    return res.data;
  },

  applyPreset: async (presetId: string): Promise<UserProfile> => {
    const res = await apiClient.post<UserProfile>(`/profile/presets/${presetId}/apply`);
    return res.data;
  },

  // Roles
  getRoles: async (): Promise<JobRoleSummary[]> => {
    const res = await apiClient.get<JobRoleSummary[]>('/roles');
    return res.data;
  },

  getRoleDetail: async (identifier: string | number): Promise<JobRoleDetail> => {
    const res = await apiClient.get<JobRoleDetail>(`/roles/${identifier}`);
    return res.data;
  },

  // Analysis
  getAnalysis: async (roleId?: number): Promise<AnalysisResponse> => {
    const params = roleId ? { role_id: roleId } : {};
    const res = await apiClient.get<AnalysisResponse>('/analysis', { params });
    return res.data;
  },

  compareAllRoles: async (): Promise<RoleComparisonItem[]> => {
    const res = await apiClient.get<RoleComparisonItem[]>('/analysis/compare-all');
    return res.data;
  },

  // Roadmap
  getRoadmap: async (roleId?: number): Promise<RoadmapResponse> => {
    const params = roleId ? { role_id: roleId } : {};
    const res = await apiClient.get<RoadmapResponse>('/roadmap', { params });
    return res.data;
  },

  regenerateRoadmap: async (roleId?: number): Promise<RoadmapResponse> => {
    const params = roleId ? { role_id: roleId } : {};
    const res = await apiClient.post<RoadmapResponse>('/roadmap/generate', null, { params });
    return res.data;
  },

  updateMilestoneStatus: async (milestoneId: number, status: 'pending' | 'in_progress' | 'completed'): Promise<RoadmapMilestone> => {
    const res = await apiClient.patch<RoadmapMilestone>(`/roadmap/milestones/${milestoneId}`, { status });
    return res.data;
  },

  // Resources
  getResources: async (params?: { skill_id?: number; role_slug?: string; resource_type?: string; search?: string }): Promise<LearningResource[]> => {
    const res = await apiClient.get<LearningResource[]>('/resources', { params });
    return res.data;
  },

  // Progress
  getProgressSummary: async (): Promise<ProgressSummary> => {
    const res = await apiClient.get<ProgressSummary>('/progress/summary');
    return res.data;
  },

  getProgressHistory: async (): Promise<ProgressHistoryItem[]> => {
    const res = await apiClient.get<ProgressHistoryItem[]>('/progress/history');
    return res.data;
  },
};

