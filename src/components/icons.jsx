function Svg({ className = 'size-full', fill = false, children }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      aria-hidden="true"
      fill={fill ? 'currentColor' : 'none'}
      stroke={fill ? 'none' : 'currentColor'}
      strokeWidth={2.2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {children}
    </svg>
  );
}

export const CalendarIcon = (p) => <Svg {...p}><rect x="3" y="4.5" width="18" height="17" rx="3" /><path d="M3 9.5h18M8 2.5v4M16 2.5v4" /></Svg>;
export const ClockIcon = (p) => <Svg {...p}><circle cx="12" cy="12" r="9.5" /><path d="M12 6.5V12l3.5 2.5" /></Svg>;
export const PinIcon = (p) => <Svg {...p}><path d="M12 22s-7.5-6.6-7.5-12.5a7.5 7.5 0 0 1 15 0C19.5 15.4 12 22 12 22z" /><circle cx="12" cy="9.5" r="2.6" /></Svg>;
export const ArrowIcon = (p) => <Svg {...p}><path d="M5 12h14M13 6l6 6-6 6" /></Svg>;
export const BackIcon = (p) => <Svg {...p}><path d="M19 12H5M11 18l-6-6 6-6" /></Svg>;
export const CloseIcon = (p) => <Svg {...p}><path d="M6 6l12 12M18 6L6 18" /></Svg>;
export const HomeIcon = (p) => <Svg {...p}><path d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1z" /></Svg>;
export const PhoneIcon = (p) => <Svg {...p}><rect x="6" y="2" width="12" height="20" rx="3" /><path d="M11 18.5h2" /></Svg>;
export const DeleteIcon = (p) => <Svg {...p}><path d="M9 5h11a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H9l-6-7z" /><path d="M12 9.5l5 5M17 9.5l-5 5" /></Svg>;
export const CheckIcon = (p) => <Svg {...p}><path d="M5 12.5l4.5 4.5L19 7.5" /></Svg>;
export const PersonIcon = (p) => <Svg fill {...p}><circle cx="12" cy="7.5" r="4.5" /><path d="M3.5 21c.8-4.6 4.3-7.5 8.5-7.5s7.7 2.9 8.5 7.5z" /></Svg>;