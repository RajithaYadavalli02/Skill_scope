import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  Sparkles,
  Calculator,
  BrainCircuit,
  AlertTriangle,
  CheckCircle2,
  ArrowRight,
  TrendingUp,
  Clock,
  Layers,
  BookOpen,
  Info,
} from 'lucide-react';
import { api } from '../services/api';
import { AnalysisResponse, JobRoleSummary, UserProfile, MatchedSkillItem, GapItem, TransferableSkillCredit } from '../types';
import { ProficiencyBadge, CategoryBadge } from '../components/common/Badge';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from 'recharts';

interface AnalysisPageProps {
  user: UserProfile | null;
}

export const AnalysisPage: React.FC<AnalysisPageProps> = ({ user }) => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [roles, setRoles] = useState<JobRoleSummary[]>([]);
  const [analysis, setAnalysis] = useState<AnalysisResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'gaps' | 'strengths' | 'academic'>('all');

  const queryRoleId = searchParams.get('role_id');
  const activeRoleId = queryRoleId ? Number(queryRoleId) : (user?.target_role_id || 1);

  useEffect(() => {
    api.getRoles().then(setRoles).catch(console.error);
  }, []);

  useEffect(() => {
    const runAnalysis = async () => {
      try {
        setLoading(true);
        const data = await api.getAnalysis(activeRoleId);
        setAnalysis(data);
      } catch (err) {
        console.error('Error running dual-engine analysis', err);
      } finally {
        setLoading(false);
      }
    };

    runAnalysis();
  }, [activeRoleId, user]);

  const handleRoleChange = (newRoleId: number) => {
    setSearchParams({ role_id: newRoleId.toString() });
  };

  const handleGenerateRoadmap = () => {
    navigate(`/roadmap?role_id=${activeRoleId}`);
  };

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="flex flex-col items-center space-y-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent"></div>
          <span className="text-sm font-medium text-slate-500">
            Running Dual-Engine (Rule-Based + NLP TF-IDF) calculations...
          </span>
        </div>
      </div>
    );
  }

  // Prepare chart data comparing required level vs user level
  const chartData = [
    ...(analysis?.matched_skills || []).map((m: MatchedSkillItem) => ({
      name: m.skill_name,
      Required: m.required_level,
      Possessed: m.user_level,
      category: m.category,
    })),
    ...(analysis?.gaps || []).map((g: GapItem) => ({
      name: g.skill_name,
      Required: g.required_level,
      Possessed: g.user_level,
      category: g.category,
    })),
  ].slice(0, 10);

  return (
    <div className="space-y-6">
      {/* Top Banner & Role Selector */}
      <div className="rounded-2xl bg-white border border-slate-200 p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center space-x-2 rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700 mb-2">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Dual-Engine Dynamic Skill Gap Analysis</span>
            </div>
            <h1 className="text-xl font-bold text-slate-900">
              Evaluating Fit for: {analysis?.role_title}
            </h1>
            <p className="mt-1 text-xs text-slate-500">
              Deterministic Rule Engine formulas cross-referenced with NLP TF-IDF Cosine Vector Space Modeling.
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <span className="text-xs font-semibold text-slate-600 hidden sm:inline">Switch Target Role:</span>
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
          </div>
        </div>
      </div>

      {/* Composite Readiness Overview Scorecard */}
      <div className="rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-6 text-white shadow-md">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-center">
          <div className="md:col-span-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-300">
              Composite Readiness Score
            </span>
            <div className="mt-1 flex items-baseline space-x-3">
              <span className="text-4xl font-extrabold">{analysis?.composite_readiness_score}%</span>
              <span className="rounded-full bg-indigo-500/20 px-3 py-1 text-xs font-semibold text-indigo-200 border border-indigo-400/30">
                {analysis?.readiness_band}
              </span>
            </div>
            <p className="mt-2 text-xs text-slate-300">
              Calculated dynamically: <code className="bg-slate-800 px-1.5 py-0.5 rounded text-indigo-300">0.60 * RuleScore + 0.40 * NLPScore</code>
            </p>
          </div>

          <div className="text-xs space-y-2 border-t md:border-t-0 md:border-l border-slate-800 pt-4 md:pt-0 md:pl-6">
            <div className="flex justify-between">
              <span className="text-slate-400">Missing Critical Gaps:</span>
              <span className="font-bold text-rose-400">{analysis?.rule_metrics.missing_critical_count} skills</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Proficiency Deficits:</span>
              <span className="font-bold text-amber-300">{analysis?.rule_metrics.proficiency_deficit_count} skills</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Estimated Effort:</span>
              <span className="font-bold text-white">{analysis?.estimated_learning_hours} hrs ({analysis?.estimated_learning_weeks} wks)</span>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              onClick={handleGenerateRoadmap}
              className="flex items-center space-x-2 rounded-xl bg-indigo-600 px-4 py-3 text-xs font-bold text-white hover:bg-indigo-500 shadow-md shadow-indigo-600/30 transition w-full md:w-auto justify-center"
            >
              <span>Build Roadmap from Gaps</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Side-by-Side Dual-Engine Comparison Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ENGINE 1: RULE-BASED CALCULATION */}
        <div className="rounded-2xl bg-white border border-slate-200 p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
                  <Calculator className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">1. Deterministic Rule-Based Engine</h3>
                  <span className="text-[11px] text-slate-500">Mathematical Exact Matching</span>
                </div>
              </div>
              <span className="text-lg font-black text-slate-900">
                {analysis?.rule_metrics.overall_match_percentage}%
              </span>
            </div>

            <div className="mt-4 space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-slate-500 block">Core Requirements Match:</span>
                  <span className="text-base font-bold text-slate-800">
                    {analysis?.rule_metrics.core_skills_match_percentage}%
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-slate-500 block">Elective Skills Match:</span>
                  <span className="text-base font-bold text-slate-800">
                    {analysis?.rule_metrics.elective_skills_match_percentage}%
                  </span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-blue-50/50 border border-blue-100 text-[11px] text-slate-600 leading-relaxed">
                <span className="font-semibold text-blue-900 block mb-1">Mathematical Formula:</span>
                {analysis?.rule_metrics.formula_explanation}
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span>Mandatory Skills Matched:</span>
            <span className="font-semibold text-slate-800">
              {analysis?.rule_metrics.matched_required_skills} / {analysis?.rule_metrics.total_required_skills}
            </span>
          </div>
        </div>

        {/* ENGINE 2: GENUINE ML/NLP COMPONENT */}
        <div className="rounded-2xl bg-white border border-slate-200 p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600">
                  <BrainCircuit className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">2. Natural Language Processing (NLP) Engine</h3>
                  <span className="text-[11px] text-indigo-600 font-medium">TF-IDF Vector Space & Cosine Similarity</span>
                </div>
              </div>
              <span className="text-lg font-black text-indigo-700">
                {analysis?.nlp_metrics.semantic_match_percentage}%
              </span>
            </div>

            <div className="mt-4 space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-indigo-50/50 border border-indigo-100">
                <div className="flex justify-between items-center mb-1">
                  <span className="font-semibold text-indigo-900">Cosine Distance Metric:</span>
                  <span className="font-mono font-bold text-indigo-700">
                    {analysis?.nlp_metrics.cosine_similarity_score} / 1.000
                  </span>
                </div>
                <div className="text-[11px] text-slate-600">
                  High-dimensional vector dot product over technical unigrams and bigrams.
                </div>
              </div>

              {/* Transferable Skills Detected */}
              <div>
                <span className="text-[11px] font-semibold text-slate-700 block mb-1.5">
                  Semantic Transferable Skill Credits ({analysis?.nlp_metrics.transferable_skills.length || 0}):
                </span>
                {analysis?.nlp_metrics.transferable_skills && analysis.nlp_metrics.transferable_skills.length > 0 ? (
                  <div className="space-y-1.5">
                    {analysis.nlp_metrics.transferable_skills.map((t: TransferableSkillCredit, idx: number) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between rounded-lg bg-slate-50 p-2 text-[11px] border border-slate-100"
                      >
                        <div>
                          <span className="font-bold text-slate-800">{t.target_skill}</span>
                          <span className="text-slate-500"> ← credited from </span>
                          <span className="font-semibold text-indigo-700">{t.transferable_from}</span>
                        </div>
                        <span className="rounded bg-indigo-100 px-1.5 py-0.5 text-[10px] font-bold text-indigo-800">
                          +{t.credit_ratio}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-[11px] text-slate-400 italic">No transferable skill overlaps for this role.</p>
                )}
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span>Model:</span>
            <span className="font-mono text-indigo-700 font-semibold">{analysis?.nlp_metrics.vector_space_model}</span>
          </div>
        </div>
      </div>

      {/* Visual Chart: Required Level vs Possessed Level */}
      <div className="rounded-2xl bg-white border border-slate-200 p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Competency Level Gap Visualization</h3>
            <p className="text-xs text-slate-500">Required Level vs Current Acquired Level (Proficiency Scale 1 - 4)</p>
          </div>
          <span className="text-xs text-slate-400">Top 10 Benchmark Skills</span>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 20, left: -20, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} angle={-25} textAnchor="end" />
              <YAxis domain={[0, 4]} ticks={[1, 2, 3, 4]} tick={{ fontSize: 11 }} />
              <Tooltip />
              <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: 12 }} />
              <Bar dataKey="Required" fill="#94a3b8" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Possessed" fill="#4f46e5" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Detailed Tabs: Gaps, Strengths, Academic Defense */}
      <div className="rounded-2xl bg-white border border-slate-200 p-6 shadow-sm">
        <div className="flex space-x-2 border-b border-slate-200 pb-3">
          {[
            { id: 'all', label: `All Gaps (${analysis?.gaps.length || 0})` },
            { id: 'strengths', label: `Matched Strengths (${analysis?.matched_skills.length || 0})` },
            { id: 'academic', label: 'Academic Methodology & Defense' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                activeTab === tab.id
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="mt-4">
          {activeTab === 'all' && (
            <div className="space-y-2.5">
              {analysis?.gaps && analysis.gaps.length > 0 ? (
                analysis.gaps.map((gap: GapItem, idx: number) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between rounded-xl border border-slate-200 p-3.5 hover:bg-slate-50/50"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-xs text-slate-900">{gap.skill_name}</span>
                        <CategoryBadge category={gap.category} />
                        {gap.gap_type === 'critical_missing' && (
                          <span className="rounded bg-rose-50 px-2 py-0.5 text-[10px] font-bold text-rose-700 border border-rose-200">
                            Critical Missing
                          </span>
                        )}
                        {gap.gap_type === 'proficiency_deficit' && (
                          <span className="rounded bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-700 border border-amber-200">
                            Deficit (Lvl {gap.user_level} → {gap.required_level})
                          </span>
                        )}
                        {gap.gap_type === 'elective_missing' && (
                          <span className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-600">
                            Elective Missing
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500">{gap.importance_rationale}</p>
                    </div>

                    <div className="text-right">
                      <span className="text-xs font-semibold text-slate-700">Need Lvl {gap.required_level}</span>
                      <span className="block text-[10px] text-slate-400">Weight: {gap.weight}x</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center text-xs text-emerald-600 font-bold">
                  ✓ Outstanding! You have no skill gaps for {analysis?.role_title}.
                </div>
              )}
            </div>
          )}

          {activeTab === 'strengths' && (
            <div className="space-y-2.5">
              {analysis?.matched_skills && analysis.matched_skills.length > 0 ? (
                analysis.matched_skills.map((m: MatchedSkillItem, idx: number) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between rounded-xl border border-emerald-100 bg-emerald-50/20 p-3.5"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-xs text-slate-900">{m.skill_name}</span>
                        <CategoryBadge category={m.category} />
                        <span className="rounded bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                          Matched ({m.match_percentage}%)
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-500">
                        Required Lvl {m.required_level} | You have Lvl {m.user_level}
                      </span>
                    </div>

                    <ProficiencyBadge level={m.user_level} />
                  </div>
                ))
              ) : (
                <div className="p-8 text-center text-xs text-slate-400">
                  No matching skills found. Add your skills in the Profile tab.
                </div>
              )}
            </div>
          )}

          {activeTab === 'academic' && (
            <div className="rounded-xl bg-slate-50 p-5 border border-slate-200 space-y-4 text-xs">
              <div className="flex items-center space-x-2 text-indigo-700 font-bold">
                <Info className="h-4 w-4" />
                <span>Academic Defense & Final-Year Viva Justification</span>
              </div>

              <div className="space-y-3 text-slate-600 leading-relaxed">
                <div>
                  <h4 className="font-bold text-slate-800">1. Why Rule-Based Logic is Indispensable:</h4>
                  <p>{analysis?.academic_defense_notes.rule_engine_rationale}</p>
                </div>

                <div>
                  <h4 className="font-bold text-slate-800">2. Why TF-IDF and Cosine Similarity are Academically Sound:</h4>
                  <p>{analysis?.academic_defense_notes.nlp_component_rationale}</p>
                </div>

                <div>
                  <h4 className="font-bold text-slate-800">3. Integrity Declaration (No Fabricated Datasets):</h4>
                  <p className="font-semibold text-slate-700">{analysis?.academic_defense_notes.academic_integrity_declaration}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
