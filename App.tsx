
import React, { useState, useMemo, useEffect } from 'react';
import { 
  Search, Loader2, Trophy, ArrowRight, Plus, Trash2, LayoutGrid, Filter, TrendingUp, 
  Equal, ChevronDown, Activity, Calendar, Sparkles, Cpu, RefreshCw, Clock, 
  ChevronRight, ShieldCheck, Menu, X, Hash, Target, Zap, Eraser 
} from 'lucide-react';
import { analyzeMatch, generateMatchPoster, getTodaysMatches } from './services/geminiService';
import { PredictionResult, TodaysMatch } from './types';
import MatchDisplay from './components/MatchDisplay';

interface MatchInput {
  id: string;
  home: string;
  away: string;
}

interface MatchResult {
  id: string;
  analysis: PredictionResult;
  poster: string | null;
}

type FilterType = 'all' | 'high_win' | 'high_draw' | 'high_away';

const App: React.FC = () => {
  const [matchInputs, setMatchInputs] = useState<MatchInput[]>([
    { id: Math.random().toString(36).substr(2, 9), home: '', away: '' }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [isDiscovering, setIsDiscovering] = useState(false);
  const [todaysMatches, setTodaysMatches] = useState<TodaysMatch[]>([]);
  const [results, setResults] = useState<MatchResult[]>([]);
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [activeHour, setActiveHour] = useState<string>('TOUS');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Persistence: Load from localStorage
  useEffect(() => {
    const savedResults = localStorage.getItem('footypredict_history');
    if (savedResults) {
      try {
        setResults(JSON.parse(savedResults));
      } catch (e) {
        console.error("Erreur chargement historique", e);
      }
    }
    handleDiscoverMatches();
  }, []);

  // Persistence: Save to localStorage
  useEffect(() => {
    if (results.length > 0) {
      localStorage.setItem('footypredict_history', JSON.stringify(results));
    }
  }, [results]);

  const handleDiscoverMatches = async () => {
    setIsDiscovering(true);
    const matches = await getTodaysMatches();
    setTodaysMatches(matches);
    setIsDiscovering(false);
  };

  const clearHistory = () => {
    if (window.confirm("Effacer tout l'historique des simulations ?")) {
      setResults([]);
      localStorage.removeItem('footypredict_history');
    }
  };

  const addMatchRow = () => {
    setMatchInputs([...matchInputs, { id: Math.random().toString(36).substr(2, 9), home: '', away: '' }]);
  };

  const quickAddMatch = (home: string, away: string) => {
    const emptyRow = matchInputs.find(m => !m.home && !m.away);
    if (emptyRow) {
      setMatchInputs(matchInputs.map(m => m.id === emptyRow.id ? { ...m, home, away } : m));
    } else {
      setMatchInputs([...matchInputs, { id: Math.random().toString(36).substr(2, 9), home, away }]);
    }
    if (window.innerWidth < 1024) setIsSidebarOpen(false);
  };

  const removeMatchRow = (id: string) => {
    if (matchInputs.length > 1) {
      setMatchInputs(matchInputs.filter(m => m.id !== id));
    }
  };

  const updateMatchInput = (id: string, field: 'home' | 'away', value: string) => {
    setMatchInputs(matchInputs.map(m => m.id === id ? { ...m, [field]: value } : m));
  };

  const handleDiagnose = async (e: React.FormEvent) => {
    e.preventDefault();
    const validMatches = matchInputs.filter(m => m.home.trim() && m.away.trim());
    if (validMatches.length === 0) return;

    setIsLoading(true);
    setProgress({ current: 0, total: validMatches.length });

    const newResults: MatchResult[] = [];
    for (let i = 0; i < validMatches.length; i++) {
      const match = validMatches[i];
      const analysis = await analyzeMatch(match.home, match.away);
      const posterUrl = await generateMatchPoster(match.home, match.away);
      newResults.push({ id: match.id, analysis, poster: posterUrl });
      setProgress(prev => ({ ...prev, current: i + 1 }));
    }

    setResults(prev => [...newResults, ...prev]);
    setIsLoading(false);
    
    // Clear inputs after success
    setMatchInputs([{ id: Math.random().toString(36).substr(2, 9), home: '', away: '' }]);
  };

  const availableHours = useMemo(() => {
    const hoursSet = new Set<string>();
    todaysMatches.forEach(m => {
      if (m.isLive) {
        hoursSet.add("DIRECT");
      } else if (m.status?.includes('TERMINE')) {
        hoursSet.add("FIN");
      } else {
        const hour = m.time?.split(':')[0];
        if (hour) hoursSet.add(hour + 'h');
      }
    });
    return ["TOUS", ...Array.from(hoursSet).sort((a, b) => {
      if (a === "DIRECT") return -1;
      if (b === "DIRECT") return 1;
      if (a === "FIN") return 1;
      if (b === "FIN") return -1;
      return a.localeCompare(b, undefined, { numeric: true });
    })];
  }, [todaysMatches]);

  const filteredMatchesByHour = useMemo(() => {
    if (activeHour === "TOUS") return todaysMatches;
    return todaysMatches.filter(m => {
      if (activeHour === "DIRECT") return m.isLive;
      if (activeHour === "FIN") return m.status?.includes('TERMINE');
      return m.time?.startsWith(activeHour.replace('h', ''));
    });
  }, [todaysMatches, activeHour]);

  const filteredResults = useMemo(() => {
    let filtered = [...results];
    if (activeFilter === 'high_win') filtered = filtered.filter(r => r.analysis.winProb >= 50);
    if (activeFilter === 'high_draw') filtered = filtered.filter(r => r.analysis.drawProb >= 35);
    if (activeFilter === 'high_away') filtered = filtered.filter(r => r.analysis.lossProb >= 50);
    return filtered;
  }, [results, activeFilter]);

  return (
    <div className="min-h-screen bg-[#020617] text-slate-100 flex flex-col font-sans relative overflow-hidden">
      
      {/* HUD de fond */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-indigo-600/10 blur-[150px] rounded-full animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-emerald-600/10 blur-[150px] rounded-full animate-pulse" />
      </div>

      <header className="sticky top-0 z-[60] bg-[#020617]/90 backdrop-blur-2xl border-b border-white/5 p-4 md:px-10">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden p-3 bg-slate-900 rounded-2xl text-slate-400 hover:text-white transition-all active:scale-95"
            >
              <Menu size={20} />
            </button>
            <div className="bg-gradient-to-br from-indigo-500 to-indigo-700 p-2.5 rounded-2xl shadow-xl shadow-indigo-600/30">
              <Cpu className="text-white" size={24} />
            </div>
            <h1 className="text-2xl font-black heading-font tracking-tighter uppercase hidden sm:block">
              FootyPredict <span className="text-indigo-500 italic">ASE v5.5</span>
            </h1>
          </div>
          <div className="flex items-center space-x-6">
            <div className="hidden lg:flex items-center space-x-3 bg-slate-900/80 border border-white/10 px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-400">
              <ShieldCheck size={16} className="text-emerald-400" />
              <span>Diagnostic Pipeline 5.5 Actif</span>
            </div>
            <div className="text-[11px] font-black uppercase tracking-widest text-indigo-400 bg-indigo-500/10 px-4 py-2.5 rounded-2xl border border-indigo-500/20">
              {new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'short' }).toUpperCase()}
            </div>
          </div>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden relative z-10">
        
        <aside 
          className={`
            fixed lg:static inset-0 z-[100] lg:z-auto transition-all duration-500 ease-in-out flex
            ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          `}
        >
          <div className="absolute inset-0 bg-[#020617]/90 backdrop-blur-md lg:hidden" onClick={() => setIsSidebarOpen(false)} />
          
          <div className="relative w-80 bg-slate-950/95 lg:bg-transparent h-full flex flex-col lg:p-6">
            <div className="bg-slate-900/40 backdrop-blur-3xl border border-white/5 h-full rounded-[2.5rem] flex flex-col overflow-hidden shadow-2xl">
              
              <div className="p-8 border-b border-white/5 flex items-center justify-between bg-indigo-500/[0.03]">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-indigo-500/15 rounded-2xl text-indigo-400">
                    <Clock size={20} />
                  </div>
                  <div>
                    <div className="text-[12px] font-black uppercase tracking-widest text-white leading-none mb-1.5">Direct Feed</div>
                    <div className="text-[10px] font-bold text-slate-600 uppercase tracking-tighter">{todaysMatches.length} Matchs Trouvés</div>
                  </div>
                </div>
                <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden p-2 text-slate-500 hover:text-white bg-white/5 rounded-xl"><X size={20} /></button>
              </div>

              <div className="px-6 py-5 border-b border-white/5 bg-slate-950/20">
                <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
                  {availableHours.map(hour => (
                    <button
                      key={hour}
                      onClick={() => setActiveHour(hour)}
                      className={`
                        px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all border
                        ${activeHour === hour 
                          ? 'bg-indigo-600 text-white border-indigo-500 shadow-xl shadow-indigo-600/30 scale-105' 
                          : 'bg-slate-900/80 text-slate-500 border-white/5 hover:border-white/20'
                        }
                      `}
                    >
                      {hour}
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="flex-1 overflow-y-auto p-5 space-y-3.5 custom-scrollbar">
                {isDiscovering ? (
                  Array(10).fill(0).map((_, i) => (
                    <div key={i} className="h-28 bg-white/5 rounded-[2rem] animate-pulse" />
                  ))
                ) : (
                  filteredMatchesByHour.length > 0 ? (
                    filteredMatchesByHour.map((m, idx) => (
                      <button
                        key={idx}
                        onClick={() => quickAddMatch(m.home, m.away)}
                        className="w-full text-left p-6 rounded-[2rem] bg-white/[0.03] border border-white/5 hover:bg-indigo-600/10 hover:border-indigo-500/50 transition-all group relative overflow-hidden"
                      >
                        <div className="flex justify-between items-center mb-4 relative z-10">
                          <span className="text-[9px] font-black text-slate-500 truncate max-w-[120px] uppercase tracking-[0.1em]">{m.competition}</span>
                          <div className="flex items-center gap-2">
                            {m.isLive && <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse shadow-[0_0_10px_#ef4444]" />}
                            <span className={`text-[10px] font-black ${m.isLive ? 'text-red-500' : 'text-slate-400'}`}>
                              {m.status || m.time}
                            </span>
                          </div>
                        </div>
                        <div className="flex flex-col gap-1.5 relative z-10">
                          <span className="text-xs font-black text-slate-300 group-hover:text-emerald-400 transition-colors truncate">{m.home}</span>
                          <span className="text-xs font-black text-slate-300 group-hover:text-blue-400 transition-colors truncate">{m.away}</span>
                        </div>
                        <div className="absolute right-5 bottom-6 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
                          <Plus size={20} className="text-indigo-500" />
                        </div>
                      </button>
                    ))
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center text-center p-12 opacity-30">
                      <Clock size={56} className="text-slate-700 mb-6" />
                      <div className="text-[12px] font-black uppercase tracking-[0.2em] text-slate-500">Aucun match détecté</div>
                    </div>
                  )
                )}
              </div>

              <div className="p-8 border-t border-white/5 bg-slate-950/40">
                <button 
                  onClick={handleDiscoverMatches}
                  disabled={isDiscovering}
                  className="w-full flex items-center justify-center gap-4 py-4.5 bg-white/5 rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-white hover:bg-white/10 transition-all group active:scale-95 border border-white/5"
                >
                  <RefreshCw size={20} className={isDiscovering ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-1000'} />
                  <span>Actualiser Flux</span>
                </button>
              </div>
            </div>
          </div>
        </aside>

        <main className="flex-1 overflow-y-auto p-6 md:p-14 custom-scrollbar relative">
          <div className="max-w-5xl mx-auto space-y-20">
            
            <div className="bg-slate-900/40 rounded-[3.5rem] border border-white/5 overflow-hidden shadow-2xl backdrop-blur-3xl relative">
              <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 blur-[100px] rounded-full pointer-events-none" />
              
              <div className="bg-gradient-to-br from-indigo-600/10 via-transparent to-transparent p-10 md:p-16">
                <div className="flex flex-col items-center text-center mb-16">
                  <div className="inline-flex items-center gap-3 px-5 py-2 bg-indigo-500/10 border border-indigo-500/20 rounded-full text-[11px] font-black uppercase text-indigo-400 tracking-[0.2em] mb-8 shadow-inner">
                    <Sparkles size={14} className="animate-pulse" /> Diagnostic Moteur ASE v5.5
                  </div>
                  <h2 className="text-5xl md:text-7xl font-black heading-font tracking-tighter uppercase mb-8 leading-tight">
                    DEEP <span className="text-indigo-500 italic">ANALYSIS</span>
                  </h2>
                  <p className="text-slate-500 text-[12px] md:text-sm font-black uppercase tracking-[0.4em] max-w-xl mx-auto leading-relaxed opacity-60">
                    Modélisation SVD & Régressions de Poisson Itératives
                  </p>
                </div>

                <form onSubmit={handleDiagnose} className="space-y-10">
                  <div className="space-y-5 max-h-[450px] overflow-y-auto pr-6 custom-scrollbar px-2">
                    {matchInputs.map((match, index) => (
                      <div key={match.id} className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center group animate-in slide-in-from-left-8 duration-600">
                        <div className="md:col-span-1 flex justify-center text-[13px] font-black text-slate-800 italic uppercase">#{index + 1}</div>
                        
                        <div className="md:col-span-5 relative group/input">
                          <input
                            type="text" placeholder="ÉQUIPE DOMICILE" value={match.home}
                            onChange={(e) => updateMatchInput(match.id, 'home', e.target.value)}
                            className="w-full bg-slate-950/60 border border-white/5 rounded-[2rem] py-6 px-8 pl-16 focus:border-emerald-500/50 focus:bg-emerald-500/10 focus:outline-none transition-all text-sm font-black uppercase tracking-widest placeholder:text-slate-800 shadow-inner"
                          />
                          <Activity className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-800 group-focus-within/input:text-emerald-500 transition-colors" size={24} />
                        </div>

                        <div className="md:col-span-5 relative group/input">
                          <input
                            type="text" placeholder="ÉQUIPE EXTÉRIEUR" value={match.away}
                            onChange={(e) => updateMatchInput(match.id, 'away', e.target.value)}
                            className="w-full bg-slate-950/60 border border-white/5 rounded-[2rem] py-6 px-8 pl-16 focus:border-blue-500/50 focus:bg-blue-500/10 focus:outline-none transition-all text-sm font-black uppercase tracking-widest placeholder:text-slate-800 shadow-inner"
                          />
                          <Target className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-800 group-focus-within/input:text-blue-500 transition-colors" size={24} />
                        </div>

                        <div className="md:col-span-1 flex justify-center">
                          <button 
                            type="button" 
                            onClick={() => removeMatchRow(match.id)} 
                            disabled={matchInputs.length === 1} 
                            className="p-5 bg-red-500/5 text-red-500/20 hover:text-red-500 hover:bg-red-500/20 transition-all rounded-[1.5rem] active:scale-90 disabled:opacity-0"
                          >
                            <Trash2 size={24} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="flex flex-col md:flex-row items-center justify-between gap-10 pt-12 border-t border-white/5">
                    <button 
                      type="button" 
                      onClick={addMatchRow} 
                      className="flex items-center space-x-4 text-white bg-slate-800/50 hover:bg-slate-700 px-10 py-5 rounded-[1.8rem] text-xs font-black uppercase tracking-[0.2em] transition-all active:scale-95 border border-white/5"
                    >
                      <Plus size={20} /> <span>Ajouter Scénario</span>
                    </button>
                    <button 
                      type="submit" 
                      disabled={isLoading} 
                      className="w-full md:w-auto bg-indigo-600 hover:bg-indigo-500 text-white font-black py-6 px-20 rounded-[1.8rem] transition-all shadow-2xl shadow-indigo-600/50 flex items-center justify-center space-x-6 uppercase text-[15px] tracking-[0.3em] active:scale-95 disabled:bg-slate-800 disabled:shadow-none"
                    >
                      {isLoading ? (
                        <><Loader2 className="animate-spin" size={24} /><span>SIMULATION {progress.current}/{progress.total}</span></>
                      ) : (
                        <><Zap size={24} /><span>Lancer Diagnostic</span></>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>

            {results.length > 0 && (
              <div className="space-y-12 pb-48">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 bg-slate-900/80 backdrop-blur-3xl p-8 rounded-[3rem] border border-white/10 sticky top-28 z-40 shadow-2xl">
                  <div className="flex items-center space-x-6 px-4">
                    <div className="p-4 bg-indigo-600 rounded-[1.5rem] shadow-xl shadow-indigo-600/30">
                      <LayoutGrid size={26} className="text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-black uppercase tracking-widest">Matrice de Résultats</h3>
                      <div className="text-[11px] font-bold text-slate-500 uppercase tracking-[0.2em]">{results.length} Simulations Validées</div>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-3 p-2 bg-black/40 rounded-[1.8rem] border border-white/5">
                    {[
                      {id:'all', label:'Rapport Global'},
                      {id:'high_win', label:'Picks Domicile'},
                      {id:'high_draw', label:'Zones de Nul'}
                    ].map(f => (
                      <button 
                        key={f.id} 
                        onClick={() => setActiveFilter(f.id as FilterType)} 
                        className={`px-8 py-4 rounded-[1.4rem] text-[10px] font-black uppercase tracking-[0.2em] transition-all ${activeFilter === f.id ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-600/30' : 'text-slate-500 hover:text-slate-300'}`}
                      >
                        {f.label}
                      </button>
                    ))}
                    <button 
                      onClick={clearHistory}
                      className="ml-auto px-6 py-4 rounded-[1.4rem] text-[10px] font-black uppercase tracking-[0.2em] text-red-500 hover:bg-red-500/10 transition-all flex items-center gap-2"
                    >
                      <Eraser size={14} /> Effacer Historique
                    </button>
                  </div>
                </div>

                <div className="space-y-12 animate-in fade-in slide-in-from-bottom-16 duration-1000">
                  {filteredResults.map(res => (
                    <MatchDisplay key={res.id} data={res.analysis} posterUrl={res.poster} />
                  ))}
                </div>
              </div>
            )}
          </div>
        </main>
      </div>

      <button
        onClick={() => setIsSidebarOpen(true)}
        className="fixed bottom-10 right-10 z-[70] lg:hidden p-7 bg-indigo-600 text-white rounded-[2.5rem] shadow-2xl shadow-indigo-600/60 active:scale-90 transition-transform flex items-center justify-center hover:bg-indigo-500"
      >
        <Hash size={32} />
        <div className="absolute -top-2 -right-2 bg-red-500 text-[11px] font-black w-8 h-8 rounded-full flex items-center justify-center border-4 border-[#020617] shadow-xl">
          {todaysMatches.length}
        </div>
      </button>

      <footer className="relative z-50 p-12 border-t border-white/5 text-center text-slate-800 text-[11px] uppercase tracking-[0.5em] font-black bg-[#020617]">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-10">
          <p>© 2025 FOOTYPREDICT ASE ENGINE • ASE CORE v5.5 • DEEP SVD PIPELINE</p>
          <div className="flex gap-12">
            <span className="flex items-center gap-3">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_12px_#10b981]" /> 
              NETWORK: STABLE
            </span>
            <span className="flex items-center gap-3">
              <div className="w-2.5 h-2.5 rounded-full bg-indigo-600 shadow-[0_0_12px_#4f46e5]" /> 
              ENGINE: POISSON v5.5
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
