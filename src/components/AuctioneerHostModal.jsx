// src/components/AuctioneerHostModal.jsx
import React, { useState } from "react";
import { audioEngine } from "../utils/audioEffects";
import { toast } from "react-toastify";

export default function AuctioneerHostModal({
  isOpen,
  onClose,
  currentPlayer,
  currentBid,
  currentBidder,
  timer,
  isPaused,
  onTogglePause,
  onForceSold,
  onForceUnsold,
  onNextPlayer,
  onSetTimerSpeed,
  timerSpeedSetting,
  syncEngine,
}) {
  const [customAnnouncement, setCustomAnnouncement] = useState("");
  const [hostNotes, setHostNotes] = useState("");

  if (!isOpen) return null;

  const handleStrikeGavel = (actionType) => {
    if (actionType === "going_once") {
      audioEngine.playTensionTick();
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        audioEngine.speak(`${currentPlayer ? currentPlayer.name : "Player"} at ${currentBid} Crore, going once!`);
      }
      if (syncEngine) {
        syncEngine.send("HOST_CALL", { text: `Going once at ₹${currentBid} Cr!` });
      }
      toast.info(`🔨 "Going once at ₹${currentBid} Cr!"`);
    } else if (actionType === "going_twice") {
      audioEngine.playTensionTick();
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        audioEngine.speak(`At ${currentBid} Crore, going twice! Any further bids?`);
      }
      if (syncEngine) {
        syncEngine.send("HOST_CALL", { text: `Going twice at ₹${currentBid} Cr! Any further bids?` });
      }
      toast.warning(`🔨 "Going twice at ₹${currentBid} Cr!"`);
    } else if (actionType === "sold") {
      audioEngine.playGavelStrike();
      if (onForceSold) onForceSold();
      if (syncEngine) {
        syncEngine.send("HOST_SOLD", { player: currentPlayer, amount: currentBid, bidder: currentBidder });
      }
      toast.success(`💥 SOLD to ${currentBidder ? currentBidder.name : "Franchise"}!`);
    } else if (actionType === "unsold") {
      audioEngine.playUnsoldBuzzer();
      if (onForceUnsold) onForceUnsold();
      if (syncEngine) {
        syncEngine.send("HOST_UNSOLD", { player: currentPlayer });
      }
      toast.error(`❌ Declared UNSOLD.`);
    }
  };

  const handleBroadcastAnnouncement = (e) => {
    e?.preventDefault();
    if (!customAnnouncement.trim()) return;

    if (syncEngine) {
      syncEngine.send("HOST_ANNOUNCEMENT", { text: customAnnouncement.trim() });
    }
    audioEngine.playWarningGong();
    toast.info(`🎙️ Host Announcement: "${customAnnouncement.trim()}"`);
    setCustomAnnouncement("");
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 animate-fadeIn">
      <div className="bg-gradient-to-b from-gray-900 via-gray-900 to-gray-950 border-2 border-yellow-500/50 w-full max-w-3xl rounded-3xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden">
        {/* Header */}
        <div className="p-4 bg-gradient-to-r from-amber-950 via-gray-900 to-yellow-950 border-b border-yellow-500/30 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-3xl p-2 rounded-2xl bg-yellow-500/20 border border-yellow-500/40">🎙️</span>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg md:text-xl font-black text-yellow-400">Auctioneer Host Podium</h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-900/60 text-amber-200 border border-amber-500/40">
                  Live Master Controller
                </span>
              </div>
              <p className="text-xs text-gray-400">
                You control the gavel, auction pacing, announcements, and hammer knockdown.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white flex items-center justify-center transition"
          >
            ✕
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 overflow-y-auto space-y-6 flex-1 text-white">
          {/* Current Lot Stage Telemetry */}
          <div className="bg-gray-950 p-4 rounded-2xl border border-gray-800 flex flex-wrap items-center justify-between gap-4">
            <div>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">Current Lot</span>
              <div className="text-base font-black text-white flex items-center gap-2">
                <span>{currentPlayer ? currentPlayer.name : "Waiting for next lot..."}</span>
                {currentPlayer && (
                  <span className="text-xs text-yellow-400 font-semibold">({currentPlayer.role})</span>
                )}
              </div>
              <div className="text-xs text-gray-400 mt-0.5">
                Base Price: ₹{currentPlayer ? currentPlayer.basePrice : 0} Cr · Country: {currentPlayer ? currentPlayer.country : "N/A"}
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="text-right">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">Current Bid</span>
                <span className="text-2xl font-black text-yellow-400">₹{currentBid} Cr</span>
                <span className="text-[11px] block font-bold text-cyan-300">
                  {currentBidder ? currentBidder.name : "No Bids Yet"}
                </span>
              </div>

              <div className="p-3 bg-gray-900 border border-gray-700 rounded-2xl text-center min-w-[70px]">
                <span className="text-[10px] text-gray-400 uppercase font-bold block">Timer</span>
                <span className="text-2xl font-black text-rose-400 font-mono">{timer}s</span>
              </div>
            </div>
          </div>

          {/* Gavel Actions (Going Once, Going Twice, SOLD, UNSOLD) */}
          <div className="space-y-2">
            <label className="text-xs font-black text-yellow-400 uppercase tracking-wider block">
              🔨 Live Gavel Knockdown Controls
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
              <button
                onClick={() => handleStrikeGavel("going_once")}
                className="py-3 px-3 rounded-2xl bg-amber-950/40 hover:bg-amber-900/60 border border-amber-600/50 text-amber-200 font-black text-xs transition-all shadow-md active:scale-95"
              >
                1️⃣ Going Once!
              </button>

              <button
                onClick={() => handleStrikeGavel("going_twice")}
                className="py-3 px-3 rounded-2xl bg-orange-950/40 hover:bg-orange-900/60 border border-orange-600/50 text-orange-200 font-black text-xs transition-all shadow-md active:scale-95"
              >
                2️⃣ Going Twice!
              </button>

              <button
                onClick={() => handleStrikeGavel("sold")}
                disabled={!currentBidder}
                className={`py-3 px-3 rounded-2xl font-black text-xs transition-all shadow-lg active:scale-95 border ${
                  currentBidder
                    ? "bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white border-emerald-400/50 shadow-emerald-950/50"
                    : "bg-gray-800 text-gray-500 border-gray-700 cursor-not-allowed"
                }`}
              >
                💥 Hammer: SOLD!
              </button>

              <button
                onClick={() => handleStrikeGavel("unsold")}
                className="py-3 px-3 rounded-2xl bg-rose-950/40 hover:bg-rose-900/60 border border-rose-600/50 text-rose-300 font-black text-xs transition-all shadow-md active:scale-95"
              >
                ❌ Strike: UNSOLD!
              </button>
            </div>
          </div>

          {/* Auction Pacing & Speed Governor */}
          <div className="bg-gray-950 p-4 rounded-2xl border border-gray-800 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-gray-300 uppercase tracking-wider">
                ⏱️ Pacing & Speed Governor
              </h4>
              <button
                onClick={onTogglePause}
                className={`px-3 py-1 rounded-xl text-xs font-black transition-all ${
                  isPaused
                    ? "bg-emerald-500 text-black shadow-md"
                    : "bg-amber-500 text-black shadow-md"
                }`}
              >
                {isPaused ? "▶️ Resume Auction" : "⏸️ Pause Clock"}
              </button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {[
                { id: "manual", label: "Manual Gavel", desc: "No auto-timeout" },
                { id: "blitz", label: "3s Blitz", desc: "Fast-paced" },
                { id: "standard", label: "5s Standard", desc: "TV pace" },
                { id: "tactical", label: "10s Tactical", desc: "Deep strategy" },
              ].map((speed) => (
                <button
                  key={speed.id}
                  onClick={() => {
                    if (onSetTimerSpeed) onSetTimerSpeed(speed.id);
                    toast.info(`Pacing set to ${speed.label}`);
                  }}
                  className={`p-2.5 rounded-xl border text-left transition-all ${
                    timerSpeedSetting === speed.id
                      ? "bg-yellow-500/20 border-yellow-500/70 text-yellow-300"
                      : "bg-gray-900 border-gray-800 text-gray-400 hover:bg-gray-850"
                  }`}
                >
                  <span className="font-extrabold text-xs block text-white">{speed.label}</span>
                  <span className="text-[10px] text-gray-400 block">{speed.desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Soundboard FX Matrix */}
          <div className="bg-gray-950 p-4 rounded-2xl border border-gray-800 space-y-3">
            <h4 className="text-xs font-bold text-purple-300 uppercase tracking-wider flex items-center gap-1.5">
              <span>🔊</span> Auctioneer FX Soundboard
            </h4>
            <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
              {[
                { label: "🔨 Gavel Knock", action: () => audioEngine.playGavelStrike() },
                { label: "🛎️ Tension Tick", action: () => audioEngine.playTensionTick() },
                { label: "🔔 Warning Bell", action: () => audioEngine.playWarningGong() },
                { label: "🎺 Outbid Chime", action: () => audioEngine.playOutbidChime() },
                { label: "🎉 Sold Fanfare", action: () => audioEngine.playSoldCelebration() },
                { label: "🚫 Unsold Buzzer", action: () => audioEngine.playUnsoldBuzzer() },
              ].map((fx, i) => (
                <button
                  key={i}
                  onClick={fx.action}
                  className="p-2 bg-gray-900 hover:bg-gray-800 text-gray-200 border border-gray-800 rounded-xl text-[11px] font-bold transition text-center hover:border-purple-500/50"
                >
                  {fx.label}
                </button>
              ))}
            </div>
          </div>

          {/* Broadcast Announcement Bar */}
          <form onSubmit={handleBroadcastAnnouncement} className="space-y-2">
            <label className="text-xs font-black text-gray-300 uppercase tracking-wider block">
              📣 Host Floor Announcement
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={customAnnouncement}
                onChange={(e) => setCustomAnnouncement(e.target.value)}
                placeholder="e.g. Bidding opened at ₹2 Cr! Franchises, raise your paddles!"
                className="flex-1 bg-gray-950 border border-gray-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-yellow-500"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-yellow-500 hover:bg-yellow-400 text-black font-black text-xs rounded-xl shadow-md transition"
              >
                Broadcast
              </button>
            </div>
          </form>

          {/* Host Private Notes */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">
              📝 Private Host Notes / Scratchpad
            </label>
            <textarea
              value={hostNotes}
              onChange={(e) => setHostNotes(e.target.value)}
              placeholder="Record RTM observations, bidding patterns, or custom lot orders..."
              className="w-full bg-gray-950 border border-gray-800 rounded-xl p-2.5 text-xs text-gray-300 h-16 focus:outline-none focus:border-gray-600"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-gray-950 border-t border-gray-800 flex items-center justify-between">
          <button
            onClick={onNextPlayer}
            className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs rounded-xl transition shadow"
          >
            ⏭️ Skip to Next Lot
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white font-bold text-xs rounded-xl transition"
          >
            Close Podium
          </button>
        </div>
      </div>
    </div>
  );
}
