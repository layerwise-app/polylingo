/**
 * `pnpm brand:assets`: draws the favicons and the share image from
 * `src/brand.config.tsx`. Run it after changing the brand.
 */
import { writeFileSync } from 'node:fs';
import { Resvg } from '@resvg/resvg-js';
import { renderToStaticMarkup } from 'react-dom/server';
import { brand } from '../src/brand.config';

const mascot = (pose: Parameters<typeof brand.mascot.draw>[0]) =>
  renderToStaticMarkup(brand.mascot.draw(pose, brand.mascot.palette));

const escapeXml = (text: string) =>
  text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

function png(svg: string, width: number): Buffer {
  return new Resvg(svg, {
    fitTo: { mode: 'width', value: width },
    font: {
      loadSystemFonts: true,
      defaultFontFamily: 'Arial Rounded MT Bold'
    }
  })
    .render()
    .asPng();
}

/** The icon: Polly's face on a rounded brand-colored tile. */
const iconSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">
  <rect width="200" height="200" rx="46" fill="${brand.colors.accent}"/>
  <g transform="translate(-12 6) scale(1.12)">${mascot('idle')}</g>
</svg>`;

const ogSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <rect width="1200" height="630" fill="${brand.colors.primary}"/>
  <circle cx="930" cy="330" r="270" fill="${brand.colors.accent}"/>
  <g transform="translate(700 90) scale(2.35)">${mascot('wave')}</g>
  <text x="80" y="250" font-size="100" font-weight="800" font-family="Arial Rounded MT Bold, Arial, Helvetica, sans-serif" fill="#ffffff">${escapeXml(brand.name)}</text>
  ${wrap(brand.tagline, 24)
    .map(
      (line, index) =>
        `<text x="80" y="${340 + index * 60}" font-size="46" font-family="Arial Rounded MT Bold, Arial, Helvetica, sans-serif" fill="#ffffff">${escapeXml(line)}</text>`
    )
    .join('')}
</svg>`;

function wrap(text: string, width: number): string[] {
  const lines: string[] = [];
  let line = '';
  for (const word of text.split(' ')) {
    if (line && `${line} ${word}`.length > width) {
      lines.push(line);
      line = word;
    } else {
      line = line ? `${line} ${word}` : word;
    }
  }
  if (line) lines.push(line);
  return lines;
}

/** An .ico file is a small header in front of PNG images. */
function ico(sizes: number[]): Buffer {
  const images = sizes.map((size) => png(iconSvg, size));
  const header = Buffer.alloc(6 + 16 * images.length);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(images.length, 4);
  let offset = header.length;
  images.forEach((image, index) => {
    const entry = 6 + index * 16;
    const size = sizes[index]!;
    header.writeUInt8(size >= 256 ? 0 : size, entry);
    header.writeUInt8(size >= 256 ? 0 : size, entry + 1);
    header.writeUInt16LE(1, entry + 4);
    header.writeUInt16LE(32, entry + 6);
    header.writeUInt32LE(image.length, entry + 8);
    header.writeUInt32LE(offset, entry + 12);
    offset += image.length;
  });
  return Buffer.concat([header, ...images]);
}

writeFileSync('public/favicon.svg', iconSvg);
writeFileSync('public/favicon.ico', ico([16, 32, 48]));
writeFileSync('public/favicon.png', png(iconSvg, 32));
writeFileSync('public/favicon-16x16.png', png(iconSvg, 16));
writeFileSync('public/favicon-32x32.png', png(iconSvg, 32));
writeFileSync('public/apple-touch-icon.png', png(iconSvg, 180));
writeFileSync('public/android-chrome-192x192.png', png(iconSvg, 192));
writeFileSync('public/android-chrome-512x512.png', png(iconSvg, 512));
writeFileSync('public/og-image.png', png(ogSvg, 1200));
writeFileSync(
  'public/site.webmanifest',
  `${JSON.stringify(
    {
      name: brand.name,
      short_name: brand.name,
      icons: [
        { src: '/android-chrome-192x192.png', sizes: '192x192', type: 'image/png' },
        { src: '/android-chrome-512x512.png', sizes: '512x512', type: 'image/png' }
      ],
      theme_color: brand.colors.primary,
      background_color: brand.colors.background,
      display: 'standalone'
    },
    null,
    2
  )}\n`
);
console.log('Brand assets written to public/.');
