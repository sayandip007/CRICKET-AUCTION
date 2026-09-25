import React, { useState } from "react";
import { HEAD_TO_HEAD_PAIRS, getHeadToHead } from "../data/headToHeadData";

export default function HeadToHeadModal({ isOpen, onClose, allPlayers = [] }) {
  const [selectedBatter, setSelectedBatter] = useState("Virat Kohli");
  const [selectedBowler, setSelectedBowler] = useState("Jasprit Bumrah");

  if (!isOpen) return null;

  // Derive unique lists of batters and bowlers from pool, or fallback to catalog
  const dynamicBatters = (allPlayers || [])
    .filter((p) => p.role === "Batsman" || p.role === "All-Rounder" || p.role === "Wicketkeeper")
    .map((p) => p.name)
    .slice(0, 30);

  const dynamicBowlers = (allPlayers || [])
    .filter((p) => p.role === "Bowler" || p.role === "All-Rounder")
    .map((p) => p.name)
    .slice(0, 30);

  const batterCandidates = Array.from(
    new Set([
      "Virat Kohli",
      "Rohit Sharma",
      "MS Dhoni",
      "Rishabh Pant",
      "Suryakumar Yadav",
      "Heinrich Klaasen",
      "KL Rahul",
      "Andre Russell",
      "Shubman Gill",
      "Glenn Maxwell",
      "David Warner",
      "Sanju Samson",
      "Travis Head",
      "Shreyas Iyer",
      "Rinku Singh",
      ...dynamicBatters,
    ])
  );

  const bowlerCandidates = Array.from(
    new Set([
      "Jasprit Bumrah",
      "Trent Boult",
      "Sunil Narine",
      "Rashid Khan",
      "Yuzvendra Chahal",
      "Mohammed Shami",
      "Ravindra Jadeja",
      "Ravichandran Ashwin",
      "Varun Chakaravarthy",
      "Kagiso Rabada",
      "Kuldeep Yadav",
      "Mitchell Starc",
      "Pat Cummins",
      "Arshdeep Singh",
      ...dynamicBowlers,
    ])
  );

  const matchRecord = getHeadToHead(selectedBatter, selectedBowler);

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-md flex justify-center items-center z-50 p-3 sm:p-4 animate-fadeIn">
      <div className="bg-gray-900 border-2 border-cyan-500/80 rounded-3xl max-w-3xl w-full p-5 sm:p-6 text-white max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-gray-800 mb-4">
          <div className="flex items-center gap-2.5">
            <span className="text-2xl">⚔️</span>
            <div>
              <h3 className="font-black text-lg md:text-xl text-cyan-400">
                Head-to-Head Batter vs. Bowler Matrix
              </h3>
              <p className="text-xs text-gray-400">
                Detailed tactical face-off data, strike rates, dismissals & pitch matchup intelligence
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-800 hover:bg-gray-700 flex items-center justify-center font-bold text-gray-300 hover:text-white"
          >
            ✕
          </button>
        </div>

        {/* Selector Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5 bg-gray-950 p-3.5 rounded-2xl border border-gray-800">
          <div>
            <label className="block text-[11px] font-extrabold uppercase tracking-wider text-yellow-400 mb-1.5 flex items-center gap-1.5">
              <span>🏏 Select Batsman</span>
            </label>
            <select
              value={selectedBatter}
              onChange={(e) => setSelectedBatter(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-xl p-2.5 text-xs font-bold text-white focus:outline-none focus:border-yellow-400"
            >
              {batterCandidates.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-extrabold uppercase tracking-wider text-cyan-400 mb-1.5 flex items-center gap-1.5">
              <span>🎯 Select Bowler</span>
            </label>
            <select
              value={selectedBowler}
              onChange={(e) => setSelectedBowler(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-xl p-2.5 text-xs font-bold text-white focus:outline-none focus:border-cyan-400"
            >
              {bowlerCandidates.map((bw) => (
                <option key={bw} value={bw}>
                  {bw}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Matchup Duel Showcase Card */}
        {matchRecord && (
          <div className="bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950 rounded-2xl border border-cyan-500/40 p-4 sm:p-5 mb-5 shadow-xl">
            {/* Duel Header */}
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-gray-800 mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-yellow-500/20 border border-yellow-500 flex items-center justify-center font-black text-xl text-yellow-400">
                  🏏
                </div>
                <div>
                  <span className="text-[10px] text-gray-400 uppercase font-bold block">
                    Striker
                  </span>
                  <h4 className="text-lg font-black text-white">{matchRecord.batter}</h4>
                </div>
              </div>

              <div className="px-3 py-1 bg-cyan-500/20 border border-cyan-400/50 rounded-full text-cyan-300 font-mono font-bold text-xs">
                VS
              </div>

              <div className="flex items-center gap-3 text-right">
                <div>
                  <span className="text-[10px] text-gray-400 uppercase font-bold block">
                    Bowler
                  </span>
                  <h4 className="text-lg font-black text-white">{matchRecord.bowler}</h4>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 border border-cyan-500 flex items-center justify-center font-black text-xl text-cyan-400">
                  🎯
                </div>
              </div>
            </div>

            {/* Duel Key Stats Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-4 text-center">
              <div className="p-3 bg-gray-950/80 rounded-xl border border-gray-800">
                <span className="text-[10px] uppercase text-gray-400 font-bold block mb-0.5">
                  Balls Faced
                </span>
                <span className="text-xl font-black text-white font-mono">{matchRecord.balls}</span>
              </div>

              <div className="p-3 bg-gray-950/80 rounded-xl border border-gray-800">
                <span className="text-[10px] uppercase text-gray-400 font-bold block mb-0.5">
                  Runs Scored
                </span>
                <span className="text-xl font-black text-yellow-400 font-mono">{matchRecord.runs}</span>
              </div>

              <div className="p-3 bg-gray-950/80 rounded-xl border border-gray-800">
                <span className="text-[10px] uppercase text-gray-400 font-bold block mb-0.5">
                  Strike Rate
                </span>
                <span className="text-xl font-black text-emerald-400 font-mono">
                  {matchRecord.strikeRate}
                </span>
              </div>

              <div className="p-3 bg-gray-950/80 rounded-xl border border-gray-800">
                <span className="text-[10px] uppercase text-gray-400 font-bold block mb-0.5">
                  Dismissals
                </span>
                <span className="text-xl font-black text-rose-400 font-mono">
                  {matchRecord.dismissals}
                </span>
              </div>
            </div>

            {/* Boundary Breakdown Bar */}
            <div className="p-3 bg-gray-950 rounded-xl border border-gray-800/80 flex items-center justify-around text-xs mb-4">
              <div className="text-center">
                <span className="text-gray-400 text-[10px] block">Dots Forced</span>
                <span className="font-extrabold text-gray-200">{matchRecord.dots} dots</span>
              </div>
              <div className="h-6 w-px bg-gray-800" />
              <div className="text-center">
                <span className="text-gray-400 text-[10px] block">Fours Hit</span>
                <span className="font-extrabold text-blue-400">{matchRecord.fours} x 4s</span>
              </div>
              <div className="h-6 w-px bg-gray-800" />
              <div className="text-center">
                <span className="text-gray-400 text-[10px] block">Sixes Hit</span>
                <span className="font-extrabold text-amber-400">{matchRecord.sixes} x 6s</span>
              </div>
            </div>

            {/* Tactical Tip & Verdict */}
            <div className="space-y-2">
              <div className="p-3 rounded-xl bg-cyan-950/30 border border-cyan-500/40 text-xs">
                <div className="font-bold text-cyan-300 flex items-center gap-1.5 mb-1">
                  <span>💡 Tactical Analysis:</span>
                </div>
                <p className="text-gray-300 leading-relaxed">{matchRecord.tacticalTip}</p>
              </div>

              <div className="p-3 rounded-xl bg-amber-950/30 border border-amber-500/40 text-xs">
                <div className="font-bold text-amber-400 flex items-center gap-1.5 mb-1">
                  <span>🏆 Verdict:</span>
                </div>
                <p className="text-gray-300 leading-relaxed font-semibold">{matchRecord.verdict}</p>
              </div>
            </div>
          </div>
        )}

        {/* Curated Rivalry Presets Quick Clicks */}
        <h4 className="text-xs font-black uppercase tracking-wider text-gray-400 mb-2">
          Featured Blockbuster Matchups:
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {HEAD_TO_HEAD_PAIRS.slice(0, 6).map((pair, idx) => (
            <button
              key={idx}
              onClick={() => {
                setSelectedBatter(pair.batter);
                setSelectedBowler(pair.bowler);
              }}
              className="p-2.5 rounded-xl bg-gray-950 hover:bg-gray-800 border border-gray-800 hover:border-cyan-500/50 text-left transition-all flex items-center justify-between text-xs"
            >
              <div>
                <span className="font-bold text-white">{pair.batter}</span>
                <span className="text-gray-500 mx-1.5 font-mono text-[10px]">vs</span>
                <span className="font-bold text-cyan-300">{pair.bowler}</span>
              </div>
              <span className="text-[10px] font-mono text-yellow-400">
                SR: {pair.strikeRate} • {pair.dismissals}W
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
