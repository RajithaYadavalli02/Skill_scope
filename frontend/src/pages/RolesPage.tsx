import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Briefcase,
  TrendingUp,
  DollarSign,
  CheckCircle,
  Sparkles,
  ArrowRight,
  Info,
  ShieldCheck,
} from 'lucide-react';
import { api } from '../services/api';
import { JobRoleSummary, JobRoleDetail, UserProfile, RoleSkillRequirement } from '../types';
import { ProficiencyBadge, CategoryBadge } from '../components/common/Badge';

interface RolesPageProps {
  user: UserProfile | null;
  onUserUpdate: () => void;
}

export const RolesPage: React.FC<RolesPageProps> = ({ user, onUserUpdate }) => {
  const navigate = useNavigate();
  const [roles, setRoles] = useState<JobRoleSummary[]>([]);
  const [selectedRoleDetail, setSelectedRoleDetail] = useState<JobRoleDetail | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [filterDepartment, setFilterDepartment] = useState<string>('All');

  useEffect(() => {
    api.getRoles().then(setRoles).catch(console.error);
  }, []);

  const departments = ['All', 'Software Engineering', 'Data & Analytics', 'Artificial Intelligence', 'Quality Assurance'];

  const filteredRoles = roles.filter((r) => {
    if (filterDepartment === 'All') return true;
    return r.department.toLowerCase().includes(filterDepartment.toLowerCase());
  });

  const handleInspectRole = async (roleId: number) => {
    try {
      setLoadingDetail(true);
      const detail = await api.getRoleDetail(roleId);
      setSelectedRoleDetail(detail);
    } catch (err) {
      console.error('Error fetching role detail', err);
    } finally {
      setLoadingDetail(false);
    }
  };

  const handleSetTargetRole = async (roleId: number) => {
    try {
      await api.updateProfile({ target_role_id: roleId });
      onUserUpdate();
      if (selectedRoleDetail) setSelectedRoleDetail(null);
    } catch (err) {
      console.error('Error setting target role', err);
    }
  };

  const handleAnalyzeFit = (roleId: number) => {
    navigate(`/analysis?role_id=${roleId}`);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="rounded-2xl bg-white border border-slate-200 p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center space-x-2 rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700 mb-2">
              <Briefcase className="h-3.5 w-3.5" />
              <span>9 Supported Industry Career Tracks</span>
            </div>
            <h1 className="text-xl font-bold text-slate-900">Job-Role Catalogue & Competency Benchmarks</h1>
            <p className="mt-1 text-xs text-slate-500 max-w-2xl">
              Each track is benchmarked against real-world engineering standards, featuring mandatory core technologies,
              recommended electives, and transparent weightings for dual-engine evaluation.
            </p>
          </div>

          <div className="flex flex-wrap gap-1.5 self-start md:self-auto">
            {departments.map((dept) => (
              <button
                key={dept}
                onClick={() => setFilterDepartment(dept)}
                className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                  filterDepartment === dept
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {dept}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Role Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredRoles.map((role) => {
          const isCurrentTarget = user?.target_role_id === role.id;

          return (
            <div
              key={role.id}
              className={`flex flex-col justify-between rounded-2xl border bg-white p-5 shadow-sm transition hover:shadow-md ${
                isCurrentTarget
                  ? 'border-indigo-500 ring-2 ring-indigo-500/10'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <div>
                <div className="flex items-start justify-between">
                  <span className="text-[11px] font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
                    {role.department}
                  </span>
                  {isCurrentTarget && (
                    <span className="inline-flex items-center space-x-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700 border border-emerald-200">
                      <ShieldCheck className="h-3 w-3" />
                      <span>Active Target</span>
                    </span>
                  )}
                </div>

                <h2 className="mt-2 text-base font-bold text-slate-900">{role.title}</h2>
                <p className="mt-1 text-xs text-slate-500 line-clamp-2 leading-relaxed">
                  {role.description}
                </p>

                <div className="mt-4 pt-3 border-t border-slate-100 grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="text-slate-400 block">Market Demand:</span>
                    <span className="font-semibold text-slate-700">{role.market_demand}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Salary Band:</span>
                    <span className="font-semibold text-slate-700 line-clamp-1">{role.salary_range}</span>
                  </div>
                </div>

                <div className="mt-3 flex items-center justify-between text-xs text-slate-500 bg-slate-50 p-2 rounded-lg">
                  <span>Core Requirements:</span>
                  <span className="font-bold text-slate-800">{role.core_skills_count} skills</span>
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-slate-100 flex items-center space-x-2">
                <button
                  onClick={() => handleInspectRole(role.id)}
                  className="flex-1 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
                >
                  View Details
                </button>
                <button
                  onClick={() => handleAnalyzeFit(role.id)}
                  className="flex items-center justify-center space-x-1 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-indigo-500 transition shadow-xs"
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>Analyze Fit</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Role Requirements Detail Modal */}
      {selectedRoleDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-2xl max-h-[85vh] overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl border border-slate-200">
            <div className="flex items-start justify-between pb-4 border-b border-slate-100">
              <div>
                <span className="text-[11px] font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
                  {selectedRoleDetail.department}
                </span>
                <h3 className="mt-1 text-lg font-bold text-slate-900">{selectedRoleDetail.title}</h3>
                <p className="text-xs text-slate-500 mt-0.5">{selectedRoleDetail.overview}</p>
              </div>
              <button
                onClick={() => setSelectedRoleDetail(null)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <div className="mt-4 space-y-4 text-xs">
              <div>
                <h4 className="font-bold text-slate-800 mb-1">Key Responsibilities</h4>
                <p className="text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">
                  {selectedRoleDetail.key_responsibilities}
                </p>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-bold text-slate-800">
                    Required Competencies ({selectedRoleDetail.requirements.length})
                  </h4>
                  <span className="text-[11px] text-slate-400">Weighted for evaluation</span>
                </div>

                <div className="space-y-2">
                  {selectedRoleDetail.requirements.map((req: RoleSkillRequirement) => (
                    <div
                      key={req.id}
                      className="flex items-center justify-between rounded-xl border border-slate-200 p-3 hover:bg-slate-50/50"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <span className="font-bold text-slate-900">{req.skill_name}</span>
                          <CategoryBadge category={req.category} />
                          {req.is_required ? (
                            <span className="rounded bg-rose-50 px-1.5 py-0.5 text-[10px] font-bold text-rose-700 border border-rose-200">
                              Core Mandatory
                            </span>
                          ) : (
                            <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium text-slate-600">
                              Elective
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-500">{req.importance_rationale}</p>
                      </div>

                      <div className="text-right">
                        <ProficiencyBadge level={req.required_level} />
                        <span className="block text-[10px] text-slate-400 mt-1">Weight: {req.weight}x</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
              <button
                onClick={() => handleSetTargetRole(selectedRoleDetail.id)}
                className="rounded-lg border border-indigo-200 bg-indigo-50 px-4 py-2 text-xs font-semibold text-indigo-700 hover:bg-indigo-100 transition"
              >
                Set as My Active Target Track
              </button>

              <button
                onClick={() => {
                  const roleId = selectedRoleDetail.id;
                  setSelectedRoleDetail(null);
                  handleAnalyzeFit(roleId);
                }}
                className="rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-500 transition shadow-sm flex items-center space-x-1"
              >
                <Sparkles className="h-3.5 w-3.5" />
                <span>Run Gap Analysis Now</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
