import { forwardRef } from 'react';
import type { Event, MarqueTable, MarqueTableTextStyle } from '@/types/models';
import {
  mergeMarqueDesign,
  resolveMarqueDisplayDate,
  resolveMarqueDisplayName,
  resolveMarqueTitleText,
} from '@/utils/marqueTableResolve';
import FloralLeftDecoration from '@/components/marque-tables/FloralLeftDecoration';
import { resolveEventCoverUrl } from '@/utils/eventCover';
import { cn } from '@/lib/utils';

export interface MarqueTablePreviewProps {
  marque: Pick<
    MarqueTable,
    'number' | 'label' | 'titleText' | 'displayNameOverride' | 'displayDateOverride' | 'design'
  >;
  event?: Pick<Event, 'title' | 'date' | 'coverImage'> | null;
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
 * Face marque-table : photo de couverture à gauche (floral en secours).
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
    const decorationOn =
      design.decoration?.enabled !== false &&
      design.decoration?.motif !== 'none' &&
      design.templateId !== 'minimal';

    const motif = design.decoration?.motif || 'event-cover';
    const coverUrl = resolveEventCoverUrl(event as Event | null);
    const forceFloral = motif === 'floral';
    const useCover = decorationOn && Boolean(coverUrl) && !forceFloral;
    const useFloral = decorationOn && (forceFloral || !coverUrl);
    const showLeftDecor = useCover || useFloral;
    const opacity = design.decoration?.opacity ?? 0.98;

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
            {useCover && coverUrl && (
              <div
                className="absolute left-[2%] top-[8%] bottom-[8%] w-[28%] overflow-hidden pointer-events-none rounded-sm"
                style={{ opacity }}
              >
                <img
                  src={coverUrl}
                  alt=""
                  crossOrigin="anonymous"
                  className="h-full w-full object-cover"
                  draggable={false}
                />
              </div>
            )}

            {useFloral && (
              <FloralLeftDecoration
                className="absolute left-[2%] top-[8%] bottom-[8%] w-[28%] h-[84%] pointer-events-none"
                opacity={opacity}
              />
            )}

            <div
              className="absolute inset-y-0 flex flex-col items-center justify-center"
              style={{
                left: showLeftDecor ? '30%' : '8%',
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
              <p className="w-full leading-[1.05]" style={textStyle(design.title, textColor)}>
                {titleText}
              </p>

              <div className="w-full flex flex-col items-center mt-6" style={{ gap: 3 }}>
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
