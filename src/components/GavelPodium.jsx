import React, { useState, useEffect } from "react";
import { audioEngine } from "../utils/audioEffects";

export const GavelPodium = ({
  timer,
  isAuctionActive,
  isSold,
  soldPlayer,
  soldTeam,
  soldPrice,
  onManualHammer,
  onOpenAudioSettings,
  currentBid,
  currentBidderTeam,
}) => {
  const [audioState, setAudioState] = useState(audioEngine.getState());
  const [impactShockwave, setImpactShockwave] = useState(false);
  const [gavelStrikeKey, setGavelStrikeKey] = useState(0);

  // Subscribe to audio engine state updates (speaking visualizer, mute, volume)
  useEffect(() => {
    return audioEngine.subscribe((newState) => {
      setAudioState(newState);
    });
  }, []);

  // Trigger hammer strike animation when sold state triggers
  useEffect(() => {
    if (isSold) {
      setImpactShockwave(true);
      setGavelStrikeKey((k) => k + 1);
      const timerId = setTimeout(() => setImpactShockwave(false), 1200);
      return () => clearTimeout(timerId);
    }
  }, [isSold, soldPlayer]);

  // Determine gavel rotation angle based on countdown tension
  let gavelRotation = 0;
  let gavelClass = "transition-transform duration-300 ease-out";
  let stageLabel = "ACTIVE BIDDING";
  let stageColor = "text-green-400 border-green-500/40 bg-green-950/40";

  if (isSold) {
    gavelRotation = 18; // struck down into block
    gavelClass = "transition-transform duration-75 ease-in";
    stageLabel = "🔨 SOLD / HAMMER DOWN";
    stageColor = "text-yellow-400 border-yellow-500/60 bg-yellow-950/70";
  } else if (!isAuctionActive) {
    gavelRotation = 0;
    stageLabel = "WAITING";
    stageColor = "text-gray-400 border-gray-700 bg-gray-900";
  } else if (timer <= 1) {
    gavelRotation = -72; // maximum tension pull back
    gavelClass = "transition-transform duration-200 animate-pulse";
    stageLabel = "⚡ FINAL CALL (GOING TWICE...)";
    stageColor = "text-red-400 border-red-500 bg-red-950/70 animate-pulse";
  } else if (timer === 2) {
    gavelRotation = -48; // mid-pull back
    gavelClass = "transition-transform duration-300";
    stageLabel = "⚠️ GOING TWICE...";
    stageColor = "text-orange-400 border-orange-500 bg-orange-950/60";
  } else if (timer === 3) {
    gavelRotation = -24; // early warning lift
    stageLabel = "⏳ GOING ONCE...";
    stageColor = "text-amber-300 border-amber-500 bg-amber-950/50";
  }

  const handleMuteToggle = () => {
    audioEngine.initContext();
    audioEngine.toggleMute();
  };

  return (
    <div className="w-full max-w-2xl bg-gradient-to-b from-gray-900 via-gray-900/90 to-gray-950 border border-gray-800 rounded-3xl p-4 md:p-5 shadow-2xl relative overflow-hidden mb-6">
      {/* Background Subtle Woodgrain Gradient Accent */}
      <div className="absolute inset-0 bg-gradient-to-r from-amber-950/10 via-transparent to-amber-950/10 pointer-events-none" />

      {/* Top Header Row: Stage Indicator & Audio Quick Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 relative z-10 mb-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-gray-400 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-yellow-400 animate-ping" />
            Auctioneer Podium:
          </span>
          <span
            className={`text-xs px-2.5 py-0.5 rounded-full font-black border transition-all ${stageColor}`}
          >
            {stageLabel}
          </span>
        </div>

        {/* Audio Quick Bar */}
        <div className="flex items-center gap-1.5 bg-gray-950/80 px-2.5 py-1 rounded-xl border border-gray-800 text-xs">
          {/* Speaking Audio Visualizer Waves */}
          {audioState.isSpeaking && (
            <div className="flex items-center gap-0.5 mr-2" title="Auctioneer Speaking">
              <span className="w-1 h-3 bg-cyan-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
              <span className="w-1 h-4 bg-cyan-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
              <span className="w-1 h-2 bg-cyan-400 rounded-full animate-bounce [animation-delay:-0.45s]" />
              <span className="w-1 h-3.5 bg-cyan-400 rounded-full animate-bounce" />
            </div>
          )}

          {/* Mute / Unmute Toggle */}
          <button
            onClick={handleMuteToggle}
            className={`p-1.5 rounded-lg transition-colors font-bold text-sm ${
              audioState.soundFxEnabled || audioState.voiceEnabled
                ? "text-yellow-400 hover:bg-gray-800"
                : "text-red-400 bg-red-950/40 hover:bg-red-900/50"
            }`}
            title={
              audioState.soundFxEnabled || audioState.voiceEnabled
                ? "Mute All Audio"
                : "Unmute Audio"
            }
          >
            {audioState.soundFxEnabled || audioState.voiceEnabled ? "🔊" : "🔇"}
          </button>

          {/* Sound FX Toggle Pill */}
          <button
            onClick={() => {
              audioEngine.initContext();
              audioEngine.setSoundFxEnabled(!audioState.soundFxEnabled);
            }}
            className={`px-2 py-0.5 rounded-lg text-[11px] font-bold transition-colors ${
              audioState.soundFxEnabled
                ? "bg-indigo-600/30 text-indigo-300 border border-indigo-500/40"
                : "bg-gray-800 text-gray-500 line-through"
            }`}
            title="Toggle Sound Effects (Gavel, Ticks, Chimes)"
          >
            SFX
          </button>

          {/* Voice Commentary Toggle Pill */}
          <button
            onClick={() => {
              audioEngine.initContext();
              audioEngine.setVoiceEnabled(!audioState.voiceEnabled);
            }}
            className={`px-2 py-0.5 rounded-lg text-[11px] font-bold transition-colors ${
              audioState.voiceEnabled
                ? "bg-amber-600/30 text-amber-300 border border-amber-500/40"
                : "bg-gray-800 text-gray-500 line-through"
            }`}
            title="Toggle Voice Commentary"
          >
            Voice
          </button>

          {/* Settings Modal Launcher */}
          {onOpenAudioSettings && (
            <button
              onClick={onOpenAudioSettings}
              className="p-1.5 text-gray-400 hover:text-white rounded-lg hover:bg-gray-800 transition-colors"
              title="Open Audio & Sound Settings"
            >
              ⚙️
            </button>
          )}
        </div>
      </div>

      {/* Main Podium Visual Stage: 3D Gavel, Sound Block & Tension Meters */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center bg-gray-950/60 p-3.5 md:p-4 rounded-2xl border border-gray-800/80 relative">
        {/* Left Side: Tension Lights */}
        <div className="sm:col-span-4 flex sm:flex-col items-center sm:items-start justify-between sm:justify-center gap-2">
          <div className="flex items-center gap-2">
            <div
              className={`w-3 h-3 rounded-full transition-all duration-200 ${
                timer <= 3 && isAuctionActive
                  ? "bg-amber-400 shadow-[0_0_12px_#fbbf24]"
                  : "bg-gray-800"
              }`}
            />
            <span
              className={`text-xs font-bold ${
                timer <= 3 && isAuctionActive ? "text-amber-300" : "text-gray-500"
              }`}
            >
              1. Going Once
            </span>
          </div>

          <div className="flex items-center gap-2">
            <div
              className={`w-3 h-3 rounded-full transition-all duration-200 ${
                timer <= 2 && isAuctionActive
                  ? "bg-orange-500 shadow-[0_0_14px_#f97316]"
                  : "bg-gray-800"
              }`}
            />
            <span
              className={`text-xs font-bold ${
                timer <= 2 && isAuctionActive ? "text-orange-400" : "text-gray-500"
              }`}
            >
              2. Going Twice
            </span>
          </div>

          <div className="flex items-center gap-2">
            <div
              className={`w-3 h-3 rounded-full transition-all duration-200 ${
                timer <= 1 && isAuctionActive
                  ? "bg-red-500 animate-ping shadow-[0_0_16px_#ef4444]"
                  : isSold
                  ? "bg-green-400 shadow-[0_0_16px_#4ade80]"
                  : "bg-gray-800"
              }`}
            />
            <span
              className={`text-xs font-bold ${
                isSold
                  ? "text-green-400 font-black"
                  : timer <= 1 && isAuctionActive
                  ? "text-red-400 animate-pulse font-black"
                  : "text-gray-500"
              }`}
            >
              3. Hammer Fall
            </span>
          </div>
        </div>

        {/* Center: 3D Hardwood Gavel & Strike Block */}
        <div className="sm:col-span-5 flex flex-col items-center justify-center relative py-2">
          {/* Shockwave expanding ring on hammer drop */}
          {impactShockwave && (
            <div
              key={gavelStrikeKey}
              className="absolute w-28 h-28 rounded-full border-4 border-yellow-400 animate-ping pointer-events-none -bottom-2"
            />
          )}

          {/* Gavel Assembly (Pivot at bottom-right handle) */}
          <div
            className={`relative w-36 h-28 flex items-end justify-center select-none origin-[80%_85%] ${gavelClass}`}
            style={{ transform: `rotate(${gavelRotation}deg)` }}
          >
            {/* SVG Gavel Design */}
            <svg
              viewBox="0 0 160 120"
              className="w-full h-full drop-shadow-[0_8px_16px_rgba(0,0,0,0.7)]"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                {/* Hardwood Gradient */}
                <linearGradient id="hardwood" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#78350f" />
                  <stop offset="40%" stopColor="#92400e" />
                  <stop offset="70%" stopColor="#451a03" />
                  <stop offset="100%" stopColor="#291102" />
                </linearGradient>
                {/* Brass Ring Gradient */}
                <linearGradient id="brass" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#fef08a" />
                  <stop offset="50%" stopColor="#eab308" />
                  <stop offset="100%" stopColor="#854d0e" />
                </linearGradient>
                {/* Handle Wood Gradient */}
                <linearGradient id="handleWood" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#92400e" />
                  <stop offset="50%" stopColor="#b45309" />
                  <stop offset="100%" stopColor="#78350f" />
                </linearGradient>
              </defs>

              {/* Gavel Handle */}
              <rect
                x="45"
                y="65"
                width="85"
                height="12"
                rx="6"
                transform="rotate(-28 45 65)"
                fill="url(#handleWood)"
                stroke="#1f0c03"
                strokeWidth="1.5"
              />
              {/* Handle Grip Ribs */}
              <line x1="90" y1="42" x2="95" y2="52" stroke="#1f0c03" strokeWidth="2" opacity="0.6" />
              <line x1="98" y1="38" x2="103" y2="48" stroke="#1f0c03" strokeWidth="2" opacity="0.6" />
              <line x1="106" y1="34" x2="111" y2="44" stroke="#1f0c03" strokeWidth="2" opacity="0.6" />

              {/* Gavel Head (Dual Cylindrical Mallet) */}
              <g transform="rotate(62 42 68)">
                {/* Main Body */}
                <rect
                  x="20"
                  y="52"
                  width="44"
                  height="32"
                  rx="4"
                  fill="url(#hardwood)"
                  stroke="#1f0c03"
                  strokeWidth="2"
                />
                {/* Decorative Brass Center Ring */}
                <rect x="37" y="52" width="10" height="32" fill="url(#brass)" stroke="#713f12" strokeWidth="1" />
                {/* Left Mallet Face */}
                <ellipse cx="20" cy="68" rx="5" ry="16" fill="#451a03" stroke="#1f0c03" strokeWidth="1.5" />
                {/* Right Mallet Face */}
                <ellipse cx="64" cy="68" rx="5" ry="16" fill="url(#brass)" stroke="#854d0e" strokeWidth="1.5" />
              </g>
            </svg>
          </div>

          {/* Sound Block (Podium strike anvil) */}
          <div className="relative w-44 h-7 -mt-2 flex items-center justify-center">
            {/* Wooden Sound Base */}
            <div
              className={`w-full h-full bg-gradient-to-r from-amber-950 via-amber-900 to-amber-950 rounded-xl border-2 border-amber-700/80 shadow-lg flex items-center justify-center transition-transform ${
                isSold ? "translate-y-1 scale-98" : ""
              }`}
            >
              {/* Brass Sound Block Inset */}
              <div className="w-28 h-3.5 bg-gradient-to-r from-yellow-600 via-amber-400 to-yellow-600 rounded-md border border-amber-300/60 shadow-inner flex items-center justify-center">
                <span className="text-[9px] font-black text-amber-950 tracking-widest uppercase opacity-80">
                  IPL OFFICIAL
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Sold Badge or Live Callout */}
        <div className="sm:col-span-3 flex flex-col items-center sm:items-end justify-center text-center sm:text-right">
          {isSold ? (
            <div className="bg-gradient-to-r from-yellow-500 to-amber-400 text-black px-3 py-1.5 rounded-xl shadow-lg border-2 border-yellow-300 font-black animate-bounce">
              <span className="block text-sm leading-tight">🔨 SOLD!</span>
              <span className="block text-[11px] font-extrabold truncate max-w-[140px]">
                {soldTeam?.name || "Winning Bidder"}
              </span>
              <span className="block text-xs font-black">
                ₹{soldPrice ? soldPrice.toFixed(2) : "0.00"}Cr
              </span>
            </div>
          ) : currentBidderTeam ? (
            <div className="bg-gray-900/90 border border-gray-800 p-2 rounded-xl text-xs">
              <span className="text-gray-400 block text-[10px]">Leader on Hammer:</span>
              <span className="font-black text-yellow-300 truncate block max-w-[130px]">
                {currentBidderTeam.name}
              </span>
              <span className="font-extrabold text-green-400 text-sm">
                ₹{currentBid?.toFixed(2)}Cr
              </span>
            </div>
          ) : (
            <div className="text-xs text-gray-500 italic">
              Awaiting Opening Bid...
            </div>
          )}

          {/* Manual Hammer Strike Action (if user wants to bring the gavel down) */}
          {onManualHammer && isAuctionActive && !isSold && (
            <button
              onClick={() => {
                audioEngine.initContext();
                onManualHammer();
              }}
              className="mt-2 text-[11px] px-2.5 py-1 bg-yellow-500/20 hover:bg-yellow-500/30 border border-yellow-400/50 text-yellow-300 font-bold rounded-lg transition-colors flex items-center gap-1"
            >
              <span>🔨 Drop Gavel</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
