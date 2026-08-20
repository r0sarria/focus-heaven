import type { MusicGenre } from './themes';

// Two-layer audio engine, fully synthesized via Web Audio API — 100% royalty-free.
// Layer A: Music player (4 genres of procedural generative music)
// Layer B: Ambient mixer (6 independent nature/home sounds, each toggleable + volume)

export type AmbientId = 'rain' | 'river' | 'wind' | 'fireplace' | 'cafe' | 'birds';

interface Layer {
  gain: GainNode;
  nodes: AudioNode[];
  oscillators: OscillatorNode[];
  intervals: number[];
}

class AudioEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private musicLayer: Layer | null = null;
  private ambientLayers: Partial<Record<AmbientId, Layer>> = {};
  private masterVolume = 0.6;
  private musicVolume = 0.5;
  private ambientVolumes: Record<AmbientId, number> = {
    rain: 0.5,
    river: 0.5,
    wind: 0.5,
    fireplace: 0.5,
    cafe: 0.5,
    birds: 0.5,
  };
  private currentMusic: MusicGenre | null = null;
  private musicPlaying = false;
  private activeAmbients = new Set<AmbientId>();

  private ensureContext(): AudioContext {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (this.ctx.state === 'suspended') {
      void this.ctx.resume();
    }
    return this.ctx;
  }

  private ensureMaster(): GainNode {
    const ctx = this.ensureContext();
    if (!this.masterGain) {
      this.masterGain = ctx.createGain();
      this.masterGain.gain.value = this.masterVolume;
      this.masterGain.connect(ctx.destination);
    }
    return this.masterGain;
  }

  setMasterVolume(v: number) {
    this.masterVolume = v;
    if (this.masterGain) {
      this.masterGain.gain.setTargetAtTime(v, this.ensureContext().currentTime, 0.05);
    }
  }

  getMasterVolume() {
    return this.masterVolume;
  }

  // --- Layer A: Music Player ---

  setMusicVolume(v: number) {
    this.musicVolume = v;
    if (this.musicLayer) {
      this.musicLayer.gain.gain.setTargetAtTime(v, this.ensureContext().currentTime, 0.05);
    }
  }

  getMusicVolume() {
    return this.musicVolume;
  }

  playMusic(genre: MusicGenre) {
    const ctx = this.ensureContext();
    const master = this.ensureMaster();
    this.stopMusic();
    this.currentMusic = genre;
    this.musicPlaying = true;

    const gain = ctx.createGain();
    gain.gain.value = 0;
    gain.connect(master);
    gain.gain.setTargetAtTime(this.musicVolume, ctx.currentTime, 0.5);

    const layer: Layer = { gain, nodes: [], oscillators: [], intervals: [] };

    switch (genre) {
      case 'lofi':
        this.buildLofiMusic(ctx, layer);
        break;
      case 'synthwave':
        this.buildSynthwaveMusic(ctx, layer);
        break;
      case 'acoustic':
        this.buildAcousticMusic(ctx, layer);
        break;
      case 'zen':
        this.buildZenMusic(ctx, layer);
        break;
    }

    this.musicLayer = layer;
  }

  stopMusic() {
    if (!this.musicLayer || !this.ctx) return;
    const { gain, nodes, oscillators, intervals } = this.musicLayer;
    const now = this.ctx.currentTime;
    gain.gain.setTargetAtTime(0, now, 0.3);
    setTimeout(() => {
      intervals.forEach((id) => clearInterval(id));
      oscillators.forEach((o) => {
        try { o.stop(); } catch { /* noop */ }
        try { o.disconnect(); } catch { /* noop */ }
      });
      nodes.forEach((n) => {
        try { (n as any).stop?.(); } catch { /* noop */ }
        try { n.disconnect(); } catch { /* noop */ }
      });
      try { gain.disconnect(); } catch { /* noop */ }
    }, 500);
    this.musicLayer = null;
    this.musicPlaying = false;
    this.currentMusic = null;
  }

  get isMusicPlaying() {
    return this.musicPlaying;
  }

  get currentGenre() {
    return this.currentMusic;
  }

  // --- Music genre builders ---

  private buildLofiMusic(ctx: AudioContext, layer: Layer) {
    // Warm chord progression with soft vinyl crackle
    const chords = [
      [196.0, 233.08, 293.66], // Gm
      [174.61, 220.0, 261.63], // F
      [164.81, 196.0, 246.94], // E
      [146.83, 174.61, 220.0], // D
    ];
    let chordIndex = 0;

    const padGain = ctx.createGain();
    padGain.gain.value = 0.08;
    padGain.connect(layer.gain);
    layer.nodes.push(padGain);

    const playChord = () => {
      if (!this.musicPlaying) return;
      const chord = chords[chordIndex % chords.length]!;
      chordIndex++;
      chord.forEach((freq) => {
        const osc = ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.value = freq;
        const g = ctx.createGain();
        g.gain.setValueAtTime(0, ctx.currentTime);
        g.gain.linearRampToValueAtTime(0.04, ctx.currentTime + 0.5);
        g.gain.linearRampToValueAtTime(0, ctx.currentTime + 3.5);
        osc.connect(g);
        g.connect(padGain);
        osc.start();
        osc.stop(ctx.currentTime + 4);
        layer.oscillators.push(osc);
        layer.nodes.push(g);
      });
    };

    playChord();
    const id = window.setInterval(playChord, 4000);
    layer.intervals.push(id);

    // Soft melody notes
    const melodyNotes = [392, 440, 523.25, 587.33, 659.25, 523.25, 440, 392];
    let melIdx = 0;
    const melId = window.setInterval(() => {
      if (!this.musicPlaying || Math.random() > 0.6) return;
      const freq = melodyNotes[melIdx % melodyNotes.length]!;
      melIdx++;
      const osc = ctx.createOscillator();
      osc.type = 'triangle';
      osc.frequency.value = freq;
      const g = ctx.createGain();
      g.gain.setValueAtTime(0, ctx.currentTime);
      g.gain.linearRampToValueAtTime(0.03, ctx.currentTime + 0.05);
      g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.5);
      osc.connect(g);
      g.connect(layer.gain);
      osc.start();
      osc.stop(ctx.currentTime + 1.6);
      layer.oscillators.push(osc);
      layer.nodes.push(g);
    }, 1500);
    layer.intervals.push(melId);

    // Vinyl crackle
    const noise = this.createNoiseSource(ctx, 'brown');
    const noiseFilter = ctx.createBiquadFilter();
    noiseFilter.type = 'bandpass';
    noiseFilter.frequency.value = 1500;
    noiseFilter.Q.value = 0.5;
    const noiseGain = ctx.createGain();
    noiseGain.gain.value = 0.015;
    noise.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(layer.gain);
    noise.start();
    layer.nodes.push(noise, noiseFilter, noiseGain);
  }

  private buildSynthwaveMusic(ctx: AudioContext, layer: Layer) {
    // Pulsing bass + arpeggio + pad
    const bass = ctx.createOscillator();
    bass.type = 'sawtooth';
    bass.frequency.value = 55;
    const bassFilter = ctx.createBiquadFilter();
    bassFilter.type = 'lowpass';
    bassFilter.frequency.value = 300;
    const bassGain = ctx.createGain();
    bassGain.gain.value = 0.08;
    bass.connect(bassFilter);
    bassFilter.connect(bassGain);
    bassGain.connect(layer.gain);
    bass.start();
    layer.oscillators.push(bass);
    layer.nodes.push(bassFilter, bassGain);

    // Arpeggio
    const arpNotes = [220, 277.18, 329.63, 440, 329.63, 277.18];
    let arpIdx = 0;
    const arpId = window.setInterval(() => {
      if (!this.musicPlaying) return;
      const freq = arpNotes[arpIdx % arpNotes.length]!;
      arpIdx++;
      const osc = ctx.createOscillator();
      osc.type = 'square';
      osc.frequency.value = freq;
      const g = ctx.createGain();
      g.gain.setValueAtTime(0, ctx.currentTime);
      g.gain.linearRampToValueAtTime(0.025, ctx.currentTime + 0.02);
      g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = 2000;
      osc.connect(filter);
      filter.connect(g);
      g.connect(layer.gain);
      osc.start();
      osc.stop(ctx.currentTime + 0.35);
      layer.oscillators.push(osc);
      layer.nodes.push(g, filter);
    }, 250);
    layer.intervals.push(arpId);

    // Pad
    const padFreqs = [110, 164.81];
    padFreqs.forEach((f) => {
      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.value = f;
      const g = ctx.createGain();
      g.gain.value = 0.03;
      osc.connect(g);
      g.connect(layer.gain);
      osc.start();
      layer.oscillators.push(osc);
      layer.nodes.push(g);
    });
  }

  private buildAcousticMusic(ctx: AudioContext, layer: Layer) {
    // Gentle fingerpicked guitar-like notes
    const notes = [
      82.41, 110, 146.83, 196, 246.94, 196, 146.83, 110, // E pattern
      73.42, 98, 130.81, 196, 246.94, 196, 130.81, 98,  // D pattern
      82.41, 110, 146.83, 196, 246.94, 196, 146.83, 110, // E pattern
      65.41, 98, 130.81, 174.61, 220, 174.61, 130.81, 98, // G pattern
    ];
    let idx = 0;
    const id = window.setInterval(() => {
      if (!this.musicPlaying) return;
      const freq = notes[idx % notes.length];
      idx++;
      // Plucked string simulation
      const osc = ctx.createOscillator();
      osc.type = 'triangle';
      osc.frequency.value = freq;
      const g = ctx.createGain();
      g.gain.setValueAtTime(0, ctx.currentTime);
      g.gain.linearRampToValueAtTime(0.06, ctx.currentTime + 0.01);
      g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 2);
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = 3000;
      osc.connect(filter);
      filter.connect(g);
      g.connect(layer.gain);
      osc.start();
      osc.stop(ctx.currentTime + 2.1);
      layer.oscillators.push(osc);
      layer.nodes.push(g, filter);
    }, 600);
    layer.intervals.push(id);

    // Soft pad underneath
    const padFreqs = [130.81, 196];
    padFreqs.forEach((f) => {
      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.value = f;
      const g = ctx.createGain();
      g.gain.value = 0.02;
      osc.connect(g);
      g.connect(layer.gain);
      osc.start();
      layer.oscillators.push(osc);
      layer.nodes.push(g);
    });
  }

  private buildZenMusic(ctx: AudioContext, layer: Layer) {
    // Deep meditative drone with occasional bell tones
    const droneFreqs = [130.81, 196, 261.63];
    droneFreqs.forEach((f) => {
      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.value = f;
      const g = ctx.createGain();
      g.gain.value = 0.04;
      osc.connect(g);
      g.connect(layer.gain);
      osc.start();
      layer.oscillators.push(osc);
      layer.nodes.push(g);
    });

    // Occasional singing bowl bell
    const bellId = window.setInterval(() => {
      if (!this.musicPlaying || Math.random() > 0.4) return;
      const freqs = [523.25, 659.25, 783.99];
      const freq = freqs[Math.floor(Math.random() * freqs.length)]!;
      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.value = freq;
      const g = ctx.createGain();
      g.gain.setValueAtTime(0, ctx.currentTime);
      g.gain.linearRampToValueAtTime(0.03, ctx.currentTime + 0.1);
      g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 4);
      osc.connect(g);
      g.connect(layer.gain);
      osc.start();
      osc.stop(ctx.currentTime + 4.1);
      layer.oscillators.push(osc);
      layer.nodes.push(g);
    }, 5000);
    layer.intervals.push(bellId);
  }

  // --- Layer B: Ambient Mixer ---

  setAmbientVolume(id: AmbientId, v: number) {
    this.ambientVolumes[id] = v;
    const layer = this.ambientLayers[id];
    if (layer) {
      layer.gain.gain.setTargetAtTime(v, this.ensureContext().currentTime, 0.05);
    }
  }

  getAmbientVolume(id: AmbientId) {
    return this.ambientVolumes[id];
  }

  isAmbientActive(id: AmbientId) {
    return this.activeAmbients.has(id);
  }

  toggleAmbient(id: AmbientId, on: boolean) {
    if (on) {
      this.startAmbient(id);
    } else {
      this.stopAmbient(id);
    }
  }

  private startAmbient(id: AmbientId) {
    const ctx = this.ensureContext();
    const master = this.ensureMaster();
    if (this.ambientLayers[id]) return;

    const gain = ctx.createGain();
    gain.gain.value = 0;
    gain.connect(master);
    gain.gain.setTargetAtTime(this.ambientVolumes[id], ctx.currentTime, 0.5);

    const layer: Layer = { gain, nodes: [], oscillators: [], intervals: [] };

    switch (id) {
      case 'rain':
        this.buildRain(ctx, layer);
        break;
      case 'river':
        this.buildRiver(ctx, layer);
        break;
      case 'wind':
        this.buildWind(ctx, layer);
        break;
      case 'fireplace':
        this.buildFireplace(ctx, layer);
        break;
      case 'cafe':
        this.buildCafe(ctx, layer);
        break;
      case 'birds':
        this.buildBirds(ctx, layer);
        break;
    }

    this.ambientLayers[id] = layer;
    this.activeAmbients.add(id);
  }

  private stopAmbient(id: AmbientId) {
    const layer = this.ambientLayers[id];
    if (!layer || !this.ctx) return;
    const now = this.ctx.currentTime;
    layer.gain.gain.setTargetAtTime(0, now, 0.3);
    setTimeout(() => {
      layer.intervals.forEach((i) => clearInterval(i));
      layer.oscillators.forEach((o) => {
        try { o.stop(); } catch { /* noop */ }
        try { o.disconnect(); } catch { /* noop */ }
      });
      layer.nodes.forEach((n) => {
        try { (n as any).stop?.(); } catch { /* noop */ }
        try { n.disconnect(); } catch { /* noop */ }
      });
      try { layer.gain.disconnect(); } catch { /* noop */ }
    }, 500);
    delete this.ambientLayers[id];
    this.activeAmbients.delete(id);
  }

  stopAllAmbient() {
    [...this.activeAmbients].forEach((id) => this.stopAmbient(id));
  }

  // Pause all audio (music + ambient) by muting master gain — preserves all nodes
  pauseAll() {
    if (!this.masterGain || !this.ctx) return;
    this.masterGain.gain.setTargetAtTime(0, this.ctx.currentTime, 0.1);
  }

  // Resume all audio by restoring master gain to saved volume
  resumeAll() {
    if (!this.masterGain || !this.ctx) return;
    if (this.ctx.state === 'suspended') void this.ctx.resume();
    this.masterGain.gain.setTargetAtTime(this.masterVolume, this.ctx.currentTime, 0.1);
  }

  // --- Ambient sound builders ---

  private buildRain(ctx: AudioContext, layer: Layer) {
    const noise = this.createNoiseSource(ctx, 'white');
    const filter = ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.value = 1000;
    const gain = ctx.createGain();
    gain.gain.value = 0.15;
    noise.connect(filter);
    filter.connect(gain);
    gain.connect(layer.gain);
    noise.start();
    layer.nodes.push(noise, filter, gain);

    // Occasional raindrop
    const id = window.setInterval(() => {
      if (!this.activeAmbients.has('rain')) return;
      if (Math.random() > 0.3) return;
      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.value = 2000 + Math.random() * 2000;
      const g = ctx.createGain();
      g.gain.setValueAtTime(0, ctx.currentTime);
      g.gain.linearRampToValueAtTime(0.02, ctx.currentTime + 0.005);
      g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.03);
      osc.connect(g);
      g.connect(layer.gain);
      osc.start();
      osc.stop(ctx.currentTime + 0.04);
      layer.oscillators.push(osc);
      layer.nodes.push(g);
    }, 100);
    layer.intervals.push(id);
  }

  private buildRiver(ctx: AudioContext, layer: Layer) {
    const noise = this.createNoiseSource(ctx, 'brown');
    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 400;
    filter.Q.value = 0.5;
    const gain = ctx.createGain();
    gain.gain.value = 0.12;
    noise.connect(filter);
    filter.connect(gain);
    gain.connect(layer.gain);
    noise.start();
    layer.nodes.push(noise, filter, gain);

    // LFO for water flow variation
    const lfo = ctx.createOscillator();
    lfo.type = 'sine';
    lfo.frequency.value = 0.3;
    const lfoGain = ctx.createGain();
    lfoGain.gain.value = 0.04;
    lfo.connect(lfoGain);
    lfoGain.connect(gain.gain);
    lfo.start();
    layer.oscillators.push(lfo);
    layer.nodes.push(lfoGain);
  }

  private buildWind(ctx: AudioContext, layer: Layer) {
    const noise = this.createNoiseSource(ctx, 'brown');
    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 250;
    filter.Q.value = 0.3;
    const gain = ctx.createGain();
    gain.gain.value = 0.1;
    noise.connect(filter);
    filter.connect(gain);
    gain.connect(layer.gain);
    noise.start();
    layer.nodes.push(noise, filter, gain);

    // Wind gust LFO
    const lfo = ctx.createOscillator();
    lfo.type = 'sine';
    lfo.frequency.value = 0.15;
    const lfoGain = ctx.createGain();
    lfoGain.gain.value = 0.06;
    lfo.connect(lfoGain);
    lfoGain.connect(gain.gain);
    lfo.start();
    layer.oscillators.push(lfo);
    layer.nodes.push(lfoGain);

    // Leaf rustle
    const leafId = window.setInterval(() => {
      if (!this.activeAmbients.has('wind')) return;
      if (Math.random() > 0.3) return;
      const n = this.createNoiseSource(ctx, 'white');
      const f = ctx.createBiquadFilter();
      f.type = 'highpass';
      f.frequency.value = 3000;
      const g = ctx.createGain();
      g.gain.setValueAtTime(0, ctx.currentTime);
      g.gain.linearRampToValueAtTime(0.015, ctx.currentTime + 0.05);
      g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
      n.connect(f);
      f.connect(g);
      g.connect(layer.gain);
      n.start();
      n.stop(ctx.currentTime + 0.25);
      layer.nodes.push(n, f, g);
    }, 800);
    layer.intervals.push(leafId);
  }

  private buildFireplace(ctx: AudioContext, layer: Layer) {
    const noise = this.createNoiseSource(ctx, 'brown');
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 600;
    const gain = ctx.createGain();
    gain.gain.value = 0.08;
    noise.connect(filter);
    filter.connect(gain);
    gain.connect(layer.gain);
    noise.start();
    layer.nodes.push(noise, filter, gain);

    // Crackle pops
    const id = window.setInterval(() => {
      if (!this.activeAmbients.has('fireplace')) return;
      const osc = ctx.createOscillator();
      osc.type = 'square';
      osc.frequency.value = 60 + Math.random() * 100;
      const g = ctx.createGain();
      g.gain.setValueAtTime(0, ctx.currentTime);
      g.gain.linearRampToValueAtTime(0.04 + Math.random() * 0.03, ctx.currentTime + 0.005);
      g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);
      osc.connect(g);
      g.connect(layer.gain);
      osc.start();
      osc.stop(ctx.currentTime + 0.06);
      layer.oscillators.push(osc);
      layer.nodes.push(g);
    }, 250);
    layer.intervals.push(id);
  }

  private buildCafe(ctx: AudioContext, layer: Layer) {
    // Low murmur
    const noise = this.createNoiseSource(ctx, 'brown');
    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 300;
    filter.Q.value = 0.5;
    const gain = ctx.createGain();
    gain.gain.value = 0.06;
    noise.connect(filter);
    filter.connect(gain);
    gain.connect(layer.gain);
    noise.start();
    layer.nodes.push(noise, filter, gain);

    // Cup clinks
    const id = window.setInterval(() => {
      if (!this.activeAmbients.has('cafe')) return;
      if (Math.random() > 0.15) return;
      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.value = 800 + Math.random() * 400;
      const g = ctx.createGain();
      g.gain.setValueAtTime(0, ctx.currentTime);
      g.gain.linearRampToValueAtTime(0.02, ctx.currentTime + 0.005);
      g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
      osc.connect(g);
      g.connect(layer.gain);
      osc.start();
      osc.stop(ctx.currentTime + 0.16);
      layer.oscillators.push(osc);
      layer.nodes.push(g);
    }, 2000);
    layer.intervals.push(id);
  }

  private buildBirds(ctx: AudioContext, layer: Layer) {
    // Soft breeze bed
    const noise = this.createNoiseSource(ctx, 'brown');
    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 400;
    filter.Q.value = 0.3;
    const gain = ctx.createGain();
    gain.gain.value = 0.03;
    noise.connect(filter);
    filter.connect(gain);
    gain.connect(layer.gain);
    noise.start();
    layer.nodes.push(noise, filter, gain);

    // Bird chirps
    const id = window.setInterval(() => {
      if (!this.activeAmbients.has('birds')) return;
      if (Math.random() > 0.35) return;
      const baseFreq = 1500 + Math.random() * 2000;
      const chirpCount = 2 + Math.floor(Math.random() * 4);
      for (let i = 0; i < chirpCount; i++) {
        const osc = ctx.createOscillator();
        osc.type = 'sine';
        const startT = ctx.currentTime + i * 0.1;
        osc.frequency.setValueAtTime(baseFreq, startT);
        osc.frequency.exponentialRampToValueAtTime(
          baseFreq * (1.2 + Math.random() * 0.4),
          startT + 0.05,
        );
        const g = ctx.createGain();
        g.gain.setValueAtTime(0, startT);
        g.gain.linearRampToValueAtTime(0.04, startT + 0.01);
        g.gain.exponentialRampToValueAtTime(0.001, startT + 0.08);
        osc.connect(g);
        g.connect(layer.gain);
        osc.start(startT);
        osc.stop(startT + 0.1);
        layer.oscillators.push(osc);
        layer.nodes.push(g);
      }
    }, 1200);
    layer.intervals.push(id);
  }

  // --- Noise source helper ---

  private createNoiseSource(
    ctx: AudioContext,
    type: 'white' | 'brown',
  ): AudioBufferSourceNode {
    const bufferSize = 2 * ctx.sampleRate;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    if (type === 'white') {
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }
    } else {
      let lastOut = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        data[i] = (lastOut + 0.02 * white) / 1.02;
        lastOut = data[i]!;
        data[i] = data[i]! * 3.5;
      }
    }
    const src = ctx.createBufferSource();
    src.buffer = buffer;
    src.loop = true;
    return src;
  }

  // --- Completion chime ---

  playCompletionChime() {
    const ctx = this.ensureContext();
    const master = this.ensureMaster();
    [523.25, 659.25, 783.99, 1046.5].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.value = freq;
      const g = ctx.createGain();
      const t = ctx.currentTime + i * 0.15;
      g.gain.setValueAtTime(0, t);
      g.gain.linearRampToValueAtTime(0.25, t + 0.05);
      g.gain.exponentialRampToValueAtTime(0.001, t + 1.5);
      osc.connect(g);
      g.connect(master);
      osc.start(t);
      osc.stop(t + 1.6);
    });
  }
}

export const audioEngine = new AudioEngine();
