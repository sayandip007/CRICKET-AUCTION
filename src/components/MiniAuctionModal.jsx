import React, { useState, useMemo, useEffect, useCallback, useRef } from "react";
import { getIncrement, canTeamBid } from "../utils/auctionRules";
import { FALLBACK_IMAGE } from "../utils/constants";
import { audioEngine } from "../utils/audioEffects";

// High-potential rookie draft talents entering the mini-auction
const ROOKIE_DRAFT_TALENTS = [
  {
    id: 9001,
    name: "Arjun Verma (U-19 Prodigy)",
    role: "All-Rounder",
    age: 18,
    nationality: "Indian",
    basePrice: 0.5,
    rating: 85,
    isCapped: false,
    matches: 12,
    runs: 380,
    battingAverage: 42.2,
    battingStrikeRate: 158.4,
    wickets: 15,
    bowlingEconomy: 7.2,
    image: "/images/roles/allrounder.png",
  },
  {
    id: 9002,
    name: "Kwena Maphaka (Express Pacer)",
    role: "Bowler",
    age: 19,
    nationality: "South African",
    basePrice: 0.75,
    rating: 86,
    isCapped: true,
    matches: 16,
    runs: 15,
    wickets: 24,
    bowlingEconomy: 7.8,
    image: "/images/roles/bowler.png",
  },
  {
    id: 9003,
    name: "Sameer Rizvi (Finisher Sensation)",
    role: "Batsman",
    age: 21,
    nationality: "Indian",
    basePrice: 0.4,
    rating: 83,
    isCapped: false,
    matches: 14,
    runs: 340,
    battingAverage: 37.8,
    battingStrikeRate: 172.5,
    wickets: 0,
    image: "/images/roles/batsman.png",
  },
  {
    id: 9004,
    name: "Cooper Connolly (Clutch Striker)",
    role: "All-Rounder",
    age: 21,
    nationality: "Australian",
    basePrice: 0.75,
    rating: 84,
    isCapped: true,
    matches: 18,
    runs: 410,
    battingAverage: 34.2,
    battingStrikeRate: 149.0,
    wickets: 12,
    bowlingEconomy: 7.5,
    image: "/images/roles/allrounder.png",
  },
  {
    id: 9005,
    name: "Allah Ghazanfar (Mystery Spinner)",
    role: "Bowler",
    age: 18,
    nationality: "Afghan",
    basePrice: 0.5,
    rating: 87,
    isCapped: true,
    matches: 20,
    runs: 30,
    wickets: 29,
    bowlingEconomy: 6.6,
    image: "/images/roles/bowler.png",
  },
  {
    id: 9006,
    name: "Musheer Khan (Top-Order Anchor)",
    role: "Batsman",
    age: 19,
    nationality: "Indian",
    basePrice: 0.3,
    rating: 82,
    isCapped: false,
    matches: 11,
    runs: 395,
    battingAverage: 49.3,
    battingStrikeRate: 136.2,
    wickets: 6,
    image: "/images/roles/batsman.png",
  },
];

export default function MiniAuctionModal({
  isOpen,
  onClose,
  teams,
  userTeamId,
  currentSeason = 1,
  onCompleteSeasonAdvance,
}) {
  const [step, setStep] = useState("RETENTION"); // 'RETENTION' | 'MINI_AUCTION' | 'SUMMARY'
  const [releasedPlayerIds, setReleasedPlayerIds] = useState(new Set());
  const [miniPool, setMiniPool] = useState([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [currentBid, setCurrentBid] = useState(0.5);
  const [currentBidderId, setCurrentBidderId] = useState(null);
  const [timer, setTimer] = useState(7);
  const [isBiddingActive, setIsBiddingActive] = useState(false);
  const [auctionLog, setAuctionLog] = useState([]);
  const [localTeams, setLocalTeams] = useState(teams);

  const userTeam = useMemo(
    () => localTeams.find((t) => t.id === userTeamId) || localTeams[0],
    [localTeams, userTeamId]
  );

  // Initialize local teams with +15 Cr annual purse increase
  useEffect(() => {
    if (isOpen) {
      setLocalTeams(
        teams.map((t) => ({
          ...t,
          budget: parseFloat((t.budget + 15.0).toFixed(2)), // Annual purse boost
        }))
      );
      setReleasedPlayerIds(new Set());
      setStep("RETENTION");
      setCurrentIdx(0);
      setAuctionLog([]);
    }
  }, [isOpen, teams]);

  // Toggle player release in Year-End retention step
  const toggleReleasePlayer = (player) => {
    const next = new Set(releasedPlayerIds);
    if (next.has(player.id)) {
      next.delete(player.id);
    } else {
      next.add(player.id);
    }
    setReleasedPlayerIds(next);
  };

  // Confirm releases and start Mini-Auction
  const handleProceedToMiniAuction = () => {
    // Collect released players from user team
    const userReleased = (userTeam.players || []).filter((p) => releasedPlayerIds.has(p.id));
    const userRetained = (userTeam.players || []).filter((p) => !releasedPlayerIds.has(p.id));

    // Calculate recovered funds
    const recoveredPurse = userReleased.reduce(
      (sum, p) => sum + (p.bidPrice || p.basePrice || 1.0),
      0
    );

    // AI teams also strategically release 2–3 surplus or lower-rated players
    const aiReleasedPlayers = [];
    const updatedTeams = localTeams.map((team) => {
      if (team.id === userTeam.id) {
        return {
          ...team,
          players: userRetained,
          budget: parseFloat((team.budget + recoveredPurse).toFixed(2)),
        };
      } else {
        // AI releases lowest rated 2 players if squad > 16
        const sorted = [...(team.players || [])].sort((a, b) => (a.rating || 75) - (b.rating || 75));
        const toRelease = sorted.slice(0, 2);
        const toKeep = sorted.slice(2);
        const aiRecovered = toRelease.reduce((sum, p) => sum + (p.bidPrice || p.basePrice || 1.0), 0);
        aiReleasedPlayers.push(...toRelease);
        return {
          ...team,
          players: toKeep,
          budget: parseFloat((team.budget + aiRecovered).toFixed(2)),
        };
      }
    });

    setLocalTeams(updatedTeams);

    // Assemble mini-auction pool: User released + AI released + Rookie Draft talents
    const combinedPool = [...userReleased, ...aiReleasedPlayers, ...ROOKIE_DRAFT_TALENTS];
    // Shuffle pool
    const shuffled = combinedPool.sort(() => Math.random() - 0.5);
    setMiniPool(shuffled);
    setCurrentIdx(0);
    setCurrentBid(shuffled[0]?.basePrice || 0.5);
    setCurrentBidderId(null);
    setTimer(7);
    setIsBiddingActive(true);
    setStep("MINI_AUCTION");
    audioEngine.speakAuctioneer(`Welcome to the IPL Season ${currentSeason + 1} Mini Auction!`);
  };

  const currentPlayer = miniPool[currentIdx];

  // Finalize sale of current mini-auction player
  const finalizeMiniSale = useCallback(
    (winningTeamId, finalPrice) => {
      if (!currentPlayer) return;

      const winningTeam = localTeams.find((t) => t.id === winningTeamId);
      const isUnsold = !winningTeam;

      if (isUnsold) {
        audioEngine.playGavelStrike();
        audioEngine.speakAuctioneer(`${currentPlayer.name} is Unsold.`);
        setAuctionLog((prev) => [
          ...prev,
          { player: currentPlayer, soldTo: "Unsold", price: 0 },
        ]);
      } else {
        audioEngine.playGavelStrike();
        audioEngine.playApplause();
        audioEngine.speakAuctioneer(`SOLD to ${winningTeam.name} for ${finalPrice.toFixed(2)} Crores!`);

        setLocalTeams((prevTeams) =>
          prevTeams.map((t) => {
            if (t.id === winningTeamId) {
              return {
                ...t,
                budget: parseFloat((t.budget - finalPrice).toFixed(2)),
                players: [...t.players, { ...currentPlayer, bidPrice: finalPrice }],
              };
            }
            return t;
          })
        );

        setAuctionLog((prev) => [
          ...prev,
          { player: currentPlayer, soldTo: winningTeam.name, price: finalPrice },
        ]);
      }

      // Advance to next player
      const nextIdx = currentIdx + 1;
      if (nextIdx < miniPool.length) {
        setCurrentIdx(nextIdx);
        setCurrentBid(miniPool[nextIdx].basePrice || 0.5);
        setCurrentBidderId(null);
        setTimer(7);
      } else {
        // Mini-auction completed!
        setIsBiddingActive(false);
        setStep("SUMMARY");
      }
    },
    [currentPlayer, currentIdx, miniPool, localTeams]
  );

  // Timer countdown effect
  useEffect(() => {
    if (!isOpen || step !== "MINI_AUCTION" || !isBiddingActive) return;

    const interval = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          finalizeMiniSale(currentBidderId, currentBid);
          return 7;
        }
        if (prev === 3) audioEngine.playTick(1);
        if (prev === 2) audioEngine.playTick(2);
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isOpen, step, isBiddingActive, currentBidderId, currentBid, finalizeMiniSale]);

  // AI Bidding in Mini Auction
  const aiBidTimeoutRef = useRef(null);
  useEffect(() => {
    if (!isOpen || step !== "MINI_AUCTION" || !isBiddingActive || !currentPlayer) return;

    if (timer > 2 && timer < 7) {
      const delay = Math.floor(Math.random() * 1200) + 600;
      aiBidTimeoutRef.current = setTimeout(() => {
        // Find eligible AI teams wanting this player
        const eligibleAITeams = localTeams.filter((t) => {
          if (t.id === userTeamId) return false;
          if (t.id === currentBidderId) return false;
          const nextBid = currentBid + getIncrement(currentBid);
          const check = canTeamBid(t, currentPlayer, nextBid);
          return check.allowed && t.budget >= nextBid && (currentPlayer.rating >= 82 || Math.random() < 0.45);
        });

        if (eligibleAITeams.length > 0 && Math.random() < 0.65) {
          const bidder = eligibleAITeams[Math.floor(Math.random() * eligibleAITeams.length)];
          const nextBid = parseFloat((currentBid + getIncrement(currentBid)).toFixed(2));
          setCurrentBid(nextBid);
          setCurrentBidderId(bidder.id);
          setTimer(7);
          audioEngine.playPaddlePop();
        }
      }, delay);
    }

    return () => clearTimeout(aiBidTimeoutRef.current);
  }, [isOpen, step, isBiddingActive, currentPlayer, timer, currentBid, currentBidderId, localTeams, userTeamId]);

  // User manual bid
  const handleUserBid = () => {
    if (!currentPlayer || currentBidderId === userTeam.id) return;
    const nextBid = parseFloat((currentBid + getIncrement(currentBid)).toFixed(2));
    const check = canTeamBid(userTeam, currentPlayer, nextBid);
    if (!check.allowed) return;

    audioEngine.playPaddlePop();
    setCurrentBid(nextBid);
    setCurrentBidderId(userTeam.id);
    setTimer(7);
  };

  // Conclude season transition
  const handleFinalizeSeasonAdvance = () => {
    onCompleteSeasonAdvance({
      newSeason: currentSeason + 1,
      updatedTeams: localTeams,
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-md flex justify-center items-center z-50 p-4 animate-fadeIn">
      <div className="bg-gradient-to-b from-gray-900 via-gray-900 to-black p-5 md:p-7 rounded-3xl border-2 border-amber-500/80 shadow-2xl w-full max-w-4xl text-white max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-gray-800">
          <div className="flex items-center gap-2.5">
            <span className="text-2xl">🏆</span>
            <div>
              <h2 className="text-xl md:text-2xl font-black text-white flex items-center gap-2">
                <span>Multi-Year Franchise Mode — Season {currentSeason + 1} Transition</span>
              </h2>
              <p className="text-xs text-gray-400">
                Release surplus players, claim salary cap increases, and scout new talents in the Mini-Auction.
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

        {/* Step Indicator */}
        <div className="flex items-center justify-center gap-2 my-3 text-xs">
          <span
            className={`px-3 py-1 rounded-xl font-bold ${
              step === "RETENTION"
                ? "bg-amber-500 text-black shadow-md shadow-amber-500/20"
                : "bg-gray-800 text-gray-400"
            }`}
          >
            1. Year-End Releases
          </span>
          <span className="text-gray-600">→</span>
          <span
            className={`px-3 py-1 rounded-xl font-bold ${
              step === "MINI_AUCTION"
                ? "bg-amber-500 text-black shadow-md shadow-amber-500/20"
                : "bg-gray-800 text-gray-400"
            }`}
          >
            2. Live Mini-Auction
          </span>
          <span className="text-gray-600">→</span>
          <span
            className={`px-3 py-1 rounded-xl font-bold ${
              step === "SUMMARY"
                ? "bg-amber-500 text-black shadow-md shadow-amber-500/20"
                : "bg-gray-800 text-gray-400"
            }`}
          >
            3. Season {currentSeason + 1} Ready
          </span>
        </div>

        {/* STEP 1: RETENTION / RELEASE WINDOW */}
        {step === "RETENTION" && (
          <div className="flex-1 flex flex-col overflow-y-auto">
            <div className="bg-amber-500/10 border border-amber-500/30 p-3 rounded-2xl mb-3 flex items-center justify-between text-xs">
              <div>
                <span className="font-extrabold text-amber-300">
                  ⚡ Annual Salary Cap Boost: +₹15.00 Crore
                </span>
                <p className="text-gray-400 text-[11px]">
                  Select players to release back to the auction pool to recover their salary into your purse.
                </p>
              </div>
              <div className="text-right">
                <span className="text-gray-400 block text-[10px]">Your Available Purse:</span>
                <span className="text-green-400 font-mono font-black text-sm">
                  ₹
                  {(
                    userTeam.budget +
                    (userTeam.players || [])
                      .filter((p) => releasedPlayerIds.has(p.id))
                      .reduce((s, p) => s + (p.bidPrice || p.basePrice || 1.0), 0)
                  ).toFixed(2)}
                  Cr
                </span>
              </div>
            </div>

            <p className="text-xs text-gray-400 font-bold mb-2">
              Select players to RELEASE from {userTeam.name} ({releasedPlayerIds.size} selected):
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 overflow-y-auto max-h-[45vh] pr-1">
              {(userTeam.players || []).map((player) => {
                const isReleased = releasedPlayerIds.has(player.id);
                return (
                  <div
                    key={player.id}
                    onClick={() => toggleReleasePlayer(player)}
                    className={`p-2.5 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                      isReleased
                        ? "bg-red-950/60 border-red-500 text-red-200"
                        : "bg-gray-950 border-gray-800 hover:border-gray-700 text-white"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <img
                        src={player.image || FALLBACK_IMAGE}
                        alt={player.name}
                        className="w-8 h-8 rounded-full object-cover border border-gray-700"
                      />
                      <div>
                        <div className="text-xs font-bold leading-tight">{player.name}</div>
                        <div className="text-[10px] text-gray-400">
                          {player.role} • ⭐ {player.rating || 75}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <span
                        className={`text-xs font-mono font-bold block ${
                          isReleased ? "text-red-400 line-through" : "text-green-400"
                        }`}
                      >
                        ₹{(player.bidPrice || player.basePrice || 1.0).toFixed(2)}Cr
                      </span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded font-bold uppercase">
                        {isReleased ? "❌ Releasing" : "✅ Retained"}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-4 pt-3 border-t border-gray-800 flex justify-end">
              <button
                onClick={handleProceedToMiniAuction}
                className="px-6 py-2.5 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-black font-extrabold text-xs rounded-xl shadow-lg shadow-yellow-500/20 active:scale-95 cursor-pointer"
              >
                Confirm Retentions & Enter Mini-Auction ▶
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: LIVE MINI-AUCTION */}
        {step === "MINI_AUCTION" && currentPlayer && (
          <div className="flex-1 flex flex-col items-center text-center justify-between">
            <div className="text-xs text-gray-400 mb-1">
              Mini-Auction Lot {currentIdx + 1} of {miniPool.length}
            </div>

            {/* Showcase Card */}
            <div className="bg-gray-950 border-2 border-amber-500/80 rounded-2xl p-4 w-full max-w-lg shadow-xl">
              <div className="flex items-center justify-between mb-3">
                <span className="px-2.5 py-1 rounded-lg bg-amber-500/20 text-amber-300 font-bold text-xs uppercase">
                  {currentPlayer.role}
                </span>
                <span className="text-xs text-gray-400">
                  Base: ₹{currentPlayer.basePrice?.toFixed(2)}Cr
                </span>
              </div>

              <img
                src={currentPlayer.image || FALLBACK_IMAGE}
                alt={currentPlayer.name}
                className="w-20 h-20 rounded-2xl object-cover mx-auto border-2 border-amber-400 mb-2 shadow-md"
              />

              <h3 className="text-lg md:text-xl font-black text-white">{currentPlayer.name}</h3>
              <p className="text-xs text-gray-400 mb-3">
                {currentPlayer.nationality} • Age {currentPlayer.age || 22} • ⭐ Rating:{" "}
                <span className="text-yellow-400 font-bold">{currentPlayer.rating || 80}</span>
              </p>

              {/* Bid Counter Display */}
              <div className="bg-gray-900 border border-gray-800 rounded-xl p-3 flex items-center justify-around mb-3">
                <div>
                  <span className="text-[10px] text-gray-400 block uppercase">Current High Bid</span>
                  <span className="text-xl md:text-2xl font-mono font-black text-green-400">
                    ₹{currentBid.toFixed(2)}Cr
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-gray-400 block uppercase">Leading Bidder</span>
                  <span className="text-xs md:text-sm font-bold text-yellow-300">
                    {localTeams.find((t) => t.id === currentBidderId)?.name || "No Bids Yet"}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-gray-400 block uppercase">Timer</span>
                  <span
                    className={`text-xl font-mono font-black ${
                      timer <= 2 ? "text-red-500 animate-pulse" : "text-white"
                    }`}
                  >
                    00:0{timer}
                  </span>
                </div>
              </div>

              {/* User Bid Button */}
              <button
                onClick={handleUserBid}
                disabled={currentBidderId === userTeam.id}
                className={`w-full py-3 rounded-xl font-black text-sm transition-all shadow-md ${
                  currentBidderId === userTeam.id
                    ? "bg-green-600/30 text-green-300 border border-green-500/50 cursor-default"
                    : "bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-black active:scale-95 cursor-pointer"
                }`}
              >
                {currentBidderId === userTeam.id
                  ? `✓ ${userTeam.shortName} Holds Current Bid`
                  : `Raise Paddle (+₹${getIncrement(currentBid).toFixed(2)}Cr)`}
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: SUMMARY */}
        {step === "SUMMARY" && (
          <div className="flex-1 flex flex-col justify-between overflow-y-auto">
            <div className="text-center py-4">
              <span className="text-4xl">🎉</span>
              <h3 className="text-2xl font-black text-white mt-1">Mini-Auction Concluded!</h3>
              <p className="text-xs text-gray-400">
                All franchises have completed their roster refreshes for IPL Season {currentSeason + 1}.
              </p>
            </div>

            <div className="bg-gray-950 p-3 rounded-2xl border border-gray-800 max-h-[40vh] overflow-y-auto mb-3">
              <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-2">
                Mini-Auction Transaction Ledger:
              </h4>
              <div className="space-y-1 text-xs">
                {auctionLog.map((log, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-2 rounded-lg bg-gray-900 border border-gray-800"
                  >
                    <span className="font-bold text-white">{log.player.name}</span>
                    <span className="text-gray-400 text-[11px]">{log.player.role}</span>
                    <span
                      className={`font-mono font-bold ${
                        log.soldTo === "Unsold" ? "text-red-400" : "text-green-400"
                      }`}
                    >
                      {log.soldTo === "Unsold" ? "Unsold" : `₹${log.price.toFixed(2)}Cr (${log.soldTo})`}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-2 border-t border-gray-800 flex justify-end">
              <button
                onClick={handleFinalizeSeasonAdvance}
                className="px-6 py-2.5 bg-green-500 hover:bg-green-400 text-black font-extrabold text-xs rounded-xl shadow-lg active:scale-95 cursor-pointer"
              >
                🚀 Launch Season {currentSeason + 1} Campaign!
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
