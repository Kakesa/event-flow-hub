import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { 
  Calendar, Clock, MapPin, Image, Palette, 
  ArrowLeft, ArrowRight, Check, Upload, Sparkles,
  PartyPopper, Heart, GraduationCap, Briefcase, Baby, Gift
} from 'lucide-react';

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

const CreateEvent = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
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

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData({ ...formData, coverImage: file });
      const reader = new FileReader();
      reader.onloadend = () => {
        setCoverPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async () => {
    if (!formData.title || !formData.date || !formData.location) {
      toast.error('Veuillez remplir tous les champs obligatoires');
      return;
    }

    setIsLoading(true);
    
    // Simulation d'appel API
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setIsLoading(false);
    toast.success('Événement créé avec succès!');
    navigate('/events');
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
        {/* Header */}
        <div className="mb-8">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/events')}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour aux événements
          </Button>
          <h1 className="font-display text-2xl sm:text-3xl font-bold">Créer un événement</h1>
          <p className="text-muted-foreground mt-1">Configurez votre événement en quelques étapes</p>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-between mb-8">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center flex-1">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all ${
                  step >= s 
                    ? 'bg-primary text-primary-foreground' 
                    : 'bg-muted text-muted-foreground'
                }`}
              >
                {step > s ? <Check className="w-5 h-5" /> : s}
              </div>
              {s < 3 && (
                <div 
                  className={`flex-1 h-1 mx-2 rounded ${
                    step > s ? 'bg-primary' : 'bg-muted'
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        <Card className="border-border/50 shadow-lg">
          <CardHeader>
            <CardTitle>
              {step === 1 && 'Informations générales'}
              {step === 2 && 'Date et lieu'}
              {step === 3 && 'Personnalisation'}
            </CardTitle>
            <CardDescription>
              {step === 1 && 'Définissez les informations de base de votre événement'}
              {step === 2 && 'Précisez quand et où se déroulera votre événement'}
              {step === 3 && 'Personnalisez l\'apparence de votre événement'}
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            {/* Step 1: Basic Info */}
            {step === 1 && (
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="title">Titre de l'événement *</Label>
                  <Input
                    id="title"
                    placeholder="Ex: Mariage de Sophie & Pierre"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="type">Type d'événement *</Label>
                  <Select
                    value={formData.type}
                    onValueChange={(value) => setFormData({ ...formData, type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionnez un type" />
                    </SelectTrigger>
                    <SelectContent>
                      {eventTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Décrivez votre événement..."
                    rows={4}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>
              </div>
            )}

            {/* Step 2: Date & Location */}
            {step === 2 && (
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="date">Date *</Label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="date"
                      type="date"
                      className="pl-10"
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="startTime">Heure de début</Label>
                    <div className="relative">
                      <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="startTime"
                        type="time"
                        className="pl-10"
                        value={formData.startTime}
                        onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="endTime">Heure de fin</Label>
                    <div className="relative">
                      <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="endTime"
                        type="time"
                        className="pl-10"
                        value={formData.endTime}
                        onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location">Lieu *</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="location"
                      placeholder="Adresse complète du lieu"
                      className="pl-10"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Customization */}
            {step === 3 && (
              <div className="space-y-6">
                {/* Cover Image */}
                <div className="space-y-2">
                  <Label>Image de couverture</Label>
                  <div 
                    className={`relative border-2 border-dashed rounded-xl transition-all cursor-pointer hover:border-primary/50 ${
                      coverPreview ? 'border-primary' : 'border-border'
                    }`}
                  >
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    />
                    {coverPreview ? (
                      <div className="relative h-48 rounded-lg overflow-hidden">
                        <img
                          src={coverPreview}
                          alt="Preview"
                          className="w-full h-full object-cover"
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

                {/* Theme Selection */}
                <div className="space-y-3">
                  <Label>Thème de l'événement</Label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {eventThemes.map((theme) => {
                      const Icon = theme.icon;
                      return (
                        <button
                          key={theme.id}
                          type="button"
                          onClick={() => setFormData({ ...formData, theme: theme.id })}
                          className={`p-4 rounded-xl border-2 transition-all text-left ${
                            formData.theme === theme.id 
                              ? 'border-primary bg-primary/5' 
                              : 'border-border hover:border-primary/50'
                          }`}
                        >
                          <div 
                            className="w-10 h-10 rounded-lg flex items-center justify-center mb-2"
                            style={{ backgroundColor: `${theme.color}20` }}
                          >
                            <Icon className="w-5 h-5" style={{ color: theme.color }} />
                          </div>
                          <p className="font-medium text-sm">{theme.name}</p>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-8 pt-6 border-t border-border">
              <Button
                variant="outline"
                onClick={prevStep}
                disabled={step === 1}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Précédent
              </Button>
              
              {step < 3 ? (
                <Button onClick={nextStep}>
                  Suivant
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              ) : (
                <Button onClick={handleSubmit} disabled={isLoading}>
                  {isLoading ? 'Création...' : 'Créer l\'événement'}
                  <Sparkles className="w-4 h-4 ml-2" />
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
