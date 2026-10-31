import { QRCodeSVG } from 'qrcode.react';
import { CONFIG } from '../data';

export function ScanAll() {
  return (
    <div className="flex items-center gap-4 rounded-[1.2rem] border border-white/12 bg-white/6 p-3">
      <div className="size-[4rem] shrink-0 rounded-[0.6rem] bg-white p-1.5">
        <QRCodeSVG value={CONFIG.registerUrl} size={256} style={{ width: '100%', height: '100%' }} />
      </div>
      <div>
        <b className="block font-display text-[1.05rem] font-extrabold">Take the whole calendar with you</b>
        <small className="text-[0.78rem] text-cream/65">Scan to see every event &amp; register from your phone</small>
      </div>
    </div>
  );
}