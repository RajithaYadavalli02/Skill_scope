import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles,
  Target,
  Award,
  AlertTriangle,
  ArrowRight,
  Clock,
  CheckCircle2,
  TrendingUp,
  BrainCircuit,
  BookOpen,
} from 'lucide-react';
import { api } from '../services/api';
import { UserProfile, ProgressSummary, AnalysisResponse } from '../types';
import { StatCard } from '../components/common/StatCard';
import { ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

interface DashboardProps {
  user: UserProfile | null;
}

export const DashboardPage: React.FC<DashboardProps> = ({ user }) => {
  const navigate = useNavigate();
  const [summary, setSummary] = useState<ProgressSummary | null>(null);
  const [analysis, setAnalysis] = useState<AnalysisResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const [sumRes, anaRes] = await Promise.all([
          api.getProgressSummary(),
          api.getAnalysis(user?.target_role_id || undefined),
        ]);
        setSummary(sumRes);
        setAnalysis(anaRes);
      } catch (err) {
        console.error('Error fetching dashboard metrics', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user]);

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="flex flex-col items-center space-y-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent"></div>
          <span className="text-sm font-medium text-slate-500">Calculating dual-engine metrics...</span>
        </div>
      </div>
    );
  }

  const score = analysis?.composite_readiness_score || 0;
  const gaugeData = [
    { name: 'Readiness', value: score },
    { name: 'Remaining', value: Math.max(100 - score, 0) },
  ];
  const gaugeColors = ['#4f46e5', '#e2e8f0'];

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-6 text-white shadow-lg">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="inline-flex items-center space-x-2 rounded-full bg-indigo-500/20 px-3 py-1 text-xs font-medium text-indigo-300 border border-indigo-400/20 mb-2">
              <BrainCircuit className="h-3.5 w-3.5" />
              <span>Dual-Engine Evaluation Active</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight">
              Welcome back, {user?.name || 'Student Engineer'}!
            </h1>
            <p className="mt-1 text-sm text-slate-300 max-w-xl">
              Target Track: <span className="font-semibold text-white">{analysis?.role_title || 'Software Engineering'}</span>.
              Your dynamic readiness analysis combines deterministic exact-skill logic with NLP vector space matching.
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={() => navigate('/analysis')}
              className="flex items-center space-x-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-semibold text-white hover:bg-indigo-500 transition shadow-md shadow-indigo-600/30"
            >
              <Sparkles className="h-4 w-4" />
              <span>Full Gap Analysis</span>
            </button>
            <button
              onClick={() => navigate('/roadmap')}
              className="flex items-center space-x-2 rounded-xl bg-slate-800 border border-slate-700 px-4 py-2.5 text-xs font-semibold text-slate-200 hover:bg-slate-700 transition"
            >
              <span>View Roadmap</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Primary KPI Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Composite Readiness"
          value={`${score}%`}
          subtitle={analysis?.readiness_band || 'Evaluating...'}
          icon={TrendingUp}
          badge={{
            text: score >= 70 ? 'Strong Fit' : score >= 40 ? 'Moderate Fit' : 'Upskilling Needed',
            variant: score >= 70 ? 'positive' : score >= 40 ? 'warning' : 'neutral',
          }}
          onClick={() => navigate('/analysis')}
        />

        <StatCard
          title="Skills in Profile"
          value={user?.skills.length || 0}
          subtitle="Acquired & categorized competencies"
          icon={Award}
          badge={{ text: 'Profile Active', variant: 'brand' }}
          onClick={() => navigate('/profile')}
        />

        <StatCard
          title="Critical Gaps"
          value={analysis?.rule_metrics.missing_critical_count || 0}
          subtitle="Mandatory core competencies to close"
          icon={AlertTriangle}
          badge={{
            text: (analysis?.rule_metrics.missing_critical_count || 0) === 0 ? 'None' : 'Urgent',
            variant: (analysis?.rule_metrics.missing_critical_count || 0) === 0 ? 'positive' : 'warning',
          }}
          onClick={() => navigate('/analysis')}
        />

        <StatCard
          title="Roadmap Progress"
          value={`${summary?.completion_percentage || 0}%`}
          subtitle={`${summary?.completed_milestones || 0} of ${summary?.total_milestones || 0} milestones done`}
          icon={CheckCircle2}
          badge={{ text: `${summary?.hours_invested || 0} hrs done`, variant: 'brand' }}
          onClick={() => navigate('/roadmap')}
        />
      </div>

      {/* Dual-Engine Showcase & Gauge Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Readiness Circular Gauge Card */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700">
                Placement Readiness Gauge
              </h2>
              <span className="text-xs text-slate-500 font-medium">Dynamic Metric</span>
            </div>
            <p className="mt-1 text-xs text-slate-500">
              Evaluated against industry standards for {analysis?.role_title}.
            </p>
          </div>

          <div className="relative my-4 flex h-48 items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={gaugeData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={75}
                  startAngle={90}
                  endAngle={-270}
                  dataKey="value"
                  stroke="none"
                >
                  {gaugeData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={gaugeColors[index]} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute flex flex-col items-center">
              <span className="text-3xl font-extrabold text-slate-900">{score}%</span>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-indigo-600">
                Fit Score
              </span>
            </div>
          </div>

          {/* Dual Engine breakdown pill */}
          <div className="rounded-xl bg-slate-50 p-3 border border-slate-100 space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-slate-600 font-medium">1. Rule-Based Match:</span>
              <span className="font-bold text-slate-900">{analysis?.rule_metrics.overall_match_percentage}%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-600 font-medium">2. NLP Cosine Similarity:</span>
              <span className="font-bold text-indigo-700">{analysis?.nlp_metrics.semantic_match_percentage}%</span>
            </div>
            <div className="pt-1 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-500">
              <span>Estimated Upskilling:</span>
              <span className="font-semibold text-slate-800">{analysis?.estimated_learning_weeks} weeks</span>
            </div>
          </div>
        </div>

        {/* Top Strengths & Urgent Priorities */}
        <div className="lg:col-span-2 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Top Strengths */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
              <div className="flex items-center space-x-2 text-emerald-700 font-bold text-sm mb-3">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                <span>Top Profile Strengths</span>
              </div>
              {analysis?.top_strengths && analysis.top_strengths.length > 0 ? (
                <ul className="space-y-2.5">
                  {analysis.top_strengths.map((str: string, idx: number) => (
                    <li key={idx} className="flex items-start space-x-2 text-xs text-slate-700">
                      <span className="flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                        ✓
                      </span>
                      <span>{str}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-xs text-slate-500 italic">No strong matches recorded yet. Add your skills in Profile.</p>
              )}
            </div>

            {/* Urgent Priorities */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
              <div className="flex items-center space-x-2 text-rose-700 font-bold text-sm mb-3">
                <AlertTriangle className="h-4 w-4 text-rose-600" />
                <span>Urgent Learning Priorities</span>
              </div>
              {analysis?.urgent_priorities && analysis.urgent_priorities.length > 0 ? (
                <ul className="space-y-2.5">
                  {analysis.urgent_priorities.map((gap: string, idx: number) => (
                    <li key={idx} className="flex items-start space-x-2 text-xs text-slate-700">
                      <span className="flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full bg-rose-100 text-rose-800 text-[10px] font-bold">
                        !
                      </span>
                      <span>{gap}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-xs text-emerald-600 font-medium">All core requirements met for this role!</p>
              )}
            </div>
          </div>

          {/* Quick Action Navigation Tiles */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <button
              onClick={() => navigate('/roles')}
              className="flex items-center justify-between rounded-xl bg-white border border-slate-200 p-4 shadow-sm hover:border-indigo-300 hover:bg-indigo-50/30 transition text-left"
            >
              <div>
                <div className="text-xs font-bold text-slate-900">Explore Roles</div>
                <div className="text-[11px] text-slate-500">Compare 9 tech tracks</div>
              </div>
              <Target className="h-4 w-4 text-indigo-600" />
            </button>

            <button
              onClick={() => navigate('/roadmap')}
              className="flex items-center justify-between rounded-xl bg-white border border-slate-200 p-4 shadow-sm hover:border-indigo-300 hover:bg-indigo-50/30 transition text-left"
            >
              <div>
                <div className="text-xs font-bold text-slate-900">Learning Plan</div>
                <div className="text-[11px] text-slate-500">3-phase milestones</div>
              </div>
              <Clock className="h-4 w-4 text-indigo-600" />
            </button>

            <button
              onClick={() => navigate('/resources')}
              className="flex items-center justify-between rounded-xl bg-white border border-slate-200 p-4 shadow-sm hover:border-indigo-300 hover:bg-indigo-50/30 transition text-left"
            >
              <div>
                <div className="text-xs font-bold text-slate-900">Resource Hub</div>
                <div className="text-[11px] text-slate-500">Docs & tutorials</div>
              </div>
              <BookOpen className="h-4 w-4 text-indigo-600" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
