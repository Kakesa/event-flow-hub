/**
 * Fleurs (PNG fond transparent) autour de la photo + accents côté texte.
 */
const FLORAL_CORNER = '/images/marque-tables/floral-corner.png?v=3';
const FLORAL_BRANCH = '/images/marque-tables/floral-branch.png?v=3';

const floralShadow =
  'drop-shadow(0 2px 3px rgba(58,52,44,0.16)) drop-shadow(0 5px 10px rgba(58,52,44,0.1))';

const FloralCornersDecoration = ({
  className,
  opacity = 0.95,
}: {
  className?: string;
  opacity?: number;
}) => (
  <div className={className} style={{ opacity }} aria-hidden>
    {/* —— Autour de la photo (gauche) —— */}
    <img
      src={FLORAL_CORNER}
      alt=""
      draggable={false}
      crossOrigin="anonymous"
      className="pointer-events-none absolute"
      style={{
        left: '2%',
        bottom: '2%',
        width: '34%',
        height: '48%',
        objectFit: 'contain',
        objectPosition: 'left bottom',
        filter: floralShadow,
      }}
    />
    <img
      src={FLORAL_CORNER}
      alt=""
      draggable={false}
      crossOrigin="anonymous"
      className="pointer-events-none absolute"
      style={{
        left: '4%',
        top: '1%',
        width: '30%',
        height: '42%',
        objectFit: 'contain',
        objectPosition: 'left top',
        transform: 'scaleY(-1)',
        filter: floralShadow,
      }}
    />
    <img
      src={FLORAL_BRANCH}
      alt=""
      draggable={false}
      crossOrigin="anonymous"
      className="pointer-events-none absolute"
      style={{
        left: '1%',
        top: '22%',
        width: '14%',
        height: '56%',
        objectFit: 'contain',
        opacity: 0.9,
        transform: 'scaleX(-1)',
        filter: floralShadow,
      }}
    />
    <img
      src={FLORAL_BRANCH}
      alt=""
      draggable={false}
      crossOrigin="anonymous"
      className="pointer-events-none absolute"
      style={{
        left: '26%',
        top: '20%',
        width: '12%',
        height: '55%',
        objectFit: 'contain',
        opacity: 0.75,
        filter: floralShadow,
      }}
    />

    {/* —— Côté texte (droite) —— */}
    <img
      src={FLORAL_CORNER}
      alt=""
      draggable={false}
      crossOrigin="anonymous"
      className="pointer-events-none absolute"
      style={{
        right: '-6%',
        top: '-8%',
        width: '28%',
        height: '40%',
        objectFit: 'contain',
        objectPosition: 'right top',
        opacity: 0.8,
        transform: 'scaleX(-1) scaleY(-1)',
        filter: floralShadow,
      }}
    />
    <img
      src={FLORAL_CORNER}
      alt=""
      draggable={false}
      crossOrigin="anonymous"
      className="pointer-events-none absolute"
      style={{
        right: '-5%',
        bottom: '-10%',
        width: '30%',
        height: '42%',
        objectFit: 'contain',
        objectPosition: 'right bottom',
        opacity: 0.82,
        transform: 'scaleX(-1)',
        filter: floralShadow,
      }}
    />
    <img
      src={FLORAL_BRANCH}
      alt=""
      draggable={false}
      crossOrigin="anonymous"
      className="pointer-events-none absolute"
      style={{
        right: '-2%',
        top: '28%',
        width: '11%',
        height: '48%',
        objectFit: 'contain',
        opacity: 0.65,
        filter: floralShadow,
      }}
    />
  </div>
);

export default FloralCornersDecoration;
