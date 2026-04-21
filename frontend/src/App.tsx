import { Routes, Route } from 'react-router-dom';
import NavBar from './components/NavBar';
import TxBanner from './components/TxBanner';
import Dashboard from './pages/Dashboard';
import Registry from './pages/Registry';
import Market from './pages/Market';

export default function App() {
  return (
    <div className="min-h-screen">
      <TxBanner />
      <NavBar />
      <main className="mx-auto max-w-6xl px-4 py-8">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/registry" element={<Registry />} />
          <Route path="/market" element={<Market />} />
        </Routes>
      </main>
      <footer className="border-t-4 border-brand-black bg-brand-black px-4 py-5 text-brand-cream">
        <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-2 font-mono text-xs sm:flex-row sm:items-center">
          <div className="flex items-baseline gap-2">
            <span className="text-base font-bold uppercase">
              <span className="text-brand-red">G</span>reenify
            </span>
            <span className="uppercase opacity-70">Carbon credit protocol</span>
          </div>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 uppercase">
            <span>
              Built by{' '}
              <a
                href="https://github.com/rajdeepchaudhari-work"
                target="_blank"
                rel="noreferrer"
                className="font-bold text-brand-yellow"
              >
                Rajdeep Chaudhari
              </a>
            </span>
            <span className="opacity-60">·</span>
            <span>
              Concept by{' '}
              <a
                href="https://eagerhq.com"
                target="_blank"
                rel="noreferrer"
                className="font-bold text-brand-yellow"
              >
                EagerHQ.com
              </a>
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
