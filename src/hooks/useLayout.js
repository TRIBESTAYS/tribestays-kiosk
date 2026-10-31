import { useEffect, useState } from 'react';

// /vertical and /horizontal force a layout; / picks one from the screen shape.
function detect() {
  const path = window.location.pathname;
  if (path.startsWith('/vertical')) return 'portrait';
  if (path.startsWith('/horizontal')) return 'landscape';
  return window.innerWidth > window.innerHeight && window.innerWidth >= 900 ? 'landscape' : 'portrait';
}

export function useLayout() {
  const [layout, setLayout] = useState(detect);
  useEffect(() => {
    const onResize = () => setLayout(detect());
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);
  return layout;
}

const PHONE_QUERY = '(max-width: 640px), (max-height: 500px) and (pointer: coarse)';

export function useIsPhone() {
  const [isPhone, setIsPhone] = useState(() => window.matchMedia(PHONE_QUERY).matches);
  useEffect(() => {
    const mq = window.matchMedia(PHONE_QUERY);
    const onChange = () => setIsPhone(mq.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);
  return isPhone;
}