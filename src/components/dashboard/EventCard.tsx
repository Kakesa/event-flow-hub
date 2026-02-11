import { Calendar, MapPin, Users, Clock, Edit, Trash2, MoreVertical } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { format, parseISO, isAfter } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Event } from '../../types/models';

// 🔹 URL de ton backend
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

interface EventCardProps {
  event: Event;
  guestCount?: number;
  onDelete?: (eventId: string) => void;
  onOpen?: (eventId: string) => void;
  canEdit?: boolean;
  canDelete?: boolean;
}

const EventCard = ({ event, guestCount = 0, onDelete, onOpen, canEdit = true, canDelete = true }: EventCardProps) => {
  const navigate = useNavigate();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  const eventDate = parseISO(event.date);
  const isUpcoming = isAfter(eventDate, new Date());

  const handleDelete = async () => {
    setIsDeleting(true);
    // Simulation d'appel API pour suppression
    await new Promise(resolve => setTimeout(resolve, 800));
    setIsDeleting(false);
    setDeleteDialogOpen(false);
    toast.success('Événement supprimé');
    onDelete?.(event._id);
  };

  return (
    <>
      <Card className="group overflow-hidden transition-all duration-300 hover:shadow-lg animate-slide-up">
        <div className="relative h-48 overflow-hidden bg-muted">
          <img
            src={event.coverImage 
              ? (event.coverImage.startsWith('http') 
                  ? event.coverImage 
                  : `${API_BASE_URL}${event.coverImage}`)
              : 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=800'
            }
            alt={event.title}
            className="h-full w-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
            onError={(e) => {
              (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=800';
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />

          {/* Dropdown Menu */}
          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="secondary" size="icon" className="h-8 w-8 bg-background/80 backdrop-blur-sm">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-popover">
                {canEdit && (
                  <DropdownMenuItem onClick={() => navigate(`/events/edit/${event._id}`)}>
                    <Edit className="h-4 w-4 mr-2" />
                    Modifier
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem onClick={() => navigate(`/invitations/templates?eventId=${event._id}`)}>
                  <Users className="h-4 w-4 mr-2" />
                  Envoyer invitations
                </DropdownMenuItem>
                {canDelete && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      onClick={() => setDeleteDialogOpen(true)}
                      className="text-destructive focus:text-destructive"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Supprimer
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="absolute bottom-4 left-4 right-4">
            <Badge
              variant={isUpcoming ? 'default' : 'secondary'}
              className={isUpcoming ? 'bg-primary text-primary-foreground' : ''}
            >
              {isUpcoming ? 'À venir' : 'Passé'}
            </Badge>
            <h3 className="mt-2 font-display text-xl font-semibold text-white line-clamp-1">
              {event.title}
            </h3>
          </div>
        </div>

        <CardContent className="p-4 space-y-4">
          <div className="space-y-2 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-primary" />
              <span>{format(eventDate, 'EEEE d MMMM yyyy', { locale: fr })}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-primary" />
              <span>{event.startTime} - {event.endTime}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-primary" />
              <span className="line-clamp-1">{event.location}</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-primary" />
              <span>{guestCount} invités</span>
            </div>
          </div>
          <div className="flex gap-2">
            {canEdit && (
              <Button 
                variant="default" 
                className="flex-1"
                onClick={() => navigate(`/events/edit/${event._id}`)}
              >
                <Edit className="h-4 w-4 mr-2" />
                Modifier
              </Button>
            )}
            <Button 
              variant="outline" 
              className={canEdit ? "flex-1" : "w-full"}
              onClick={() => navigate(`/guests?eventId=${event._id}`)}
            >
              Invités
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer cet événement ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irréversible. L'événement "{event.title}" et tous les invités associés seront supprimés.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? 'Suppression...' : 'Supprimer'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default EventCard;
