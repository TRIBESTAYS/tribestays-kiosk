import { useCallback, useEffect, useRef, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { CONFIG, cardVars, longDate, lookupRoom, shortDate, submitRegistration } from '../data';
import { fireConfetti } from '../lib/confetti';
import { Keypad } from './Keypad';
import { ArrowIcon, BackIcon, CheckIcon, CloseIcon, HomeIcon, PersonIcon, PhoneIcon } from './icons';

// Steps: 'choose' | 'room' | 'loading' | 'attendees' | 'success' | 'qr'
export function RegisterSheet({ event: ev, layout, isPhone, confettiRef, onClose, onRegistered }) {
  const [shown, setShown] = useState(false);
  const [step, setStep] = useState('choose');
  const [history, setHistory] = useState([]);
  const [room, setRoom] = useState('');
  const [residents, setResidents] = useState(0);
  const [attendees, setAttendees] = useState(0);
  const [error, setError] = useState('');
  const [loadingText, setLoadingText] = useState('');
  const [shake, setShake] = useState(0);
  const closing = useRef(false);
  const alive = useRef(true);

  const portrait = layout === 'portrait';
  const url = `${CONFIG.registerUrl}?event=${encodeURIComponent(ev.id)}`;

  // Slide in on mount
  useEffect(() => {
    alive.current = true;
    const id = requestAnimationFrame(() => setShown(true));
    return () => {
      alive.current = false;
      cancelAnimationFrame(id);
    };
  }, []);

  const close = useCallback(() => {
    if (closing.current) return;
    closing.current = true;
    setShown(false);
    window.setTimeout(onClose, 320);
  }, [onClose]);

  // Auto-close after inactivity, and on Escape
  useEffect(() => {
    let t = window.setTimeout(close, CONFIG.idleResetMs);
    const reset = () => {
      window.clearTimeout(t);
      t = window.setTimeout(close, CONFIG.idleResetMs);
    };
    const onKey = (e) => {
      if (e.key === 'Escape') close();
    };
    document.addEventListener('pointerdown', reset, true);
    document.addEventListener('keydown', reset, true);
    document.addEventListener('keydown', onKey);
    return () => {
      window.clearTimeout(t);
      document.removeEventListener('pointerdown', reset, true);
      document.removeEventListener('keydown', reset, true);
      document.removeEventListener('keydown', onKey);
    };
  }, [close]);

  const press = useCallback((k) => {
    setError('');
    setRoom((r) => (k === 'clear' ? '' : k === 'del' ? r.slice(0, -1) : r.length < 5 ? r + k : r));
  }, []);

  // Physical keyboard support on the room step (handy for testing)
  useEffect(() => {
    if (step !== 'room') return;
    const onKey = (e) => {
      if (/^\d$/.test(e.key)) press(e.key);
      else if (e.key === 'Backspace') press('del');
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [step, press]);

  // Confetti + auto-close on success
  useEffect(() => {
    if (step !== 'success') return;
    if (confettiRef.current) {
      fireConfetti(confettiRef.current, [ev.colors[0], ev.colors[1], '#FF431E', '#0A7CC1', '#307C5F', '#CDC3B9', '#ffffff']);
    }
    const t = window.setTimeout(close, CONFIG.successCloseMs);
    return () => window.clearTimeout(t);
  }, [step, close, confettiRef, ev.colors]);

  const go = (next) => {
    setHistory((h) => [...h, step]);
    setStep(next);
  };

  const back = () => {
    const prev = history[history.length - 1];
    if (!prev) return;
    setHistory((h) => h.slice(0, -1));
    setError('');
    setStep(prev);
  };

  const findRoom = async () => {
    setError('');
    setLoadingText(`Looking up room ${room}…`);
    setStep('loading');
    try {
      const res = await lookupRoom(room);
      if (!alive.current) return;
      if (!res.found) {
        setError(`We couldn't find room ${room}. Please check and try again.`);
        setStep('room');
        setShake((k) => k + 1);
        return;
      }
      setResidents(res.residents);
      setHistory((h) => [...h, 'room']);
      setStep('attendees');
    } catch {
      if (!alive.current) return;
      setError('Something went wrong. Please try again.');
      setStep('room');
    }
  };

  const register = async (n) => {
    setAttendees(n);
    setError('');
    setLoadingText('Saving your spot…');
    setStep('loading');
    try {
      const res = await submitRegistration({ eventId: ev.id, room, attendees: n });
      if (!alive.current) return;
      if (!res.ok) {
        setError(res.reason === 'already' ? `Room ${room} is already registered for this event.` : 'Could not register. Please try again.');
        setStep('attendees');
        return;
      }
      onRegistered(ev.id, n);
      setHistory([]);
      setStep('success');
    } catch {
      if (!alive.current) return;
      setError('Something went wrong. Please try again.');
      setStep('attendees');
    }
  };

  const canBack = history.length > 0 && step !== 'loading' && step !== 'success';

  const findBtn = (
    <button type="button" disabled={!room} onClick={findRoom} className="btn-pop h-[3.6rem] text-[1.2rem]">
      Find my room <ArrowIcon className="size-[1.3rem]" />
    </button>
  );

  const attendOptions =
    residents === 1
      ? [{ n: 1, label: 'Count me in', sub: '1 spot' }]
      : residents === 2
        ? [
            { n: 1, label: 'Just one of us', sub: '1 spot' },
            { n: 2, label: 'Both of us', sub: '2 spots' },
          ]
        : Array.from({ length: residents }, (_, i) => ({
            n: i + 1,
            label: i + 1 === residents ? `All ${residents} of us` : `${i + 1} of us`,
            sub: `${i + 1} spot${i ? 's' : ''}`,
          }));

  let body = null;
  switch (step) {
    case 'choose':
      body = (
        <>
          <h3 className="s-title">How would you like to register?</h3>
          <div className="grid grid-cols-2 gap-3">
            <button type="button" onClick={() => go('room')} className="choice bg-linear-to-br from-brand-orange to-[#FF2E6A]">
              <span className="choice-ic"><HomeIcon /></span>
              <b>Enter room number</b>
              <small>Sign up right here in 10 seconds</small>
            </button>
            {isPhone ? (
              <a href={url} target="_blank" rel="noopener noreferrer" className="choice bg-linear-to-br from-brand-blue to-brand-green">
                <span className="choice-ic"><PhoneIcon /></span>
                <b>Register on the website</b>
                <small>Opens in your browser</small>
              </a>
            ) : (
              <button type="button" onClick={() => go('qr')} className="choice bg-linear-to-br from-brand-blue to-brand-green">
                <span className="choice-ic"><PhoneIcon /></span>
                <b>Scan a QR code</b>
                <small>Register later on your phone</small>
              </button>
            )}
          </div>
        </>
      );
      break;

    case 'room':
      body = (
        <>
          <h3 className="s-title">What's your room number?</h3>
          <div className={portrait ? 'flex flex-col gap-3' : 'grid grid-cols-2 gap-6'}>
            <div className="flex flex-col gap-3">
              <div key={shake} className={`room-display ${shake ? 'animate-shake' : ''}`}>
                {room ? (
                  <>
                    <span>{room}</span>
                    <i className="caret" />
                  </>
                ) : (
                  <span className="text-[1.5rem] font-semibold tracking-normal text-white/30">Room no.</span>
                )}
              </div>
              {error && <p className="s-error">{error}</p>}
              {!portrait && <div className="mt-auto">{findBtn}</div>}
            </div>
            <Keypad onPress={press} />
          </div>
          {portrait && findBtn}
        </>
      );
      break;

    case 'loading':
      body = (
        <div className="grid place-items-center gap-5 py-12">
          <div className="spinner" />
          <p className="text-[1.05rem] font-semibold">{loadingText}</p>
        </div>
      );
      break;

    case 'attendees':
      body = (
        <>
          <span className="self-start rounded-full border border-white/12 bg-white/8 px-3 py-1 text-[0.8rem]">
            Room <b>{room}</b>
          </span>
          <h3 className="s-title">
            {residents === 1 ? 'Found you! Ready to join?' : `${residents} people live here. Who's coming?`}
          </h3>
          <div className="flex gap-2">
            {Array.from({ length: residents }, (_, i) => (
              <span key={i} className="people-dot" style={{ animationDelay: `${i * 0.12}s` }}>
                <PersonIcon />
              </span>
            ))}
          </div>
          <div className={`grid gap-3 ${attendOptions.length === 1 ? 'grid-cols-1' : 'grid-cols-2'}`}>
            {attendOptions.map((o, i) => (
              <button
                key={o.n}
                type="button"
                disabled={o.n > ev.spots}
                onClick={() => register(o.n)}
                className={`choice bg-linear-to-br ${i === 1 ? 'from-brand-orange to-[#FF2E6A]' : 'from-(--c1) to-(--c2)'}`}
              >
                <span className="font-display text-[3.2rem] font-extrabold leading-[0.9]">{o.n}</span>
                <b>{o.label}</b>
                <small>{o.n > ev.spots ? 'Not enough spots' : o.sub}</small>
              </button>
            ))}
          </div>
          {error && <p className="s-error">{error}</p>}
        </>
      );
      break;

    case 'success':
      body = (
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="tick"><CheckIcon /></div>
          <h3 className="s-title text-[2.4rem]">You're in! 🎉</h3>
          <p className="text-[0.95rem] text-cream/70">
            <b className="text-cream">{attendees} {attendees === 1 ? 'spot' : 'spots'}</b> booked for room{' '}
            <b className="text-cream">{room}</b>
          </p>
          <div className="ticket">
            <span className="text-[2.4rem]">{ev.emoji}</span>
            <div>
              <b className="block font-display text-[1.15rem] font-extrabold">{ev.title}</b>
              <small className="block text-[0.8rem] leading-snug text-cream/70">
                {longDate(ev)} · {ev.time}
                <br />
                {ev.venue}
              </small>
            </div>
          </div>
          <button type="button" onClick={close} className="btn-pop relative h-[3.4rem] w-full overflow-hidden text-[1.15rem]">
            <span className="timer-bar" style={{ animationDuration: `${CONFIG.successCloseMs}ms` }} />
            <span className="relative">Done</span>
          </button>
        </div>
      );
      break;

    case 'qr':
      body = (
        <>
          <h3 className="s-title text-center">Scan to register on your phone</h3>
          <div className="grid place-items-center py-2">
            <div className="qr-box">
              <QRCodeSVG value={url} size={512} style={{ width: '100%', height: '100%' }} />
            </div>
          </div>
          <p className="text-center text-[0.9rem] text-cream/70">Open your camera and point it at the code. No app needed.</p>
          <p className="break-all text-center font-mono text-[0.72rem] text-cream/55">{url.replace(/^https?:\/\//, '')}</p>
          <button type="button" onClick={close} className="h-[3.2rem] rounded-[1.1rem] border border-white/12 bg-white/8 font-bold">
            Close
          </button>
        </>
      );
      break;

    default:
      break;
  }

  return (
    <div className={`fixed inset-0 z-50 grid ${portrait ? 'items-end' : 'place-items-center'}`} style={cardVars(ev)}>
      <div
        onClick={close}
        className={`absolute inset-0 bg-[#08060c]/75 transition-opacity duration-300 ${shown ? 'opacity-100' : 'opacity-0'}`}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={`Register for ${ev.title}`}
        className={`sheet relative flex max-h-[94dvh] flex-col overflow-y-auto border border-white/12 transition-[transform,opacity] duration-300 ease-[cubic-bezier(.2,.9,.25,1)] ${
          portrait
            ? 'mx-auto w-full max-w-[calc(100dvh*0.62)] rounded-t-[2rem] border-b-0 pb-[max(1rem,env(safe-area-inset-bottom))]'
            : 'w-[min(92vw,44rem)] rounded-[2rem]'
        } ${shown ? 'translate-y-0 opacity-100' : portrait ? 'translate-y-full' : 'translate-y-8 opacity-0'}`}
      >
        {portrait && <div className="mx-auto mt-3 h-1.5 w-12 rounded-full bg-white/25" />}

        <div className="flex items-center gap-3 px-[1.4rem] pt-[1.2rem]">
          <button type="button" aria-label="Back" onClick={back} className={`round-btn ${canBack ? '' : 'invisible'}`}>
            <BackIcon />
          </button>
          <div className="flex min-w-0 flex-1 items-center gap-3">
            <div className="grid size-[3.2rem] shrink-0 place-items-center overflow-hidden rounded-[0.9rem] bg-linear-to-br from-(--c1) to-(--c2) text-[1.6rem]">
              {ev.image ? <img src={ev.image} alt="" className="size-full object-cover" /> : ev.emoji}
            </div>
            <div className="min-w-0">
              <b className="block truncate font-display text-[1.25rem] font-extrabold leading-tight">{ev.title}</b>
              <small className="block truncate text-[0.78rem] text-cream/65">
                {shortDate(ev)} · {ev.time} · {ev.venue}
              </small>
            </div>
          </div>
          <button type="button" aria-label="Close" onClick={close} className="round-btn">
            <CloseIcon />
          </button>
        </div>

        <div key={step} className="animate-step flex flex-col gap-4 p-[1.4rem]">
          {body}
        </div>
      </div>
    </div>
  );
}