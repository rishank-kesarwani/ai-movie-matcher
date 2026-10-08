'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Film, ImageOff } from 'lucide-react';

interface MovieImageProps {
  src?: string | null;
  alt: string;
  title?: string;
  fill?: boolean;
  width?: number;
  height?: number;
  sizes?: string;
  priority?: boolean;
  className?: string;
  type?: 'poster' | 'backdrop' | 'avatar';
}

export function MovieImage({
  src,
  alt,
  title,
  fill = false,
  width,
  height,
  sizes,
  priority = false,
  className = '',
  type = 'poster',
}: MovieImageProps) {
  const [hasError, setHasError] = useState(false);

  const isInvalidSrc = !src || src.trim() === '' || src === 'null' || src === 'undefined';

  if (isInvalidSrc || hasError) {
    // Fallback UI when image is missing or 404s
    return (
      <div
        className={`w-full h-full flex flex-col items-center justify-center p-4 text-center select-none bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 border border-slate-800/80 ${className}`}
        style={!fill && width && height ? { width, height } : undefined}
      >
        <div className="w-10 h-10 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 mb-2 shadow-inner">
          <Film className="w-5 h-5 opacity-80" />
        </div>
        <p className="text-xs font-bold text-slate-200 line-clamp-2 max-w-[140px]">
          {title || alt}
        </p>
        <span className="text-[10px] text-slate-500 font-medium mt-1">
          {type === 'backdrop' ? 'No Backdrop' : 'No Poster Available'}
        </span>
      </div>
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      fill={fill}
      width={!fill ? width : undefined}
      height={!fill ? height : undefined}
      sizes={sizes}
      priority={priority}
      className={className}
      onError={() => setHasError(true)}
    />
  );
}
