import React, { useState, useEffect, useMemo } from "react";
import {
  calculateTeamRatings,
  validatePlayingXI,
  autoSelectBestXI,
  isOverseas,
  canBowl,
  getPlayerBattingRating,
  getPlayerBowlingRating,
} from "../utils/squadSimulator";
import { roleImages, FALLBACK_IMAGE } from "../utils/constants";
import { getPlayerSpecializations } from "../utils/aiIntelligence";
import { FORM_STATUS } from "../utils/playerFormUtils";

export default function PlayingXIModal({
  isOpen,
  onClose,
  teams,
  initialTeamId,
  userTeamId,
  onOpenMatchSimulator,
  playerFormMap = {},
}) {
  const [selectedTeamId, setSelectedTeamId] = useState(initialTeamId || userTeamId || 1);
  const [playingXI, setPlayingXI] = useState([]);
  const [captainId, setCaptainId] = useState(null);
  const [viceCaptainId, setViceCaptainId] = useState(null);
  const [selectedPlayerToSwap, setSelectedPlayerToSwap] = useState(null);
  const [impactPlayerId, setImpactPlayerId] = useState(null);

  const currentTeam = teams.find((t) => t.id === selectedTeamId) || teams[0];
  const squad = useMemo(() => currentTeam?.players || [], [currentTeam]);

  // Initialize or re-evaluate XI when switching teams
  useEffect(() => {
    if (squad && squad.length > 0) {
      const best = autoSelectBestXI(squad);
      setPlayingXI(best);
      if (best.length > 0) {
        setCaptainId(best[0].id);
        if (best.length > 1) setViceCaptainId(best[1].id);
      }
    } else {
      setPlayingXI([]);
      setCaptainId(null);
      setViceCaptainId(null);
    }
    setSelectedPlayerToSwap(null);
  }, [selectedTeamId, squad]);

  if (!isOpen || !currentTeam) return null;

  // Identify bench players
  const xiIds = new Set(playingXI.map((p) => p.id));
  const bench = squad.filter((p) => !xiIds.has(p.id));

  // Compute team ratings & validation
  const ratings = calculateTeamRatings(currentTeam, playingXI);
  const validation = validatePlayingXI(playingXI);

  // Handle auto-pick
  const handleAutoPick = () => {
    const optimal = autoSelectBestXI(squad);
    setPlayingXI(optimal);
    if (optimal.length > 0) {
      // Pick highest rating as captain
      const sorted = [...optimal].sort((a, b) => (b.rating || 75) - (a.rating || 75));
      setCaptainId(sorted[0].id);
      if (sorted.length > 1) setViceCaptainId(sorted[1].id);
    }
  };

  // Handle re-order
  const handleMoveUp = (index) => {
    if (index === 0) return;
    const newXI = [...playingXI];
    const temp = newXI[index];
    newXI[index] = newXI[index - 1];
    newXI[index - 1] = temp;
    setPlayingXI(newXI);
  };

  const handleMoveDown = (index) => {
    if (index === playingXI.length - 1) return;
    const newXI = [...playingXI];
    const temp = newXI[index];
    newXI[index] = newXI[index + 1];
    newXI[index + 1] = temp;
    setPlayingXI(newXI);
  };

  // Handle swap between XI and bench
  const handleSwapClick = (player, from) => {
    if (!selectedPlayerToSwap) {
      setSelectedPlayerToSwap({ player, from });
      return;
    }

    if (selectedPlayerToSwap.player.id === player.id) {
      setSelectedPlayerToSwap(null);
      return;
    }

    if (selectedPlayerToSwap.from === "XI" && from === "BENCH") {
      // Replace XI player with bench player
      const newXI = playingXI.map((p) =>
        p.id === selectedPlayerToSwap.player.id ? player : p
      );
      setPlayingXI(newXI);
      setSelectedPlayerToSwap(null);
    } else if (selectedPlayerToSwap.from === "BENCH" && from === "XI") {
      const newXI = playingXI.map((p) =>
        p.id === player.id ? selectedPlayerToSwap.player : p
      );
      setPlayingXI(newXI);
      setSelectedPlayerToSwap(null);
    } else if (selectedPlayerToSwap.from === "XI" && from === "XI") {
      // Re-order within XI
      const idxA = playingXI.findIndex((p) => p.id === selectedPlayerToSwap.player.id);
      const idxB = playingXI.findIndex((p) => p.id === player.id);
      const newXI = [...playingXI];
      const temp = newXI[idxA];
      newXI[idxA] = newXI[idxB];
      newXI[idxB] = temp;
      setPlayingXI(newXI);
      setSelectedPlayerToSwap(null);
    } else {
      setSelectedPlayerToSwap({ player, from });
    }
  };

  const isUserTeam = currentTeam.id === userTeamId;

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-md flex justify-center items-center z-50 p-2 md:p-4">
      <div className="bg-gradient-to-b from-gray-900 via-gray-900 to-black border-2 border-yellow-500 rounded-3xl shadow-2xl w-full max-w-6xl text-white flex flex-col max-h-[92vh] overflow-hidden">
        {/* Header */}
        <div className="p-4 md:p-6 border-b border-gray-800 flex flex-wrap items-center justify-between gap-3 bg-gray-950/70">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">🏏</span>
              <h2 className="text-2xl md:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-amber-300 to-yellow-500">
                Playing XI & Squad Chemistry
              </h2>
              {isUserTeam && (
                <span className="px-2 py-0.5 rounded bg-yellow-400 text-black font-black text-xs">
                  YOUR FRANCHISE
                </span>
              )}
            </div>
            <p className="text-xs text-gray-400 mt-1">
              Construct your ultimate matchday XI, optimize batting order, and maximize squad chemistry.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                onClose();
                if (onOpenMatchSimulator) onOpenMatchSimulator(currentTeam.id, playingXI);
              }}
              className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold rounded-xl text-xs transition-all shadow-lg shadow-teal-900/40 flex items-center gap-1.5"
            >
              <span>🏆 Simulate With This XI</span>
            </button>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-gray-800 hover:bg-red-600 text-white font-bold flex items-center justify-center transition-colors text-sm"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Team Selector Pills */}
        <div className="px-4 py-2 bg-gray-900/80 border-b border-gray-800 flex items-center gap-1.5 overflow-x-auto text-xs scrollbar-thin">
          <span className="text-gray-400 font-semibold shrink-0 pl-1 pr-2">Franchise:</span>
          {teams.map((t) => (
            <button
              key={t.id}
              onClick={() => setSelectedTeamId(t.id)}
              className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all ${
                selectedTeamId === t.id
                  ? "bg-yellow-400 text-black shadow-md shadow-yellow-400/20"
                  : "bg-gray-800 text-gray-300 hover:bg-gray-700"
              }`}
            >
              {t.shortName}
              {t.id === userTeamId ? " (You)" : ""}
            </button>
          ))}
        </div>

        {/* Rating Breakdown & Formation Badges Banner */}
        <div className="p-4 bg-gradient-to-r from-gray-900 via-indigo-950/40 to-gray-900 border-b border-gray-800 flex flex-wrap items-center justify-between gap-4">
          {/* Overall Chemistry Gauge */}
          <div className="flex items-center gap-4">
            <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-br from-yellow-500/20 to-amber-600/30 border-2 border-yellow-400 flex flex-col items-center justify-center shadow-lg shadow-yellow-500/10">
              <span className="text-2xl font-black text-yellow-400 leading-none">
                {ratings.overallRating}
              </span>
              <span className="text-[9px] uppercase tracking-wider text-gray-300 font-extrabold mt-0.5">
                OVR
              </span>
            </div>
            <div>
              <span className={`text-sm font-black flex items-center gap-1 ${ratings.tierColor}`}>
                {ratings.tier}
              </span>
              <p className="text-xs text-gray-400">
                Squad Chemistry Score & Balance Rating
              </p>
            </div>
          </div>

          {/* 4 Core Ratings */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
            <div className="bg-gray-800/80 px-3 py-1.5 rounded-xl border border-gray-700">
              <span className="text-gray-400 block text-[10px]">🏏 Batting</span>
              <span className="text-base font-extrabold text-blue-400">
                {ratings.battingRating}/100
              </span>
            </div>
            <div className="bg-gray-800/80 px-3 py-1.5 rounded-xl border border-gray-700">
              <span className="text-gray-400 block text-[10px]">🎯 Bowling</span>
              <span className="text-base font-extrabold text-emerald-400">
                {ratings.bowlingRating}/100
              </span>
            </div>
            <div className="bg-gray-800/80 px-3 py-1.5 rounded-xl border border-gray-700">
              <span className="text-gray-400 block text-[10px]">⚖️ Balance</span>
              <span className="text-base font-extrabold text-purple-400">
                {ratings.balanceRating}/100
              </span>
            </div>
            <div className="bg-gray-800/80 px-3 py-1.5 rounded-xl border border-gray-700">
              <span className="text-gray-400 block text-[10px]">⭐ Experience</span>
              <span className="text-base font-extrabold text-amber-400">
                {ratings.experienceRating}/100
              </span>
            </div>
          </div>

          {/* Auto Pick Button */}
          <button
            onClick={handleAutoPick}
            className="px-3 py-2 bg-yellow-500/20 hover:bg-yellow-500/30 border border-yellow-400 text-yellow-300 font-bold text-xs rounded-xl transition-all flex items-center gap-1.5"
          >
            <span>⚡ Auto-Pick Best XI</span>
          </button>
        </div>

        {/* Formation Rule Compliance Tracker */}
        <div className="px-4 py-2.5 bg-gray-950 border-b border-gray-800 flex flex-wrap items-center gap-2 text-xs">
          <span className="text-gray-400 font-bold shrink-0">Formation Checks:</span>

          {/* 11 Players check */}
          <span
            className={`px-2.5 py-1 rounded-lg font-bold border flex items-center gap-1 ${
              validation.stats.total === 11
                ? "bg-emerald-950/50 border-emerald-500 text-emerald-300"
                : "bg-red-950/50 border-red-500 text-red-300 animate-pulse"
            }`}
          >
            {validation.stats.total === 11 ? "✓" : "✗"} 11 in XI ({validation.stats.total}/11)
          </span>

          {/* Overseas <= 4 */}
          <span
            className={`px-2.5 py-1 rounded-lg font-bold border flex items-center gap-1 ${
              validation.stats.overseas <= 4
                ? "bg-emerald-950/50 border-emerald-500 text-emerald-300"
                : "bg-red-950/50 border-red-500 text-red-300 animate-pulse"
            }`}
          >
            {validation.stats.overseas <= 4 ? "✓" : "✗"} ✈️ Overseas ({validation.stats.overseas}/4 max)
          </span>

          {/* Keeper >= 1 */}
          <span
            className={`px-2.5 py-1 rounded-lg font-bold border flex items-center gap-1 ${
              validation.stats.wicketKeepers >= 1
                ? "bg-emerald-950/50 border-emerald-500 text-emerald-300"
                : "bg-red-950/50 border-red-500 text-red-300 animate-pulse"
            }`}
          >
            {validation.stats.wicketKeepers >= 1 ? "✓" : "✗"} 🧤 Wicketkeeper ({validation.stats.wicketKeepers} WK)
          </span>

          {/* Bowling options >= 5 */}
          <span
            className={`px-2.5 py-1 rounded-lg font-bold border flex items-center gap-1 ${
              validation.stats.bowlingOptions >= 5
                ? "bg-emerald-950/50 border-emerald-500 text-emerald-300"
                : "bg-red-950/50 border-red-500 text-red-300 animate-pulse"
            }`}
          >
            {validation.stats.bowlingOptions >= 5 ? "✓" : "✗"} 🎯 Bowlers ({validation.stats.bowlingOptions} options, min 5)
          </span>

          {validation.warnings.length > 0 && (
            <span className="text-amber-400 text-[11px] italic ml-auto truncate">
              ⚠️ {validation.warnings[0]}
            </span>
          )}
        </div>

        {/* Body Grid: Playing XI on Left / Bench & Swaps on Right */}
        <div className="flex-1 overflow-y-auto p-4 grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* Main Playing XI (Col 7 or 8) */}
          <div className="lg:col-span-8 flex flex-col gap-2">
            <div className="flex items-center justify-between mb-1">
              <h3 className="font-black text-sm uppercase tracking-wider text-yellow-400 flex items-center gap-2">
                <span>Matchday Playing XI ({playingXI.length}/11)</span>
              </h3>
              <span className="text-xs text-gray-400 italic">
                {selectedPlayerToSwap
                  ? `Selected: ${selectedPlayerToSwap.player.name} (Click another to swap)`
                  : "Click player to select for swapping, or use ▲ ▼ to reorder batting order"}
              </span>
            </div>

            {playingXI.length === 0 ? (
              <div className="p-8 text-center text-gray-500 bg-gray-900/50 rounded-2xl border border-gray-800">
                No players in Playing XI yet. Build squad through auction or click "Auto-Pick Best XI".
              </div>
            ) : (
              <div className="space-y-1.5">
                {playingXI.map((player, idx) => {
                  const overseas = isOverseas(player);
                  const isCap = captainId === player.id;
                  const isVc = viceCaptainId === player.id;
                  const specs = getPlayerSpecializations(player);
                  const isSelected = selectedPlayerToSwap?.player.id === player.id;

                  // Position label
                  let posLabel = "Finisher / Bowler";
                  if (idx === 0 || idx === 1) posLabel = "Opener";
                  else if (idx === 2) posLabel = "Anchor #3";
                  else if (idx < 5) posLabel = "Middle Order";
                  else if (idx < 7) posLabel = "All-Rounder / Finisher";

                  return (
                    <div
                      key={player.id}
                      onClick={() => handleSwapClick(player, "XI")}
                      className={`p-2.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                        isSelected
                          ? "bg-amber-950/60 border-amber-400 ring-2 ring-amber-400 shadow-lg"
                          : "bg-gray-900/90 hover:bg-gray-800 border-gray-800"
                      }`}
                    >
                      {/* Left: Batting order number & Photo */}
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-6 text-center font-mono font-extrabold text-sm text-yellow-400">
                          {idx + 1}
                        </div>

                        <div className="relative w-9 h-9 shrink-0">
                          <img
                            src={player.image || FALLBACK_IMAGE}
                            alt={player.name}
                            className="w-full h-full rounded-full object-cover border border-gray-700"
                          />
                          <img
                            src={roleImages[player.role]}
                            alt={player.role}
                            className="w-4 h-4 absolute -bottom-1 -right-1 bg-gray-950 rounded-full p-0.5"
                          />
                        </div>

                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="font-bold text-sm text-white truncate">
                              {player.name}
                            </span>
                            {overseas && (
                              <span className="text-[10px] px-1 py-0.2 rounded bg-blue-500/20 text-blue-300 font-bold border border-blue-500/40">
                                ✈️ OS
                              </span>
                            )}
                            {player.role === "Wicketkeeper" && (
                              <span className="text-[10px] px-1 py-0.2 rounded bg-yellow-500/20 text-yellow-300 font-bold border border-yellow-500/40">
                                🧤 WK
                              </span>
                            )}
                            {isCap && (
                              <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-400 text-black font-black">
                                (C)
                              </span>
                            )}
                            {isVc && !isCap && (
                              <span className="text-[10px] px-1 py-0.2 rounded bg-gray-300 text-black font-black">
                                (VC)
                              </span>
                            )}
                            {playerFormMap[player.id]?.status &&
                              FORM_STATUS[playerFormMap[player.id].status] && (
                                <span
                                  className={`text-[9px] px-1.5 py-0.2 rounded font-bold border ${
                                    FORM_STATUS[playerFormMap[player.id].status].color
                                  }`}
                                  title={FORM_STATUS[playerFormMap[player.id].status].description}
                                >
                                  {FORM_STATUS[playerFormMap[player.id].status].badge}{" "}
                                  {FORM_STATUS[playerFormMap[player.id].status].label}
                                </span>
                              )}
                          </div>

                          <div className="flex items-center gap-2 text-[10px] text-gray-400 mt-0.5">
                            <span className="text-gray-300">{posLabel}</span>
                            <span>•</span>
                            <span className="text-blue-300">Bat: {getPlayerBattingRating(player)}</span>
                            {canBowl(player) && (
                              <>
                                <span>•</span>
                                <span className="text-emerald-300">Bowl: {getPlayerBowlingRating(player)}</span>
                              </>
                            )}
                            {specs.length > 0 && (
                              <span className="text-purple-300 hidden sm:inline">
                                • {specs[0]}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Right: Controls & Captaincy buttons */}
                      <div className="flex items-center gap-1.5 shrink-0">
                        {/* Captaincy toggle */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setCaptainId(player.id);
                          }}
                          title="Assign Captain"
                          className={`px-1.5 py-0.5 rounded text-[10px] font-black border transition-colors ${
                            isCap
                              ? "bg-amber-400 text-black border-amber-400"
                              : "bg-gray-800 text-gray-400 hover:text-white border-gray-700"
                          }`}
                        >
                          C
                        </button>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setViceCaptainId(player.id);
                          }}
                          title="Assign Vice Captain"
                          className={`px-1.5 py-0.5 rounded text-[10px] font-black border transition-colors ${
                            isVc
                              ? "bg-gray-300 text-black border-gray-300"
                              : "bg-gray-800 text-gray-400 hover:text-white border-gray-700"
                          }`}
                        >
                          VC
                        </button>

                        {/* Reorder Buttons */}
                        <div className="flex flex-col gap-0.5 ml-1">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleMoveUp(idx);
                            }}
                            disabled={idx === 0}
                            className="w-5 h-4 bg-gray-800 hover:bg-gray-700 disabled:opacity-30 rounded text-[9px] flex items-center justify-center text-gray-300"
                          >
                            ▲
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleMoveDown(idx);
                            }}
                            disabled={idx === playingXI.length - 1}
                            className="w-5 h-4 bg-gray-800 hover:bg-gray-700 disabled:opacity-30 rounded text-[9px] flex items-center justify-center text-gray-300"
                          >
                            ▼
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Bench & Substitutes (Col 4 or 5) */}
          <div className="lg:col-span-4 flex flex-col gap-2">
            <div className="flex items-center justify-between mb-1">
              <h3 className="font-black text-sm uppercase tracking-wider text-gray-400 flex items-center gap-1.5">
                <span>Bench Reserves ({bench.length})</span>
              </h3>
              <span className="text-[11px] text-gray-500">Click to swap or nominate Impact Sub</span>
            </div>

            {/* Impact Player Banner if designated */}
            {impactPlayerId && (
              <div className="p-2.5 rounded-xl bg-amber-950/40 border border-amber-500/50 text-xs text-amber-200 flex items-center justify-between shadow-md">
                <div className="flex items-center gap-2">
                  <span className="text-base">⚡</span>
                  <div>
                    <span className="text-[10px] text-amber-400 font-bold uppercase block">
                      Nominated Impact Player (12th Man):
                    </span>
                    <strong className="text-white font-extrabold text-xs">
                      {squad.find((p) => p.id === impactPlayerId)?.name}
                    </strong>
                  </div>
                </div>
                <button
                  onClick={() => setImpactPlayerId(null)}
                  className="text-gray-400 hover:text-white text-xs px-2 py-1 rounded bg-gray-900 border border-gray-800"
                >
                  Clear
                </button>
              </div>
            )}

            {bench.length === 0 ? (
              <div className="p-6 text-center text-gray-500 bg-gray-900/40 rounded-2xl border border-gray-800 text-xs">
                No bench reserves available. All signed players currently in XI.
              </div>
            ) : (
              <div className="space-y-1.5 max-h-[500px] overflow-y-auto pr-1">
                {bench.map((player) => {
                  const overseas = isOverseas(player);
                  const isSelected = selectedPlayerToSwap?.player.id === player.id;
                  const isImpact = impactPlayerId === player.id;
                  return (
                    <div
                      key={player.id}
                      onClick={() => handleSwapClick(player, "BENCH")}
                      className={`p-2 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-2 ${
                        isSelected
                          ? "bg-amber-950/60 border-amber-400 ring-2 ring-amber-400"
                          : isImpact
                          ? "bg-amber-950/40 border-amber-500/70"
                          : "bg-gray-900/60 hover:bg-gray-800/80 border-gray-800"
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <img
                          src={player.image || FALLBACK_IMAGE}
                          alt={player.name}
                          className="w-7 h-7 rounded-full object-cover border border-gray-700 shrink-0"
                        />
                        <div className="min-w-0">
                          <div className="font-bold text-xs text-white truncate flex items-center gap-1">
                            <span>{player.name}</span>
                            {overseas && <span className="text-[9px] text-blue-400">✈️</span>}
                          </div>
                          <div className="text-[10px] text-gray-400">
                            {player.role} • OVR {player.rating || 75}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setImpactPlayerId(player.id);
                          }}
                          className={`px-2 py-1 rounded text-[10px] font-bold border transition-colors ${
                            isImpact
                              ? "bg-amber-400 text-black border-amber-400 font-black shadow-md shadow-amber-400/20"
                              : "bg-gray-800 text-amber-300 hover:text-white border-gray-700 hover:border-amber-400/50"
                          }`}
                          title="Nominate as Tactical Impact Player"
                        >
                          {isImpact ? "⚡ Impact Sub" : "+ Impact"}
                        </button>
                        <button className="px-2 py-1 bg-gray-800 hover:bg-yellow-400 hover:text-black rounded text-[10px] font-bold text-gray-300 transition-colors">
                          Swap In
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Quick Formation Advice Box */}
            <div className="mt-auto p-3 rounded-2xl bg-indigo-950/30 border border-indigo-500/30 text-xs text-indigo-200">
              <span className="font-bold text-indigo-300 block mb-1">
                💡 IPL Tactical Tip:
              </span>
              Ensure you have at least 5 reliable bowling options and a designated wicketkeeper to avoid severe chemistry penalties in match simulations!
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
