import { Outlet } from 'react-router-dom';
import NavBar from '../components/NavBar';
import TxBanner from '../components/TxBanner';
import Footer from '../components/Footer';

export default function AppLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-cream text-ink">
      <TxBanner />
      <NavBar />
      <main className="mx-auto w-full max-w-6xl flex-1 px-5 py-10 lg:px-10">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
