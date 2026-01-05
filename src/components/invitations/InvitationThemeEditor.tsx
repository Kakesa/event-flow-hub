import { useState } from 'react';
import { Palette, Type, Image, Sparkles, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import type { Event } from '@/types/models';

interface InvitationTheme {
  primaryColor: string;
  secondaryColor: string;
  backgroundColor: string;
  textColor: string;
  fontFamily: string;
  fontSize: number;
  borderRadius: number;
  backgroundImage?: string;
  pattern: 'none' | 'dots' | 'lines' | 'floral';
}

interface InvitationThemeEditorProps {
  event: Event;
  guestName?: string;
  onSave?: (theme: InvitationTheme) => void;
}

const defaultThemes: { name: string; theme: InvitationTheme }[] = [
  {
    name: 'Élégant Doré',
    theme: {
      primaryColor: '#D4AF37',
      secondaryColor: '#F5E6C8',
      backgroundColor: '#FFFEF5',
      textColor: '#333333',
      fontFamily: 'Playfair Display',
      fontSize: 16,
      borderRadius: 12,
      pattern: 'none',
    },
  },
  {
    name: 'Romantique Rose',
    theme: {
      primaryColor: '#E91E63',
      secondaryColor: '#FCE4EC',
      backgroundColor: '#FFF5F8',
      textColor: '#4A4A4A',
      fontFamily: 'Dancing Script',
      fontSize: 18,
      borderRadius: 20,
      pattern: 'floral',
    },
  },
  {
    name: 'Moderne Minimal',
    theme: {
      primaryColor: '#2563EB',
      secondaryColor: '#DBEAFE',
      backgroundColor: '#FFFFFF',
      textColor: '#1E293B',
      fontFamily: 'Inter',
      fontSize: 15,
      borderRadius: 8,
      pattern: 'lines',
    },
  },
  {
    name: 'Nature Vert',
    theme: {
      primaryColor: '#16A34A',
      secondaryColor: '#DCFCE7',
      backgroundColor: '#F0FDF4',
      textColor: '#166534',
      fontFamily: 'Lora',
      fontSize: 16,
      borderRadius: 16,
      pattern: 'dots',
    },
  },
];

const fontOptions = [
  { value: 'Inter', label: 'Inter (Moderne)' },
  { value: 'Playfair Display', label: 'Playfair Display (Élégant)' },
  { value: 'Dancing Script', label: 'Dancing Script (Romantique)' },
  { value: 'Lora', label: 'Lora (Classique)' },
  { value: 'Montserrat', label: 'Montserrat (Sans-serif)' },
];

const InvitationThemeEditor = ({
  event,
  guestName = 'Invité',
  onSave,
}: InvitationThemeEditorProps) => {
  const [theme, setTheme] = useState<InvitationTheme>(defaultThemes[0].theme);
  const [customMessage, setCustomMessage] = useState(
    `Nous avons le plaisir de vous inviter à ${event.title}`
  );

  const updateTheme = (updates: Partial<InvitationTheme>) => {
    setTheme(prev => ({ ...prev, ...updates }));
  };

  const getPatternStyle = () => {
    switch (theme.pattern) {
      case 'dots':
        return {
          backgroundImage: `radial-gradient(${theme.primaryColor}20 1px, transparent 1px)`,
          backgroundSize: '20px 20px',
        };
      case 'lines':
        return {
          backgroundImage: `linear-gradient(90deg, ${theme.primaryColor}10 1px, transparent 1px)`,
          backgroundSize: '40px 40px',
        };
      case 'floral':
        return {
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='${encodeURIComponent(theme.primaryColor)}' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        };
      default:
        return {};
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* Éditeur */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5" />
            Personnalisation
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="themes">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="themes">Thèmes</TabsTrigger>
              <TabsTrigger value="colors">Couleurs</TabsTrigger>
              <TabsTrigger value="typography">Texte</TabsTrigger>
            </TabsList>

            <TabsContent value="themes" className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-3">
                {defaultThemes.map((t) => (
                  <button
                    key={t.name}
                    onClick={() => setTheme(t.theme)}
                    className="p-4 rounded-lg border-2 text-left transition-all hover:border-primary"
                    style={{
                      borderColor: theme === t.theme ? t.theme.primaryColor : undefined,
                      backgroundColor: t.theme.secondaryColor,
                    }}
                  >
                    <div
                      className="h-4 w-full rounded mb-2"
                      style={{ backgroundColor: t.theme.primaryColor }}
                    />
                    <p className="text-sm font-medium" style={{ color: t.theme.textColor }}>
                      {t.name}
                    </p>
                  </button>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="colors" className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Couleur principale</Label>
                  <div className="flex gap-2 mt-1">
                    <Input
                      type="color"
                      value={theme.primaryColor}
                      onChange={(e) => updateTheme({ primaryColor: e.target.value })}
                      className="w-12 h-10 p-1"
                    />
                    <Input
                      value={theme.primaryColor}
                      onChange={(e) => updateTheme({ primaryColor: e.target.value })}
                      className="flex-1"
                    />
                  </div>
                </div>
                <div>
                  <Label>Couleur secondaire</Label>
                  <div className="flex gap-2 mt-1">
                    <Input
                      type="color"
                      value={theme.secondaryColor}
                      onChange={(e) => updateTheme({ secondaryColor: e.target.value })}
                      className="w-12 h-10 p-1"
                    />
                    <Input
                      value={theme.secondaryColor}
                      onChange={(e) => updateTheme({ secondaryColor: e.target.value })}
                      className="flex-1"
                    />
                  </div>
                </div>
                <div>
                  <Label>Arrière-plan</Label>
                  <div className="flex gap-2 mt-1">
                    <Input
                      type="color"
                      value={theme.backgroundColor}
                      onChange={(e) => updateTheme({ backgroundColor: e.target.value })}
                      className="w-12 h-10 p-1"
                    />
                    <Input
                      value={theme.backgroundColor}
                      onChange={(e) => updateTheme({ backgroundColor: e.target.value })}
                      className="flex-1"
                    />
                  </div>
                </div>
                <div>
                  <Label>Couleur du texte</Label>
                  <div className="flex gap-2 mt-1">
                    <Input
                      type="color"
                      value={theme.textColor}
                      onChange={(e) => updateTheme({ textColor: e.target.value })}
                      className="w-12 h-10 p-1"
                    />
                    <Input
                      value={theme.textColor}
                      onChange={(e) => updateTheme({ textColor: e.target.value })}
                      className="flex-1"
                    />
                  </div>
                </div>
              </div>

              <div>
                <Label>Motif de fond</Label>
                <Select
                  value={theme.pattern}
                  onValueChange={(v) => updateTheme({ pattern: v as InvitationTheme['pattern'] })}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Aucun</SelectItem>
                    <SelectItem value="dots">Points</SelectItem>
                    <SelectItem value="lines">Lignes</SelectItem>
                    <SelectItem value="floral">Floral</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Coins arrondis: {theme.borderRadius}px</Label>
                <Slider
                  value={[theme.borderRadius]}
                  onValueChange={([v]) => updateTheme({ borderRadius: v })}
                  min={0}
                  max={32}
                  step={4}
                  className="mt-2"
                />
              </div>
            </TabsContent>

            <TabsContent value="typography" className="space-y-4 mt-4">
              <div>
                <Label>Police</Label>
                <Select
                  value={theme.fontFamily}
                  onValueChange={(v) => updateTheme({ fontFamily: v })}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {fontOptions.map((font) => (
                      <SelectItem key={font.value} value={font.value}>
                        {font.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Taille du texte: {theme.fontSize}px</Label>
                <Slider
                  value={[theme.fontSize]}
                  onValueChange={([v]) => updateTheme({ fontSize: v })}
                  min={12}
                  max={24}
                  step={1}
                  className="mt-2"
                />
              </div>

              <div>
                <Label>Message personnalisé</Label>
                <Textarea
                  value={customMessage}
                  onChange={(e) => setCustomMessage(e.target.value)}
                  rows={3}
                  className="mt-1"
                />
              </div>
            </TabsContent>
          </Tabs>

          {onSave && (
            <Button onClick={() => onSave(theme)} className="w-full mt-6">
              <Sparkles className="h-4 w-4 mr-2" />
              Sauvegarder le thème
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Prévisualisation */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Prévisualisation
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div
            className="p-8 shadow-lg"
            style={{
              backgroundColor: theme.backgroundColor,
              borderRadius: theme.borderRadius,
              fontFamily: theme.fontFamily,
              fontSize: theme.fontSize,
              color: theme.textColor,
              ...getPatternStyle(),
            }}
          >
            {/* Header */}
            <div
              className="text-center pb-6 mb-6 border-b-2"
              style={{ borderColor: theme.primaryColor }}
            >
              <p className="text-sm uppercase tracking-widest mb-2" style={{ color: theme.primaryColor }}>
                Vous êtes invité(e) à
              </p>
              <h2
                className="text-3xl font-bold mb-1"
                style={{ color: theme.primaryColor }}
              >
                {event.title}
              </h2>
              <p className="text-sm opacity-75">{event.type}</p>
            </div>

            {/* Content */}
            <div className="space-y-4 text-center">
              <p className="text-lg">Cher(e) <strong>{guestName}</strong>,</p>
              <p>{customMessage}</p>

              <div
                className="py-4 px-6 rounded-lg my-6"
                style={{ backgroundColor: theme.secondaryColor }}
              >
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="font-semibold" style={{ color: theme.primaryColor }}>Date</p>
                    <p>{new Date(event.date).toLocaleDateString('fr-FR', {
                      weekday: 'long',
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}</p>
                  </div>
                  <div>
                    <p className="font-semibold" style={{ color: theme.primaryColor }}>Lieu</p>
                    <p>{event.location}</p>
                  </div>
                </div>
                {(event.startTime || event.endTime) && (
                  <div className="mt-4 text-sm">
                    <p className="font-semibold" style={{ color: theme.primaryColor }}>Horaires</p>
                    <p>
                      {event.startTime && `${event.startTime}`}
                      {event.startTime && event.endTime && ' - '}
                      {event.endTime && `${event.endTime}`}
                    </p>
                  </div>
                )}
              </div>

              <p className="text-sm italic opacity-75">
                Nous espérons vous compter parmi nous !
              </p>
            </div>

            {/* Footer */}
            <div
              className="mt-6 pt-4 border-t text-center text-xs opacity-60"
              style={{ borderColor: theme.primaryColor }}
            >
              <p>Merci de confirmer votre présence</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default InvitationThemeEditor;