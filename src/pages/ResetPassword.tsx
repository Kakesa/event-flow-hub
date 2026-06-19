import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Lock, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { authApi } from '@/services/api';
import logoBlack from '@/assets/black.png';

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token') || '';

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!token) {
      toast.error('Lien de réinitialisation invalide');
      return;
    }

    if (password.length < 6) {
      toast.error('Le mot de passe doit contenir au moins 6 caractères');
      return;
    }

    if (password !== confirmPassword) {
      toast.error('Les mots de passe ne correspondent pas');
      return;
    }

    setLoading(true);
    try {
      const res = await authApi.resetPassword(token, password);
      if (res.success && res.data.token) {
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('eventflow_user', JSON.stringify(res.data.user));
        toast.success('Mot de passe mis à jour');
        navigate('/dashboard', { replace: true });
        window.location.reload();
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Réinitialisation impossible');
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen bg-[#faf8f5] flex items-center justify-center p-4">
        <Card className="w-full max-w-md border-[#e8e0d8] rounded-none">
          <CardContent className="pt-6 text-center space-y-4">
            <p className="text-[#4a5a44]">Ce lien de réinitialisation est invalide.</p>
            <Button asChild className="rounded-none bg-[#b8956c] hover:bg-[#4a5a44]">
              <Link to="/auth">Retour à la connexion</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#faf8f5] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-block">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full border-2 border-[#b8956c] mb-4 overflow-hidden bg-white p-1">
              <img src={logoBlack} alt="Logo HK Event" className="h-full w-full object-contain" />
            </div>
          </Link>
          <h1 className="font-display text-3xl font-semibold text-[#4a5a44]">Nouveau mot de passe</h1>
          <p className="text-[#7a8b72] mt-2">Choisissez un mot de passe sécurisé</p>
        </div>

        <Card className="border-[#e8e0d8] shadow-lg bg-white rounded-none">
          <CardHeader className="pb-2" />
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Nouveau mot de passe</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    className="pl-10 pr-10"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
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
                <Label>Confirmer le mot de passe</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    className="pl-10"
                    type={showPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-[#b8956c] hover:bg-[#4a5a44] text-white rounded-none uppercase tracking-wider"
                disabled={loading}
              >
                {loading ? 'Enregistrement...' : 'Enregistrer'}
              </Button>

              <p className="text-center text-sm">
                <Link to="/auth" className="text-[#b8956c] hover:underline">
                  Retour à la connexion
                </Link>
              </p>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ResetPassword;
