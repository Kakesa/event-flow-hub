/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, useLocation, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { Eye, EyeOff, Mail, Lock, User, Phone, ArrowLeft } from 'lucide-react';
import GoogleSignInButton from '@/components/auth/GoogleSignInButton';
import { WELCOME_ACCOUNT_SESSION_KEY } from '@/content/welcomeAccountMessage';
import { authApi } from '@/services/api';
import logoBlack from '@/assets/black.png';

interface RegisterData {
  name: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword?: string;
}

const AuthDivider = () => (
  <div className="relative my-4">
    <div className="absolute inset-0 flex items-center">
      <span className="w-full border-t border-[#e8e0d8]" />
    </div>
    <div className="relative flex justify-center text-xs uppercase">
      <span className="bg-white px-2 text-[#7a8b72]">ou</span>
    </div>
  </div>
);

const Auth = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const { login, register, loginWithGoogle } = useAuth();
  const redirectTo =
    (location.state as { from?: { pathname?: string } } | null)?.from?.pathname ?? '/dashboard';

  const initialTab =
    searchParams.get('mode') === 'register' || location.pathname === '/auth/register'
      ? 'register'
      : 'login';
  const [activeTab, setActiveTab] = useState(initialTab);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [loadingForgot, setLoadingForgot] = useState(false);

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
  const [loadingGoogle, setLoadingGoogle] = useState(false);

  const finishAuth = (user?: { role?: string }) => {
    navigate(redirectTo, { replace: true });
  };

  const handleGoogleAuth = async (credential: string) => {
    setLoadingGoogle(true);
    try {
      const result = await loginWithGoogle(credential);
      if (result.success) {
        toast.success('Connexion réussie !');
        if (result.isNewUser) {
          sessionStorage.setItem(
            WELCOME_ACCOUNT_SESSION_KEY,
            result.user?.name || 'cher client',
          );
          sessionStorage.setItem('hk_event_show_install', '1');
        }
        finishAuth(result.user);
      } else {
        toast.error(result.error || 'Connexion Google échouée');
      }
    } finally {
      setLoadingGoogle(false);
    }
  };

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
        finishAuth(result.user);
      } else {
        toast.error(result.error || 'Erreur de connexion');
      }
    } catch (err: any) {
      toast.error(err.message || 'Erreur serveur');
    } finally {
      setLoadingLogin(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail.trim()) {
      toast.error('Indiquez votre adresse email');
      return;
    }

    setLoadingForgot(true);
    try {
      const res = await authApi.forgotPassword(forgotEmail.trim());
      toast.success(res.data.message || 'Email envoyé si le compte existe');
      setShowForgotPassword(false);
      setForgotEmail('');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erreur lors de l\'envoi');
    } finally {
      setLoadingForgot(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    const { name, email, phone, password, confirmPassword } = registerData;

    if (!name.trim() || !email.trim() || !phone.trim() || !password || !confirmPassword) {
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

    let cleaned = phone.replace(/\D/g, '');
    if (cleaned.startsWith('0')) cleaned = cleaned.substring(1);
    if (cleaned.length !== 9) {
      toast.error('Numéro de téléphone invalide (9 chiffres requis)');
      return;
    }
    const phoneForBackend = cleaned;

    setLoadingRegister(true);
    try {
      const result = await register({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        phone: phoneForBackend,
        password: password.trim(),
      });

      if (result.success) {
        sessionStorage.setItem(
          WELCOME_ACCOUNT_SESSION_KEY,
          result.user?.name || name.trim(),
        );
        sessionStorage.setItem('hk_event_show_install', '1');
        finishAuth(result.user);
      } else {
        toast.error(result.error || "Erreur lors de l'inscription");
      }
    } catch (err: any) {
      toast.error(err.message || "Erreur serveur");
    } finally {
      setLoadingRegister(false);
    }
  };

  useEffect(() => {
    document.documentElement.classList.remove('dark');
    return () => document.documentElement.classList.add('dark');
  }, []);

  const authBusy = loadingLogin || loadingRegister || loadingGoogle;

  return (
    <div className="min-h-screen bg-[#faf8f5] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-block">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full border-2 border-[#b8956c] mb-4 overflow-hidden bg-white p-1">
              <img src={logoBlack} alt="Logo HK Event" className="h-full w-full object-contain" />
            </div>
          </Link>
          <p className="font-display text-3xl font-light text-[#b8956c] mb-1 tracking-wide">Bienvenue</p>
          <h1 className="font-display text-3xl font-semibold text-[#4a5a44] tracking-wide">HK Event</h1>
          <p className="text-[#7a8b72] mt-2 font-light">Connexion ou inscription à votre espace</p>
        </div>

        <Card className="border-[#e8e0d8] shadow-lg bg-white rounded-none">
          {showForgotPassword ? (
            <>
              <CardHeader className="pb-2">
                <button
                  type="button"
                  onClick={() => setShowForgotPassword(false)}
                  className="flex items-center gap-2 text-sm text-[#7a8b72] hover:text-[#4a5a44]"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Retour
                </button>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleForgotPassword} className="space-y-4">
                  <div>
                    <h2 className="font-display text-xl font-semibold text-[#4a5a44]">Mot de passe oublié</h2>
                    <p className="text-sm text-[#7a8b72] mt-1">
                      Entrez votre email pour recevoir un lien de réinitialisation.
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label>Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        className="pl-10"
                        type="email"
                        placeholder="votre@email.com"
                        value={forgotEmail}
                        onChange={(e) => setForgotEmail(e.target.value)}
                      />
                    </div>
                  </div>
                  <Button
                    type="submit"
                    className="w-full bg-[#b8956c] hover:bg-[#4a5a44] text-white rounded-none uppercase tracking-wider"
                    disabled={loadingForgot}
                  >
                    {loadingForgot ? 'Envoi...' : 'Envoyer le lien'}
                  </Button>
                </form>
              </CardContent>
            </>
          ) : (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <CardHeader className="pb-4">
              <TabsList className="grid w-full grid-cols-2 rounded-none bg-[#f5ebe6]">
                <TabsTrigger value="login" className="rounded-none data-[state=active]:bg-[#4a5a44] data-[state=active]:text-white">Connexion</TabsTrigger>
                <TabsTrigger value="register" className="rounded-none data-[state=active]:bg-[#4a5a44] data-[state=active]:text-white">Inscription</TabsTrigger>
              </TabsList>
            </CardHeader>

            <CardContent>
              <GoogleSignInButton onSuccess={handleGoogleAuth} disabled={authBusy} />
              <AuthDivider />

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
                    <div className="flex items-center justify-between">
                      <Label>Mot de passe</Label>
                      <button
                        type="button"
                        className="text-xs text-[#b8956c] hover:underline"
                        onClick={() => {
                          setForgotEmail(loginData.email);
                          setShowForgotPassword(true);
                        }}
                      >
                        Mot de passe oublié ?
                      </button>
                    </div>
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

                  <Button type="submit" className="w-full bg-[#b8956c] hover:bg-[#4a5a44] text-white rounded-none uppercase tracking-wider" disabled={authBusy}>
                    {loadingLogin ? 'Connexion...' : 'Se connecter'}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="register">
                <form onSubmit={handleRegister} className="space-y-4">
                  <div className="space-y-2">
                    <Label>Nom complet *</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        className="pl-10"
                        type="text"
                        placeholder="Witness kakesa"
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

                  <div className="space-y-2">
                    <Label>Téléphone *</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground z-10" />
                      <div className="absolute left-9 top-1/2 -translate-y-1/2 h-5 border-r border-border pr-2 flex items-center z-10">
                        <span className="text-sm text-muted-foreground font-medium">+243</span>
                      </div>
                      <Input
                        className="pl-24"
                        type="tel"
                        placeholder="81 234 5678"
                        required
                        value={registerData.phone}
                        onChange={(e) => {
                          let val = e.target.value.replace(/\D/g, '');
                          if (val.startsWith('0')) val = val.substring(1);
                          if (val.length > 9) return;
                          setRegisterData({ ...registerData, phone: val });
                        }}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Pour recevoir un message de bienvenue de l&apos;équipe HK Events sur WhatsApp.
                    </p>
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

                  <Button type="submit" className="w-full bg-[#b8956c] hover:bg-[#4a5a44] text-white rounded-none uppercase tracking-wider" disabled={authBusy}>
                    {loadingRegister ? 'Inscription...' : "S'inscrire"}
                  </Button>
                </form>
              </TabsContent>
            </CardContent>
          </Tabs>
          )}
        </Card>

        <p className="text-center text-xs text-muted-foreground mt-6">
          En continuant, vous acceptez nos conditions d'utilisation
        </p>
      </div>
    </div>
  );
};

export default Auth;
