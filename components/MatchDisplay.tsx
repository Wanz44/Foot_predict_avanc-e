
import React, { useState } from 'react';
import { PredictionResult } from '../types';
import { 
  Zap, ChevronDown, ChevronUp, Activity, Target, Shield, Flame, Sparkles, Clock, Cpu, BarChart3, Sword, Crosshair, TrendingUp, Dumbbell, Trophy, PieChart as PieIcon, Search, Globe, LineChart as LineIcon, Layers, BoxSelect, AlertTriangle, Fingerprint, BrainCircuit, Waves, Timer, Dna, Banknote, Scale
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, RadarChart, PolarGrid, PolarAngleAxis, Radar, LineChart, Line, XAxis, YAxis, CartesianGrid, AreaChart, Area, BarChart, Bar } from 'recharts';

interface Props {
  data: PredictionResult;
  posterUrl: string | null;
}

const SectorGauge: React.FC<{ label: string; value: number; color: string; icon: React.ReactNode }> = ({ label, value, color, icon }) => (
  <div className="space-y-1.5">
    <div className="flex items-center justify-between text-[8px] font-black uppercase text-slate-400 px-1">
      <span className="flex items-center gap-1.5">{icon} {label}</span>
      <span style={{ color: color }}>{Math.round(value)}%</span>
    </div>
    <div className="h-1.5 bg-slate-800/80 rounded-full overflow-hidden border border-white/5">
      <div className="h-full transition-all duration-1000" style={{ width: `${Math.min(value, 100)}%`, backgroundColor: color }} />
    </div>
  </div>
);

const MatchDisplay: React.FC<Props> = ({ data, posterUrl }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const HOME_COLOR = '#10b981'; 
  const AWAY_COLOR = '#3b82f6'; 
  const DRAW_COLOR = '#64748b'; 

  const chartData = [
    { name: 'DOM', value: data.winProb, color: HOME_COLOR },
    { name: 'NUL', value: data.drawProb, color: DRAW_COLOR },
    { name: 'EXT', value: data.lossProb, color: AWAY_COLOR },
  ];

  const ensembleData = [
    { name: 'Poisson', weight: data.ensembleMetrics.poissonWeight * 100, color: '#f59e0b' },
    { name: 'M. Carlo', weight: data.ensembleMetrics.monteCarloWeight * 100, color: '#8b5cf6' },
    { name: 'Bayes', weight: data.ensembleMetrics.bayesianWeight * 100, color: '#ec4899' },
  ];

  const radarData = [
    { subject: 'Attaque', A: data.homeTeam.attackPower, B: data.awayTeam.attackPower, fullMark: 100 },
    { subject: 'Transition', A: data.homeTeam.midfieldPower, B: data.awayTeam.midfieldPower, fullMark: 100 },
    { subject: 'Défense', A: data.homeTeam.defensePower, B: data.awayTeam.defensePower, fullMark: 100 },
    { subject: 'Momentum', A: (data.homeTeam.momentum + 1) * 50, B: (data.awayTeam.momentum + 1) * 50, fullMark: 100 },
    { subject: 'Ensemble', A: data.ensembleMetrics.modelConvergence * 100, B: data.ensembleMetrics.modelConvergence * 95, fullMark: 100 },
  ];

  const timeSeriesData = data.timeSeriesAnalytics?.home.decomposition.trend.map((val, i) => ({
    name: `M${i+1}`,
    trend: val,
    seasonal: data.timeSeriesAnalytics?.home.decomposition.seasonal[i] || 0,
    residual: data.timeSeriesAnalytics?.home.decomposition.residual[i] || 0
  }));

  return (
    <div className="relative bg-slate-900/60 border border-white/5 rounded-[2.5rem] overflow-hidden shadow-2xl transition-all hover:border-indigo-500/30 group animate-in fade-in zoom-in-95 duration-700">
      
      <div className="absolute top-0 right-0 px-5 py-2 text-[8px] font-black uppercase tracking-[0.2em] rounded-bl-3xl z-10 flex items-center gap-3 bg-indigo-600/10 text-indigo-400 border-l border-b border-white/10 backdrop-blur-xl">
        <Dna size={12} className="animate-spin duration-[4000ms]" />
        ASE CORE v5.5 • ENSEMBLE LEARNING PIPELINE
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 items-center gap-8 p-8 md:p-12">
        <div className="md:col-span-3 space-y-10">
          <div className="space-y-4">
            <h3 className="text-base font-black uppercase tracking-tighter truncate" style={{ color: HOME_COLOR }}>{data.homeTeam.name}</h3>
            <div className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-2">
              <Scale size={12} className="text-emerald-500" />
              Weight: {Math.round(data.ensembleMetrics.monteCarloWeight * 100)}%
            </div>
            <div className="flex gap-1.5">
              {Array.from({length: 8}).map((_, i) => (
                <div key={i} className={`flex-1 h-1.5 rounded-full ${i < 6 ? 'bg-emerald-500/40' : 'bg-slate-800'}`} />
              ))}
            </div>
          </div>
          <div className="space-y-4">
            <h3 className="text-base font-black uppercase tracking-tighter truncate" style={{ color: AWAY_COLOR }}>{data.awayTeam.name}</h3>
            <div className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-2">
               <Scale size={12} className="text-blue-500" />
               Weight: {Math.round(data.ensembleMetrics.monteCarloWeight * 100)}%
            </div>
            <div className="flex gap-1.5">
              {Array.from({length: 8}).map((_, i) => (
                <div key={i} className={`flex-1 h-1.5 rounded-full ${i < 4 ? 'bg-blue-500/40' : 'bg-slate-800'}`} />
              ))}
            </div>
          </div>
        </div>

        <div className="md:col-span-4 flex flex-col items-center justify-center py-6">
          <div className="w-full h-[180px] relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={chartData} innerRadius={55} outerRadius={75} paddingAngle={8} dataKey="value" stroke="none">
                  {chartData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#020617', border: 'none', borderRadius: '16px', fontSize: '11px', fontWeight: 'bold' }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-[9px] font-black text-slate-500 tracking-widest uppercase text-center">Ensemble<br/>Agg.</span>
              <span className="text-xl font-black text-white italic">{data.confidenceIndex}%</span>
            </div>
          </div>
        </div>

        <div className="md:col-span-5 space-y-4">
          <div className="bg-slate-950/60 p-6 rounded-[2rem] border border-white/5 flex items-center justify-between shadow-inner">
            <div className="space-y-1.5">
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2 text-indigo-400">
                <Banknote size={14} /> Fair Odds Calculation
              </span>
              <div className="text-3xl font-black italic tracking-tighter text-white">
                {(100 / data.winProb).toFixed(2)} <span className="text-slate-800 px-2">|</span> 1/P
              </div>
            </div>
            <div className="bg-white/5 p-3 rounded-2xl">
              <TrendingUp size={20} className="text-emerald-500" />
            </div>
          </div>

          <div className="bg-indigo-600 p-6 rounded-[2rem] border border-white/10 flex items-center justify-between shadow-2xl shadow-indigo-600/30 group/score transition-all hover:scale-[1.03] active:scale-95">
            <div className="space-y-1.5">
              <span className="text-[10px] font-black text-indigo-100/60 uppercase tracking-widest flex items-center gap-2">
                <Sparkles size={14} /> Score Probable (Ensemble)
              </span>
              <div className="text-4xl font-black text-white italic tracking-tighter">{data.exactScore}</div>
            </div>
            <div className="bg-white/10 p-4 rounded-3xl backdrop-blur-md">
              <Trophy size={28} className="text-white" />
            </div>
          </div>
        </div>
      </div>

      <button 
        onClick={() => setIsExpanded(!isExpanded)} 
        className="w-full py-5 bg-white/[0.02] hover:bg-indigo-500/5 border-t border-white/5 flex items-center justify-center space-x-4 text-[11px] font-black uppercase tracking-[0.3em] text-slate-500 transition-all"
      >
        <Dna size={16} className="text-indigo-500" />
        <span>Accéder au Rapport de Diagnostic Pro</span>
        {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
      </button>

      {isExpanded && (
        <div className="p-10 md:p-14 bg-slate-950/90 border-t border-white/5 animate-in slide-in-from-top-6 duration-700">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            
            <div className="space-y-12">
              <div className="bg-slate-900/40 p-10 rounded-[3rem] border border-white/5 space-y-10 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 blur-[60px] rounded-full" />
                <h4 className="text-xs font-black uppercase tracking-widest text-indigo-400 mb-2 flex items-center gap-3">
                  <Layers size={16} /> Matrice d'Agrégation des Modèles
                </h4>
                
                <div className="h-[200px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={ensembleData} layout="vertical" margin={{ left: -20 }}>
                      <XAxis type="number" hide />
                      <YAxis dataKey="name" type="category" tick={{ fill: '#475569', fontSize: 10, fontWeight: 'bold' }} axisLine={false} tickLine={false} />
                      <Bar dataKey="weight" radius={[0, 10, 10, 0]} barSize={20}>
                        {ensembleData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                <div className="grid grid-cols-2 gap-8">
                  <SectorGauge label="Convergence" value={data.ensembleMetrics.modelConvergence * 100} color={HOME_COLOR} icon={<Activity size={14} />} />
                  <SectorGauge label="Entropy H(x)" value={(1 - data.bayesianMetrics?.entropy! / 1.58) * 100} color="#f59e0b" icon={<Waves size={14} />} />
                </div>
              </div>

              {data.valueBets.length > 0 && (
                <div className="bg-emerald-600/10 p-10 rounded-[3rem] border border-emerald-500/20 space-y-8">
                   <h4 className="text-xs font-black uppercase tracking-widest text-emerald-400 mb-2 flex items-center gap-3">
                     <Banknote size={16} /> Opportunités "Value Bets" Identifiées
                   </h4>
                   <div className="space-y-4">
                     {data.valueBets.map((bet, i) => (
                       <div key={i} className="flex items-center justify-between p-6 bg-emerald-500/5 border border-emerald-500/10 rounded-3xl group/bet transition-all hover:bg-emerald-500/10">
                         <div>
                            <div className="text-[9px] font-black text-emerald-500/60 uppercase tracking-widest mb-1">{bet.type}</div>
                            <div className="text-lg font-black text-white italic">Edge: +{bet.edge}%</div>
                         </div>
                         <div className="text-right">
                            <div className="text-[10px] font-bold text-slate-500 uppercase">Market: {bet.marketOdds}</div>
                            <div className="text-[10px] font-bold text-emerald-400 uppercase">Fair: {bet.fairOdds}</div>
                         </div>
                       </div>
                     ))}
                   </div>
                </div>
              )}
            </div>

            <div className="space-y-12">
              <div className="bg-slate-900/40 p-10 rounded-[3rem] border border-white/5 space-y-10 relative overflow-hidden">
                 <h4 className="text-xs font-black uppercase tracking-widest text-indigo-400 mb-2 flex items-center gap-3">
                   <Target size={16} /> Top 5 des Scores les plus Probables
                 </h4>
                 <div className="space-y-4">
                    {data.topScores.map((score, i) => (
                      <div key={i} className="flex items-center justify-between p-5 bg-white/[0.02] border border-white/5 rounded-3xl hover:bg-white/[0.05] transition-all">
                        <div className="flex items-center gap-5">
                          <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-[10px] font-black text-slate-500">{i+1}</div>
                          <span className="text-2xl font-black italic tracking-tighter text-white">{score.score}</span>
                        </div>
                        <span className="text-sm font-black text-indigo-400 italic">{score.prob.toFixed(2)}%</span>
                      </div>
                    ))}
                 </div>
              </div>

              <div className="bg-gradient-to-br from-indigo-500/10 via-transparent to-transparent p-10 rounded-[3rem] border border-indigo-500/20 relative shadow-2xl">
                 <div className="flex items-center gap-4 mb-8">
                   <div className="p-3 bg-indigo-600 rounded-2xl">
                     <Fingerprint size={20} className="text-white" />
                   </div>
                   <span className="text-[11px] font-black uppercase text-indigo-400 tracking-widest">Ensemble Learning Diagnostics</span>
                 </div>
                 <p className="text-base md:text-lg text-slate-200 leading-relaxed italic font-medium mb-10">
                   "{data.reasoning}"
                 </p>
                 <div className="pt-8 border-t border-white/5 grid grid-cols-2 gap-8">
                    <div>
                      <div className="text-[9px] font-black text-slate-600 uppercase tracking-widest mb-2">Simulations MC</div>
                      <div className="text-2xl font-black text-white italic">100,000 IT.</div>
                    </div>
                    <div>
                      <div className="text-[9px] font-black text-slate-600 uppercase tracking-widest mb-2">Confidence Index</div>
                      <div className="text-2xl font-black text-indigo-500 italic">{data.confidenceIndex}%</div>
                    </div>
                 </div>
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};

export default MatchDisplay;
