import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import type { Theme, ParticleType } from './themes';

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  duration: number;
  delay: number;
  drift: number;
  opacity: number;
}

const PARTICLE_COUNTS: Record<ParticleType, number> = {
  steam: 14,
  bubbles: 16,
  motes: 20,
  dust: 18,
  leaves: 12,
  stars: 25,
  jellies: 6,
};

export default function ScenicBackground({
  theme,
  active = false,
}: {
  theme: Theme;
  active?: boolean;
}) {
  const [particles, setParticles] = useState<Particle[]>([]);
  const [bgLoaded, setBgLoaded] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const count = PARTICLE_COUNTS[theme.particle] || 15;
    const newParts: Particle[] = Array.from({ length: count }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: 3 + Math.random() * 10,
      duration: 8 + Math.random() * 14,
      delay: Math.random() * 12,
      drift: (Math.random() - 0.5) * 50,
      opacity: 0.3 + Math.random() * 0.4,
    }));
    setParticles(newParts);
    setBgLoaded(false);
  }, [theme.id, theme.particle]);

  return (
    <div ref={containerRef} className="absolute inset-0 z-0 overflow-hidden">
      {/* Scenic background image */}
      <img
        src={theme.bgImage}
        alt=""
        onLoad={() => setBgLoaded(true)}
        className="absolute inset-0 w-full h-full object-cover transition-opacity duration-700"
        style={{ opacity: bgLoaded ? 1 : 0 }}
      />
      {/* Fallback solid dark while image loads */}
      <div
        className="absolute inset-0"
        style={{ background: '#0a0a0f', opacity: bgLoaded ? 0 : 1 }}
      />
      {/* Dark overlay tint */}
      <div
        className="absolute inset-0"
        style={{ background: theme.overlay }}
      />
      {/* Particles */}
      {particles.map((p) => (
        <ParticleItem key={p.id} particle={p} type={theme.particle} />
      ))}
      {/* Ambient glow + soft dust motes while the timer is running */}
      {active && <AmbientLayer accent={theme.accent} />}
    </div>
  );
}

function ParticleItem({
  particle: p,
  type,
}: {
  particle: Particle;
  type: ParticleType;
}) {
  switch (type) {
    case 'steam':
      return (
        <motion.div
          className="absolute rounded-full blur-md"
          style={{
            left: `${p.x}%`,
            bottom: '-5%',
            width: p.size * 5,
            height: p.size * 5,
            background: 'rgba(255,240,220,0.05)',
          }}
          animate={{
            y: [0, -window.innerHeight * 0.7],
            x: [0, p.drift, 0],
            opacity: [0, p.opacity * 0.5, 0],
            scale: [0.5, 1.5, 2],
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            repeat: Infinity,
            ease: 'easeOut',
          }}
        />
      );
    case 'bubbles':
      return (
        <motion.div
          className="absolute rounded-full"
          style={{
            left: `${p.x}%`,
            bottom: '-5%',
            width: p.size,
            height: p.size,
            background: 'rgba(255,200,120,0.1)',
            border: '1px solid rgba(255,200,120,0.2)',
          }}
          animate={{
            y: [0, -window.innerHeight * 1.1],
            x: [0, p.drift / 2, 0],
            opacity: [0, p.opacity, 0],
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      );
    case 'motes':
      return (
        <motion.div
          className="absolute rounded-full blur-sm"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size / 2,
            height: p.size / 2,
            background: Math.random() > 0.5 ? 'rgba(34,211,238,0.4)' : 'rgba(217,70,239,0.4)',
          }}
          animate={{
            y: [0, -40, 0],
            x: [0, p.drift / 2, 0],
            opacity: [0, p.opacity, 0],
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      );
    case 'dust':
      return (
        <motion.div
          className="absolute rounded-full"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size / 3,
            height: p.size / 3,
            background: 'rgba(200,160,100,0.2)',
            filter: 'blur(1px)',
          }}
          animate={{
            y: [0, -25, 0],
            x: [0, p.drift / 3, 0],
            opacity: [0, p.opacity * 0.6, 0],
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      );
    case 'leaves':
      return (
        <motion.div
          className="absolute"
          style={{
            left: `${p.x}%`,
            top: '-5%',
            width: p.size,
            height: p.size * 0.6,
            background: 'rgba(180,220,160,0.25)',
            borderRadius: '50% 0 50% 0',
          }}
          animate={{
            y: [0, window.innerHeight + 50],
            x: [0, p.drift],
            rotate: [0, 360],
            opacity: [0, p.opacity * 0.6, p.opacity * 0.6, 0],
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            repeat: Infinity,
            ease: 'easeIn',
          }}
        />
      );
    case 'stars':
      return (
        <motion.div
          className="absolute rounded-full"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size / 2.5,
            height: p.size / 2.5,
            background: 'rgba(233,213,255,0.6)',
            boxShadow: '0 0 8px rgba(196,181,253,0.5)',
          }}
          animate={{
            opacity: [0, p.opacity, 0],
            scale: [0.5, 1.3, 0.5],
          }}
          transition={{
            duration: 2 + Math.random() * 4,
            delay: p.delay,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      );
    case 'jellies':
      return (
        <motion.div
          className="absolute rounded-full blur-md"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size * 3,
            height: p.size * 3,
            background: 'radial-gradient(circle, rgba(125,211,252,0.15), transparent)',
          }}
          animate={{
            y: [0, -60, 0],
            x: [0, p.drift / 2, 0],
            opacity: [0, p.opacity * 0.5, 0],
            scale: [0.8, 1.2, 0.8],
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      );
    default:
      return null;
  }
}

function AmbientLayer({ accent }: { accent: string }) {
  const [motes] = useState<Particle[]>(() =>
    Array.from({ length: 22 }, (_, i) => ({
      id: 1000 + i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: 2 + Math.random() * 4,
      duration: 10 + Math.random() * 12,
      delay: Math.random() * 10,
      drift: (Math.random() - 0.5) * 40,
      opacity: 0.15 + Math.random() * 0.1,
    })),
  );

  return (
    <motion.div
      className="absolute inset-0 pointer-events-none"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 1.4, ease: 'easeOut' }}
    >
      {/* Soft ambient glow */}
      <motion.div
        className="absolute inset-0"
        style={{
          background: `radial-gradient(closest-side at 50% 50%, ${accent}14, transparent 70%)`,
        }}
        animate={{ opacity: [0.15, 0.22, 0.15] }}
        transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }}
      />
      {motes.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
            background: accent,
            filter: 'blur(1.5px)',
          }}
          animate={{
            y: [0, -30, 0],
            x: [0, p.drift / 2, 0],
            opacity: [0, p.opacity, 0],
            scale: [0.8, 1.15, 0.8],
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      ))}
    </motion.div>
  );
}
