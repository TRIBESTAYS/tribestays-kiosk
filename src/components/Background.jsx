export function Background({ events, active }) {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
      {events.map((e, i) => (
        <div
          key={e.id}
          className="absolute inset-0 transition-opacity duration-1000 ease-out"
          style={{
            opacity: i === active ? 1 : 0,
            background: `radial-gradient(70% 45% at 10% 5%, ${e.colors[0]}73, transparent 70%),
                         radial-gradient(70% 50% at 100% 55%, ${e.colors[1]}61, transparent 70%),
                         radial-gradient(60% 40% at 25% 105%, #FF431E40, transparent 70%)`,
          }}
        />
      ))}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_45%,transparent,rgb(14_11_20/.65)_75%)]" />
    </div>
  );
}