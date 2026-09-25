import React, { useState, useEffect, useMemo } from "react";
import confetti from "canvas-confetti";
import {
  simulateT20Match,
  generateSeasonSchedule,
  initPointsTable,
  updatePointsTable,
  PITCH_CONDITIONS,
} from "../utils/squadSimulator";
import playersData from "../data/players.json";
import { FALLBACK_IMAGE } from "../utils/constants";
import { audioEngine } from "../utils/audioEffects";
import MatchWormChart from "./MatchWormChart";

export default function TournamentSimulatorModal({
  isOpen,
  onClose,
  teams,
  userTeamId,
  initialMatchTeamId,
  onOpenTradeWindow,
  onAdvanceToNextSeason,
  currentSeason = 1,
}) {
  const [activeTab, setActiveTab] = useState("SEASON"); // 'SEASON' | 'EXHIBITION'

  // Prepared teams: ensure each team has at least 11 players for simulation
  const simulationTeams = useMemo(() => {
    return teams.map((team) => {
      let squad = [...(team.players || [])];
      if (squad.length < 11) {
        // Supplement with unused players from playersData
        const existingIds = new Set(squad.map((p) => p.id));
        const unused = playersData.filter((p) => !existingIds.has(p.id));
        // Pick needed players
        const needed = 11 - squad.length;
        const supplement = unused.slice(0, needed).map((p) => ({
          ...p,
          bidPrice: p.basePrice,
          rating: p.rating || 75,
        }));
        squad = [...squad, ...supplement];
      }
      return {
        ...team,
        players: squad,
      };
    });
  }, [teams]);

  // === Season State ===
  const [schedule, setSchedule] = useState([]);
  const [completedMatches, setCompletedMatches] = useState([]);
  const [pointsTable, setPointsTable] = useState([]);
  const [playoffs, setPlayoffs] = useState({
    qualifier1: null,
    eliminator: null,
    qualifier2: null,
    final: null,
    champion: null,
  });
  const [isSimulating, setIsSimulating] = useState(false);
  const [selectedMatchDetail, setSelectedMatchDetail] = useState(null);

  // === Exhibition State ===
  const [exTeamAId, setExTeamAId] = useState(initialMatchTeamId || userTeamId || 1);
  const [exTeamBId, setExTeamBId] = useState(
    teams.find((t) => t.id !== (initialMatchTeamId || userTeamId || 1))?.id || 2
  );
  const [selectedPitchId, setSelectedPitchId] = useState("balanced");
  const [exhibitionResult, setExhibitionResult] = useState(null);

  // Initialize schedule and points table on mount
  useEffect(() => {
    if (simulationTeams.length >= 2) {
      const initialSched = generateSeasonSchedule(simulationTeams);
      setSchedule(initialSched);
      setPointsTable(initPointsTable(simulationTeams));
    }
  }, [simulationTeams]);

  // Trigger celebration when champion is crowned
  const triggerCelebration = () => {
    audioEngine.playApplause();
    audioEngine.speakAuctioneer("Congratulations to the IPL Champions!", { priority: true });
    try {
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 },
      });
      setTimeout(() => {
        confetti({
          particleCount: 150,
          spread: 100,
          origin: { y: 0.5 },
        });
      }, 400);
    } catch {
      // Confetti fallback
    }
  };

  // Simulate a single match
  const handleSimulateSingleMatch = () => {
    const nextMatchIdx = schedule.findIndex((m) => m.status === "UPCOMING");
    if (nextMatchIdx === -1) {
      // League finished! Check playoffs
      handleAdvancePlayoffs();
      return;
    }

    const matchToPlay = schedule[nextMatchIdx];
    const teamA = simulationTeams.find((t) => t.id === matchToPlay.teamA.id);
    const teamB = simulationTeams.find((t) => t.id === matchToPlay.teamB.id);

    const matchResult = simulateT20Match(teamA, teamB, null, null, matchToPlay.pitch.id);

    const updatedMatch = {
      ...matchToPlay,
      status: "COMPLETED",
      result: matchResult,
    };

    const newSchedule = [...schedule];
    newSchedule[nextMatchIdx] = updatedMatch;
    setSchedule(newSchedule);

    const newCompleted = [...completedMatches, updatedMatch];
    setCompletedMatches(newCompleted);

    const updatedTable = updatePointsTable(pointsTable, newCompleted);
    setPointsTable(updatedTable);
    setSelectedMatchDetail(updatedMatch);

    // If this was the last league match, advance to playoffs
    if (newCompleted.length === schedule.length) {
      setupPlayoffs(updatedTable);
    }
  };

  // Simulate multiple matches (e.g. next round or full season)
  const handleSimulateAllLeague = async () => {
    setIsSimulating(true);
    let currentSched = [...schedule];
    let newCompleted = [...completedMatches];
    let currentTable = [...pointsTable];

    for (let i = 0; i < currentSched.length; i++) {
      if (currentSched[i].status === "UPCOMING") {
        const m = currentSched[i];
        const teamA = simulationTeams.find((t) => t.id === m.teamA.id);
        const teamB = simulationTeams.find((t) => t.id === m.teamB.id);
        const res = simulateT20Match(teamA, teamB, null, null, m.pitch.id);
        currentSched[i] = {
          ...m,
          status: "COMPLETED",
          result: res,
        };
        newCompleted.push(currentSched[i]);
      }
    }

    setSchedule(currentSched);
    setCompletedMatches(newCompleted);
    const finalTable = updatePointsTable(currentTable, newCompleted);
    setPointsTable(finalTable);
    setupPlayoffs(finalTable);
    setIsSimulating(false);
  };

  // Setup playoffs based on top 4
  const setupPlayoffs = (table) => {
    if (!table || table.length < 4) return;
    const top4 = table.slice(0, 4).map((row) => simulationTeams.find((t) => t.id === row.teamId));

    // Q1: #1 vs #2
    const q1Result = simulateT20Match(top4[0], top4[1], null, null, "balanced");
    const q1Winner = q1Result.winner;
    const q1Loser = q1Winner.id === top4[0].id ? top4[1] : top4[0];

    // Eliminator: #3 vs #4
    const elimResult = simulateT20Match(top4[2], top4[3], null, null, "balanced");
    const elimWinner = elimResult.winner;

    // Q2: Loser Q1 vs Winner Eliminator
    const q2Result = simulateT20Match(q1Loser, elimWinner, null, null, "balanced");
    const q2Winner = q2Result.winner;

    // Grand Final: Winner Q1 vs Winner Q2
    const finalResult = simulateT20Match(q1Winner, q2Winner, null, null, "batting_paradise");
    const champion = finalResult.winner;

    setPlayoffs({
      qualifier1: { teamA: top4[0], teamB: top4[1], result: q1Result },
      eliminator: { teamA: top4[2], teamB: top4[3], result: elimResult },
      qualifier2: { teamA: q1Loser, teamB: elimWinner, result: q2Result },
      final: { teamA: q1Winner, teamB: q2Winner, result: finalResult },
      champion,
    });

    triggerCelebration();
  };

  const handleAdvancePlayoffs = () => {
    if (!playoffs.qualifier1) {
      setupPlayoffs(pointsTable);
    }
  };

  // Reset season simulation
  const handleResetSeason = () => {
    const initialSched = generateSeasonSchedule(simulationTeams);
    setSchedule(initialSched);
    setCompletedMatches([]);
    setPointsTable(initPointsTable(simulationTeams));
    setPlayoffs({
      qualifier1: null,
      eliminator: null,
      qualifier2: null,
      final: null,
      champion: null,
    });
    setSelectedMatchDetail(null);
  };

  // Run Quick Exhibition Match
  const handleRunExhibition = () => {
    const teamA = simulationTeams.find((t) => t.id === Number(exTeamAId));
    const teamB = simulationTeams.find((t) => t.id === Number(exTeamBId));
    if (!teamA || !teamB || teamA.id === teamB.id) return;

    audioEngine.playGavelStrike(0.6);
    const res = simulateT20Match(teamA, teamB, null, null, selectedPitchId);
    setExhibitionResult(res);
  };

  if (!isOpen) return null;

  const totalLeagueMatches = schedule.length;
  const matchesRemaining = schedule.filter((m) => m.status === "UPCOMING").length;
  const isLeagueComplete = totalLeagueMatches > 0 && matchesRemaining === 0;

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-md flex justify-center items-center z-50 p-2 md:p-4">
      <div className="bg-gradient-to-b from-gray-900 via-gray-900 to-black border-2 border-yellow-500 rounded-3xl shadow-2xl w-full max-w-6xl text-white flex flex-col max-h-[92vh] overflow-hidden">
        {/* Modal Header */}
        <div className="p-4 md:p-6 border-b border-gray-800 flex flex-wrap items-center justify-between gap-3 bg-gray-950/80">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">🏆</span>
              <h2 className="text-2xl md:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-amber-300 to-yellow-500">
                IPL Match & Tournament Simulator
              </h2>
            </div>
            <p className="text-xs text-gray-400 mt-1">
              Simulate full IPL seasons, live T20 match-ups, scorecards, and playoff trophy championships!
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* Mode Switcher Tabs */}
            <div className="bg-gray-800 p-1 rounded-xl flex items-center gap-1 text-xs font-bold border border-gray-700">
              <button
                onClick={() => setActiveTab("SEASON")}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  activeTab === "SEASON"
                    ? "bg-yellow-400 text-black shadow-md font-black"
                    : "text-gray-300 hover:text-white"
                }`}
              >
                🏆 Full Season
              </button>
              <button
                onClick={() => setActiveTab("EXHIBITION")}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  activeTab === "EXHIBITION"
                    ? "bg-yellow-400 text-black shadow-md font-black"
                    : "text-gray-300 hover:text-white"
                }`}
              >
                ⚡ Quick Match
              </button>
            </div>

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-gray-800 hover:bg-red-600 text-white font-bold flex items-center justify-center transition-colors text-sm"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Tab 1: FULL SEASON MODE */}
        {activeTab === "SEASON" && (
          <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
            {/* Champion Crowning Banner if finished */}
            {playoffs.champion && (
              <div className="p-6 rounded-3xl bg-gradient-to-r from-amber-600 via-yellow-500 to-amber-700 border-2 border-yellow-300 text-black shadow-2xl flex flex-wrap items-center justify-between gap-4 animate-fade-in">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-black/20 border-2 border-black/40 flex items-center justify-center text-3xl shadow-inner">
                    🏆
                  </div>
                  <div>
                    <span className="text-xs font-black uppercase tracking-widest text-black/70">
                      TATA IPL CHAMPIONS CROWNED
                    </span>
                    <h3 className="text-3xl font-black text-black">
                      {playoffs.champion.name} are the Champions!
                    </h3>
                    <p className="text-xs font-bold text-black/80 mt-0.5">
                      {playoffs.final?.result?.margin || "Won the grand finale in spectacular fashion!"}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  {onAdvanceToNextSeason && (
                    <button
                      onClick={onAdvanceToNextSeason}
                      className="px-4 py-2 bg-black hover:bg-gray-900 text-yellow-300 border-2 border-black/30 font-black rounded-xl text-xs shadow-lg transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      <span>🚀</span>
                      <span>Advance to Season {currentSeason + 1} & Mini-Auction ▶</span>
                    </button>
                  )}
                  <button
                    onClick={triggerCelebration}
                    className="px-4 py-2 bg-black hover:bg-gray-900 text-yellow-400 font-black rounded-xl text-xs shadow-lg transition-all"
                  >
                    🎉 Fireworks & Confetti
                  </button>
                  <button
                    onClick={handleResetSeason}
                    className="px-4 py-2 bg-black/30 hover:bg-black/50 text-black font-bold rounded-xl text-xs transition-all border border-black/20"
                  >
                    ↺ Reset Season
                  </button>
                </div>
              </div>
            )}

            {/* League Controls Bar */}
            <div className="p-3 bg-gray-900/90 rounded-2xl border border-gray-800 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-3">
                <span className="font-bold text-white">
                  League Progress:{" "}
                  <span className="text-yellow-400">
                    {completedMatches.length}/{totalLeagueMatches} Matches
                  </span>
                </span>
                <div className="w-32 bg-gray-800 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-yellow-400 h-full transition-all"
                    style={{
                      width: `${(completedMatches.length / Math.max(1, totalLeagueMatches)) * 100}%`,
                    }}
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                {onOpenTradeWindow && (
                  <button
                    onClick={onOpenTradeWindow}
                    className="px-3 py-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold rounded-xl transition-all shadow-md flex items-center gap-1.5"
                    title="Open Mid-Season Transfer Window"
                  >
                    <span>🔄</span>
                    <span>Trade Center</span>
                  </button>
                )}

                {!isLeagueComplete && (
                  <>
                    <button
                      onClick={handleSimulateSingleMatch}
                      disabled={isSimulating}
                      className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold rounded-xl transition-all shadow-md"
                    >
                      ▶ Simulate Next Match
                    </button>
                    <button
                      onClick={handleSimulateAllLeague}
                      disabled={isSimulating}
                      className="px-4 py-1.5 bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-400 hover:to-amber-400 text-black font-black rounded-xl transition-all shadow-md"
                    >
                      ⚡ Fast-Simulate Entire Season
                    </button>
                  </>
                )}

                {isLeagueComplete && !playoffs.champion && (
                  <button
                    onClick={handleAdvancePlayoffs}
                    className="px-5 py-2 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 text-black font-black rounded-xl transition-all shadow-lg animate-pulse"
                  >
                    ⚡ Play Playoffs & Crown Champion
                  </button>
                )}

                <button
                  onClick={handleResetSeason}
                  className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-300 font-semibold rounded-xl transition-all"
                >
                  ↺ Reset
                </button>
              </div>
            </div>

            {/* Split View: Points Table on Left / Match Detail & Playoffs on Right */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
              {/* Points Table (Col 7) */}
              <div className="lg:col-span-7 bg-gray-900/80 rounded-2xl border border-gray-800 p-3 overflow-hidden flex flex-col">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-black text-sm text-yellow-400 uppercase tracking-wider flex items-center gap-1.5">
                    <span>📊 Official Points Table</span>
                  </h3>
                  <span className="text-[10px] text-emerald-400 font-semibold">
                    Top 4 Qualify for Playoffs
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-gray-800/80 text-gray-400 text-[11px] uppercase">
                        <th className="p-2 rounded-l-lg">Pos</th>
                        <th className="p-2">Franchise</th>
                        <th className="p-2 text-center">P</th>
                        <th className="p-2 text-center">W</th>
                        <th className="p-2 text-center">L</th>
                        <th className="p-2 text-center font-bold text-yellow-400">PTS</th>
                        <th className="p-2 text-center">NRR</th>
                        <th className="p-2 text-right rounded-r-lg">Form</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-800">
                      {pointsTable.map((row, idx) => {
                        const isPlayoffs = idx < 4;
                        const isUser = row.teamId === userTeamId;
                        return (
                          <tr
                            key={row.teamId}
                            className={`hover:bg-gray-800/50 transition-colors ${
                              isPlayoffs ? "bg-emerald-950/20" : ""
                            }`}
                          >
                            <td className="p-2 font-mono font-bold text-gray-400">
                              <span
                                className={`w-5 h-5 rounded inline-flex items-center justify-center text-[10px] font-extrabold ${
                                  idx === 0
                                    ? "bg-yellow-500 text-black"
                                    : idx < 4
                                    ? "bg-emerald-500 text-black"
                                    : "bg-gray-800 text-gray-400"
                                }`}
                              >
                                {idx + 1}
                              </span>
                            </td>
                            <td className="p-2 font-bold text-white flex items-center gap-1.5">
                              <span>{row.teamName}</span>
                              {isUser && (
                                <span className="text-[9px] px-1 py-0.2 bg-yellow-400 text-black rounded font-black">
                                  YOU
                                </span>
                              )}
                            </td>
                            <td className="p-2 text-center text-gray-300 font-mono">{row.played}</td>
                            <td className="p-2 text-center text-emerald-400 font-mono font-bold">{row.won}</td>
                            <td className="p-2 text-center text-red-400 font-mono">{row.lost}</td>
                            <td className="p-2 text-center text-yellow-400 font-black text-sm font-mono">
                              {row.points}
                            </td>
                            <td className="p-2 text-center font-mono text-[11px] text-gray-300">{row.nrr}</td>
                            <td className="p-2 text-right">
                              <div className="flex items-center justify-end gap-1">
                                {row.form.length === 0 ? (
                                  <span className="text-gray-600">-</span>
                                ) : (
                                  row.form.map((res, fIdx) => (
                                    <span
                                      key={fIdx}
                                      className={`w-3.5 h-3.5 rounded text-[8px] font-black flex items-center justify-center ${
                                        res === "W"
                                          ? "bg-emerald-600 text-white"
                                          : "bg-red-700 text-white"
                                      }`}
                                    >
                                      {res}
                                    </span>
                                  ))
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Playoffs & Match Scorecard View (Col 5) */}
              <div className="lg:col-span-5 flex flex-col gap-3">
                {/* Playoffs Stage Tracker */}
                <div className="bg-gray-900/80 rounded-2xl border border-gray-800 p-3">
                  <h3 className="font-black text-sm text-yellow-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <span>⚡ IPL Playoffs Bracket</span>
                  </h3>

                  {!playoffs.qualifier1 ? (
                    <div className="p-4 text-center text-gray-500 text-xs italic bg-gray-950/50 rounded-xl border border-gray-800">
                      Playoffs will be unlocked automatically upon completion of the 45-match league stage.
                    </div>
                  ) : (
                    <div className="space-y-2 text-xs">
                      {/* Q1 */}
                      <div className="p-2.5 rounded-xl bg-gray-950 border border-gray-800">
                        <div className="flex justify-between text-[10px] text-gray-400 font-bold mb-1">
                          <span>QUALIFIER 1 (1st vs 2nd)</span>
                          <span className="text-yellow-400 font-black">
                            Winner: {playoffs.qualifier1.result.winner.shortName}
                          </span>
                        </div>
                        <div className="flex justify-between items-center font-bold">
                          <span className="text-white">{playoffs.qualifier1.teamA.shortName}</span>
                          <span className="text-gray-500 font-mono text-[10px]">vs</span>
                          <span className="text-white">{playoffs.qualifier1.teamB.shortName}</span>
                        </div>
                      </div>

                      {/* Eliminator */}
                      <div className="p-2.5 rounded-xl bg-gray-950 border border-gray-800">
                        <div className="flex justify-between text-[10px] text-gray-400 font-bold mb-1">
                          <span>ELIMINATOR (3rd vs 4th)</span>
                          <span className="text-yellow-400 font-black">
                            Winner: {playoffs.eliminator.result.winner.shortName}
                          </span>
                        </div>
                        <div className="flex justify-between items-center font-bold">
                          <span className="text-white">{playoffs.eliminator.teamA.shortName}</span>
                          <span className="text-gray-500 font-mono text-[10px]">vs</span>
                          <span className="text-white">{playoffs.eliminator.teamB.shortName}</span>
                        </div>
                      </div>

                      {/* Q2 */}
                      <div className="p-2.5 rounded-xl bg-gray-950 border border-gray-800">
                        <div className="flex justify-between text-[10px] text-gray-400 font-bold mb-1">
                          <span>QUALIFIER 2</span>
                          <span className="text-yellow-400 font-black">
                            Winner: {playoffs.qualifier2.result.winner.shortName}
                          </span>
                        </div>
                        <div className="flex justify-between items-center font-bold">
                          <span className="text-white">{playoffs.qualifier2.teamA.shortName}</span>
                          <span className="text-gray-500 font-mono text-[10px]">vs</span>
                          <span className="text-white">{playoffs.qualifier2.teamB.shortName}</span>
                        </div>
                      </div>

                      {/* Final */}
                      <div className="p-3 rounded-xl bg-gradient-to-r from-yellow-950/40 to-amber-950/40 border border-yellow-500/50">
                        <div className="flex justify-between text-[10px] text-yellow-400 font-black mb-1">
                          <span>🏆 GRAND FINAL</span>
                          <span className="text-emerald-400">
                            CHAMPION: {playoffs.final.result.winner.name}
                          </span>
                        </div>
                        <div className="flex justify-between items-center font-extrabold text-sm">
                          <span className="text-white">{playoffs.final.teamA.name}</span>
                          <span className="text-yellow-400 font-mono">VS</span>
                          <span className="text-white">{playoffs.final.teamB.name}</span>
                        </div>
                        <p className="text-[11px] text-gray-300 mt-1 italic">
                          {playoffs.final.result.margin}
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Latest Match Highlight Card */}
                {selectedMatchDetail && selectedMatchDetail.result && (
                  <div className="bg-gray-900/80 rounded-2xl border border-gray-800 p-3 text-xs flex-1">
                    <h3 className="font-black text-sm text-yellow-400 uppercase tracking-wider mb-2">
                      Recent Match Result
                    </h3>
                    <div className="bg-gray-950 p-3 rounded-xl border border-gray-800 mb-2">
                      <div className="flex justify-between items-center font-bold text-sm mb-1">
                        <span className="text-white">
                          {selectedMatchDetail.result.battingFirstTeam.shortName}:{" "}
                          <span className="text-yellow-400">
                            {selectedMatchDetail.result.inn1.totalRuns}/
                            {selectedMatchDetail.result.inn1.wickets}
                          </span>{" "}
                          <span className="text-[10px] text-gray-400">
                            ({selectedMatchDetail.result.inn1.oversFormatted} ov)
                          </span>
                        </span>
                        <span className="text-gray-500">vs</span>
                        <span className="text-white">
                          {selectedMatchDetail.result.bowlingFirstTeam.shortName}:{" "}
                          <span className="text-yellow-400">
                            {selectedMatchDetail.result.inn2.totalRuns}/
                            {selectedMatchDetail.result.inn2.wickets}
                          </span>{" "}
                          <span className="text-[10px] text-gray-400">
                            ({selectedMatchDetail.result.inn2.oversFormatted} ov)
                          </span>
                        </span>
                      </div>
                      <p className="text-emerald-400 font-extrabold text-xs">
                        {selectedMatchDetail.result.winner.name} {selectedMatchDetail.result.margin}
                      </p>

                      {/* Impact Player Substitutions */}
                      {selectedMatchDetail.result.impactSubstitutions &&
                        selectedMatchDetail.result.impactSubstitutions.length > 0 && (
                          <div className="mt-2 p-2 rounded-lg bg-amber-950/30 border border-amber-500/40 text-[10px]">
                            <div className="font-extrabold text-amber-400 flex items-center gap-1 mb-1">
                              <span>⚡</span>
                              <span>Official Impact Player Substitutions:</span>
                            </div>
                            {selectedMatchDetail.result.impactSubstitutions.map((sub, i) => (
                              <div key={i} className="text-gray-300">
                                <span className="font-bold text-white">{sub.team.shortName}:</span>{" "}
                                <span className="text-amber-300 font-bold">{sub.playerIn.name}</span> in for{" "}
                                <span className="line-through text-gray-400">{sub.playerOut.name}</span> ({sub.reason})
                              </div>
                            ))}
                          </div>
                        )}
                    </div>

                    {/* POTM */}
                    {selectedMatchDetail.result.potm && (
                      <div className="p-2 rounded-xl bg-purple-950/40 border border-purple-500/40 flex items-center justify-between text-[11px] mb-3">
                        <span className="text-purple-300 font-bold">⭐ Player of the Match:</span>
                        <span className="text-white font-extrabold">
                          {selectedMatchDetail.result.potm.player?.name} ({selectedMatchDetail.result.potm.label})
                        </span>
                      </div>
                    )}

                    {/* Phase 7: Interactive Match Worm & Manhattan Analytics */}
                    <div className="mt-3">
                      <MatchWormChart matchResult={selectedMatchDetail.result} />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: EXHIBITION QUICK MATCH */}
        {activeTab === "EXHIBITION" && (
          <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
            {/* Team & Pitch Selector Card */}
            <div className="p-4 bg-gray-900 rounded-2xl border border-gray-800 grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
              {/* Team A */}
              <div>
                <label className="block text-xs font-bold text-gray-400 mb-1">
                  Team A (Home Franchise)
                </label>
                <select
                  value={exTeamAId}
                  onChange={(e) => setExTeamAId(Number(e.target.value))}
                  className="w-full bg-gray-800 border border-gray-700 rounded-xl p-2.5 text-xs text-white font-bold focus:outline-none focus:border-yellow-400"
                >
                  {simulationTeams.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name} {t.id === userTeamId ? " (Your Team)" : ""}
                    </option>
                  ))}
                </select>
              </div>

              {/* Pitch */}
              <div>
                <label className="block text-xs font-bold text-gray-400 mb-1">
                  Stadium & Pitch Condition
                </label>
                <select
                  value={selectedPitchId}
                  onChange={(e) => setSelectedPitchId(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-xl p-2.5 text-xs text-yellow-300 font-bold focus:outline-none focus:border-yellow-400"
                >
                  {PITCH_CONDITIONS.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} — {p.venue}
                    </option>
                  ))}
                </select>
              </div>

              {/* Team B */}
              <div>
                <label className="block text-xs font-bold text-gray-400 mb-1">
                  Team B (Away Challenger)
                </label>
                <select
                  value={exTeamBId}
                  onChange={(e) => setExTeamBId(Number(e.target.value))}
                  className="w-full bg-gray-800 border border-gray-700 rounded-xl p-2.5 text-xs text-white font-bold focus:outline-none focus:border-yellow-400"
                >
                  {simulationTeams.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Launch Match Button */}
            <div className="flex justify-center">
              <button
                onClick={handleRunExhibition}
                className="px-6 py-3 bg-gradient-to-r from-yellow-500 via-amber-400 to-yellow-500 hover:from-yellow-400 hover:to-amber-300 text-black font-black text-sm rounded-2xl shadow-xl shadow-yellow-500/20 active:scale-95 transition-all flex items-center gap-2"
              >
                <span>⚡ Simulate T20 Matchup</span>
              </button>
            </div>

            {/* Exhibition Result Display */}
            {exhibitionResult && (
              <div className="flex flex-col gap-4 animate-fade-in">
                {/* Result Hero Header */}
                <div className="p-4 rounded-2xl bg-gradient-to-r from-indigo-950 via-gray-900 to-indigo-950 border border-indigo-500/50 flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <span className="text-[10px] font-bold text-indigo-300 uppercase tracking-widest">
                      {exhibitionResult.pitch.venue}
                    </span>
                    <h3 className="text-2xl font-black text-white">
                      {exhibitionResult.winner.name} {exhibitionResult.margin}
                    </h3>
                    <p className="text-xs text-gray-300 mt-0.5">
                      Toss: {exhibitionResult.toss.winner.name} won toss & elected to {exhibitionResult.toss.decision} first
                    </p>
                  </div>

                  {/* Player of the Match */}
                  <div className="bg-gray-800/80 px-4 py-2 rounded-xl border border-yellow-500/40 text-right">
                    <span className="text-[10px] text-yellow-400 font-bold block">
                      ⭐ PLAYER OF THE MATCH
                    </span>
                    <span className="text-sm font-black text-white">
                      {exhibitionResult.potm.player?.name}
                    </span>
                    <span className="text-xs text-gray-400 block font-mono">
                      {exhibitionResult.potm.label}
                    </span>
                  </div>
                </div>

                {/* Impact Player Substitutions Banner */}
                {exhibitionResult.impactSubstitutions &&
                  exhibitionResult.impactSubstitutions.length > 0 && (
                    <div className="p-3 bg-amber-950/30 border border-amber-500/50 rounded-2xl text-xs">
                      <div className="font-extrabold text-amber-300 flex items-center gap-1.5 mb-1.5">
                        <span>⚡</span>
                        <span>Tactical Impact Player (12th Man) Substitutions</span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {exhibitionResult.impactSubstitutions.map((sub, i) => (
                          <div
                            key={i}
                            className="bg-gray-900/80 border border-gray-800 p-2 rounded-xl flex items-center justify-between"
                          >
                            <div>
                              <span className="font-bold text-white">{sub.team.shortName}:</span>{" "}
                              <span className="text-amber-400 font-bold">{sub.playerIn.name}</span>{" "}
                              <span className="text-gray-400 text-[11px]">in for</span>{" "}
                              <span className="line-through text-gray-400 text-[11px]">
                                {sub.playerOut.name}
                              </span>
                            </div>
                            <span className="text-[10px] text-gray-500 italic">
                              Inn {sub.innings}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                {/* Both Innings Scorecards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Innings 1 Card */}
                  <div className="bg-gray-900/90 rounded-2xl border border-gray-800 p-4">
                    <div className="flex justify-between items-center mb-3 pb-2 border-b border-gray-800">
                      <div>
                        <h4 className="font-extrabold text-base text-yellow-400">
                          {exhibitionResult.battingFirstTeam.name}
                        </h4>
                        <span className="text-[10px] text-gray-400">1st Innings</span>
                      </div>
                      <div className="text-right">
                        <span className="text-xl font-black text-white">
                          {exhibitionResult.inn1.totalRuns}/{exhibitionResult.inn1.wickets}
                        </span>
                        <span className="text-xs text-gray-400 block">
                          ({exhibitionResult.inn1.oversFormatted} ov • RR: {exhibitionResult.inn1.runRate})
                        </span>
                      </div>
                    </div>

                    {/* Batting Card */}
                    <div className="space-y-1 mb-4">
                      {exhibitionResult.inn1.batterCards.map((b, idx) => (
                        <div
                          key={idx}
                          className="flex justify-between items-center text-xs py-1 border-b border-gray-800/50"
                        >
                          <div className="min-w-0 pr-2">
                            <span className="font-bold text-white block truncate">
                              {b.player.name}
                            </span>
                            <span className="text-[10px] text-gray-400 block truncate">
                              {b.dismissal}
                            </span>
                          </div>
                          <div className="font-mono text-right shrink-0">
                            <span className="font-bold text-white text-sm">{b.runs}</span>
                            <span className="text-gray-400 text-[10px]"> ({b.balls}b, {b.fours}x4, {b.sixes}x6)</span>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Bowling Card */}
                    <h5 className="font-bold text-[11px] uppercase tracking-wider text-gray-400 mb-1.5">
                      Bowling Figures
                    </h5>
                    <div className="space-y-1">
                      {exhibitionResult.inn1.bowlerCards.map((bw, idx) => (
                        <div
                          key={idx}
                          className="flex justify-between items-center text-xs py-0.5"
                        >
                          <span className="text-gray-300 font-semibold">{bw.player.name}</span>
                          <span className="font-mono text-gray-400">
                            {bw.overs} ov • {bw.wickets}/{bw.runs} (Econ: {bw.economy.toFixed(1)})
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Innings 2 Card */}
                  <div className="bg-gray-900/90 rounded-2xl border border-gray-800 p-4">
                    <div className="flex justify-between items-center mb-3 pb-2 border-b border-gray-800">
                      <div>
                        <h4 className="font-extrabold text-base text-yellow-400">
                          {exhibitionResult.bowlingFirstTeam.name}
                        </h4>
                        <span className="text-[10px] text-gray-400">2nd Innings (Target: {exhibitionResult.inn1.totalRuns + 1})</span>
                      </div>
                      <div className="text-right">
                        <span className="text-xl font-black text-white">
                          {exhibitionResult.inn2.totalRuns}/{exhibitionResult.inn2.wickets}
                        </span>
                        <span className="text-xs text-gray-400 block">
                          ({exhibitionResult.inn2.oversFormatted} ov • RR: {exhibitionResult.inn2.runRate})
                        </span>
                      </div>
                    </div>

                    {/* Batting Card */}
                    <div className="space-y-1 mb-4">
                      {exhibitionResult.inn2.batterCards.map((b, idx) => (
                        <div
                          key={idx}
                          className="flex justify-between items-center text-xs py-1 border-b border-gray-800/50"
                        >
                          <div className="min-w-0 pr-2">
                            <span className="font-bold text-white block truncate">
                              {b.player.name}
                            </span>
                            <span className="text-[10px] text-gray-400 block truncate">
                              {b.dismissal}
                            </span>
                          </div>
                          <div className="font-mono text-right shrink-0">
                            <span className="font-bold text-white text-sm">{b.runs}</span>
                            <span className="text-gray-400 text-[10px]"> ({b.balls}b, {b.fours}x4, {b.sixes}x6)</span>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Bowling Card */}
                    <h5 className="font-bold text-[11px] uppercase tracking-wider text-gray-400 mb-1.5">
                      Bowling Figures
                    </h5>
                    <div className="space-y-1">
                      {exhibitionResult.inn2.bowlerCards.map((bw, idx) => (
                        <div
                          key={idx}
                          className="flex justify-between items-center text-xs py-0.5"
                        >
                          <span className="text-gray-300 font-semibold">{bw.player.name}</span>
                          <span className="font-mono text-gray-400">
                            {bw.overs} ov • {bw.wickets}/{bw.runs} (Econ: {bw.economy.toFixed(1)})
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Phase 7: Interactive Match Worm & Manhattan Analytics for Exhibition */}
                <MatchWormChart matchResult={exhibitionResult} />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
