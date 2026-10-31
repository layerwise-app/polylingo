import { Fragment, useState } from 'react';
import { translateWord } from '~/content/course';
import { splitWords, wordKey } from '~/content/speech';
import { isSoundEnabled } from '~/lib/sfx';
import { playSpeech } from '~/lib/speech-player';
import { cn } from '~/lib/utils';

/** One tappable Spanish word: tap to hear it and see what it means. */
function Word({ word, children }: { word: string; children: string }) {
  const [open, setOpen] = useState(false);
  const meaning = translateWord(wordKey(word));
  return (
    <span className='group relative inline-block'>
      <button
        type='button'
        className='cursor-pointer rounded-sm border-b-2 border-dotted border-muted-foreground/60 font-[inherit] outline-none hover:border-brand-primary hover:text-brand-primary focus-visible:ring-2 focus-visible:ring-primary/40'
        onClick={() => {
          setOpen(true);
          if (isSoundEnabled()) void playSpeech(word);
        }}
        onBlur={() => setOpen(false)}
      >
        {children}
      </button>
      {meaning ? (
        <span
          role='tooltip'
          className={cn(
            'pointer-events-none absolute bottom-full left-1/2 z-20 mb-2 hidden w-max max-w-44 -translate-x-1/2 rounded-xl bg-foreground px-3 py-1.5 text-center text-sm font-bold text-white shadow-lg group-hover:block',
            open && 'block'
          )}
        >
          {meaning}
        </span>
      ) : null}
    </span>
  );
}

/** A Spanish sentence whose words can be tapped. Punctuation stays as written. */
export function SpanishText({
  text,
  className
}: {
  text: string;
  className?: string;
}) {
  const tokens = text.split(/(\s+)/);
  return (
    <span lang='es' className={className}>
      {tokens.map((token, index) => {
        if (/^\s*$/.test(token)) return <Fragment key={index}>{token}</Fragment>;
        const [word] = splitWords(token);
        if (!word) return <Fragment key={index}>{token}</Fragment>;
        const start = token.indexOf(word);
        return (
          <Fragment key={index}>
            {token.slice(0, start)}
            <Word word={word}>{word}</Word>
            {token.slice(start + word.length)}
          </Fragment>
        );
      })}
    </span>
  );
}
