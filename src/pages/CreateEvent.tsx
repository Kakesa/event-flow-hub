/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Upload,
  Sparkles,
  PartyPopper,
  Heart,
  GraduationCap,
  Briefcase,
  Baby,
} from 'lucide-react';
import { eventsApi } from '@/services/api';

type FormDataType = {
  title: string;
  type: string;
  description: string;
  date: string;
  startTime: string;
  endTime: string;
  location: string;
  theme: string;
  coverImage: File | null;
};

const eventThemes = [
  { id: 'elegant', name: 'Élégant', color: '#D4AF37', icon: Sparkles },
  { id: 'romantic', name: 'Romantique', color: '#E91E63', icon: Heart },
  { id: 'festive', name: 'Festif', color: '#FF5722', icon: PartyPopper },
  { id: 'professional', name: 'Professionnel', color: '#2196F3', icon: Briefcase },
  { id: 'graduation', name: 'Remise de diplôme', color: '#9C27B0', icon: GraduationCap },
  { id: 'baby', name: 'Baby Shower', color: '#4CAF50', icon: Baby },
];

const eventTypes = [
  { value: 'Mariage', label: 'Mariage' },
  { value: 'Anniversaire', label: 'Anniversaire' },
  { value: 'Événement corporate', label: 'Événement corporate' },
  { value: 'Remise de diplôme', label: 'Remise de diplôme' },
  { value: 'Baby Shower', label: 'Baby Shower' },
  { value: 'Fête', label: 'Fête' },
  { value: 'Autre', label: 'Autre' },
];

const CreateEvent: React.FC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);

  const [formData, setFormData] = useState<FormDataType>({
    title: '',
    type: '',
    description: '',
    date: '',
    startTime: '',
    endTime: '',
    location: '',
    theme: 'elegant',
    coverImage: null,
  });

  /* =======================
     IMAGE PREVIEW
  ======================== */
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFormData({ ...formData, coverImage: file });

    const reader = new FileReader();
    reader.onloadend = () => setCoverPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  /* =======================
     SUBMIT FORM
  ======================== */
  const handleSubmit = async () => {
    if (!formData.title || !formData.type || !formData.date || !formData.location) {
      toast.error('Veuillez remplir tous les champs obligatoires');
      return;
    }

    setIsLoading(true);

    try {
      const payload = new FormData();
      payload.append('title', formData.title.trim());
      payload.append('type', formData.type);
      payload.append('description', formData.description?.trim() || '');
      payload.append('date', formData.date);
      payload.append('startTime', formData.startTime || '');
      payload.append('endTime', formData.endTime || '');
      payload.append('location', formData.location.trim());
      payload.append('theme', formData.theme);
      if (formData.coverImage) payload.append('coverImage', formData.coverImage);

      const res = await eventsApi.create(payload); // Axios gère Content-Type automatiquement

      if (res.data?.success) {
        toast.success('Événement créé avec succès');
        navigate(`/events/${res.data.data._id}`);
      } else {
        toast.error(res.data?.message || 'Erreur lors de la création de l’événement');
      }
    } catch (error: any) {
      console.error(error);
      toast.error(error.response?.data?.message || error.message || 'Erreur serveur');
    } finally {
      setIsLoading(false);
    }
  };

  const nextStep = () => {
    if (step === 1 && (!formData.title || !formData.type)) {
      toast.error('Veuillez remplir le titre et le type');
      return;
    }
    if (step === 2 && (!formData.date || !formData.location)) {
      toast.error('Veuillez remplir la date et le lieu');
      return;
    }
    setStep(step + 1);
  };

  const prevStep = () => setStep(step - 1);

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <Button variant="ghost" onClick={() => navigate('/events')} className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" /> Retour aux événements
          </Button>
          <h1 className="text-3xl font-bold">Créer un événement</h1>
          <p className="text-muted-foreground">Configurez votre événement en quelques étapes</p>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-between mb-8">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center flex-1">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                  step >= s ? 'bg-primary text-white' : 'bg-muted text-muted-foreground'
                }`}
              >
                {step > s ? <Check size={18} /> : s}
              </div>
              {s < 3 && <div className={`flex-1 h-1 mx-2 ${step > s ? 'bg-primary' : 'bg-muted'}`} />}
            </div>
          ))}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>
              {step === 1 && 'Informations générales'}
              {step === 2 && 'Date et lieu'}
              {step === 3 && 'Personnalisation'}
            </CardTitle>
            <CardDescription>
              {step === 1 && 'Définissez les informations de base'}
              {step === 2 && 'Précisez quand et où'}
              {step === 3 && "Personnalisez l'apparence"}
            </CardDescription>
          </CardHeader>

          <CardContent>
            {step === 1 && (
              <div className="space-y-5">
                <div>
                  <Label>Titre *</Label>
                  <Input value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} />
                </div>
                <div>
                  <Label>Type *</Label>
                  <Select value={formData.type} onValueChange={(v) => setFormData({ ...formData, type: v })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionnez un type" />
                    </SelectTrigger>
                    <SelectContent>
                      {eventTypes.map((t) => (
                        <SelectItem key={t.value} value={t.value}>
                          {t.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Description</Label>
                  <Textarea
                    rows={4}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-5">
                <div>
                  <Label>Date *</Label>
                  <Input type="date" value={formData.date} onChange={(e) => setFormData({ ...formData, date: e.target.value })} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <Input type="time" value={formData.startTime} onChange={(e) => setFormData({ ...formData, startTime: e.target.value })} />
                  <Input type="time" value={formData.endTime} onChange={(e) => setFormData({ ...formData, endTime: e.target.value })} />
                </div>
                <div>
                  <Label>Lieu *</Label>
                  <Input value={formData.location} onChange={(e) => setFormData({ ...formData, location: e.target.value })} />
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-6">
                <Label>Image de couverture</Label>
                <div className="border-2 border-dashed rounded-lg p-6 text-center">
                  <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" id="cover" />
                  <label htmlFor="cover" className="cursor-pointer">
                    {coverPreview ? (
                      <img src={coverPreview} alt="preview" className="mx-auto h-40 object-cover rounded" />
                    ) : (
                      <>
                        <Upload className="mx-auto mb-2" />
                        <p>Cliquez pour uploader</p>
                      </>
                    )}
                  </label>
                </div>
              </div>
            )}

            <div className="flex justify-between mt-8">
              <Button variant="outline" onClick={prevStep} disabled={step === 1}>
                Précédent
              </Button>
              {step < 3 ? (
                <Button onClick={nextStep}>
                  Suivant <ArrowRight size={16} className="ml-2" />
                </Button>
              ) : (
                <Button onClick={handleSubmit} disabled={isLoading}>
                  {isLoading ? 'Création...' : 'Créer l’événement'}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default CreateEvent;
