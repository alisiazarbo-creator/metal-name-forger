import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Skull, Flame, Zap, Sword, Ghost, Music } from 'lucide-react';
import { generateMetalBandNames, BandNameResult } from './services/geminiService';

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

export default function App() {
  const [results, setResults] = useState<BandNameResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedGenre, setSelectedGenre] = useState<string>("Death Metal");
  const [selectedModifier, setSelectedModifier] = useState<string>("None");

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

      <main className="space-y-8">
        <section className="brutalist-border p-6 bg-metal-gray">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            <div className="w-full">
              <label className="block font-mono text-xs uppercase mb-2 opacity-70">Modifier</label>
              <select
                value={selectedModifier}
                onChange={(e) => setSelectedModifier(e.target.value)}
                className="w-full bg-metal-black border border-metal-white p-3 font-mono text-sm focus:outline-none focus:border-metal-silver"
              >
                {MODIFIERS.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
            <div className="w-full">
              <label className="block font-mono text-xs uppercase mb-2 opacity-70">Base Genre</label>
              <select
                value={selectedGenre}
                onChange={(e) => setSelectedGenre(e.target.value)}
                className="w-full bg-metal-black border border-metal-white p-3 font-mono text-sm focus:outline-none focus:border-metal-silver"
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
                  <span className="font-mono text-[10px] uppercase bg-metal-white text-metal-black px-2 py-1">
                    {band.genre}
                  </span>
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

      <footer className="mt-20 pt-8 border-t border-metal-gray text-center font-mono text-[10px] uppercase opacity-40">
        <p>&copy; 2026 Metal Name Forge // Built for the Abyss</p>
      </footer>
    </div>
  );
}
