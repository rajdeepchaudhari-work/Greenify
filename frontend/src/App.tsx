import { Routes, Route } from 'react-router-dom';
import NavBar from './components/NavBar';
import Dashboard from './pages/Dashboard';
import Registry from './pages/Registry';
import Market from './pages/Market';

export default function App() {
  return (
    <div className="min-h-screen">
      <NavBar />
      <main className="mx-auto max-w-6xl px-4 py-8">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/registry" element={<Registry />} />
          <Route path="/market" element={<Market />} />
        </Routes>
      </main>
      <footer className="border-t-4 border-brand-black bg-brand-black px-4 py-4 text-brand-cream">
        <div className="mx-auto flex max-w-6xl items-center justify-between font-mono text-xs uppercase">
          <span>Greenify · CN6035 Task 1</span>
          <span>Sepolia · ERC-1155 · Hardhat · IPFS</span>
        </div>
      </footer>
    </div>
  );
}
