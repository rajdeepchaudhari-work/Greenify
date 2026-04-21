import { useEffect, useState } from 'react';
import { Link, Outlet } from 'react-router-dom';
import Footer from '../components/Footer';

const links = [
  { label: 'Problem', href: '#problem' },
  { label: 'Protocol', href: '#protocol' },
  { label: 'Why', href: '#why' },
  { label: 'Live', href: '#stats' },
  { label: 'FAQ', href: '#faq' },
];

export default function MarketingLayout() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', fn, { passive: true });
    return () => window.removeEventListener('scroll', fn);
  }, []);

  return (
    <div className="flex min-h-screen flex-col bg-cream text-ink">
      <header
        className={`fixed inset-x-0 top-0 z-[100] flex h-16 items-center justify-between border-b-[3px] border-ink bg-cream px-5 transition-shadow lg:px-10 ${
          scrolled ? 'shadow-[0_4px_0_#000]' : ''
        }`}
      >
        <Link
          to="/"
          className="flex items-center gap-2.5 font-display text-[1.2rem] font-extrabold uppercase tracking-tight"
          aria-label="Greenify home"
        >
          <span className="inline-flex h-6 w-6 items-center justify-center border-2 border-ink bg-red font-display text-[0.85rem] font-extrabold text-cream">
            G
          </span>
          Greenify
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="border-2 border-transparent px-3 py-1.5 font-mono text-[0.72rem] font-semibold uppercase tracking-[0.1em] transition-all hover:border-ink hover:bg-yellow"
            >
              {l.label}
            </a>
          ))}
          <a
            href="https://github.com/rajdeepchaudhari-work/Greenify"
            target="_blank"
            rel="noreferrer"
            className="ml-2 border-2 border-transparent px-3 py-1.5 font-mono text-[0.72rem] font-semibold uppercase tracking-[0.1em] hover:border-ink hover:bg-yellow"
          >
            GitHub ↗
          </a>
          <Link
            to="/app"
            className="ml-3 border-[3px] border-ink bg-yellow px-4 py-2 font-display text-[0.75rem] font-extrabold uppercase tracking-[0.05em] shadow-[3px_3px_0_#000] transition-all hover:-translate-x-[2px] hover:-translate-y-[2px] hover:shadow-[5px_5px_0_#000]"
          >
            Launch App →
          </Link>
        </nav>

        <button
          onClick={() => setOpen(!open)}
          aria-label="Menu"
          className="border-2 border-ink bg-yellow p-2 md:hidden"
        >
          <div className="space-y-1">
            <span
              className={`block h-[2px] w-5 bg-ink transition-all ${open ? 'translate-y-[6px] rotate-45' : ''}`}
            />
            <span
              className={`block h-[2px] w-5 bg-ink transition-all ${open ? 'opacity-0' : ''}`}
            />
            <span
              className={`block h-[2px] w-5 bg-ink transition-all ${open ? '-translate-y-[6px] -rotate-45' : ''}`}
            />
          </div>
        </button>
      </header>

      {open && (
        <div className="fixed inset-0 z-[99] flex flex-col items-center justify-center gap-5 border-b-[3px] border-ink bg-cream pt-16">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className="border-2 border-transparent px-4 py-1 font-display text-4xl font-extrabold uppercase hover:border-ink hover:bg-yellow"
            >
              {l.label}
            </a>
          ))}
          <Link
            to="/app"
            onClick={() => setOpen(false)}
            className="mt-4 border-[3px] border-ink bg-red px-6 py-3 font-display text-xl font-extrabold uppercase shadow-[4px_4px_0_#000]"
          >
            Launch App →
          </Link>
        </div>
      )}

      <main className="flex-1 pt-16">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
