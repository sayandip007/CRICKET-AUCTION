import React, { useState, useEffect } from "react";
import {
  FRANCHISE_PERSONAS,
  analyzeTeamNeeds,
  calculatePursePacing,
  IDEAL_SQUAD_REQUIREMENTS,
} from "../utils/aiIntelligence";

export default function TeamNeedsModal({
  isOpen,
  onClose,
  teams,
  userTeamId,
  initialTeamId,
  currentLeaderTeamId,
}) {
  const [selectedTeamId, setSelectedTeamId] = useState(initialTeamId || userTeamId || teams[0]?.id || 1);

  useEffect(() => {
    if (initialTeamId) {
      setSelectedTeamId(initialTeamId);
    }
  }, [initialTeamId]);

  if (!isOpen) return null;

  const currentTeam = teams.find((t) => t.id === selectedTeamId) || teams[0];
  const persona = FRANCHISE_PERSONAS[currentTeam?.id] || {};
  const needsData = currentTeam ? analyzeTeamNeeds(currentTeam) : null;
  const pacingData = currentTeam ? calculatePursePacing(currentTeam) : null;

  const getStatusBadge = (status) => {
    switch (status) {
      case "CRITICAL":
        return "bg-red-500/20 text-red-400 border-red-500/50 animate-pulse";
      case "URGENT":
        return "bg-orange-500/20 text-orange-400 border-orange-500/50";
      case "MODERATE":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/50";
      case "FILLED":
        return "bg-green-500/20 text-green-400 border-green-500/50";
      case "SURPLUS":
        return "bg-blue-500/20 text-blue-400 border-blue-500/50";
      default:
        return "bg-gray-800 text-gray-400 border-gray-700";
    }
  };

  const getPacingBadge = (stage) => {
    switch (stage) {
      case "SPLURGE":
        return {
          bg: "bg-emerald-500/20 text-emerald-300 border-emerald-500/50",
          icon: "🚀",
          label: "Aggressive Splurge",
        };
      case "BALANCED":
        return {
          bg: "bg-blue-500/20 text-blue-300 border-blue-500/50",
          icon: "⚖️",
          label: "Balanced Pacing",
        };
      case "CONSERVING":
        return {
          bg: "bg-amber-500/20 text-amber-300 border-amber-500/50",
          icon: "🛡️",
          label: "Budget Conserving",
        };
      case "CRITICAL_SAFETY":
        return {
          bg: "bg-red-500/20 text-red-300 border-red-500/50",
          icon: "⚠️",
          label: "Purse Critical Safety",
        };
      default:
        return {
          bg: "bg-gray-800 text-gray-400 border-gray-700",
          icon: "•",
          label: stage,
        };
    }
  };

  const pacingBadge = pacingData ? getPacingBadge(pacingData.pacingStage) : null;

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-md flex justify-center items-center z-50 p-3 md:p-6 select-none">
      <div className="bg-gray-900 border-2 border-yellow-500/90 rounded-3xl shadow-2xl w-full max-w-5xl text-white flex flex-col max-h-[92vh] overflow-hidden">
        {/* Modal Header */}
        <div className="p-4 md:p-6 border-b border-gray-800 flex flex-wrap items-center justify-between gap-4 bg-gray-950/60">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">🎯</span>
              <h2 className="text-xl md:text-2xl font-black text-yellow-400 tracking-wide">
                Target-Aware AI Team Needs & Intelligence
              </h2>
            </div>
            <p className="text-xs md:text-sm text-gray-400 mt-1">
              Scout rival franchise deficiencies, squad balance quotas, strategic personas, and purse pacing.
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-gray-800 hover:bg-red-600 text-white font-bold flex items-center justify-center transition-colors shadow-md"
          >
            ✕
          </button>
        </div>

        {/* Team Selector Pills */}
        <div className="p-3 bg-gray-950/40 border-b border-gray-800/80 overflow-x-auto flex gap-2 scrollbar-thin">
          {teams.map((t) => {
            const isSelected = t.id === selectedTeamId;
            const isUser = t.id === userTeamId;
            const isLeading = t.id === currentLeaderTeamId;
            return (
              <button
                key={t.id}
                onClick={() => setSelectedTeamId(t.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all border flex items-center gap-1.5 shrink-0 ${
                  isSelected
                    ? "bg-yellow-500 text-black border-yellow-400 shadow-lg shadow-yellow-500/20 scale-105"
                    : "bg-gray-800/80 text-gray-300 border-gray-700 hover:bg-gray-700 hover:border-gray-500"
                }`}
              >
                <span>{t.shortName}</span>
                {isUser && (
                  <span className={`text-[10px] px-1 py-0.2 rounded font-extrabold ${isSelected ? "bg-black text-yellow-400" : "bg-yellow-400 text-black"}`}>
                    YOU
                  </span>
                )}
                {isLeading && (
                  <span className="text-[10px] text-green-300 animate-pulse">●</span>
                )}
              </button>
            );
          })}
        </div>

        {/* Main Content Body */}
        {currentTeam && needsData && pacingData && (
          <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
            {/* Team Banner & Persona Card */}
            <div className={`p-5 rounded-2xl border-2 ${currentTeam.color} bg-gradient-to-r from-gray-900 to-gray-800/90 shadow-xl relative overflow-hidden`}>
              <div className="flex flex-wrap items-start justify-between gap-4 relative z-10">
                <div>
                  <div className="flex items-center gap-3">
                    <h3 className="text-2xl font-black text-white">{currentTeam.name}</h3>
                    {currentTeam.id === userTeamId && (
                      <span className="text-xs px-2.5 py-0.5 rounded-full bg-yellow-400 text-black font-black uppercase tracking-wider">
                        Your Franchise
                      </span>
                    )}
                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-gray-800 text-gray-300 border border-gray-700 font-mono">
                      {currentTeam.shortName}
                    </span>
                  </div>
                  <p className="text-sm text-yellow-400 font-bold mt-1">
                    "{persona.tagline || "Competitive IPL Franchise"}"
                  </p>
                  <p className="text-xs text-gray-300 mt-1 max-w-2xl leading-relaxed">
                    {persona.description}
                  </p>
                </div>

                {/* Persona & Archetype Badges */}
                <div className="flex flex-col items-end gap-2 text-right">
                  <div className="px-3 py-1 rounded-xl bg-purple-950/60 border border-purple-500/50 text-purple-300 text-xs font-bold">
                    🎭 Archetype: <span className="text-white">{persona.archetype || "Balanced"}</span>
                  </div>
                  {pacingBadge && (
                    <div className={`px-3 py-1 rounded-xl border text-xs font-bold flex items-center gap-1.5 ${pacingBadge.bg}`}>
                      <span>{pacingBadge.icon}</span>
                      <span>{pacingBadge.label}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Arch-Rivals Strip */}
              {persona.archRivalIds && persona.archRivalIds.length > 0 && (
                <div className="mt-4 pt-3 border-t border-gray-800/80 flex flex-wrap items-center gap-2 text-xs">
                  <span className="text-red-400 font-bold flex items-center gap-1">
                    <span>⚔️ Arch-Rivals:</span>
                  </span>
                  {persona.archRivalIds.map((rId) => {
                    const rivalTeam = teams.find((t) => t.id === rId);
                    return rivalTeam ? (
                      <span
                        key={rId}
                        onClick={() => setSelectedTeamId(rId)}
                        className="px-2 py-0.5 rounded-lg bg-red-950/40 border border-red-500/40 text-red-200 cursor-pointer hover:bg-red-900/60 hover:border-red-400 transition-colors"
                        title={`Click to scout ${rivalTeam.name}`}
                      >
                        {rivalTeam.name} ({rivalTeam.shortName})
                      </span>
                    ) : null;
                  })}
                  <span className="text-[11px] text-gray-400 italic ml-2">
                    (Trigger fierce bidding war & valuation escalation on marquee targets)
                  </span>
                </div>
              )}
            </div>

            {/* Quick Metrics: Squad, Overseas, Purse Pacing */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="bg-gray-800/80 p-3 rounded-2xl border border-gray-700 flex flex-col justify-between">
                <span className="text-gray-400">Total Squad Size</span>
                <div className="mt-1 flex items-baseline gap-2">
                  <span className="text-xl font-black text-white">{needsData.totalPlayers}</span>
                  <span className="text-gray-400 font-mono">/ 25 (Min 18)</span>
                </div>
                <div className="w-full bg-gray-700 h-1.5 rounded-full mt-2 overflow-hidden">
                  <div
                    className="bg-blue-500 h-full"
                    style={{ width: `${Math.min(100, (needsData.totalPlayers / 18) * 100)}%` }}
                  />
                </div>
              </div>

              <div className="bg-gray-800/80 p-3 rounded-2xl border border-gray-700 flex flex-col justify-between">
                <span className="text-gray-400">Overseas Cap</span>
                <div className="mt-1 flex items-baseline gap-2">
                  <span className={`text-xl font-black ${needsData.overseasCount >= 8 ? "text-red-400" : "text-blue-400"}`}>
                    {needsData.overseasCount}
                  </span>
                  <span className="text-gray-400 font-mono">/ 8 slots</span>
                </div>
                <div className="w-full bg-gray-700 h-1.5 rounded-full mt-2 overflow-hidden">
                  <div
                    className={`h-full ${needsData.overseasCount >= 8 ? "bg-red-500" : "bg-blue-500"}`}
                    style={{ width: `${(needsData.overseasCount / 8) * 100}%` }}
                  />
                </div>
              </div>

              <div className="bg-gray-800/80 p-3 rounded-2xl border border-gray-700 flex flex-col justify-between">
                <span className="text-gray-400">Remaining Purse</span>
                <div className="mt-1">
                  <span className="text-xl font-black text-green-400">₹{currentTeam.budget.toFixed(2)}Cr</span>
                </div>
                <span className="text-[10px] text-gray-400 mt-1">
                  Spent: ₹{(120 - currentTeam.budget).toFixed(2)}Cr of ₹120Cr
                </span>
              </div>

              <div className="bg-gray-800/80 p-3 rounded-2xl border border-gray-700 flex flex-col justify-between">
                <span className="text-gray-400">Pacing (Per Slot to 18)</span>
                <div className="mt-1">
                  <span className="text-xl font-black text-yellow-400">
                    ₹{pacingData.pursePerSlot18.toFixed(2)}Cr
                  </span>
                </div>
                <span className="text-[10px] text-gray-400 mt-1 truncate" title={pacingData.description}>
                  {pacingData.description}
                </span>
              </div>
            </div>

            {/* Team Needs Matrix Table */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                  <span>📊 Positional Need Matrix</span>
                  <span className="text-xs font-normal text-gray-400">
                    (Targeted quotas for balanced 18-25 player squad)
                  </span>
                </h4>
                <div className="flex items-center gap-2 text-[11px] text-gray-400">
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500 inline-block"></span> Critical</span>
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-orange-500 inline-block"></span> Urgent</span>
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-500 inline-block"></span> Filled</span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                {Object.entries(needsData.needs).map(([role, need]) => {
                  const req = IDEAL_SQUAD_REQUIREMENTS[role];
                  return (
                    <div
                      key={role}
                      className="bg-gray-800/70 border border-gray-700 p-3.5 rounded-2xl flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-bold text-sm text-white">{role}</span>
                          <span
                            className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border ${getStatusBadge(
                              need.status
                            )}`}
                          >
                            {need.status}
                          </span>
                        </div>

                        <div className="flex items-baseline justify-between text-xs text-gray-300 mb-1">
                          <span>Current Signed</span>
                          <span className="text-base font-black text-white">
                            {need.current} <span className="text-xs text-gray-400 font-normal">/ {req.ideal} ideal</span>
                          </span>
                        </div>

                        {/* Progress Bar */}
                        <div className="w-full bg-gray-900 h-2 rounded-full overflow-hidden mb-2">
                          <div
                            className={`h-full transition-all ${
                              need.current < req.min
                                ? "bg-red-500"
                                : need.current < req.ideal
                                ? "bg-yellow-500"
                                : "bg-green-500"
                            }`}
                            style={{
                              width: `${Math.min(100, (need.current / req.ideal) * 100)}%`,
                            }}
                          />
                        </div>
                      </div>

                      <div className="text-[11px] text-gray-400 pt-2 border-t border-gray-800/80 flex justify-between">
                        <span>Min Required: {req.min}</span>
                        <span>Max Cap: {req.max}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Specialist Role Deficits: Death Bowlers & Spin Masters */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="bg-gray-800/80 border border-gray-700 p-4 rounded-2xl flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-lg">🎯</span>
                    <h5 className="font-bold text-sm text-white">Death-Over Specialists</h5>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">
                    Economy ≤ 8.2 with high wicket strike rate
                  </p>
                  <div className="mt-2 text-xs">
                    Signed in squad: <span className="font-bold text-white">{needsData.deathBowlersCount}</span>
                  </div>
                </div>
                <div className="text-right">
                  <span
                    className={`text-xs font-black px-3 py-1 rounded-xl border ${getStatusBadge(
                      needsData.deathBowlerNeed
                    )}`}
                  >
                    {needsData.deathBowlerNeed === "CRITICAL" ? "⚠️ CRITICAL DEFICIT" : needsData.deathBowlerNeed}
                  </span>
                </div>
              </div>

              <div className="bg-gray-800/80 border border-gray-700 p-4 rounded-2xl flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-lg">🌀</span>
                    <h5 className="font-bold text-sm text-white">Mystery & Spin Masters</h5>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">
                    Specialist spinners with economy ≤ 7.4
                  </p>
                  <div className="mt-2 text-xs">
                    Signed in squad: <span className="font-bold text-white">{needsData.spinMastersCount}</span>
                  </div>
                </div>
                <div className="text-right">
                  <span
                    className={`text-xs font-black px-3 py-1 rounded-xl border ${getStatusBadge(
                      needsData.spinMasterNeed
                    )}`}
                  >
                    {needsData.spinMasterNeed === "URGENT" ? "⚡ URGENT NEED" : needsData.spinMasterNeed}
                  </span>
                </div>
              </div>
            </div>

            {/* Scouting Tactical Intel Advice */}
            <div className="bg-indigo-950/40 border border-indigo-500/40 p-4 rounded-2xl">
              <h5 className="text-xs font-bold text-indigo-300 uppercase tracking-wider flex items-center gap-1.5 mb-1.5">
                <span>🧠 AI Scouting Intel & Tactical Behavior</span>
              </h5>
              <p className="text-xs text-gray-300 leading-relaxed">
                {currentTeam.id === userTeamId ? (
                  <>
                    <strong className="text-yellow-400">Recommendation for your squad: </strong>
                    {needsData.highestDeficitScore > 50
                      ? `Your biggest deficit is at ${needsData.highestDeficitRole} (need at least ${needsData.needs[needsData.highestDeficitRole]?.min}). Prioritize bidding on upcoming players in this category to ensure full squad balance.`
                      : "Your squad has a healthy distribution across all roles. Focus on high-impact value picks and death bowling depth."}
                  </>
                ) : (
                  <>
                    <strong className="text-yellow-400">{currentTeam.name}'s AI Bidding Behavior: </strong>
                    {currentTeam.name} has a{" "}
                    <span className="text-white font-bold">{needsData.highestDeficitRole}</span> deficit and{" "}
                    <span className="text-white font-bold">{pacingData.pacingStage}</span> purse pacing. They will
                    aggressively contest high-rated {needsData.highestDeficitRole}s and counter-bid fiercely against rivals (
                    {persona.archRivalIds?.map((id) => teams.find((t) => t.id === id)?.shortName).join(", ")}).
                  </>
                )}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
