import { useState } from 'react';
import { ArrowUp } from 'lucide-react';

// Conversational input: Enter sends, Shift+Enter adds a new line.
export default function AskBox({ onAsk, busy = false }) {
  const [text, setText] = useState('');
  const canSend = text.trim().length > 0 && !busy;

  function submit(e) {
    e.preventDefault();
    if (canSend) onAsk(text.trim());
  }

  return (
    <form
      onSubmit={submit}
      className="group flex flex-col rounded-input border-2 border-ink bg-surface p-2 shadow-[4px_4px_0_var(--color-ink)]
                 transition-shadow focus-within:shadow-[4px_4px_0_var(--color-orange)]"
    >
      <label htmlFor="ask" className="sr-only">Tell Lepak what you feel like doing</label>
      <textarea
        id="ask"
        rows={2}
        maxLength={300}
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) submit(e);
        }}
        placeholder="Nak makan murah dekat sini, lepas tu ada apa weekend ni..."
        className="block max-h-48 min-h-[4.25rem] w-full flex-1 resize-none bg-transparent px-3 pt-2 text-[1.0625rem] leading-relaxed
                   [field-sizing:content] placeholder:text-muted focus:outline-none"
      />
      <div className="flex items-center justify-between gap-3 pl-3">
        <p className="min-w-0 font-mono text-xs text-muted">BM, English, rojak pun boleh</p>
        <button
          type="submit"
          disabled={!canSend}
          className="flex min-h-11 shrink-0 items-center gap-1.5 rounded-button bg-orange px-4 font-bold whitespace-nowrap text-ink
                     hover:bg-orange-hover active:translate-y-px disabled:bg-line disabled:text-muted"
        >
          {busy ? 'Finding...' : 'Find a plan'}
          <ArrowUp aria-hidden="true" className="size-[1.125rem]" strokeWidth={2.5} />
        </button>
      </div>
    </form>
  );
}
