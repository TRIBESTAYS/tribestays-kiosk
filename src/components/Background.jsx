// Static backdrop: painted once, never animated (full-screen repaints are what lag on Android)
export function Background() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 -z-10"
      style={{
        background: `radial-gradient(circle at 50% 45%, transparent, rgb(14 11 20 / .65) 75%),
                     radial-gradient(70% 45% at 10% 5%, #FF431E59, transparent 70%),
                     radial-gradient(70% 50% at 100% 55%, #0A7CC14D, transparent 70%),
                     radial-gradient(60% 40% at 25% 105%, #307C5F4D, transparent 70%)`,
      }}
    />
  );
}
