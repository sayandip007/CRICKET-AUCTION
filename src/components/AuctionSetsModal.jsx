import React, { useState } from "react";
import { FALLBACK_IMAGE, roleImages } from "../utils/constants";

export const AuctionSetsModal = ({
  sets,
  currentSetIndex,
  currentPlayerId,
  auctionLog,
  onClose,
}) => {
  const [selectedSetIdx, setSelectedSetIdx] = useState(currentSetIndex);

  const selectedSet = sets[selectedSetIdx] || sets[0];

  const getPlayerStatus = (playerId) => {
    if (playerId === currentPlayerId) return { label: "Under Hammer", color: "text-amber-400 bg-amber-950/70 border-amber-600" };
    const logEntry = auctionLog.find((p) => p.id === playerId);
    if (!logEntry) return { label: "Upcoming", color: "text-gray-400 bg-gray-800 border-gray-700" };
    if (logEntry.soldTo === "Unsold") return { label: "Unsold", color: "text-red-400 bg-red-950/60 border-red-700" };
    return { label: `Sold to ${logEntry.soldTo} (₹${logEntry.soldPrice.toFixed(2)}Cr)`, color: "text-green-400 bg-green-950/60 border-green-700" };
  };

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-md flex justify-center items-center z-50 p-4 animate-fade-in">
      <div className="bg-gray-900 border-2 border-indigo-500 rounded-3xl shadow-2xl w-full max-w-5xl h-[85vh] flex flex-col text-white overflow-hidden">
        {/* Modal Header */}
        <div className="p-5 border-b border-gray-800 flex justify-between items-center bg-gray-950">
          <div>
            <h2 className="text-2xl font-black text-yellow-400 flex items-center gap-2">
              📋 Auction Sets & Player Catalog
            </h2>
            <p className="text-xs text-gray-400 mt-1">
              Official IPL-style categorized bidding pool sets
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-gray-800 hover:bg-red-600 flex items-center justify-center text-white font-bold transition-all"
          >
            ✕
          </button>
        </div>

        {/* Modal Body: Left sidebar (Sets) + Right content (Players in Set) */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          {/* Sets Tabs Sidebar */}
          <div className="w-full md:w-72 bg-gray-950/70 border-r border-gray-800 p-3 overflow-y-auto space-y-2">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider px-2 py-1">
              Auction Batches ({sets.length})
            </p>
            {sets.map((s, idx) => {
              const isActive = idx === selectedSetIdx;
              const isCurrent = idx === currentSetIndex;
              return (
                <button
                  key={s.id || idx}
                  onClick={() => setSelectedSetIdx(idx)}
                  className={`w-full text-left p-3 rounded-xl transition-all border flex items-center justify-between text-sm ${
                    isActive
                      ? "bg-indigo-600 border-indigo-400 text-white font-bold shadow-md"
                      : "bg-gray-900/60 border-gray-800 text-gray-300 hover:bg-gray-800 hover:border-gray-700"
                  }`}
                >
                  <div className="truncate pr-2">
                    <span className="text-xs font-mono px-1.5 py-0.5 rounded bg-black/40 mr-1.5 text-yellow-300">
                      {s.code}
                    </span>
                    <span className="truncate">{s.name}</span>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    {isCurrent && (
                      <span className="w-2 h-2 rounded-full bg-green-400 animate-ping" title="Current Set" />
                    )}
                    <span className="text-xs text-gray-400 font-mono">
                      ({s.players.length})
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Set Detail View */}
          <div className="flex-1 p-5 overflow-y-auto bg-gray-900/50">
            {selectedSet && (
              <div>
                <div className="flex flex-wrap items-center justify-between gap-3 mb-4 pb-3 border-b border-gray-800">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 bg-yellow-400 text-black text-xs font-black rounded uppercase">
                        {selectedSet.code}
                      </span>
                      <h3 className="text-xl font-bold text-white">
                        {selectedSet.name}
                      </h3>
                    </div>
                    <p className="text-xs text-gray-400 mt-1">
                      {selectedSet.description} • {selectedSet.players.length} Players
                    </p>
                  </div>
                  {selectedSetIdx === currentSetIndex && (
                    <span className="px-3 py-1 bg-green-500/20 border border-green-500 rounded-full text-green-400 text-xs font-bold">
                      ● Active Set Now
                    </span>
                  )}
                </div>

                {/* Players Table / Grid in Set */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {selectedSet.players.map((player) => {
                    const status = getPlayerStatus(player.id);
                    const isOverseas = player.nationality && player.nationality.toLowerCase() !== "indian";
                    return (
                      <div
                        key={player.id}
                        className={`p-3 rounded-2xl border transition-all flex items-center gap-3 ${
                          player.id === currentPlayerId
                            ? "bg-amber-950/30 border-amber-500 ring-2 ring-amber-500/50"
                            : "bg-gray-800/60 border-gray-700/80 hover:border-gray-600"
                        }`}
                      >
                        <img
                          src={player.image || FALLBACK_IMAGE}
                          alt={player.name}
                          className="w-14 h-14 rounded-full border-2 border-gray-600 object-cover shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-1">
                            <h4 className="font-bold text-sm text-white truncate">
                              {player.name}
                            </h4>
                            <span className="text-xs font-extrabold text-yellow-400 shrink-0">
                              ₹{player.basePrice.toFixed(2)}Cr
                            </span>
                          </div>

                          <div className="flex items-center gap-2 text-xs text-gray-400 mt-0.5">
                            <img
                              src={roleImages[player.role]}
                              alt={player.role}
                              className="w-3.5 h-3.5 shrink-0"
                            />
                            <span className="truncate">{player.role}</span>
                            {isOverseas && (
                              <span className="text-blue-400 font-medium">✈ Overseas</span>
                            )}
                            <span className="text-amber-300 font-semibold ml-auto">
                              ★ {player.rating || 85}
                            </span>
                          </div>

                          {player.previousTeamName && (
                            <p className="text-[11px] text-gray-400 mt-0.5 truncate">
                              Prev: <span className="text-yellow-300 font-medium">{player.previousTeamName}</span>
                            </p>
                          )}

                          <div className="mt-1.5">
                            <span
                              className={`inline-block px-2 py-0.5 rounded-full text-[11px] font-semibold border ${status.color}`}
                            >
                              {status.label}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
