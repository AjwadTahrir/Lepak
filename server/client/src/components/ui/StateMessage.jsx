// Empty and error states. Say what happened and what to do next, in Lepak's voice.
export default function StateMessage({ icon: Icon, title, body, action, onAction, tone = 'empty' }) {
  return (
    <div
      role={tone === 'error' ? 'alert' : undefined}
      className="flex flex-col items-center rounded-card border border-dashed border-line-strong/50 px-5 py-8 text-center"
    >
      {Icon && (
        <span aria-hidden="true" className={`mb-3 grid size-12 place-items-center rounded-full
          ${tone === 'error' ? 'bg-orange-soft text-orange-ink' : 'bg-mango-soft text-ink'}`}>
          <Icon className="size-6" />
        </span>
      )}
      <p className="font-display text-lg font-bold">{title}</p>
      {body && <p className="mt-1 max-w-sm text-sm text-muted">{body}</p>}
      {action && (
        <button
          type="button"
          onClick={onAction}
          className="mt-4 min-h-11 rounded-button border-2 border-ink px-4 font-semibold hover:bg-ink hover:text-cream"
        >
          {action}
        </button>
      )}
    </div>
  );
}
