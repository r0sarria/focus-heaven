import { useRef } from 'react';
import { motion } from 'framer-motion';
import { X, Share2, Download, RotateCcw } from 'lucide-react';
import type { Theme } from './themes';
import type { Strings } from './i18n';

interface Props {
  theme: Theme;
  t: Strings;
  durationMin: number;
  taskName: string;
  streak: number;
  todayMinutes: number;
  onClose: () => void;
  onNewSession: () => void;
}

export default function ShareCard({
  theme,
  t,
  durationMin,
  taskName,
  streak,
  todayMinutes,
  onClose,
  onNewSession,
}: Props) {
  const cardRef = useRef<HTMLDivElement>(null);

  const handleDownload = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 1080;
    canvas.height = 1920;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Background gradient
    const grad = ctx.createLinearGradient(0, 0, 0, 1920);
    grad.addColorStop(0, '#1a1a2e');
    grad.addColorStop(1, '#0a0a0f');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 1080, 1920);

    // Accent glow circle
    ctx.fillStyle = theme.accent + '15';
    ctx.beginPath();
    ctx.arc(540, 600, 300, 0, Math.PI * 2);
    ctx.fill();

    // Title
    ctx.fillStyle = theme.digitColor;
    ctx.font = 'bold 64px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(t.shareCardTitle, 540, 400);

    // Subtitle
    ctx.fillStyle = theme.labelColor;
    ctx.font = '36px sans-serif';
    ctx.fillText(t.shareCardSubtitle, 540, 470);

    // Duration
    ctx.fillStyle = theme.accent;
    ctx.font = 'bold 120px sans-serif';
    ctx.fillText(`${durationMin}`, 540, 750);
    ctx.fillStyle = theme.labelColor;
    ctx.font = '40px sans-serif';
    ctx.fillText(t.minutesUnit, 540, 810);

    // Task name
    if (taskName) {
      ctx.fillStyle = theme.digitColor;
      ctx.font = '40px sans-serif';
      ctx.fillText(`${t.focusTask}: ${taskName}`, 540, 920);
    }

    // Streak
    ctx.fillStyle = theme.accent;
    ctx.font = 'bold 48px sans-serif';
    ctx.fillText(`${streak} ${t.dayStreak}`, 540, 1050);

    // Today minutes
    ctx.fillStyle = theme.labelColor;
    ctx.font = '36px sans-serif';
    ctx.fillText(`${t.todayMinutes}: ${todayMinutes} ${t.minutesUnit}`, 540, 1120);

    // App name
    ctx.fillStyle = theme.digitColor;
    ctx.font = 'bold 44px sans-serif';
    ctx.fillText('Focus Heaven', 540, 1800);

    // Download
    canvas.toBlob((blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'focusheaven-share.png';
      a.click();
      URL.revokeObjectURL(url);
    });
  };

  const handleShare = async () => {
    const canvas = document.createElement('canvas');
    canvas.width = 1080;
    canvas.height = 1920;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const grad = ctx.createLinearGradient(0, 0, 0, 1920);
    grad.addColorStop(0, '#1a1a2e');
    grad.addColorStop(1, '#0a0a0f');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 1080, 1920);

    ctx.fillStyle = theme.digitColor;
    ctx.font = 'bold 64px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(t.shareCardTitle, 540, 400);
    ctx.fillStyle = theme.labelColor;
    ctx.font = '36px sans-serif';
    ctx.fillText(t.shareCardSubtitle, 540, 470);
    ctx.fillStyle = theme.accent;
    ctx.font = 'bold 120px sans-serif';
    ctx.fillText(`${durationMin}`, 540, 750);
    ctx.fillStyle = theme.labelColor;
    ctx.font = '40px sans-serif';
    ctx.fillText(t.minutesUnit, 540, 810);
    if (taskName) {
      ctx.fillStyle = theme.digitColor;
      ctx.font = '40px sans-serif';
      ctx.fillText(`${t.focusTask}: ${taskName}`, 540, 920);
    }
    ctx.fillStyle = theme.accent;
    ctx.font = 'bold 48px sans-serif';
    ctx.fillText(`${streak} ${t.dayStreak}`, 540, 1050);
    ctx.fillStyle = theme.labelColor;
    ctx.font = '36px sans-serif';
    ctx.fillText(`${t.todayMinutes}: ${todayMinutes} ${t.minutesUnit}`, 540, 1120);
    ctx.fillStyle = theme.digitColor;
    ctx.font = 'bold 44px sans-serif';
    ctx.fillText('Focus Heaven', 540, 1800);

    canvas.toBlob(async (blob) => {
      if (!blob) return;
      const file = new File([blob], 'focusheaven-share.png', { type: 'image/png' });
      if (navigator.share && navigator.canShare?.({ files: [file] })) {
        try {
          await navigator.share({ files: [file], title: t.shareCardTitle, text: t.shareCardSubtitle });
        } catch {
          // user cancelled
        }
      } else {
        handleDownload();
      }
    });
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
        className="relative w-full max-w-sm rounded-3xl backdrop-blur-2xl p-6 shadow-2xl flex flex-col items-center"
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

        {/* Visual share card preview */}
        <div
          ref={cardRef}
          className="w-full aspect-[9/16] rounded-2xl overflow-hidden relative mb-5 flex flex-col items-center justify-center"
          style={{ background: `linear-gradient(180deg, #1a1a2e, #0a0a0f)` }}
        >
          <div
            className="absolute rounded-full blur-3xl"
            style={{
              width: '60%',
              height: '30%',
              background: `${theme.accent}20`,
              top: '25%',
            }}
          />
          <div className="relative z-10 flex flex-col items-center text-center px-6">
            <div className="text-xs uppercase tracking-widest mb-2" style={{ color: theme.labelColor }}>
              {t.shareCardSubtitle}
            </div>
            <div className="text-lg font-bold mb-4" style={{ color: theme.digitColor }}>
              {t.shareCardTitle}
            </div>
            <div className="text-6xl font-bold mb-1" style={{ color: theme.accent, fontFamily: theme.font }}>
              {durationMin}
            </div>
            <div className="text-sm mb-4" style={{ color: theme.labelColor }}>
              {t.minutesUnit}
            </div>
            {taskName && (
              <div className="text-sm mb-3" style={{ color: theme.digitColor }}>
                {t.focusTask}: {taskName}
              </div>
            )}
            <div className="flex gap-4 text-xs" style={{ color: theme.labelColor }}>
              <span>{streak} {t.dayStreak}</span>
              <span>·</span>
              <span>{t.todayMinutes}: {todayMinutes} {t.minutesUnit}</span>
            </div>
            <div className="mt-6 text-sm font-bold" style={{ color: theme.digitColor }}>
              Focus Heaven
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex gap-3 w-full">
          <button
            onClick={handleShare}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all hover:scale-105"
            style={{ background: theme.accent, color: '#000' }}
          >
            <Share2 size={16} />
            {t.share}
          </button>
          <button
            onClick={handleDownload}
            className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-medium transition-all hover:scale-105"
            style={{ background: theme.accentSoft, color: theme.digitColor, border: `1px solid ${theme.accent}40` }}
          >
            <Download size={16} />
          </button>
        </div>
        <button
          onClick={onNewSession}
          className="mt-3 flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-sm font-medium transition-all hover:scale-105"
          style={{ color: theme.labelColor }}
        >
          <RotateCcw size={14} />
          {t.newSession}
        </button>
      </motion.div>
    </motion.div>
  );
}
