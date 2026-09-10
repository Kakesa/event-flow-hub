import { forwardRef } from 'react';
import type { Event, MarqueTable, MarqueTableTextStyle } from '@/types/models';
import {
  mergeMarqueDesign,
  resolveMarqueDisplayDate,
  resolveMarqueDisplayName,
  resolveMarqueTitleText,
} from '@/utils/marqueTableResolve';
import FloralLeftDecoration from '@/components/marque-tables/FloralLeftDecoration';
import FloralCornersDecoration from '@/components/marque-tables/FloralCornersDecoration';
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
    fontFamily: style?.fontFamily || '"Cormorant Garamond", Georgia, serif',
    fontSize: style?.fontSize ? `${style.fontSize}px` : undefined,
    fontWeight: style?.fontWeight || 400,
    letterSpacing: style?.letterSpacing || 'normal',
    textAlign: style?.align || 'center',
    color: style?.color || fallbackColor || '#3a342c',
    transform: `translate(${style?.offsetX || 0}px, ${style?.offsetY || 0}px)`,
  };
}

const MM_TO_PX = 3.7795275591;

/**
 * Marque-table chic : photo circulaire entourée de fleurs à gauche,
 * texte libre à droite.
 */
const MarqueTablePreview = forwardRef<HTMLDivElement, MarqueTablePreviewProps>(
  ({ marque, event, scale = 1, className }, ref) => {
    const design = mergeMarqueDesign(marque.design);
    const widthPx = (design.widthMm || 160) * MM_TO_PX;
    const heightPx = (design.heightMm || 95) * MM_TO_PX;
    const displayName = resolveMarqueDisplayName(marque, event);
    const displayDate = resolveMarqueDisplayDate(marque, event);
    const titleText = resolveMarqueTitleText(marque);
    const textColor = design.textColor || '#3a342c';
    const accent = design.accentColor || '#b8956c';
    const bg = design.backgroundColor || '#faf7f2';
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
    const opacity = design.decoration?.opacity ?? 1;

    const circleSize = Math.min(heightPx * 0.58, widthPx * 0.26);

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
              backgroundColor: bg,
              color: textColor,
              boxShadow: '0 8px 28px rgba(58, 52, 44, 0.12)',
            }}
          >
            <div
              className="absolute pointer-events-none"
              style={{ inset: 8, border: `1px solid ${accent}55` }}
            />
            <div
              className="absolute pointer-events-none"
              style={{ inset: 11, border: `0.5px solid ${accent}33` }}
            />

            {/* Fleurs autour de la photo + accents côté texte */}
            {decorationOn && (
              <FloralCornersDecoration
                className="absolute inset-0 w-full h-full pointer-events-none z-[1]"
                opacity={0.92}
              />
            )}

            {/* Photo circulaire au centre de la couronne florale */}
            {useCover && coverUrl && (
              <div
                className="absolute pointer-events-none z-[2]"
                style={{
                  left: widthPx * 0.07,
                  top: '50%',
                  width: circleSize,
                  height: circleSize,
                  marginTop: -circleSize / 2,
                  opacity,
                }}
              >
                <div
                  className="relative h-full w-full overflow-hidden rounded-full"
                  style={{
                    boxShadow: `0 0 0 2px ${accent}, 0 0 0 5px ${bg}, 0 4px 14px rgba(58,52,44,0.18)`,
                  }}
                >
                  <img
                    src={coverUrl}
                    alt=""
                    crossOrigin="anonymous"
                    className="h-full w-full object-cover"
                    draggable={false}
                  />
                </div>
              </div>
            )}

            {useFloral && (
              <FloralLeftDecoration
                className="absolute left-[4%] top-[10%] bottom-[10%] w-[28%] h-[80%] pointer-events-none z-[1]"
                opacity={opacity}
              />
            )}

            {/* Texte — au-dessus des fleurs (ombre), zone centrale dégagée */}
            <div
              className="absolute inset-y-0 flex flex-col items-center justify-center z-[3]"
              style={{
                left: showLeftDecor ? '42%' : '10%',
                right: '14%',
                paddingTop: 10,
                paddingBottom: 14,
              }}
            >
              {marque.label && (
                <p
                  className="w-full uppercase"
                  style={{
                    ...textStyle(design.label, accent),
                    marginBottom: 4,
                  }}
                >
                  {marque.label}
                </p>
              )}

              <div
                className="flex items-center justify-center w-full"
                style={{ gap: 8, marginBottom: 6 }}
              >
                <span style={{ flex: 1, maxWidth: 36, height: 1, background: `${accent}99` }} />
                <span
                  style={{
                    width: 5,
                    height: 5,
                    border: `1px solid ${accent}`,
                    transform: 'rotate(45deg)',
                    flexShrink: 0,
                  }}
                />
                <span style={{ flex: 1, maxWidth: 36, height: 1, background: `${accent}99` }} />
              </div>

              <p
                className="w-full leading-none"
                style={{
                  ...textStyle(design.title, textColor),
                  marginBottom: 10,
                }}
              >
                {titleText}
              </p>

              {(displayName || displayDate) && (
                <div
                  className="flex items-center justify-center w-full"
                  style={{ gap: 8, marginBottom: 8 }}
                >
                  <span style={{ flex: 1, maxWidth: 28, height: 1, background: `${accent}66` }} />
                  <span style={{ flex: 1, maxWidth: 28, height: 1, background: `${accent}66` }} />
                </div>
              )}

              <div className="w-full flex flex-col items-center" style={{ gap: 2 }}>
                {displayName && (
                  <p className="w-full leading-snug" style={textStyle(design.names, textColor)}>
                    {displayName}
                  </p>
                )}
                {displayDate && (
                  <p
                    className="w-full leading-snug"
                    style={{
                      ...textStyle(design.date, accent),
                      opacity: 0.9,
                    }}
                  >
                    {displayDate}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  },
);

MarqueTablePreview.displayName = 'MarqueTablePreview';

export default MarqueTablePreview;
export { MM_TO_PX };
