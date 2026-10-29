import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  Map,
  CheckCircle2,
  Clock,
  RotateCw,
  BookOpen,
  ArrowRight,
  Sparkles,
  ChevronRight,
  ShieldAlert,
} from 'lucide-react';
import { api } from '../services/api';
import { RoadmapResponse, UserProfile, JobRoleSummary, RoadmapPhase, RoadmapMilestone } from '../types';
import { ProficiencyBadge } from '../components/common/Badge';

interface RoadmapPageProps {
  user: UserProfile | null;
}

export const RoadmapPage: React.FC<RoadmapPageProps> = ({ user }) => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [roles, setRoles] = useState<JobRoleSummary[]>([]);
  const [roadmap, setRoadmap] = useState<RoadmapResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [regenerating, setRegenerating] = useState(false);

  const queryRoleId = searchParams.get('role_id');
  const activeRoleId = queryRoleId ? Number(queryRoleId) : (user?.target_role_id || 1);

  useEffect(() => {
    api.getRoles().then(setRoles).catch(console.error);
  }, []);

  useEffect(() => {
    fetchRoadmap(activeRoleId);
  }, [activeRoleId, user]);

  const fetchRoadmap = async (roleId: number) => {
    try {
      setLoading(true);
      const data = await api.getRoadmap(roleId);
      setRoadmap(data);
    } catch (err) {
      console.error('Error fetching roadmap', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = (newRoleId: number) => {
    setSearchParams({ role_id: newRoleId.toString() });
  };

  const handleToggleStatus = async (milestoneId: number, currentStatus: string) => {
    const nextStatus =
      currentStatus === 'completed'
        ? 'pending'
        : currentStatus === 'in_progress'
        ? 'completed'
        : 'in_progress';

    try {
      await api.updateMilestoneStatus(milestoneId, nextStatus as any);
      fetchRoadmap(activeRoleId);
    } catch (err) {
      console.error('Error updating milestone status', err);
    }
  };

  const handleRegenerate = async () => {
    try {
      setRegenerating(true);
      const data = await api.regenerateRoadmap(activeRoleId);
      setRoadmap(data);
    } catch (err) {
      console.error('Error regenerating roadmap', err);
    } finally {
      setRegenerating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="flex flex-col items-center space-y-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent"></div>
          <span className="text-sm font-medium text-slate-500">Generating personalized roadmap...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Roadmap Header & Actions */}
      <div className="rounded-2xl bg-white border border-slate-200 p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center space-x-2 rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700 mb-2">
              <Map className="h-3.5 w-3.5" />
              <span>Dynamic 3-Phase Career Roadmap</span>
            </div>
            <h1 className="text-xl font-bold text-slate-900">
              Personalized Learning Plan: {roadmap?.role_title}
            </h1>
            <p className="mt-1 text-xs text-slate-500">
              Milestones are synthesized dynamically to address your specific skill gaps and proficiency deficits.
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <select
              value={activeRoleId}
              onChange={(e) => handleRoleChange(Number(e.target.value))}
              className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-800 shadow-xs focus:border-indigo-500 focus:outline-none"
            >
              {roles.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.title}
                </option>
              ))}
            </select>

            <button
              onClick={handleRegenerate}
              disabled={regenerating}
              className="flex items-center space-x-2 rounded-xl bg-slate-900 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800 transition shadow-sm disabled:opacity-50"
            >
              <RotateCw className={`h-3.5 w-3.5 ${regenerating ? 'animate-spin' : ''}`} />
              <span>{regenerating ? 'Syncing...' : 'Regenerate'}</span>
            </button>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mt-6 pt-4 border-t border-slate-100">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="font-semibold text-slate-700">Roadmap Completion</span>
            <span className="font-bold text-indigo-600">{roadmap?.completion_percentage}%</span>
          </div>
          <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
            <div
              className="h-full bg-indigo-600 transition-all duration-500 rounded-full"
              style={{ width: `${roadmap?.completion_percentage || 0}%` }}
            ></div>
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500">
            <span>{roadmap?.completed_milestones} of {roadmap?.total_milestones} milestones finished</span>
            <span>Total estimated effort: ~{roadmap?.total_estimated_hours} study hours</span>
          </div>
        </div>
      </div>

      {/* Phased Milestones List */}
      <div className="space-y-6">
        {roadmap?.phases.map((phase: RoadmapPhase) => (
          <div
            key={phase.phase_number}
            className="rounded-2xl bg-white border border-slate-200 p-6 shadow-sm space-y-4"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-2">
              <div className="flex items-center space-x-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-indigo-100 text-indigo-800 text-xs font-bold">
                  {phase.phase_number}
                </span>
                <h3 className="text-sm font-bold text-slate-900">{phase.phase_title}</h3>
              </div>
              <span className="text-xs text-slate-500 font-medium bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-100">
                ~{phase.total_hours} Hours Allocated
              </span>
            </div>

            <div className="space-y-3">
              {phase.milestones.map((milestone: RoadmapMilestone) => {
                const isCompleted = milestone.status === 'completed';
                const isInProgress = milestone.status === 'in_progress';

                return (
                  <div
                    key={milestone.id}
                    className={`flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl border transition ${
                      isCompleted
                        ? 'bg-emerald-50/30 border-emerald-200'
                        : isInProgress
                        ? 'bg-indigo-50/30 border-indigo-200'
                        : 'bg-slate-50/50 border-slate-200 hover:bg-white'
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      <button
                        onClick={() => handleToggleStatus(milestone.id, milestone.status)}
                        className={`mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-md border text-xs transition ${
                          isCompleted
                            ? 'bg-emerald-600 border-emerald-600 text-white'
                            : isInProgress
                            ? 'bg-indigo-600 border-indigo-600 text-white'
                            : 'border-slate-300 bg-white text-transparent hover:border-slate-400'
                        }`}
                      >
                        ✓
                      </button>

                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <span
                            className={`text-xs font-bold ${
                              isCompleted ? 'text-slate-500 line-through' : 'text-slate-900'
                            }`}
                          >
                            {milestone.title}
                          </span>
                          {isCompleted && (
                            <span className="rounded bg-emerald-100 px-1.5 py-0.2 text-[10px] font-bold text-emerald-800">
                              Done
                            </span>
                          )}
                          {isInProgress && (
                            <span className="rounded bg-indigo-100 px-1.5 py-0.2 text-[10px] font-bold text-indigo-800 animate-pulse">
                              In Progress
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-500 max-w-2xl leading-relaxed">
                          {milestone.description}
                        </p>
                      </div>
                    </div>

                    <div className="mt-3 sm:mt-0 flex items-center space-x-3 self-end sm:self-center pl-8 sm:pl-0">
                      <span className="text-[11px] text-slate-500 font-medium">
                        {milestone.estimated_hours} hrs
                      </span>

                      {milestone.skill_id && (
                        <button
                          onClick={() => navigate(`/resources?skill_id=${milestone.skill_id}`)}
                          className="flex items-center space-x-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-semibold text-indigo-600 hover:bg-indigo-50 transition"
                        >
                          <BookOpen className="h-3 w-3" />
                          <span>Resources</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
