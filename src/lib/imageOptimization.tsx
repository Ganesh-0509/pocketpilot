/**
 * @fileOverview Next.js Image Optimization Guide
 * 
 * Example patterns for optimized image loading in PocketPilot.
 */

'use client';

import Image from 'next/image';
import React from 'react';

/**
 * Example: Optimized logo with lazy loading
 */
export function OptimizedLogo() {
  return (
    <Image
      src="/logo.png"
      alt="PocketPilot Logo"
      width={200}
      height={50}
      priority // Use only for above-fold images
    />
  );
}

/**
 * Example: Lazy-loaded badge icon below fold
 */
export function LazyBadgeIcon({ src, alt }: { src: string; alt: string }) {
  return (
    <Image
      src={src}
      alt={alt}
      width={64}
      height={64}
      loading="lazy"
      className="rounded-lg"
    />
  );
}

/**
 * Example: Responsive avatar image
 */
export function OptimizedAvatar({ src, name }: { src: string; name: string }) {
  return (
    <Image
      src={src}
      alt={name}
      width={40}
      height={40}
      loading="lazy"
      className="rounded-full object-cover"
    />
  );
}

/**
 * GUIDELINES:
 * 
 * 1. Always use Next.js Image component instead of <img>:
 *    - Automatic format optimization (WebP, AVIF)
 *    - Automatic responsive sizing
 *    - Lazy loading support
 *    - Built-in blur placeholder support
 *    - CLS prevention via automatic `<img>` sizing
 * 
 * 2. Use `priority` for above-fold images only:
 *    - Logo, hero images, above-the-fold banners
 *    - Loads immediately without lazy loading
 * 
 * 3. Use `loading="lazy"` for below-fold content:
 *    - Badge icons, achievement images
 *    - User avatars in lists
 *    - Loads only when coming into viewport
 * 
 * 4. Always specify width and height:
 *    - Required for image optimization
 *    - Prevents layout shift (CLS)
 *    - Use aspect-ratio CSS if responsive sizing needed
 * 
 * 5. For dynamic images, use placeholder:
 *    - blurDataURL with base64 placeholder
 *    - Shows while loading from CDN
 * 
 * 6. Tip: Store images in /public directory:
 *    - /public/logo.png
 *    - /public/badges/
 *    - /public/avatars/
 */
