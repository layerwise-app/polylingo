import type { ReactElement } from 'react';

/**
 * Everything that makes this template look like one brand lives in this file:
 * the name, the words about the product, the colors, and the mascot drawing.
 *
 * To rebrand: edit the values below, replace `drawMascot` if you have a new
 * character, then run `pnpm brand:assets` to regenerate the favicons and the
 * share image. See the README for the full walkthrough.
 */

export type MascotPose =
  | 'idle'
  | 'wave'
  | 'cheer'
  | 'sad'
  | 'think'
  | 'sleep'
  | 'talk';

export type MascotPalette = {
  body: string;
  bodyLight: string;
  bodyShade: string;
  belly: string;
  bellyShade: string;
  crest: string;
  crestShade: string;
  crestTip: string;
  crestTipShade: string;
  wing: string;
  wingShade: string;
  tail: string;
  tailShade: string;
  tailGreen: string;
  tailGreenShade: string;
  tailYellow: string;
  tailYellowShade: string;
  beak: string;
  beakLight: string;
  beakShade: string;
  face: string;
  faceShade: string;
  cheek: string;
  primaryTear: string;
  feet: string;
  feetShade: string;
  ink: string;
};

const mascotPalette: MascotPalette = {
  body: '#1E9BF0',
  bodyLight: '#62C1F8',
  bodyShade: '#1279C4',
  belly: '#FFD84D',
  bellyShade: '#F4B92F',
  crest: '#FF5A4F',
  crestShade: '#DB3D37',
  crestTip: '#FF9A3D',
  crestTipShade: '#E8761F',
  wing: '#1E9BF0',
  wingShade: '#1279C4',
  tail: '#FF5A4F',
  tailShade: '#DB3D37',
  tailGreen: '#23C07A',
  tailGreenShade: '#159A60',
  tailYellow: '#FFB627',
  tailYellowShade: '#E9930F',
  beak: '#FF9A3D',
  beakLight: '#FFC682',
  beakShade: '#E86F1E',
  face: '#FFFFFF',
  faceShade: '#D9E9F5',
  cheek: '#FF9C94',
  primaryTear: '#BFE6FF',
  feet: '#F2A13C',
  feetShade: '#CF7C1C',
  ink: '#1D2B3A'
};

export const brand = {
  name: 'Polylingo',
  /** Shown in the page footer and on the landing page. */
  tagline: 'Learn Spanish, one tiny lesson at a time.',
  /** Used for search results and link previews. */
  description:
    'Learn beginner Spanish with bite-size lessons, spoken audio, daily streaks, and a very encouraging parrot. Try your first lesson free.',
  /** The language being taught, as shown to the learner. */
  language: 'Spanish',
  /** The contact address shown on the landing page footer. */
  supportEmail: 'hello@polylingo.example',

  colors: {
    /** Main actions, links, and the current lesson. */
    primary: '#1296F0',
    /** The darker "lip" under primary 3D buttons. */
    primaryDark: '#0B72BC',
    /** Light tint for selected tiles and highlights. */
    primarySoft: '#DDF1FE',
    /** Warm accent for XP, streaks, and completed lessons. */
    accent: '#FFC629',
    accentDark: '#DE9D00',
    accentSoft: '#FFF4CC',
    /** Text color on top of the accent. */
    accentInk: '#4A3500',
    success: '#2FB344',
    successDark: '#208A31',
    successSoft: '#DDF7E0',
    danger: '#EE4B4B',
    dangerDark: '#C22F2F',
    dangerSoft: '#FFE3E1',
    heart: '#FF4B5C',
    ink: '#22313F',
    muted: '#64758A',
    border: '#DCE6EF',
    surface: '#FFFFFF',
    background: '#F5FAFE'
  },

  mascot: {
    name: 'Polly',
    /** One sentence of personality, used on the landing page. */
    description: 'Polly is a very encouraging parrot who loves a good streak.',
    palette: mascotPalette,
    /** Draws the mascot in a 200 x 200 box. Replace this to change characters. */
    draw: drawMascot
  }
};

export type Brand = typeof brand;

/** The brand colors as CSS variables, written into the page head by the root route. */
export function brandCssVariables(): string {
  const toKebab = (key: string) =>
    key.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`);
  const lines = Object.entries(brand.colors).map(
    ([key, value]) => `--brand-${toKebab(key)}:${value};`
  );
  return `:root{${lines.join('')}}`;
}

/** One feather pointing down from its root, shaded on one side of the quill. */
function Feather({
  x,
  y,
  angle,
  length,
  width,
  fill,
  shade
}: {
  x: number;
  y: number;
  angle: number;
  length: number;
  width: number;
  fill: string;
  shade: string;
}) {
  const half = width / 2;
  const rightEdge = `C${half * 0.8} ${length} ${half} ${length * 0.72} ${half} 0`;
  return (
    <g transform={`translate(${x} ${y}) rotate(${angle})`}>
      <path
        d={`M${-half} 0 C${-half} ${length * 0.72} ${-half * 0.8} ${length} 0 ${length} ${rightEdge} Z`}
        fill={fill}
      />
      <path d={`M0 ${length} ${rightEdge} L0 0 Z`} fill={shade} />
    </g>
  );
}

/**
 * A wing flaring out from the side of the body, pivoting at (0, 0). It's the body's own
 * color and sits behind it, so it grows out of the silhouette with no seam: wide at the
 * root, tapering to a soft point, with a shadow along its lower edge.
 */
function drawWing(c: MascotPalette, raised: boolean): ReactElement {
  return raised ? (
    <g>
      <path
        d='M-12 -20 C0 -34 18 -46 36 -50 C42 -51 44 -46 42 -41 C38 -22 28 0 6 16 L-20 16 Z'
        fill={c.wing}
      />
      <path
        d='M42 -41 C38 -22 28 0 6 16 L-8 16 C12 2 28 -20 36 -50 C42 -51 44 -46 42 -41 Z'
        fill={c.wingShade}
      />
    </g>
  ) : (
    <g>
      <path
        d='M-20 -24 C10 -26 30 4 35 32 C36 39 30 41 26 37 C17 28 8 23 -20 22 Z'
        fill={c.wing}
      />
      <path
        d='M35 32 C36 39 30 41 26 37 C17 28 8 23 -20 22 L-20 10 C4 10 22 18 35 32 Z'
        fill={c.wingShade}
      />
    </g>
  );
}

/** The original Polly artwork. Every shape is drawn here from scratch. */
function drawMascot(pose: MascotPose, c: MascotPalette): ReactElement {
  const raised = (side: 'left' | 'right') =>
    pose === 'cheer' || (pose === 'wave' && side === 'right');
  const wingAt = (side: 'left' | 'right') => {
    if (raised(side)) return pose === 'cheer' ? 'translate(146 94) rotate(8)' : 'translate(146 94)';
    return pose === 'sad' ? 'translate(146 104) rotate(14)' : 'translate(146 94)';
  };
  // The drawing is symmetrical, so the left wing is the right one mirrored.
  const wing = (side: 'left' | 'right') => (
    <g transform={side === 'left' ? 'translate(200 0) scale(-1 1)' : undefined}>
      <g transform={wingAt(side)} data-mascot-wing={side}>
        <g>{drawWing(c, raised(side))}</g>
      </g>
    </g>
  );

  return (
    <g>
      {/* Tail */}
      <Feather x={84} y={146} angle={24} length={46} width={22} fill={c.tail} shade={c.tailShade} />
      <Feather x={116} y={146} angle={-24} length={46} width={22} fill={c.tailGreen} shade={c.tailGreenShade} />
      <Feather x={100} y={146} angle={0} length={52} width={22} fill={c.tailYellow} shade={c.tailYellowShade} />

      {wing('left')}
      {wing('right')}

      {/* Crest */}
      <Feather x={84} y={52} angle={152} length={40} width={20} fill={c.crestTip} shade={c.crestTipShade} />
      <Feather x={116} y={52} angle={-152} length={40} width={20} fill={c.crestTip} shade={c.crestTipShade} />
      <Feather x={100} y={50} angle={180} length={48} width={22} fill={c.crest} shade={c.crestShade} />

      {/* Body and head */}
      <path
        d='M100 36 C138 36 158 66 158 104 C158 144 134 172 100 172 C66 172 42 144 42 104 C42 66 62 36 100 36 Z'
        fill={c.body}
      />
      <path
        d='M141.75 153 C131.5 165 117 172 100 172 C83 172 68.5 165 58.25 153 C76 163 124 163 141.75 153 Z'
        fill={c.bodyShade}
      />
      <path
        d='M58 78 C62 60 76 47 94 43 C81 52 70 64 66 80 C64 86 57 84 58 78 Z'
        fill={c.bodyLight}
      />

      {/* Belly, with rows of little feathers */}
      <ellipse cx='100' cy='130' rx='34' ry='34' fill={c.belly} />
      <path
        d='M134 130 C134 149 119 164 100 164 C88 164 77 158 71 149 C87 158 122 155 134 130 Z'
        fill={c.bellyShade}
      />
      <path
        d='M78 128 q6 7 12 0 M95 136 q6 7 12 0 M112 128 q6 7 12 0 M86 147 q6 7 12 0 M104 147 q6 7 12 0'
        stroke={c.bellyShade}
        strokeWidth='3'
        strokeLinecap='round'
        fill='none'
      />

      {/* Feet */}
      <g>
        <rect x='72' y='164' width='24' height='13' rx='6.5' fill={c.feet} />
        <rect x='104' y='164' width='24' height='13' rx='6.5' fill={c.feet} />
        <path
          d='M80 172 v5 M88 172 v5 M112 172 v5 M120 172 v5'
          stroke={c.feetShade}
          strokeWidth='2.5'
          strokeLinecap='round'
        />
      </g>

      {/* Face */}
      <ellipse cx='78' cy='72' rx='20' ry='21' fill={c.face} />
      <ellipse cx='122' cy='72' rx='20' ry='21' fill={c.face} />
      <path d='M62 84 C68 94 88 96 96 82 C90 90 70 92 62 84 Z' fill={c.faceShade} />
      <path d='M104 82 C112 96 132 94 138 84 C130 92 110 90 104 82 Z' fill={c.faceShade} />
      <ellipse cx='62' cy='98' rx='9' ry='7' fill={c.cheek} />
      <ellipse cx='138' cy='98' rx='9' ry='7' fill={c.cheek} />
      {drawEyes(pose, c)}

      {/* Beak: a big hooked parrot beak */}
      <g transform={pose === 'sad' ? 'translate(0 4)' : undefined}>
        {pose === 'cheer' || pose === 'talk' ? (
          <>
            <path d='M86 100 C88 122 96 134 104 134 C112 134 116 118 114 100 Z' fill={c.ink} />
            <path
              d='M93 116 C96 126 100 130 104 130 C108 130 110 122 110 116 C104 112 98 112 93 116 Z'
              fill={c.crest}
            />
          </>
        ) : null}
        <path
          d='M76 88 C78 76 122 76 124 88 C126 102 112 116 101 124 C90 116 74 104 76 88 Z'
          fill={c.beak}
        />
        <path
          d='M124 88 C126 102 112 116 101 124 C97 121 93 117 90 114 C104 114 118 104 124 88 Z'
          fill={c.beakShade}
        />
        <path
          d='M84 87 C89 82 97 81 104 82'
          fill='none'
          stroke={c.beakLight}
          strokeWidth='4'
          strokeLinecap='round'
        />
        <circle cx='92' cy='93' r='2' fill={c.beakShade} />
        <circle cx='108' cy='93' r='2' fill={c.beakShade} />
      </g>

      {pose === 'think' ? (
        <g fill={c.ink}>
          <circle cx='166' cy='44' r='4' />
          <circle cx='178' cy='30' r='6' />
        </g>
      ) : null}
      {pose === 'sleep' ? (
        <g
          fill='none'
          stroke={c.bodyShade}
          strokeWidth='4'
          strokeLinecap='round'
          strokeLinejoin='round'
        >
          <path d='M152 40 h12 l-12 14 h12' />
          <path d='M172 16 h9 l-9 11 h9' />
        </g>
      ) : null}
      {pose === 'sad' ? (
        <path
          d='M64 90 C60 98 58 102 62 106 C66 108 70 104 68 98 Z'
          fill={c.primaryTear}
        />
      ) : null}
    </g>
  );
}

function drawEyes(pose: MascotPose, c: MascotPalette): ReactElement {
  if (pose === 'sleep') {
    return (
      <g stroke={c.ink} strokeWidth='5' strokeLinecap='round' fill='none'>
        <path d='M68 72 q10 8 20 0' />
        <path d='M112 72 q10 8 20 0' />
      </g>
    );
  }
  if (pose === 'cheer') {
    return (
      <g stroke={c.ink} strokeWidth='6' strokeLinecap='round' fill='none'>
        <path d='M68 76 q10 -14 20 0' />
        <path d='M112 76 q10 -14 20 0' />
      </g>
    );
  }
  const look = pose === 'think' ? { x: 4, y: -5 } : { x: 0, y: 0 };
  return (
    <g>
      <circle cx={80 + look.x} cy={72 + look.y} r='10.5' fill={c.ink} />
      <circle cx={120 + look.x} cy={72 + look.y} r='10.5' fill={c.ink} />
      <circle cx={84 + look.x} cy={67 + look.y} r='4' fill={c.face} />
      <circle cx={124 + look.x} cy={67 + look.y} r='4' fill={c.face} />
      <circle cx={76 + look.x} cy={77 + look.y} r='1.8' fill={c.face} />
      <circle cx={116 + look.x} cy={77 + look.y} r='1.8' fill={c.face} />
      {pose === 'sad' ? (
        <g stroke={c.ink} strokeWidth='5' strokeLinecap='round'>
          <path d='M64 54 L84 48' />
          <path d='M136 54 L116 48' />
        </g>
      ) : null}
    </g>
  );
}
