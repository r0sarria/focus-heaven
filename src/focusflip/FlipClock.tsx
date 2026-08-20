import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Theme } from './themes';
import type { Strings } from './i18n';

interface FlipUnitProps {
  value: string;
  label: string;
  theme: Theme;
  size: 'large' | 'small';
}

function FlipUnit({ value, label, theme, size }: FlipUnitProps) {
  const [displayValue, setDisplayValue] = useState(value);
  const [previousValue, setPreviousValue] = useState(value);
  const [flipping, setFlipping] = useState(false);

  useEffect(() => {
    if (value !== displayValue) {
      setPreviousValue(displayValue);
      setDisplayValue(value);
      setFlipping(true);
      const t = setTimeout(() => setFlipping(false), 600);
      return () => clearTimeout(t);
    }
    return undefined;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  // Sizing — tall, spacious rectangular cards
  const cardW =
    size === 'large'
      ? 'w-[clamp(3.5rem,11vw,8.5rem)] sm:w-[clamp(4.5rem,14vw,11rem)] md:w-[clamp(5rem,12vw,13rem)]'
      : 'w-[clamp(2.5rem,8vw,5.5rem)] sm:w-[clamp(3rem,10vw,7rem)] md:w-[clamp(3.5rem,9vw,8.5rem)]';

  const cardH =
    size === 'large'
      ? 'h-[clamp(5.5rem,17vw,13rem)] sm:h-[clamp(7rem,22vw,17rem)] md:h-[clamp(8rem,19vw,20rem)]'
      : 'h-[clamp(4rem,13vw,9rem)] sm:h-[clamp(5rem,16vw,11.5rem)] md:h-[clamp(6rem,14vw,13.5rem)]';

  const fontSize =
    size === 'large'
      ? 'text-[clamp(2.4rem,7vw,5.6rem)] sm:text-[clamp(3.2rem,9.5vw,7.5rem)] md:text-[clamp(3.6rem,8vw,8.6rem)]'
      : 'text-[clamp(1.8rem,5.5vw,4rem)] sm:text-[clamp(2.2rem,7vw,5.2rem)] md:text-[clamp(2.6rem,6.2vw,6rem)]';


  return (
    <div className="flex flex-col items-center gap-2 select-none">
      <div
        className={`relative ${cardW} ${cardH} ${theme.cardRounded} overflow-hidden`}
        style={{
          background: theme.cardBg,
          border: theme.cardBorder,
          boxShadow: theme.cardShadow,
          perspective: '800px',
        }}
      >
        {/* Center divider */}
        <div
          className="absolute left-0 right-0 top-1/2 h-[2px] z-30 pointer-events-none"
          style={{
            background: 'rgba(0,0,0,0.5)',
            boxShadow: '0 1px 2px rgba(255,255,255,0.04)',
          }}
        />

        {/* Static top half — shows current value */}
        <div
          className="absolute top-0 left-0 right-0 h-1/2 overflow-hidden flex items-end justify-center"
          style={{ background: theme.cardBgTop }}
        >
          <span
            className={`font-bold leading-none ${fontSize}`}
            style={{
              color: theme.digitColor,
              textShadow: theme.digitShadow,
              fontFamily: theme.font,
              fontWeight: theme.fontWeight,
              transform: 'translateY(50%)',
            }}
          >
            {displayValue}
          </span>
        </div>

        {/* Static bottom half — shows previous value until flip completes */}
        <div
          className="absolute bottom-0 left-0 right-0 h-1/2 overflow-hidden flex items-start justify-center"
          style={{ background: theme.cardBgBottom }}
        >
          <span
            className={`font-bold leading-none ${fontSize}`}
            style={{
              color: theme.digitColor,
              textShadow: theme.digitShadow,
              fontFamily: theme.font,
              fontWeight: theme.fontWeight,
              transform: 'translateY(-50%)',
            }}
          >
            {flipping ? previousValue : displayValue}
          </span>
        </div>

        {/* Flipping top — rotates from 0 to -180deg */}
        <AnimatePresence>
          {flipping && (
            <motion.div
              className="absolute top-0 left-0 right-0 h-1/2 overflow-hidden flex items-end justify-center origin-top z-20"
              style={{ background: theme.cardBgTop }}
              initial={{ rotateX: 0 }}
              animate={{ rotateX: -180 }}
              transition={{ duration: 0.3, ease: 'easeIn' }}
            >
              <span
                className={`font-bold leading-none ${fontSize}`}
                style={{
                  color: theme.digitColor,
                  textShadow: theme.digitShadow,
                  fontFamily: theme.font,
                  fontWeight: theme.fontWeight,
                  transform: 'translateY(50%)',
                  backfaceVisibility: 'hidden',
                }}
              >
                {previousValue}
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Flipping bottom — rotates from 180 to 0deg, revealing new value */}
        <AnimatePresence>
          {flipping && (
            <motion.div
              className="absolute bottom-0 left-0 right-0 h-1/2 overflow-hidden flex items-start justify-center origin-bottom z-20"
              style={{
                background: theme.cardBgBottom,
                backfaceVisibility: 'hidden',
              }}
              initial={{ rotateX: 180 }}
              animate={{ rotateX: 0 }}
              transition={{ duration: 0.3, ease: 'easeOut', delay: 0.3 }}
            >
              <span
                className={`font-bold leading-none ${fontSize}`}
                style={{
                  color: theme.digitColor,
                  textShadow: theme.digitShadow,
                  fontFamily: theme.font,
                  fontWeight: theme.fontWeight,
                  transform: 'translateY(-50%)',
                  backfaceVisibility: 'hidden',
                }}
              >
                {displayValue}
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      {/* Minimal label */}
      <span
        className="text-[10px] sm:text-xs font-semibold uppercase tracking-[0.15em]"
        style={{ color: theme.labelColor }}
      >
        {label}
      </span>
    </div>
  );
}

interface FlipClockProps {
  hours: string;
  minutes: string;
  seconds: string;
  theme: Theme;
  showSeconds: boolean;
  strings: Strings;
}

export default function FlipClock({
  hours,
  minutes,
  seconds,
  theme,
  showSeconds,
  strings,
}: FlipClockProps) {
  const colonSize = 'text-[clamp(2.5rem,8vw,6rem)] sm:text-[clamp(3rem,10vw,8rem)] md:text-[clamp(3.5rem,9vw,9rem)]';

  return (
    <div className="flex items-center justify-center gap-1.5 sm:gap-2.5 md:gap-3.5">
      <FlipUnit value={hours} label={strings.h} theme={theme} size="large" />
      <div className="flex items-center justify-center pb-8">
        <span
          className={`font-bold leading-none ${colonSize}`}
          style={{
            color: theme.digitColor,
            textShadow: theme.digitShadow,
            fontFamily: theme.font,
            opacity: 0.6,
          }}
        >
          :
        </span>
      </div>
      <FlipUnit value={minutes} label={strings.m} theme={theme} size="large" />
      {showSeconds && (
        <>
          <div className="flex items-center justify-center pb-8">
            <span
              className={`font-bold leading-none ${colonSize}`}
              style={{
                color: theme.digitColor,
                textShadow: theme.digitShadow,
                fontFamily: theme.font,
                opacity: 0.4,
              }}
            >
              :
            </span>
          </div>
          <FlipUnit value={seconds} label={strings.s} theme={theme} size="small" />
        </>
      )}
    </div>
  );
}
