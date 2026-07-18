import { useMemo } from 'react';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  WHATSAPP_TEMPLATES,
  buildWhatsAppMessage,
  type WhatsAppTemplateContext,
} from '@/lib/whatsappTemplates';

interface WhatsAppTemplateSelectProps {
  value: string;
  onChange: (templateId: string) => void;
  previewContext?: WhatsAppTemplateContext;
  className?: string;
}

const WhatsAppTemplateSelect = ({
  value,
  onChange,
  previewContext,
  className,
}: WhatsAppTemplateSelectProps) => {
  const categories = useMemo(() => {
    const map = new Map<string, typeof WHATSAPP_TEMPLATES>();
    WHATSAPP_TEMPLATES.forEach((t) => {
      const list = map.get(t.category) ?? [];
      list.push(t);
      map.set(t.category, list);
    });
    return map;
  }, []);

  const preview = previewContext
    ? buildWhatsAppMessage(value, previewContext)
    : null;

  return (
    <div className={className}>
      <div className="space-y-2">
        <Label>Modèle WhatsApp</Label>
        <Select value={value} onValueChange={onChange}>
          <SelectTrigger>
            <SelectValue placeholder="Choisir un modèle" />
          </SelectTrigger>
          <SelectContent>
            {Array.from(categories.entries()).map(([category, templates]) => (
              <SelectGroup key={category}>
                <SelectLabel>{category}</SelectLabel>
                {templates.map((t) => (
                  <SelectItem key={t.id} value={t.id}>
                    {t.name}
                  </SelectItem>
                ))}
              </SelectGroup>
            ))}
          </SelectContent>
        </Select>
        <p className="text-xs text-muted-foreground">
          {WHATSAPP_TEMPLATES.find((t) => t.id === value)?.description}
        </p>
      </div>

      {preview && (
        <div className="mt-3 space-y-1.5">
          <Label className="text-xs text-muted-foreground">Aperçu</Label>
          <div className="rounded-lg border bg-[#e8f5e9]/40 p-3 text-xs whitespace-pre-wrap max-h-40 overflow-y-auto font-sans leading-relaxed">
            {preview}
          </div>
        </div>
      )}
    </div>
  );
};

export default WhatsAppTemplateSelect;
