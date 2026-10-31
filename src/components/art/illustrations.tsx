import type { ReactElement } from 'react';

/**
 * Original illustrations for the course. Each one is drawn in a 96 x 96 box.
 * To add one, add a key here and use that key as `art` in a lesson file.
 */

const sky = '#BFE6FF';
const skyDeep = '#7CC8F8';
const ink = '#22313F';
const sun = '#FFC629';
const sunDeep = '#F59E0B';
const red = '#EE4B4B';
const redDeep = '#C22F2F';
const green = '#2FB344';
const greenDeep = '#208A31';
const blue = '#1296F0';
const blueDeep = '#0B72BC';
const purple = '#8B5CF6';
const pink = '#F472B6';
const orange = '#FB923C';
const brown = '#92623A';
const brownDeep = '#6E4524';
const cream = '#FFF4DA';
const grey = '#CBD6E2';
const greyDeep = '#94A3B8';
const white = '#FFFFFF';
const skin = '#F6C8A0';
const skinDark = '#B97A4B';

type PersonOptions = {
  skinTone?: string;
  hair: string;
  /** The shape of the hair. */
  style: 'short' | 'long' | 'bun' | 'bald' | 'curly' | 'ponytail';
  top: string;
  extra?: ReactElement;
  glasses?: boolean;
  beard?: string;
  /** Scales the figure down so it reads as a child. */
  small?: boolean;
};

function Person({
  skinTone = skin,
  hair,
  style,
  top,
  extra,
  glasses,
  beard,
  small
}: PersonOptions) {
  const body = (
    <g>
      {style === 'long' ? (
        <path d='M26 42 C24 18 72 18 70 42 L72 66 L24 66 Z' fill={hair} />
      ) : null}
      {style === 'ponytail' ? (
        <path d='M64 26 C80 28 82 48 72 60 C72 46 70 38 62 34 Z' fill={hair} />
      ) : null}
      <path d='M16 92 C16 68 30 60 48 60 C66 60 80 68 80 92 Z' fill={top} />
      <rect x='41' y='50' width='14' height='14' rx='6' fill={skinTone} />
      <circle cx='48' cy='36' r='21' fill={skinTone} />
      {style === 'short' ? (
        <path
          d='M27 34 C26 12 70 12 69 34 C62 24 54 24 48 26 C40 28 32 26 27 34 Z'
          fill={hair}
        />
      ) : null}
      {style === 'long' || style === 'ponytail' ? (
        <path
          d='M27 36 C24 12 72 12 69 36 C64 26 56 22 46 24 C38 26 32 28 27 36 Z'
          fill={hair}
        />
      ) : null}
      {style === 'bun' ? (
        <g fill={hair}>
          <circle cx='48' cy='10' r='9' />
          <path d='M27 34 C26 14 70 14 69 34 C62 24 34 24 27 34 Z' />
        </g>
      ) : null}
      {style === 'curly' ? (
        <g fill={hair}>
          <circle cx='30' cy='26' r='8' />
          <circle cx='40' cy='18' r='9' />
          <circle cx='54' cy='17' r='9' />
          <circle cx='66' cy='26' r='8' />
        </g>
      ) : null}
      {style === 'bald' ? (
        <g fill={hair}>
          <circle cx='28' cy='36' r='5' />
          <circle cx='68' cy='36' r='5' />
        </g>
      ) : null}
      <circle cx='40' cy='37' r='2.8' fill={ink} />
      <circle cx='56' cy='37' r='2.8' fill={ink} />
      {glasses ? (
        <g fill='none' stroke={ink} strokeWidth='2'>
          <circle cx='40' cy='37' r='6.5' />
          <circle cx='56' cy='37' r='6.5' />
          <path d='M46.5 37 h3' />
        </g>
      ) : null}
      {beard ? (
        <path
          d='M30 42 C32 60 64 60 66 42 C60 50 36 50 30 42 Z'
          fill={beard}
        />
      ) : null}
      <path
        d='M42 46 q6 5 12 0'
        fill='none'
        stroke={beard ? white : ink}
        strokeWidth='2.4'
        strokeLinecap='round'
      />
      {extra}
    </g>
  );
  return small ? (
    <g transform='translate(14 22) scale(0.72)'>{body}</g>
  ) : (
    body
  );
}

function CountCard({ count }: { count: number }) {
  // Dots sit on a domino-style grid so a number is easy to count at a glance.
  const columns = count <= 3 ? count : count <= 6 ? 3 : count <= 8 ? 4 : 5;
  const rows = Math.ceil(count / columns);
  const gap = columns >= 5 ? 14 : 17;
  const startY = 48 - ((rows - 1) * gap) / 2;
  const dots = Array.from({ length: count }, (_, index) => {
    const row = Math.floor(index / columns);
    const inRow = row === rows - 1 ? count - row * columns : columns;
    const startX = 48 - ((inRow - 1) * gap) / 2;
    return { x: startX + (index % columns) * gap, y: startY + row * gap };
  });
  return (
    <g>
      <rect x='10' y='14' width='76' height='68' rx='14' fill={blueDeep} />
      <rect x='10' y='10' width='76' height='68' rx='14' fill={white} stroke={blue} strokeWidth='3' />
      <g transform='translate(0 -4)'>
        {dots.map((dot) => (
          <circle key={`${dot.x}-${dot.y}`} cx={dot.x} cy={dot.y} r='6' fill={orange} />
        ))}
      </g>
    </g>
  );
}

function Arrow({ rotate }: { rotate: number }) {
  return (
    <g>
      <rect x='8' y='8' width='80' height='80' rx='20' fill={sky} />
      <g transform={`rotate(${rotate} 48 48)`}>
        <path
          d='M48 18 L74 46 H58 V78 H38 V46 H22 Z'
          fill={blue}
          stroke={blueDeep}
          strokeWidth='3'
          strokeLinejoin='round'
        />
      </g>
    </g>
  );
}

function Building({
  wall,
  roof,
  children
}: {
  wall: string;
  roof: string;
  children?: ReactElement | ReactElement[];
}) {
  return (
    <g>
      <rect x='4' y='84' width='88' height='6' rx='3' fill={greyDeep} />
      <rect x='14' y='30' width='68' height='56' rx='4' fill={wall} />
      <path d='M8 32 L48 8 L88 32 Z' fill={roof} strokeLinejoin='round' />
      {children}
    </g>
  );
}


export const illustrations: Record<string, ReactElement> = {
  // Greetings
  sunrise: (
    <g>
      <rect x='6' y='8' width='84' height='80' rx='18' fill='#FFE7C2' />
      <circle cx='48' cy='58' r='22' fill={sun} />
      <g stroke={sunDeep} strokeWidth='5' strokeLinecap='round'>
        <path d='M48 18 v10 M20 34 l7 7 M76 34 l-7 7 M12 58 h8 M76 58 h8' />
      </g>
      <path d='M6 62 C24 52 40 66 56 60 C70 54 80 56 90 62 V76 C90 83 85 88 78 88 H18 C11 88 6 83 6 76 Z' fill={green} />
    </g>
  ),
  afternoon: (
    <g>
      <rect x='6' y='8' width='84' height='80' rx='18' fill={sky} />
      <circle cx='66' cy='32' r='15' fill={sun} />
      <g stroke={sunDeep} strokeWidth='4' strokeLinecap='round'>
        <path d='M66 10 v4 M66 50 v4 M44 32 h4 M84 32 h-4 M50 16 l3 3 M82 16 l-3 3' />
      </g>
      <path d='M20 58 C20 50 30 48 34 52 C36 44 50 44 52 54 C60 52 64 60 58 64 H24 C20 64 18 60 20 58 Z' fill={white} />
      <path d='M6 74 C30 68 60 68 90 74 V76 C90 83 85 88 78 88 H18 C11 88 6 83 6 76 Z' fill={green} />
    </g>
  ),
  moon: (
    <g>
      <rect x='6' y='8' width='84' height='80' rx='18' fill='#26366B' />
      <path d='M60 22 C44 22 34 36 36 50 C38 64 52 74 66 68 C54 66 46 56 48 44 C49 34 54 26 60 22 Z' fill={sun} />
      <g fill={white}>
        <circle cx='24' cy='26' r='2.5' />
        <circle cx='72' cy='30' r='2.5' />
        <circle cx='20' cy='62' r='2' />
        <circle cx='76' cy='52' r='2' />
        <circle cx='62' cy='78' r='2' />
      </g>
    </g>
  ),
  wave: (
    <g>
      <circle cx='48' cy='48' r='42' fill={sky} />
      <g stroke={blueDeep} strokeWidth='4' strokeLinecap='round' fill='none'>
        <path d='M18 28 q-6 10 -2 20' />
        <path d='M78 24 q8 8 6 20' />
      </g>
      <path
        d='M30 54 L24 40 C22 34 30 31 33 37 L38 48 L34 26 C33 19 42 18 43 25 L47 44 L48 22 C48 15 57 15 57 22 L57 45 L62 28 C64 21 72 24 70 31 L65 56 C63 72 52 80 42 76 C34 73 32 62 30 54 Z'
        fill={skin}
        stroke={ink}
        strokeWidth='2.5'
        strokeLinejoin='round'
      />
    </g>
  ),
  gift: (
    <g>
      <rect x='16' y='40' width='64' height='46' rx='8' fill={red} />
      <rect x='10' y='28' width='76' height='18' rx='6' fill={redDeep} />
      <rect x='41' y='28' width='14' height='58' fill={sun} />
      <path d='M48 28 C30 26 24 10 34 8 C44 6 48 20 48 28 C48 20 52 6 62 8 C72 10 66 26 48 28 Z' fill={sun} stroke={sunDeep} strokeWidth='2.5' />
    </g>
  ),

  // Introductions
  student: (
    <Person
      hair='#3B2A1E'
      style='short'
      top={blue}
      extra={
        <g>
          <path d='M34 62 C34 76 34 86 34 92 M62 62 V92' stroke={orange} strokeWidth='5' />
          <path d='M24 18 L48 8 L72 18 L48 28 Z' fill={ink} />
          <path d='M70 18 V30' stroke={sun} strokeWidth='3' strokeLinecap='round' />
        </g>
      }
    />
  ),
  teacher: (
    <g>
      <rect x='4' y='6' width='88' height='56' rx='6' fill={greenDeep} stroke={brown} strokeWidth='4' />
      <path d='M14 22 h26 M14 34 h18' stroke={white} strokeWidth='3' strokeLinecap='round' />
      <text x='60' y='38' fontSize='24' fontWeight='800' fill={white}>ñ</text>
      <g transform='translate(18 26) scale(0.72)'>
        <Person hair='#6E2F1D' style='bun' top={purple} glasses />
      </g>
    </g>
  ),
  friends: (
    <g>
      <g transform='translate(-8 24) scale(0.7)'>
        <Person hair='#2B1B12' style='curly' skinTone={skinDark} top={sun} />
      </g>
      <g transform='translate(36 24) scale(0.7)'>
        <Person hair='#C2622D' style='ponytail' top={green} />
      </g>
      <path d='M48 22 C42 12 30 18 36 28 L48 38 L60 28 C66 18 54 12 48 22 Z' fill={red} />
    </g>
  ),
  doctor: (
    <Person
      hair='#2B1B12'
      style='short'
      top={sky}
      skinTone={skinDark}
      extra={
        <g>
          <path d='M36 62 C34 72 42 78 48 74 C54 78 62 72 60 62' fill='none' stroke={ink} strokeWidth='2.5' />
          <circle cx='48' cy='78' r='4' fill={blue} />
          <rect x='62' y='74' width='12' height='12' rx='2' fill={red} />
          <path d='M68 77 v6 M65 80 h6' stroke={white} strokeWidth='2' />
        </g>
      }
    />
  ),

  // Numbers
  'count-1': <CountCard count={1} />,
  'count-2': <CountCard count={2} />,
  'count-3': <CountCard count={3} />,
  'count-4': <CountCard count={4} />,
  'count-5': <CountCard count={5} />,
  'count-6': <CountCard count={6} />,
  'count-7': <CountCard count={7} />,
  'count-8': <CountCard count={8} />,
  'count-9': <CountCard count={9} />,
  'count-10': <CountCard count={10} />,

  // Family
  mother: <Person hair='#5A3220' style='long' top={pink} />,
  father: <Person hair='#2B1B12' style='short' top={blue} beard='#2B1B12' />,
  brother: <Person hair='#C2622D' style='short' top={green} small />,
  sister: <Person hair='#2B1B12' style='ponytail' top={orange} small />,
  grandmother: (
    <Person hair={grey} style='bun' top={purple} glasses />
  ),
  grandfather: (
    <Person hair={grey} style='bald' top={brown} glasses beard={grey} />
  ),
  daughter: <Person hair='#C2622D' style='long' top={sun} skinTone={skinDark} small />,

  // Food
  apple: (
    <g>
      <path d='M48 30 C36 20 14 26 14 50 C14 70 30 88 40 88 C44 88 46 85 48 85 C50 85 52 88 56 88 C66 88 82 70 82 50 C82 26 60 20 48 30 Z' fill={red} />
      <path d='M24 44 C26 36 32 34 36 34' fill='none' stroke={white} strokeWidth='4' strokeLinecap='round' opacity='0.7' />
      <path d='M48 30 C48 22 50 16 54 10' fill='none' stroke={brownDeep} strokeWidth='5' strokeLinecap='round' />
      <path d='M52 20 C58 8 72 8 78 12 C74 24 60 26 52 20 Z' fill={green} />
    </g>
  ),
  bread: (
    <g>
      <path d='M14 44 C10 22 34 18 48 18 C62 18 86 22 82 44 C82 50 78 52 76 52 V78 C76 83 72 86 68 86 H28 C24 86 20 83 20 78 V52 C18 52 14 50 14 44 Z' fill='#E9A95B' />
      <path d='M22 44 C20 30 38 28 48 28 C58 28 76 30 74 44 C74 48 70 48 68 48 V74 C68 77 66 78 64 78 H32 C30 78 28 77 28 74 V48 C26 48 22 48 22 44 Z' fill={cream} />
    </g>
  ),
  cheese: (
    <g>
      <path d='M8 54 L62 20 C76 24 86 36 88 54 V78 C88 82 86 84 82 84 H14 C10 84 8 82 8 78 Z' fill={sun} />
      <path d='M8 54 L62 20 C76 24 86 36 88 54 Z' fill='#FFDD6B' />
      <g fill={sunDeep}>
        <circle cx='28' cy='68' r='7' />
        <circle cx='58' cy='72' r='5' />
        <circle cx='72' cy='62' r='4' />
        <circle cx='58' cy='42' r='5' />
      </g>
    </g>
  ),
  egg: (
    <g>
      <path d='M48 10 C66 10 80 38 80 56 C80 76 66 88 48 88 C30 88 16 76 16 56 C16 38 30 10 48 10 Z' fill={cream} stroke={sunDeep} strokeWidth='3' />
      <path d='M30 40 C32 30 38 24 42 22' fill='none' stroke={white} strokeWidth='5' strokeLinecap='round' />
    </g>
  ),
  chicken: (
    <g>
      <path d='M30 60 C14 56 14 30 34 26 C44 22 72 32 74 54 C74 72 54 80 42 74 Z' fill='#D98A3D' />
      <path d='M36 36 C30 42 30 52 38 58' fill='none' stroke='#F2B56B' strokeWidth='5' strokeLinecap='round' />
      <path d='M68 66 L84 80' stroke={cream} strokeWidth='9' strokeLinecap='round' />
      <circle cx='88' cy='78' r='5' fill={cream} />
      <circle cx='82' cy='85' r='5' fill={cream} />
    </g>
  ),
  rice: (
    <g>
      <path d='M12 46 H84 C84 68 70 84 48 84 C26 84 12 68 12 46 Z' fill={blue} />
      <path d='M14 46 C14 26 34 16 48 16 C62 16 82 26 82 46 Z' fill={white} stroke={grey} strokeWidth='2' />
      <g stroke={grey} strokeWidth='3' strokeLinecap='round'>
        <path d='M32 34 l4 -3 M46 26 l4 2 M60 34 l3 3 M48 38 l-3 2 M68 42 l3 -2 M26 42 l3 1' />
      </g>
      <path d='M12 46 H84' stroke={blueDeep} strokeWidth='4' />
    </g>
  ),
  soup: (
    <g>
      <g stroke={greyDeep} strokeWidth='4' strokeLinecap='round' fill='none'>
        <path d='M36 26 q-5 -6 0 -12 q5 -6 0 -10' />
        <path d='M56 26 q-5 -6 0 -12 q5 -6 0 -10' />
      </g>
      <ellipse cx='48' cy='42' rx='38' ry='12' fill={orange} stroke={redDeep} strokeWidth='3' />
      <path d='M10 42 C10 68 28 84 48 84 C68 84 86 68 86 42 C86 50 10 50 10 42 Z' fill={red} />
      <g fill={green}>
        <circle cx='38' cy='40' r='3' />
        <circle cx='54' cy='44' r='3' />
        <circle cx='62' cy='38' r='2.5' />
      </g>
    </g>
  ),

  // Daily routine
  alarm: (
    <g>
      <path d='M18 28 L30 14 M78 28 L66 14' stroke={red} strokeWidth='9' strokeLinecap='round' />
      <circle cx='48' cy='52' r='34' fill={red} />
      <circle cx='48' cy='52' r='26' fill={white} />
      <path d='M48 34 V52 L60 60' fill='none' stroke={ink} strokeWidth='5' strokeLinecap='round' strokeLinejoin='round' />
      <path d='M26 82 l-6 8 M70 82 l6 8' stroke={redDeep} strokeWidth='6' strokeLinecap='round' />
    </g>
  ),
  shower: (
    <g>
      <path d='M16 90 V22 C16 10 38 10 40 22' fill='none' stroke={greyDeep} strokeWidth='6' strokeLinecap='round' />
      <path d='M24 34 C24 22 56 22 56 34 Z' fill={grey} stroke={greyDeep} strokeWidth='2.5' />
      <g stroke={blue} strokeWidth='5' strokeLinecap='round'>
        <path d='M30 44 l-2 10 M42 44 v12 M50 44 l2 10 M36 62 l-2 10 M46 64 v12 M56 62 l2 10 M28 78 l-2 8 M42 84 v6 M60 80 l2 8' />
      </g>
    </g>
  ),
  breakfast: (
    <g>
      <circle cx='40' cy='50' r='34' fill={white} stroke={grey} strokeWidth='3' />
      <path d='M24 48 C20 34 40 30 48 36 C60 32 64 52 54 56 C50 66 30 66 24 48 Z' fill={cream} />
      <circle cx='42' cy='47' r='9' fill={sun} />
      <rect x='60' y='56' width='28' height='28' rx='6' fill={blue} />
      <path d='M88 62 q8 6 0 14' fill='none' stroke={blue} strokeWidth='4' />
      <ellipse cx='74' cy='58' rx='12' ry='3' fill={brownDeep} />
    </g>
  ),
  work: (
    <g>
      <path d='M34 32 V24 C34 18 62 18 62 24 V32' fill='none' stroke={brownDeep} strokeWidth='6' />
      <rect x='8' y='30' width='80' height='54' rx='9' fill={brown} />
      <rect x='8' y='30' width='80' height='24' rx='9' fill={brownDeep} />
      <rect x='40' y='48' width='16' height='12' rx='3' fill={sun} />
    </g>
  ),
  study: (
    <g>
      <path d='M48 30 C36 22 22 22 8 26 V78 C22 74 36 74 48 82 C60 74 74 74 88 78 V26 C74 22 60 22 48 30 Z' fill={white} stroke={blue} strokeWidth='3' strokeLinejoin='round' />
      <path d='M48 30 V82' stroke={blue} strokeWidth='3' />
      <g stroke={greyDeep} strokeWidth='3' strokeLinecap='round'>
        <path d='M18 38 h20 M18 48 h20 M18 58 h14 M58 38 h20 M58 48 h20 M58 58 h14' />
      </g>
    </g>
  ),
  bed: (
    <g>
      <rect x='6' y='28' width='10' height='58' rx='4' fill={brown} />
      <rect x='80' y='48' width='10' height='38' rx='4' fill={brown} />
      <rect x='12' y='56' width='72' height='20' rx='5' fill={blue} />
      <rect x='16' y='42' width='24' height='16' rx='7' fill={white} stroke={grey} strokeWidth='2' />
      <path d='M38 56 C38 44 82 44 82 56 Z' fill={skyDeep} />
      <g fill='none' stroke={blueDeep} strokeWidth='3.5' strokeLinecap='round' strokeLinejoin='round'>
        <path d='M50 16 h12 l-12 14 h12' />
        <path d='M70 10 h8 l-8 10 h8' />
      </g>
    </g>
  ),
  dinner: (
    <g>
      <circle cx='48' cy='52' r='30' fill={white} stroke={grey} strokeWidth='3' />
      <circle cx='48' cy='52' r='20' fill={cream} />
      <path d='M36 56 C36 46 46 42 54 44 C62 46 62 58 54 60 C46 62 38 62 36 56 Z' fill='#D98A3D' />
      <path d='M8 26 V44 C8 50 14 50 14 44 V26 M11 50 V84' fill='none' stroke={greyDeep} strokeWidth='4' strokeLinecap='round' />
      <path d='M86 26 C78 34 78 48 86 52 V84' fill='none' stroke={greyDeep} strokeWidth='4' strokeLinecap='round' />
    </g>
  ),

  // Directions
  'arrow-left': <Arrow rotate={-90} />,
  'arrow-right': <Arrow rotate={90} />,
  'arrow-up': <Arrow rotate={0} />,
  corner: (
    <g>
      <rect x='8' y='8' width='80' height='80' rx='14' fill={green} />
      <path d='M38 8 H62 V36 H88 V60 H62 V88 H38 V60 H8 V36 H38 Z' fill={greyDeep} />
      <path d='M50 12 V30 M50 66 V84 M12 48 H30 M66 48 H84' stroke={white} strokeWidth='3' strokeDasharray='6 6' />
      <g fill={sun}>
        <circle cx='32' cy='30' r='6' />
      </g>
    </g>
  ),
  bank: (
    <Building wall={cream} roof={blue}>
      <circle cx='48' cy='23' r='7' fill={sun} />
      <text x='48' y='27.5' fontSize='12' fontWeight='900' textAnchor='middle' fill={ink}>$</text>
      <g fill={greyDeep}>
        <rect x='22' y='38' width='8' height='40' rx='2' />
        <rect x='38' y='38' width='8' height='40' rx='2' />
        <rect x='54' y='38' width='8' height='40' rx='2' />
        <rect x='68' y='38' width='8' height='40' rx='2' />
      </g>
    </Building>
  ),
  hospital: (
    <g>
      <rect x='4' y='84' width='88' height='6' rx='3' fill={greyDeep} />
      <rect x='14' y='10' width='68' height='76' rx='6' fill={white} stroke={grey} strokeWidth='3' />
      <rect x='36' y='18' width='24' height='24' rx='4' fill={red} />
      <path d='M48 23 v14 M41 30 h14' stroke={white} strokeWidth='5' strokeLinecap='round' />
      <g fill={sky}>
        <rect x='22' y='50' width='14' height='12' rx='2' />
        <rect x='60' y='50' width='14' height='12' rx='2' />
      </g>
      <rect x='38' y='62' width='20' height='24' rx='2' fill={skyDeep} />
    </g>
  ),
  station: (
    <Building wall={cream} roof={brown}>
      <circle cx='48' cy='24' r='7' fill={white} stroke={ink} strokeWidth='2' />
      <path d='M48 20 V24 L51 26' stroke={ink} strokeWidth='1.6' fill='none' />
      <path d='M22 86 V48 C22 38 38 38 38 48 V86 Z' fill={skyDeep} />
      <path d='M58 86 V48 C58 38 74 38 74 48 V86 Z' fill={skyDeep} />
      <rect x='40' y='34' width='16' height='52' fill={sun} />
    </Building>
  ),
  bathroom: (
    <g>
      <rect x='8' y='8' width='80' height='80' rx='16' fill={sky} />
      <path d='M14 50 H82 V58 C82 68 72 74 62 74 H34 C24 74 14 68 14 58 Z' fill={white} stroke={greyDeep} strokeWidth='3' />
      <path d='M26 50 V28 C26 18 42 18 42 28' fill='none' stroke={greyDeep} strokeWidth='4' strokeLinecap='round' />
      <g fill={white} stroke={skyDeep} strokeWidth='2'>
        <circle cx='52' cy='40' r='6' />
        <circle cx='66' cy='32' r='8' />
        <circle cx='70' cy='46' r='4' />
      </g>
      <path d='M28 74 l-4 10 M68 74 l4 10' stroke={greyDeep} strokeWidth='5' strokeLinecap='round' />
    </g>
  ),

  // Shopping
  shirt: (
    <path d='M32 12 C38 20 58 20 64 12 L90 28 L78 48 L68 42 V86 H28 V42 L18 48 L6 28 Z' fill={blue} stroke={blueDeep} strokeWidth='3' strokeLinejoin='round' />
  ),
  shoes: (
    <g>
      <path d='M8 42 C20 44 24 36 30 26 L52 44 C64 50 88 50 88 68 C88 74 86 76 80 76 H14 C10 76 8 74 8 70 Z' fill={red} />
      <path d='M8 66 H88 V70 C88 76 84 80 78 80 H14 C10 80 8 76 8 72 Z' fill={white} stroke={grey} strokeWidth='2' />
      <g stroke={white} strokeWidth='3.5' strokeLinecap='round'>
        <path d='M34 36 l8 -8 M42 44 l8 -8 M50 50 l8 -8' />
      </g>
    </g>
  ),
  dress: (
    <g>
      <path d='M38 8 V24 C44 28 52 28 58 24 V8 M38 8 h6 M52 8 h6' fill='none' stroke={pink} strokeWidth='5' strokeLinecap='round' />
      <path d='M34 22 C42 30 54 30 62 22 L66 44 L84 88 C60 94 36 94 12 88 L30 44 Z' fill={pink} stroke='#DB2777' strokeWidth='3' strokeLinejoin='round' />
      <path d='M30 44 C42 48 54 48 66 44' fill='none' stroke='#DB2777' strokeWidth='4' />
    </g>
  ),
  hat: (
    <g>
      <ellipse cx='48' cy='66' rx='44' ry='14' fill={sun} stroke={sunDeep} strokeWidth='3' />
      <path d='M24 62 C22 28 34 18 48 18 C62 18 74 28 72 62 C62 70 34 70 24 62 Z' fill='#FFDD6B' stroke={sunDeep} strokeWidth='3' />
      <path d='M24 54 C34 62 62 62 72 54 V62 C62 70 34 70 24 62 Z' fill={red} />
    </g>
  ),
  bag: (
    <g>
      <path d='M32 34 V24 C32 8 64 8 64 24 V34' fill='none' stroke={blueDeep} strokeWidth='6' strokeLinecap='round' />
      <path d='M14 32 H82 L88 86 C88 89 86 90 84 90 H12 C10 90 8 89 8 86 Z' fill={blue} />
      <circle cx='48' cy='60' r='14' fill={sun} />
      <path d='M42 60 l5 5 l8 -10' fill='none' stroke={ink} strokeWidth='4' strokeLinecap='round' strokeLinejoin='round' />
    </g>
  ),
  money: (
    <g>
      <rect x='6' y='32' width='80' height='44' rx='6' fill={greenDeep} />
      <rect x='10' y='24' width='80' height='44' rx='6' fill={green} stroke={greenDeep} strokeWidth='3' />
      <circle cx='50' cy='46' r='13' fill='#BDF2C4' />
      <text x='50' y='52.5' fontSize='18' fontWeight='900' textAnchor='middle' fill={greenDeep}>$</text>
      <g fill='#BDF2C4'>
        <circle cx='22' cy='46' r='3' />
        <circle cx='78' cy='46' r='3' />
      </g>
    </g>
  ),

  // Time and weather
  sun: (
    <g>
      <g stroke={sunDeep} strokeWidth='7' strokeLinecap='round'>
        <path d='M48 6 V16 M48 80 V90 M6 48 H16 M80 48 H90 M18 18 L25 25 M78 18 L71 25 M18 78 L25 71 M78 78 L71 71' />
      </g>
      <circle cx='48' cy='48' r='24' fill={sun} />
    </g>
  ),
  rain: (
    <g>
      <path d='M22 52 C10 52 8 34 22 32 C24 16 48 12 54 26 C70 20 84 36 74 52 Z' fill={greyDeep} />
      <g stroke={blue} strokeWidth='6' strokeLinecap='round'>
        <path d='M28 62 l-5 14 M46 62 l-5 14 M64 62 l-5 14 M36 80 l-3 8 M54 80 l-3 8' />
      </g>
    </g>
  ),
  snow: (
    <g>
      <path d='M22 50 C10 50 8 32 22 30 C24 14 48 10 54 24 C70 18 84 34 74 50 Z' fill={grey} />
      <g stroke={skyDeep} strokeWidth='4' strokeLinecap='round'>
        <path d='M28 60 V76 M21 64 L35 72 M35 64 L21 72' />
        <path d='M64 60 V76 M57 64 L71 72 M71 64 L57 72' />
        <path d='M46 74 V90 M39 78 L53 86 M53 78 L39 86' />
      </g>
    </g>
  ),
  wind: (
    <g fill='none' stroke={skyDeep} strokeWidth='8' strokeLinecap='round'>
      <path d='M8 36 H56 C68 36 68 18 56 18 C50 18 48 24 48 26' />
      <path d='M8 54 H74 C88 54 88 32 74 32' />
      <path d='M8 72 H48 C60 72 60 90 48 90 C42 90 40 84 40 82' />
    </g>
  ),
  cloud: (
    <g>
      <path d='M42 44 C34 44 34 32 42 30 C46 18 64 18 68 30 C80 28 86 44 76 48 Z' fill={grey} />
      <path d='M20 74 C6 74 4 52 20 50 C22 32 50 28 56 44 C74 38 90 56 78 74 Z' fill={greyDeep} />
    </g>
  ),
  hot: (
    <g>
      <circle cx='70' cy='26' r='14' fill={sun} />
      <g stroke={sunDeep} strokeWidth='4' strokeLinecap='round'>
        <path d='M70 4 V8 M70 44 V48 M48 26 H52 M88 26 H92' />
      </g>
      <rect x='26' y='10' width='20' height='60' rx='10' fill={white} stroke={greyDeep} strokeWidth='3' />
      <circle cx='36' cy='72' r='16' fill={red} stroke={redDeep} strokeWidth='3' />
      <rect x='32' y='30' width='8' height='36' fill={red} />
    </g>
  ),
  clock: (
    <g>
      <circle cx='48' cy='48' r='40' fill={white} stroke={blue} strokeWidth='7' />
      <path d='M48 22 V48 L62 36' fill='none' stroke={ink} strokeWidth='6' strokeLinecap='round' strokeLinejoin='round' />
      <circle cx='48' cy='48' r='5' fill={red} />
      <g fill={greyDeep}>
        <circle cx='48' cy='16' r='2.5' />
        <circle cx='80' cy='48' r='2.5' />
        <circle cx='48' cy='80' r='2.5' />
        <circle cx='16' cy='48' r='2.5' />
      </g>
    </g>
  ),

  // Travel
  plane: (
    <g>
      <circle cx='48' cy='48' r='42' fill={sky} />
      <g transform='rotate(-30 48 48)'>
        <path d='M10 48 C10 42 18 40 26 40 H70 C80 40 88 44 88 48 C88 52 80 56 70 56 H26 C18 56 10 54 10 48 Z' fill={white} stroke={blueDeep} strokeWidth='3' />
        <path d='M44 54 L34 78 H44 L60 54 Z' fill={blue} />
        <path d='M44 42 L38 22 H46 L58 42 Z' fill={blue} />
        <path d='M18 42 L10 28 H17 L28 40 Z' fill={red} />
        <circle cx='70' cy='47' r='3' fill={blueDeep} />
        <circle cx='60' cy='47' r='3' fill={blueDeep} />
        <circle cx='50' cy='47' r='3' fill={blueDeep} />
      </g>
    </g>
  ),
  train: (
    <g>
      <rect x='18' y='10' width='60' height='66' rx='14' fill={red} />
      <rect x='26' y='20' width='44' height='24' rx='5' fill={sky} />
      <circle cx='34' cy='60' r='5' fill={sun} />
      <circle cx='62' cy='60' r='5' fill={sun} />
      <path d='M30 76 L20 90 M66 76 L76 90 M26 86 H70' stroke={ink} strokeWidth='5' strokeLinecap='round' />
    </g>
  ),
  bus: (
    <g>
      <rect x='6' y='18' width='84' height='56' rx='11' fill={sun} />
      <g fill={sky}>
        <rect x='14' y='26' width='18' height='18' rx='3' />
        <rect x='38' y='26' width='18' height='18' rx='3' />
        <rect x='62' y='26' width='20' height='18' rx='3' />
      </g>
      <rect x='6' y='54' width='84' height='5' fill={sunDeep} />
      <g>
        <circle cx='26' cy='76' r='9' fill={ink} />
        <circle cx='70' cy='76' r='9' fill={ink} />
        <circle cx='26' cy='76' r='3.5' fill={grey} />
        <circle cx='70' cy='76' r='3.5' fill={grey} />
      </g>
    </g>
  ),
  suitcase: (
    <g>
      <path d='M36 26 V14 C36 10 60 10 60 14 V26' fill='none' stroke={ink} strokeWidth='6' />
      <rect x='16' y='24' width='64' height='60' rx='10' fill={orange} />
      <path d='M32 24 V84 M64 24 V84' stroke={redDeep} strokeWidth='5' />
      <circle cx='28' cy='88' r='4' fill={ink} />
      <circle cx='68' cy='88' r='4' fill={ink} />
      <rect x='40' y='44' width='16' height='20' rx='3' fill={cream} />
    </g>
  ),
  hotel: (
    <g>
      <rect x='4' y='84' width='88' height='6' rx='3' fill={greyDeep} />
      <rect x='18' y='8' width='60' height='78' rx='5' fill={blue} />
      <rect x='26' y='14' width='44' height='12' rx='3' fill={sun} />
      <text x='48' y='24' fontSize='9' fontWeight='900' textAnchor='middle' fill={ink}>HOTEL</text>
      <g fill={sky}>
        <rect x='26' y='32' width='12' height='11' rx='2' />
        <rect x='42' y='32' width='12' height='11' rx='2' />
        <rect x='58' y='32' width='12' height='11' rx='2' />
        <rect x='26' y='48' width='12' height='11' rx='2' />
        <rect x='42' y='48' width='12' height='11' rx='2' />
        <rect x='58' y='48' width='12' height='11' rx='2' />
      </g>
      <rect x='38' y='66' width='20' height='20' rx='2' fill={cream} />
    </g>
  ),
  beach: (
    <g>
      <rect x='6' y='8' width='84' height='80' rx='16' fill={sky} />
      <circle cx='70' cy='26' r='10' fill={sun} />
      <path d='M6 56 C20 50 34 60 48 54 C62 48 76 58 90 52 V64 H6 Z' fill={blue} />
      <path d='M6 62 H90 V74 C90 82 84 88 76 88 H20 C12 88 6 82 6 74 Z' fill='#FFE3A3' />
      <path d='M32 72 V34' stroke={brown} strokeWidth='4' strokeLinecap='round' />
      <path d='M10 36 C12 18 52 18 54 36 C46 32 40 32 32 36 C24 32 18 32 10 36 Z' fill={red} />
    </g>
  ),
  airport: (
    <g>
      <rect x='4' y='84' width='88' height='6' rx='3' fill={greyDeep} />
      <rect x='8' y='54' width='80' height='32' rx='6' fill={sky} stroke={blue} strokeWidth='3' />
      <path d='M28 54 V86 M48 54 V86 M68 54 V86' stroke={blue} strokeWidth='3' />
      <rect x='64' y='14' width='14' height='40' fill={grey} />
      <path d='M56 6 H86 L80 22 H62 Z' fill={blue} />
      <path d='M12 40 L44 28 M24 20 L36 34 M14 34 L20 42' stroke={red} strokeWidth='5' strokeLinecap='round' />
    </g>
  ),
  ticket: (
    <g transform='rotate(-10 48 48)'>
      <path d='M6 30 C6 27 8 26 10 26 H86 C88 26 90 27 90 30 V40 C84 40 84 56 90 56 V66 C90 69 88 70 86 70 H10 C8 70 6 69 6 66 V56 C12 56 12 40 6 40 Z' fill={sun} stroke={sunDeep} strokeWidth='3' />
      <path d='M66 28 V68' stroke={sunDeep} strokeWidth='3' strokeDasharray='5 5' />
      <path d='M20 40 h34 M20 50 h24 M20 58 h30' stroke={ink} strokeWidth='3.5' strokeLinecap='round' />
    </g>
  ),

  // Badges
  'badge-star': (
    <path d='M48 8 L60 36 L90 38 L67 58 L74 88 L48 72 L22 88 L29 58 L6 38 L36 36 Z' fill={sun} stroke={sunDeep} strokeWidth='4' strokeLinejoin='round' />
  ),
  'badge-flame': (
    <g>
      <path d='M48 6 C52 26 78 36 78 62 C78 80 64 90 48 90 C32 90 18 80 18 62 C18 48 28 40 32 28 C38 34 40 40 40 44 C46 34 48 20 48 6 Z' fill={orange} />
      <path d='M48 46 C50 56 62 60 62 72 C62 82 56 88 48 88 C40 88 34 82 34 72 C34 62 44 58 48 46 Z' fill={sun} />
    </g>
  ),
  'badge-target': (
    <g>
      <circle cx='48' cy='48' r='40' fill={red} />
      <circle cx='48' cy='48' r='28' fill={white} />
      <circle cx='48' cy='48' r='16' fill={red} />
      <circle cx='48' cy='48' r='6' fill={white} />
    </g>
  ),
  'badge-bolt': (
    <path d='M56 6 L18 54 H44 L36 90 L78 38 H52 Z' fill={sun} stroke={sunDeep} strokeWidth='4' strokeLinejoin='round' />
  ),
  'badge-heart': (
    <path d='M48 86 C10 60 6 40 12 26 C20 10 40 12 48 28 C56 12 76 10 84 26 C90 40 86 60 48 86 Z' fill={red} stroke={redDeep} strokeWidth='4' strokeLinejoin='round' />
  ),
  'badge-medal': (
    <g>
      <path d='M30 6 H46 L56 40 H42 Z' fill={blue} />
      <path d='M66 6 H50 L40 40 H54 Z' fill={red} />
      <circle cx='48' cy='60' r='28' fill={sun} stroke={sunDeep} strokeWidth='4' />
      <path d='M48 44 L53 55 L65 56 L56 64 L59 76 L48 70 L37 76 L40 64 L31 56 L43 55 Z' fill={white} />
    </g>
  ),
  'badge-trophy': (
    <g>
      <path d='M24 16 H8 C8 40 16 48 30 50 M72 16 H88 C88 40 80 48 66 50' fill='none' stroke={sunDeep} strokeWidth='6' />
      <path d='M24 8 H72 V36 C72 52 60 62 48 62 C36 62 24 52 24 36 Z' fill={sun} stroke={sunDeep} strokeWidth='4' />
      <rect x='42' y='60' width='12' height='14' fill={sunDeep} />
      <rect x='26' y='72' width='44' height='16' rx='5' fill={brown} />
      <path d='M48 18 L52 28 L62 29 L54 35 L57 45 L48 40 L39 45 L42 35 L34 29 L44 28 Z' fill={white} />
    </g>
  )
};

export function hasIllustration(art: string): boolean {
  return art in illustrations;
}
