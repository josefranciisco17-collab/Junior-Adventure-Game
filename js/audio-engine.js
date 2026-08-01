(() => {
  class AudioEngine {
    constructor() {
      this.ctx = null;
      this.master = null;
      this.musicGain = null;
      this.sfxGain = null;
      this.enabled = true;
      this.musicEnabled = true;
      this.sfxEnabled = true;
      this.currentRoom = "living";
      this.ambientTimer = null;
      this.started = false;
    }

    async unlock() {
      if (!this.ctx) {
        const AudioContextClass = window.AudioContext || window.webkitAudioContext;
        if (!AudioContextClass) return false;

        this.ctx = new AudioContextClass();
        this.master = this.ctx.createGain();
        this.musicGain = this.ctx.createGain();
        this.sfxGain = this.ctx.createGain();

        this.master.gain.value = .72;
        this.musicGain.gain.value = .18;
        this.sfxGain.gain.value = .62;

        this.musicGain.connect(this.master);
        this.sfxGain.connect(this.master);
        this.master.connect(this.ctx.destination);
      }

      if (this.ctx.state === "suspended") {
        await this.ctx.resume();
      }

      this.started = true;
      this.startAmbient(this.currentRoom);
      return true;
    }

    setEnabled(enabled) {
      this.enabled = Boolean(enabled);
      if (this.master && this.ctx) {
        const value = this.enabled ? .72 : 0;
        this.master.gain.cancelScheduledValues(this.ctx.currentTime);
        this.master.gain.linearRampToValueAtTime(value, this.ctx.currentTime + .08);
      }
    }

    setMusicEnabled(enabled) {
      this.musicEnabled = Boolean(enabled);
      if (this.musicGain && this.ctx) {
        this.musicGain.gain.linearRampToValueAtTime(
          this.musicEnabled ? .18 : 0,
          this.ctx.currentTime + .1
        );
      }
    }

    setSfxEnabled(enabled) {
      this.sfxEnabled = Boolean(enabled);
      if (this.sfxGain && this.ctx) {
        this.sfxGain.gain.linearRampToValueAtTime(
          this.sfxEnabled ? .62 : 0,
          this.ctx.currentTime + .1
        );
      }
    }

    tone(frequency, duration = .12, options = {}) {
      if (!this.ctx || !this.enabled || !this.sfxEnabled) return;

      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = options.type || "sine";
      osc.frequency.setValueAtTime(frequency, now);

      if (options.endFrequency) {
        osc.frequency.exponentialRampToValueAtTime(
          Math.max(20, options.endFrequency),
          now + duration
        );
      }

      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.exponentialRampToValueAtTime(options.volume || .18, now + .012);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

      osc.connect(gain);
      gain.connect(this.sfxGain);
      osc.start(now);
      osc.stop(now + duration + .03);
    }

    noise(duration = .22, volume = .08, filterFrequency = 1500) {
      if (!this.ctx || !this.enabled || !this.sfxEnabled) return;

      const length = Math.floor(this.ctx.sampleRate * duration);
      const buffer = this.ctx.createBuffer(1, length, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);

      for (let i = 0; i < length; i += 1) {
        data[i] = (Math.random() * 2 - 1) * (1 - i / length);
      }

      const source = this.ctx.createBufferSource();
      const filter = this.ctx.createBiquadFilter();
      const gain = this.ctx.createGain();

      filter.type = "lowpass";
      filter.frequency.value = filterFrequency;
      gain.gain.value = volume;

      source.buffer = buffer;
      source.connect(filter);
      filter.connect(gain);
      gain.connect(this.sfxGain);
      source.start();
    }

    play(name) {
      if (!this.ctx || !this.enabled || !this.sfxEnabled) return;

      const patterns = {
        tap: () => {
          this.tone(520, .08, { volume: .11 });
          window.setTimeout(() => this.tone(690, .08, { volume: .08 }), 45);
        },
        room: () => {
          this.tone(340, .11, { volume: .09, endFrequency: 460 });
          window.setTimeout(() => this.tone(510, .12, { volume: .08 }), 75);
        },
        happy: () => {
          [523, 659, 784].forEach((f, i) => {
            window.setTimeout(() => this.tone(f, .12, { volume: .1 }), i * 70);
          });
        },
        coin: () => {
          this.tone(900, .09, { volume: .12 });
          window.setTimeout(() => this.tone(1250, .12, { volume: .1 }), 70);
        },
        tv: () => {
          this.noise(.12, .06, 2600);
          this.tone(180, .18, { type: "square", volume: .05, endFrequency: 230 });
        },
        eat: () => {
          this.noise(.12, .08, 900);
          window.setTimeout(() => this.noise(.1, .07, 760), 120);
          window.setTimeout(() => this.tone(430, .11, { volume: .07 }), 230);
        },
        drink: () => {
          this.tone(600, .18, { volume: .05, endFrequency: 380 });
          window.setTimeout(() => this.tone(500, .18, { volume: .05, endFrequency: 310 }), 120);
        },
        water: () => {
          this.noise(.45, .08, 2200);
          window.setTimeout(() => this.tone(720, .12, { volume: .05 }), 120);
        },
        brush: () => {
          this.noise(.26, .06, 3100);
          window.setTimeout(() => this.noise(.24, .05, 2800), 170);
        },
        sleep: () => {
          this.tone(392, .35, { volume: .06, endFrequency: 260 });
          window.setTimeout(() => this.tone(330, .45, { volume: .05, endFrequency: 220 }), 180);
        },
        wake: () => {
          [440, 554, 659].forEach((f, i) => {
            window.setTimeout(() => this.tone(f, .11, { volume: .08 }), i * 65);
          });
        },
        yawn: () => {
          this.tone(300, .55, { volume: .05, endFrequency: 170 });
        },
        pet: () => {
          this.tone(660, .13, { volume: .08 });
          window.setTimeout(() => this.tone(780, .15, { volume: .07 }), 80);
        }
      };

      patterns[name]?.();
    }

    startAmbient(room) {
      this.currentRoom = room;
      window.clearTimeout(this.ambientTimer);

      if (!this.ctx || !this.enabled || !this.musicEnabled) return;

      const roomData = {
        living: { notes: [261.63, 329.63, 392.0, 329.63], type: "sine", gap: 1100 },
        kitchen: { notes: [293.66, 369.99, 440.0, 369.99], type: "triangle", gap: 960 },
        bathroom: { notes: [220.0, 277.18, 329.63, 277.18], type: "sine", gap: 1250 },
        bedroom: { notes: [196.0, 246.94, 293.66, 246.94], type: "sine", gap: 1450 }
      };

      const data = roomData[room] || roomData.living;
      let index = 0;

      const playNext = () => {
        if (!this.ctx || !this.enabled || !this.musicEnabled || this.currentRoom !== room) return;

        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = data.type;
        osc.frequency.value = data.notes[index % data.notes.length];

        gain.gain.setValueAtTime(0.0001, now);
        gain.gain.exponentialRampToValueAtTime(.045, now + .08);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + .72);

        osc.connect(gain);
        gain.connect(this.musicGain);
        osc.start(now);
        osc.stop(now + .76);

        index += 1;
        this.ambientTimer = window.setTimeout(playNext, data.gap);
      };

      playNext();
    }
  }

  window.AudioEngine = new AudioEngine();
})();
