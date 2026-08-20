export type Lang = 'tr' | 'en';

export interface Strings {
  appName: string;
  stopwatch: string;
  countdown: string;
  focus: string;
  break_: string;
  hours: string;
  minutes: string;
  seconds: string;
  h: string;
  m: string;
  s: string;
  start: string;
  pause: string;
  reset: string;
  play: string;
  resume: string;
  timerMode: string;
  soundMixer: string;
  customTime: string;
  settings: string;
  themes: string;
  fullscreen: string;
  exitFullscreen: string;
  language: string;
  settingsTitle: string;
  showSeconds: string;
  motivationQuotes: string;
  quoteInterval: string;
  every: string;
  minutesUnit: string;
  focusDuration: string;
  breakDuration: string;
  quickPresets: string;
  recentSessions: string;
  close: string;
  chooseVibe: string;
  soundHub: string;
  musicPlayer: string;
  ambientMixer: string;
  masterVolume: string;
  track: string;
  selectTrack: string;
  lofiChill: string;
  synthwave: string;
  acoustic: string;
  zenDrone: string;
  rain: string;
  river: string;
  wind: string;
  fireplace: string;
  cafe: string;
  birds: string;
  setCustomTime: string;
  hoursLabel: string;
  minutesLabel: string;
  secondsLabel: string;
  set: string;
  cancel: string;
  focusSession: string;
  breakTime: string;
  sessionComplete: string;
  quotes: string[];
  // New strings
  focusTask: string;
  focusTaskPlaceholder: string;
  streak: string;
  dayStreak: string;
  todayMinutes: string;
  breathingTitle: string;
  breathingSubtitle: string;
  breatheIn: string;
  breatheHold: string;
  breatheOut: string;
  startBreathing: string;
  shareCardTitle: string;
  shareCardSubtitle: string;
  shareFocus: string;
  share: string;
  download: string;
  newSession: string;
  tapHint: string;
  wakeLockError: string;
}

const tr: Strings = {
  appName: 'FocusFlip',
  stopwatch: 'Kronometre',
  countdown: 'Geri Sayım',
  focus: 'Odaklanma',
  break_: 'Mola',
  hours: 'Saat',
  minutes: 'Dakika',
  seconds: 'Saniye',
  h: 'S',
  m: 'D',
  s: 'Sn',
  start: 'Başlat',
  pause: 'Duraklat',
  reset: 'Sıfırla',
  play: 'Oynat',
  resume: 'Devam Et',
  timerMode: 'Zamanlayıcı Modu',
  soundMixer: 'Ses Karıştırıcı',
  customTime: 'Özel Süre',
  settings: 'Ayarlar',
  themes: 'Temalar',
  fullscreen: 'Tam Ekran',
  exitFullscreen: 'Tam Ekrandan Çık',
  language: 'Dil',
  settingsTitle: 'Ayarlar',
  showSeconds: 'Saniyeleri Göster',
  motivationQuotes: 'Motivasyon Sözleri',
  quoteInterval: 'Söz Aralığı',
  every: 'Her',
  minutesUnit: 'dakika',
  focusDuration: 'Odaklanma Süresi (dk)',
  breakDuration: 'Mola Süresi (dk)',
  quickPresets: 'Hızlı Seçimler',
  recentSessions: 'Son Seanslar',
  close: 'Kapat',
  chooseVibe: 'Atmosferini Seç',
  soundHub: 'Ses Merkezi',
  musicPlayer: 'Müzik Çalar',
  ambientMixer: 'Ortam Sesi Karıştırıcı',
  masterVolume: 'Ana Ses',
  track: 'Parça',
  selectTrack: 'Parça Seç',
  lofiChill: 'Lo-Fi Chill',
  synthwave: 'Synthwave',
  acoustic: 'Akustik',
  zenDrone: 'Zen Drone',
  rain: 'Yağmur',
  river: 'Nehir / Su',
  wind: 'Rüzgar & Yapraklar',
  fireplace: 'Şömine',
  cafe: 'Kafe Sesi',
  birds: 'Orman Kuşları',
  setCustomTime: 'Özel Süre Belirle',
  hoursLabel: 'Saat',
  minutesLabel: 'Dakika',
  secondsLabel: 'Saniye',
  set: 'Ayarla',
  cancel: 'İptal',
  focusSession: 'Odaklanma Seansı',
  breakTime: 'Mola Zamanı',
  sessionComplete: 'Seans Tamamlandı!',
  quotes: [
    'Harika gidiyorsun, odağını koru!',
    'Her saniye hedefine bir adım daha yakınsın.',
    'Bugün gösterdiğin emek yarının başarısıdır.',
    'Biraz su iç ve derin bir nefes al.',
    'Odaklanmak bir beceridir, sen ustası oluyorsun.',
    'Küçük adımlar büyük değişimler yaratır.',
    'Şu an burada olmak bile başarının kanıtıdır.',
    'Zihnini sakin tut, bedenini rahat bırak.',
    'Her tekrar seni daha güçlü yapıyor.',
    'Mola vermek de verimliliğin bir parçasıdır.',
  ],
  focusTask: 'Odak Görevi',
  focusTaskPlaceholder: 'Şu an neye odaklanıyorsun?',
  streak: 'Seri',
  dayStreak: 'gün seri',
  todayMinutes: 'Bugün',
  breathingTitle: 'Bugün çok mu yorgunsun?',
  breathingSubtitle: 'Hadi sakinleşelim',
  breatheIn: 'Nefes Al',
  breatheHold: 'Tut',
  breatheOut: 'Ver',
  startBreathing: 'Başla',
  shareCardTitle: 'Odaklanma Tamamlandı!',
  shareCardSubtitle: 'FocusFlip ile yeni bir seans bitirdim',
  shareFocus: 'Odak',
  share: 'Paylaş',
  download: 'İndir',
  newSession: 'Yeni Seans',
  tapHint: 'Çift dokun: Başlat/Duraklat',
  wakeLockError: 'Ekran uyanık tutma desteklenmiyor',
};

const en: Strings = {
  appName: 'FocusFlip',
  stopwatch: 'Stopwatch',
  countdown: 'Countdown',
  focus: 'Focus',
  break_: 'Break',
  hours: 'Hours',
  minutes: 'Minutes',
  seconds: 'Seconds',
  h: 'H',
  m: 'M',
  s: 'S',
  start: 'Start',
  pause: 'Pause',
  reset: 'Reset',
  play: 'Play',
  resume: 'Resume',
  timerMode: 'Timer Mode',
  soundMixer: 'Sound Mixer',
  customTime: 'Custom Time',
  settings: 'Settings',
  themes: 'Themes',
  fullscreen: 'Fullscreen',
  exitFullscreen: 'Exit Fullscreen',
  language: 'Language',
  settingsTitle: 'Settings',
  showSeconds: 'Show Seconds',
  motivationQuotes: 'Motivation Quotes',
  quoteInterval: 'Quote Interval',
  every: 'Every',
  minutesUnit: 'min',
  focusDuration: 'Focus Duration (min)',
  breakDuration: 'Break Duration (min)',
  quickPresets: 'Quick Presets',
  recentSessions: 'Recent Sessions',
  close: 'Close',
  chooseVibe: 'Choose Your Vibe',
  soundHub: 'Sound Hub',
  musicPlayer: 'Music Player',
  ambientMixer: 'Ambient Mixer',
  masterVolume: 'Master Volume',
  track: 'Track',
  selectTrack: 'Select Track',
  lofiChill: 'Lo-Fi Chill',
  synthwave: 'Synthwave',
  acoustic: 'Acoustic',
  zenDrone: 'Zen Drone',
  rain: 'Rain',
  river: 'River / Water',
  wind: 'Wind & Leaves',
  fireplace: 'Fireplace',
  cafe: 'Cafe',
  birds: 'Forest Birds',
  setCustomTime: 'Set Custom Time',
  hoursLabel: 'Hours',
  minutesLabel: 'Minutes',
  secondsLabel: 'Seconds',
  set: 'Set',
  cancel: 'Cancel',
  focusSession: 'Focus Session',
  breakTime: 'Break Time',
  sessionComplete: 'Session Complete!',
  quotes: [
    'You can do it, stay focused!',
    'Every second brings you closer to your goal.',
    'Stay consistent.',
    'Take a sip of water and a deep breath.',
    'Focus is a skill, and you are mastering it.',
    'Small steps create big changes.',
    'Being here right now is proof of success.',
    'Keep your mind calm, let your body relax.',
    'Every repetition makes you stronger.',
    'Taking breaks is part of being productive.',
  ],
  focusTask: 'Focus Task',
  focusTaskPlaceholder: 'What are you focusing on?',
  streak: 'Streak',
  dayStreak: 'day streak',
  todayMinutes: 'Today',
  breathingTitle: 'Feeling tired today?',
  breathingSubtitle: "Let's calm down together",
  breatheIn: 'Breathe In',
  breatheHold: 'Hold',
  breatheOut: 'Breathe Out',
  startBreathing: 'Begin',
  shareCardTitle: 'Focus Session Complete!',
  shareCardSubtitle: 'I just finished a session with FocusFlip',
  shareFocus: 'Focus',
  share: 'Share',
  download: 'Download',
  newSession: 'New Session',
  tapHint: 'Double-tap: Start/Pause',
  wakeLockError: 'Wake lock not supported',
};

export const translations: Record<Lang, Strings> = { tr, en };
