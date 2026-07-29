import { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import FloorPlan from '@/components/seating/FloorPlan';
import { Button } from '@/components/ui/button';
import { seatingApi } from '@/services/api';
import type { Guest, SeatingOverview } from '@/types/models';
import { toast } from 'sonner';

const FloorPlanPage = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const [overview, setOverview] = useState<SeatingOverview | null>(null);
  const [loading, setLoading] = useState(true);

  const loadOverview = useCallback(async () => {
    if (!eventId) return;
    setLoading(true);
    try {
      const res = await seatingApi.getOverview(eventId);
      setOverview(res.data);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erreur');
    } finally {
      setLoading(false);
    }
  }, [eventId]);

  useEffect(() => {
    loadOverview();
  }, [loadOverview]);

  const handleMoveGuest = async (guestId: string, tableId: string | null) => {
    if (!eventId) return;
    try {
      await seatingApi.assignGuest(guestId, tableId);
      await loadOverview();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Impossible de déplacer l\'invité');
      throw err;
    }
  };

  const handleUpdatePositions = async (positions: { id: string; x: number; y: number }[]) => {
    if (!eventId) return;
    try {
      await seatingApi.updatePositions(eventId, positions);
    } catch {
      // silent — positions are best-effort
    }
  };

  if (!eventId) {
    return (
      <DashboardLayout>
        <p>Événement introuvable.</p>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <Button variant="ghost" size="sm" asChild className="mb-2 -ml-2">
              <Link to={`/events/${eventId}/tables`}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Retour aux tables
              </Link>
            </Button>
            <h1 className="font-display text-2xl font-bold">Plan de salle interactif</h1>
            <p className="text-sm text-muted-foreground">
              Glissez les invités entre les tables. Déplacez les tables pour organiser l&apos;espace.
            </p>
          </div>
        </div>

        {loading ? (
          <p className="text-muted-foreground">Chargement…</p>
        ) : overview ? (
          <FloorPlan
            tables={overview.tables}
            guests={overview.guests as Guest[]}
            onMoveGuest={handleMoveGuest}
            onUpdatePositions={handleUpdatePositions}
          />
        ) : null}

        <div className="flex gap-4 text-xs text-muted-foreground">
          <span>🟢 Disponible</span>
          <span>🟡 Presque complète</span>
          <span>🔴 Complète</span>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default FloorPlanPage;
