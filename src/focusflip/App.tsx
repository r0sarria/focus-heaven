import { useCallback, useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Play, Pause, RotateCcw, Settings as SettingsIcon, Maximize, Minimize,
  Music, X, Timer, Watch, ChevronDown, Palette, Check, Bell, Volume2,
  CloudRain, Waves, Wind, Flame, Coffee, Bird, Languages, Sparkles,
  Heart, Share2,
} from 'lucide-react';
import FlipClock from './FlipClock';
import ScenicBackground from './ScenicBackground';
import BreathingCircle from './BreathingCircle';
import ShareCard from './ShareCard';
import { themes, themeMap, type ThemeId, type MusicGenre } from './themes';
import { translations, type Lang, type Strings } from './i18n';
import { audioEngine, type AmbientId } from './audio';

type Mode = 'stopwatch' | 'countdown';

interface StreakData {
  lastActiveDate: string;
  currentStreak: number;
  todayMinutes: number;
  todayDate: string;
}

interface Settings {
  themeId: ThemeId;
  lang: Lang;
  mode: Mode;
  focusMinutes: number;
  breakMinutes: number;
  showSeconds: boolean;
  quotesEnabled: boolean;
  quoteIntervalMin: number;
  musicVolume: number;
  masterVolume: number;
  musicGenre: MusicGenre;
  musicEnabled: boolean;
  ambientVolumes: Record<AmbientId, number>;
  ambientActive: Record<AmbientId, boolean>;
  customSeconds: number;
  recentTimers: number[];
  focusTask: string;
}

const DEFAULT_SETTINGS: Settings = {
  themeId: 'lofi',
  lang: 'tr',
  mode: 'countdown',
  focusMinutes: 25,
  breakMinutes: 5,
  showSeconds: true,
  quotesEnabled: true,
  quoteIntervalMin: 20,
  musicVolume: 0.5,
  masterVolume: 0.6,
  musicGenre: 'lofi',
  musicEnabled: false,
  ambientVolumes: { rain: 0.5, river: 0.5, wind: 0.5, fireplace: 0.5, cafe: 0.5, birds: 0.5 },
  ambientActive: { rain: false, river: false, wind: false, fireplace: false, cafe: false, birds: false },
  customSeconds: 0,
  recentTimers: [],
  focusTask: '',
};

const STORAGE_KEY = 'focusflip-v3-settings';
const STREAK_KEY = 'focusflip-v3-streak';

function loadSettings(): Settings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch { /* noop */ }
  return DEFAULT_SETTINGS;
}

function loadStreak(): StreakData {
  try {
    const raw = localStorage.getItem(STREAK_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* noop */ }
  const today = new Date().toISOString().split('T')[0]!;
  return { lastActiveDate: '', currentStreak: 0, todayMinutes: 0, todayDate: today };
}

function formatTime(totalSeconds: number) {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  return { h: String(h).padStart(2, '0'), m: String(m).padStart(2, '0'), s: String(s).padStart(2, '0') };
}

const AMBIENT_META: { id: AmbientId; icon: typeof CloudRain }[] = [
  { id: 'rain', icon: CloudRain }, { id: 'river', icon: Waves }, { id: 'wind', icon: Wind },
  { id: 'fireplace', icon: Flame }, { id: 'cafe', icon: Coffee }, { id: 'birds', icon: Bird },
];

const MUSIC_GENRES: { id: MusicGenre; key: keyof Strings }[] = [
  { id: 'lofi', key: 'lofiChill' }, { id: 'synthwave', key: 'synthwave' },
  { id: 'acoustic', key: 'acoustic' }, { id: 'zen', key: 'zenDrone' },
];

export default function App() {
  const [settings, setSettings] = useState<Settings>(loadSettings);
  const [streakData, setStreakData] = useState<StreakData>(loadStreak);
  const [running, setRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [isBreak, setIsBreak] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showThemes, setShowThemes] = useState(false);
  const [showSound, setShowSound] = useState(false);
  const [showCustomTime, setShowCustomTime] = useState(false);
  const [showBreathing, setShowBreathing] = useState(false);
  const [showShareCard, setShowShareCard] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [phaseComplete, setPhaseComplete] = useState(false);
  const [quote, setQuote] = useState<string | null>(null);
  const [customH, setCustomH] = useState(0);
  const [customM, setCustomM] = useState(25);
  const [customS, setCustomS] = useState(0);
  const [controlsVisible, setControlsVisible] = useState(true);
  const [completedDuration, setCompletedDuration] = useState(0);

  const theme = themeMap[settings.themeId] ?? themeMap.lofi;
  const t = translations[settings.lang];
  const intervalRef = useRef<number | null>(null);
  const quoteTimerRef = useRef<number | null>(null);
  const wakeLockRef = useRef<any>(null);
  const controlsTimerRef = useRef<number | null>(null);
  const tapRef = useRef<{ count: number; timer: number | null }>({ count: 0, timer: null });
  const audioWasPlayingRef = useRef(false);

  // Persist settings
  useEffect(() => { localStorage.setItem(STORAGE_KEY, JSON.stringify(settings)); }, [settings]);
  useEffect(() => { localStorage.setItem(STREAK_KEY, JSON.stringify(streakData)); }, [streakData]);

  // Apply volumes
  useEffect(() => {
    audioEngine.setMasterVolume(settings.masterVolume);
    audioEngine.setMusicVolume(settings.musicVolume);
  }, [settings.masterVolume, settings.musicVolume]);

  useEffect(() => {
    AMBIENT_META.forEach(({ id }) => audioEngine.setAmbientVolume(id, settings.ambientVolumes[id]));
  }, [settings.ambientVolumes]);

  // Music playback
  useEffect(() => {
    if (settings.musicEnabled) audioEngine.playMusic(settings.musicGenre);
    else audioEngine.stopMusic();
  }, [settings.musicEnabled, settings.musicGenre]);

  // Ambient toggles
  useEffect(() => {
    AMBIENT_META.forEach(({ id }) => audioEngine.toggleAmbient(id, settings.ambientActive[id]));
  }, [settings.ambientActive]);

  // CRITICAL: Sync audio with timer running state
  useEffect(() => {
    if (running) {
      audioEngine.resumeAll();
    } else {
      audioEngine.pauseAll();
    }
  }, [running]);

  // Fullscreen detection
  useEffect(() => {
    const handler = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handler);
    return () => document.removeEventListener('fullscreenchange', handler);
  }, []);

  // Screen Wake Lock
  useEffect(() => {
    if (running && 'wakeLock' in navigator) {
      navigator.wakeLock.request('screen')
        .then((lock: any) => { wakeLockRef.current = lock; })
        .catch(() => {});
    }
    return () => {
      if (wakeLockRef.current) {
        try { wakeLockRef.current.release(); } catch { /* noop */ }
        wakeLockRef.current = null;
      }
    };
  }, [running]);

  // Initialize timer on mode change
  useEffect(() => {
    setRunning(false);
    setPhaseComplete(false);
    setElapsed(settings.mode === 'countdown' ? settings.focusMinutes * 60 : 0);
    setIsBreak(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [settings.mode]);

  // Reset when focus/break changes (not running)
  useEffect(() => {
    if (settings.mode === 'countdown' && !running) {
      setElapsed(isBreak ? settings.breakMinutes * 60 : settings.focusMinutes * 60);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [settings.focusMinutes, settings.breakMinutes]);

  // Timer loop
  useEffect(() => {
    if (!running) {
      if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null; }
      return;
    }
    intervalRef.current = window.setInterval(() => {
      setElapsed((prev) => {
        if (settings.mode === 'stopwatch') return prev + 1;
        const next = prev - 1;
        if (next <= 0) {
          setRunning(false);
          setPhaseComplete(true);
          audioEngine.playCompletionChime();
          if (!isBreak) {
            const dur = settings.focusMinutes;
            setCompletedDuration(dur);
            // Update streak
            updateStreakOnComplete(dur);
            setSettings((s) => ({
              ...s,
              recentTimers: [dur, ...s.recentTimers.filter((tm) => tm !== dur)].slice(0, 5),
            }));
            setShowShareCard(true);
          }
          if (!isBreak) { setIsBreak(true); setElapsed(settings.breakMinutes * 60); }
          else { setIsBreak(false); setElapsed(settings.focusMinutes * 60); }
          return 0;
        }
        return next;
      });
    }, 1000);
    return () => { if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null; } };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running, settings.mode, isBreak]);

  // Motivation quotes
  useEffect(() => {
    if (quoteTimerRef.current) { clearInterval(quoteTimerRef.current); quoteTimerRef.current = null; }
    if (!settings.quotesEnabled || !running) return;
    const intervalMs = settings.quoteIntervalMin * 60 * 1000;
    quoteTimerRef.current = window.setInterval(() => {
      const quotes = translations[settings.lang].quotes;
      setQuote(quotes[Math.floor(Math.random() * quotes.length)] ?? null);
      setTimeout(() => setQuote(null), 6000);
    }, intervalMs);
    return () => { if (quoteTimerRef.current) { clearInterval(quoteTimerRef.current); quoteTimerRef.current = null; } };
  }, [settings.quotesEnabled, settings.quoteIntervalMin, settings.lang, running]);

  // Auto-hide controls in landscape after 4s
  useEffect(() => {
    const checkLandscape = () => {
      const isLandscape = window.innerWidth > window.innerHeight && window.innerWidth > 768;
      if (isLandscape && running) {
        if (controlsTimerRef.current) clearTimeout(controlsTimerRef.current);
        controlsTimerRef.current = window.setTimeout(() => setControlsVisible(false), 4000);
      } else {
        setControlsVisible(true);
      }
    };
    checkLandscape();
    window.addEventListener('resize', checkLandscape);
    return () => window.removeEventListener('resize', checkLandscape);
  }, [running]);

  const resetControlsTimer = useCallback(() => {
    setControlsVisible(true);
    if (controlsTimerRef.current) clearTimeout(controlsTimerRef.current);
    const isLandscape = window.innerWidth > window.innerHeight && window.innerWidth > 768;
    if (isLandscape && running) {
      controlsTimerRef.current = window.setTimeout(() => setControlsVisible(false), 4000);
    }
  }, [running]);

  const updateStreakOnComplete = (durationMin: number) => {
    const today = new Date().toISOString().split('T')[0]!;
    setStreakData((prev) => {
      let newStreak = prev.currentStreak;
      let todayMin = prev.todayMinutes;
      if (prev.todayDate !== today) {
        // New day — check if streak continues
        const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
        if (prev.lastActiveDate === yesterday) {
          newStreak = prev.currentStreak + 1;
        } else if (prev.lastActiveDate !== today) {
          newStreak = 1;
        }
        todayMin = 0;
      } else if (prev.currentStreak === 0) {
        newStreak = 1;
      }
      return {
        lastActiveDate: today,
        currentStreak: newStreak,
        todayMinutes: todayMin + durationMin,
        todayDate: today,
      };
    });
  };

  const handlePlayPause = useCallback(() => {
    audioEngine.setMasterVolume(settings.masterVolume);
    setRunning((r) => !r);
    setPhaseComplete(false);
    resetControlsTimer();
  }, [settings.masterVolume, resetControlsTimer]);

  const handleReset = useCallback(() => {
    setRunning(false);
    setPhaseComplete(false);
    setShowShareCard(false);
    if (settings.mode === 'countdown') {
      setElapsed(isBreak ? settings.breakMinutes * 60 : settings.focusMinutes * 60);
    } else {
      setElapsed(0);
    }
    resetControlsTimer();
  }, [settings.mode, settings.focusMinutes, settings.breakMinutes, isBreak, resetControlsTimer]);

  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) document.documentElement.requestFullscreen?.().catch(() => {});
    else document.exitFullscreen?.().catch(() => {});
  }, []);

  const toggleMode = useCallback(() => {
    setSettings((s) => ({ ...s, mode: s.mode === 'stopwatch' ? 'countdown' : 'stopwatch' }));
  }, []);

  const toggleLang = useCallback(() => {
    setSettings((s) => ({ ...s, lang: s.lang === 'tr' ? 'en' : 'tr' }));
  }, []);

  const updateSetting = <K extends keyof Settings>(key: K, value: Settings[K]) => {
    setSettings((s) => ({ ...s, [key]: value }));
  };

  const handleCustomTime = useCallback(() => {
    const totalSec = customH * 3600 + customM * 60 + customS;
    if (totalSec <= 0) return;
    setSettings((s) => ({ ...s, focusMinutes: Math.floor(totalSec / 60), customSeconds: totalSec % 60 }));
    setElapsed(totalSec);
    setShowCustomTime(false);
  }, [customH, customM, customS]);

  // Double-tap handler
  const handleScreenTap = useCallback(() => {
    const tap = tapRef.current;
    tap.count++;
    if (tap.timer) clearTimeout(tap.timer);
    tap.timer = window.setTimeout(() => { tap.count = 0; }, 300);

    if (tap.count === 2) {
      tap.count = 0;
      if (tap.timer) { clearTimeout(tap.timer); tap.timer = null; }
      handlePlayPause();
    }
  }, [handlePlayPause]);

  const displayTime = settings.mode === 'stopwatch' ? elapsed : Math.max(0, elapsed);
  const { h, m, s } = formatTime(displayTime);

  const anyAudioActive = settings.musicEnabled || Object.values(settings.ambientActive).some(Boolean);

  return (
    <div
      className="relative min-h-screen w-full overflow-hidden flex flex-col"
      style={{ fontFamily: theme.font }}
      onPointerDown={handleScreenTap}
    >
      <ScenicBackground theme={theme} />

      {/* Top bar */}
      <div
        className="relative z-10 flex items-center justify-between px-4 sm:px-6 py-4 transition-all duration-300"
        style={{ opacity: controlsVisible ? 1 : 0, pointerEvents: controlsVisible ? 'auto' : 'none' }}
      >
        <button
          onClick={(e) => { e.stopPropagation(); toggleMode(); }}
          className="flex items-center gap-2 px-3 py-2 rounded-full backdrop-blur-md transition-all hover:scale-105"
          style={{ background: theme.accentSoft, border: `1px solid ${theme.accent}40`, color: theme.digitColor }}
        >
          {settings.mode === 'stopwatch' ? <Watch size={16} /> : <Timer size={16} />}
          <span className="text-xs sm:text-sm font-medium">{settings.mode === 'stopwatch' ? t.stopwatch : t.countdown}</span>
        </button>

        {/* Streak badge */}
        <div
          className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full backdrop-blur-md"
          style={{ background: theme.accentSoft, border: `1px solid ${theme.accent}30` }}
        >
          <span className="text-xs font-bold" style={{ color: theme.accent }}>{streakData.currentStreak}</span>
          <span className="text-[10px]" style={{ color: theme.labelColor }}>{t.dayStreak}</span>
          <span className="w-px h-3" style={{ background: `${theme.accent}30` }} />
          <span className="text-xs font-bold" style={{ color: theme.accent }}>{streakData.todayMinutes}</span>
          <span className="text-[10px]" style={{ color: theme.labelColor }}>{t.minutesUnit}</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={(e) => { e.stopPropagation(); toggleLang(); }}
            className="flex items-center gap-1.5 px-3 py-2 rounded-full backdrop-blur-md transition-all hover:scale-105"
            style={{ background: theme.accentSoft, border: `1px solid ${theme.accent}40`, color: theme.digitColor }}
            aria-label={t.language}
          >
            <Languages size={16} />
            <span className="text-xs sm:text-sm font-bold uppercase">{settings.lang}</span>
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); setShowThemes(true); }}
            className="p-2.5 rounded-full backdrop-blur-md transition-all hover:scale-110"
            style={{ background: theme.accentSoft, border: `1px solid ${theme.accent}40`, color: theme.digitColor }}
            aria-label={t.themes}
          >
            <Palette size={18} />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); toggleFullscreen(); }}
            className="p-2.5 rounded-full backdrop-blur-md transition-all hover:scale-110"
            style={{ background: theme.accentSoft, border: `1px solid ${theme.accent}40`, color: theme.digitColor }}
            aria-label={isFullscreen ? t.exitFullscreen : t.fullscreen}
          >
            {isFullscreen ? <Minimize size={18} /> : <Maximize size={18} />}
          </button>
        </div>
      </div>

      {/* Phase indicator */}
      {settings.mode === 'countdown' && (
        <div className="relative z-10 flex justify-center">
          <div
            className="flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-medium"
            style={{ background: theme.accentSoft, border: `1px solid ${theme.accent}30`, color: isBreak ? theme.accent : theme.labelColor }}
          >
            <Bell size={12} />
            {isBreak ? t.breakTime : t.focusSession}
          </div>
        </div>
      )}

      {/* Main clock display */}
      <div className="relative z-10 flex-1 flex items-center justify-center px-2 py-4">
        <FlipClock hours={h} minutes={m} seconds={s} theme={theme} showSeconds={settings.showSeconds} strings={t} />
      </div>

      {/* Focus task input */}
      <div
        className="relative z-10 flex justify-center px-4 pb-2 transition-all duration-300"
        style={{ opacity: controlsVisible ? 1 : 0 }}
      >
        <input
          type="text"
          value={settings.focusTask}
          onChange={(e) => updateSetting('focusTask', e.target.value)}
          placeholder={t.focusTaskPlaceholder}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-md text-center text-sm py-2 px-4 rounded-full backdrop-blur-md outline-none transition-all"
          style={{
            background: theme.accentSoft,
            border: `1px solid ${theme.accent}30`,
            color: theme.digitColor,
          }}
        />
      </div>

      {/* Breathing button */}
      <div
        className="relative z-10 flex justify-center pb-2 transition-all duration-300"
        style={{ opacity: controlsVisible ? 1 : 0 }}
      >
        <button
          onClick={(e) => { e.stopPropagation(); setShowBreathing(true); }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium backdrop-blur-md transition-all hover:scale-105"
          style={{ background: theme.accentSoft, border: `1px solid ${theme.accent}30`, color: theme.labelColor }}
        >
          <Heart size={12} />
          {t.breathingSubtitle}
        </button>
      </div>

      {/* Phase complete flash */}
      <AnimatePresence>
        {phaseComplete && (
          <motion.div
            className="absolute inset-0 z-40 flex items-center justify-center pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.25, 0] }}
            transition={{ duration: 1.5, repeat: 2 }}
            style={{ background: theme.accent }}
          />
        )}
      </AnimatePresence>

      {/* Floating dock */}
      <div
        className="relative z-10 flex items-center justify-center px-4 pb-5 pt-2 transition-all duration-300"
        style={{ opacity: controlsVisible ? 1 : 0, pointerEvents: controlsVisible ? 'auto' : 'none' }}
        onPointerMove={resetControlsTimer}
      >
        <div
          className="flex items-center gap-2 sm:gap-3 px-3 py-2.5 rounded-2xl backdrop-blur-xl"
          style={{ background: theme.cardBg, border: theme.cardBorder, boxShadow: theme.cardShadow }}
        >
          <DockButton theme={theme} onClick={(e) => { e.stopPropagation(); handleReset(); }} label={t.reset}>
            <RotateCcw size={20} />
          </DockButton>
          <button
            onClick={(e) => { e.stopPropagation(); handlePlayPause(); }}
            className="p-3.5 rounded-full transition-all hover:scale-110 active:scale-95"
            style={{ background: theme.accent, color: '#000', boxShadow: theme.cardGlow }}
            aria-label={running ? t.pause : t.start}
          >
            {running ? <Pause size={24} /> : <Play size={24} className="ml-0.5" />}
          </button>
          <DockButton theme={theme} onClick={(e) => { e.stopPropagation(); setShowSound(true); }} label={t.soundMixer} active={anyAudioActive}>
            <Music size={20} />
          </DockButton>
          {settings.mode === 'countdown' && (
            <DockButton theme={theme} onClick={(e) => { e.stopPropagation(); setShowCustomTime(true); }} label={t.customTime}>
              <Timer size={20} />
            </DockButton>
          )}
          <DockButton theme={theme} onClick={(e) => { e.stopPropagation(); setShowSettings(true); }} label={t.settings}>
            <SettingsIcon size={20} />
          </DockButton>
        </div>
      </div>

      {/* Motivation quote toast */}
      <AnimatePresence>
        {quote && (
          <motion.div
            className="fixed bottom-28 left-1/2 -translate-x-1/2 z-30 w-[90%] max-w-md"
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.95 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex items-center gap-3 px-5 py-4 rounded-2xl backdrop-blur-xl shadow-2xl" style={{ background: theme.cardBg, border: theme.cardBorder }}>
              <Sparkles size={20} style={{ color: theme.accent, flexShrink: 0 }} />
              <p className="text-sm font-medium" style={{ color: theme.digitColor }}>{quote}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sound drawer */}
      <AnimatePresence>
        {showSound && (
          <Drawer onClose={() => setShowSound(false)} theme={theme} title={t.soundHub}>
            <div className="mb-5">
              <div className="flex items-center gap-2 mb-3">
                <Music size={14} style={{ color: theme.accent }} />
                <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: theme.labelColor }}>{t.musicPlayer}</span>
              </div>
              <div className="flex items-center gap-3 mb-3">
                <button
                  onClick={() => updateSetting('musicEnabled', !settings.musicEnabled)}
                  className="p-2.5 rounded-full transition-all hover:scale-105 flex-shrink-0"
                  style={{ background: settings.musicEnabled ? theme.accent : theme.accentSoft, color: settings.musicEnabled ? '#000' : theme.digitColor, border: `1px solid ${theme.accent}40` }}
                >
                  {settings.musicEnabled ? <Pause size={16} /> : <Play size={16} className="ml-0.5" />}
                </button>
                <div className="flex-1">
                  <div className="text-xs font-medium" style={{ color: theme.digitColor }}>{t[MUSIC_GENRES.find((g) => g.id === settings.musicGenre)?.key || 'lofiChill']}</div>
                  <div className="text-[10px]" style={{ color: theme.labelColor }}>{t.selectTrack}</div>
                </div>
                <Volume2 size={16} style={{ color: settings.musicEnabled ? theme.digitColor : theme.labelColor }} />
              </div>
              <div className="grid grid-cols-2 gap-2 mb-3">
                {MUSIC_GENRES.map((g) => (
                  <button
                    key={g.id}
                    onClick={() => { updateSetting('musicGenre', g.id); updateSetting('musicEnabled', true); }}
                    className="px-3 py-2 rounded-lg text-xs font-medium transition-all"
                    style={{ background: settings.musicGenre === g.id ? theme.accent : theme.accentSoft, color: settings.musicGenre === g.id ? '#000' : theme.digitColor, border: `1px solid ${theme.accent}40` }}
                  >
                    {t[g.key]}
                  </button>
                ))}
              </div>
              <SliderRow label={t.masterVolume} value={settings.musicVolume} onChange={(v) => updateSetting('musicVolume', v)} theme={theme} />
            </div>
            <div className="h-px mb-5" style={{ background: `${theme.accent}20` }} />
            <div>
              <div className="flex items-center gap-2 mb-3">
                <CloudRain size={14} style={{ color: theme.accent }} />
                <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: theme.labelColor }}>{t.ambientMixer}</span>
              </div>
              <div className="space-y-3">
                {AMBIENT_META.map(({ id, icon: Icon }) => (
                  <div key={id} className="flex items-center gap-3">
                    <button
                      onClick={() => updateSetting('ambientActive', { ...settings.ambientActive, [id]: !settings.ambientActive[id] })}
                      className="flex items-center gap-2 px-3 py-2 rounded-lg transition-all flex-shrink-0 min-w-[120px]"
                      style={{ background: settings.ambientActive[id] ? theme.accent : theme.accentSoft, color: settings.ambientActive[id] ? '#000' : theme.digitColor, border: `1px solid ${theme.accent}40` }}
                    >
                      <Icon size={14} />
                      <span className="text-xs font-medium">{t[id]}</span>
                    </button>
                    <input
                      type="range" min={0} max={1} step={0.05}
                      value={settings.ambientVolumes[id]}
                      onChange={(e) => updateSetting('ambientVolumes', { ...settings.ambientVolumes, [id]: parseFloat(e.target.value) })}
                      className="flex-1" style={{ accentColor: theme.accent }}
                      disabled={!settings.ambientActive[id]}
                    />
                  </div>
                ))}
              </div>
              <div className="mt-4 pt-4" style={{ borderTop: `1px solid ${theme.accent}20` }}>
                <SliderRow label={t.masterVolume} value={settings.masterVolume} onChange={(v) => updateSetting('masterVolume', v)} theme={theme} />
              </div>
            </div>
          </Drawer>
        )}
      </AnimatePresence>

      {/* Custom time modal */}
      <AnimatePresence>
        {showCustomTime && (
          <Modal onClose={() => setShowCustomTime(false)} theme={theme} title={t.setCustomTime} t={t}>
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div>
                <label className="text-[10px] uppercase tracking-wider mb-2 block" style={{ color: theme.labelColor }}>{t.hoursLabel}</label>
                <NumberStepper value={customH} onChange={setCustomH} min={0} max={23} theme={theme} />
              </div>
              <div>
                <label className="text-[10px] uppercase tracking-wider mb-2 block" style={{ color: theme.labelColor }}>{t.minutesLabel}</label>
                <NumberStepper value={customM} onChange={setCustomM} min={0} max={59} theme={theme} />
              </div>
              <div>
                <label className="text-[10px] uppercase tracking-wider mb-2 block" style={{ color: theme.labelColor }}>{t.secondsLabel}</label>
                <NumberStepper value={customS} onChange={setCustomS} min={0} max={59} theme={theme} />
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setShowCustomTime(false)} className="flex-1 py-3 rounded-xl text-sm font-medium transition-all" style={{ background: theme.accentSoft, color: theme.digitColor, border: `1px solid ${theme.accent}40` }}>{t.cancel}</button>
              <button onClick={handleCustomTime} className="flex-1 py-3 rounded-xl text-sm font-bold transition-all" style={{ background: theme.accent, color: '#000' }}>{t.set}</button>
            </div>
          </Modal>
        )}
      </AnimatePresence>

      {/* Settings modal */}
      <AnimatePresence>
        {showSettings && (
          <Modal onClose={() => setShowSettings(false)} theme={theme} title={t.settingsTitle} t={t}>
            <div className="space-y-5">
              <div>
                <Label theme={theme}>{t.timerMode}</Label>
                <div className="flex gap-2">
                  <ToggleButton active={settings.mode === 'stopwatch'} onClick={() => updateSetting('mode', 'stopwatch')} theme={theme}><Watch size={14} /> {t.stopwatch}</ToggleButton>
                  <ToggleButton active={settings.mode === 'countdown'} onClick={() => updateSetting('mode', 'countdown')} theme={theme}><Timer size={14} /> {t.countdown}</ToggleButton>
                </div>
              </div>
              {settings.mode === 'countdown' && (
                <div className="grid grid-cols-2 gap-4">
                  <div><Label theme={theme}>{t.focusDuration}</Label><NumberInput value={settings.focusMinutes} onChange={(v) => updateSetting('focusMinutes', Math.max(1, Math.min(180, v)))} theme={theme} /></div>
                  <div><Label theme={theme}>{t.breakDuration}</Label><NumberInput value={settings.breakMinutes} onChange={(v) => updateSetting('breakMinutes', Math.max(1, Math.min(60, v)))} theme={theme} /></div>
                </div>
              )}
              {settings.mode === 'countdown' && (
                <div>
                  <Label theme={theme}>{t.quickPresets}</Label>
                  <div className="flex flex-wrap gap-2">
                    {[15, 25, 50, 90].map((min) => (
                      <button key={min} onClick={() => updateSetting('focusMinutes', min)} className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all" style={{ background: settings.focusMinutes === min ? theme.accent : theme.accentSoft, color: settings.focusMinutes === min ? '#000' : theme.digitColor, border: `1px solid ${theme.accent}40` }}>{min}m</button>
                    ))}
                  </div>
                </div>
              )}
              <ToggleRow label={t.showSeconds} value={settings.showSeconds} onChange={(v) => updateSetting('showSeconds', v)} theme={theme} />
              <div>
                <ToggleRow label={t.motivationQuotes} value={settings.quotesEnabled} onChange={(v) => updateSetting('quotesEnabled', v)} theme={theme} />
                {settings.quotesEnabled && (
                  <div className="mt-3">
                    <Label theme={theme}>{t.quoteInterval}</Label>
                    <div className="flex flex-wrap gap-2">
                      {[10, 15, 20, 30, 45].map((min) => (
                        <button key={min} onClick={() => updateSetting('quoteIntervalMin', min)} className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all" style={{ background: settings.quoteIntervalMin === min ? theme.accent : theme.accentSoft, color: settings.quoteIntervalMin === min ? '#000' : theme.digitColor, border: `1px solid ${theme.accent}40` }}>{t.every} {min} {t.minutesUnit}</button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              {settings.recentTimers.length > 0 && (
                <div>
                  <Label theme={theme}>{t.recentSessions}</Label>
                  <div className="flex flex-wrap gap-2">
                    {settings.recentTimers.map((tm, i) => (
                      <span key={i} className="px-3 py-1 rounded-full text-xs" style={{ background: theme.accentSoft, color: theme.digitColor, border: `1px solid ${theme.accent}30` }}>{tm} {t.minutesUnit}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </Modal>
        )}
      </AnimatePresence>

      {/* Theme selector */}
      <AnimatePresence>
        {showThemes && (
          <Modal onClose={() => setShowThemes(false)} theme={theme} title={t.chooseVibe} t={t}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {themes.map((th) => (
                <button
                  key={th.id}
                  onClick={() => { updateSetting('themeId', th.id); updateSetting('musicGenre', th.defaultMusic); setShowThemes(false); }}
                  className="relative rounded-xl p-4 text-left transition-all hover:scale-[1.02] overflow-hidden h-32"
                  style={{ border: settings.themeId === th.id ? `2px solid ${th.accent}` : `1px solid ${th.accent}30` }}
                >
                  <img src={th.bgImage} alt="" className="absolute inset-0 w-full h-full object-cover" />
                  <div className="absolute inset-0" style={{ background: th.overlay }} />
                  <div className="relative flex items-center justify-between">
                    <div>
                      <div className="font-bold text-sm" style={{ color: th.digitColor, fontFamily: th.font }}>{th.name[settings.lang]}</div>
                      <div className="text-[10px] mt-0.5" style={{ color: th.labelColor }}>{th.tagline[settings.lang]}</div>
                    </div>
                    {settings.themeId === th.id && <div className="p-1 rounded-full" style={{ background: th.accent }}><Check size={14} color="#000" /></div>}
                  </div>
                </button>
              ))}
            </div>
          </Modal>
        )}
      </AnimatePresence>

      {/* Breathing modal */}
      <AnimatePresence>
        {showBreathing && <BreathingCircle theme={theme} t={t} lang={settings.lang} onClose={() => setShowBreathing(false)} />}
      </AnimatePresence>

      {/* Share card */}
      <AnimatePresence>
        {showShareCard && (
          <ShareCard
            theme={theme} t={t} durationMin={completedDuration} taskName={settings.focusTask}
            streak={streakData.currentStreak} todayMinutes={streakData.todayMinutes}
            onClose={() => setShowShareCard(false)}
            onNewSession={() => { setShowShareCard(false); handleReset(); }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// --- Helper components ---

function DockButton({ children, onClick, theme, label, active = false }: { children: React.ReactNode; onClick: (e: React.MouseEvent) => void; theme: any; label: string; active?: boolean }) {
  return (
    <button
      onClick={onClick}
      className="p-3 rounded-full transition-all hover:scale-110 active:scale-95 relative"
      style={{ background: active ? theme.accentSoft : 'transparent', color: active ? theme.accent : theme.digitColor }}
      aria-label={label}
    >
      {children}
      {active && <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full" style={{ background: theme.accent }} />}
    </button>
  );
}

function Drawer({ children, onClose, theme, title }: { children: React.ReactNode; onClose: () => void; theme: any; title: string }) {
  return (
    <motion.div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        className="relative w-full sm:max-w-lg max-h-[80vh] overflow-y-auto rounded-t-3xl sm:rounded-3xl backdrop-blur-2xl p-5 shadow-2xl"
        style={{ background: theme.cardBg, border: theme.cardBorder }}
        initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ duration: 0.3, ease: 'easeOut' }}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold" style={{ color: theme.digitColor, fontFamily: theme.font }}>{title}</h2>
          <button onClick={onClose} className="p-1.5 rounded-full transition-all hover:scale-110" style={{ color: theme.labelColor, background: theme.accentSoft }}><ChevronDown size={18} /></button>
        </div>
        {children}
      </motion.div>
    </motion.div>
  );
}

function Modal({ children, onClose, theme, title, t }: { children: React.ReactNode; onClose: () => void; theme: any; title: string; t: Strings }) {
  return (
    <motion.div className="fixed inset-0 z-50 flex items-center justify-center p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        className="relative w-full max-w-lg max-h-[85vh] overflow-y-auto rounded-2xl backdrop-blur-2xl p-6 shadow-2xl"
        style={{ background: theme.cardBg, border: theme.cardBorder }}
        initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }} transition={{ duration: 0.2 }}
      >
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold" style={{ color: theme.digitColor, fontFamily: theme.font }}>{title}</h2>
          <button onClick={onClose} className="p-1.5 rounded-full transition-all hover:scale-110" style={{ color: theme.labelColor, background: theme.accentSoft }} aria-label={t.close}><X size={18} /></button>
        </div>
        {children}
      </motion.div>
    </motion.div>
  );
}

function Label({ children, theme }: { children: React.ReactNode; theme: any }) {
  return <div className="text-[10px] uppercase tracking-wider mb-2 font-medium" style={{ color: theme.labelColor }}>{children}</div>;
}

function ToggleButton({ children, active, onClick, theme }: { children: React.ReactNode; active: boolean; onClick: () => void; theme: any }) {
  return (
    <button onClick={onClick} className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all" style={{ background: active ? theme.accent : theme.accentSoft, color: active ? '#000' : theme.digitColor, border: `1px solid ${theme.accent}40` }}>{children}</button>
  );
}

function NumberInput({ value, onChange, theme }: { value: number; onChange: (v: number) => void; theme: any }) {
  return <input type="number" value={value} onChange={(e) => onChange(parseInt(e.target.value) || 1)} className="w-full px-3 py-2 rounded-lg text-sm font-medium outline-none" style={{ background: theme.accentSoft, color: theme.digitColor, border: `1px solid ${theme.accent}40` }} />;
}

function NumberStepper({ value, onChange, min, max, theme }: { value: number; onChange: (v: number) => void; min: number; max: number; theme: any }) {
  return (
    <div className="flex flex-col items-center rounded-xl overflow-hidden" style={{ background: theme.accentSoft, border: `1px solid ${theme.accent}40` }}>
      <button onClick={() => onChange(Math.min(max, value + 1))} className="w-full py-2 transition-all hover:bg-white/5" style={{ color: theme.digitColor }}>▲</button>
      <input type="number" value={value} onChange={(e) => { const v = parseInt(e.target.value) || 0; onChange(Math.max(min, Math.min(max, v))); }} className="w-full text-center text-2xl font-bold bg-transparent outline-none py-2" style={{ color: theme.digitColor }} />
      <button onClick={() => onChange(Math.max(min, value - 1))} className="w-full py-2 transition-all hover:bg-white/5" style={{ color: theme.digitColor }}>▼</button>
    </div>
  );
}

function ToggleRow({ label, value, onChange, theme }: { label: string; value: boolean; onChange: (v: boolean) => void; theme: any }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm font-medium" style={{ color: theme.digitColor }}>{label}</span>
      <button onClick={() => onChange(!value)} className="relative w-11 h-6 rounded-full transition-all" style={{ background: value ? theme.accent : 'rgba(128,128,128,0.3)' }}>
        <motion.div className="absolute top-0.5 w-5 h-5 rounded-full bg-white" animate={{ left: value ? 'calc(100% - 1.375rem)' : '0.125rem' }} transition={{ duration: 0.2 }} />
      </button>
    </div>
  );
}

function SliderRow({ label, value, onChange, theme }: { label: string; value: number; onChange: (v: number) => void; theme: any }) {
  return (
    <div>
      <label className="text-[10px] uppercase tracking-wider mb-1.5 block" style={{ color: theme.labelColor }}>{label}</label>
      <input type="range" min={0} max={1} step={0.05} value={value} onChange={(e) => onChange(parseFloat(e.target.value))} className="w-full" style={{ accentColor: theme.accent }} />
    </div>
  );
}
