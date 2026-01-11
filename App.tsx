
import React, { useState, useCallback, useEffect, useRef } from 'react';
import { ParaphraseTone, ParaphraseLength, ParaphraseResult } from './types';
import { paraphraseText } from './services/geminiService';

const languages = [
  "Indonesia", "English", "Jawa", "Sunda", "Japanese", "Korean", "Arabic", "Chinese", "Spanish", "French"
];

const loadingMessages = [
  "Menganalisis konteks teks...",
  "Menyusun struktur kalimat baru...",
  "Menyesuaikan nada dan gaya bahasa...",
  "Memperhalus pilihan kata...",
  "Sedang memoles hasil akhir..."
];

const placeholderPrompts = [
  "Tempel draf artikel ilmiah Anda di sini untuk dihaluskan...",
  "Ubah jargon teknis yang rumit ini menjadi bahasa awam...",
  "Tulis draf email lamaran kerja Anda agar lebih memukau...",
  "Parafrase kutipan inspiratif ini untuk konten media sosial...",
  "Sederhanakan penjelasan hukum yang membingungkan ini...",
  "Buat pesan santai ini terdengar lebih profesional...",
  "Ringkas artikel berita panjang ini agar lebih padat dan jelas...",
  "Poles draf skripsi Anda agar memenuhi standar akademik...",
  "Ubah nada keluhan ini menjadi masukan yang konstruktif...",
  "Ekspresikan ide bisnis kreatif Anda di sini untuk dipoles..."
];

const features = [
  {
    title: "Gemini 3 Intelligence",
    desc: "Ditenagai model AI terbaru untuk pemahaman konteks yang mendalam dan hasil yang natural layaknya tulisan manusia.",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
    color: "from-indigo-500 to-blue-500"
  },
  {
    title: "Anti-Plagiarisme",
    desc: "Restrukturisasi kalimat secara total tanpa mengubah makna, menjamin keunikan teks untuk kebutuhan akademik dan profesional.",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04L3 9.244c0 7.103 5.02 13.47 12 14.756 6.98-1.286 12-7.653 12-14.756l-.382-3.26z" />
      </svg>
    ),
    color: "from-emerald-500 to-teal-500"
  },
  {
    title: "6 Pilihan Nada",
    desc: "Sesuaikan gaya tulisan mulai dari Formal, Santai, hingga Akademik hanya dalam satu klik.",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
      </svg>
    ),
    color: "from-purple-500 to-pink-500"
  },
  {
    title: "Multi-Bahasa",
    desc: "Mendukung lebih dari 10 bahasa populer termasuk bahasa daerah seperti Jawa dan Sunda.",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 002 2 2 2 0 012 2v.105M4.583 17.185A11.956 11.956 0 0012 21.75c2.626 0 5.056-.845 7.03-2.284M12 2.25c-5.334 0-9.802 3.483-11.397 8.312m14.601 10.155A11.961 11.961 0 0021.25 12c0-5.334-3.483-9.802-8.312-11.397" />
      </svg>
    ),
    color: "from-orange-500 to-red-500"
  }
];

const valueProps = [
  { text: "99% Akurasi Konteks", icon: "✨" },
  { text: "Privasi Data Terjamin", icon: "🔒" },
  { text: "Proses Instan < 3 Detik", icon: "⚡" },
  { text: "Tanpa Batas Penggunaan", icon: "🚀" }
];

const ControlGroup: React.FC<{ label: string; tooltip: string; children: React.ReactNode }> = ({ label, tooltip, children }) => (
  <div className="flex flex-col gap-2 min-w-[150px] relative group/ctrl">
    <div className="flex items-center gap-2">
      <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-[0.2em]">{label}</label>
      <div className="text-slate-400 group-hover/ctrl:text-indigo-400 transition-colors cursor-help">
        <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
        </svg>
      </div>
    </div>
    {children}
    <div className="absolute bottom-full left-0 mb-3 w-60 p-3 bg-slate-900/95 border border-white/10 rounded-xl shadow-2xl opacity-0 invisible group-hover/ctrl:opacity-100 group-hover/ctrl:visible group-hover/ctrl:translate-y-0 translate-y-2 transition-all duration-300 z-50 pointer-events-none backdrop-blur-md">
      <p className="text-[11px] leading-relaxed text-slate-300 font-medium">{tooltip}</p>
      <div className="absolute top-full left-4 -mt-1.5 w-3 h-3 bg-slate-900 rotate-45 border-r border-b border-white/10"></div>
    </div>
  </div>
);

const App: React.FC = () => {
  const [inputText, setInputText] = useState('');
  const [outputText, setOutputText] = useState('');
  const [tone, setTone] = useState<ParaphraseTone>(ParaphraseTone.FORMAL);
  const [length, setLength] = useState<ParaphraseLength>(ParaphraseLength.MEDIUM);
  const [targetLanguage, setTargetLanguage] = useState('Indonesia');
  const [autoCopy, setAutoCopy] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isCopyingOutput, setIsCopyingOutput] = useState(false);
  const [loadingMsgIdx, setLoadingMsgIdx] = useState(0);
  const [placeholderIdx, setPlaceholderIdx] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<ParaphraseResult[]>([]);
  const [toast, setToast] = useState<{ message: string; visible: boolean }>({ message: '', visible: false });
  const workspaceRef = useRef<HTMLDivElement>(null);
  
  const isMac = typeof window !== 'undefined' && navigator.platform.toUpperCase().indexOf('MAC') >= 0;

  useEffect(() => {
    let interval: any;
    if (isLoading) {
      interval = setInterval(() => {
        setLoadingMsgIdx((prev) => (prev + 1) % loadingMessages.length);
      }, 2500);
    }
    return () => clearInterval(interval);
  }, [isLoading]);

  useEffect(() => {
    const interval = setInterval(() => {
      setPlaceholderIdx((prev) => (prev + 1) % placeholderPrompts.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const handleCopy = async (text: string, type: string) => {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      setToast({ message: `Teks ${type} disalin!`, visible: true });
    } catch (err) {
      setToast({ message: `Gagal menyalin teks.`, visible: true });
    }
    setTimeout(() => setToast(prev => ({ ...prev, visible: false })), 3000);
  };

  const handleCopyOutputAction = async () => {
    if (!outputText || isCopyingOutput) return;
    setIsCopyingOutput(true);
    await new Promise(resolve => setTimeout(resolve, 400));
    await handleCopy(outputText, 'Hasil');
    setIsCopyingOutput(false);
  };

  const handleParaphrase = useCallback(async () => {
    if (isLoading || !inputText.trim()) return;
    setIsLoading(true);
    setError(null);
    try {
      const result = await paraphraseText(inputText, tone, length, targetLanguage);
      setOutputText(result);
      setHistory(prev => [{ original: inputText, paraphrased: result, tone, timestamp: Date.now() }, ...prev].slice(0, 8));
      if (autoCopy) handleCopy(result, 'Otomatis');
    } catch (err: any) {
      setError(err.message || "Terjadi kesalahan saat menghubungi server AI.");
    } finally {
      setIsLoading(false);
    }
  }, [inputText, tone, length, targetLanguage, autoCopy, isLoading]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        handleParaphrase();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleParaphrase]);

  const scrollToWorkspace = () => {
    workspaceRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col text-slate-200 selection:bg-indigo-500/30">
      
      {/* Header */}
      <header className="sticky top-0 z-50 w-full glass-panel border-b border-white/5 h-20 flex items-center transition-all duration-500">
        <div className="container mx-auto px-6 flex items-center justify-between">
          <div className="flex items-center gap-4 group cursor-pointer" onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})}>
            <div className="w-11 h-11 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div className="flex flex-col">
              <h1 className="text-xl font-black bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent tracking-tight">
                VAZAPHRASE <span className="text-indigo-400">AI</span>
              </h1>
              <p className="text-[9px] text-indigo-400/60 font-bold tracking-[0.3em] uppercase">by : mr ouval m</p>
            </div>
          </div>
          <nav className="hidden lg:flex items-center gap-10 text-xs font-extrabold uppercase tracking-widest text-slate-400">
            <a href="#features" className="hover:text-white transition-all duration-300 transform hover:translate-y-[-1px]">Keunggulan</a>
            <a href="#workspace" className="hover:text-white transition-all duration-300 transform hover:translate-y-[-1px]">Workspace</a>
            <button onClick={scrollToWorkspace} className="px-6 py-2.5 bg-white text-slate-950 rounded-full hover:bg-indigo-500 hover:text-white transition-all duration-300 transform hover:translate-y-[-2px] shadow-lg hover:shadow-indigo-500/20 font-black">
              MULAI SEKARANG
            </button>
          </nav>
        </div>
      </header>

      <main className="flex-grow">
        {/* Hero Section */}
        <section className="container mx-auto px-6 pt-24 pb-20 text-center animate-slide-up">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-500/10 border border-indigo-500/20 rounded-full mb-8">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
            </span>
            <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">v2.1 ULTRA PRO EDITION</span>
          </div>
          
          <h2 className="text-5xl lg:text-8xl font-black mb-8 leading-[1.1] tracking-tighter">
            Tulis Ulang Ide Anda <br />
            <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent animate-gradient-flow">Lebih Cerdas & Cepat.</span>
          </h2>
          
          <p className="text-slate-400 text-lg lg:text-xl max-w-3xl mx-auto mb-12 font-medium leading-relaxed">
            Vazaphrase AI Pro bukan sekadar penukar kata. Kami menggunakan <strong>kecerdasan kognitif</strong> untuk memahami nuansa, emosi, dan tujuan tulisan Anda agar tetap natural namun unik.
          </p>

          {/* Core Value Proposition Cards */}
          <div className="flex flex-wrap justify-center gap-4 mb-14">
            {valueProps.map((prop, idx) => (
              <div key={idx} className="glass-panel px-5 py-3 rounded-2xl flex items-center gap-3 border-white/5 hover:border-indigo-500/30 transition-all duration-300 transform hover:-translate-y-1">
                <span className="text-xl">{prop.icon}</span>
                <span className="text-xs font-black uppercase tracking-widest text-slate-300">{prop.text}</span>
              </div>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row gap-5 justify-center">
             <button onClick={scrollToWorkspace} className="px-12 py-5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black shadow-[0_20px_50px_rgba(79,70,229,0.3)] transition-all duration-300 hover:scale-[1.03] active:scale-[0.98] uppercase tracking-widest text-sm">
                Buka Workspace
             </button>
             <a href="#features" className="px-12 py-5 bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-2xl font-black transition-all duration-300 hover:scale-[1.03] active:scale-[0.98] uppercase tracking-widest text-sm backdrop-blur-sm">
                Pelajari Fitur
             </a>
          </div>
        </section>

        {/* Benefits Section */}
        <section id="features" className="container mx-auto px-6 py-20 animate-slide-up delay-100">
           <div className="text-center mb-16">
              <h3 className="text-3xl lg:text-4xl font-black mb-4 tracking-tight">Solusi Menulis Tanpa Batas</h3>
              <p className="text-slate-500 font-medium max-w-2xl mx-auto uppercase text-[10px] tracking-[0.3em]">Meningkatkan Kualitas Konten Anda Secara Eksponensial</p>
           </div>
           
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {features.map((f, i) => (
                <div key={i} className="group relative p-8 glass-panel rounded-[2rem] hover:border-indigo-500/30 transition-all duration-500 hover:translate-y-[-8px] overflow-hidden">
                   <div className={`absolute -top-10 -right-10 w-40 h-40 bg-gradient-to-br ${f.color} opacity-0 group-hover:opacity-10 blur-3xl transition-opacity duration-700`}></div>
                   <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${f.color} flex items-center justify-center mb-8 shadow-xl group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500`}>
                      <div className="text-white drop-shadow-md">{f.icon}</div>
                   </div>
                   <h4 className="text-xl font-black mb-4 text-white tracking-tight">{f.title}</h4>
                   <p className="text-slate-400 text-sm leading-relaxed font-medium">
                     {f.desc}
                   </p>
                </div>
              ))}
           </div>
        </section>

        {/* Workspace Area */}
        <div id="workspace" ref={workspaceRef} className="container mx-auto px-6 py-24 space-y-16">
          
          {/* Section Header */}
          <div className="flex flex-col items-center text-center gap-4 mb-10">
            <h3 className="text-4xl font-black tracking-tighter">AI Workspace</h3>
            <p className="text-slate-400 font-medium text-sm">Siap untuk memparafrase? Masukkan teks Anda di bawah.</p>
          </div>

          {/* Main Controls Card */}
          <div className="glass-panel p-8 lg:p-10 rounded-[3rem] animate-slide-up delay-200 flex flex-wrap gap-10 items-end justify-between">
            <div className="flex flex-wrap gap-8 flex-grow">
              <ControlGroup label="Gaya Bahasa (Tone)" tooltip="Formal untuk kantor/akademik, Santai untuk media sosial atau teman.">
                <div className="relative">
                  <select 
                    value={tone}
                    onChange={(e) => setTone(e.target.value as ParaphraseTone)}
                    className="bg-slate-900/50 border border-white/10 text-slate-200 rounded-2xl px-6 py-4 text-sm font-bold focus:ring-2 focus:ring-indigo-500 outline-none transition-all hover:bg-slate-800 cursor-pointer w-full md:w-52 appearance-none pr-12"
                  >
                    {Object.values(ParaphraseTone).map(t => <option key={t} value={t} className="bg-slate-900">{t}</option>)}
                  </select>
                  <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 9l-7 7-7-7" /></svg>
                  </div>
                </div>
              </ControlGroup>

              <ControlGroup label="Panjang Teks" tooltip="Kontrol jumlah kata agar sesuai dengan kebutuhan platform Anda.">
                <div className="relative">
                  <select 
                    value={length}
                    onChange={(e) => setLength(e.target.value as ParaphraseLength)}
                    className="bg-slate-900/50 border border-white/10 text-slate-200 rounded-2xl px-6 py-4 text-sm font-bold focus:ring-2 focus:ring-indigo-500 outline-none transition-all hover:bg-slate-800 cursor-pointer w-full md:w-52 appearance-none pr-12"
                  >
                    {Object.values(ParaphraseLength).map(l => <option key={l} value={l} className="bg-slate-900">{l}</option>)}
                  </select>
                  <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 9l-7 7-7-7" /></svg>
                  </div>
                </div>
              </ControlGroup>

              <ControlGroup label="Bahasa Target" tooltip="Dukungan bahasa internasional dan lokal (Jawa & Sunda).">
                <div className="relative">
                  <select 
                    value={targetLanguage}
                    onChange={(e) => setTargetLanguage(e.target.value)}
                    className="bg-slate-900/50 border border-white/10 text-slate-200 rounded-2xl px-6 py-4 text-sm font-bold focus:ring-2 focus:ring-indigo-500 outline-none transition-all hover:bg-slate-800 cursor-pointer w-full md:w-52 appearance-none pr-12"
                  >
                    {languages.map(lang => <option key={lang} value={lang} className="bg-slate-900">{lang}</option>)}
                  </select>
                  <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 9l-7 7-7-7" /></svg>
                  </div>
                </div>
              </ControlGroup>

              <ControlGroup label="Auto-Copy" tooltip="Otomatis menyalin hasil ke clipboard Anda begitu proses AI selesai.">
                <div 
                  onClick={() => setAutoCopy(!autoCopy)}
                  className="flex items-center gap-4 py-4 cursor-pointer group/toggle"
                >
                  <div className={`w-12 h-6 rounded-full relative transition-all duration-500 ${autoCopy ? 'bg-indigo-600 shadow-lg shadow-indigo-500/30' : 'bg-slate-800'}`}>
                    <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all duration-500 cubic-bezier(0.175, 0.885, 0.32, 1.275) ${autoCopy ? 'left-7' : 'left-1'}`}></div>
                  </div>
                  <span className="text-xs font-bold text-slate-400 group-hover/toggle:text-slate-200 transition-colors">Aktifkan</span>
                </div>
              </ControlGroup>
            </div>

            <div className="flex gap-4 w-full xl:w-auto mt-6 xl:mt-0">
              <button 
                onClick={() => setInputText('')}
                className="flex-1 px-10 py-5 border border-white/5 rounded-2xl hover:bg-white/10 transition-all font-bold text-sm text-slate-400 hover:text-white"
              >
                Reset
              </button>
              <button 
                onClick={handleParaphrase}
                disabled={isLoading || !inputText.trim()}
                className={`flex-[2] px-12 py-5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-2xl font-black text-sm shadow-xl shadow-indigo-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex flex-col items-center justify-center gap-1 ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
              >
                <div className="flex items-center gap-3">
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                  )}
                  <span className="uppercase tracking-widest">{isLoading ? 'Processing...' : 'Proses Sekarang'}</span>
                </div>
                {!isLoading && <span className="text-[9px] opacity-40 font-bold">{isMac ? '⌘ + Enter' : 'Ctrl + Enter'}</span>}
              </button>
            </div>
          </div>

          {/* Error Message Section */}
          {error && (
            <div className="relative group animate-slide-up">
              <div className="absolute -inset-1 bg-red-600/20 rounded-[2.5rem] blur opacity-50"></div>
              <div className="relative flex items-center gap-6 p-7 glass-panel border-red-500/30 bg-red-500/10 rounded-[2.5rem] shadow-2xl">
                <div className="w-14 h-14 bg-red-500/20 rounded-2xl flex items-center justify-center flex-shrink-0">
                  <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <div className="flex-grow">
                  <h4 className="text-sm font-black text-red-400 uppercase tracking-widest mb-1">Terjadi Kesalahan</h4>
                  <p className="text-red-200 font-medium leading-relaxed">{error}</p>
                </div>
                <button 
                  onClick={() => setError(null)}
                  className="p-3 hover:bg-red-500/20 text-red-400 rounded-xl transition-all"
                >
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                </button>
              </div>
            </div>
          )}

          {/* Editor Areas */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            {/* Input Side */}
            <div className="space-y-5 animate-slide-up delay-300">
              <div className="flex items-center justify-between px-3">
                <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest">Teks Sumber</h3>
                <span className="text-[10px] font-bold text-slate-600">{inputText.length} karakter</span>
              </div>
              <div className="relative group/input shadow-2xl">
                <textarea
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  disabled={isLoading}
                  placeholder=""
                  className={`w-full h-[500px] p-10 glass-panel rounded-[3rem] focus:border-indigo-500/50 outline-none transition-all resize-none text-slate-200 leading-relaxed text-lg font-medium selection:bg-indigo-500/40`}
                />
                {!inputText && !isLoading && (
                  <div className="absolute top-10 left-10 right-10 pointer-events-none overflow-hidden h-24">
                    <p 
                      key={placeholderIdx}
                      className="text-slate-600 text-lg lg:text-xl font-medium animate-placeholder-pulse"
                    >
                      {placeholderPrompts[placeholderIdx]}
                    </p>
                  </div>
                )}
                {inputText && !isLoading && (
                  <button onClick={() => handleCopy(inputText, 'Asli')} className="absolute bottom-8 right-8 p-5 bg-white/5 hover:bg-white/10 rounded-2xl text-slate-400 hover:text-white transition-all duration-300 shadow-lg active:scale-95">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                  </button>
                )}
              </div>
            </div>

            {/* Output Side */}
            <div className="space-y-5 animate-slide-up delay-400">
              <div className="flex items-center justify-between px-3">
                <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest">Hasil Cerdas AI</h3>
                {outputText && <div className="px-3 py-1 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-lg text-[9px] font-black uppercase tracking-tighter">{tone}</div>}
              </div>
              <div className="relative group/output h-[500px] shadow-2xl">
                <div className={`w-full h-full p-10 glass-panel rounded-[3rem] overflow-y-auto transition-all duration-700 ${isLoading ? 'blur-md grayscale opacity-50' : 'opacity-100 blur-0'}`}>
                  {outputText ? (
                    <p className="text-slate-200 leading-relaxed text-lg font-medium whitespace-pre-wrap animate-in fade-in slide-in-from-bottom-2 duration-700">{outputText}</p>
                  ) : !isLoading && (
                    <div className="h-full flex flex-col items-center justify-center opacity-20 grayscale pointer-events-none">
                      <svg className="w-24 h-24 mb-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>
                      <p className="text-sm font-black tracking-widest uppercase">Input Teks Untuk Memulai</p>
                    </div>
                  )}
                </div>

                {/* Optimized Loading Overlay */}
                {isLoading && (
                  <div className="absolute inset-0 z-30 flex flex-col items-center justify-center glass-panel rounded-[3rem] bg-slate-950/40 border-indigo-500/20 overflow-hidden shimmer-effect">
                    <div className="absolute left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent animate-scan z-40"></div>
                    
                    <div className="relative w-44 h-44 mb-14 flex items-center justify-center">
                       <div className="absolute w-36 h-36 bg-indigo-500/10 rounded-full blur-[60px] animate-pulse"></div>
                       
                       <div className="absolute inset-0 border-[4px] border-indigo-500/10 rounded-full"></div>
                       <div className="absolute inset-0 border-[4px] border-t-indigo-500 rounded-full animate-orbital shadow-[0_0_25px_rgba(99,102,241,0.5)]"></div>
                       
                       <div className="absolute w-28 h-28 border-[2px] border-purple-500/10 rounded-full"></div>
                       <div className="absolute w-28 h-28 border-[2px] border-b-purple-500 rounded-full animate-orbital-reverse shadow-[0_0_15px_rgba(168,85,247,0.4)]"></div>
                       
                       <div className="relative w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl animate-pulse shadow-[0_0_40px_rgba(99,102,241,0.7)] flex items-center justify-center">
                         <svg className="w-9 h-9 text-white animate-text-flicker" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 10V3L4 14h7v7l9-11h-7z" />
                         </svg>
                       </div>
                    </div>

                    <div className="text-center px-8 relative z-10">
                      <h4 className="text-white font-black text-3xl mb-4 tracking-tighter animate-text-flicker uppercase">
                        AI PROCESSING
                      </h4>
                      <div className="flex flex-col items-center gap-2">
                        <p className="text-indigo-400 font-bold text-sm tracking-widest uppercase h-6 transition-all duration-700">
                          {loadingMessages[loadingMsgIdx]}
                        </p>
                        <div className="flex gap-1.5 mt-3">
                          <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce delay-75 shadow-lg shadow-indigo-500/50"></div>
                          <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce delay-150 shadow-lg shadow-purple-500/50"></div>
                          <div className="w-2 h-2 bg-cyan-500 rounded-full animate-bounce delay-225 shadow-lg shadow-cyan-500/50"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {outputText && !isLoading && (
                  <button 
                    onClick={handleCopyOutputAction}
                    disabled={isCopyingOutput}
                    className="absolute bottom-10 right-10 px-10 py-5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-[2rem] font-black text-sm shadow-2xl flex items-center gap-4 transition-all duration-300 hover:scale-[1.05] active:scale-[0.98] group"
                  >
                    {isCopyingOutput ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    ) : (
                      <svg className="w-5 h-5 group-hover:rotate-12 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                    )}
                    {isCopyingOutput ? 'COPIED' : 'SALIN HASIL'}
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Activity History */}
          {history.length > 0 && (
            <div className="space-y-8 pt-12 animate-slide-up">
              <div className="flex items-center gap-6">
                <h3 className="text-sm font-black text-slate-500 uppercase tracking-widest whitespace-nowrap">Riwayat Aktivitas</h3>
                <div className="h-px w-full bg-white/5"></div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {history.map((item, idx) => (
                  <div 
                    key={item.timestamp} 
                    onClick={() => { setInputText(item.original); setOutputText(item.paraphrased); setTone(item.tone); window.scrollTo({top: workspaceRef.current?.offsetTop ? workspaceRef.current.offsetTop - 100 : 0, behavior: 'smooth'})}}
                    className="p-6 glass-panel border-white/5 rounded-[2rem] hover:border-indigo-500/40 transition-all duration-500 cursor-pointer group hover:translate-y-[-6px]"
                  >
                    <div className="flex justify-between items-center mb-5">
                      <span className="text-[10px] font-black px-2.5 py-1 bg-indigo-500/10 text-indigo-400 rounded-lg uppercase">
                        {item.tone}
                      </span>
                      <span className="text-[9px] font-bold text-slate-600">{new Date(item.timestamp).toLocaleTimeString()}</span>
                    </div>
                    <p className="text-sm text-slate-400 line-clamp-2 italic mb-5 leading-relaxed">"{item.original}"</p>
                    <div className="flex justify-end opacity-0 group-hover:opacity-100 transition-all duration-300">
                       <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest translate-x-2 group-hover:translate-x-0 transition-transform">Restore Teks →</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Floating Toast Message */}
      <div className={`fixed bottom-12 left-1/2 -translate-x-1/2 z-[100] transition-all duration-700 cubic-bezier(0.19, 1, 0.22, 1) transform ${toast.visible ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-16 opacity-0 scale-90 pointer-events-none'}`}>
        <div className="bg-white text-slate-950 px-10 py-5 rounded-[2rem] shadow-2xl flex items-center gap-5 border border-white/20">
          <div className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M5 13l4 4L19 7" /></svg>
          </div>
          <span className="text-xs font-black tracking-widest uppercase">{toast.message}</span>
        </div>
      </div>

      <footer className="py-20 border-t border-white/5 mt-20 bg-slate-950/40 relative">
        <div className="container mx-auto px-6 text-center space-y-10">
          <div className="flex flex-col items-center gap-2">
            <div className="w-24 h-1.5 bg-gradient-to-r from-transparent via-indigo-500 to-transparent rounded-full mb-6"></div>
            <p className="text-white text-2xl font-black tracking-tighter uppercase italic drop-shadow-sm">
              Crafted with Excellence by <span className="text-indigo-400 underline decoration-indigo-500/30 decoration-[3px] underline-offset-[6px]">mr ouval m</span>
            </p>
            <p className="text-slate-600 text-[11px] font-bold tracking-[0.4em] uppercase">Gemini Pro AI • Precise • Private • Professional</p>
          </div>
          <div className="flex flex-wrap justify-center gap-x-16 gap-y-4 text-slate-500 text-[10px] font-black uppercase tracking-[0.2em]">
            <a href="#" className="hover:text-indigo-400 transition-all">Documentation</a>
            <a href="#" className="hover:text-indigo-400 transition-all">Privacy Policy</a>
            <a href="#" className="hover:text-indigo-400 transition-all">License</a>
            <a href="#" className="hover:text-indigo-400 transition-all">Support Center</a>
          </div>
          <div className="pt-10 border-t border-white/5 max-w-2xl mx-auto">
             <p className="text-slate-600 text-[10px] leading-relaxed italic font-medium">
               Vazaphrase AI menghargai privasi Anda. Semua teks yang Anda proses tidak disimpan secara permanen di server kami. Keamanan data Anda adalah prioritas utama kami dalam pengembangan AI ini.
             </p>
          </div>
        </div>
      </footer>

      {/* Floating Watermark */}
      <div className="fixed bottom-8 left-8 z-[60] group pointer-events-none md:pointer-events-auto">
        <div className="glass-panel px-6 py-3 rounded-full border-indigo-500/30 shadow-xl flex items-center gap-4 transform group-hover:translate-y-[-8px] transition-all duration-700 border bg-indigo-500/5">
          <div className="relative">
            <div className="w-2.5 h-2.5 rounded-full bg-indigo-500 animate-ping absolute inset-0"></div>
            <div className="w-2.5 h-2.5 rounded-full bg-indigo-500 relative"></div>
          </div>
          <span className="text-[10px] font-black text-indigo-400 tracking-[0.3em] uppercase">by : mr ouval m</span>
        </div>
      </div>
    </div>
  );
};

export default App;
