import React, { useState } from "react";
import { FALLBACK_IMAGE, roleImages } from "../utils/constants";
import { MIN_SQUAD_SIZE } from "../utils/auctionRules";

export const AcceleratedRoundModal = ({
  unsoldPlayers,
  teams,
  userTeamId,
  onStartAccelerated,
  onSkipToEnd,
}) => {
  // Discounted base price formula: 50% of base price, min 0.30 Cr
  const getDiscountedPrice = (origPrice) => {
    return Math.max(0.30, parseFloat((origPrice * 0.5).toFixed(2)));
  };

  // Initially select recommended players (rating >= 75 or basePrice >= 1.0)
  const [selectedIds, setSelectedIds] = useState(() => {
    const recommended = unsoldPlayers.filter(
      (p) => (p.rating && p.rating >= 75) || p.basePrice >= 1.0
    );
    if (recommended.length > 0) return recommended.map((p) => p.id);
    return unsoldPlayers.slice(0, 10).map((p) => p.id);
  });

  const toggleSelect = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedIds.length === unsoldPlayers.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(unsoldPlayers.map((p) => p.id));
    }
  };

  const handleStart = () => {
    if (selectedIds.length === 0) {
      onSkipToEnd();
      return;
    }
    const chosen = unsoldPlayers
      .filter((p) => selectedIds.includes(p.id))
      .map((p) => ({
        ...p,
        basePrice: getDiscountedPrice(p.basePrice),
        originalBasePrice: p.basePrice,
        isAccelerated: true,
      }));
    onStartAccelerated(chosen);
  };

  // Teams needing players to reach 18
  const needyTeams = teams.filter((t) => t.players.length < MIN_SQUAD_SIZE);

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-md flex justify-center items-center z-50 p-4 animate-fade-in">
      <div className="bg-gray-900 border-2 border-amber-500 rounded-3xl shadow-2xl max-w-4xl w-full max-h-[88vh] flex flex-col text-white overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-gray-800 bg-gray-950 flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 bg-amber-500/20 border border-amber-400 rounded-full text-amber-400 font-black text-xs uppercase tracking-widest mb-1">
              ⚡ Accelerated Auction Round
            </div>
            <h2 className="text-2xl font-black text-white">
              Unsold Player Recall & Rapid Bidding
            </h2>
            <p className="text-xs text-gray-400">
              Shortlist unsold players to bring back to the podium at a 50% discount with a fast 5-second timer!
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleSelectAll}
              className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-xs font-bold text-gray-200 rounded-lg border border-gray-700"
            >
              {selectedIds.length === unsoldPlayers.length ? "Deselect All" : "Select All"}
            </button>
            <button
              onClick={onSkipToEnd}
              className="px-3 py-1.5 bg-red-950/60 hover:bg-red-900 text-red-300 text-xs font-bold rounded-lg border border-red-800"
            >
              Skip Round & Finish
            </button>
          </div>
        </div>

        {/* Squad Shortage Alert for Needy Teams */}
        {needyTeams.length > 0 && (
          <div className="px-5 py-2.5 bg-amber-950/40 border-b border-amber-800/40 text-amber-200 text-xs flex flex-wrap items-center gap-2">
            <span className="font-bold">⚠️ Teams Needing Players (Min 18 Required):</span>
            {needyTeams.map((t) => (
              <span
                key={t.id}
                className={`px-2 py-0.5 rounded text-[11px] font-semibold border ${
                  t.id === userTeamId
                    ? "bg-yellow-500 text-black border-yellow-400 font-bold"
                    : "bg-gray-800 text-gray-300 border-gray-700"
                }`}
              >
                {t.name}: {t.players.length}/{MIN_SQUAD_SIZE} (Need {MIN_SQUAD_SIZE - t.players.length})
              </span>
            ))}
          </div>
        )}

        {/* Unsold Players Grid */}
        <div className="flex-1 p-5 overflow-y-auto bg-gray-900/40">
          <p className="text-xs text-gray-400 mb-3 font-medium">
            Available Unsold Players ({unsoldPlayers.length}) — Click to shortlist for accelerated bidding:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {unsoldPlayers.map((player) => {
              const isSelected = selectedIds.includes(player.id);
              const discPrice = getDiscountedPrice(player.basePrice);
              const isOverseas = player.nationality && player.nationality.toLowerCase() !== "indian";

              return (
                <div
                  key={player.id}
                  onClick={() => toggleSelect(player.id)}
                  className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center gap-3 select-none ${
                    isSelected
                      ? "bg-amber-950/40 border-amber-400 ring-2 ring-amber-500/50"
                      : "bg-gray-800/50 border-gray-700 hover:border-gray-600 hover:bg-gray-800"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => {}}
                    className="w-4 h-4 text-amber-500 rounded border-gray-700 focus:ring-amber-500 shrink-0 pointer-events-none"
                  />

                  <img
                    src={player.image || FALLBACK_IMAGE}
                    alt={player.name}
                    className="w-12 h-12 rounded-full border-2 border-gray-600 object-cover shrink-0"
                  />

                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-sm text-white truncate">
                      {player.name}
                    </h4>
                    <div className="flex items-center gap-1.5 text-xs text-gray-400 mt-0.5">
                      <img
                        src={roleImages[player.role]}
                        alt={player.role}
                        className="w-3.5 h-3.5"
                      />
                      <span className="truncate">{player.role}</span>
                      {isOverseas && <span className="text-blue-400">✈</span>}
                    </div>

                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs line-through text-gray-500">
                        ₹{player.basePrice.toFixed(2)}Cr
                      </span>
                      <span className="text-xs font-black text-green-400">
                        ₹{discPrice.toFixed(2)}Cr (50% Off)
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-800 bg-gray-950 flex flex-wrap items-center justify-between gap-3">
          <p className="text-xs text-gray-300">
            Selected: <span className="text-amber-400 font-bold">{selectedIds.length} players</span> for accelerated bidding
          </p>
          <button
            onClick={handleStart}
            disabled={selectedIds.length === 0}
            className={`px-6 py-2.5 rounded-xl font-extrabold text-sm transition-all shadow-lg ${
              selectedIds.length > 0
                ? "bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-black shadow-amber-500/30 active:scale-95"
                : "bg-gray-800 text-gray-500 cursor-not-allowed"
            }`}
          >
            Start Accelerated Round ({selectedIds.length} Players) ⚡
          </button>
        </div>
      </div>
    </div>
  );
};
