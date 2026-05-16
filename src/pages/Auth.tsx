/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from 'react';
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { Eye, EyeOff, Mail, Lock, User, Phone } from 'lucide-react';

interface RegisterData {
  name: string;
  email: string;
  phone?: string;
  password: string;
  confirmPassword?: string;
}

const Auth = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const { login, register } = useAuth();

  const initialTab =
    searchParams.get('mode') === 'register' || location.pathname === '/auth/register'
      ? 'register'
      : 'login';
  const [activeTab, setActiveTab] = useState(initialTab);

  const [showPassword, setShowPassword] = useState(false);
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [registerData, setRegisterData] = useState<RegisterData>({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });
  const [loadingLogin, setLoadingLogin] = useState(false);
  const [loadingRegister, setLoadingRegister] = useState(false);

  // ------------------- LOGIN -------------------
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginData.email || !loginData.password) {
      toast.error('Veuillez remplir tous les champs');
      return;
    }

    setLoadingLogin(true);
    try {
      const result = await login(loginData.email.trim(), loginData.password);
      if (result.success) {
        toast.success('Connexion réussie !');
        navigate('/dashboard');
      } else {
        toast.error(result.error || 'Erreur de connexion');
      }
    } catch (err: any) {
      toast.error(err.message || 'Erreur serveur');
    } finally {
      setLoadingLogin(false);
    }
  };

  // ------------------- REGISTER -------------------
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    const { name, email, phone, password, confirmPassword } = registerData;

    if (!name.trim() || !email.trim() || !password || !confirmPassword) {
      toast.error('Veuillez remplir tous les champs obligatoires');
      return;
    }

    if (password !== confirmPassword) {
      toast.error('Les mots de passe ne correspondent pas');
      return;
    }

    if (password.length < 6) {
      toast.error('Le mot de passe doit contenir au moins 6 caractères');
      return;
    }

    // Format pour le backend : uniquement 9 chiffres
    let phoneForBackend: string | undefined;
    if (phone) {
      let cleaned = phone.replace(/\D/g, '');
      if (cleaned.startsWith('0')) cleaned = cleaned.substring(1);
      if (cleaned.length === 9) phoneForBackend = cleaned;
      else {
        toast.error('Numéro de téléphone invalide');
        return;
      }
    }

    setLoadingRegister(true);
    try {
      const result = await register({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        phone: phoneForBackend,
        password: password.trim(),
      });

      if (result.success) {
        toast.success("Inscription réussie ! Bienvenue !");
        navigate('/dashboard');
      } else {
        toast.error(result.error || "Erreur lors de l'inscription");
      }
    } catch (err: any) {
      toast.error(err.message || "Erreur serveur");
    } finally {
      setLoadingRegister(false);
    }
  };

  // ------------------- RENDER -------------------
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full border-2 border-primary mb-4 relative overflow-hidden">
            <img src="/src/assets/black.png" alt="Logo HK Event" className="h-full w-full object-cover" />
            <div className="absolute inset-0 bg-primary/10"></div>
          </div>
          <h1 className="font-display text-3xl font-bold text-foreground">HK Event</h1>
          <p className="text-muted-foreground mt-2">Gérez vos événements avec élégance</p>
        </div>

        <Card className="border-border/50 shadow-xl backdrop-blur-sm bg-card/95">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <CardHeader className="pb-4">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">Connexion</TabsTrigger>
                <TabsTrigger value="register">Inscription</TabsTrigger>
              </TabsList>
            </CardHeader>

            <CardContent>
              {/* Login */}
              <TabsContent value="login">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label>Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        className="pl-10"
                        type="email"
                        placeholder="votre@email.com"
                        value={loginData.email}
                        onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Mot de passe</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        className="pl-10 pr-10"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="••••••••"
                        value={loginData.password}
                        onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                      />
                      <button
                        type="button"
                        className="absolute right-3 top-1/2 -translate-y-1/2"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  <Button type="submit" className="w-full" disabled={loadingLogin}>
                    {loadingLogin ? 'Connexion...' : 'Se connecter'}
                  </Button>
                </form>
              </TabsContent>

              {/* Register */}
              <TabsContent value="register">
                <form onSubmit={handleRegister} className="space-y-4">
                  <div className="space-y-2">
                    <Label>Nom complet *</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        className="pl-10"
                        type="text"
                        placeholder="John Doe"
                        value={registerData.name}
                        onChange={(e) => setRegisterData({ ...registerData, name: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Email *</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        className="pl-10"
                        type="email"
                        placeholder="votre@email.com"
                        value={registerData.email}
                        onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                      />
                    </div>
                  </div>

                  {/* Input téléphone */}
                  <div className="space-y-2">
                    <Label>Téléphone</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground z-10" />
                      <div className="absolute left-9 top-1/2 -translate-y-1/2 h-5 border-r border-border pr-2 flex items-center z-10">
                        <span className="text-sm text-muted-foreground font-medium">+243</span>
                      </div>
                      <Input
                        className="pl-24"
                        type="tel"
                        placeholder="81 234 5678"
                        value={registerData.phone}
                        onChange={(e) => {
                          let val = e.target.value.replace(/\D/g, '');
                          if (val.startsWith('0')) val = val.substring(1);
                          if (val.length > 9) return;
                          setRegisterData({ ...registerData, phone: val });
                        }}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Mot de passe *</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        className="pl-10 pr-10"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="••••••••"
                        value={registerData.password}
                        onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                      />
                      <button
                        type="button"
                        className="absolute right-3 top-1/2 -translate-y-1/2"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Confirmer le mot de passe *</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        className="pl-10 pr-10"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="••••••••"
                        value={registerData.confirmPassword}
                        onChange={(e) => setRegisterData({ ...registerData, confirmPassword: e.target.value })}
                      />
                    </div>
                  </div>

                  <Button type="submit" className="w-full" disabled={loadingRegister}>
                    {loadingRegister ? 'Inscription...' : "S'inscrire"}
                  </Button>
                </form>
              </TabsContent>
            </CardContent>
          </Tabs>
        </Card>

        <p className="text-center text-xs text-muted-foreground mt-6">
          En continuant, vous acceptez nos conditions d'utilisation
        </p>
      </div>
    </div>
  );
};

export default Auth;
