import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { CheckCircle2, Loader2, XCircle } from 'lucide-react';
import { qrCodeApi } from '@/services/api';
import { parseScanToken } from '@/utils/qrCode';

type CheckInState =
  | { status: 'loading' }
  | { status: 'success'; guestName: string; message?: string }
  | { status: 'error'; message: string };

const CheckIn = () => {
  const { token: rawToken } = useParams<{ token: string }>();
  const [state, setState] = useState<CheckInState>({ status: 'loading' });

  useEffect(() => {
    const token = parseScanToken(rawToken || '');
    if (!token) {
      setState({ status: 'error', message: 'QR code invalide' });
      return;
    }

    let cancelled = false;

    (async () => {
      try {
        const res = await qrCodeApi.scan(token);
        if (cancelled) return;

        if (res.data.isValid && res.data.guest?.name) {
          setState({
            status: 'success',
            guestName: res.data.guest.name,
            message: res.data.message,
          });
        } else {
          setState({
            status: 'error',
            message: res.data.message || 'Check-in impossible',
          });
        }
      } catch (err) {
        if (cancelled) return;
        setState({
          status: 'error',
          message: err instanceof Error ? err.message : 'Check-in impossible',
        });
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [rawToken]);

  return (
    <div className="min-h-screen bg-[#faf8f5] flex items-center justify-center p-6">
      <div className="w-full max-w-sm text-center space-y-6">
        <p className="text-xs uppercase tracking-[0.3em] text-[#b8956c]">HK Event</p>

        {state.status === 'loading' && (
          <div className="space-y-4">
            <Loader2 className="w-12 h-12 mx-auto animate-spin text-[#4a5a44]" />
            <p className="text-[#4a5a44]">Validation en cours…</p>
          </div>
        )}

        {state.status === 'success' && (
          <div className="space-y-4 animate-in fade-in duration-300">
            <div className="mx-auto w-20 h-20 rounded-full bg-[#4a5a44]/10 flex items-center justify-center">
              <CheckCircle2 className="w-10 h-10 text-[#4a5a44]" />
            </div>
            <div>
              <h1 className="font-display text-2xl text-[#2d3a28]">Bienvenue !</h1>
              <p className="mt-2 text-lg text-[#4a5a44]">{state.guestName}</p>
              <p className="mt-3 text-sm text-[#7a8b72]">
                {state.message || 'Présence enregistrée avec succès'}
              </p>
            </div>
          </div>
        )}

        {state.status === 'error' && (
          <div className="space-y-4 animate-in fade-in duration-300">
            <div className="mx-auto w-20 h-20 rounded-full bg-red-50 flex items-center justify-center">
              <XCircle className="w-10 h-10 text-red-600" />
            </div>
            <div>
              <h1 className="font-display text-2xl text-[#2d3a28]">Accès refusé</h1>
              <p className="mt-3 text-sm text-[#7a8b72]">{state.message}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CheckIn;
