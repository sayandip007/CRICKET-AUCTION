// Web Audio API Procedural Sound Engine & SpeechSynthesis Commentary for Cricket Auction Simulator

class AudioEngine {
  constructor() {
    this.ctx = null;
    this.masterGain = null;
    this.soundFxEnabled = true;
    this.voiceEnabled = true;
    this.masterVolume = 0.8;
    this.voiceRate = 1.05;
    this.voicePitch = 1.0;
    this.selectedVoiceURI = null;
    this.isSpeaking = false;
    this.listeners = new Set();
    this.lastBidSpeechTime = 0;
    this.speechUtterance = null;
    this.availableVoices = [];

    // Initialize speech synthesis voices if available
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      this.populateVoices();
      window.speechSynthesis.onvoiceschanged = () => this.populateVoices();
    }
  }

  // Subscribe to audio state changes (volume, mute, visualizer speaking state)
  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  notify() {
    const state = this.getState();
    this.listeners.forEach((fn) => fn(state));
  }

  getState() {
    return {
      soundFxEnabled: this.soundFxEnabled,
      voiceEnabled: this.voiceEnabled,
      masterVolume: this.masterVolume,
      voiceRate: this.voiceRate,
      voicePitch: this.voicePitch,
      isSpeaking: this.isSpeaking,
      availableVoices: this.availableVoices,
      selectedVoiceURI: this.selectedVoiceURI,
    };
  }

  // Populate system speech voices and pick preferred English voice
  populateVoices() {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    const voices = window.speechSynthesis.getVoices() || [];
    this.availableVoices = voices.filter(
      (v) => v.lang.startsWith("en") || v.lang.includes("IN") || v.lang.includes("GB") || v.lang.includes("US")
    );
    if (this.availableVoices.length === 0) {
      this.availableVoices = voices;
    }

    if (!this.selectedVoiceURI && this.availableVoices.length > 0) {
      // Prefer British or Indian or natural English voices for authentic cricket auction vibe
      const preferred =
        this.availableVoices.find((v) => v.lang.includes("GB") || v.name.includes("UK") || v.name.includes("British")) ||
        this.availableVoices.find((v) => v.lang.includes("IN") || v.name.includes("India")) ||
        this.availableVoices.find((v) => v.name.includes("Natural") || v.name.includes("Google")) ||
        this.availableVoices[0];
      if (preferred) {
        this.selectedVoiceURI = preferred.voiceURI;
      }
    }
    this.notify();
  }

  // Initialize or resume the Web Audio Context upon user interaction
  initContext() {
    if (typeof window === "undefined") return null;
    if (!this.ctx) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (!AudioContextClass) return null;
      this.ctx = new AudioContextClass();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(this.soundFxEnabled ? this.masterVolume : 0, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);
    }
    if (this.ctx && this.ctx.state === "suspended") {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  setSoundFxEnabled(enabled) {
    this.soundFxEnabled = !!enabled;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(this.soundFxEnabled ? this.masterVolume : 0, this.ctx.currentTime);
    }
    this.notify();
  }

  setVoiceEnabled(enabled) {
    this.voiceEnabled = !!enabled;
    if (!this.voiceEnabled && typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      this.isSpeaking = false;
    }
    this.notify();
  }

  setMasterVolume(vol) {
    const clamped = Math.max(0, Math.min(1, parseFloat(vol) || 0));
    this.masterVolume = clamped;
    if (this.masterGain && this.ctx && this.soundFxEnabled) {
      this.masterGain.gain.setValueAtTime(this.masterVolume, this.ctx.currentTime);
    }
    this.notify();
  }

  setVoiceRate(rate) {
    this.voiceRate = Math.max(0.7, Math.min(1.5, parseFloat(rate) || 1.05));
    this.notify();
  }

  setVoiceURI(uri) {
    this.selectedVoiceURI = uri;
    this.notify();
  }

  toggleMute() {
    const shouldMute = this.soundFxEnabled || this.voiceEnabled;
    if (shouldMute) {
      this.setSoundFxEnabled(false);
      this.setVoiceEnabled(false);
    } else {
      this.setSoundFxEnabled(true);
      this.setVoiceEnabled(true);
    }
  }

  // ==========================================
  // PROCEDURAL SOUND EFFECT SYNTHESIS
  // ==========================================

  // 1. Realistic Wooden Gavel Strike (Oak / Mahogany hammer hitting auction sound block)
  playGavelStrike(intensity = 1.0) {
    const ctx = this.initContext();
    if (!ctx || !this.soundFxEnabled) return;

    const now = ctx.currentTime;
    const strikeVolume = Math.min(1.0, Math.max(0.1, intensity)) * this.masterVolume;

    // A. High frequency crack / transient (White noise burst filtered at 2.4kHz)
    const bufferSize = ctx.sampleRate * 0.05; // 50ms buffer
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.008));
    }

    const noiseSource = ctx.createBufferSource();
    noiseSource.buffer = buffer;

    const noiseFilter = ctx.createBiquadFilter();
    noiseFilter.type = "bandpass";
    noiseFilter.frequency.setValueAtTime(2400, now);
    noiseFilter.Q.setValueAtTime(3.5, now);

    const noiseGain = ctx.createGain();
    noiseGain.gain.setValueAtTime(strikeVolume * 0.9, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.045);

    noiseSource.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(ctx.destination);
    noiseSource.start(now);

    // B. Wooden body resonance (Hardwood fundamental & overtone)
    const woodOsc1 = ctx.createOscillator();
    const woodGain1 = ctx.createGain();
    woodOsc1.type = "sine";
    woodOsc1.frequency.setValueAtTime(460, now);
    woodOsc1.frequency.exponentialRampToValueAtTime(280, now + 0.08);

    woodGain1.gain.setValueAtTime(strikeVolume * 0.75, now);
    woodGain1.gain.exponentialRampToValueAtTime(0.001, now + 0.09);

    woodOsc1.connect(woodGain1);
    woodGain1.connect(ctx.destination);
    woodOsc1.start(now);
    woodOsc1.stop(now + 0.1);

    const woodOsc2 = ctx.createOscillator();
    const woodGain2 = ctx.createGain();
    woodOsc2.type = "triangle";
    woodOsc2.frequency.setValueAtTime(820, now);
    woodOsc2.frequency.exponentialRampToValueAtTime(540, now + 0.06);

    woodGain2.gain.setValueAtTime(strikeVolume * 0.45, now);
    woodGain2.gain.exponentialRampToValueAtTime(0.001, now + 0.07);

    woodOsc2.connect(woodGain2);
    woodGain2.connect(ctx.destination);
    woodOsc2.start(now);
    woodOsc2.stop(now + 0.08);

    // C. Deep sub-frequency tactile thump (95 Hz -> 40 Hz)
    const subOsc = ctx.createOscillator();
    const subGain = ctx.createGain();
    subOsc.type = "sine";
    subOsc.frequency.setValueAtTime(95, now);
    subOsc.frequency.exponentialRampToValueAtTime(40, now + 0.12);

    subGain.gain.setValueAtTime(strikeVolume * 0.85, now);
    subGain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);

    subOsc.connect(subGain);
    subGain.connect(ctx.destination);
    subOsc.start(now);
    subOsc.stop(now + 0.15);
  }

  // Triple Gavel Strike for definitive closing sequence
  playTripleGavelStrike() {
    this.playGavelStrike(0.4);
    setTimeout(() => this.playGavelStrike(0.65), 350);
    setTimeout(() => this.playGavelStrike(1.0), 700);
  }

  // 2. Tension Countdown Ticking Sound (Acoustic woodblock clock tick at 3s, 2s, 1s)
  playClockTick(secondsLeft) {
    const ctx = this.initContext();
    if (!ctx || !this.soundFxEnabled) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    // Pitch rises and gain intensifies as countdown approaches 0
    let freq = 850;
    let vol = 0.45;
    if (secondsLeft === 2) {
      freq = 1150;
      vol = 0.6;
    } else if (secondsLeft === 1) {
      freq = 1580;
      vol = 0.8;
    }

    osc.type = "sine";
    osc.frequency.setValueAtTime(freq, now);
    osc.frequency.exponentialRampToValueAtTime(freq * 0.7, now + 0.025);

    filter.type = "highpass";
    filter.frequency.setValueAtTime(400, now);

    gain.gain.setValueAtTime(vol * this.masterVolume, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.035);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.04);
  }

  // 3. Bid Sound (Paddle click / Pop + celebratory chime for mega-bids)
  playBidSound(isUser = false, bidAmount = 0) {
    const ctx = this.initContext();
    if (!ctx || !this.soundFxEnabled) return;

    const now = ctx.currentTime;

    // Paddle raise pop
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = isUser ? "triangle" : "sine";
    const startFreq = isUser ? 520 : 440;
    osc.frequency.setValueAtTime(startFreq, now);
    osc.frequency.exponentialRampToValueAtTime(startFreq * 1.5, now + 0.06);

    gain.gain.setValueAtTime((isUser ? 0.6 : 0.4) * this.masterVolume, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.07);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.08);

    // If bid is high (>= 10Cr or >= 15Cr), add celebratory golden chime
    if (bidAmount >= 15.0) {
      this.playMegaBidChime();
    } else if (bidAmount >= 8.0) {
      this.playMilestoneChime();
    }
  }

  // Milestone Bid Chime (Two ascending crystalline glass tones)
  playMilestoneChime() {
    const ctx = this.initContext();
    if (!ctx || !this.soundFxEnabled) return;

    const notes = [1046.5, 1318.5]; // C6, E6
    notes.forEach((freq, idx) => {
      const now = ctx.currentTime + idx * 0.08;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, now);

      gain.gain.setValueAtTime(0.35 * this.masterVolume, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.35);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.36);
    });
  }

  // Mega Bid Chime (₹15Cr+ 4-note sparkling arpeggio)
  playMegaBidChime() {
    const ctx = this.initContext();
    if (!ctx || !this.soundFxEnabled) return;

    const notes = [1046.5, 1318.5, 1567.98, 2093.0]; // C6, E6, G6, C7
    notes.forEach((freq, idx) => {
      const now = ctx.currentTime + idx * 0.07;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, now);

      gain.gain.setValueAtTime(0.4 * this.masterVolume, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.45);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.46);
    });
  }

  // 4. Unsold flat dual-tap
  playUnsoldBuzzer() {
    const ctx = this.initContext();
    if (!ctx || !this.soundFxEnabled) return;

    const now = ctx.currentTime;
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gain = ctx.createGain();

    osc1.type = "sine";
    osc2.type = "triangle";
    osc1.frequency.setValueAtTime(320, now);
    osc1.frequency.exponentialRampToValueAtTime(180, now + 0.18);
    osc2.frequency.setValueAtTime(240, now);
    osc2.frequency.exponentialRampToValueAtTime(140, now + 0.18);

    gain.gain.setValueAtTime(0.4 * this.masterVolume, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(ctx.destination);

    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + 0.22);
    osc2.stop(now + 0.22);
  }

  // 5. Bidding War & Rivalry Horn
  playBiddingWarHorn() {
    const ctx = this.initContext();
    if (!ctx || !this.soundFxEnabled) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const filter = ctx.createBiquadFilter();
    const gain = ctx.createGain();

    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(146.83, now); // D3
    osc.frequency.linearRampToValueAtTime(164.81, now + 0.25); // E3

    filter.type = "lowpass";
    filter.frequency.setValueAtTime(300, now);
    filter.frequency.exponentialRampToValueAtTime(1200, now + 0.18);
    filter.frequency.exponentialRampToValueAtTime(250, now + 0.45);

    gain.gain.setValueAtTime(0.01, now);
    gain.gain.linearRampToValueAtTime(0.45 * this.masterVolume, now + 0.15);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.52);
  }

  // 6. Right to Match (RTM) Alert Shimmer
  playRTMAlert() {
    const ctx = this.initContext();
    if (!ctx || !this.soundFxEnabled) return;

    const notes = [659.25, 880.0, 1174.66, 1760.0]; // E5, A5, D6, A6
    notes.forEach((freq, idx) => {
      const now = ctx.currentTime + idx * 0.055;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "triangle";
      osc.frequency.setValueAtTime(freq, now);

      gain.gain.setValueAtTime(0.45 * this.masterVolume, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.3);
    });
  }

  // 7. Stadium Applause / Cheering Synthesis
  playApplause() {
    const ctx = this.initContext();
    if (!ctx || !this.soundFxEnabled) return;

    const now = ctx.currentTime;
    const duration = 1.2;
    const bufferSize = ctx.sampleRate * duration;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);

    // Burst noise clapping envelope
    for (let i = 0; i < bufferSize; i++) {
      const t = i / ctx.sampleRate;
      const clapMod = Math.sin(t * 40 * Math.PI) > 0.3 ? 1.0 : 0.25;
      data[i] = (Math.random() * 2 - 1) * clapMod;
    }

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = "bandpass";
    filter.frequency.setValueAtTime(1400, now);
    filter.Q.setValueAtTime(1.5, now);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.01, now);
    gain.gain.linearRampToValueAtTime(0.55 * this.masterVolume, now + 0.2);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    noise.start(now);
  }

  // ==========================================
  // AUCTIONEER SPEECH SYNTHESIS ENGINE
  // ==========================================

  cleanTextForSpeech(text) {
    if (!text) return "";
    return text
      .replace(/₹/g, "")
      .replace(/Cr/gi, " Crore")
      .replace(/\.00/g, "")
      .replace(/CSK/g, "Chennai Super Kings")
      .replace(/MI/g, "Mumbai Indians")
      .replace(/RCB/g, "Royal Challengers")
      .replace(/KKR/g, "Kolkata Knight Riders")
      .replace(/DC/g, "Delhi Capitals")
      .replace(/RR/g, "Rajasthan Royals")
      .replace(/SRH/g, "Sunrisers Hyderabad")
      .replace(/PBKS/g, "Punjab Kings")
      .replace(/GT/g, "Gujarat Titans")
      .replace(/LSG/g, "Lucknow Super Giants")
      .trim();
  }

  speakAuctioneer(rawText, options = {}) {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    if (!this.voiceEnabled) return;

    const { priority = false, debounceBid = false } = options;
    const now = Date.now();

    // Debounce rapid bids so auctioneer speech doesn't lag 10 seconds behind
    if (debounceBid && now - this.lastBidSpeechTime < 1400 && !priority) {
      return;
    }

    const cleaned = this.cleanTextForSpeech(rawText);
    if (!cleaned) return;

    // If high priority (e.g. "SOLD", "GOING TWICE"), immediately cancel pending speech
    if (priority || window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
    }

    const utterance = new SpeechSynthesisUtterance(cleaned);
    utterance.rate = this.voiceRate;
    utterance.pitch = this.voicePitch;
    utterance.volume = this.masterVolume;

    if (this.selectedVoiceURI && this.availableVoices.length > 0) {
      const match = this.availableVoices.find((v) => v.voiceURI === this.selectedVoiceURI);
      if (match) utterance.voice = match;
    }

    utterance.onstart = () => {
      this.isSpeaking = true;
      this.notify();
    };

    utterance.onend = () => {
      this.isSpeaking = false;
      this.notify();
    };

    utterance.onerror = () => {
      this.isSpeaking = false;
      this.notify();
    };

    this.speechUtterance = utterance;
    this.lastBidSpeechTime = now;
    window.speechSynthesis.speak(utterance);
  }

  // Canonical auctioneer commentary announcements
  announceBid(teamName, amount) {
    const formattedAmount = Number(amount).toFixed(2).replace(/\.00$/, "");
    this.speakAuctioneer(`Bid raised to ${formattedAmount} Crore by ${teamName}`, {
      debounceBid: true,
    });
  }

  announceGoingOnce(amount, teamName) {
    const formattedAmount = Number(amount).toFixed(2).replace(/\.00$/, "");
    this.speakAuctioneer(`Going once at ${formattedAmount} Crore to ${teamName}`, {
      priority: true,
    });
  }

  announceGoingTwice(amount, teamName) {
    const formattedAmount = Number(amount).toFixed(2).replace(/\.00$/, "");
    this.speakAuctioneer(`Going twice at ${formattedAmount} Crore to ${teamName}... Any more bids?`, {
      priority: true,
    });
  }

  announceSold(playerName, teamName, amount, isRTM = false) {
    const formattedAmount = Number(amount).toFixed(2).replace(/\.00$/, "");
    const rtmClause = isRTM ? " on Right to Match!" : "";
    this.speakAuctioneer(`SOLD! ${playerName} sold to ${teamName} for ${formattedAmount} Crore${rtmClause}!`, {
      priority: true,
    });
  }

  announceUnsold(playerName) {
    this.speakAuctioneer(`Unsold! ${playerName} passes without bid.`, {
      priority: true,
    });
  }

  announceRTM(prevTeamName, playerName) {
    this.speakAuctioneer(`Right to Match card exercised by ${prevTeamName} on ${playerName}!`, {
      priority: true,
    });
  }

  announceBiddingWar(teamA, teamB) {
    this.speakAuctioneer(`Bidding war between ${teamA} and ${teamB}!`, {
      priority: true,
    });
  }
}

export const audioEngine = new AudioEngine();
