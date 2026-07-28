import React from 'react';

const OPTIMIZABLE_EXTENSION_PATTERN = /\.(png|jpe?g)$/i;

const LAYOUT_NEUTRAL_WRAPPER: React.CSSProperties = { display: 'contents' };

type PictureProps = React.ImgHTMLAttributes<HTMLImageElement> & {
  src: string;
  alt: string;
};

export const Picture = ({ src, alt, ...imageProps }: PictureProps) => {
  const avifSource = src.replace(OPTIMIZABLE_EXTENSION_PATTERN, '.avif');

  if (avifSource === src) {
    return <img src={src} alt={alt} {...imageProps} />;
  }

  return (
    <picture style={LAYOUT_NEUTRAL_WRAPPER}>
      <source srcSet={avifSource} type="image/avif" />
      <img src={src} alt={alt} {...imageProps} />
    </picture>
  );
};
