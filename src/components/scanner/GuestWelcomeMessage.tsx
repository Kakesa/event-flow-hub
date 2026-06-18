import { cn } from '@/lib/utils';
import { LayoutPanelLeft } from 'lucide-react';

interface GuestWelcomeMessageProps {
  name: string;
  table?: string | null;
  className?: string;
  variant?: 'guest' | 'staff';
}

const GuestWelcomeMessage = ({
  name,
  table,
  className,
  variant = 'guest',
}: GuestWelcomeMessageProps) => {
  const tableLabel = table?.trim();

  return (
    <div className={cn('space-y-3 text-center', className)}>
      <div>
        <p className="wedding-script text-2xl text-[#b8956c]">Bienvenue</p>
        <h2 className="font-display text-2xl sm:text-3xl font-semibold text-[#2d3a28] mt-1">
          {name}
        </h2>
      </div>

      {tableLabel ? (
        <div className="inline-flex items-center gap-2 rounded-full border border-[#e8e0d8] bg-[#faf8f5] px-4 py-2 text-[#4a5a44]">
          <LayoutPanelLeft className="h-4 w-4 shrink-0 text-[#b8956c]" />
          <p className="text-sm sm:text-base">
            {variant === 'staff'
              ? <>Table assignée : <strong>{tableLabel}</strong></>
              : <>Vous serez placé à la table <strong>{tableLabel}</strong></>}
          </p>
        </div>
      ) : (
        <p className="text-sm text-[#7a8b72]">Table non assignée pour le moment</p>
      )}
    </div>
  );
};

export default GuestWelcomeMessage;
