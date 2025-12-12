import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Calendar,
  Users,
  Mail,
  BookOpen,
  BarChart3,
  QrCode,
  Settings,
  Menu,
  X,
  Sparkles,
  LogOut,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const userName = "Hope"; // Prénom
const userLastName = "Kakesa"; // Nom de famille
const userPhoto = ""; // Laissez vide pour simuler l'absence de photo

const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Événements', href: '/events', icon: Calendar },
  { name: 'Invités', href: '/guests', icon: Users },
  { name: 'Invitations', href: '/invitations', icon: Mail },
  { name: 'Message', href: '/guestbook', icon: BookOpen },
  { name: 'Analytics', href: '/analytics', icon: BarChart3 },
  { name: 'Scanner QR', href: '/scanner', icon: QrCode },
];

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-foreground/20 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-72 bg-sidebar text-sidebar-foreground transition-transform duration-300 lg:translate-x-0',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex h-16 items-center gap-3 px-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary overflow-hidden">
              <img src="/src/assets/white.png" alt="Logo EventFlow" className="h-full w-full object-contain" />
            </div>
            <span className="font-display text-xl font-semibold text-sidebar-foreground">
              HK Event
            </span>
            <Button
              variant="ghost"
              size="icon"
              className="ml-auto lg:hidden"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          <Separator className="bg-sidebar-border" />

          {/* Navigation */}
          <ScrollArea className="flex-1 px-4 py-6">
            <nav className="space-y-1">
              {navigation.map((item) => {
                const isActive = location.pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={cn(
                      'flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-all duration-200',
                      isActive
                        ? 'bg-sidebar-primary text-sidebar-primary-foreground shadow-gold'
                        : 'text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                    )}
                    onClick={() => setSidebarOpen(false)}
                  >
                    <item.icon className="h-5 w-5" />
                    {item.name}
                  </Link>
                );
              })}
            </nav>
          </ScrollArea>

          <Separator className="bg-sidebar-border" />

          {/* Footer */}
          <div className="p-4 space-y-2">
            <Link
              to="/settings"
              className="flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors"
            >
              <Settings className="h-5 w-5" />
              Paramètres
            </Link>
            <button className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-sidebar-foreground/70 hover:bg-destructive/10 hover:text-destructive transition-colors">
              <LogOut className="h-5 w-5" />
              Déconnexion
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="lg:pl-72">
        {/* Top bar */}
        <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/60 lg:px-8">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </Button>

          <div className="flex-1" />


          <div className="flex items-center gap-3">
            {/* Conteneur pour le nom de l'utilisateur et son statut */}
            <div className="hidden sm:block text-right">
              <p className="text-sm font-medium">{userName} {userLastName || "Nom d'utilisateur"}</p>
              <p className="text-xs text-muted-foreground">Admin</p>
            </div>

            {/* Photo de profil ou initiales */}
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
              {userPhoto ? (
                <img src={userPhoto} alt="Photo de profil" className="h-full w-full rounded-full object-cover" />
              ) : (
                <span className="text-sm font-semibold text-primary">
                  {userName[0]}{userLastName[0]} {/* Affiche la première lettre du prénom et du nom */}
                </span>
              )}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="p-4 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
