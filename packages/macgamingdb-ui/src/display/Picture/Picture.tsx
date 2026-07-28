import React from 'react';

const OPTIMIZABLE_EXTENSION_PATTERN = /\.(png|jpe?g)$/i;

type PictureProps = React.ImgHTMLAttributes<HTMLImageElement> & {
  src: string;
  alt: string;
  pictureClassName?: string;
};

export const Picture = ({
  src,
  alt,
  pictureClassName = 'contents',
  ...imageProps
}: PictureProps) => {
  const avifSource = src.replace(OPTIMIZABLE_EXTENSION_PATTERN, '.avif');

  if (avifSource === src) {
    return <img src={src} alt={alt} {...imageProps} />;
  }

  return (
    <picture className={pictureClassName}>
      <source srcSet={avifSource} type="image/avif" />
      <img src={src} alt={alt} {...imageProps} />
    </picture>
  );
};
