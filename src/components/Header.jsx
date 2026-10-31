import { useEffect, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { CONFIG } from '../data';
import logo from '../assets/tribestays.jpeg';

function useClock() {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 10_000);
    return () => window.clearInterval(id);
  }, []);
  return now;
}

export function Header({ center, showQr }) {
  const now = useClock();
  return (
    <header className="flex items-center justify-between gap-4 px-[5%] pt-[max(2.5dvh,env(safe-area-inset-top))]">
      <div className="flex items-center gap-3">
        <img src={logo} alt="" className="size-[2.8rem] rounded-[0.8rem] shadow-[0_0.3rem_1rem_rgb(255_67_30/.4)]" />
        <div>
          <b className="block font-display text-[1.4rem] font-extrabold leading-none tracking-tight">TribeStays</b>
          <small className="mt-1 block text-[0.68rem] uppercase tracking-[0.18em] text-cream/65">Community Events</small>
        </div>
      </div>

      {center}

      <div className="flex items-center gap-4">
        {showQr && (
          <div className="flex items-center gap-3">
            <small className="text-right text-[0.72rem] leading-tight text-cream/65">
              <b className="block text-[0.85rem] text-cream">All events</b>Scan to browse
              <br />on your phone
            </small>
            <div className="size-[3.4rem] rounded-[0.6rem] bg-white p-1">
              <QRCodeSVG value={CONFIG.registerUrl} size={256} style={{ width: '100%', height: '100%' }} />
            </div>
          </div>
        )}
        <div className="text-right">
          <b className="block font-display text-[1.8rem] font-bold leading-none tabular-nums">
            {now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
          </b>
          <small className="text-[0.72rem] text-cream/65">
            {now.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })}
          </small>
        </div>
      </div>
    </header>
  );
}