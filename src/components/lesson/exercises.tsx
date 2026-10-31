import { useEffect, useMemo, useRef, useState } from 'react';
import { Turtle, Volume2 } from 'lucide-react';
import { Art } from '~/components/art/Art';
import { Mascot } from '~/components/brand/Mascot';
import { SpanishText } from '~/components/lesson/SpanishText';
import type {
  BuildSentenceExercise,
  Exercise,
  FillBlankExercise,
  ListenTypeExercise,
  MatchPairsExercise,
  PictureChoiceExercise
} from '~/content/types';
import { wordBankTiles, type Answer } from '~/lib/grading';
import { isSoundEnabled, playSound } from '~/lib/sfx';
import { playSpeech } from '~/lib/speech-player';
import { cn } from '~/lib/utils';

export type ExerciseProps<T extends Exercise> = {
  exercise: T;
  /** Null while the answer isn't ready to check. */
  onAnswer: (answer: Answer | null) => void;
  /** Answers immediately, for exercises with no Check step. */
  onSubmit: (answer: Answer) => void;
  /** True once the answer has been sent. */
  locked: boolean;
};

function shuffled<T>(items: T[]): T[] {
  const copy = [...items];
  for (let index = copy.length - 1; index > 0; index--) {
    const swap = Math.floor(Math.random() * (index + 1));
    [copy[index], copy[swap]] = [copy[swap]!, copy[index]!];
  }
  return copy;
}

function speakIfOn(text: string) {
  if (isSoundEnabled()) void playSpeech(text);
}

function Heading({ children }: { children: React.ReactNode }) {
  return (
    <h1 className='text-2xl font-black tracking-tight text-foreground sm:text-3xl'>
      {children}
    </h1>
  );
}

const tileBase =
  'press-3d cursor-pointer rounded-2xl border-2 border-border bg-card font-bold text-foreground outline-none focus-visible:ring-3 focus-visible:ring-primary/40 disabled:cursor-default';
const tileSelected =
  'border-brand-primary bg-brand-primary-soft text-brand-primary [--lip:var(--brand-primary)]';

export function PictureChoice({
  exercise,
  onAnswer,
  locked
}: ExerciseProps<PictureChoiceExercise>) {
  const [selected, setSelected] = useState<string | null>(null);
  const options = useMemo(() => exercise.options, [exercise]);

  const choose = (value: string) => {
    if (locked) return;
    setSelected(value);
    onAnswer({ kind: 'choice', value });
    playSound('tap');
    speakIfOn(value);
  };

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const option = options[Number(event.key) - 1];
      if (option) choose(option.es);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  return (
    <div className='flex flex-col gap-6'>
      <Heading>Which one means “{exercise.prompt}”?</Heading>
      <div className='grid grid-cols-2 gap-3 sm:gap-4'>
        {options.map((option, index) => (
          <button
            key={option.es}
            type='button'
            disabled={locked}
            aria-pressed={selected === option.es}
            data-option={option.es}
            onClick={() => choose(option.es)}
            className={cn(
              tileBase,
              'relative flex flex-col items-center gap-2 p-3 sm:p-5',
              selected === option.es && tileSelected
            )}
          >
            <span className='absolute top-2 left-2 hidden size-6 place-items-center rounded-md border-2 border-border text-xs font-bold text-muted-foreground sm:grid'>
              {index + 1}
            </span>
            <Art name={option.art} className='size-20 sm:size-28' />
            <span lang='es' className='text-base sm:text-lg'>
              {option.es}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

export function BuildSentence({
  exercise,
  onAnswer,
  locked
}: ExerciseProps<BuildSentenceExercise>) {
  const [bank] = useState(() =>
    shuffled(wordBankTiles(exercise).map((word, id) => ({ id, word })))
  );
  const [picked, setPicked] = useState<number[]>([]);

  const update = (next: number[]) => {
    setPicked(next);
    onAnswer(
      next.length > 0
        ? {
            kind: 'words',
            value: next.map((id) => bank.find((tile) => tile.id === id)!.word)
          }
        : null
    );
  };

  return (
    <div className='flex flex-col gap-5'>
      <Heading>Translate this sentence</Heading>
      <div className='flex items-center gap-3'>
        <Mascot pose='talk' className='size-20 shrink-0 sm:size-24' />
        <p className='rounded-2xl border-2 border-border bg-card px-4 py-3 text-lg font-bold'>
          {exercise.en}
        </p>
      </div>
      <div
        data-answer-line
        className='flex min-h-28 flex-wrap content-start gap-2 border-y-2 border-border py-3'
      >
        {picked.map((id) => {
          const tile = bank.find((item) => item.id === id)!;
          return (
            <button
              key={id}
              type='button'
              lang='es'
              disabled={locked}
              className={cn(tileBase, 'animate-pop-in px-4 py-2 text-lg')}
              onClick={() => {
                playSound('tap');
                update(picked.filter((value) => value !== id));
              }}
            >
              {tile.word}
            </button>
          );
        })}
      </div>
      <div className='flex flex-wrap justify-center gap-2'>
        {bank.map((tile) => {
          const used = picked.includes(tile.id);
          return (
            <span key={tile.id} className='rounded-2xl bg-border'>
              <button
                type='button'
                lang='es'
                data-word={tile.word}
                disabled={locked || used}
                aria-hidden={used}
                tabIndex={used ? -1 : 0}
                className={cn(
                  tileBase,
                  'px-4 py-2 text-lg',
                  used && 'invisible'
                )}
                onClick={() => {
                  playSound('tap');
                  speakIfOn(tile.word);
                  update([...picked, tile.id]);
                }}
              >
                {tile.word}
              </button>
            </span>
          );
        })}
      </div>
    </div>
  );
}

/** Quick buttons for characters that US keyboards don't have. */
function AccentKeys({
  onInsert,
  disabled
}: {
  onInsert: (character: string) => void;
  disabled: boolean;
}) {
  return (
    <div className='flex flex-wrap gap-1.5'>
      {['á', 'é', 'í', 'ó', 'ú', 'ü', 'ñ', '¿', '¡'].map((character) => (
        <button
          key={character}
          type='button'
          disabled={disabled}
          // Keeps focus and the caret in the text box.
          onMouseDown={(event) => event.preventDefault()}
          onClick={() => onInsert(character)}
          className={cn(tileBase, '[--lip-height:2px] size-10 text-base')}
        >
          {character}
        </button>
      ))}
    </div>
  );
}

function useAccentInsert(
  value: string,
  setValue: (next: string) => void,
  ref: React.RefObject<HTMLTextAreaElement | HTMLInputElement | null>
) {
  return (character: string) => {
    const input = ref.current;
    const start = input?.selectionStart ?? value.length;
    const end = input?.selectionEnd ?? value.length;
    setValue(value.slice(0, start) + character + value.slice(end));
    requestAnimationFrame(() => {
      input?.focus();
      input?.setSelectionRange(start + 1, start + 1);
    });
  };
}

export function ListenType({
  exercise,
  onAnswer,
  locked
}: ExerciseProps<ListenTypeExercise>) {
  const [value, setValue] = useState('');
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    // Sound off still plays here, because this exercise is about listening.
    const timer = window.setTimeout(() => void playSpeech(exercise.es), 250);
    return () => window.clearTimeout(timer);
  }, [exercise.es]);

  const change = (next: string) => {
    setValue(next);
    onAnswer(next.trim() ? { kind: 'text', value: next } : null);
  };
  const insert = useAccentInsert(value, change, inputRef);

  return (
    <div className='flex flex-col gap-6'>
      <Heading>Type what you hear</Heading>
      <div className='flex items-center justify-center gap-4'>
        <button
          type='button'
          aria-label='Play audio'
          data-play='normal'
          onClick={() => void playSpeech(exercise.es)}
          className='press-3d grid size-24 cursor-pointer place-items-center rounded-3xl bg-brand-primary text-white [--lip:var(--brand-primary-dark)] sm:size-28'
        >
          <Volume2 className='size-12' />
        </button>
        <button
          type='button'
          aria-label='Play audio slowly'
          data-play='slow'
          onClick={() => void playSpeech(exercise.es, 'slow')}
          className='press-3d grid size-16 cursor-pointer place-items-center rounded-2xl bg-brand-primary text-white [--lip:var(--brand-primary-dark)]'
        >
          <Turtle className='size-8' />
        </button>
      </div>
      <textarea
        ref={inputRef}
        lang='es'
        rows={2}
        value={value}
        disabled={locked}
        autoFocus
        autoCapitalize='off'
        autoCorrect='off'
        spellCheck={false}
        aria-label='Type what you hear in Spanish'
        placeholder='Type in Spanish'
        data-typed-answer
        onChange={(event) => change(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === 'Enter') event.preventDefault();
        }}
        className='w-full resize-none rounded-2xl border-2 border-border bg-card p-4 text-lg font-bold outline-none placeholder:font-semibold placeholder:text-muted-foreground focus:border-brand-primary'
      />
      <AccentKeys onInsert={insert} disabled={locked} />
    </div>
  );
}

export function MatchPairs({
  exercise,
  onAnswer,
  onSubmit,
  locked
}: ExerciseProps<MatchPairsExercise>) {
  const [spanish] = useState(() => shuffled(exercise.pairs.map((p) => p.es)));
  const [english] = useState(() => shuffled(exercise.pairs.map((p) => p.en)));
  const [selectedEs, setSelectedEs] = useState<string | null>(null);
  const [selectedEn, setSelectedEn] = useState<string | null>(null);
  const [matched, setMatched] = useState<[string, string][]>([]);
  const [wrongPair, setWrongPair] = useState<[string, string] | null>(null);
  const mismatches = useRef(0);

  const isMatchedEs = (es: string) => matched.some(([value]) => value === es);
  const isMatchedEn = (en: string) => matched.some(([, value]) => value === en);

  const attempt = (es: string, en: string) => {
    const isPair = exercise.pairs.some(
      (pair) => pair.es === es && pair.en === en
    );
    setSelectedEs(null);
    setSelectedEn(null);
    if (isPair) {
      playSound('match');
      const next: [string, string][] = [...matched, [es, en]];
      setMatched(next);
      if (next.length === exercise.pairs.length) {
        const answer: Answer = {
          kind: 'pairs',
          value: next,
          mismatches: mismatches.current
        };
        onAnswer(answer);
        window.setTimeout(() => onSubmit(answer), 350);
      }
    } else {
      playSound('wrong');
      mismatches.current += 1;
      setWrongPair([es, en]);
      window.setTimeout(() => setWrongPair(null), 450);
    }
  };

  const tile = (
    value: string,
    side: 'es' | 'en',
    done: boolean,
    selected: boolean,
    wrong: boolean
  ) => (
    <button
      key={value}
      type='button'
      lang={side === 'es' ? 'es' : 'en'}
      disabled={locked || done}
      {...(side === 'es' ? { 'data-match-es': value } : { 'data-match-en': value })}
      aria-pressed={selected}
      onClick={() => {
        if (side === 'es') {
          playSound('tap');
          speakIfOn(value);
          if (selectedEn) attempt(value, selectedEn);
          else setSelectedEs(selected ? null : value);
        } else {
          playSound('tap');
          if (selectedEs) attempt(selectedEs, value);
          else setSelectedEn(selected ? null : value);
        }
      }}
      className={cn(
        tileBase,
        'min-h-16 px-3 py-3 text-base sm:text-lg',
        selected && tileSelected,
        wrong &&
          'animate-shake border-brand-danger bg-brand-danger-soft text-brand-danger [--lip:var(--brand-danger)]',
        done && 'border-brand-success bg-brand-success-soft text-brand-success opacity-60 [--lip:transparent]'
      )}
    >
      {value}
    </button>
  );

  return (
    <div className='flex flex-col gap-6'>
      <Heading>Tap the matching pairs</Heading>
      <div className='grid grid-cols-2 gap-3 sm:gap-4'>
        <div className='flex flex-col gap-3'>
          {spanish.map((es) =>
            tile(es, 'es', isMatchedEs(es), selectedEs === es, wrongPair?.[0] === es)
          )}
        </div>
        <div className='flex flex-col gap-3'>
          {english.map((en) =>
            tile(en, 'en', isMatchedEn(en), selectedEn === en, wrongPair?.[1] === en)
          )}
        </div>
      </div>
    </div>
  );
}

export function FillBlank({
  exercise,
  onAnswer,
  locked
}: ExerciseProps<FillBlankExercise>) {
  const [value, setValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const options = exercise.options;
  const [before = '', after = ''] = exercise.sentence.split('___');

  const change = (next: string) => {
    setValue(next);
    onAnswer(next.trim() ? { kind: 'text', value: next } : null);
  };
  const choose = (option: string) => {
    if (locked) return;
    setValue(option);
    onAnswer({ kind: 'choice', value: option });
    playSound('tap');
    speakIfOn(option);
  };
  const insert = useAccentInsert(value, change, inputRef);

  useEffect(() => {
    if (!options) return;
    const onKey = (event: KeyboardEvent) => {
      const option = options[Number(event.key) - 1];
      if (option) choose(option);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  return (
    <div className='flex flex-col gap-6'>
      <Heading>Fill in the blank</Heading>
      <div className='flex items-start gap-3'>
        <Mascot pose='think' className='size-20 shrink-0 sm:size-24' />
        <div className='min-w-0 flex-1 rounded-2xl border-2 border-border bg-card p-4'>
          <p className='text-xl font-bold leading-loose'>
            {before ? <SpanishText text={before} /> : null}
            {options ? (
              <span
                data-blank
                className={cn(
                  'mx-1 inline-block min-w-20 border-b-4 border-border text-center',
                  value && 'border-brand-primary text-brand-primary'
                )}
              >
                {value || ' '}
              </span>
            ) : (
              <input
                ref={inputRef}
                lang='es'
                value={value}
                disabled={locked}
                autoFocus
                autoCapitalize='off'
                autoCorrect='off'
                spellCheck={false}
                aria-label='Type the missing word'
                data-typed-answer
                size={Math.max(exercise.answer.length, 5)}
                onChange={(event) => change(event.target.value)}
                className='mx-1 inline-block max-w-full border-b-4 border-brand-primary bg-transparent px-1 text-center font-bold text-brand-primary outline-none'
              />
            )}
            {after ? <SpanishText text={after} /> : null}
          </p>
          <p className='mt-1 font-semibold text-muted-foreground'>
            {exercise.en}
          </p>
        </div>
      </div>
      {options ? (
        <div className='flex flex-col gap-3'>
          {options.map((option, index) => (
            <button
              key={option}
              type='button'
              lang='es'
              disabled={locked}
              aria-pressed={value === option}
              data-option={option}
              onClick={() => choose(option)}
              className={cn(
                tileBase,
                'relative min-h-14 px-4 py-3 text-lg',
                value === option && tileSelected
              )}
            >
              <span className='absolute top-1/2 left-3 hidden size-6 -translate-y-1/2 place-items-center rounded-md border-2 border-border text-xs font-bold text-muted-foreground sm:grid'>
                {index + 1}
              </span>
              {option}
            </button>
          ))}
        </div>
      ) : (
        <AccentKeys onInsert={insert} disabled={locked} />
      )}
    </div>
  );
}

export function ExerciseView(props: ExerciseProps<Exercise>) {
  const { exercise } = props;
  switch (exercise.type) {
    case 'picture_choice':
      return <PictureChoice {...props} exercise={exercise} />;
    case 'build_sentence':
      return <BuildSentence {...props} exercise={exercise} />;
    case 'listen_type':
      return <ListenType {...props} exercise={exercise} />;
    case 'match_pairs':
      return <MatchPairs {...props} exercise={exercise} />;
    case 'fill_blank':
      return <FillBlank {...props} exercise={exercise} />;
  }
}

