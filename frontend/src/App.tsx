import { Routes, Route, Navigate } from 'react-router-dom';
import MarketingLayout from './layouts/MarketingLayout';
import AppLayout from './layouts/AppLayout';
import Landing from './pages/Landing';
import Dashboard from './pages/Dashboard';
import Registry from './pages/Registry';
import Market from './pages/Market';

export default function App() {
  return (
    <Routes>
      <Route element={<MarketingLayout />}>
        <Route path="/" element={<Landing />} />
      </Route>
      <Route path="/app" element={<AppLayout />}>
        <Route index element={<Dashboard />} />
        <Route path="registry" element={<Registry />} />
        <Route path="market" element={<Market />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
