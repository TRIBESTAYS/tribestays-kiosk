import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';

const mod = (a, n) => ((a % n) + n) % n;
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

const createState = () => ({
  pos: 0,
  target: 0,
  rendered: Number.NaN,
  spacing: 300,
  radius: 0,
  step: 22,
  dragging: false,
  moved: false,
  startX: 0,
  startPos: 0,
  downCard: -1,
  samples: [],
  nextAt: 0, // timestamp of the next automatic slide
  active: 0,
  snapTimer: 0,
  cards: [],
});

/**
 * mode: 'wheel' (vertical, cards on a circle) | 'coverflow' (horizontal, 3D)
 */
export function useCarousel(opts) {
  const stageRef = useRef(null);
  const progressRef = useRef(null);
  const optsRef = useRef(opts);
  useLayoutEffect(() => {
    optsRef.current = opts;
  });
  const [s] = useState(createState);
  const [active, setActive] = useState(0);

  // Any touch pushes the next automatic slide back to resumeAfterMs from now
  const interact = useCallback(() => {
    s.nextAt = performance.now() + optsRef.current.resumeAfterMs;
  }, [s]);

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    const mode = opts.mode;
    const n = opts.count;
    s.cards = Array.from(stage.querySelectorAll('[data-card]')).map((el) => ({
      el,
      dim: el.querySelector('[data-dim]'),
      z: -1,
      visible: true,
    }));

    const measure = () => {
      const first = s.cards[0]?.el;
      if (!first) return;
      if (mode === 'wheel') {
        // Cards sit on a circle whose pivot is below the focused card
        s.radius = first.offsetHeight * 1.05;
        s.step = 22;
        s.spacing = (s.radius * s.step * Math.PI) / 180;
      } else {
        s.spacing = first.offsetWidth * 0.66;
      }
      s.rendered = Number.NaN;
    };

    // Only transform + opacity change per frame (GPU-composited, cheap on Android)
    const render = () => {
      s.cards.forEach((c, i) => {
        let d = mod(i - s.pos, n);
        if (d > n / 2) d -= n;
        const ad = Math.abs(d);
        let transform;
        let opacity;
        let dim;
        if (mode === 'wheel') {
          transform = `translate(-50%, -50%) translateY(${s.radius}px) rotate(${d * s.step}deg) translateY(${-s.radius}px) scale(${1 - Math.min(ad, 2) * 0.14})`;
          opacity = ad > 2.2 ? 0 : clamp(1.25 - ad * 0.45, 0, 1);
          dim = clamp(ad * 0.5, 0, 0.8);
        } else {
          transform = `translate(-50%, -50%) translate3d(${d * s.spacing}px, 0, ${-ad * s.spacing * 0.55}px) rotateY(${-clamp(d, -1, 1) * 34}deg) scale(${1 - Math.min(ad, 3) * 0.06})`;
          opacity = ad > 2.7 ? 0 : clamp(1.35 - ad * 0.3, 0, 1);
          dim = clamp(ad * 0.45, 0, 0.75);
        }
        c.el.style.transform = transform;
        c.el.style.opacity = String(opacity);
        if (c.dim) c.dim.style.opacity = String(dim);
        const z = 100 - Math.round(ad * 10);
        if (z !== c.z) {
          c.el.style.zIndex = String(z);
          c.z = z;
        }
        const visible = opacity > 0.01;
        if (visible !== c.visible) {
          c.el.style.visibility = visible ? 'visible' : 'hidden';
          c.visible = visible;
        }
      });
      const a = mod(Math.round(s.pos), n);
      if (a !== s.active) {
        s.active = a;
        setActive(a);
      }
    };

    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(stage);
    s.nextAt = performance.now() + optsRef.current.autoAdvanceMs;

    let raf = 0;
    let last = performance.now();
    const tick = (t) => {
      const o = optsRef.current;
      const dt = clamp(t - last, 0, 64);
      last = t;

      if (s.dragging || o.paused) {
        // Hold the timer while someone is touching or registering
        s.nextAt = Math.max(s.nextAt, t + o.resumeAfterMs);
      } else if (t >= s.nextAt) {
        s.target = Math.round(s.target) + 1;
        s.nextAt = t + o.autoAdvanceMs;
      }

      if (!s.dragging) {
        const diff = s.target - s.pos;
        // Frame-rate independent easing (same feel at 60Hz and 120Hz)
        s.pos = Math.abs(diff) < 0.0005 ? s.target : s.pos + diff * (1 - Math.pow(0.88, dt / 16.67));
      }

      // Bar fills during the last autoAdvanceMs before the next slide
      const bar = progressRef.current;
      if (bar) {
        const p = o.paused ? 0 : clamp(1 - (s.nextAt - t) / o.autoAdvanceMs, 0, 1);
        bar.style.transform = `scaleX(${p})`;
      }

      if (s.pos !== s.rendered) {
        render();
        s.rendered = s.pos;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, [opts.mode, opts.count, s]);

  const goTo = useCallback(
    (i) => {
      const n = optsRef.current.count;
      let d = mod(i - Math.round(s.target), n);
      if (d > n / 2) d -= n;
      s.target = Math.round(s.target) + d;
    },
    [s],
  );

  const shift = useCallback(
    (delta) => {
      interact();
      s.target = Math.round(s.target) + delta;
    },
    [s, interact],
  );

  const onPointerDown = useCallback(
    (e) => {
      s.dragging = true;
      s.moved = false;
      s.startX = e.clientX;
      s.startPos = s.pos;
      const card = e.target.closest('[data-card]');
      s.downCard = card ? Number(card.dataset.card) : -1;
      s.samples = [{ x: e.clientX, t: performance.now() }];
      e.currentTarget.setPointerCapture(e.pointerId);
      interact();
    },
    [s, interact],
  );

  const onPointerMove = useCallback(
    (e) => {
      if (!s.dragging) return;
      const dx = e.clientX - s.startX;
      if (Math.abs(dx) > 10) s.moved = true;
      s.pos = s.startPos - dx / s.spacing;
      s.target = s.pos;
      s.samples.push({ x: e.clientX, t: performance.now() });
      if (s.samples.length > 6) s.samples.shift();
    },
    [s],
  );

  const onPointerUp = useCallback(() => {
    if (!s.dragging) return;
    s.dragging = false;
    interact();
    if (s.moved) {
      const a = s.samples[0];
      const b = s.samples[s.samples.length - 1];
      const v = (b.x - a.x) / Math.max(1, b.t - a.t); // px per ms
      s.target = Math.round(s.pos + clamp((-v * 260) / s.spacing, -3, 3));
      return;
    }
    // A tap: side card → bring it to focus; focused card → register
    if (s.downCard < 0) return;
    if (s.downCard === s.active && Math.abs(s.pos - Math.round(s.pos)) < 0.2) optsRef.current.onOpen(s.downCard);
    else goTo(s.downCard);
  }, [s, interact, goTo]);

  // If the browser takes the pointer away (e.g. Android starts a scroll), treat it as a release
  const onLostPointerCapture = useCallback(() => {
    if (!s.dragging) return;
    s.dragging = false;
    s.target = Math.round(s.pos);
    interact();
  }, [s, interact]);

  const onWheel = useCallback(
    (e) => {
      interact();
      const d = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
      s.target += d / s.spacing;
      window.clearTimeout(s.snapTimer);
      s.snapTimer = window.setTimeout(() => {
        s.target = Math.round(s.target);
      }, 140);
    },
    [s, interact],
  );

  const goToAndPause = useCallback(
    (i) => {
      interact();
      goTo(i);
    },
    [interact, goTo],
  );

  return {
    stageRef,
    progressRef,
    active,
    interact,
    shift,
    goTo: goToAndPause,
    bind: {
      onPointerDown,
      onPointerMove,
      onPointerUp,
      onPointerCancel: onPointerUp,
      onLostPointerCapture,
      onWheel,
    },
  };
}