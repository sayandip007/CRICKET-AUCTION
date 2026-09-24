import React from "react";

export default function BiddingWarBanner({
  activeRivalry,
  teamA,
  teamB,
  bidsCount = 2,
  latestCommentary = "",
}) {
  if (!teamA || !teamB) return null;

  // Intensity level calculation
  let intensity = "Heated Duel";
  let intensityBadge = "bg-amber-500/20 border-amber-500/50 text-amber-300";
  let pulseSpeed = "animate-pulse";

  if (bidsCount >= 6) {
    intensity = "🔥 ALL-OUT BIDDING WAR";
    intensityBadge = "bg-red-600/30 border-red-500 text-red-300 animate-bounce";
    pulseSpeed = "animate-ping";
  } else if (bidsCount >= 4) {
    intensity = "⚔️ FIERCE CLASH";
    intensityBadge = "bg-orange-500/20 border-orange-500/50 text-orange-300";
  }

  const duelTitle = activeRivalry ? activeRivalry.name : "High-Stakes Bidding Duel";
  const badgeLabel = activeRivalry ? activeRivalry.badge : "⚔️ BIDDING WAR";

  return (
    <div className="w-full max-w-4xl mx-auto my-3 px-2 select-none">
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-red-950/80 via-purple-950/80 to-blue-950/80 border-2 border-red-500/80 p-3.5 shadow-2xl shadow-red-900/30">
        {/* Animated Background Glow */}
        <div className="absolute -top-10 -left-10 w-40 h-40 bg-red-500/20 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-blue-500/20 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-3 text-white">
          {/* Left: War & Rivalry Info */}
          <div className="flex items-center gap-3 text-center md:text-left">
            <div className={`w-10 h-10 rounded-xl bg-red-900/80 border border-red-500 flex items-center justify-center text-xl shadow-lg shrink-0 ${pulseSpeed}`}>
              ⚔️
            </div>
            <div>
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
                <span className="text-xs px-2 py-0.5 rounded font-black tracking-wider uppercase bg-red-600 text-white shadow-sm">
                  {badgeLabel}
                </span>
                <span className={`text-[11px] px-2 py-0.5 rounded-full border font-bold ${intensityBadge}`}>
                  {intensity} ({bidsCount} Counter-Bids)
                </span>
              </div>
              <h4 className="text-base font-black text-yellow-300 tracking-wide mt-0.5">
                {duelTitle}
              </h4>
              {activeRivalry?.tagline && (
                <p className="text-[11px] text-gray-300 italic hidden sm:block">
                  {activeRivalry.tagline}
                </p>
              )}
            </div>
          </div>

          {/* Center / Right: Teams Faceoff */}
          <div className="flex items-center gap-3 shrink-0 bg-black/40 px-3.5 py-1.5 rounded-xl border border-white/10">
            {/* Team A */}
            <div className="flex items-center gap-1.5 text-right">
              <span className="text-xs font-black text-white">{teamA.shortName}</span>
              <span className="text-[10px] text-gray-400 font-mono">₹{teamA.budget.toFixed(1)}Cr</span>
            </div>

            <div className="text-sm font-black text-red-400 px-1">VS</div>

            {/* Team B */}
            <div className="flex items-center gap-1.5 text-left">
              <span className="text-xs font-black text-white">{teamB.shortName}</span>
              <span className="text-[10px] text-gray-400 font-mono">₹{teamB.budget.toFixed(1)}Cr</span>
            </div>
          </div>
        </div>

        {/* Live Tactical Commentary Strip */}
        {latestCommentary && (
          <div className="mt-2.5 pt-2 border-t border-red-500/30 flex items-center gap-2 text-xs text-yellow-200/90 font-medium">
            <span className="text-amber-400">⚡ Tactical Wire:</span>
            <span className="truncate">{latestCommentary}</span>
          </div>
        )}
      </div>
    </div>
  );
}
