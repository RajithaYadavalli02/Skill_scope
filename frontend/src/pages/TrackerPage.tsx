
import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  Award,
  Clock,
  CheckCircle2,
  BarChart2,
} from 'lucide-react';
import { api } from '../services/api';
import { ProgressSummary, ProgressHistoryItem, UserProfile } from '../types';
import { StatCard } from '../components/common/StatCard';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from 'recharts';

interface TrackerPageProps {
  user: UserProfile | null;
}

export const TrackerPage: React.FC<TrackerPageProps> = ({ user }) => {
  const [summary, setSummary] = useState<ProgressSummary | null>(null);
  const [history, setHistory] = useState<ProgressHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    setLoading(true);

    Promise.all([
      api.getProgressSummary(),
      api.getProgressHistory(),
    ])
      .then(([s, h]) => {
        if (active) {
          setSummary(s);
          setHistory(h);
        }
      })
      .catch((error) => {
        console.error('Failed to load progress history:', error);
      })
      .finally(() => {
        if (active) {
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [user]);

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="flex flex-col items-center space-y-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
          <span className="text-sm font-medium text-slate-500">
            Loading progress history...
          </span>
        </div>
      </div>
    );
  }

  // Sort history by timestamp, oldest to newest.
  const chartData = [...history]
    .sort((a, b) => {
      const timeA = new Date(a.created_at.replace(' ', 'T')).getTime();
      const timeB = new Date(b.created_at.replace(' ', 'T')).getTime();

      // Keep invalid timestamps at the end rather than breaking the chart.
      if (Number.isNaN(timeA)) return 1;
      if (Number.isNaN(timeB)) return -1;

      return timeA - timeB;
    })
    .map((item, index) => ({
      time: item.created_at,
      run: index + 1,
      Composite: item.hybrid_score,
      RuleBased: item.rule_score,
      NLP: item.nlp_score,
    }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <div className="mb-2 inline-flex items-center space-x-2 rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700">
              <TrendingUp className="h-3.5 w-3.5" />
              <span>Career Growth &amp; Preparation Analytics</span>
            </div>
            <h1 className="text-xl font-bold text-slate-900">
              Continuous Readiness Tracker
            </h1>
            <p className="mt-1 text-xs text-slate-500">
              Track how your hiring readiness evolves as you acquire competencies
              and complete personalized roadmap milestones.
            </p>
          </div>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Current Fit Score"
          value={`${summary?.composite_readiness_score ?? 0}%`}
          subtitle={summary?.readiness_band}
          icon={TrendingUp}
          badge={{ text: 'Live', variant: 'brand' }}
        />
        <StatCard
          title="Completed Milestones"
          value={summary?.completed_milestones ?? 0}
          subtitle={`Out of ${summary?.total_milestones ?? 0} total milestones`}
          icon={CheckCircle2}
          badge={{
            text: `${summary?.completion_percentage ?? 0}% done`,
            variant: 'positive',
          }}
        />
        <StatCard
          title="Hours Invested"
          value={`${summary?.hours_invested ?? 0} hrs`}
          subtitle="Dedicated skill-building effort"
          icon={Clock}
          badge={{ text: 'Verified', variant: 'neutral' }}
        />
        <StatCard
          title="Active Skills"
          value={summary?.total_skills_acquired ?? 0}
          subtitle="Competencies registered in profile"
          icon={Award}
          badge={{ text: 'Profile', variant: 'brand' }}
        />
      </div>

      {/* Historical Readiness Trend Chart */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Readiness Score Evolution Over Time
            </h3>
            <p className="text-xs text-slate-500">
              Tracking Rule Match %, NLP Semantic %, and Composite Score across sessions
            </p>
          </div>
          <span className="text-xs font-medium text-slate-400">
            Historical Runs
          </span>
        </div>

        {chartData.length < 2 ? (
          <div className="flex h-64 flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 p-6 text-center">
            <BarChart2 className="mb-2 h-8 w-8 text-slate-400" />
            <p className="text-xs font-semibold text-slate-700">
              Not enough history data yet.
            </p>
            <p className="mt-1 text-[11px] text-slate-400">
              Add skills in Profile or test different personas to observe historical trajectory.
            </p>
          </div>
        ) : (
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={chartData}
                margin={{ top: 10, right: 30, left: -10, bottom: 15 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#f1f5f9"
                />
                <XAxis
                  dataKey="run"
                  type="number"
                  domain={['dataMin', 'dataMax']}
                  allowDecimals={false}
                  tick={{ fontSize: 11 }}
                  label={{
                    value: 'Evaluation Run (oldest to newest)',
                    position: 'insideBottom',
                    offset: -8,
                    fontSize: 11,
                  }}
                  height={45}
                />
                <YAxis
                  domain={[0, 100]}
                  tick={{ fontSize: 11 }}
                  tickFormatter={(value: number) => `${value}%`}
                />
                <Tooltip
                  labelFormatter={(run) => {
                    const entry = chartData.find(
                      (item) => item.run === Number(run)
                    );
                    return entry
                      ? `Run ${run} — ${entry.time}`
                      : `Run ${run}`;
                  }}
                  formatter={(value) => [`${value}%`]}
                />
                <Legend
                  verticalAlign="top"
                  height={36}
                  wrapperStyle={{ fontSize: 12 }}
                />
                <Line
                  type="monotone"
                  dataKey="Composite"
                  stroke="#4f46e5"
                  strokeWidth={3}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                />
                <Line
                  type="monotone"
                  dataKey="RuleBased"
                  stroke="#0284c7"
                  strokeWidth={2}
                  strokeDasharray="4 4"
                  dot={{ r: 3 }}
                />
                <Line
                  type="monotone"
                  dataKey="NLP"
                  stroke="#8b5cf6"
                  strokeWidth={2}
                  strokeDasharray="2 2"
                  dot={{ r: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Evaluation Logs Table */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="mb-3 text-sm font-bold text-slate-900">
          Recent Evaluation Snapshots
        </h3>

        {history.length === 0 ? (
          <p className="text-xs italic text-slate-500">
            No evaluation records saved yet.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-200 bg-slate-50 text-slate-500">
                <tr>
                  <th className="px-3 py-2.5 font-semibold">Timestamp</th>
                  <th className="px-3 py-2.5 font-semibold">Evaluated Role</th>
                  <th className="px-3 py-2.5 font-semibold">Rule Match</th>
                  <th className="px-3 py-2.5 font-semibold">NLP Match</th>
                  <th className="px-3 py-2.5 font-semibold">Composite Score</th>
                  <th className="px-3 py-2.5 font-semibold">Critical Gaps</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {[...history]
                  .sort((a, b) => {
                    const timeA = new Date(a.created_at.replace(' ', 'T')).getTime();
                    const timeB = new Date(b.created_at.replace(' ', 'T')).getTime();

                    if (Number.isNaN(timeA)) return 1;
                    if (Number.isNaN(timeB)) return -1;

                    return timeB - timeA;
                  })
                  .map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/50">
                      <td className="px-3 py-2.5 text-slate-500">
                        {item.created_at}
                      </td>
                      <td className="px-3 py-2.5 font-semibold text-slate-900">
                        {item.role_title}
                      </td>
                      <td className="px-3 py-2.5">{item.rule_score}%</td>
                      <td className="px-3 py-2.5 font-medium text-indigo-700">
                        {item.nlp_score}%
                      </td>
                      <td className="px-3 py-2.5">
                        <span className="rounded border border-indigo-100 bg-indigo-50 px-2 py-0.5 font-bold text-slate-900">
                          {item.hybrid_score}%
                        </span>
                      </td>
                      <td className="px-3 py-2.5">
                        {item.critical_gaps_count > 0 ? (
                          <span className="font-medium text-rose-600">
                            {item.critical_gaps_count} missing
                          </span>
                        ) : (
                          <span className="font-medium text-emerald-600">
                            None
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
