export function Nav({ events, active, onDot, progressRef }) {
  const a = events[active];
  return (
    <nav className="mx-auto grid w-full max-w-[18rem] gap-3 px-4 pb-[3dvh] pt-3">
      <div className="flex justify-center gap-2">
        {events.map((e, i) => (
          <button
            key={e.id}
            type="button"
            aria-label={e.title}
            onClick={() => onDot(i)}
            className={`h-2.5 rounded-full transition-[width,background-color] duration-300 ${i === active ? 'w-9' : 'w-2.5 bg-white/25'}`}
            style={i === active ? { background: `linear-gradient(90deg, ${e.colors[0]}, ${e.colors[1]})` } : undefined}
          />
        ))}
      </div>
      <div className="h-[3px] overflow-hidden rounded-full bg-white/10">
        <div
          ref={progressRef}
          className="h-full origin-left will-change-transform"
          style={{ 
            transform: 'scaleX(0)',
            background: `linear-gradient(90deg, ${a.colors[0]}, 
            ${a.colors[1]})` 
          }}
        />
      </div>
    </nav>
  );
}