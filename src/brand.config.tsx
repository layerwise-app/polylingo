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
  bodyShade: string;
  belly: string;
  crest: string;
  crestTip: string;
  wing: string;
  wingTip: string;
  tail: string;
  beak: string;
  beakShade: string;
  face: string;
  primaryTear: string;
  feet: string;
  ink: string;
};

const mascotPalette: MascotPalette = {
  body: '#1E9BF0',
  bodyShade: '#1279C4',
  belly: '#FFD84D',
  crest: '#FF5A4F',
  crestTip: '#FF9A3D',
  wing: '#23C07A',
  wingTip: '#FFB627',
  tail: '#FF5A4F',
  beak: '#FF9A3D',
  beakShade: '#E86F1E',
  face: '#FFFFFF',
  primaryTear: '#BFE6FF',
  feet: '#F2A13C',
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

/** The original Polly artwork. Every shape is drawn here from scratch. */
function drawMascot(pose: MascotPose, c: MascotPalette): ReactElement {
  const leftWing =
    pose === 'cheer'
      ? 'translate(-16 -2) rotate(112 56 104)'
      : pose === 'sad'
        ? 'rotate(-8 56 104)'
        : 'rotate(6 56 104)';
  const rightWing =
    pose === 'cheer'
      ? 'translate(16 -2) rotate(-112 144 104)'
      : pose === 'wave'
        ? 'translate(18 -4) rotate(-118 144 104)'
        : pose === 'think'
          ? 'rotate(-72 144 104)'
          : pose === 'sad'
            ? 'rotate(8 144 104)'
            : 'rotate(-6 144 104)';

  return (
    <g>
      {/* Tail */}
      <path
        d='M78 150 C60 168 54 186 62 196 C76 194 90 178 94 158 Z'
        fill={c.tail}
      />
      <path
        d='M92 156 C88 176 90 192 100 198 C110 192 112 176 108 156 Z'
        fill={c.wingTip}
      />
      <path
        d='M122 150 C140 168 146 186 138 196 C124 194 110 178 106 158 Z'
        fill={c.wing}
      />

      {/* Feet */}
      <g fill={c.feet}>
        <rect x='74' y='164' width='22' height='12' rx='6' />
        <rect x='104' y='164' width='22' height='12' rx='6' />
      </g>

      {/* Left wing, behind the body */}
      <g transform={leftWing} data-mascot-wing='left'>
        <path
          d='M60 84 C38 92 28 118 34 142 C48 142 66 128 72 104 Z'
          fill={c.wing}
        />
        <path
          d='M34 142 C32 132 32 124 34 116 C42 122 50 126 58 128 C50 136 42 141 34 142 Z'
          fill={c.wingTip}
        />
      </g>

      {/* Crest */}
      <g>
        <path
          d='M100 42 C84 30 78 14 84 4 C98 8 108 22 108 40 Z'
          fill={c.crest}
        />
        <path
          d='M92 44 C74 38 62 26 62 14 C78 12 94 24 100 40 Z'
          fill={c.crestTip}
        />
        <path
          d='M106 42 C114 28 126 18 138 18 C138 32 126 44 112 48 Z'
          fill={c.crestTip}
        />
      </g>

      {/* Body and head */}
      <path
        d='M100 36 C138 36 158 66 158 104 C158 144 134 172 100 172 C66 172 42 144 42 104 C42 66 62 36 100 36 Z'
        fill={c.body}
      />
      <path
        d='M58 148 C70 164 84 172 100 172 C116 172 130 164 142 148 C128 158 72 158 58 148 Z'
        fill={c.bodyShade}
      />
      <ellipse cx='100' cy='130' rx='34' ry='34' fill={c.belly} />
      <path
        d='M80 124 q5 5 10 0 M100 134 q5 5 10 0 M112 118 q5 5 10 0 M86 146 q5 5 10 0'
        stroke={c.beak}
        strokeWidth='3'
        strokeLinecap='round'
        fill='none'
        opacity='0.55'
      />

      {/* Face */}
      <ellipse cx='78' cy='72' rx='19' ry='20' fill={c.face} />
      <ellipse cx='122' cy='72' rx='19' ry='20' fill={c.face} />
      <circle cx='56' cy='98' r='9' fill={c.crest} opacity='0.85' />
      <circle cx='144' cy='98' r='9' fill={c.crest} opacity='0.85' />
      {drawEyes(pose, c)}

      {/* Beak: a big hooked parrot beak */}
      {pose === 'cheer' || pose === 'talk' ? (
        <path
          d='M86 100 C88 122 96 134 104 134 C112 134 116 118 114 100 Z'
          fill={c.ink}
        />
      ) : null}
      {pose === 'cheer' || pose === 'talk' ? (
        <path
          d='M93 116 C96 126 100 130 104 130 C108 130 110 122 110 116 C104 112 98 112 93 116 Z'
          fill={c.crest}
        />
      ) : null}
      <path
        d={
          pose === 'sad'
            ? 'M76 92 C78 80 122 80 124 92 C126 106 112 122 101 130 C90 122 74 108 76 92 Z'
            : 'M76 88 C78 76 122 76 124 88 C126 102 112 116 101 124 C90 116 74 104 76 88 Z'
        }
        fill={c.beak}
      />
      <path
        d={
          pose === 'sad'
            ? 'M101 130 C96 124 94 116 96 108 C104 112 112 110 118 104 C114 114 108 124 101 130 Z'
            : 'M101 124 C96 118 94 110 96 102 C104 106 112 104 118 98 C114 108 108 118 101 124 Z'
        }
        fill={c.beakShade}
      />
      <path
        d='M86 86 C92 82 100 82 106 84'
        fill='none'
        stroke={c.face}
        strokeWidth='3'
        strokeLinecap='round'
        opacity='0.6'
      />

      {/* Right wing, in front */}
      <g transform={rightWing} data-mascot-wing='right'>
        <path
          d='M140 84 C162 92 172 118 166 142 C152 142 134 128 128 104 Z'
          fill={c.wing}
        />
        <path
          d='M166 142 C168 132 168 124 166 116 C158 122 150 126 142 128 C150 136 158 141 166 142 Z'
          fill={c.wingTip}
        />
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
      <circle cx={80 + look.x} cy={72 + look.y} r='9.5' fill={c.ink} />
      <circle cx={120 + look.x} cy={72 + look.y} r='9.5' fill={c.ink} />
      <circle cx={83 + look.x} cy={68 + look.y} r='3.5' fill={c.face} />
      <circle cx={123 + look.x} cy={68 + look.y} r='3.5' fill={c.face} />
      {pose === 'sad' ? (
        <g stroke={c.ink} strokeWidth='5' strokeLinecap='round'>
          <path d='M64 54 L84 48' />
          <path d='M136 54 L116 48' />
        </g>
      ) : null}
    </g>
  );
}
