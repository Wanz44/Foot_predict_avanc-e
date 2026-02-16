
import React, { useState } from 'react';
import { PredictionResult } from '../types';
import { 
  Zap, ChevronDown, ChevronUp, Activity, Target, Shield, Flame, Sparkles, Clock, Cpu, BarChart3, Sword, Crosshair, TrendingUp, Dumbbell, Trophy, PieChart as PieIcon, Search, Globe, LineChart as LineIcon, Layers, BoxSelect, AlertTriangle, Fingerprint, BrainCircuit, Waves, Timer, Dna, Banknote, Scale, Percent, Share2, Check
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
    <div className="h-1 bg-slate-800/80 rounded-full overflow-hidden border border-white/5">
      <div className="h-full transition-all duration-1000" style={{ width: `${Math.min(value, 100)}%`, backgroundColor: color }} />
    </div>
  </div>
);

const MatchDisplay: React.FC<Props> = ({ data, posterUrl }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  
  const HOME_COLOR = '#10b981'; 
  const AWAY_COLOR = '#3b82f6'; 
  const DRAW_COLOR = '#64748b'; 

  const radarData = [
    { subject: 'Attaque', A: data.homeTeam.attackPower, B: data.awayTeam.attackPower, fullMark: 100 },
    { subject: 'Transition', A: data.homeTeam.midfieldPower, B: data.awayTeam.midfieldPower, fullMark: 100 },
    { subject: 'Défense', A: data.homeTeam.defensePower, B: data.awayTeam.defensePower, fullMark: 100 },
    { subject: 'Momentum', A: (data.homeTeam.momentum + 1) * 50, B: (data.awayTeam.momentum + 1) * 50, fullMark: 100 },
    { subject: 'Ensemble', A: data.ensembleMetrics.modelConvergence * 100, B: data.ensembleMetrics.modelConvergence * 95, fullMark: 100 },
  ];

  const copySummary = () => {
    const summary = `⚽ FootyPredict AI (ASE v5.5)\n${data.homeTeam.name} vs ${data.awayTeam.name}\n🎯 Score Probable: ${data.exactScore}\n🎲 Probabilités: 1: ${data.winProb}% | N: ${data.drawProb}% | 2: ${data.lossProb}%\n📈 xG: ${data.expectedGoals.home.toFixed(2)} - ${data.expectedGoals.away.toFixed(2)}\n💎 Confidence: ${data.confidenceIndex}%`;
    navigator.clipboard.writeText(summary);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <div className="relative bg-slate-900/40 border border-white/5 rounded-[2rem] overflow-hidden shadow-xl transition-all hover:border-indigo-500/20 group animate-in fade-in zoom-in-95 duration-500">
      
      {/* Barre de statut supérieure ultra-compacte */}
      <div className="flex items-center justify-between px-6 py-2 bg-slate-950/40 border-b border-white/5">
        <div className="flex items-center gap-3">
          <Dna size={12} className="text-indigo-500 animate-spin duration-[5000ms]" />
          <span className="text-[8px] font-black uppercase tracking-[0.3em] text-slate-500">ASE v5.5 • Hybrid Intelligence</span>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={copySummary}
            className={`flex items-center gap-1.5 transition-all px-2 py-0.5 rounded-lg ${isCopied ? 'text-emerald-400 bg-emerald-400/10' : 'text-slate-500 hover:text-white'}`}
          >
            {isCopied ? <Check size={10} /> : <Share2 size={10} />}
            <span className="text-[9px] font-black uppercase tracking-widest">{isCopied ? 'COPIÉ !' : 'PARTAGER'}</span>
          </button>
          <div className="flex items-center gap-1.5 border-l border-white/10 pl-4">
            <Percent size={10} className="text-indigo-400" />
            <span className="text-[10px] font-black text-indigo-400 italic">CONFIANCE: {data.confidenceIndex}%</span>
          </div>
        </div>
      </div>

      <div className="p-6 md:p-8">
        {/* Ligne Principale: Équipes et Score */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          
          <div className="md:col-span-4 flex items-center justify-between gap-4">
            <div className="flex-1 text-right">
              <h3 className="text-sm md:text-lg font-black uppercase tracking-tighter truncate text-slate-200">{data.homeTeam.name}</h3>
              <div className="text-[9px] font-bold text-slate-500 uppercase flex items-center justify-end gap-1.5">
                xG: {data.expectedGoals.home.toFixed(2)} <Target size={10} className="text-emerald-500" />
              </div>
            </div>
            <div className="w-10 h-10 rounded-2xl bg-slate-800/50 flex items-center justify-center border border-white/5 text-[10px] font-black text-slate-400">
              DOM
            </div>
          </div>

          <div className="md:col-span-4 flex flex-col items-center justify-center gap-3">
            <div className="bg-indigo-600 px-8 py-3 rounded-2xl shadow-lg shadow-indigo-600/20 border border-white/10 group-hover:scale-105 transition-transform duration-500">
              <div className="text-3xl font-black text-white italic tracking-tighter leading-none">{data.exactScore}</div>
            </div>
            <div className="text-[8px] font-black text-slate-600 uppercase tracking-[0.2em]">Score Probable</div>
          </div>

          <div className="md:col-span-4 flex items-center justify-between gap-4">
            <div className="w-10 h-10 rounded-2xl bg-slate-800/50 flex items-center justify-center border border-white/5 text-[10px] font-black text-slate-400">
              EXT
            </div>
            <div className="flex-1 text-left">
              <h3 className="text-sm md:text-lg font-black uppercase tracking-tighter truncate text-slate-200">{data.awayTeam.name}</h3>
              <div className="text-[9px] font-bold text-slate-500 uppercase flex items-center justify-start gap-1.5">
                <Target size={10} className="text-blue-500" /> xG: {data.expectedGoals.away.toFixed(2)}
              </div>
            </div>
          </div>
        </div>

        {/* Barre de Probabilité 1X2 Compacte */}
        <div className="mt-8 space-y-2">
          <div className="flex h-2.5 rounded-full overflow-hidden border border-white/5 shadow-inner bg-slate-950">
            <div className="h-full transition-all duration-1000 relative group/prob" style={{ width: `${data.winProb}%`, backgroundColor: HOME_COLOR }}>
              <div className="absolute inset-0 bg-white/10 opacity-0 group-hover/prob:opacity-100 transition-opacity" />
            </div>
            <div className="h-full transition-all duration-1000 relative group/prob" style={{ width: `${data.drawProb}%`, backgroundColor: DRAW_COLOR }}>
              <div className="absolute inset-0 bg-white/10 opacity-0 group-hover/prob:opacity-100 transition-opacity" />
            </div>
            <div className="h-full transition-all duration-1000 relative group/prob" style={{ width: `${data.lossProb}%`, backgroundColor: AWAY_COLOR }}>
              <div className="absolute inset-0 bg-white/10 opacity-0 group-hover/prob:opacity-100 transition-opacity" />
            </div>
          </div>
          <div className="flex justify-between px-1">
            <div className="flex flex-col">
              <span className="text-[9px] font-black text-emerald-500 uppercase">1 (H): {data.winProb}%</span>
              <span className="text-[8px] font-bold text-slate-600 italic">Cote: {(100/data.winProb).toFixed(2)}</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-[9px] font-black text-slate-500 uppercase">X (N): {data.drawProb}%</span>
              <span className="text-[8px] font-bold text-slate-600 italic">Cote: {(100/data.drawProb).toFixed(2)}</span>
            </div>
            <div className="flex flex-col items-end">
              <span className="text-[9px] font-black text-blue-500 uppercase">2 (A): {data.lossProb}%</span>
              <span className="text-[8px] font-bold text-slate-600 italic">Cote: {(100/data.lossProb).toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Métriques Flash */}
        <div className="mt-6 flex items-center justify-between gap-4 pt-6 border-t border-white/5">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <BrainCircuit size={14} className="text-indigo-500" />
              <div className="flex flex-col">
                <span className="text-[8px] font-black text-slate-600 uppercase">Entropy</span>
                <span className="text-[10px] font-black text-slate-300 italic">{data.bayesianMetrics?.entropy.toFixed(3)}</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Timer size={14} className="text-amber-500" />
              <div className="flex flex-col">
                <span className="text-[8px] font-black text-slate-600 uppercase">GARCH Vol.</span>
                <span className="text-[10px] font-black text-slate-300 italic">{data.timeSeriesAnalytics?.home.volatility.var95.toFixed(2)}</span>
              </div>
            </div>
          </div>
          
          <button 
            onClick={() => setIsExpanded(!isExpanded)} 
            className="flex items-center gap-3 px-6 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 transition-all group"
          >
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 group-hover:text-white">Détails Expert</span>
            {isExpanded ? <ChevronUp size={16} className="text-indigo-500" /> : <ChevronDown size={16} className="text-indigo-500" />}
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="p-8 md:p-12 bg-slate-950/90 border-t border-white/5 animate-in slide-in-from-top-6 duration-700">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            
            <div className="space-y-10">
              <div className="bg-slate-900/40 p-8 rounded-[2.5rem] border border-white/5 space-y-8 relative overflow-hidden">
                <h4 className="text-[10px] font-black uppercase tracking-widest text-indigo-400 mb-2 flex items-center gap-3">
                  <Layers size={14} /> Profil Tactique Holistique
                </h4>
                
                <div className="h-[200px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                      <PolarGrid stroke="#1e293b" />
                      <PolarAngleAxis dataKey="subject" tick={{ fill: '#475569', fontSize: 9, fontWeight: 'bold' }} />
                      <Radar name={data.homeTeam.name} dataKey="A" stroke={HOME_COLOR} fill={HOME_COLOR} fillOpacity={0.3} />
                      <Radar name={data.awayTeam.name} dataKey="B" stroke={AWAY_COLOR} fill={AWAY_COLOR} fillOpacity={0.3} />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <SectorGauge label="Bayes Conf." value={(data.bayesianMetrics?.inferenceConfidence || 0) * 100} color={HOME_COLOR} icon={<BrainCircuit size={12} />} />
                  <SectorGauge label="MC Weight" value={data.ensembleMetrics.monteCarloWeight * 100} color="#f59e0b" icon={<Activity size={12} />} />
                </div>
              </div>

              {data.valueBets.length > 0 && (
                <div className="bg-emerald-600/5 p-8 rounded-[2.5rem] border border-emerald-500/10 space-y-6">
                   <h4 className="text-[10px] font-black uppercase tracking-widest text-emerald-400 mb-2 flex items-center gap-3">
                     <Banknote size={14} /> Opportunités Value Bets
                   </h4>
                   <div className="space-y-3">
                     {data.valueBets.map((bet, i) => (
                       <div key={i} className="flex items-center justify-between p-4 bg-emerald-500/5 border border-emerald-500/10 rounded-2xl">
                         <div>
                            <div className="text-[8px] font-black text-emerald-500/60 uppercase mb-1">{bet.type}</div>
                            <div className="text-sm font-black text-white italic">+{bet.edge}% Advantage</div>
                         </div>
                         <div className="text-right">
                            <div className="text-[9px] font-bold text-slate-500 uppercase">Market: {bet.marketOdds}</div>
                            <div className="text-[9px] font-bold text-emerald-400 uppercase">Fair: {bet.fairOdds}</div>
                         </div>
                       </div>
                     ))}
                   </div>
                </div>
              )}
            </div>

            <div className="space-y-10">
              <div className="bg-slate-900/40 p-8 rounded-[2.5rem] border border-white/5 space-y-6">
                 <h4 className="text-[10px] font-black uppercase tracking-widest text-indigo-400 mb-2 flex items-center gap-3">
                   <Target size={14} /> Top 5 Scores (Poisson Distribution)
                 </h4>
                 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-3">
                    {data.topScores.map((score, i) => (
                      <div key={i} className="flex items-center justify-between p-4 bg-white/[0.02] border border-white/5 rounded-2xl">
                        <div className="flex items-center gap-4">
                          <div className="w-6 h-6 rounded-lg bg-slate-800 flex items-center justify-center text-[8px] font-black text-slate-500">{i+1}</div>
                          <span className="text-lg font-black italic tracking-tighter text-white">{score.score}</span>
                        </div>
                        <span className="text-xs font-black text-indigo-400 italic">{score.prob.toFixed(1)}%</span>
                      </div>
                    ))}
                 </div>
              </div>

              <div className="bg-gradient-to-br from-indigo-500/10 to-transparent p-8 rounded-[2.5rem] border border-indigo-500/20 shadow-2xl">
                 <div className="flex items-center gap-3 mb-6">
                   <Fingerprint size={16} className="text-indigo-400" />
                   <span className="text-[9px] font-black uppercase text-indigo-400 tracking-widest">Diagnostic Pipeline ASE v5.5</span>
                 </div>
                 <p className="text-xs md:text-sm text-slate-300 leading-relaxed italic font-medium mb-8">
                   "{data.reasoning}"
                 </p>
                 <div className="pt-6 border-t border-white/5 grid grid-cols-2 gap-6">
                    <div>
                      <div className="text-[8px] font-black text-slate-600 uppercase tracking-widest mb-1">Convergence</div>
                      <div className="text-lg font-black text-emerald-500 italic">{Math.round(data.ensembleMetrics.modelConvergence * 100)}%</div>
                    </div>
                    <div>
                      <div className="text-[8px] font-black text-slate-600 uppercase tracking-widest mb-1">Volatilité VaR</div>
                      <div className="text-lg font-black text-amber-500 italic">σ={data.timeSeriesAnalytics?.home.volatility.var95.toFixed(2)}</div>
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
