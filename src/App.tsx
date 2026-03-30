import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Skull, Flame, Zap, Sword, Ghost, Music, Play, X, Image as ImageIcon, Volume2 } from 'lucide-react';
import { generateMetalBandNames, BandNameResult, generateDemoSong, DemoSongResult, generateBandLogo, generateDemoMusic } from './services/geminiService';

declare global {
  interface Window {
    aistudio?: {
      hasSelectedApiKey: () => Promise<boolean>;
      openSelectKey: () => Promise<void>;
    };
  }
}

const SUBGENRES = [
  "Death Metal",
  "Black Metal",
  "Thrash Metal",
  "Doom Metal",
  "Power Metal",
  "Sludge Metal",
  "Grindcore",
  "Industrial Metal",
  "Speed Metal",
  "Folk Metal"
];

const MODIFIERS = [
  "None",
  "Atmospheric",
  "Symphonic",
  "Technical",
  "Melodic",
  "Brutal",
  "Progressive",
  "Old School",
  "Post-",
  "Depressive",
  "Epic"
];

interface ExtendedDemoSong extends DemoSongResult {
  logoUrl?: string;
  audioUrl?: string;
}

export default function App() {
  const [results, setResults] = useState<BandNameResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedGenre, setSelectedGenre] = useState<string>("Death Metal");
  const [selectedModifier, setSelectedModifier] = useState<string>("None");
  
  // Demo Song State
  const [activeSong, setActiveSong] = useState<ExtendedDemoSong | null>(null);
  const [songLoading, setSongLoading] = useState<string | null>(null);
  const [hasKey, setHasKey] = useState(false);

  useEffect(() => {
    const checkKey = async () => {
      if (window.aistudio?.hasSelectedApiKey) {
        const selected = await window.aistudio.hasSelectedApiKey();
        setHasKey(selected);
      }
    };
    checkKey();
  }, []);

  const handleSelectKey = async () => {
    if (window.aistudio?.openSelectKey) {
      await window.aistudio.openSelectKey();
      setHasKey(true);
    }
  };

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const fullGenre = selectedModifier !== "None" 
        ? `${selectedModifier} ${selectedGenre}` 
        : selectedGenre;
      const names = await generateMetalBandNames(5, fullGenre);
      setResults(names);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateSong = async (bandName: string, genre: string) => {
    if (!hasKey) {
      await handleSelectKey();
    }
    
    setSongLoading(bandName);
    try {
      // Generate lyrics and structure first
      const song = await generateDemoSong(bandName, genre);
      if (!song) return;

      setActiveSong(song);

      // Generate Logo and Music in parallel
      const [logoUrl, musicData] = await Promise.all([
        generateBandLogo(bandName, genre),
        generateDemoMusic(bandName, genre)
      ]);

      setActiveSong(prev => prev ? {
        ...prev,
        logoUrl: logoUrl || undefined,
        audioUrl: musicData?.audioUrl || undefined
      } : null);

    } catch (error: any) {
      console.error(error);
      if (error.message?.includes("Requested entity was not found")) {
        setHasKey(false);
        alert("API Key error. Please select your key again.");
      }
    } finally {
      setSongLoading(null);
    }
  };

  return (
    <div className="min-h-screen p-4 md:p-8 max-w-4xl mx-auto">
      <header className="mb-12 text-center">
        <h1 className="text-6xl md:text-8xl font-display uppercase tracking-tighter text-metal-white mb-2">
          Metal Name Forge
        </h1>
        <p className="font-mono text-sm uppercase tracking-widest opacity-60">
          // AI-Powered Brutality Generator //
        </p>
      </header>

      {!hasKey && (
        <div className="brutalist-border p-6 bg-metal-red/20 mb-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="font-mono text-sm uppercase">
            <span className="text-metal-red font-bold">Warning:</span> Music and Logo generation require a paid API key.
            <br />
            <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" className="underline opacity-60 hover:opacity-100">View Billing Docs</a>
          </p>
          <button onClick={handleSelectKey} className="brutalist-button whitespace-nowrap">
            Select API Key
          </button>
        </div>
      )}

      <main className="space-y-8">
        <section className="brutalist-border p-6 bg-metal-gray">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            <div className="w-full">
              <label className="block font-sans text-xs font-bold uppercase mb-2 opacity-70">Modifier</label>
              <select
                value={selectedModifier}
                onChange={(e) => setSelectedModifier(e.target.value)}
                className="w-full bg-metal-black border border-metal-white p-3 font-sans text-sm focus:outline-none focus:border-metal-silver"
              >
                {MODIFIERS.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
            <div className="w-full">
              <label className="block font-sans text-xs font-bold uppercase mb-2 opacity-70">Base Genre</label>
              <select
                value={selectedGenre}
                onChange={(e) => setSelectedGenre(e.target.value)}
                className="w-full bg-metal-black border border-metal-white p-3 font-sans text-sm focus:outline-none focus:border-metal-silver"
              >
                {SUBGENRES.map(g => <option key={g} value={g}>{g}</option>)}
              </select>
            </div>
            <button
              onClick={handleGenerate}
              disabled={loading}
              className="brutalist-button w-full disabled:opacity-50 disabled:cursor-not-allowed h-[50px]"
            >
              {loading ? "Forging..." : "Forge Names"}
            </button>
          </div>
        </section>

        <section className="grid gap-6">
          <AnimatePresence mode="popLayout">
            {results.map((band, index) => (
              <motion.div
                key={band.name + index}
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: 20, opacity: 0 }}
                transition={{ delay: index * 0.1 }}
                className="brutalist-border p-6 bg-metal-black group hover:bg-metal-gray transition-colors"
              >
                <div className="flex justify-between items-start mb-4">
                  <h2 className="text-3xl md:text-4xl font-display uppercase text-metal-white group-hover:text-metal-silver transition-colors">
                    {band.name}
                  </h2>
                  <div className="flex flex-col items-end gap-2">
                    <span className="font-mono text-[10px] uppercase bg-metal-white text-metal-black px-2 py-1">
                      {band.genre}
                    </span>
                    <button 
                      onClick={() => handleGenerateSong(band.name, band.genre)}
                      disabled={!!songLoading}
                      className="flex items-center gap-1 font-sans text-[10px] font-bold uppercase text-metal-white hover:text-metal-silver disabled:opacity-50"
                    >
                      {songLoading === band.name ? (
                        "Summoning..."
                      ) : (
                        <>
                          <Play size={10} fill="currentColor" />
                          Demo Song + Logo
                        </>
                      )}
                    </button>
                  </div>
                </div>
                <p className="font-sans text-sm opacity-80 leading-relaxed italic border-l-2 border-metal-white pl-4">
                  "{band.description}"
                </p>
                <div className="mt-4 flex gap-3 opacity-30 group-hover:opacity-100 transition-opacity">
                  <Flame size={16} />
                  <Zap size={16} />
                  <Sword size={16} />
                  <Ghost size={16} />
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {!loading && results.length === 0 && (
            <div className="text-center py-20 opacity-20">
              <Music className="w-24 h-24 mx-auto mb-4" />
              <p className="font-display text-2xl uppercase">The forge is cold. Begin the ritual.</p>
            </div>
          )}
        </section>
      </main>

      {/* Demo Song Modal */}
      <AnimatePresence>
        {activeSong && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/95 backdrop-blur-md"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="brutalist-border bg-metal-gray w-full max-w-3xl max-h-[90vh] overflow-y-auto p-8 relative"
            >
              <button 
                onClick={() => setActiveSong(null)}
                className="absolute top-4 right-4 text-metal-white hover:text-metal-silver z-10"
              >
                <X size={24} />
              </button>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                <div className="order-2 md:order-1">
                  <h3 className="font-mono text-xs uppercase opacity-50 mb-1">Demo Track</h3>
                  <h2 className="text-4xl md:text-5xl font-display uppercase text-metal-white leading-none mb-4">
                    {activeSong.title}
                  </h2>
                  
                  {activeSong.audioUrl ? (
                    <div className="bg-metal-black p-4 brutalist-border flex items-center gap-4">
                      <Volume2 className="text-metal-white animate-pulse" size={24} />
                      <audio controls className="w-full h-8 invert opacity-80" src={activeSong.audioUrl}>
                        Your browser does not support the audio element.
                      </audio>
                    </div>
                  ) : (
                    <div className="bg-metal-black p-4 brutalist-border flex items-center gap-4 opacity-50">
                      <Music className="animate-spin" size={24} />
                      <span className="font-mono text-xs uppercase">Forging Audio...</span>
                    </div>
                  )}
                </div>

                <div className="order-1 md:order-2 flex flex-col items-center">
                  <h3 className="font-mono text-xs uppercase opacity-50 mb-2 self-start">Band Logo</h3>
                  {activeSong.logoUrl ? (
                    <div className="w-full aspect-square bg-white brutalist-border overflow-hidden">
                      <img 
                        src={activeSong.logoUrl} 
                        alt="Band Logo" 
                        className="w-full h-full object-contain mix-blend-multiply"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                  ) : (
                    <div className="w-full aspect-square bg-metal-black brutalist-border flex items-center justify-center">
                      <ImageIcon className="animate-pulse text-metal-silver" size={48} />
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-8">
                <div>
                  <h4 className="font-mono text-xs uppercase border-b border-metal-white/20 pb-2 mb-4">Structure</h4>
                  <p className="font-sans text-sm italic opacity-80">
                    {activeSong.structure}
                  </p>
                </div>

                <div>
                  <h4 className="font-mono text-xs uppercase border-b border-metal-white/20 pb-2 mb-4">Lyrics</h4>
                  <pre className="font-sans text-sm whitespace-pre-wrap leading-relaxed opacity-90 p-4 bg-metal-black/50 border border-metal-white/10">
                    {activeSong.lyrics}
                  </pre>
                </div>
              </div>

              <div className="mt-12 flex justify-center">
                <button 
                  onClick={() => setActiveSong(null)}
                  className="brutalist-button"
                >
                  Return to Abyss
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <footer className="mt-20 pt-8 border-t border-metal-gray text-center font-mono text-[10px] uppercase opacity-40">
        <p>&copy; 2026 Metal Name Forge // Built for the Abyss</p>
      </footer>
    </div>
  );
}
