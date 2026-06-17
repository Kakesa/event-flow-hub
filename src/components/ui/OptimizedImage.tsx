import type { ImgHTMLAttributes } from 'react';

interface OptimizedImageProps extends ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  /** Image LCP — chargement prioritaire sans lazy */
  priority?: boolean;
  webpSrc?: string;
  srcSet?: string;
  webpSrcSet?: string;
  sizes?: string;
}

const toWebp = (src: string) => src.replace(/\.(jpe?g|png)$/i, '.webp');

const OptimizedImage = ({
  src,
  priority = false,
  webpSrc,
  srcSet,
  webpSrcSet,
  sizes,
  alt = '',
  className,
  ...rest
}: OptimizedImageProps) => {
  const webp = webpSrc ?? toWebp(src);

  return (
    <picture>
      {(webpSrcSet || webp) && (
        <source
          srcSet={webpSrcSet ?? webp}
          sizes={sizes}
          type="image/webp"
        />
      )}
      <img
        src={src}
        srcSet={srcSet}
        sizes={sizes}
        alt={alt}
        className={className}
        loading={priority ? 'eager' : 'lazy'}
        // React 18 attend l'attribut DOM en minuscules
        {...({ fetchpriority: priority ? 'high' : 'auto' } as ImgHTMLAttributes<HTMLImageElement>)}
        decoding="async"
        {...rest}
      />
    </picture>
  );
};

export default OptimizedImage;
