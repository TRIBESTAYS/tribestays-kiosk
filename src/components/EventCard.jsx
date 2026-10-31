import { memo, useState } from 'react';
import { cardVars, shortDate } from '../data';
import { ArrowIcon, CalendarIcon, ClockIcon, PinIcon } from './icons';

function Detail({ icon, children }) {
  return (
    <li className="flex items-center gap-2.5">
      <i className="grid size-[1.9rem] shrink-0 place-items-center rounded-[0.55rem] bg-linear-to-br from-(--c1) to-(--c2) p-[0.42rem]">
        {icon}
      </i>
      <span className="truncate">{children}</span>
    </li>
  );
}

// variant: 'full' (vertical — all details + button) | 'poster' (horizontal — photo + title)
// memo: only the cards whose `active` flips re-render when the carousel moves
export const EventCard = memo(function EventCard({ e, index, variant, active, onRegister }) {
  const [broken, setBroken] = useState(false);
  const full = variant === 'full';

  return (
    <article
      data-card={index}
      style={cardVars(e)}
      className={`card ${full ? 'card-full' : 'card-poster'} ${active ? 'is-active' : ''}`}
    >
      <div className="relative flex h-full flex-col overflow-hidden rounded-[calc(1.6rem-3px)] bg-card">
        <div className="relative min-h-[30%] flex-1 overflow-hidden">
          <div className={`absolute inset-0 grid place-items-center bg-linear-to-br from-(--c1) to-(--c2) ${e.art === 'checker' ? 'art-checker' : ''}`}>
            <span className="text-[4.5rem]">{e.emoji}</span>
          </div>
          {e.image && !broken && (
            <img
              src={e.image}
              alt=""
              draggable={false}
              decoding="async"
              onError={() => setBroken(true)}
              className="absolute inset-0 size-full object-cover"
            />
          )}
          <div className="absolute inset-0 bg-linear-to-b from-black/25 via-transparent via-40% to-card" />
          <span className="chip absolute left-4 top-4">{e.emoji} {e.category}</span>
          <span className="absolute right-4 top-4 rounded-full bg-cream px-3 py-1.5 text-[0.72rem] font-bold text-ink">
            {e.spots} spots left
          </span>
        </div>

        <div className={`relative -mt-6 flex flex-col px-[7%] ${full ? 'pb-[7%]' : 'pb-[8%]'}`}>
          <h2 className={`font-display font-extrabold leading-[0.98] tracking-[-0.03em] ${full ? 'text-[2.1rem]' : 'text-[1.6rem]'}`}>
            {e.title}
          </h2>
          {full && (
            <>
              <p className="mt-2 text-[0.9rem] leading-snug text-cream/70">{e.tagline}</p>
              <ul className="mt-4 grid gap-2.5 text-[0.95rem] font-medium">
                <Detail icon={<CalendarIcon />}>{shortDate(e)}</Detail>
                <Detail icon={<ClockIcon />}>{e.time}</Detail>
                <Detail icon={<PinIcon />}>{e.venue}</Detail>
              </ul>
              {/* Taps are handled by the carousel; this onClick only covers keyboard activation */}
              <button
                type="button"
                tabIndex={active ? 0 : -1}
                onClick={(ev) => {
                  if (ev.detail === 0) onRegister(index);
                }}
                className="btn-pop mt-5 h-[3.4rem] text-[1.2rem]"
              >
                Register <ArrowIcon className="size-[1.3rem]" />
              </button>
            </>
          )}
        </div>
      </div>
    </article>
  );
});