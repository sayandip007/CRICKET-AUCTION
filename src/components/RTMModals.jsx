import React, { useState } from "react";
import { FALLBACK_IMAGE } from "../utils/constants";

/**
 * Modal shown to the previous team (User) asking if they want to exercise their RTM card
 */
export const RTMInquiryModal = ({
  player,
  winningTeam,
  winningBid,
  userTeam,
  onAccept,
  onDecline,
}) => {
  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-md flex justify-center items-center z-50 p-4 animate-fade-in">
      <div className="bg-gradient-to-b from-gray-900 via-gray-900 to-black p-6 rounded-3xl border-2 border-yellow-500 shadow-2xl max-w-lg w-full text-white text-center relative overflow-hidden">
        {/* Glow accent */}
        <div className="absolute -top-12 -left-12 w-36 h-36 bg-yellow-500/20 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-12 -right-12 w-36 h-36 bg-red-500/20 rounded-full blur-2xl pointer-events-none" />

        <div className="inline-flex items-center gap-2 px-3 py-1 bg-yellow-500/20 border border-yellow-400 rounded-full text-yellow-400 font-bold text-xs uppercase tracking-widest mb-3">
          ⚡ Right to Match (RTM) Opportunity
        </div>

        <h2 className="text-2xl font-black text-yellow-400 mb-2">
          Exercise RTM for {player.name}?
        </h2>

        <p className="text-sm text-gray-300 mb-4">
          <span className="font-semibold text-white">{player.name}</span> played for{" "}
          <span className="text-yellow-300 font-bold">{userTeam.name}</span> last season and is about to be sold to{" "}
          <span className="text-blue-400 font-bold">{winningTeam.name}</span> for{" "}
          <span className="text-green-400 font-bold text-base">₹{winningBid.toFixed(2)}Cr</span>.
        </p>

        {/* Player mini card */}
        <div className="bg-gray-800/80 rounded-2xl p-4 border border-gray-700 flex items-center gap-4 mb-5 text-left">
          <img
            src={player.image || FALLBACK_IMAGE}
            alt={player.name}
            className="w-16 h-16 rounded-full border-2 border-yellow-400 object-cover"
          />
          <div className="flex-1">
            <h4 className="font-bold text-lg text-white">{player.name}</h4>
            <div className="flex items-center gap-2 text-xs text-gray-300">
              <span>{player.role}</span>
              <span>•</span>
              <span className={player.isCapped ? "text-green-400" : "text-blue-400"}>
                {player.isCapped ? "Capped" : "Uncapped"}
              </span>
              <span>•</span>
              <span className="text-yellow-400">Rating: {player.rating || 85}</span>
            </div>
            <p className="text-xs text-gray-400 mt-1">
              Winning Bidder: <span className="text-white font-medium">{winningTeam.name}</span>
            </p>
          </div>
        </div>

        <div className="bg-yellow-950/40 border border-yellow-600/40 rounded-xl p-3 mb-5 text-xs text-yellow-200">
          <p className="font-semibold">IPL 2025 RTM Rule:</p>
          <p className="text-gray-300 mt-0.5">
            If you exercise RTM, {winningTeam.name} will have one final chance to raise their bid. You can then match their final bid to retain {player.name}.
          </p>
          <p className="text-yellow-400 font-bold mt-1">
            RTM Cards Remaining: {userTeam.rtmCount}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={onDecline}
            className="px-4 py-3 bg-gray-800 hover:bg-gray-700 text-gray-200 rounded-xl font-bold transition-all border border-gray-700"
          >
            Decline (Let Player Go)
          </button>
          <button
            onClick={onAccept}
            className="px-4 py-3 bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-400 hover:to-amber-400 text-black rounded-xl font-extrabold shadow-lg shadow-yellow-500/30 transition-all transform active:scale-95"
          >
            ⚡ Use RTM Card
          </button>
        </div>
      </div>
    </div>
  );
};

/**
 * Modal shown to winning bidder (User) when rival team exercises RTM,
 * allowing user to make a final raise to test their opponent's purse
 */
export const RTMFinalRaiseModal = ({
  player,
  rtmTeam,
  currentBid,
  maxAllowedBid,
  onConfirmFinalBid,
}) => {
  const [selectedBid, setSelectedBid] = useState(currentBid);
  const [customBidInput, setCustomBidInput] = useState("");

  const handleQuickAdd = (increment) => {
    const next = parseFloat((currentBid + increment).toFixed(2));
    if (next <= maxAllowedBid) {
      setSelectedBid(next);
      setCustomBidInput("");
    }
  };

  const handleCustomChange = (e) => {
    const val = e.target.value;
    setCustomBidInput(val);
    const num = parseFloat(val);
    if (!isNaN(num) && num >= currentBid && num <= maxAllowedBid) {
      setSelectedBid(parseFloat(num.toFixed(2)));
    }
  };

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-md flex justify-center items-center z-50 p-4 animate-fade-in">
      <div className="bg-gradient-to-b from-gray-900 via-gray-900 to-black p-6 rounded-3xl border-2 border-red-500 shadow-2xl max-w-lg w-full text-white text-center relative overflow-hidden">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-red-500/20 border border-red-400 rounded-full text-red-400 font-bold text-xs uppercase tracking-widest mb-3">
          ⚡ RTM Invoked by {rtmTeam.name}
        </div>

        <h2 className="text-2xl font-black text-white mb-2">
          Submit Your One-Time Final Bid
        </h2>

        <p className="text-sm text-gray-300 mb-4">
          <span className="text-yellow-400 font-bold">{rtmTeam.name}</span> has exercised their Right to Match for{" "}
          <span className="font-semibold text-white">{player.name}</span>!
          As the winning bidder, you can increase your bid one last time. If they match your final bid, they get him; if they pass, you sign him!
        </p>

        {/* Current bid vs Final bid display */}
        <div className="grid grid-cols-2 gap-3 bg-gray-800/80 p-3 rounded-2xl border border-gray-700 mb-4">
          <div>
            <p className="text-xs text-gray-400">Current Winning Bid</p>
            <p className="text-xl font-bold text-gray-200">₹{currentBid.toFixed(2)}Cr</p>
          </div>
          <div>
            <p className="text-xs text-yellow-400 font-semibold">Your Final Challenge Bid</p>
            <p className="text-2xl font-black text-green-400">₹{selectedBid.toFixed(2)}Cr</p>
          </div>
        </div>

        {/* Quick Raise Buttons */}
        <p className="text-xs text-gray-400 mb-2 font-medium">Quick Challenge Raises:</p>
        <div className="flex flex-wrap gap-2 justify-center mb-4">
          <button
            type="button"
            onClick={() => setSelectedBid(currentBid)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${
              selectedBid === currentBid
                ? "bg-blue-600 border-blue-400 text-white"
                : "bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700"
            }`}
          >
            Hold at ₹{currentBid.toFixed(2)}Cr
          </button>
          {[0.5, 1.0, 2.0, 3.0].map((inc) => {
            const optVal = parseFloat((currentBid + inc).toFixed(2));
            const disabled = optVal > maxAllowedBid;
            return (
              <button
                key={inc}
                type="button"
                disabled={disabled}
                onClick={() => handleQuickAdd(inc)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                  disabled
                    ? "bg-gray-800/40 border-gray-800 text-gray-600 cursor-not-allowed"
                    : selectedBid === optVal
                    ? "bg-green-600 border-green-400 text-white"
                    : "bg-gray-800 border-gray-700 text-gray-200 hover:bg-gray-700"
                }`}
              >
                +₹{inc.toFixed(2)}Cr (₹{optVal.toFixed(2)}Cr)
              </button>
            );
          })}
        </div>

        {/* Custom Input */}
        <div className="mb-4">
          <label className="block text-xs text-gray-400 mb-1">
            Or type exact final bid (Max allowed: ₹{maxAllowedBid.toFixed(2)}Cr):
          </label>
          <input
            type="number"
            step="0.1"
            min={currentBid}
            max={maxAllowedBid}
            value={customBidInput}
            onChange={handleCustomChange}
            placeholder={`e.g. ${(currentBid + 1).toFixed(2)}`}
            className="w-full max-w-xs px-3 py-1.5 bg-gray-800 border border-gray-700 rounded-lg text-center text-white font-bold focus:outline-none focus:border-yellow-400"
          />
        </div>

        <button
          onClick={() => onConfirmFinalBid(selectedBid)}
          className="w-full py-3 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 text-white font-extrabold rounded-xl shadow-lg shadow-red-600/30 transition-all transform active:scale-95"
        >
          Confirm Final Bid: ₹{selectedBid.toFixed(2)}Cr 🔨
        </button>
      </div>
    </div>
  );
};

/**
 * Modal shown to RTM holding team (User) with the winning team's final raised bid,
 * asking if user wants to match that final amount to seal the player.
 */
export const RTMMatchDecisionModal = ({
  player,
  winningTeam,
  finalBid,
  userTeam,
  onMatch,
  onPass,
}) => {
  const canAfford = userTeam.budget >= finalBid;

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-md flex justify-center items-center z-50 p-4 animate-fade-in">
      <div className="bg-gradient-to-b from-gray-900 via-gray-900 to-black p-6 rounded-3xl border-2 border-yellow-500 shadow-2xl max-w-lg w-full text-white text-center relative overflow-hidden">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-yellow-500/20 border border-yellow-400 rounded-full text-yellow-400 font-bold text-xs uppercase tracking-widest mb-3">
          ⚡ Final RTM Match Decision
        </div>

        <h2 className="text-2xl font-black text-white mb-2">
          Match ₹{finalBid.toFixed(2)}Cr for {player.name}?
        </h2>

        <p className="text-sm text-gray-300 mb-4">
          <span className="font-semibold text-blue-400">{winningTeam.name}</span> has set their final challenge bid at{" "}
          <span className="text-green-400 font-extrabold text-base">₹{finalBid.toFixed(2)}Cr</span>.
        </p>

        <div className="bg-gray-800/80 rounded-2xl p-4 border border-gray-700 mb-5 text-left flex items-center gap-4">
          <img
            src={player.image || FALLBACK_IMAGE}
            alt={player.name}
            className="w-16 h-16 rounded-full border-2 border-yellow-400 object-cover"
          />
          <div>
            <h4 className="font-bold text-white text-lg">{player.name}</h4>
            <p className="text-xs text-gray-300">
              Role: <span className="text-white">{player.role}</span>
            </p>
            <p className="text-xs text-gray-400 mt-1">
              Your Purse Remaining: <span className="text-green-400 font-bold">₹{userTeam.budget.toFixed(2)}Cr</span>
            </p>
            <p className="text-xs text-gray-400">
              Purse After Signing:{" "}
              <span className={`font-bold ${canAfford ? "text-yellow-400" : "text-red-400"}`}>
                ₹{(userTeam.budget - finalBid).toFixed(2)}Cr
              </span>
            </p>
          </div>
        </div>

        {!canAfford && (
          <div className="p-3 bg-red-950/50 border border-red-600/50 rounded-xl text-red-200 text-xs mb-4">
            ⚠️ You do not have enough purse to match ₹{finalBid.toFixed(2)}Cr.
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={onPass}
            className="px-4 py-3 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-xl font-bold transition-all border border-gray-700"
          >
            Decline (Let {winningTeam.name} Take Him)
          </button>
          <button
            onClick={onMatch}
            disabled={!canAfford}
            className={`px-4 py-3 rounded-xl font-extrabold shadow-lg transition-all ${
              canAfford
                ? "bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-400 hover:to-amber-400 text-black shadow-yellow-500/30 active:scale-95"
                : "bg-gray-700 text-gray-500 cursor-not-allowed"
            }`}
          >
            ⚡ Match ₹{finalBid.toFixed(2)}Cr (Use 1 RTM)
          </button>
        </div>
      </div>
    </div>
  );
};
