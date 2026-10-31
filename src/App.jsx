import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { CONFIG, EVENTS } from './data';
import { useCarousel } from './hooks/useCarousel';
import { useIsPhone, useLayout } from './hooks/useLayout';
import { Background } from './components/Background';
import { EventCard } from './components/EventCard';
import { FeaturedPanel } from './components/FeaturedPanel';
import { Header } from './components/Header';
import { Nav } from './components/Nav';
import { RegisterSheet } from './components/RegisterSheet';
import { ScanAll } from './components/ScanAll';

export default function App() {
  const layout = useLayout();
  const isPhone = useIsPhone();
  const portrait = layout === 'portrait';

  const [spots, setSpots] = useState(() => Object.fromEntries(EVENTS.map((e) => [e.id, e.spots])));
  const events = useMemo(() => EVENTS.map((e) => ({ ...e, spots: spots[e.id] })), [spots]);

  const [openId, setOpenId] = useState(null);
  const [sheetKey, setSheetKey] = useState(0);
  const confettiRef = useRef(null);

  const open = useCallback((i) => {
    setOpenId(EVENTS[i].id);
    setSheetKey((k) => k + 1);
  }, []);

  const { active, interact, shift, goTo, stageRef, progressRef, bind } = useCarousel({
    count: events.length,
    mode: portrait ? 'wheel' : 'coverflow',
    paused: openId !== null,
    autoAdvanceMs: CONFIG.autoAdvanceMs,
    resumeAfterMs: CONFIG.resumeAfterMs,
    onOpen: open,
  });

  const closeSheet = useCallback(() => {
    setOpenId(null);
    interact();
  }, [interact]);

  const onRegistered = useCallback((id, n) => {
    setSpots((s) => ({ ...s, [id]: s[id] - n }));
  }, []);

  // Arrow keys / Enter for testing on a desktop
  useEffect(() => {
    const onKey = (e) => {
      if (openId) return;
      if (e.key === 'ArrowRight') shift(1);
      else if (e.key === 'ArrowLeft') shift(-1);
      else if (e.key === 'Enter') open(active);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [openId, shift, open, active]);

  const openEvent = openId ? events.find((e) => e.id === openId) ?? null : null;

  const stage = (
    <div
      ref={stageRef}
      {...bind}
      role="region"
      aria-label="Upcoming events"
      className={`stage relative min-h-0 overflow-hidden ${portrait ? 'flex-1' : 'stage-3d'}`}
    >
      {events.map((e, i) => (
        <EventCard
          key={e.id}
          e={e}
          index={i}
          variant={portrait ? 'full' : 'poster'}
          active={i === active}
          onRegister={open}
        />
      ))}
    </div>
  );

  const nav = <Nav events={events} active={active} onDot={goTo} progressRef={progressRef} />;

  return (
    <>
      {portrait ? (
        <main className="portrait-frame relative isolate mx-auto flex h-dvh flex-col overflow-hidden bg-ink">
          <Background />
          <Header showQr={false} />
          <section className="px-[5%] pt-[2.5dvh] [@media(max-height:640px)]:hidden">
            <h1 className="font-display text-[3.1rem] font-extrabold leading-[0.95] tracking-[-0.035em]">
              What's on at
              <br />
              <span className="text-grad">Tribe</span> this week
            </h1>
          </section>
          {stage}
          {nav}
          {!isPhone && (
            <div className="px-[5%] pb-[3dvh]">
              <ScanAll />
            </div>
          )}
        </main>
      ) : (
        <main className="relative isolate grid h-dvh w-full grid-cols-[minmax(0,40%)_minmax(0,1fr)] grid-rows-[auto_minmax(0,1fr)_auto] overflow-hidden bg-ink">
          <Background />
          <div className="col-span-2">
            <Header
              showQr={!isPhone}
              center={
                <h1 className="font-display text-[2rem] font-extrabold tracking-[-0.035em]">
                  What's on at <span className="text-grad">Tribe</span>
                </h1>
              }
            />
          </div>
          <div className="row-span-2 flex items-center pb-[4dvh] pl-[5%] pr-[2%]">
            <FeaturedPanel key={events[active].id} e={events[active]} onRegister={() => open(active)} />
          </div>
          {stage}
          {nav}
        </main>
      )}

      {openEvent && (
        <RegisterSheet
          key={sheetKey}
          event={openEvent}
          layout={layout}
          isPhone={isPhone}
          confettiRef={confettiRef}
          onClose={closeSheet}
          onRegistered={onRegistered}
        />
      )}

      <canvas ref={confettiRef} className="pointer-events-none fixed inset-0 z-[60] size-full" />
    </>
  );
}