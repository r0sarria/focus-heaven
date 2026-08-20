import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import type { Theme } from './themes';
import type { Strings, Lang } from './i18n';

interface Props {
  theme: Theme;
  t: Strings;
  lang: Lang;
  onClose: () => void;
}

type Phase = 'in' | 'hold' | 'out' | 'rest';

const PHASE_DURATIONS: Record<Phase, number> = {
  in: 4,
  hold: 7,
  out: 8,
  rest: 1,
};

export default function BreathingCircle({ theme, t, lang, onClose }: Props) {
  const [active, setActive] = useState(false);
  const [phase, setPhase] = useState<Phase>('rest');
  const [cycle, setCycle] = useState(0);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    if (!active) return;

    const phases: Phase[] = ['in', 'hold', 'out', 'rest'];
    let idx = 0;
    let cycleCount = 0;

    const next = () => {
      if (idx >= phases.length) {
        cycleCount++;
        setCycle(cycleCount);
        idx = 0;
      }
      const p = phases[idx]!;
      setPhase(p);
      playPhaseTone(p);
      idx++;
      timerRef.current = window.setTimeout(next, PHASE_DURATIONS[p] * 1000);
    };

    timerRef.current = window.setTimeout(next, 0);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active]);

  const playPhaseTone = (p: Phase) => {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const freqs: Record<Phase, number> = { in: 440, hold: 523.25, out: 349.23, rest: 392 };
      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.value = freqs[p];
      const g = ctx.createGain();
      const now = ctx.currentTime;
      g.gain.setValueAtTime(0, now);
      g.gain.linearRampToValueAtTime(0.12, now + 0.3);
      g.gain.exponentialRampToValueAtTime(0.001, now + 1.5);
      osc.connect(g);
      g.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 1.6);
    } catch {
      // noop
    }
  };

  const phaseLabel: Record<Phase, string> = {
    in: t.breatheIn,
    hold: t.breatheHold,
    out: t.breatheOut,
    rest: lang === 'tr' ? 'Hazır ol...' : 'Ready...',
  };

  const scaleMap: Record<Phase, number> = {
    in: 1.5,
    hold: 1.5,
    out: 0.6,
    rest: 0.6,
  };

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="absolute inset-0 bg-black/70 backdrop-blur-md" onClick={onClose} />
      <motion.div
        className="relative w-full max-w-md rounded-3xl backdrop-blur-2xl p-8 shadow-2xl flex flex-col items-center"
        style={{ background: theme.cardBg, border: theme.cardBorder }}
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full"
          style={{ color: theme.labelColor, background: theme.accentSoft }}
        >
          <X size={18} />
        </button>

        <h2 className="text-lg font-bold mb-1 text-center" style={{ color: theme.digitColor, fontFamily: theme.font }}>
          {t.breathingTitle}
        </h2>
        <p className="text-sm mb-8 text-center" style={{ color: theme.labelColor }}>
          {t.breathingSubtitle}
        </p>

        {!active ? (
          <button
            onClick={() => {
              setActive(true);
              setCycle(0);
            }}
            className="px-8 py-3 rounded-full text-sm font-bold transition-all hover:scale-105"
            style={{ background: theme.accent, color: '#000' }}
          >
            {t.startBreathing}
          </button>
        ) : (
          <>
            <div className="relative w-48 h-48 flex items-center justify-center mb-6">
              <motion.div
                className="absolute inset-0 rounded-full"
                style={{
                  background: `radial-gradient(circle, ${theme.accent}30, transparent)`,
                  border: `2px solid ${theme.accent}40`,
                }}
                animate={{ scale: scaleMap[phase] }}
                transition={{ duration: PHASE_DURATIONS[phase], ease: 'easeInOut' }}
              />
              <motion.div
                className="absolute rounded-full"
                style={{
                  width: '60%',
                  height: '60%',
                  background: `radial-gradient(circle, ${theme.accent}50, ${theme.accent}20)`,
                  boxShadow: `0 0 30px ${theme.accent}40`,
                }}
                animate={{ scale: scaleMap[phase] }}
                transition={{ duration: PHASE_DURATIONS[phase], ease: 'easeInOut' }}
              />
              <span className="relative z-10 text-lg font-bold" style={{ color: theme.digitColor }}>
                {phaseLabel[phase]}
              </span>
            </div>
            <div className="text-xs" style={{ color: theme.labelColor }}>
              4-7-8 · {cycle > 0 ? (lang === 'tr' ? `Tur ${cycle}` : `Round ${cycle}`) : ''}
            </div>
          </>
        )}
      </motion.div>
    </motion.div>
  );
}
