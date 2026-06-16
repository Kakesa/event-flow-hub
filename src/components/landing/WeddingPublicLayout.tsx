import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import logoBlack from '@/assets/black.png';
import { NAV_LINKS } from '@/content/weddingLanding.fr';

interface WeddingNavbarProps {
  transparent?: boolean;
}

const NavLink = ({ href, label, onClick, mobile }: { href: string; label: string; onClick?: () => void; mobile?: boolean }) => {
  const location = useLocation();
  const isHome = location.pathname === '/';
  const className = mobile
    ? 'py-3 text-sm uppercase tracking-wider text-[#7a8b72] hover:text-[#4a5a44]'
    : 'text-sm uppercase tracking-[0.12em] text-[#7a8b72] hover:text-[#4a5a44] transition-colors';

  if (href.startsWith('/') && !href.startsWith('/#')) {
    return (
      <Link to={href} className={className} onClick={onClick}>
        {label}
      </Link>
    );
  }

  const anchorHref = href.startsWith('#') ? (isHome ? href : `/${href}`) : href;
  return (
    <a href={anchorHref} className={className} onClick={onClick}>
      {label}
    </a>
  );
};

export const WeddingNavbar = ({ transparent = false }: WeddingNavbarProps) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const navClass =
    transparent && !scrolled
      ? 'bg-transparent'
      : 'bg-[#faf8f5]/95 shadow-sm border-b border-[#e8e0d8]';

  return (
    <header className={`fixed top-0 inset-x-0 z-50 transition-all duration-500 ${navClass}`}>
      <div className="max-w-6xl mx-auto px-4 h-16 md:h-20 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="h-10 w-10 rounded-full border border-[#b8956c] p-0.5 overflow-hidden bg-white">
            <img src={logoBlack} alt="HK Event" className="h-full w-full object-contain" />
          </div>
          <span className="font-display text-xl font-semibold text-[#4a5a44] tracking-widest hidden sm:block">HK Event</span>
        </Link>

        <nav className="hidden lg:flex items-center gap-5">
          {NAV_LINKS.map((link) => (
            <NavLink key={link.href} href={link.href} label={link.label} />
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Link to="/auth" className="hidden sm:block">
            <Button variant="ghost" size="sm" className="wedding-btn-outline rounded-none uppercase tracking-wider text-xs px-5">
              Connexion
            </Button>
          </Link>
          <Link to="/auth/register" className="hidden sm:block">
            <Button size="sm" className="wedding-btn-gold rounded-none uppercase tracking-wider text-xs px-5">
              Inscription
            </Button>
          </Link>
          <button type="button" className="lg:hidden p-2" onClick={() => setMenuOpen(!menuOpen)} aria-label="Menu">
            {menuOpen ? <X className="h-6 w-6 text-[#4a5a44]" /> : <Menu className="h-6 w-6 text-[#4a5a44]" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="lg:hidden overflow-hidden bg-[#faf8f5] border-b border-[#e8e0d8]"
          >
            <div className="px-4 py-4 flex flex-col gap-1">
              {NAV_LINKS.map((link) => (
                <NavLink key={link.href} href={link.href} label={link.label} mobile onClick={() => setMenuOpen(false)} />
              ))}
              <div className="flex gap-2 pt-4 mt-2 border-t border-[#e8e0d8]">
                <Link to="/auth" className="flex-1" onClick={() => setMenuOpen(false)}>
                  <Button variant="outline" className="w-full wedding-btn-outline rounded-none">Connexion</Button>
                </Link>
                <Link to="/auth/register" className="flex-1" onClick={() => setMenuOpen(false)}>
                  <Button className="w-full wedding-btn-gold rounded-none">Inscription</Button>
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export const WeddingFooter = () => (
  <footer className="bg-[#3d4a3d] text-[#faf8f5]/70 py-12 px-4">
    <div className="max-w-6xl mx-auto text-center">
      <div className="flex items-center justify-center gap-2 mb-4">
        <div className="h-8 w-8 rounded-full border border-[#b8956c] p-0.5 bg-white overflow-hidden">
          <img src={logoBlack} alt="" className="h-full w-full object-contain" />
        </div>
        <span className="font-display text-lg text-[#faf8f5] tracking-widest">HK Event</span>
      </div>
      <p className="text-sm font-light max-w-md mx-auto">
        La plateforme de gestion d&apos;événements la plus élégante d&apos;Afrique.
      </p>
      <div className="wedding-divider my-8 text-[#b8956c]">✦</div>
      <p className="text-xs">
        © {new Date().getFullYear()} HK Event. Tous droits réservés. ·{' '}
        <a href="https://espoir-kakesa.netlify.app" className="text-[#d4bc94] hover:underline" target="_blank" rel="noopener noreferrer">
          Espoir Kakesa
        </a>
      </p>
    </div>
  </footer>
);

export const WeddingSectionTitle = ({
  script,
  title,
  subtitle,
  light = false,
}: {
  script: string;
  title: string;
  subtitle?: string;
  light?: boolean;
}) => (
  <div className="text-center mb-14">
    <p className={`wedding-script text-4xl md:text-5xl mb-2 ${light ? 'text-[#d4bc94]' : 'text-[#b8956c]'}`}>{script}</p>
    <h2 className={`font-display text-3xl md:text-5xl font-semibold tracking-wide ${light ? 'text-[#faf8f5]' : 'text-[#4a5a44]'}`}>{title}</h2>
    {subtitle && (
      <p className={`mt-4 text-lg max-w-xl mx-auto font-light ${light ? 'text-[#faf8f5]/80' : 'text-[#7a8b72]'}`}>{subtitle}</p>
    )}
    <div className={`wedding-divider mt-6 ${light ? 'text-[#d4bc94]' : ''}`}>✦</div>
  </div>
);

interface WeddingPublicLayoutProps {
  children: React.ReactNode;
  navTransparent?: boolean;
}

const WeddingPublicLayout = ({ children, navTransparent = false }: WeddingPublicLayoutProps) => {
  useEffect(() => {
    document.documentElement.classList.remove('dark');
    return () => document.documentElement.classList.add('dark');
  }, []);

  return (
    <div className="wedding-landing min-h-screen overflow-x-hidden">
      <WeddingNavbar transparent={navTransparent} />
      {children}
      <WeddingFooter />
    </div>
  );
};

export default WeddingPublicLayout;
