/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import { Calendar, Clock, MapPin, Upload, Save, ArrowLeft, Trash2, Sparkles, Heart, PartyPopper, GraduationCap, Briefcase, Baby } from 'lucide-react';
import { eventsApi } from '@/services/api';

const eventThemes = [
  { id: 'elegant', name: 'Élégant', color: '#D4AF37', icon: Sparkles },
  { id: 'romantic', name: 'Romantique', color: '#E91E63', icon: Heart },
  { id: 'festive', name: 'Festif', color: '#FF5722', icon: PartyPopper },
  { id: 'professional', name: 'Professionnel', color: '#2196F3', icon: Briefcase },
  { id: 'graduation', name: 'Remise de diplôme', color: '#9C27B0', icon: GraduationCap },
  { id: 'baby', name: 'Baby Shower', color: '#4CAF50', icon: Baby },
];

const eventTypes = [
  { value: 'wedding', label: 'Mariage' },
  { value: 'birthday', label: 'Anniversaire' },
  { value: 'corporate', label: 'Événement corporate' },
  { value: 'graduation', label: 'Remise de diplôme' },
  { value: 'babyshower', label: 'Baby Shower' },
  { value: 'party', label: 'Fête' },
  { value: 'other', label: 'Autre' },
];

const EditEvent = () => {
  const navigate = useNavigate();
  const { eventId } = useParams();
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);

  const [formData, setFormData] = useState<any>({
    title: '',
    type: '',
    description: '',
    date: '',
    startTime: '',
    endTime: '',
    location: '',
    theme: 'elegant',
    coverImage: null as File | null,
  });

  // Load event from API
  useEffect(() => {
    if (!eventId) return;

    const fetchEvent = async () => {
      try {
        const res = await eventsApi.getById(eventId);
        const event = res.data;
        setFormData({
          title: event.title,
          type: event.type,
          description: event.description,
          date: event.date,
          startTime: event.startTime,
          endTime: event.endTime,
          location: event.location,
          theme: event.theme || 'elegant',
          coverImage: null,
        });
        setCoverPreview(event.coverImage);
      } catch (error: any) {
        toast.error('Impossible de charger l’événement');
        navigate('/events');
      }
    };

    fetchEvent();
  }, [eventId, navigate]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData({ ...formData, coverImage: file });
      const reader = new FileReader();
      reader.onloadend = () => setCoverPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title || !formData.date || !formData.location) {
      toast.error('Veuillez remplir tous les champs obligatoires');
      return;
    }

    setIsLoading(true);

    try {
      const updateData = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        if (value !== null) updateData.append(key, value as any);
      });

      await eventsApi.update(eventId!, updateData);

      toast.success('Événement mis à jour avec succès!');
      navigate('/events');
    } catch (error: any) {
      toast.error('Erreur lors de la mise à jour de l’événement');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await eventsApi.delete(eventId!);
      toast.success('Événement supprimé');
      navigate('/events');
    } catch (error) {
      toast.error('Impossible de supprimer l’événement');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <Button variant="ghost" onClick={() => navigate('/events')} className="mb-2 -ml-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Retour aux événements
            </Button>
            <h1 className="font-display text-2xl sm:text-3xl font-bold">Modifier l'événement</h1>
          </div>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" size="sm">
                <Trash2 className="w-4 h-4 mr-2" />
                Supprimer
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Supprimer cet événement?</AlertDialogTitle>
                <AlertDialogDescription>
                  Cette action est irréversible. Tous les invités et messages associés seront également supprimés.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Annuler</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                  {isDeleting ? 'Suppression...' : 'Supprimer'}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>

        <form onSubmit={handleSubmit}>
          <Card className="border-border/50 shadow-lg">
            <CardHeader>
              <CardTitle>Informations de l'événement</CardTitle>
              <CardDescription>Modifiez les détails de votre événement</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Cover Image */}
              <div className="space-y-2">
                <Label>Image de couverture</Label>
                <div className={`relative border-2 border-dashed rounded-xl transition-all cursor-pointer hover:border-primary/50 ${coverPreview ? 'border-primary' : 'border-border'}`}>
                  <input type="file" accept="image/*" onChange={handleImageChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                  {coverPreview ? (
                    <div className="relative h-48 rounded-lg overflow-hidden bg-gray-900/10">
                      <img 
                        src={coverPreview.startsWith('data:') 
                          ? coverPreview 
                          : (coverPreview.startsWith('http') 
                              ? coverPreview 
                              : `${import.meta.env.VITE_API_BASE_URL}${coverPreview.startsWith('/') ? '' : '/'}${coverPreview}`)} 
                        alt="Preview" 
                        className="w-full h-full object-contain" 
                      />
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                        <p className="text-white font-medium">Changer l'image</p>
                      </div>
                    </div>
                  ) : (
                    <div className="h-48 flex flex-col items-center justify-center text-muted-foreground">
                      <Upload className="w-10 h-10 mb-2" />
                      <p className="font-medium">Cliquez pour télécharger</p>
                      <p className="text-sm">PNG, JPG jusqu'à 10MB</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Basic Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="title">Titre de l'événement *</Label>
                  <Input id="title" placeholder="Titre" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="type">Type d'événement *</Label>
                  <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
                    <SelectTrigger><SelectValue placeholder="Sélectionnez un type" /></SelectTrigger>
                    <SelectContent>
                      {eventTypes.map((type) => (<SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="date">Date *</Label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input id="date" type="date" className="pl-10" value={formData.date} onChange={(e) => setFormData({ ...formData, date: e.target.value })} />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startTime">Heure de début</Label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input id="startTime" type="time" className="pl-10" value={formData.startTime} onChange={(e) => setFormData({ ...formData, startTime: e.target.value })} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endTime">Heure de fin</Label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input id="endTime" type="time" className="pl-10" value={formData.endTime} onChange={(e) => setFormData({ ...formData, endTime: e.target.value })} />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Lieu *</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input id="location" placeholder="Adresse complète" className="pl-10" value={formData.location} onChange={(e) => setFormData({ ...formData, location: e.target.value })} />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" placeholder="Décrivez l'événement..." rows={4} value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
              </div>

              {/* Theme Selection */}
              <div className="space-y-3">
                <Label>Thème de l'événement</Label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {eventThemes.map((theme) => {
                    const Icon = theme.icon;
                    return (
                      <button key={theme.id} type="button" onClick={() => setFormData({ ...formData, theme: theme.id })} className={`p-4 rounded-xl border-2 transition-all text-left ${formData.theme === theme.id ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'}`}>
                        <div className="w-10 h-10 rounded-lg flex items-center justify-center mb-2" style={{ backgroundColor: `${theme.color}20` }}>
                          <Icon className="w-5 h-5" style={{ color: theme.color }} />
                        </div>
                        <p className="font-medium text-sm">{theme.name}</p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex justify-end gap-3 pt-4 border-t border-border">
                <Button type="button" variant="outline" onClick={() => navigate('/events')}>Annuler</Button>
                <Button type="submit" disabled={isLoading}>
                  <Save className="w-4 h-4 mr-2" />
                  {isLoading ? 'Enregistrement...' : 'Enregistrer'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </form>
      </div>
    </DashboardLayout>
  );
};

export default EditEvent;
