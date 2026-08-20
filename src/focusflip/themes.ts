export type ThemeId =
  | 'lofi'
  | 'cyberpunk'
  | 'library'
  | 'botanical'
  | 'pembe'
  | 'ocean';

export type ParticleType =
  | 'steam'
  | 'bubbles'
  | 'motes'
  | 'dust'
  | 'leaves'
  | 'stars'
  | 'jellies';

export type MusicGenre = 'lofi' | 'synthwave' | 'acoustic' | 'zen';

export interface Theme {
  id: ThemeId;
  name: { tr: string; en: string };
  tagline: { tr: string; en: string };
  // Scenic background image (Pexels)
  bgImage: string;
  // Scenic background image (Unsplash)
  overlay: string;
  // Flip card styling
  cardBg: string;
  cardBgTop: string;
  cardBgBottom: string;
  cardBorder: string;
  cardShadow: string;
  cardGlow: string;
  cardRounded: string;
  // Text
  digitColor: string;
  digitShadow: string;
  labelColor: string;
  // Accents
  accent: string;
  accentSoft: string;
  // Particles
  particle: ParticleType;
  // Default music genre
  defaultMusic: MusicGenre;
  // Font
  font: string;
  fontWeight: number;
}

export const themes: Theme[] = [
  {
    id: 'lofi',
    name: { tr: 'Lo-Fi Kafe', en: 'Lo-Fi Cafe' },
    tagline: {
      tr: 'Yağmurlu gece & sıcak kahve',
      en: 'Rainy night & warm coffee',
    },
    bgImage:
      'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=1920&q=80',
    overlay:
      'linear-gradient(180deg, rgba(20,14,10,0.55) 0%, rgba(15,10,7,0.7) 100%)',
    cardBg: 'linear-gradient(180deg, rgba(60,45,35,0.85), rgba(35,25,18,0.9))',
    cardBgTop: 'linear-gradient(180deg, rgba(75,58,45,0.9) 0%, rgba(45,33,24,0.9) 100%)',
    cardBgBottom: 'linear-gradient(180deg, rgba(30,22,16,0.9) 0%, rgba(50,38,28,0.85) 100%)',
    cardBorder: '1px solid rgba(252,211,161,0.18)',
    cardShadow: '0 10px 30px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,220,180,0.1)',
    cardGlow: '0 0 25px rgba(252,211,161,0.15)',
    cardRounded: 'rounded-2xl',
    digitColor: '#f5e6d3',
    digitShadow: '0 2px 4px rgba(0,0,0,0.5)',
    labelColor: 'rgba(252,211,161,0.6)',
    accent: '#fcd3a1',
    accentSoft: 'rgba(252,211,161,0.12)',
    particle: 'steam',
    defaultMusic: 'lofi',
    font: "'DM Serif Display', 'Georgia', serif",
    fontWeight: 400,
  },
  {
    id: 'cyberpunk',
    name: { tr: 'Siber Şehir', en: 'Cyberpunk City' },
    tagline: {
      tr: 'Neon yağmur & synth manzara',
      en: 'Neon rain & synth skyline',
    },
    bgImage:
      'https://images.unsplash.com/photo-1601042879364-f3947d3f9c16?auto=format&fit=crop&w=1920&q=80',
    overlay:
      'linear-gradient(180deg, rgba(5,2,16,0.6) 0%, rgba(8,3,24,0.75) 100%)',
    cardBg: 'linear-gradient(180deg, rgba(20,20,40,0.85), rgba(8,8,22,0.9))',
    cardBgTop: 'linear-gradient(180deg, rgba(30,30,55,0.9) 0%, rgba(12,12,28,0.9) 100%)',
    cardBgBottom: 'linear-gradient(180deg, rgba(6,6,16,0.9) 0%, rgba(20,20,42,0.85) 100%)',
    cardBorder: '1px solid rgba(34,211,238,0.35)',
    cardShadow: '0 0 25px rgba(34,211,238,0.12), inset 0 0 30px rgba(217,70,239,0.06)',
    cardGlow: '0 0 20px rgba(34,211,238,0.4)',
    cardRounded: 'rounded-xl',
    digitColor: '#22d3ee',
    digitShadow: '0 0 10px rgba(34,211,238,0.35)',
    labelColor: 'rgba(217,70,239,0.7)',
    accent: '#22d3ee',
    accentSoft: 'rgba(34,211,238,0.12)',
    particle: 'motes',
    defaultMusic: 'synthwave',
    font: "'Outfit', 'Segoe UI', sans-serif",
    fontWeight: 700,
  },
  {
    id: 'library',
    name: { tr: 'Ahşap Kütüphane', en: 'Dark Wood Library' },
    tagline: {
      tr: 'Antika brass & sıcak lamba',
      en: 'Vintage brass & warm lamp',
    },
    bgImage:
      'https://images.unsplash.com/photo-1507842229452-772b1c9c8d33?auto=format&fit=crop&w=1920&q=80',
    overlay:
      'linear-gradient(180deg, rgba(25,16,8,0.55) 0%, rgba(18,12,6,0.7) 100%)',
    cardBg: 'linear-gradient(180deg, rgba(60,38,22,0.88), rgba(38,24,14,0.92))',
    cardBgTop: 'linear-gradient(180deg, rgba(72,46,28,0.92) 0%, rgba(48,32,18,0.92) 100%)',
    cardBgBottom: 'linear-gradient(180deg, rgba(30,20,10,0.92) 0%, rgba(52,34,20,0.88) 100%)',
    cardBorder: '1px solid rgba(184,134,70,0.28)',
    cardShadow: '0 10px 30px rgba(0,0,0,0.5), inset 0 1px 0 rgba(200,160,100,0.1)',
    cardGlow: '0 0 25px rgba(200,140,60,0.12)',
    cardRounded: 'rounded-lg',
    digitColor: '#d4a85a',
    digitShadow: '0 2px 4px rgba(0,0,0,0.6), 0 0 10px rgba(200,140,60,0.18)',
    labelColor: 'rgba(184,134,70,0.6)',
    accent: '#c8a050',
    accentSoft: 'rgba(200,160,80,0.12)',
    particle: 'dust',
    defaultMusic: 'acoustic',
    font: "'Cormorant Garamond', 'Times New Roman', serif",
    fontWeight: 700,
  },
  {
    id: 'botanical',
    name: { tr: 'Botanik Bahçe', en: 'Botanical Bloom' },
    tagline: {
      tr: 'Nehir & sabah misltı',
      en: 'River stream & morning mist',
    },
    bgImage:
      'https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=1920&q=80',
    overlay:
      'linear-gradient(180deg, rgba(15,26,20,0.5) 0%, rgba(10,18,14,0.65) 100%)',
    cardBg: 'linear-gradient(180deg, rgba(35,55,40,0.85), rgba(20,36,26,0.9))',
    cardBgTop: 'linear-gradient(180deg, rgba(45,68,50,0.9) 0%, rgba(26,46,34,0.9) 100%)',
    cardBgBottom: 'linear-gradient(180deg, rgba(16,30,22,0.9) 0%, rgba(30,52,36,0.85) 100%)',
    cardBorder: '1px solid rgba(180,220,160,0.18)',
    cardShadow: '0 10px 30px rgba(0,20,10,0.4), inset 0 1px 0 rgba(200,240,190,0.1)',
    cardGlow: '0 0 25px rgba(180,220,160,0.12)',
    cardRounded: 'rounded-2xl',
    digitColor: '#e8f5e0',
    digitShadow: '0 2px 4px rgba(0,0,0,0.3)',
    labelColor: 'rgba(180,220,160,0.55)',
    accent: '#9ccc65',
    accentSoft: 'rgba(156,204,101,0.12)',
    particle: 'leaves',
    defaultMusic: 'zen',
    font: "'Outfit', 'Segoe UI', sans-serif",
    fontWeight: 700,
  },
  {
    id: 'pembe',
    name: { tr: 'Pembe', en: 'Pink Aesthetic' },
    tagline: {
      tr: 'Pembe gün batımı & yumuşak parıltı',
      en: 'Pink sunset & soft shimmer',
    },
    bgImage:
      'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=1920&q=80',
    overlay:
      'linear-gradient(180deg, rgba(60,20,45,0.42) 0%, rgba(35,10,28,0.6) 100%)',
    cardBg: 'linear-gradient(180deg, rgba(90,40,70,0.85), rgba(55,22,45,0.9))',
    cardBgTop: 'linear-gradient(180deg, rgba(110,50,85,0.9) 0%, rgba(70,30,55,0.9) 100%)',
    cardBgBottom: 'linear-gradient(180deg, rgba(45,18,38,0.9) 0%, rgba(80,36,62,0.85) 100%)',
    cardBorder: '1px solid rgba(255,182,214,0.28)',
    cardShadow: '0 10px 30px rgba(40,8,30,0.5), inset 0 0 30px rgba(255,182,214,0.06)',
    cardGlow: '0 0 25px rgba(255,182,214,0.25)',
    cardRounded: 'rounded-2xl',
    digitColor: '#ffe3f1',
    digitShadow: '0 0 12px rgba(255,150,200,0.45)',
    labelColor: 'rgba(255,182,214,0.65)',
    accent: '#ff8ec4',
    accentSoft: 'rgba(255,142,196,0.14)',
    particle: 'stars',
    defaultMusic: 'zen',
    font: "'Outfit', 'Segoe UI', sans-serif",
    fontWeight: 700,

  },
  {
    id: 'ocean',
    name: { tr: 'Derin Okyanus', en: 'Deep Ocean' },
    tagline: {
      tr: 'Lacivert derinlik & denizanaları',
      en: 'Navy abyss & jellyfish',
    },
    bgImage:
      'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=1920&q=80',
    overlay:
      'linear-gradient(180deg, rgba(8,18,35,0.55) 0%, rgba(5,12,25,0.7) 100%)',
    cardBg: 'linear-gradient(180deg, rgba(15,40,65,0.85), rgba(6,22,42,0.9))',
    cardBgTop: 'linear-gradient(180deg, rgba(20,55,85,0.9) 0%, rgba(10,32,58,0.9) 100%)',
    cardBgBottom: 'linear-gradient(180deg, rgba(4,16,32,0.9) 0%, rgba(14,38,64,0.85) 100%)',
    cardBorder: '1px solid rgba(34,211,238,0.22)',
    cardShadow: '0 10px 30px rgba(0,10,30,0.5), inset 0 0 30px rgba(34,211,238,0.04)',
    cardGlow: '0 0 25px rgba(34,211,238,0.2)',
    cardRounded: 'rounded-2xl',
    digitColor: '#7dd3fc',
    digitShadow: '0 0 12px rgba(34,211,238,0.35)',
    labelColor: 'rgba(125,211,252,0.55)',
    accent: '#22d3ee',
    accentSoft: 'rgba(34,211,238,0.1)',
    particle: 'jellies',
    defaultMusic: 'zen',
    font: "'Outfit', 'Segoe UI', sans-serif",
    fontWeight: 700,
  },
];

export const themeMap: Record<ThemeId, Theme> = Object.fromEntries(
  themes.map((t) => [t.id, t]),
) as Record<ThemeId, Theme>;
