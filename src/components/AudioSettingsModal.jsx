import React, { useState, useEffect } from "react";
import { audioEngine } from "../utils/audioEffects";

export const AudioSettingsModal = ({ isOpen, onClose }) => {
  const [audioState, setAudioState] = useState(audioEngine.getState());

  useEffect(() => {
    return audioEngine.subscribe((newState) => {
      setAudioState(newState);
    });
  }, []);

  if (!isOpen) return null;

  const handleVolumeChange = (e) => {
    const val = parseFloat(e.target.value);
    audioEngine.setMasterVolume(val);
  };

  const handleVoiceRateChange = (e) => {
    const val = parseFloat(e.target.value);
    audioEngine.setVoiceRate(val);
  };

  const handleVoiceSelect = (e) => {
    audioEngine.setVoiceURI(e.target.value);
  };

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-md flex justify-center items-center z-50 p-4">
      <div className="bg-gray-900 border-2 border-indigo-500/80 p-6 rounded-3xl shadow-2xl max-w-lg w-full text-white relative max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-gray-800 hover:bg-red-600 text-white font-bold flex items-center justify-center transition-colors"
          onClick={onClose}
        >
          ✕
        </button>

        {/* Modal Title */}
        <div className="flex items-center gap-3 mb-5 border-b border-gray-800 pb-4">
          <div className="w-10 h-10 rounded-2xl bg-indigo-600/30 border border-indigo-500/60 flex items-center justify-center text-xl">
            🎙️
          </div>
          <div>
            <h2 className="text-xl font-black text-white">Audio & Sound Settings</h2>
            <p className="text-xs text-gray-400">
              Configure Web Audio FX, Gavel Strike, and Auctioneer Voice Commentary
            </p>
          </div>
        </div>

        {/* Main Controls */}
        <div className="space-y-4">
          {/* Master Volume Slider */}
          <div className="bg-gray-950/70 p-4 rounded-2xl border border-gray-800">
            <div className="flex justify-between items-center mb-2">
              <label className="text-xs font-bold text-gray-300 flex items-center gap-2">
                <span>🔊 Master Volume</span>
              </label>
              <span className="text-xs font-mono font-bold text-yellow-400">
                {Math.round(audioState.masterVolume * 100)}%
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={audioState.masterVolume}
              onChange={handleVolumeChange}
              className="w-full h-2 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-yellow-400"
            />
          </div>

          {/* Sound FX & Commentary Toggles */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="bg-gray-950/70 p-3.5 rounded-2xl border border-gray-800 flex items-center justify-between">
              <div>
                <span className="text-xs font-black text-white block">Sound Effects</span>
                <span className="text-[11px] text-gray-400">Gavel, ticks, chimes</span>
              </div>
              <button
                onClick={() => {
                  audioEngine.initContext();
                  audioEngine.setSoundFxEnabled(!audioState.soundFxEnabled);
                }}
                className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors ${
                  audioState.soundFxEnabled ? "bg-green-500 justify-end" : "bg-gray-700 justify-start"
                }`}
              >
                <div className="w-4 h-4 rounded-full bg-white shadow-md" />
              </button>
            </div>

            <div className="bg-gray-950/70 p-3.5 rounded-2xl border border-gray-800 flex items-center justify-between">
              <div>
                <span className="text-xs font-black text-white block">Auctioneer Voice</span>
                <span className="text-[11px] text-gray-400">Speech commentary</span>
              </div>
              <button
                onClick={() => {
                  audioEngine.initContext();
                  audioEngine.setVoiceEnabled(!audioState.voiceEnabled);
                }}
                className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors ${
                  audioState.voiceEnabled ? "bg-amber-500 justify-end" : "bg-gray-700 justify-start"
                }`}
              >
                <div className="w-4 h-4 rounded-full bg-white shadow-md" />
              </button>
            </div>
          </div>

          {/* Voice Settings: Voice Picker & Speed */}
          {audioState.availableVoices && audioState.availableVoices.length > 0 && (
            <div className="bg-gray-950/70 p-4 rounded-2xl border border-gray-800 space-y-3">
              <div>
                <label className="text-xs font-bold text-gray-300 block mb-1">
                  🗣️ Auctioneer Voice Model
                </label>
                <select
                  value={audioState.selectedVoiceURI || ""}
                  onChange={handleVoiceSelect}
                  className="w-full bg-gray-900 border border-gray-700 rounded-xl p-2 text-xs text-white focus:outline-none focus:border-yellow-400"
                >
                  {audioState.availableVoices.map((v) => (
                    <option key={v.voiceURI} value={v.voiceURI}>
                      {v.name} ({v.lang})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-bold text-gray-300">
                    ⚡ Speech Cadence / Speed
                  </label>
                  <span className="text-xs font-mono font-bold text-cyan-400">
                    {audioState.voiceRate.toFixed(2)}x
                  </span>
                </div>
                <input
                  type="range"
                  min="0.8"
                  max="1.35"
                  step="0.05"
                  value={audioState.voiceRate}
                  onChange={handleVoiceRateChange}
                  className="w-full h-2 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                />
              </div>
            </div>
          )}

          {/* Sound FX Interactive Test Pad */}
          <div className="bg-gray-950/70 p-4 rounded-2xl border border-gray-800">
            <h4 className="text-xs font-black text-yellow-400 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
              <span>🎛️ Interactive Sound Test Pad</span>
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              <button
                onClick={() => {
                  audioEngine.initContext();
                  audioEngine.playGavelStrike(1.0);
                }}
                className="p-2.5 bg-gray-900 hover:bg-amber-950/60 border border-gray-700 hover:border-amber-500 rounded-xl text-xs font-bold text-gray-200 transition-all text-center flex flex-col items-center gap-1"
              >
                <span className="text-base">🔨</span>
                <span>Gavel Strike</span>
              </button>

              <button
                onClick={() => {
                  audioEngine.initContext();
                  audioEngine.playClockTick(1);
                }}
                className="p-2.5 bg-gray-900 hover:bg-red-950/60 border border-gray-700 hover:border-red-500 rounded-xl text-xs font-bold text-gray-200 transition-all text-center flex flex-col items-center gap-1"
              >
                <span className="text-base">⏳</span>
                <span>Tension Tick</span>
              </button>

              <button
                onClick={() => {
                  audioEngine.initContext();
                  audioEngine.playBidSound(true, 5.0);
                }}
                className="p-2.5 bg-gray-900 hover:bg-blue-950/60 border border-gray-700 hover:border-blue-500 rounded-xl text-xs font-bold text-gray-200 transition-all text-center flex flex-col items-center gap-1"
              >
                <span className="text-base">🙋‍♂️</span>
                <span>Bid Paddle</span>
              </button>

              <button
                onClick={() => {
                  audioEngine.initContext();
                  audioEngine.playMegaBidChime();
                }}
                className="p-2.5 bg-gray-900 hover:bg-yellow-950/60 border border-gray-700 hover:border-yellow-500 rounded-xl text-xs font-bold text-gray-200 transition-all text-center flex flex-col items-center gap-1"
              >
                <span className="text-base">💰</span>
                <span>Mega-Bid Chime</span>
              </button>

              <button
                onClick={() => {
                  audioEngine.initContext();
                  audioEngine.playBiddingWarHorn();
                }}
                className="p-2.5 bg-gray-900 hover:bg-purple-950/60 border border-gray-700 hover:border-purple-500 rounded-xl text-xs font-bold text-gray-200 transition-all text-center flex flex-col items-center gap-1"
              >
                <span className="text-base">🎺</span>
                <span>Rivalry Horn</span>
              </button>

              <button
                onClick={() => {
                  audioEngine.initContext();
                  audioEngine.playApplause();
                }}
                className="p-2.5 bg-gray-900 hover:bg-emerald-950/60 border border-gray-700 hover:border-emerald-500 rounded-xl text-xs font-bold text-gray-200 transition-all text-center flex flex-col items-center gap-1"
              >
                <span className="text-base">👏</span>
                <span>Applause</span>
              </button>
            </div>

            {/* Test Commentary Button */}
            <button
              onClick={() => {
                audioEngine.initContext();
                audioEngine.speakAuctioneer(
                  "Bid raised to 18 Crore by Chennai Super Kings! Going once, going twice, SOLD!",
                  { priority: true }
                );
              }}
              className="mt-3 w-full py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-black rounded-xl transition-all shadow-md flex items-center justify-center gap-2"
            >
              <span>🎙️ Test Live Auctioneer Commentary Callout</span>
            </button>
          </div>
        </div>

        {/* Footer OK */}
        <div className="mt-5 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-yellow-500 hover:bg-yellow-400 text-black font-black text-xs rounded-xl shadow-lg transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
