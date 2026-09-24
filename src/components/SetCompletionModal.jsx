import React, { useEffect } from "react";
import { FALLBACK_IMAGE } from "../utils/constants";
import { audioEngine } from "../utils/audioEffects";

export const SetCompletionModal = ({
  completedSet,
  nextSet,
  auctionLog,
  onProceed,
}) => {
  useEffect(() => {
    audioEngine.playMilestoneChime();
  }, []);

  // Compute summary metrics for completed set
  const completedPlayerIds = new Set(completedSet.players.map((p) => p.id));
  const setLogs = auctionLog.filter((log) => completedPlayerIds.has(log.id));

  const soldLogs = setLogs.filter((log) => log.soldTo && log.soldTo !== "Unsold");
  const unsoldLogs = setLogs.filter((log) => log.soldTo === "Unsold");
  const totalSpentInSet = soldLogs.reduce((acc, log) => acc + log.soldPrice, 0);

  // Highest buy in set
  const topBuy = [...soldLogs].sort((a, b) => b.soldPrice - a.soldPrice)[0];

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-md flex justify-center items-center z-50 p-4 animate-fade-in">
      <div className="bg-gradient-to-b from-gray-900 via-gray-900 to-black p-6 rounded-3xl border-2 border-indigo-500 shadow-2xl max-w-lg w-full text-white text-center relative overflow-hidden">
        {/* Glow */}
        <div className="absolute -top-10 -right-10 w-36 h-36 bg-indigo-500/20 rounded-full blur-2xl pointer-events-none" />

        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-500/20 border border-indigo-400 rounded-full text-indigo-300 font-bold text-xs uppercase tracking-wider mb-3">
          🏆 Set Completed
        </div>

        <h2 className="text-2xl font-black text-yellow-400 mb-1">
          {completedSet.name}
        </h2>
        <p className="text-xs text-gray-400 mb-4">
          All {completedSet.players.length} players in this batch have gone under the hammer!
        </p>

        {/* Set Stats Summary */}
        <div className="grid grid-cols-3 gap-2 bg-gray-800/80 p-3 rounded-2xl border border-gray-700 mb-4 text-center">
          <div>
            <p className="text-[11px] text-gray-400 font-medium">Sold</p>
            <p className="text-lg font-black text-green-400">{soldLogs.length}</p>
          </div>
          <div>
            <p className="text-[11px] text-gray-400 font-medium">Unsold</p>
            <p className="text-lg font-black text-red-400">{unsoldLogs.length}</p>
          </div>
          <div>
            <p className="text-[11px] text-gray-400 font-medium">Purse Spent</p>
            <p className="text-lg font-black text-yellow-400">₹{totalSpentInSet.toFixed(2)}Cr</p>
          </div>
        </div>

        {/* Top Buy Highlight */}
        {topBuy && (
          <div className="bg-gradient-to-r from-yellow-950/40 via-amber-950/20 to-gray-800 border border-yellow-600/40 rounded-2xl p-3 mb-4 flex items-center gap-3 text-left">
            <img
              src={topBuy.image || FALLBACK_IMAGE}
              alt={topBuy.name}
              className="w-12 h-12 rounded-full border-2 border-yellow-400 object-cover"
            />
            <div className="flex-1 min-w-0">
              <span className="text-[10px] uppercase font-bold text-yellow-400 tracking-wider">
                Top Buy in Set
              </span>
              <h4 className="font-bold text-white truncate">{topBuy.name}</h4>
              <p className="text-xs text-gray-300">
                Bought by <span className="font-semibold text-yellow-300">{topBuy.soldTo}</span> for{" "}
                <span className="font-bold text-green-400">₹{topBuy.soldPrice.toFixed(2)}Cr</span>
              </p>
            </div>
          </div>
        )}

        {/* Next Set Preview */}
        {nextSet ? (
          <div className="bg-gray-800/60 border border-gray-700 rounded-2xl p-3 mb-5 text-left">
            <p className="text-xs text-indigo-400 font-bold uppercase tracking-wider mb-1">
              Coming Up Next:
            </p>
            <h4 className="text-base font-bold text-white">
              <span className="text-yellow-400 font-mono mr-1.5">[{nextSet.code}]</span>
              {nextSet.name}
            </h4>
            <p className="text-xs text-gray-400 mt-0.5">
              {nextSet.description} • {nextSet.players.length} Players
            </p>
          </div>
        ) : (
          <div className="bg-yellow-950/40 border border-yellow-600/40 rounded-2xl p-3 mb-5 text-yellow-200 text-xs">
            ⚡ All regular auction sets are now complete! Proceeding to the Accelerated Unsold Recall Round.
          </div>
        )}

        <button
          onClick={onProceed}
          className="w-full py-3 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white font-extrabold rounded-xl shadow-lg shadow-indigo-600/30 transition-all transform active:scale-95 text-sm"
        >
          {nextSet ? `Start ${nextSet.name} →` : "Proceed to Accelerated Round →"}
        </button>
      </div>
    </div>
  );
};
