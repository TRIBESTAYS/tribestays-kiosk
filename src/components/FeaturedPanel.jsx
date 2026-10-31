import { cardVars, featureDate } from '../data';
import { ArrowIcon, CalendarIcon, ClockIcon, PinIcon } from './icons';

function Tile({ icon, label, value }) {
  return (
    <div className="rounded-[1rem] border border-white/10 bg-black/30 p-3">
      <i className="mb-2 block size-[1.9rem] rounded-[0.55rem] bg-linear-to-br from-(--c1) to-(--c2) p-[0.42rem]">{icon}</i>
      <small className="block text-[0.62rem] uppercase tracking-[0.14em] text-cream/65">{label}</small>
      <b className="mt-0.5 block text-[0.92rem] leading-tight">{value}</b>
    </div>
  );
}

export function FeaturedPanel({ e, onRegister }) {
  return (
    <section style={cardVars(e)} className="featured flex w-full flex-col gap-4 rounded-[1.8rem] border border-white/12 p-[1.6rem]">
      <span className="chip self-start border-transparent bg-linear-to-br from-(--c1) to-(--c2)">
        {e.emoji} {e.category}
      </span>
      <h2 className="font-display text-[3.2rem] font-extrabold leading-[0.92] tracking-[-0.04em]">{e.title}</h2>
      <p className="text-[1rem] leading-snug text-cream/70">{e.tagline}</p>
      <div className="grid grid-cols-[1fr_1fr_1.3fr] gap-3">
        <Tile icon={<CalendarIcon />} label="Date" value={featureDate(e)} />
        <Tile icon={<ClockIcon />} label="Time" value={e.time} />
        <Tile icon={<PinIcon />} label="Venue" value={e.venue} />
      </div>
      <div className="flex items-center gap-4">
        <button type="button" onClick={onRegister} className="btn-pop h-[3.6rem] flex-1 text-[1.3rem]">
          Register now <ArrowIcon className="size-[1.3rem]" />
        </button>
        <span className="text-center text-[0.8rem] leading-tight text-cream/65">
          <b className="block font-display text-[1.7rem] text-cream">{e.spots}</b>spots left
        </span>
      </div>
    </section>
  );
}