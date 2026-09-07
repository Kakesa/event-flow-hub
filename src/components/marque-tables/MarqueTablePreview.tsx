import { forwardRef } from 'react';
import type { Event, MarqueTable, MarqueTableTextStyle } from '@/types/models';
import {
  mergeMarqueDesign,
  resolveMarqueDisplayDate,
  resolveMarqueDisplayName,
  resolveMarqueTitleText,
} from '@/utils/marqueTableResolve';
import FloralLeftDecoration from '@/components/marque-tables/FloralLeftDecoration';
import { cn } from '@/lib/utils';

export interface MarqueTablePreviewProps {
  marque: Pick<
    MarqueTable,
    'number' | 'label' | 'titleText' | 'displayNameOverride' | 'displayDateOverride' | 'design'
  >;
  event?: Pick<Event, 'title' | 'date'> | null;
  scale?: number;
  className?: string;
}

function textStyle(style?: MarqueTableTextStyle, fallbackColor?: string): React.CSSProperties {
  return {
    fontFamily: style?.fontFamily || 'Georgia, "Times New Roman", serif',
    fontSize: style?.fontSize ? `${style.fontSize}px` : undefined,
    fontWeight: style?.fontWeight || 400,
    letterSpacing: style?.letterSpacing || 'normal',
    textAlign: style?.align || 'center',
    color: style?.color || fallbackColor || '#3d3d3d',
    transform: `translate(${style?.offsetX || 0}px, ${style?.offsetY || 0}px)`,
  };
}

const MM_TO_PX = 3.7795275591;

/**
 * Face du marque-table — style référence paysage :
 * fleurs à gauche, texte au centre-droit, noms/date en bas avec marge.
 */
const MarqueTablePreview = forwardRef<HTMLDivElement, MarqueTablePreviewProps>(
  ({ marque, event, scale = 1, className }, ref) => {
    const design = mergeMarqueDesign(marque.design);
    const widthPx = (design.widthMm || 160) * MM_TO_PX;
    const heightPx = (design.heightMm || 95) * MM_TO_PX;
    const displayName = resolveMarqueDisplayName(marque, event);
    const displayDate = resolveMarqueDisplayDate(marque, event);
    const titleText = resolveMarqueTitleText(marque);
    const textColor = design.textColor || '#3d3d3d';
    const showFloral =
      design.decoration?.enabled !== false &&
      design.decoration?.motif !== 'none' &&
      design.templateId !== 'minimal';

    return (
      <div
        className={cn('relative', className)}
        style={{
          width: widthPx * scale,
          height: heightPx * scale,
        }}
      >
        <div
          style={{
            transform: `scale(${scale})`,
            transformOrigin: 'top left',
            width: widthPx,
            height: heightPx,
          }}
        >
          <div
            ref={ref}
            data-marque-face="face"
            className="relative overflow-hidden select-none"
            style={{
              width: widthPx,
              height: heightPx,
              backgroundColor: design.backgroundColor || '#ffffff',
              border: design.border?.enabled
                ? `${(design.border.widthMm || 0.3) * MM_TO_PX}px solid ${design.border.color || '#e5e0d8'}`
                : '1px solid rgba(0,0,0,0.06)',
              borderRadius: design.border?.radiusMm
                ? `${design.border.radiusMm * MM_TO_PX}px`
                : undefined,
              color: textColor,
              boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
            }}
          >
            {showFloral && (
              <FloralLeftDecoration
                className="absolute left-[2%] top-[8%] bottom-[8%] w-[28%] h-[84%] pointer-events-none"
                opacity={design.decoration?.opacity ?? 0.95}
              />
            )}

            {/* Bloc texte — centre / droite comme la référence */}
            <div
              className="absolute inset-y-0 flex flex-col items-center justify-center"
              style={{
                left: showFloral ? '30%' : '8%',
                right: '8%',
                paddingBottom: '6%',
              }}
            >
              {marque.label && (
                <p
                  className="w-full mb-1"
                  style={{
                    ...textStyle(design.label, textColor),
                    opacity: 0.85,
                  }}
                >
                  {marque.label}
                </p>
              )}
              <p
                className="w-full leading-[1.05]"
                style={textStyle(design.title, textColor)}
              >
                {titleText}
              </p>

              <div
                className="w-full flex flex-col items-center mt-6"
                style={{ gap: 3 }}
              >
                {displayName && (
                  <p className="w-full leading-snug" style={textStyle(design.names, textColor)}>
                    {displayName}
                  </p>
                )}
                {displayDate && (
                  <p className="w-full leading-snug" style={textStyle(design.date, textColor)}>
                    {displayDate}
                  </p>
                )}
              </div>
            </div>

            {/* Espace bas volontaire (après la date / avant le bord table) */}
            <div className="absolute bottom-0 left-0 right-0 h-[12%] pointer-events-none" />
          </div>
        </div>
      </div>
    );
  },
);

MarqueTablePreview.displayName = 'MarqueTablePreview';

export default MarqueTablePreview;
export { MM_TO_PX };
