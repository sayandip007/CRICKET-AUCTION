import React, { useState, useMemo } from "react";
import { isOverseas } from "../utils/squadSimulator";
import { FALLBACK_IMAGE } from "../utils/constants";
import { audioEngine } from "../utils/audioEffects";

export default function TradeCenterModal({
  isOpen,
  onClose,
  teams,
  userTeamId,
  onExecuteTrade,
}) {
  const [teamAId, setTeamAId] = useState(userTeamId || 1);
  const [teamBId, setTeamBId] = useState(
    teams.find((t) => t.id !== (userTeamId || 1))?.id || 2
  );

  const [selectedPlayersA, setSelectedPlayersA] = useState([]);
  const [selectedPlayersB, setSelectedPlayersB] = useState([]);
  const [cashOffer, setCashOffer] = useState(0); // in Crores: positive means Team A gives cash to Team B

  const teamA = useMemo(() => teams.find((t) => t.id === teamAId) || teams[0], [teams, teamAId]);
  const teamB = useMemo(() => teams.find((t) => t.id === teamBId) || teams[1], [teams, teamBId]);

  // Reset selections when switching teams
  const handleTeamAChange = (id) => {
    setTeamAId(id);
    setSelectedPlayersA([]);
    if (id === teamBId) {
      const other = teams.find((t) => t.id !== id);
      setTeamBId(other ? other.id : 2);
      setSelectedPlayersB([]);
    }
  };

  const handleTeamBChange = (id) => {
    setTeamBId(id);
    setSelectedPlayersB([]);
    if (id === teamAId) {
      const other = teams.find((t) => t.id !== id);
      setTeamAId(other ? other.id : 1);
      setSelectedPlayersA([]);
    }
  };

  // Toggle player selection
  const togglePlayerA = (player) => {
    if (selectedPlayersA.some((p) => p.id === player.id)) {
      setSelectedPlayersA(selectedPlayersA.filter((p) => p.id !== player.id));
    } else {
      if (selectedPlayersA.length < 2) {
        setSelectedPlayersA([...selectedPlayersA, player]);
      }
    }
  };

  const togglePlayerB = (player) => {
    if (selectedPlayersB.some((p) => p.id === player.id)) {
      setSelectedPlayersB(selectedPlayersB.filter((p) => p.id !== player.id));
    } else {
      if (selectedPlayersB.length < 2) {
        setSelectedPlayersB([...selectedPlayersB, player]);
      }
    }
  };

  // AI Trade Evaluation Engine
  const evaluation = useMemo(() => {
    if (selectedPlayersA.length === 0 || selectedPlayersB.length === 0) {
      return {
        acceptable: false,
        status: "SELECT_PLAYERS",
        score: 0,
        feedback: "Select at least 1 player from each franchise to evaluate trade.",
        reason: "Trade proposal incomplete.",
      };
    }

    // Squad size checks
    const newSizeA = (teamA.players || []).length - selectedPlayersA.length + selectedPlayersB.length;
    const newSizeB = (teamB.players || []).length - selectedPlayersB.length + selectedPlayersA.length;

    if (newSizeA < 18 || newSizeB < 18) {
      return {
        acceptable: false,
        status: "ROSTER_SIZE_VIOLATION",
        score: 0,
        feedback: "Trade rejected: A franchise would drop below the mandatory 18-player minimum.",
        reason: "Minimum squad size is 18 players.",
      };
    }

    if (newSizeA > 25 || newSizeB > 25) {
      return {
        acceptable: false,
        status: "ROSTER_SIZE_VIOLATION",
        score: 0,
        feedback: "Trade rejected: A franchise would exceed the 25-player squad ceiling.",
        reason: "Maximum squad size is 25 players.",
      };
    }

    // Overseas quota checks
    const currentOverseasA = (teamA.players || []).filter(isOverseas).length;
    const currentOverseasB = (teamB.players || []).filter(isOverseas).length;
    const sendingOverseasA = selectedPlayersA.filter(isOverseas).length;
    const sendingOverseasB = selectedPlayersB.filter(isOverseas).length;

    const newOverseasA = currentOverseasA - sendingOverseasA + sendingOverseasB;
    const newOverseasB = currentOverseasB - sendingOverseasB + sendingOverseasA;

    if (newOverseasA > 8 || newOverseasB > 8) {
      return {
        acceptable: false,
        status: "OVERSEAS_LIMIT_VIOLATION",
        score: 0,
        feedback: "Trade blocked by IPL Regulations: A franchise would exceed 8 overseas players.",
        reason: "Overseas ceiling is strictly 8 players.",
      };
    }

    // Budget checks
    const budgetA = teamA.budget || 0;
    const budgetB = teamB.budget || 0;
    if (cashOffer > 0 && budgetA < cashOffer) {
      return {
        acceptable: false,
        status: "INSUFFICIENT_FUNDS",
        score: 0,
        feedback: `Trade invalid: ${teamA.name} only has ₹${budgetA.toFixed(2)}Cr and cannot pay ₹${cashOffer.toFixed(2)}Cr cash.`,
        reason: "Insufficient purse balance.",
      };
    }
    if (cashOffer < 0 && budgetB < Math.abs(cashOffer)) {
      return {
        acceptable: false,
        status: "INSUFFICIENT_FUNDS",
        score: 0,
        feedback: `Trade invalid: ${teamB.name} only has ₹${budgetB.toFixed(2)}Cr and cannot pay ₹${Math.abs(cashOffer).toFixed(2)}Cr cash.`,
        reason: "Insufficient purse balance.",
      };
    }

    // Calculate rating and valuation
    const totalRatingA = selectedPlayersA.reduce((sum, p) => sum + (p.rating || 75), 0);
    const totalRatingB = selectedPlayersB.reduce((sum, p) => sum + (p.rating || 75), 0);

    // Cash factor: 1 Cr cash is worth ~3.5 rating points in value
    const cashValueAdjustment = cashOffer * 3.5;
    const effectiveOfferFromA = totalRatingA + cashValueAdjustment;

    // Team B role needs bonus: if Team B receives a Bowler/Keeper they lack
    let needBonus = 0;
    const teamBRoles = (teamB.players || []).map((p) => p.role);
    const bowlersCountB = teamBRoles.filter((r) => r === "Bowler" || r === "All-Rounder").length;
    if (bowlersCountB < 7 && selectedPlayersA.some((p) => p.role === "Bowler")) {
      needBonus += 6;
    }

    const tradeFairness = (effectiveOfferFromA + needBonus) / totalRatingB;

    // If Team B is an AI franchise, they accept if fairness >= 0.95
    if (tradeFairness >= 0.95) {
      return {
        acceptable: true,
        status: "APPROVED",
        score: Math.min(100, Math.round(tradeFairness * 70)),
        feedback: `Deal Approved! ${teamB.name} management agrees to this proposal. ${
          needBonus > 0 ? "This addresses their bowling deficit!" : "Value is fair for both sides."
        }`,
        reason: "Mutual benefit & balanced exchange.",
      };
    } else {
      const deficit = Math.round(totalRatingB - effectiveOfferFromA);
      return {
        acceptable: false,
        status: "DECLINED",
        score: Math.max(15, Math.round(tradeFairness * 60)),
        feedback: `${teamB.name} declined the offer: "You are asking for a superstar without adequate talent or cash in return (deficit of ~${deficit} rating points)."`,
        reason: "Value disparity is too high.",
      };
    }
  }, [selectedPlayersA, selectedPlayersB, cashOffer, teamA, teamB]);

  const handleConfirmTrade = () => {
    if (!evaluation.acceptable) return;

    audioEngine.playPaddlePop();
    onExecuteTrade({
      teamAId: teamA.id,
      teamBId: teamB.id,
      playersFromA: selectedPlayersA,
      playersFromB: selectedPlayersB,
      cashOffer,
    });

    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-md flex justify-center items-center z-50 p-4 animate-fadeIn">
      <div className="bg-gradient-to-b from-gray-900 via-gray-900 to-black p-5 md:p-7 rounded-3xl border-2 border-indigo-500/80 shadow-2xl w-full max-w-5xl text-white max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-gray-800">
          <div className="flex items-center gap-2.5">
            <span className="text-2xl">🔄</span>
            <div>
              <h2 className="text-xl md:text-2xl font-black text-white flex items-center gap-2">
                <span>IPL Transfer Window & Trade Center</span>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-green-500/20 text-green-400 border border-green-500/40 font-bold uppercase tracking-wider">
                  Window Open
                </span>
              </h2>
              <p className="text-xs text-gray-400">
                Negotiate player-for-player swaps and cash trades with rival franchises.
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

        {/* Trade Partners Selector */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-3 text-xs">
          {/* Franchise A */}
          <div className="bg-gray-950 p-3 rounded-2xl border border-gray-800">
            <div className="flex items-center justify-between mb-2">
              <span className="font-extrabold text-yellow-400 uppercase tracking-wider">
                Franchise 1 (Your Team):
              </span>
              <span className="text-gray-400">Purse: ₹{teamA.budget?.toFixed(2)}Cr</span>
            </div>
            <select
              value={teamAId}
              onChange={(e) => handleTeamAChange(parseInt(e.target.value))}
              className="w-full bg-gray-900 border border-gray-700 rounded-xl p-2 text-white font-bold focus:outline-none focus:border-yellow-400"
            >
              {teams.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name} ({t.players?.length || 0} players)
                </option>
              ))}
            </select>
          </div>

          {/* Franchise B */}
          <div className="bg-gray-950 p-3 rounded-2xl border border-gray-800">
            <div className="flex items-center justify-between mb-2">
              <span className="font-extrabold text-indigo-400 uppercase tracking-wider">
                Franchise 2 (Trading Partner):
              </span>
              <span className="text-gray-400">Purse: ₹{teamB.budget?.toFixed(2)}Cr</span>
            </div>
            <select
              value={teamBId}
              onChange={(e) => handleTeamBChange(parseInt(e.target.value))}
              className="w-full bg-gray-900 border border-gray-700 rounded-xl p-2 text-white font-bold focus:outline-none focus:border-indigo-400"
            >
              {teams
                .filter((t) => t.id !== teamAId)
                .map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name} ({t.players?.length || 0} players)
                  </option>
                ))}
            </select>
          </div>
        </div>

        {/* Players Selection Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1 overflow-y-auto pr-1">
          {/* Team A Roster Selection */}
          <div className="bg-gray-950/60 p-3 rounded-2xl border border-gray-800 flex flex-col">
            <div className="flex items-center justify-between mb-2 pb-1 border-b border-gray-800 text-xs">
              <span className="font-bold text-gray-300">
                Offering from {teamA.name} ({selectedPlayersA.length}/2):
              </span>
              <span className="text-yellow-400 font-mono font-bold">
                {selectedPlayersA.length > 0 &&
                  `Combined Rating: ${selectedPlayersA.reduce((s, p) => s + (p.rating || 75), 0)}`}
              </span>
            </div>
            <div className="space-y-1.5 max-h-[35vh] overflow-y-auto pr-1">
              {(teamA.players || []).map((player) => {
                const isSelected = selectedPlayersA.some((p) => p.id === player.id);
                return (
                  <div
                    key={player.id}
                    onClick={() => togglePlayerA(player)}
                    className={`p-2 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                      isSelected
                        ? "bg-yellow-500/20 border-yellow-400 text-white font-bold"
                        : "bg-gray-900/80 border-gray-800 hover:border-gray-700 text-gray-300"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <img
                        src={player.image || FALLBACK_IMAGE}
                        alt={player.name}
                        className="w-7 h-7 rounded-full object-cover border border-gray-700"
                      />
                      <div>
                        <div className="text-xs font-bold leading-tight">{player.name}</div>
                        <div className="text-[10px] text-gray-400 flex items-center gap-1.5">
                          <span>{player.role}</span>
                          <span>•</span>
                          <span>{player.nationality}</span>
                          {isOverseas(player) && (
                            <span className="text-cyan-400 font-bold">✈️</span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-mono font-black text-amber-300">
                        ⭐ {player.rating || 75}
                      </span>
                      <div className="text-[10px] text-gray-400">
                        ₹{(player.bidPrice || player.basePrice || 1.0).toFixed(2)}Cr
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Team B Roster Selection */}
          <div className="bg-gray-950/60 p-3 rounded-2xl border border-gray-800 flex flex-col">
            <div className="flex items-center justify-between mb-2 pb-1 border-b border-gray-800 text-xs">
              <span className="font-bold text-gray-300">
                Requesting from {teamB.name} ({selectedPlayersB.length}/2):
              </span>
              <span className="text-indigo-400 font-mono font-bold">
                {selectedPlayersB.length > 0 &&
                  `Combined Rating: ${selectedPlayersB.reduce((s, p) => s + (p.rating || 75), 0)}`}
              </span>
            </div>
            <div className="space-y-1.5 max-h-[35vh] overflow-y-auto pr-1">
              {(teamB.players || []).map((player) => {
                const isSelected = selectedPlayersB.some((p) => p.id === player.id);
                return (
                  <div
                    key={player.id}
                    onClick={() => togglePlayerB(player)}
                    className={`p-2 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                      isSelected
                        ? "bg-indigo-600/30 border-indigo-400 text-white font-bold"
                        : "bg-gray-900/80 border-gray-800 hover:border-gray-700 text-gray-300"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <img
                        src={player.image || FALLBACK_IMAGE}
                        alt={player.name}
                        className="w-7 h-7 rounded-full object-cover border border-gray-700"
                      />
                      <div>
                        <div className="text-xs font-bold leading-tight">{player.name}</div>
                        <div className="text-[10px] text-gray-400 flex items-center gap-1.5">
                          <span>{player.role}</span>
                          <span>•</span>
                          <span>{player.nationality}</span>
                          {isOverseas(player) && (
                            <span className="text-cyan-400 font-bold">✈️</span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-mono font-black text-indigo-300">
                        ⭐ {player.rating || 75}
                      </span>
                      <div className="text-[10px] text-gray-400">
                        ₹{(player.bidPrice || player.basePrice || 1.0).toFixed(2)}Cr
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Cash Sweetener / Adjustment */}
        <div className="mt-3 bg-gray-950 p-3 rounded-2xl border border-gray-800 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-lg">💰</span>
            <div>
              <span className="font-bold text-gray-300">Cash Consideration:</span>
              <span className="text-[11px] text-gray-400 ml-1.5">
                (Sweeten the deal by transferring purse funds)
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCashOffer((c) => Math.max(-5, c - 0.5))}
              className="px-2.5 py-1 bg-gray-800 hover:bg-gray-700 rounded-lg text-white font-bold"
            >
              -₹0.5Cr
            </button>
            <span className="font-mono font-black text-sm text-yellow-400 min-w-[70px] text-center">
              {cashOffer > 0
                ? `+₹${cashOffer.toFixed(1)}Cr to ${teamB.shortName}`
                : cashOffer < 0
                ? `+₹${Math.abs(cashOffer).toFixed(1)}Cr to ${teamA.shortName}`
                : "₹0.0Cr (Even)"}
            </span>
            <button
              onClick={() => setCashOffer((c) => Math.min(10, c + 0.5))}
              className="px-2.5 py-1 bg-gray-800 hover:bg-gray-700 rounded-lg text-white font-bold"
            >
              +₹0.5Cr
            </button>
          </div>
        </div>

        {/* AI Trade Evaluation Feedback Box */}
        <div
          className={`mt-3 p-3.5 rounded-2xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs ${
            evaluation.acceptable
              ? "bg-green-950/40 border-green-500/60 text-green-300"
              : evaluation.status === "SELECT_PLAYERS"
              ? "bg-gray-950 border-gray-800 text-gray-400"
              : "bg-red-950/40 border-red-500/60 text-red-300"
          }`}
        >
          <div className="flex items-center gap-2.5">
            <span className="text-2xl">
              {evaluation.acceptable ? "✅" : evaluation.status === "SELECT_PLAYERS" ? "⚖️" : "❌"}
            </span>
            <div>
              <div className="font-extrabold text-sm text-white">
                {evaluation.acceptable ? "Proposal Approved" : "Evaluation Pending / Rejected"}
              </div>
              <div className="text-[11px] leading-tight">{evaluation.feedback}</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {evaluation.score > 0 && (
              <div className="text-right">
                <span className="text-[10px] text-gray-400 uppercase font-bold block">
                  Fairness Score
                </span>
                <span
                  className={`font-mono font-black text-base ${
                    evaluation.acceptable ? "text-green-400" : "text-amber-400"
                  }`}
                >
                  {evaluation.score}%
                </span>
              </div>
            )}

            <button
              onClick={handleConfirmTrade}
              disabled={!evaluation.acceptable}
              className={`px-5 py-2.5 rounded-xl font-black text-xs transition-all shadow-lg ${
                evaluation.acceptable
                  ? "bg-green-500 hover:bg-green-400 text-black active:scale-95 shadow-green-500/25 cursor-pointer"
                  : "bg-gray-800 text-gray-500 cursor-not-allowed border border-gray-700"
              }`}
            >
              🤝 Execute Official Trade
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
