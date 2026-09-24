import React, { useState, useEffect, useMemo, useCallback } from "react";
import playersData from "./data/players.json";
import previousPlayersData from "./data/previous.json";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { jsPDF } from "jspdf";
import "./index.css";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";

import {
  roleImages,
  FALLBACK_IMAGE,
  initialIplTeams,
} from "./utils/constants";

import {
  getIncrement,
  calculateMaxAllowedBid,
  canTeamBid,
  flattenPreviousTeams,
  buildPreviousPlayersMap,
  getAIRetentions,
  buildAuctionSets,
  TOTAL_RETENTION_FUNDS,
  MIN_SQUAD_SIZE,
  MAX_SQUAD_SIZE,
  MAX_OVERSEAS_PLAYERS,
  CAPPED_INTERNATIONAL_COSTS,
  UNCAPPED_COST,
} from "./utils/auctionRules";

import {
  RTMInquiryModal,
  RTMFinalRaiseModal,
  RTMMatchDecisionModal,
} from "./components/RTMModals";
import { AuctionSetsModal } from "./components/AuctionSetsModal";
import { SetCompletionModal } from "./components/SetCompletionModal";
import { AcceleratedRoundModal } from "./components/AcceleratedRoundModal";
import TeamNeedsModal from "./components/TeamNeedsModal";
import BiddingWarBanner from "./components/BiddingWarBanner";
import PlayingXIModal from "./components/PlayingXIModal";
import TournamentSimulatorModal from "./components/TournamentSimulatorModal";
import { GavelPodium } from "./components/GavelPodium";
import { AudioSettingsModal } from "./components/AudioSettingsModal";
import { audioEngine } from "./utils/audioEffects";
import { MultiplayerSettingsModal } from "./components/MultiplayerSettingsModal";
import { PlayerEditorModal } from "./components/PlayerEditorModal";
import { VINTAGE_2008_ROSTER, ALL_TIME_LEGENDS_ROSTER } from "./data/vintageRosters";
import {
  saveAuctionState,
  loadSavedState,
  hasSavedState,
  clearSavedState,
} from "./utils/storageUtils";
import { StarterPage } from "./components/StarterPage";
import {
  FRANCHISE_PERSONAS,
  getRivalryDetails,
  getPlayerSpecializations,
  analyzeTeamNeeds,
  evaluateAIBid,
} from "./utils/aiIntelligence";

// === Team Selection Modal (Phase 5 Enhanced: Solo & Pass-and-Play Multiplayer) ===
const TeamSelectionModal = ({
  teams,
  onSelectSoloTeam,
  onSelectMultiplayerTeams,
  onOpenRosterStudio,
  activeRosterPreset,
  initialMode = "solo",
  onBackToStarter,
}) => {
  const [mode, setMode] = useState(initialMode);
  const [selectedMultiTeamIds, setSelectedMultiTeamIds] = useState([1, 6]);

  useEffect(() => {
    if (initialMode) {
      setMode(initialMode);
    }
  }, [initialMode]);

  const toggleMultiTeam = (id) => {
    if (selectedMultiTeamIds.includes(id)) {
      if (selectedMultiTeamIds.length > 1) {
        setSelectedMultiTeamIds(selectedMultiTeamIds.filter((tId) => tId !== id));
      }
    } else {
      setSelectedMultiTeamIds([...selectedMultiTeamIds, id]);
    }
  };

  const selectPreset = (type) => {
    if (type === "derby") setSelectedMultiTeamIds([1, 6]);
    else if (type === "quad") setSelectedMultiTeamIds([1, 6, 9, 4]);
    else if (type === "all") setSelectedMultiTeamIds(teams.map((t) => t.id));
  };

  const getPresetBadge = () => {
    if (activeRosterPreset === "2008_vintage") return "🕰️ 2008 Historic Inaugural";
    if (activeRosterPreset === "legends") return "⭐ All-Time Legends & Titans";
    return "🏏 2025 Mega Auction (Default 500+)";
  };

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-md flex justify-center items-center z-50 p-4">
      <div className="bg-gradient-to-b from-gray-900 via-gray-900 to-black p-6 md:p-8 rounded-3xl border-2 border-yellow-500 shadow-2xl w-full max-w-2xl text-white text-center">
        {onBackToStarter && (
          <div className="flex justify-start mb-2">
            <button
              onClick={onBackToStarter}
              className="text-xs text-gray-400 hover:text-white flex items-center gap-1.5 transition-colors px-2.5 py-1 rounded-xl bg-gray-950 border border-gray-800 hover:border-gray-700"
            >
              <span>←</span>
              <span>Back to Welcome</span>
            </button>
          </div>
        )}
        <div className="inline-block px-3 py-1 bg-yellow-500/20 border border-yellow-400 rounded-full text-yellow-400 font-extrabold text-xs uppercase tracking-widest mb-3">
          IPL Mega Auction 2025
        </div>
        <h2 className="text-3xl md:text-4xl font-black mb-1 text-white">
          Choose Your Franchise
        </h2>
        <p className="mb-4 text-gray-300 text-xs md:text-sm">
          Select your franchise to manage retentions, strategic RTM cards, and live bidding!
        </p>

        {/* Mode Switcher */}
        <div className="flex justify-center mb-4">
          <div className="bg-gray-950 p-1 rounded-2xl border border-gray-800 flex items-center gap-1">
            <button
              onClick={() => setMode("solo")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                mode === "solo"
                  ? "bg-yellow-500 text-black shadow-md shadow-yellow-500/20"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              👤 Solo Manager (1 Team)
            </button>
            <button
              onClick={() => setMode("multiplayer")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                mode === "multiplayer"
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              👥 Pass-and-Play Multiplayer (2-10 Teams)
            </button>
          </div>
        </div>

        {/* Multiplayer Presets & Controls */}
        {mode === "multiplayer" && (
          <div className="mb-4 bg-indigo-950/40 border border-indigo-500/30 p-3 rounded-2xl flex flex-wrap items-center justify-between gap-2 text-xs">
            <span className="text-indigo-300 font-semibold">
              Selected: <span className="font-black text-white">{selectedMultiTeamIds.length} Teams</span>
            </span>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => selectPreset("derby")}
                className="px-2.5 py-1 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 text-[11px] font-bold"
              >
                ⚔️ CSK vs MI
              </button>
              <button
                onClick={() => selectPreset("quad")}
                className="px-2.5 py-1 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 text-[11px] font-bold"
              >
                🔥 Big 4
              </button>
              <button
                onClick={() => selectPreset("all")}
                className="px-2.5 py-1 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 text-[11px] font-bold"
              >
                🏟️ All 10
              </button>
            </div>
          </div>
        )}

        {/* Franchise Selection Grid */}
        <div className="grid grid-cols-2 gap-3 max-h-[48vh] overflow-y-auto p-1 mb-4">
          {teams.map((team) => {
            const isSelected = selectedMultiTeamIds.includes(team.id);
            return (
              <button
                key={team.id}
                className={`p-3.5 rounded-2xl border-2 transition-all text-left flex flex-col justify-between shadow-lg group ${
                  mode === "multiplayer"
                    ? isSelected
                      ? `${team.color} bg-indigo-950/80 ring-2 ring-indigo-400 scale-[1.01]`
                      : "border-gray-800 bg-gray-900/60 opacity-60 hover:opacity-90"
                    : `${team.color} bg-gray-800/80 hover:bg-gray-700/90 hover:scale-[1.02]`
                }`}
                onClick={() => {
                  if (mode === "solo") {
                    onSelectSoloTeam(team.id);
                  } else {
                    toggleMultiTeam(team.id);
                  }
                }}
              >
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-sm md:text-base text-white group-hover:text-yellow-400 transition-colors">
                    {team.name}
                  </span>
                  {mode === "multiplayer" ? (
                    <span
                      className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black ${
                        isSelected ? "bg-green-400 text-black" : "bg-gray-800 text-gray-500"
                      }`}
                    >
                      {isSelected ? "✓" : "+"}
                    </span>
                  ) : (
                    <span className="text-xs px-2 py-0.5 rounded bg-black/40 font-mono text-gray-300">
                      {team.shortName}
                    </span>
                  )}
                </div>
                <div className="mt-2 text-[11px] text-gray-400 flex items-center justify-between">
                  <span>Purse: ₹120.00Cr</span>
                  <span>Max 6 Retentions</span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Footer Actions: Multiplayer Confirm & Roster Studio */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-gray-800">
          <button
            onClick={onOpenRosterStudio}
            className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-300 border border-gray-700 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5"
          >
            <span>✏️ Roster:</span>
            <span className="text-yellow-400">{getPresetBadge()}</span>
          </button>

          {mode === "multiplayer" ? (
            <button
              onClick={() => onSelectMultiplayerTeams(selectedMultiTeamIds)}
              className="px-6 py-2 bg-yellow-500 hover:bg-yellow-400 text-black font-black text-xs rounded-xl shadow-lg transition-all"
            >
              Confirm {selectedMultiTeamIds.length} Teams & Start Retentions ▶
            </button>
          ) : (
            <span className="text-xs text-gray-500 italic">
              Click any franchise above to begin solo career
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

// === Retention Modal ===
const RetentionModal = ({
  isOpen,
  team,
  eligiblePlayers,
  onConfirm,
  stepIndex = 1,
  totalSteps = 1,
}) => {
  const [selectedPlayerIds, setSelectedPlayerIds] = useState([]);
  const [playerPrices, setPlayerPrices] = useState({});
  const [availableFunds, setAvailableFunds] = useState(TOTAL_RETENTION_FUNDS);

  // Reset selection when team changes in multi-manager retention queue
  useEffect(() => {
    setSelectedPlayerIds([]);
  }, [team?.id]);

  // Count selected capped/uncapped players
  const countSelectedByType = () => {
    let capped = 0;
    let uncapped = 0;
    selectedPlayerIds.forEach((id) => {
      const player = eligiblePlayers.find((p) => p.id === id);
      if (player?.isCapped) capped++;
      else uncapped++;
    });
    return { capped, uncapped };
  };

  // Auto-update prices and funds whenever selection changes
  useEffect(() => {
    const prices = {};
    let cappedIndex = 0;
    let spent = 0;

    selectedPlayerIds.forEach((id) => {
      const player = eligiblePlayers.find((p) => p.id === id);
      let cost = 0;

      if (!player?.isCapped) {
        cost = UNCAPPED_COST;
      } else {
        cost =
          CAPPED_INTERNATIONAL_COSTS[cappedIndex] ||
          CAPPED_INTERNATIONAL_COSTS[CAPPED_INTERNATIONAL_COSTS.length - 1];
        cappedIndex++;
      }

      prices[id] = cost;
      spent += cost;
    });

    setPlayerPrices(prices);
    setAvailableFunds(TOTAL_RETENTION_FUNDS - spent);
  }, [selectedPlayerIds, eligiblePlayers]);

  const togglePlayerSelection = (playerId) => {
    const player = eligiblePlayers.find((p) => p.id === playerId);
    const { capped, uncapped } = countSelectedByType();

    if (selectedPlayerIds.includes(playerId)) {
      setSelectedPlayerIds(selectedPlayerIds.filter((id) => id !== playerId));
    } else {
      if (selectedPlayerIds.length >= 6) {
        toast.warning("Maximum 6 retentions allowed per team!");
        return;
      }
      if (player?.isCapped && capped >= 5) {
        toast.warning("Maximum 5 capped players allowed for retention!");
        return;
      }
      if (!player?.isCapped && uncapped >= 2) {
        toast.warning("Maximum 2 uncapped players allowed for retention!");
        return;
      }
      setSelectedPlayerIds([...selectedPlayerIds, playerId]);
    }
  };

  const handleConfirm = () => {
    onConfirm(team.id, selectedPlayerIds, playerPrices);
  };

  if (!isOpen || !team) return null;

  const rtmCardsLeft = Math.max(0, 6 - selectedPlayerIds.length);

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-md flex justify-center items-center z-50 p-4">
      <div className="bg-gray-900 border-2 border-yellow-500 p-6 md:p-8 rounded-3xl shadow-2xl w-full max-w-5xl text-white text-center flex flex-col max-h-[90vh]">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
          <div>
            <div className="flex items-center gap-2 mb-1">
              {totalSteps > 1 && (
                <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/20 border border-indigo-400 text-indigo-300 font-extrabold text-xs">
                  Franchise {stepIndex} of {totalSteps}
                </span>
              )}
              <h2 className="text-2xl md:text-3xl font-black text-yellow-400">
                Player Retention — {team.name}
              </h2>
            </div>
            <p className="text-xs md:text-sm text-gray-300">
              Select up to <span className="text-yellow-400 font-bold">6 players</span> (max 5 capped, 2 uncapped).
            </p>
          </div>
          <div className="px-3 py-1.5 bg-yellow-500/20 border border-yellow-400 rounded-xl text-xs font-bold text-yellow-300">
            ⚡ RTM Cards in Auction: <span className="text-white font-extrabold text-sm">{rtmCardsLeft}</span>
          </div>
        </div>

        {/* Funds & RTM Tracker Bar */}
        <div className="flex flex-wrap justify-center gap-3 my-4 text-sm font-semibold">
          <div className="bg-gray-800 border border-gray-700 px-4 py-2 rounded-xl">
            Initial Purse: <span className="text-white font-bold">₹{TOTAL_RETENTION_FUNDS}Cr</span>
          </div>
          <div
            className={`px-4 py-2 rounded-xl border ${
              availableFunds < 0
                ? "bg-red-950/60 border-red-500 text-red-200"
                : "bg-green-950/60 border-green-500 text-green-300 font-bold"
            }`}
          >
            Remaining Purse: ₹{availableFunds.toFixed(2)}Cr
          </div>
          <div className="bg-indigo-950/60 border border-indigo-500 text-indigo-300 px-4 py-2 rounded-xl">
            Retained: {selectedPlayerIds.length}/6
          </div>
        </div>

        {/* Players Grid */}
        <div className="flex-1 overflow-y-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-2 text-left">
          {eligiblePlayers.map((player) => {
            const isSelected = selectedPlayerIds.includes(player.id);
            const cost = playerPrices[player.id] || 0;
            return (
              <div
                key={player.id}
                className={`relative p-4 rounded-2xl border-2 transition-all cursor-pointer shadow-lg flex flex-col justify-between ${
                  isSelected
                    ? "border-green-400 bg-green-950/50 ring-2 ring-green-500"
                    : "border-gray-800 bg-gray-800/70 hover:border-yellow-400 hover:bg-gray-800"
                }`}
                onClick={() => togglePlayerSelection(player.id)}
              >
                <div>
                  <div className="relative w-20 h-20 mx-auto mb-3">
                    <img
                      src={player.image || FALLBACK_IMAGE}
                      alt={player.name}
                      className="w-full h-full rounded-full border-2 border-gray-600 object-cover"
                    />
                    <img
                      src={roleImages[player.role]}
                      alt={player.role}
                      title={player.role}
                      className="w-6 h-6 absolute bottom-0 right-0 border-2 border-gray-900 rounded-full bg-gray-900 p-0.5"
                    />
                  </div>
                  <h3 className="text-base font-bold text-white text-center truncate">
                    {player.name}
                  </h3>
                  <p className="text-xs text-gray-400 text-center">{player.role}</p>
                  <p
                    className={`text-xs text-center font-semibold mt-1 ${
                      player.isCapped ? "text-green-400" : "text-blue-400"
                    }`}
                  >
                    {player.isCapped ? "Capped" : "Uncapped (₹4Cr)"}
                  </p>
                </div>

                {isSelected ? (
                  <div className="mt-3 pt-2 border-t border-green-800/60 text-center">
                    <span className="text-xs font-bold text-yellow-400">
                      Retention Cost: ₹{cost}Cr
                    </span>
                  </div>
                ) : (
                  <div className="mt-3 text-center">
                    <span className="text-[11px] text-gray-500 font-medium">Click to Retain</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Action Controls */}
        <div className="mt-4 pt-3 border-t border-gray-800 flex flex-wrap justify-between items-center gap-3">
          <p className="text-xs text-gray-400">
            Note: Every unused retention slot becomes an active <span className="text-yellow-400 font-bold">RTM Card</span> in the live auction.
          </p>
          <div className="flex gap-2">
            <button
              className="px-4 py-2.5 rounded-xl border border-gray-700 bg-gray-800 hover:bg-gray-700 text-xs font-bold text-gray-300 transition-all"
              onClick={() => {
                setSelectedPlayerIds([]);
              }}
            >
              Reset / Zero Retentions
            </button>
            <button
              className="px-6 py-2.5 bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-400 hover:to-amber-400 text-black font-black text-sm rounded-xl shadow-lg shadow-yellow-500/20 transition-all active:scale-95"
              onClick={handleConfirm}
            >
              Confirm Retentions ({selectedPlayerIds.length}/6) → Enter Auction
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// === Player Card Component ===
const PlayerCard = ({
  player,
  currentBid,
  currentBidderTeam,
  timer,
  isAccelerated,
  onClick,
}) => {
  if (!player) return null;
  const isOverseas = player.nationality && player.nationality.toLowerCase().trim() !== "indian";
  const timerPercentage = Math.max(0, Math.min(100, (timer / (isAccelerated ? 5 : 12)) * 100));

  return (
    <div
      className="bg-gradient-to-tr from-gray-950 via-gray-900 to-gray-900 rounded-3xl shadow-2xl w-full max-w-md p-6 text-center border-2 border-indigo-500 hover:border-yellow-400 transition-all duration-300 cursor-pointer relative overflow-hidden group"
      onClick={onClick}
    >
      {/* Top badges */}
      <div className="flex items-center justify-between gap-2 mb-3">
        <span className="px-2.5 py-0.5 rounded-full bg-gray-800 border border-gray-700 text-xs font-bold text-gray-300">
          Rating: <span className="text-yellow-400">★ {player.rating || 85}</span>
        </span>
        {player.previousTeamName && (
          <span className="px-2.5 py-0.5 rounded-full bg-yellow-500/20 border border-yellow-400/60 text-yellow-300 text-xs font-bold truncate max-w-[190px]" title={`Previous: ${player.previousTeamName}`}>
            ⚡ RTM: {player.previousTeamName}
          </span>
        )}
      </div>

      {/* Headshot & Role */}
      <div className="relative w-32 h-32 mx-auto mb-4">
        <img
          src={player.image || FALLBACK_IMAGE}
          alt={player.name}
          className="w-full h-full rounded-full border-4 border-indigo-500 shadow-2xl object-cover group-hover:scale-105 transition-transform"
        />
        <img
          src={roleImages[player.role]}
          alt={player.role}
          title={player.role}
          className="w-8 h-8 absolute bottom-0 right-0 border-2 border-gray-900 bg-gray-900 rounded-full p-1 shadow-lg"
        />
      </div>

      <h2 className="text-2xl md:text-3xl font-black text-white group-hover:text-yellow-300 transition-colors truncate">
        {player.name}
      </h2>

      <div className="flex items-center justify-center gap-2 text-sm text-gray-300 mt-1 mb-2">
        <span>{player.role}</span>
        <span>•</span>
        <span className={player.isCapped ? "text-green-400 font-semibold" : "text-blue-400 font-semibold"}>
          {player.isCapped ? "Capped" : "Uncapped"}
        </span>
        {isOverseas && (
          <>
            <span>•</span>
            <span className="text-cyan-400 font-bold">✈ Overseas ({player.nationality})</span>
          </>
        )}
      </div>

      {/* Specialization Badges (Phase 2) */}
      <div className="flex flex-wrap items-center justify-center gap-1.5 mb-4">
        {getPlayerSpecializations(player).map((spec, idx) => (
          <span
            key={idx}
            className="text-[11px] px-2 py-0.5 rounded-lg bg-indigo-950/80 border border-indigo-500/40 text-indigo-300 font-medium"
          >
            ⚡ {spec}
          </span>
        ))}
      </div>

      {/* Base Price & Current Bid Bar */}
      <div className="grid grid-cols-2 gap-3 bg-gray-950/70 p-3 rounded-2xl border border-gray-800 mb-4">
        <div>
          <p className="text-xs text-gray-400">Base Price</p>
          <p className="text-lg font-bold text-gray-300">₹{player.basePrice.toFixed(2)}Cr</p>
        </div>
        <div>
          <p className="text-xs text-yellow-400 font-bold">Current Bid</p>
          <p className="text-2xl font-black text-green-400">₹{currentBid.toFixed(2)}Cr</p>
        </div>
      </div>

      {/* Leading Bidder Indicator */}
      <div className="mb-4">
        {currentBidderTeam ? (
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-green-500/20 border border-green-500 rounded-full text-green-400 text-xs font-bold animate-pulse">
            <span>Leading Bidder:</span>
            <span className="text-white font-extrabold">{currentBidderTeam.name}</span>
          </div>
        ) : (
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-gray-800 rounded-full text-gray-400 text-xs font-semibold">
            No active bids yet — Waiting for opening bid
          </div>
        )}
      </div>

      {/* Timer Progress Bar */}
      <div className="w-full bg-gray-800 h-2.5 rounded-full overflow-hidden">
        <div
          className={`h-full transition-all duration-300 ${
            timer <= 3 ? "bg-red-500 animate-pulse" : timer <= 6 ? "bg-yellow-500" : "bg-green-500"
          }`}
          style={{ width: `${timerPercentage}%` }}
        />
      </div>
      <p className="text-[11px] text-gray-400 mt-1 font-mono">
        Bidding Clock: <span className="font-bold text-white">{timer}s</span>
        {isAccelerated && <span className="text-amber-400 ml-1 font-bold">(Accelerated)</span>}
      </p>
    </div>
  );
};

// === Player Stats Modal ===
const PlayerStatsModal = ({ player, onClose }) => {
  if (!player) return null;
  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-md flex justify-center items-center z-50 p-4">
      <div className="bg-gray-900 border-2 border-indigo-500 p-6 rounded-3xl shadow-2xl max-w-xl w-full text-white relative max-h-[85vh] overflow-y-auto">
        <button
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-gray-800 hover:bg-red-600 text-white font-bold flex items-center justify-center transition-colors"
          onClick={onClose}
        >
          ✕
        </button>

        <div className="flex items-center gap-4 mb-4">
          <img
            src={player.image || FALLBACK_IMAGE}
            alt={player.name}
            className="w-16 h-16 rounded-full border-2 border-yellow-400 object-cover"
          />
          <div>
            <h3 className="text-2xl font-black text-white">{player.name}</h3>
            <p className="text-sm text-gray-400">
              {player.role} • {player.nationality} • Age: {player.age || "N/A"}
            </p>
            <p className="text-xs text-yellow-400 font-bold mt-0.5">
              Player Rating: ★ {player.rating || 85}
            </p>
          </div>
        </div>

        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
          Career Statistics
        </h4>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs">
          <div className="bg-gray-800/80 p-2.5 rounded-xl border border-gray-700">
            <span className="text-gray-400 block">Matches</span>
            <span className="text-base font-bold text-white">{player.matches || 0}</span>
          </div>
          <div className="bg-gray-800/80 p-2.5 rounded-xl border border-gray-700">
            <span className="text-gray-400 block">Runs</span>
            <span className="text-base font-bold text-white">{player.runs || 0}</span>
          </div>
          <div className="bg-gray-800/80 p-2.5 rounded-xl border border-gray-700">
            <span className="text-gray-400 block">Highest Score</span>
            <span className="text-base font-bold text-white">{player.highestScore || 0}</span>
          </div>
          <div className="bg-gray-800/80 p-2.5 rounded-xl border border-gray-700">
            <span className="text-gray-400 block">Batting Avg</span>
            <span className="text-base font-bold text-white">{player.battingAverage || 0}</span>
          </div>
          <div className="bg-gray-800/80 p-2.5 rounded-xl border border-gray-700">
            <span className="text-gray-400 block">Strike Rate</span>
            <span className="text-base font-bold text-white">{player.battingStrikeRate || 0}</span>
          </div>
          <div className="bg-gray-800/80 p-2.5 rounded-xl border border-gray-700">
            <span className="text-gray-400 block">Wickets</span>
            <span className="text-base font-bold text-white">{player.wickets || 0}</span>
          </div>
          <div className="bg-gray-800/80 p-2.5 rounded-xl border border-gray-700">
            <span className="text-gray-400 block">Bowling Economy</span>
            <span className="text-base font-bold text-white">{player.bowlingEconomy || 0}</span>
          </div>
          <div className="bg-gray-800/80 p-2.5 rounded-xl border border-gray-700">
            <span className="text-gray-400 block">Best Bowling</span>
            <span className="text-base font-bold text-white">{player.bestBowling || "-/-"}</span>
          </div>
          <div className="bg-gray-800/80 p-2.5 rounded-xl border border-gray-700">
            <span className="text-gray-400 block">Bowling Avg</span>
            <span className="text-base font-bold text-white">{player.bowlingAverage || 0}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// === Team Roster Modal with Drag & Drop ===
const TeamRosterModal = ({ team, onClose, onDragEnd, onOpenPlayingXI }) => {
  if (!team) return null;
  const overseasCount = team.players.filter(
    (p) => p.nationality && p.nationality.toLowerCase().trim() !== "indian"
  ).length;

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-md flex justify-center items-center z-50 p-4">
      <div className="bg-gray-900 border-2 border-yellow-500 p-6 rounded-3xl shadow-2xl w-full max-w-3xl text-white relative max-h-[85vh] flex flex-col">
        <div className="flex justify-between items-center mb-3">
          <div>
            <h2 className="text-2xl font-black text-yellow-400">{team.name} Roster</h2>
            <p className="text-xs text-gray-400">
              Squad: <span className="text-white font-bold">{team.players.length} Players</span> (Min 18, Max 25) •
              Overseas: <span className="text-white font-bold">{overseasCount}/8</span> •
              Purse Remaining: <span className="text-green-400 font-bold">₹{team.budget.toFixed(2)}Cr</span>
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                onClose();
                if (onOpenPlayingXI) onOpenPlayingXI(team.id);
              }}
              className="px-3 py-1.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-1.5"
            >
              🏏 Playing XI & Chemistry
            </button>
            <button
              className="w-8 h-8 rounded-full bg-gray-800 hover:bg-red-600 text-white font-bold flex items-center justify-center transition-colors"
              onClick={onClose}
            >
              ✕
            </button>
          </div>
        </div>

        <p className="text-xs text-gray-400 mb-2 italic">
          💡 Drag & drop rows to rearrange your starting lineup priority.
        </p>

        <div className="flex-1 overflow-y-auto">
          {team.players.length === 0 ? (
            <div className="text-center py-12 text-gray-500 text-sm">
              No players signed yet.
            </div>
          ) : (
            <DragDropContext onDragEnd={onDragEnd}>
              <Droppable droppableId={`${team.id}`}>
                {(provided) => (
                  <table
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className="w-full text-left text-sm border-collapse"
                  >
                    <thead>
                      <tr className="bg-gray-800 text-gray-400 text-xs uppercase">
                        <th className="p-2.5 rounded-l-lg">#</th>
                        <th className="p-2.5">Player</th>
                        <th className="p-2.5">Role</th>
                        <th className="p-2.5">Nationality</th>
                        <th className="p-2.5 text-right rounded-r-lg">Price</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-800">
                      {team.players.map((p, idx) => (
                        <Draggable key={p.id} draggableId={`${p.id}`} index={idx}>
                          {(dragProvided) => (
                            <tr
                              ref={dragProvided.innerRef}
                              {...dragProvided.draggableProps}
                              {...dragProvided.dragHandleProps}
                              className="hover:bg-gray-800/60 transition-colors"
                            >
                              <td className="p-2.5 text-gray-500 font-mono text-xs">
                                {idx + 1}
                              </td>
                              <td className="p-2.5 flex items-center gap-2">
                                <img
                                  src={p.image || FALLBACK_IMAGE}
                                  alt={p.name}
                                  className="w-7 h-7 rounded-full object-cover border border-gray-600"
                                />
                                <span className="font-semibold text-white truncate">
                                  {p.name}
                                  {p.retained && (
                                    <span className="ml-1.5 text-[10px] px-1.5 py-0.5 rounded bg-yellow-500/20 text-yellow-400 font-bold border border-yellow-500/40">
                                      Retained
                                    </span>
                                  )}
                                </span>
                              </td>
                              <td className="p-2.5 text-xs text-gray-300">{p.role}</td>
                              <td className="p-2.5 text-xs text-gray-400">
                                {p.nationality}
                              </td>
                              <td className="p-2.5 text-right font-bold text-green-400 text-xs">
                                ₹{(p.bidPrice || 0).toFixed(2)}Cr
                              </td>
                            </tr>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </tbody>
                  </table>
                )}
              </Droppable>
            </DragDropContext>
          )}
        </div>
      </div>
    </div>
  );
};

export default function App() {
  // === Core State ===
  const [teams, setTeams] = useState(initialIplTeams);
  const [userTeamId, setUserTeamId] = useState(null);
  const [auctionStarted, setAuctionStarted] = useState(false);
  const [showRetentionModal, setShowRetentionModal] = useState(false);

  // Starter Page & Navigation State
  const [showStarterPage, setShowStarterPage] = useState(true);
  const [teamSelectionInitialMode, setTeamSelectionInitialMode] = useState("solo");

  // Phase 5: Pass-and-Play & Multiplayer State
  const [humanTeamIds, setHumanTeamIds] = useState([1]);
  const [activeHumanTeamId, setActiveHumanTeamId] = useState(1);
  const [managerNames, setManagerNames] = useState({});
  const [showMultiplayerModal, setShowMultiplayerModal] = useState(false);
  const [retentionQueue, setRetentionQueue] = useState([]);
  const [retentionStepIndex, setRetentionStepIndex] = useState(1);
  const [totalRetentionSteps, setTotalRetentionSteps] = useState(1);
  const pendingHumanRetentionsRef = React.useRef({});

  // Phase 5: Custom Rosters & Database Studio State
  const [activeRosterPreset, setActiveRosterPreset] = useState("2025_mega");
  const [activePlayerPool, setActivePlayerPool] = useState(playersData);
  const [showPlayerEditorModal, setShowPlayerEditorModal] = useState(false);

  // Phase 5: LocalStorage Persistence & State Recovery
  const [showRecoveryBanner, setShowRecoveryBanner] = useState(false);

  // Sets & Pool State
  const [auctionSets, setAuctionSets] = useState([]);
  const [currentSetIndex, setCurrentSetIndex] = useState(0);
  const [currentSetPlayerIndex, setCurrentSetPlayerIndex] = useState(0);
  const [isAcceleratedRound, setIsAcceleratedRound] = useState(false);

  // Modals state
  const [showSetsModal, setShowSetsModal] = useState(false);
  const [setCompletedModalData, setSetCompletedModalData] = useState(null);
  const [showAcceleratedModal, setShowAcceleratedModal] = useState(false);
  const [showRosterModal, setShowRosterModal] = useState(null);
  const [showPlayerStats, setShowPlayerStats] = useState(null);

  // Bidding & Live State
  const [currentBid, setCurrentBid] = useState(2.0);
  const [currentBidderIndex, setCurrentBidderIndex] = useState(null);
  const [lastBidders, setLastBidders] = useState([]);
  const [passedTeams, setPassedTeams] = useState([]);
  const [timer, setTimer] = useState(12);
  const [auctionEnded, setAuctionEnded] = useState(false);

  // RTM State Machine: null | { stage, player, winningTeam, prevTeam, currentBid, finalBid }
  const [rtmState, setRtmState] = useState(null);

  // Phase 2: Target-Aware AI & Rivalry Bidding Wars State
  const [showTeamNeedsModal, setShowTeamNeedsModal] = useState(false);
  const [selectedNeedsTeamId, setSelectedNeedsTeamId] = useState(1);
  const [activeBiddingWar, setActiveBiddingWar] = useState(null);
  const [tacticalInsight, setTacticalInsight] = useState(null);

  // Phase 3: Playing XI Builder & Match Simulator State
  const [showPlayingXIModal, setShowPlayingXIModal] = useState(false);
  const [selectedXITeamId, setSelectedXITeamId] = useState(1);
  const [showTournamentModal, setShowTournamentModal] = useState(false);
  const [initialTournamentTeamId, setInitialTournamentTeamId] = useState(1);

  // Phase 4: Audio, Sound Effects & Immersion State
  const [showAudioSettingsModal, setShowAudioSettingsModal] = useState(false);
  const [isSoldAnimation, setIsSoldAnimation] = useState(false);
  const [lastSoldEvent, setLastSoldEvent] = useState(null);

  // Phase 4: Resume Web Audio context on user first click/tap
  useEffect(() => {
    const handleFirstInteraction = () => {
      audioEngine.initContext();
      window.removeEventListener("click", handleFirstInteraction);
      window.removeEventListener("keydown", handleFirstInteraction);
    };
    window.addEventListener("click", handleFirstInteraction);
    window.addEventListener("keydown", handleFirstInteraction);
    return () => {
      window.removeEventListener("click", handleFirstInteraction);
      window.removeEventListener("keydown", handleFirstInteraction);
    };
  }, []);

  // Auction History Ledger
  const [auctionLog, setAuctionLog] = useState([]);

  // Mapping lookup for previous teams
  const prevMap = useMemo(() => {
    return buildPreviousPlayersMap(previousPlayersData);
  }, []);

  // Current active set and current player under hammer
  const currentSet = auctionSets[currentSetIndex];
  const currentPlayer = currentSet ? currentSet.players[currentSetPlayerIndex] : null;
  const currentBidderTeam = currentBidderIndex !== null ? teams[currentBidderIndex] : null;

  // Normalized previous players
  const normalizedPreviousPlayers = useMemo(() => {
    return flattenPreviousTeams(previousPlayersData);
  }, []);

  const userPreviousTeam = useMemo(() => {
    return normalizedPreviousPlayers.find((team) => team.teamId === userTeamId);
  }, [normalizedPreviousPlayers, userTeamId]);

  const eligibleRetentions = useMemo(() => {
    return userPreviousTeam?.players || [];
  }, [userPreviousTeam]);

  // Toast notifier helper
  const triggerBidToast = useCallback((msg, teamId = null, type = "info") => {
    const options = {
      autoClose: 2500,
      pauseOnHover: true,
      position: "top-center",
      className: "blink-toast",
    };
    if (type === "success") toast.success(msg, options);
    else if (type === "warning") toast.warning(msg, options);
    else toast.info(msg, options);

    if (teamId !== null) {
      setLastBidders((prev) => [teamId, ...prev.filter((id) => id !== teamId)].slice(0, 2));
    }
  }, []);

  // Reset clock on new bids or players
  const resetTimer = useCallback(() => {
    setTimer(isAcceleratedRound ? 5 : 12);
  }, [isAcceleratedRound]);

  // Check saved state on initial load
  useEffect(() => {
    if (hasSavedState()) {
      setShowRecoveryBanner(true);
    }
  }, []);

  // Auto-save checkpoint state to LocalStorage
  useEffect(() => {
    if (!auctionStarted) return;
    const saveTimer = setTimeout(() => {
      saveAuctionState({
        teams,
        userTeamId,
        humanTeamIds,
        activeHumanTeamId,
        managerNames,
        auctionStarted,
        auctionEnded,
        auctionSets,
        currentSetIndex,
        currentSetPlayerIndex,
        currentBid,
        currentBidderIndex,
        isAcceleratedRound,
        auctionLog,
        activeRosterPreset,
      });
    }, 1200);
    return () => clearTimeout(saveTimer);
  }, [
    teams,
    userTeamId,
    humanTeamIds,
    activeHumanTeamId,
    managerNames,
    auctionStarted,
    auctionEnded,
    auctionSets,
    currentSetIndex,
    currentSetPlayerIndex,
    currentBid,
    currentBidderIndex,
    isAcceleratedRound,
    auctionLog,
    activeRosterPreset,
  ]);

  // Advance to next player or next set
  const advanceToNext = useCallback(() => {
    if (!currentSet) return;

    const nextPlayerIdx = currentSetPlayerIndex + 1;
    setActiveBiddingWar(null);
    setTacticalInsight(null);
    if (nextPlayerIdx < currentSet.players.length) {
      setCurrentSetPlayerIndex(nextPlayerIdx);
      const nextPlayer = currentSet.players[nextPlayerIdx];
      setCurrentBid(nextPlayer.basePrice);
      setCurrentBidderIndex(null);
      setLastBidders([]);
      setPassedTeams([]);
      resetTimer();
    } else {
      // Completed the current set!
      const nextSetIdx = currentSetIndex + 1;
      if (nextSetIdx < auctionSets.length) {
        setSetCompletedModalData({
          completedSet: currentSet,
          nextSet: auctionSets[nextSetIdx],
        });
      } else {
        // All regular sets concluded! Check for unsold players
        setAuctionLog((latestLog) => {
          const unsolds = latestLog.filter((p) => p.soldTo === "Unsold");
          if (unsolds.length > 0 && !isAcceleratedRound) {
            setShowAcceleratedModal(true);
          } else {
            setAuctionEnded(true);
          }
          return latestLog;
        });
      }
    }
  }, [currentSet, currentSetPlayerIndex, currentSetIndex, auctionSets, isAcceleratedRound, resetTimer]);

  // Finalize player sale (either to winning team or RTM team)
  const finalizeSale = useCallback((winnerTeam, soldAmount, isRTM = false, rtmTeam = null) => {
    if (!currentPlayer) return;

    const buyer = isRTM ? rtmTeam : winnerTeam;

    if (buyer) {
      audioEngine.playGavelStrike(1.0);
      audioEngine.announceSold(currentPlayer.name, buyer.name, soldAmount, isRTM);
      if (soldAmount >= 10.0 || (currentPlayer.rating && currentPlayer.rating >= 88)) {
        audioEngine.playApplause();
      }
      setIsSoldAnimation(true);
      setLastSoldEvent({
        player: currentPlayer,
        team: buyer,
        price: soldAmount,
      });
      setTimeout(() => setIsSoldAnimation(false), 2200);

      setTeams((prevTeams) =>
        prevTeams.map((t) => {
          if (t.id === buyer.id) {
            const updatedRTM = isRTM ? Math.max(0, t.rtmCount - 1) : t.rtmCount;
            return {
              ...t,
              players: [...t.players, { ...currentPlayer, bidPrice: soldAmount, rtmWon: isRTM }],
              budget: parseFloat((t.budget - soldAmount).toFixed(2)),
              rtmCount: updatedRTM,
            };
          }
          return t;
        })
      );

      setAuctionLog((prev) => [
        ...prev.filter((p) => p.id !== currentPlayer.id),
        {
          id: currentPlayer.id,
          name: currentPlayer.name,
          basePrice: currentPlayer.basePrice,
          soldPrice: soldAmount,
          soldTo: buyer.name + (isRTM ? " (via RTM)" : ""),
          role: currentPlayer.role,
          image: currentPlayer.image,
          status: "Sold",
        },
      ]);

      triggerBidToast(
        `🔨 ${currentPlayer.name} SOLD to ${buyer.name} for ₹${soldAmount.toFixed(2)}Cr${isRTM ? " (RTM)" : ""}!`,
        buyer.id,
        "success"
      );
    } else {
      // Unsold
      audioEngine.playUnsoldBuzzer();
      audioEngine.announceUnsold(currentPlayer.name);
      setIsSoldAnimation(true);
      setLastSoldEvent({
        player: currentPlayer,
        team: { name: "Unsold" },
        price: 0,
      });
      setTimeout(() => setIsSoldAnimation(false), 2200);

      setAuctionLog((prev) => [
        ...prev.filter((p) => p.id !== currentPlayer.id),
        {
          id: currentPlayer.id,
          name: currentPlayer.name,
          basePrice: currentPlayer.basePrice,
          soldPrice: 0,
          soldTo: "Unsold",
          role: currentPlayer.role,
          image: currentPlayer.image,
          status: "Unsold",
        },
      ]);

      triggerBidToast(
        `❌ ${currentPlayer.name} remained UNSOLD!`,
        null,
        "warning"
      );
    }

    setRtmState(null);
    setActiveBiddingWar(null);
    advanceToNext();
  }, [currentPlayer, triggerBidToast, advanceToNext]);

  // Main Sell / Hammer Fall Handler
  const sellPlayer = useCallback(() => {
    if (!currentPlayer || rtmState) return;

    // Check if there is an active bidder
    if (currentBidderIndex === null) {
      finalizeSale(null, 0);
      return;
    }

    const winner = teams[currentBidderIndex];

    // Check RTM eligibility:
    // 1. Player has a previous team
    // 2. Previous team is NOT the winning bidder
    // 3. Previous team has rtmCount > 0
    // 4. Previous team can legally bid currentBid (purse & squad constraints)
    const prevTeamId = currentPlayer.previousTeamId;
    const prevTeam = prevTeamId ? teams.find((t) => t.id === prevTeamId) : null;

    const canPrevAfford = prevTeam ? canTeamBid(prevTeam, currentPlayer, currentBid).allowed : false;

    if (
      prevTeam &&
      prevTeam.id !== winner.id &&
      prevTeam.rtmCount > 0 &&
      canPrevAfford
    ) {
      // Trigger RTM workflow!
      const isPrevHuman = humanTeamIds.includes(prevTeam.id);
      const isWinnerHuman = humanTeamIds.includes(winner.id);

      if (isPrevHuman) {
        // Human holds RTM
        setRtmState({
          stage: "RTM_INQUIRY",
          player: currentPlayer,
          winningTeam: winner,
          prevTeam: prevTeam,
          currentBid,
          finalBid: currentBid,
        });
      } else {
        // AI holds RTM: AI evaluates whether to use RTM with role deficit & rivalry awareness
        const prevTeamNeeds = analyzeTeamNeeds(prevTeam);
        const rivalryAgainstWinner = getRivalryDetails(prevTeam.id, winner.id);
        const isCriticalRole =
          prevTeamNeeds.needs[currentPlayer.role]?.status === "CRITICAL" ||
          prevTeamNeeds.needs[currentPlayer.role]?.status === "URGENT";

        // AI is much more aggressive if player fulfills a critical deficit or winner is an arch-rival
        const wantsRTM =
          (currentPlayer.rating >= 78 || currentPlayer.basePrice >= 1.5 || isCriticalRole) &&
          prevTeam.players.length < MAX_SQUAD_SIZE &&
          prevTeam.budget >= currentBid + 3.0;

        if (wantsRTM) {
          audioEngine.playRTMAlert();
          audioEngine.announceRTM(prevTeam.name, currentPlayer.name);
          triggerBidToast(
            `⚡ ${prevTeam.name} has exercised their RIGHT TO MATCH on ${currentPlayer.name}!`,
            prevTeam.id,
            "warning"
          );

          // If winner is human, prompt human winner for final raise
          if (isWinnerHuman) {
            setRtmState({
              stage: "FINAL_RAISE",
              player: currentPlayer,
              winningTeam: winner,
              prevTeam: prevTeam,
              currentBid,
              finalBid: currentBid,
            });
          } else {
            // Winning AI decides final raise
            let raise = 0;
            if (
              (currentPlayer.rating >= 88 || rivalryAgainstWinner) &&
              winner.budget >= currentBid + 8.0
            ) {
              raise = Math.random() < 0.6 ? 1.0 : 0.5;
            }
            const finalBid = parseFloat((currentBid + raise).toFixed(2));
            if (raise > 0) {
              triggerBidToast(
                `${winner.name} made a final challenge raise to ₹${finalBid.toFixed(2)}Cr!`,
                winner.id
              );
            }

            // AI previous team decides to match (boosted if arch-rival clash)
            const matchWillingness =
              currentPlayer.rating >= 84 || isCriticalRole || rivalryAgainstWinner ? 0.85 : 0.55;
            const aiMatches = prevTeam.budget >= finalBid && Math.random() < matchWillingness;
            if (aiMatches) {
              finalizeSale(winner, finalBid, true, prevTeam);
            } else {
              finalizeSale(winner, finalBid, false, null);
            }
          }
        } else {
          // AI declines RTM
          finalizeSale(winner, currentBid, false, null);
        }
      }
    } else {
      // Normal sale (No RTM)
      finalizeSale(winner, currentBid, false, null);
    }
  }, [currentPlayer, rtmState, currentBidderIndex, teams, currentBid, humanTeamIds, triggerBidToast, finalizeSale]);

  // Timer Countdown Effect
  useEffect(() => {
    if (!auctionStarted || auctionEnded || !currentPlayer || showRetentionModal || rtmState) {
      return;
    }

    const interval = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          sellPlayer();
          return 0;
        }
        const nextTime = prev - 1;
        if (nextTime <= 3 && nextTime >= 1) {
          audioEngine.playClockTick(nextTime);
          if (currentBidderIndex !== null) {
            const leadingTeam = teams[currentBidderIndex];
            if (nextTime === 3) {
              audioEngine.announceGoingOnce(currentBid, leadingTeam?.name || "Leading franchise");
            } else if (nextTime === 2) {
              audioEngine.announceGoingTwice(currentBid, leadingTeam?.name || "Leading franchise");
            }
          }
        }
        return nextTime;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [auctionStarted, auctionEnded, currentPlayer, showRetentionModal, rtmState, sellPlayer, currentBid, currentBidderIndex, teams]);

  // AI Bidding Engine with Target-Aware Needs, Purse Pacing & Rivalry Bidding Wars
  useEffect(() => {
    if (!currentPlayer || auctionEnded || !auctionStarted || showRetentionModal || rtmState) {
      return;
    }

    // Dynamic tempo: faster counter-bidding during rivalry duels or intense bidding wars!
    let delay = isAcceleratedRound ? 1400 : 2600;
    if (activeBiddingWar && activeBiddingWar.rivalryInfo) {
      delay = isAcceleratedRound ? 1000 : 1700;
    } else if (activeBiddingWar) {
      delay = isAcceleratedRound ? 1200 : 2100;
    }

    const aiTimer = setTimeout(() => {
      const nextBid = parseFloat((currentBid + getIncrement(currentBid)).toFixed(2));
      const currentLeaderTeam = currentBidderIndex !== null ? teams[currentBidderIndex] : null;

      // Filter eligible AI teams using canTeamBid
      const eligibleTeams = teams
        .map((t, idx) => ({ team: t, idx }))
        .filter(({ team, idx }) => {
          if (idx === currentBidderIndex) return false; // Already highest bidder
          if (humanTeamIds.includes(team.id)) return false; // Exclude all human manager teams
          if (passedTeams.includes(team.id)) return false; // Passed

          // Strict rules check: squad < 25, overseas < 8, purse reserve for 18 players
          const check = canTeamBid(team, currentPlayer, nextBid);
          return check.allowed;
        });

      if (!eligibleTeams.length) return;

      // Target-Aware AI Evaluation: Score appetite, role deficits, purse pacing & rivalries
      const evaluations = eligibleTeams.map(({ team }) => {
        const evalResult = evaluateAIBid(
          team,
          currentPlayer,
          currentBid,
          nextBid,
          currentLeaderTeam
        );
        return { team, ...evalResult };
      });

      const willingTeams = evaluations.filter((e) => e.willBid);
      if (!willingTeams.length) return;

      // Sort by score descending (highest appetite bids first)
      willingTeams.sort((a, b) => b.score - a.score);
      const chosen = willingTeams[0];

      // Detect and escalate Bidding War / Rivalry Clash
      const prevLeader = currentLeaderTeam;
      if (prevLeader) {
        const rivalry = getRivalryDetails(prevLeader.id, chosen.team.id);
        const isSameDuel =
          (activeBiddingWar?.teamA?.id === prevLeader.id && activeBiddingWar?.teamB?.id === chosen.team.id) ||
          (activeBiddingWar?.teamA?.id === chosen.team.id && activeBiddingWar?.teamB?.id === prevLeader.id);
        const duelCount = isSameDuel ? activeBiddingWar.bidsCount + 1 : 2;

        let commentary = chosen.reason;
        if (rivalry) {
          commentary = `⚔️ ${rivalry.name}: ${chosen.team.shortName} counters arch-rival ${prevLeader.shortName} (Bid ₹${nextBid.toFixed(2)}Cr)!`;
        }

        setActiveBiddingWar({
          teamA: prevLeader,
          teamB: chosen.team,
          bidsCount: duelCount,
          rivalryInfo: rivalry,
          latestCommentary: commentary,
        });
      }

      setTacticalInsight(`${chosen.team.shortName}: ${chosen.reason}`);
      setCurrentBid(nextBid);
      setCurrentBidderIndex(chosen.team.id - 1);
      resetTimer();
      triggerBidToast(
        `${chosen.team.name} bids ₹${nextBid.toFixed(2)}Cr`,
        chosen.team.id
      );
      audioEngine.playBidSound(false, nextBid);
      audioEngine.announceBid(chosen.team.name, nextBid);
      if (prevLeader) {
        const rivalry = getRivalryDetails(prevLeader.id, chosen.team.id);
        const isSameDuel =
          (activeBiddingWar?.teamA?.id === prevLeader.id && activeBiddingWar?.teamB?.id === chosen.team.id) ||
          (activeBiddingWar?.teamA?.id === chosen.team.id && activeBiddingWar?.teamB?.id === prevLeader.id);
        const duelCount = isSameDuel ? activeBiddingWar.bidsCount + 1 : 2;
        if (rivalry && duelCount === 2) {
          audioEngine.playBiddingWarHorn();
          audioEngine.announceBiddingWar(prevLeader.name, chosen.team.name);
        }
      }
    }, delay);

    return () => clearTimeout(aiTimer);
  }, [
    currentBid,
    currentPlayer,
    teams,
    auctionEnded,
    auctionStarted,
    showRetentionModal,
    rtmState,
    currentBidderIndex,
    userTeamId,
    humanTeamIds,
    passedTeams,
    isAcceleratedRound,
    resetTimer,
    triggerBidToast,
    activeBiddingWar,
    lastBidders,
  ]);

  // Handle Multi-Manager / Single Team Manual Bid
  const handleTeamBid = (biddingTeamId) => {
    if (!biddingTeamId || !currentPlayer) return;
    const biddingTeam = teams.find((t) => t.id === biddingTeamId);
    if (!biddingTeam) return;

    const nextBid = parseFloat((currentBid + getIncrement(currentBid)).toFixed(2));
    const validation = canTeamBid(biddingTeam, currentPlayer, nextBid);

    if (!validation.allowed) {
      toast.warning(`${biddingTeam.shortName}: ${validation.reason}`);
      return;
    }

    const prevLeader = currentBidderIndex !== null ? teams[currentBidderIndex] : null;
    setCurrentBid(nextBid);
    setCurrentBidderIndex(biddingTeam.id - 1);
    setActiveHumanTeamId(biddingTeam.id);
    resetTimer();
    triggerBidToast(`${biddingTeam.name} bids ₹${nextBid.toFixed(2)}Cr`, biddingTeam.id, "success");
    audioEngine.playBidSound(true, nextBid);
    audioEngine.announceBid(biddingTeam.name, nextBid);

    // Check Bidding War escalation when human counters
    if (prevLeader && prevLeader.id !== biddingTeam.id) {
      const rivalry = getRivalryDetails(prevLeader.id, biddingTeam.id);
      const isSameDuel =
        (activeBiddingWar?.teamA?.id === prevLeader.id && activeBiddingWar?.teamB?.id === biddingTeam.id) ||
        (activeBiddingWar?.teamA?.id === biddingTeam.id && activeBiddingWar?.teamB?.id === prevLeader.id);
      const duelCount = isSameDuel ? activeBiddingWar.bidsCount + 1 : 2;

      let commentary = rivalry
        ? `⚔️ ${rivalry.name}: ${biddingTeam.shortName} challenges ${prevLeader.shortName} for ${currentPlayer.name}!`
        : `${biddingTeam.shortName} enters a bidding duel with ${prevLeader.shortName}!`;

      setActiveBiddingWar({
        teamA: prevLeader,
        teamB: biddingTeam,
        bidsCount: duelCount,
        rivalryInfo: rivalry,
        latestCommentary: commentary,
      });
      setTacticalInsight(commentary);

      if (rivalry && duelCount === 2) {
        audioEngine.playBiddingWarHorn();
        audioEngine.announceBiddingWar(prevLeader.name, biddingTeam.name);
      }
    }
  };

  const handleUserBid = () => {
    handleTeamBid(activeHumanTeamId || userTeamId);
  };

  // Handle Multi-Manager / Single Team Manual Pass
  const handleTeamPass = (passingTeamId) => {
    if (!passingTeamId) return;
    if (!passedTeams.includes(passingTeamId)) {
      setPassedTeams((prev) => [...prev, passingTeamId]);
      triggerBidToast(`${teams[passingTeamId - 1].name} passed!`, passingTeamId, "warning");
    }
  };

  const handleUserPass = () => {
    handleTeamPass(activeHumanTeamId || userTeamId);
  };

  // Drag and Drop reordering of squad
  const onDragEnd = (result) => {
    const { source, destination } = result;
    if (!destination) return;
    const teamId = parseInt(source.droppableId);
    const targetTeam = teams.find((t) => t.id === teamId);
    if (!targetTeam) return;

    const reordered = Array.from(targetTeam.players);
    const [removed] = reordered.splice(source.index, 1);
    reordered.splice(destination.index, 0, removed);

    setTeams((prev) =>
      prev.map((t) => (t.id === teamId ? { ...t, players: reordered } : t))
    );
  };

  // Export PDF Summary
  const exportPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text("IPL Mega Auction — Official Summary Sheet", 14, 20);
    doc.setFontSize(10);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 26);

    let y = 35;
    teams.forEach((t) => {
      if (y > 260) {
        doc.addPage();
        y = 20;
      }
      doc.setFontSize(13);
      doc.setTextColor(30, 30, 30);
      const spent = 120 - t.budget;
      doc.text(`${t.name} (Squad: ${t.players.length}/25 | Spent: ₹${spent.toFixed(2)}Cr | Left: ₹${t.budget.toFixed(2)}Cr)`, 14, y);
      y += 6;

      doc.setFontSize(9);
      doc.setTextColor(80, 80, 80);
      t.players.forEach((p) => {
        if (y > 275) {
          doc.addPage();
          y = 20;
        }
        doc.text(`• ${p.name} (${p.role}${p.nationality !== "Indian" ? ", Overseas" : ""}) — ₹${(p.bidPrice || 0).toFixed(2)}Cr${p.rtmWon ? " [RTM]" : p.retained ? " [Retained]" : ""}`, 18, y);
        y += 5;
      });
      y += 4;
    });

    doc.save("ipl-mega-auction-summary.pdf");
  };

  // Handler when a human manager confirms retention (supports multi-manager queue)
  const handleRetentionConfirm = (teamId, retainedIds, prices) => {
    // Record this human team's retentions
    pendingHumanRetentionsRef.current[teamId] = { retainedIds, prices };

    // If more human teams need to select retentions, step to the next one
    if (retentionQueue.length > 0) {
      const nextTeamId = retentionQueue[0];
      setRetentionQueue((prev) => prev.slice(1));
      setRetentionStepIndex((prev) => prev + 1);
      setUserTeamId(nextTeamId);
      setActiveHumanTeamId(nextTeamId);
      setShowRetentionModal(true);
      return;
    }

    // All human teams have confirmed retentions!
    const allHumanRetainedMap = pendingHumanRetentionsRef.current;
    const allRetainedIds = new Set();
    const initialLog = [];

    // 1. Process all human teams retentions
    humanTeamIds.forEach((hId) => {
      const data = allHumanRetainedMap[hId];
      if (!data) return;
      const prevTeam = normalizedPreviousPlayers.find((t) => t.teamId === hId);
      const eligible = prevTeam?.players || [];
      const userRetained = eligible.filter((p) => data.retainedIds.includes(p.id));
      userRetained.forEach((p) => {
        allRetainedIds.add(p.id);
        const cost = data.prices[p.id] || p.basePrice;
        initialLog.push({
          id: p.id,
          name: p.name,
          basePrice: cost,
          soldPrice: cost,
          soldTo: teams.find((t) => t.id === hId)?.name || "Retained",
          role: p.role,
          image: p.image,
          status: "Retained",
        });
      });
    });

    // 2. Generate authentic AI retentions for all remaining AI teams
    const aiRetentions = getAIRetentions(humanTeamIds, teams, previousPlayersData);
    Object.entries(aiRetentions).forEach(([tId, ai]) => {
      const tName = teams.find((t) => t.id === parseInt(tId))?.name || "AI Team";
      ai.players.forEach((p) => {
        allRetainedIds.add(p.id);
        initialLog.push({
          id: p.id,
          name: p.name,
          basePrice: p.bidPrice,
          soldPrice: p.bidPrice,
          soldTo: tName,
          role: p.role,
          image: p.image,
          status: "Retained",
        });
      });
    });

    // 3. Update all 10 teams with retentions, deducted budgets, and calculated RTMs
    setTeams((prevTeams) =>
      prevTeams.map((t) => {
        if (humanTeamIds.includes(t.id)) {
          const data = allHumanRetainedMap[t.id];
          if (!data) return t;
          const prevTeam = normalizedPreviousPlayers.find((pt) => pt.teamId === t.id);
          const eligible = prevTeam?.players || [];
          const userRetained = eligible.filter((p) => data.retainedIds.includes(p.id));
          const userCost = userRetained.reduce(
            (sum, p) => sum + (data.prices[p.id] || p.basePrice),
            0
          );
          return {
            ...t,
            players: userRetained.map((p) => ({
              ...p,
              bidPrice: data.prices[p.id] || p.basePrice,
              retained: true,
            })),
            budget: parseFloat((t.budget - userCost).toFixed(2)),
            rtmCount: Math.max(0, 6 - userRetained.length),
          };
        } else {
          const aiData = aiRetentions[t.id];
          if (!aiData) return t;
          return {
            ...t,
            players: aiData.players,
            budget: parseFloat((t.budget - aiData.totalCost).toFixed(2)),
            rtmCount: aiData.rtmCount,
          };
        }
      })
    );

    setAuctionLog(initialLog);

    // 4. Build categorized sets using activePlayerPool (supports custom & vintage rosters)
    const sets = buildAuctionSets(activePlayerPool, Array.from(allRetainedIds), prevMap);
    setAuctionSets(sets);
    setCurrentSetIndex(0);
    setCurrentSetPlayerIndex(0);

    const firstPlayer = sets[0]?.players[0];
    if (firstPlayer) {
      setCurrentBid(firstPlayer.basePrice);
    }

    setShowRetentionModal(false);
    setAuctionStarted(true);
    resetTimer();

    toast.success(
      `Auction Ready! ${sets.length} categorized sets assembled for ${humanTeamIds.length} manager(s). Marquee Set 1 is up first!`,
      { autoClose: 4000 }
    );
  };

  // Solo Team Selection Handler
  const handleSelectSoloTeam = (teamId) => {
    setUserTeamId(teamId);
    setHumanTeamIds([teamId]);
    setActiveHumanTeamId(teamId);
    setRetentionQueue([]);
    setRetentionStepIndex(1);
    setTotalRetentionSteps(1);
    pendingHumanRetentionsRef.current = {};
    setShowRetentionModal(true);
  };

  // Multiplayer Teams Selection Handler
  const handleSelectMultiplayerTeams = (selectedIds) => {
    if (!selectedIds || selectedIds.length === 0) return;
    const firstId = selectedIds[0];
    setUserTeamId(firstId);
    setHumanTeamIds(selectedIds);
    setActiveHumanTeamId(firstId);
    setRetentionQueue(selectedIds.slice(1));
    setRetentionStepIndex(1);
    setTotalRetentionSteps(selectedIds.length);
    pendingHumanRetentionsRef.current = {};
    setShowRetentionModal(true);
  };

  // Roster Preset and Custom Player Handlers
  const handleSelectPreset = (presetKey) => {
    setActiveRosterPreset(presetKey);
    let newPool = playersData;
    if (presetKey === "2008_vintage") {
      newPool = VINTAGE_2008_ROSTER;
    } else if (presetKey === "legends") {
      newPool = ALL_TIME_LEGENDS_ROSTER;
    }
    setActivePlayerPool(newPool);

    if (auctionStarted) {
      const signedIds = new Set();
      teams.forEach((t) => t.players.forEach((p) => signedIds.add(p.id)));
      const sets = buildAuctionSets(newPool, Array.from(signedIds), prevMap);
      setAuctionSets(sets);
      setCurrentSetIndex(0);
      setCurrentSetPlayerIndex(0);
      if (sets[0]?.players[0]) {
        setCurrentBid(sets[0].players[0].basePrice);
        resetTimer();
      }
    }
    toast.success(`Active roster preset switched to ${presetKey.replace("_", " ").toUpperCase()}!`);
  };

  const handleSavePlayers = (updatedPool) => {
    setActivePlayerPool(updatedPool);
    if (auctionStarted) {
      const signedIds = new Set();
      teams.forEach((t) => t.players.forEach((p) => signedIds.add(p.id)));
      const sets = buildAuctionSets(updatedPool, Array.from(signedIds), prevMap);
      setAuctionSets(sets);
    }
    toast.success(`Player database updated (${updatedPool.length} players in pool)!`);
  };

  // LocalStorage Checkpoint Recovery Handlers
  const handleResumeSession = () => {
    const saved = loadSavedState();
    if (!saved) return;
    setTeams(saved.teams);
    setUserTeamId(saved.userTeamId);
    setHumanTeamIds(saved.humanTeamIds || (saved.userTeamId ? [saved.userTeamId] : [1]));
    setActiveHumanTeamId(saved.activeHumanTeamId || saved.userTeamId || 1);
    setManagerNames(saved.managerNames || {});
    setAuctionSets(saved.auctionSets);
    setCurrentSetIndex(saved.currentSetIndex || 0);
    setCurrentSetPlayerIndex(saved.currentSetPlayerIndex || 0);
    setCurrentBid(saved.currentBid || 2.0);
    setCurrentBidderIndex(saved.currentBidderIndex);
    setIsAcceleratedRound(saved.isAcceleratedRound || false);
    setAuctionLog(saved.auctionLog || []);
    if (saved.activeRosterPreset) setActiveRosterPreset(saved.activeRosterPreset);
    setShowStarterPage(false);
    setAuctionStarted(true);
    setAuctionEnded(saved.auctionEnded || false);
    setShowRecoveryBanner(false);
    resetTimer();
    toast.success("📂 Saved auction checkpoint restored successfully!");
  };

  const handleDiscardSession = () => {
    clearSavedState();
    setShowRecoveryBanner(false);
    toast.info("Saved checkpoint discarded. Starting fresh auction.");
  };

  const handleManualSave = () => {
    const success = saveAuctionState({
      teams,
      userTeamId,
      humanTeamIds,
      activeHumanTeamId,
      managerNames,
      auctionStarted,
      auctionEnded,
      auctionSets,
      currentSetIndex,
      currentSetPlayerIndex,
      currentBid,
      currentBidderIndex,
      isAcceleratedRound,
      auctionLog,
      activeRosterPreset,
    });
    if (success) {
      toast.success("💾 Auction checkpoint saved to local storage!");
    } else {
      toast.error("Failed to save checkpoint to local storage.");
    }
  };

  const handleResetAuction = () => {
    if (window.confirm("Are you sure you want to reset the entire auction and start clean?")) {
      clearSavedState();
      window.location.reload();
    }
  };

  // Launch Accelerated Round
  const handleStartAccelerated = (shortlistedPlayers) => {
    setShowAcceleratedModal(false);
    setIsAcceleratedRound(true);

    const acceleratedSet = {
      id: "SET_ACCELERATED",
      code: "ACC",
      name: "Accelerated Round (Unsold Recall)",
      description: "Recalled unsold players at 50% discount with rapid 5s countdown timer!",
      category: "Accelerated",
      players: shortlistedPlayers,
    };

    setAuctionSets((prev) => [...prev, acceleratedSet]);
    setCurrentSetIndex(auctionSets.length); // points to the new accelerated set
    setCurrentSetPlayerIndex(0);
    setCurrentBid(shortlistedPlayers[0].basePrice);
    setCurrentBidderIndex(null);
    setLastBidders([]);
    setPassedTeams([]);
    setTimer(5);

    toast.info("⚡ ACCELERATED ROUND INITIATED — 5-Second Rapid Timer Active!", {
      autoClose: 3500,
    });
  };

  // User / Active Human team object
  const activeHumanTeam =
    teams.find((t) => t.id === activeHumanTeamId) ||
    teams.find((t) => t.id === userTeamId) ||
    teams[0];
  const userTeam = activeHumanTeam;
  const userMaxBid = userTeam ? calculateMaxAllowedBid(userTeam) : 0;
  const nextUserBid = parseFloat((currentBid + getIncrement(currentBid)).toFixed(2));
  const userBidCheck =
    userTeam && currentPlayer
      ? canTeamBid(userTeam, currentPlayer, nextUserBid)
      : { allowed: false, reason: "Waiting" };

  // Starter Welcome Page View
  if (showStarterPage && !auctionStarted) {
    return (
      <>
        <StarterPage
          onStartSolo={() => {
            setTeamSelectionInitialMode("solo");
            setShowStarterPage(false);
          }}
          onStartMultiplayer={() => {
            setTeamSelectionInitialMode("multiplayer");
            setShowStarterPage(false);
          }}
          onOpenRosterStudio={() => setShowPlayerEditorModal(true)}
          activeRosterPreset={activeRosterPreset}
          hasSavedSession={hasSavedState()}
          onResumeSession={handleResumeSession}
        />

        {/* Phase 5: Custom Rosters & Database Studio Modal */}
        <PlayerEditorModal
          isOpen={showPlayerEditorModal}
          onClose={() => setShowPlayerEditorModal(false)}
          allPlayers={activePlayerPool}
          onSavePlayers={handleSavePlayers}
          activeRosterPreset={activeRosterPreset}
          onSelectPreset={handleSelectPreset}
        />

        <ToastContainer position="top-center" newestOnTop limit={4} />
      </>
    );
  }

  return (
    <div className="flex flex-col items-center min-h-screen bg-gray-950 text-white p-3 md:p-6 relative">
      {/* Phase 5: LocalStorage Recovery Banner */}
      {showRecoveryBanner && (
        <div className="w-full max-w-7xl mb-4 bg-gradient-to-r from-blue-950 via-indigo-950 to-purple-950 border-2 border-indigo-400 p-4 rounded-2xl shadow-2xl flex flex-wrap items-center justify-between gap-3 text-white animate-fadeIn">
          <div className="flex items-center gap-3">
            <span className="text-2xl">📂</span>
            <div>
              <h4 className="font-extrabold text-sm md:text-base text-yellow-300">
                Saved Auction Progress Detected!
              </h4>
              <p className="text-xs text-gray-300">
                Would you like to resume your previously saved auction session or discard and start fresh?
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleResumeSession}
              className="px-4 py-2 bg-green-500 hover:bg-green-400 text-black font-extrabold text-xs rounded-xl shadow-lg transition-all"
            >
              ▶ Resume Saved Auction
            </button>
            <button
              onClick={handleDiscardSession}
              className="px-3 py-2 bg-gray-800 hover:bg-red-900/60 border border-gray-700 text-gray-300 hover:text-red-200 font-bold text-xs rounded-xl transition-all"
            >
              ✕ Discard & Start Fresh
            </button>
          </div>
        </div>
      )}

      {/* Top Header */}
      <header className="w-full max-w-7xl flex flex-wrap items-center justify-between gap-3 mb-6 pb-4 border-b border-gray-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-yellow-500 to-amber-600 flex items-center justify-center font-black text-black text-xl shadow-lg shadow-yellow-500/20">
            IPL
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-black text-white tracking-tight">
              Cricket Auction Simulator
            </h1>
            <p className="text-xs text-gray-400">
              Interactive Mega Auction with RTM Cards, AI Intelligence & Immersion
            </p>
          </div>
        </div>

        {/* User Franchise Status Badge */}
        {userTeam && (
          <div className="flex flex-wrap items-center gap-2">
            <div className="bg-gray-900 border border-gray-700 px-3 py-1.5 rounded-xl flex items-center gap-2 text-xs">
              <span className="text-gray-400">Active Paddle:</span>
              <span className="font-extrabold text-yellow-400">{userTeam.name}</span>
              {humanTeamIds.length > 1 && (
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-bold border border-indigo-400/40">
                  {humanTeamIds.length} Human Teams
                </span>
              )}
            </div>

            <div className="bg-gray-900 border border-gray-700 px-3 py-1.5 rounded-xl flex items-center gap-2 text-xs">
              <span className="text-gray-400">Purse:</span>
              <span className="font-extrabold text-green-400">₹{userTeam.budget.toFixed(2)}Cr</span>
            </div>

            <div className="bg-yellow-500/20 border border-yellow-400/60 px-3 py-1.5 rounded-xl flex items-center gap-1.5 text-xs text-yellow-300 font-bold">
              <span>⚡ RTMs:</span>
              <span className="font-black text-white">{userTeam.rtmCount}</span>
            </div>

            <button
              onClick={() => setShowMultiplayerModal(true)}
              className="px-3 py-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-1.5"
              title="Pass-and-Play & Multiplayer Franchises"
            >
              <span>👥 Multi-Manager</span>
              {humanTeamIds.length > 1 && (
                <span className="bg-yellow-400 text-black px-1.5 py-0.2 rounded-full font-black text-[10px]">
                  {humanTeamIds.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setShowPlayerEditorModal(true)}
              className="px-3 py-1.5 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-1.5"
              title="Custom Rosters & Database Studio"
            >
              <span>✏️ Roster Studio</span>
            </button>

            <button
              onClick={() => setShowSetsModal(true)}
              className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-1.5"
            >
              📋 Sets
            </button>

            <button
              onClick={() => {
                setSelectedNeedsTeamId(activeHumanTeamId || userTeamId || 1);
                setShowTeamNeedsModal(true);
              }}
              className="px-3 py-1.5 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-1.5"
            >
              🎯 Needs & Intel
            </button>

            <button
              onClick={() => {
                setSelectedXITeamId(activeHumanTeamId || userTeamId || 1);
                setShowPlayingXIModal(true);
              }}
              className="px-3 py-1.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-1.5"
            >
              🏏 Playing XI
            </button>

            <button
              onClick={() => {
                setInitialTournamentTeamId(activeHumanTeamId || userTeamId || 1);
                setShowTournamentModal(true);
              }}
              className="px-3 py-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-1.5"
            >
              🏆 Match Simulator
            </button>

            <button
              onClick={() => setShowAudioSettingsModal(true)}
              className="px-3 py-1.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-1.5"
              title="Audio & Sound FX Settings"
            >
              🎙️ Audio FX
            </button>

            <button
              onClick={handleManualSave}
              className="px-2.5 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-200 border border-gray-700 rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-1"
              title="Save Auction Checkpoint"
            >
              <span>💾 Save</span>
            </button>

            <button
              onClick={handleResetAuction}
              className="px-2.5 py-1.5 bg-gray-800 hover:bg-red-900/60 border border-gray-700 hover:border-red-600 text-gray-400 hover:text-red-200 rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-1"
              title="Reset Auction"
            >
              <span>🔄 Reset</span>
            </button>
          </div>
        )}
      </header>

      {/* Team Selection Step (Phase 5 Enhanced) */}
      {!userTeamId && (
        <TeamSelectionModal
          teams={teams}
          initialMode={teamSelectionInitialMode}
          onBackToStarter={() => setShowStarterPage(true)}
          onSelectSoloTeam={handleSelectSoloTeam}
          onSelectMultiplayerTeams={handleSelectMultiplayerTeams}
          onOpenRosterStudio={() => setShowPlayerEditorModal(true)}
          activeRosterPreset={activeRosterPreset}
        />
      )}

      {/* Pre-Auction Retention Step (Phase 5 Multi-Manager Queue Support) */}
      {showRetentionModal && userTeamId && (
        <RetentionModal
          isOpen={showRetentionModal}
          team={teams.find((t) => t.id === userTeamId)}
          eligiblePlayers={eligibleRetentions}
          onConfirm={handleRetentionConfirm}
          stepIndex={retentionStepIndex}
          totalSteps={totalRetentionSteps}
        />
      )}

      {/* Active Auction Arena */}
      {auctionStarted && !auctionEnded && (
        <main className="w-full max-w-7xl flex flex-col items-center">
          {/* Active Set Banner */}
          {currentSet && (
            <div className="w-full mb-6 bg-gradient-to-r from-gray-900 via-indigo-950/60 to-gray-900 border border-indigo-500/50 rounded-2xl p-3 md:p-4 flex flex-wrap items-center justify-between gap-3 shadow-xl">
              <div className="flex items-center gap-3">
                <span className="px-2.5 py-1 bg-yellow-400 text-black text-xs font-black rounded-lg uppercase">
                  {currentSet.code}
                </span>
                <div>
                  <h3 className="font-extrabold text-base md:text-lg text-white">
                    {currentSet.name}
                  </h3>
                  <p className="text-xs text-gray-400">
                    {currentSet.description}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 text-xs">
                <span className="px-3 py-1 rounded-full bg-gray-800 text-gray-300 font-mono">
                  Player {currentSetPlayerIndex + 1} of {currentSet.players.length} in Set
                </span>
                {isAcceleratedRound && (
                  <span className="px-3 py-1 rounded-full bg-amber-500/20 border border-amber-400 text-amber-300 font-black animate-pulse">
                    ⚡ Accelerated Round
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Active Bidding War / Rivalry Duel Banner */}
          {activeBiddingWar && (
            <BiddingWarBanner
              activeRivalry={activeBiddingWar.rivalryInfo}
              teamA={activeBiddingWar.teamA}
              teamB={activeBiddingWar.teamB}
              bidsCount={activeBiddingWar.bidsCount}
              latestCommentary={activeBiddingWar.latestCommentary}
            />
          )}

          {/* Player Showcase Card */}
          <PlayerCard
            player={currentPlayer}
            currentBid={currentBid}
            currentBidderTeam={currentBidderTeam}
            timer={timer}
            isAccelerated={isAcceleratedRound}
            onClick={() => setShowPlayerStats(currentPlayer)}
          />

          {/* Tactical Intelligence Wire */}
          {tacticalInsight && (
            <div className="w-full max-w-2xl -mt-5 mb-6 bg-gray-900/95 border border-purple-500/40 rounded-2xl px-4 py-2 text-xs flex items-center gap-2 text-purple-200 shadow-xl shadow-purple-950/20">
              <span className="text-purple-400 font-bold shrink-0 flex items-center gap-1">
                <span>🧠 AI Scouting Wire:</span>
              </span>
              <span className="truncate">{tacticalInsight}</span>
            </div>
          )}

          {/* Phase 4: Gavel Podium with Tension Indicators, Hardwood Hammer & Audio Controls */}
          <GavelPodium
            timer={timer}
            isAuctionActive={auctionStarted && !auctionEnded && !!currentPlayer}
            isSold={isSoldAnimation}
            soldPlayer={lastSoldEvent?.player}
            soldTeam={lastSoldEvent?.team}
            soldPrice={lastSoldEvent?.price}
            onManualHammer={sellPlayer}
            onOpenAudioSettings={() => setShowAudioSettingsModal(true)}
            currentBid={currentBid}
            currentBidderTeam={currentBidderTeam}
          />

          {/* User Bidding Control Bar */}
          <div className="w-full max-w-2xl bg-gray-900/90 border border-gray-800 rounded-2xl p-4 shadow-2xl mb-8 flex flex-col gap-3">
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs border-b border-gray-800 pb-2">
              <span className="text-gray-400">
                Next Bid Increment: <span className="font-bold text-yellow-400">+₹{getIncrement(currentBid).toFixed(2)}Cr</span>
              </span>
              <span className="text-gray-400">
                {userTeam?.shortName} Max Allowable Bid: <span className="font-bold text-green-400">₹{userMaxBid.toFixed(2)}Cr</span>
              </span>
            </div>

            {/* Phase 5: Active Paddle Selector in Multiplayer */}
            {humanTeamIds.length > 1 && (
              <div className="flex flex-wrap items-center gap-2 p-2 bg-gray-950/70 rounded-xl border border-gray-800">
                <span className="text-[11px] text-gray-400 font-bold">Active Paddle:</span>
                {humanTeamIds.map((hId) => {
                  const hTeam = teams.find((t) => t.id === hId);
                  if (!hTeam) return null;
                  const isSelected = activeHumanTeamId === hId;
                  const isLeading = currentBidderIndex === hId - 1;
                  const hasPassed = passedTeams.includes(hId);

                  return (
                    <button
                      key={hId}
                      onClick={() => setActiveHumanTeamId(hId)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-extrabold transition-all flex items-center gap-1.5 ${
                        isSelected
                          ? "bg-yellow-400 text-black shadow-md shadow-yellow-500/30 ring-2 ring-yellow-400"
                          : "bg-gray-800 hover:bg-gray-700 text-gray-300"
                      } ${hasPassed ? "opacity-40" : ""}`}
                    >
                      <span>{hTeam.shortName}</span>
                      {managerNames[hId] && (
                        <span className="font-normal text-[10px]">({managerNames[hId]})</span>
                      )}
                      {isLeading && <span className="text-[10px] text-green-600 font-black">★</span>}
                    </button>
                  );
                })}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <button
                onClick={handleUserBid}
                disabled={!userBidCheck.allowed || currentBidderIndex === userTeam.id - 1}
                className={`py-3 px-4 rounded-xl font-black text-sm flex flex-col items-center justify-center transition-all shadow-lg ${
                  userBidCheck.allowed && currentBidderIndex !== userTeam.id - 1
                    ? "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-blue-600/30 active:scale-95"
                    : "bg-gray-800 text-gray-500 cursor-not-allowed border border-gray-800"
                }`}
              >
                <span>
                  {userTeam.shortName} Bid ₹{nextUserBid.toFixed(2)}Cr
                </span>
                {!userBidCheck.allowed && (
                  <span className="text-[10px] font-normal text-red-400 truncate max-w-full">
                    {userBidCheck.reason}
                  </span>
                )}
                {currentBidderIndex === userTeam.id - 1 && (
                  <span className="text-[10px] font-normal text-green-400">
                    {userTeam.shortName} holds highest bid!
                  </span>
                )}
              </button>

              <button
                onClick={handleUserPass}
                disabled={passedTeams.includes(userTeam.id)}
                className={`py-3 px-4 rounded-xl font-bold text-sm transition-all border ${
                  passedTeams.includes(userTeam.id)
                    ? "bg-gray-800 text-gray-600 border-gray-800 cursor-not-allowed"
                    : "bg-red-950/40 hover:bg-red-900 border-red-800 text-red-300"
                }`}
              >
                {passedTeams.includes(userTeam.id) ? `${userTeam.shortName} Passed` : `Pass ${userTeam.shortName}`}
              </button>

              <button
                onClick={sellPlayer}
                className="py-3 px-4 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 text-white font-black text-sm rounded-xl shadow-lg shadow-green-600/20 active:scale-95 transition-all"
              >
                🔨 Hammer / Sold
              </button>
            </div>

            {/* Phase 5: Multi-Manager Direct Paddles Grid */}
            {humanTeamIds.length > 1 && (
              <div className="pt-2 border-t border-gray-800">
                <p className="text-[11px] text-gray-400 mb-2 font-bold flex items-center justify-between">
                  <span>⚡ Multi-Manager Direct Paddles:</span>
                  <span className="text-gray-500 font-normal text-[10px]">Click your franchise button to bid</span>
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
                  {humanTeamIds.map((hId) => {
                    const hTeam = teams.find((t) => t.id === hId);
                    if (!hTeam) return null;
                    const check = canTeamBid(hTeam, currentPlayer, nextUserBid);
                    const isLeading = currentBidderIndex === hId - 1;
                    const hasPassed = passedTeams.includes(hId);

                    return (
                      <div key={hId} className="flex flex-col gap-1">
                        <button
                          onClick={() => handleTeamBid(hId)}
                          disabled={!check.allowed || isLeading || hasPassed}
                          className={`p-2 rounded-xl text-xs font-black transition-all flex flex-col items-center justify-center border ${
                            isLeading
                              ? "bg-green-950/80 border-green-500 text-green-300 animate-pulse"
                              : hasPassed
                              ? "bg-gray-900 border-gray-800 text-gray-600 cursor-not-allowed"
                              : check.allowed
                              ? `${hTeam.color} bg-gray-800 hover:bg-gray-700 text-white shadow-md active:scale-95`
                              : "bg-gray-900 border-gray-800 text-gray-500 cursor-not-allowed"
                          }`}
                        >
                          <div className="flex items-center justify-between w-full">
                            <span>{hTeam.shortName}</span>
                            <span className="text-[10px] text-yellow-400">+₹{getIncrement(currentBid).toFixed(2)}Cr</span>
                          </div>
                          <span className="text-[10px] font-normal text-gray-400">
                            Purse: ₹{hTeam.budget.toFixed(1)}Cr
                          </span>
                          {isLeading && <span className="text-[9px] text-green-400 font-bold">Leading!</span>}
                          {!check.allowed && !isLeading && !hasPassed && (
                            <span className="text-[9px] text-red-400 truncate max-w-full">
                              {check.reason}
                            </span>
                          )}
                        </button>
                        {!hasPassed && (
                          <button
                            onClick={() => handleTeamPass(hId)}
                            className="text-[10px] text-red-400 hover:text-red-300 text-center underline cursor-pointer"
                          >
                            Pass
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* 10 IPL Franchises Overview Grid */}
          <section className="w-full mt-2">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <span>Franchise Dashboards</span>
                  <span className="text-xs px-2 py-0.5 rounded bg-gray-800 text-gray-400 font-mono">10 Teams</span>
                </h2>
                <span className="text-xs text-gray-400 hidden sm:inline">
                  (Min 18 • Max 25 • Max 8 Overseas)
                </span>
              </div>
              <button
                onClick={() => {
                  setSelectedNeedsTeamId(userTeamId || 1);
                  setShowTeamNeedsModal(true);
                }}
                className="px-3 py-1.5 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-400/60 text-amber-300 text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5"
              >
                <span>🎯 View Needs Matrix & AI Strategy</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3.5">
              {teams.map((t) => {
                const isUser = t.id === userTeamId;
                const isLeading = currentBidderIndex === t.id - 1;
                const isRecent = lastBidders.includes(t.id);
                const overseasCount = t.players.filter(
                  (p) => p.nationality && p.nationality.toLowerCase().trim() !== "indian"
                ).length;
                const maxBid = calculateMaxAllowedBid(t);
                const budgetPercent = (t.budget / 120) * 100;
                const squadSize = t.players.length;

                return (
                  <div
                    key={t.id}
                    onClick={() => setShowRosterModal(t.id)}
                    className={`p-3.5 rounded-2xl border-2 transition-all cursor-pointer relative flex flex-col justify-between select-none ${
                      t.color
                    } ${
                      isLeading
                        ? "bg-green-950/40 ring-4 ring-green-500 animate-pulse shadow-xl"
                        : isRecent
                        ? "bg-yellow-950/30 ring-2 ring-yellow-400"
                        : "bg-gray-900/80 hover:bg-gray-800"
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="font-extrabold text-sm text-white truncate pr-1">
                          {t.name}
                        </span>
                        {isUser && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-yellow-400 text-black font-black shrink-0">
                            YOU
                          </span>
                        )}
                      </div>

                      {/* Purse display */}
                      <div className="flex items-baseline justify-between mb-1">
                        <span className="text-xs text-gray-400">Purse Left</span>
                        <span className="text-base font-black text-green-400">
                          ₹{t.budget.toFixed(2)}Cr
                        </span>
                      </div>

                      {/* Budget Gauge */}
                      <div className="w-full bg-gray-800 h-1.5 rounded-full overflow-hidden mb-2">
                        <div
                          className="bg-green-500 h-full transition-all"
                          style={{ width: `${Math.max(0, Math.min(100, budgetPercent))}%` }}
                        />
                      </div>

                      {/* Strategic Archetype & Action Buttons */}
                      <div className="flex items-center justify-between mb-2 text-[10px]">
                        <span className="px-2 py-0.5 rounded bg-purple-950/60 border border-purple-500/40 text-purple-300 font-semibold truncate max-w-[100px]">
                          {FRANCHISE_PERSONAS[t.id]?.archetype || "Balanced"}
                        </span>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedXITeamId(t.id);
                              setShowPlayingXIModal(true);
                            }}
                            className="text-cyan-400 hover:text-cyan-300 font-bold underline cursor-pointer"
                          >
                            🏏 XI
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedNeedsTeamId(t.id);
                              setShowTeamNeedsModal(true);
                            }}
                            className="text-amber-400 hover:text-amber-300 font-bold underline cursor-pointer"
                          >
                            🎯 Needs
                          </button>
                        </div>
                      </div>

                      {/* Badges: Squad, Overseas, RTM */}
                      <div className="grid grid-cols-2 gap-1.5 text-[11px] mb-2">
                        <div
                          className={`px-2 py-1 rounded-lg border text-center font-bold ${
                            squadSize < MIN_SQUAD_SIZE
                              ? "bg-amber-950/50 border-amber-600/50 text-amber-300"
                              : squadSize >= MAX_SQUAD_SIZE
                              ? "bg-red-950/50 border-red-600/50 text-red-300"
                              : "bg-emerald-950/50 border-emerald-600/50 text-emerald-300"
                          }`}
                        >
                          Squad: {squadSize}/{MIN_SQUAD_SIZE}
                        </div>

                        <div
                          className={`px-2 py-1 rounded-lg border text-center font-bold ${
                            overseasCount >= MAX_OVERSEAS_PLAYERS
                              ? "bg-red-950/50 border-red-600/50 text-red-300"
                              : "bg-blue-950/50 border-blue-600/50 text-blue-300"
                          }`}
                        >
                          ✈ {overseasCount}/{MAX_OVERSEAS_PLAYERS}
                        </div>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-gray-800 flex items-center justify-between text-[11px]">
                      <span className="text-yellow-400 font-bold">
                        ⚡ {t.rtmCount} RTM
                      </span>
                      <span className="text-gray-400 font-mono text-[10px]">
                        Max: ₹{maxBid.toFixed(2)}Cr
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Auction Sheet / History */}
          <section className="w-full mt-10 bg-gray-900 border border-gray-800 p-5 rounded-3xl shadow-xl overflow-x-auto">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
              <div>
                <h3 className="text-xl font-bold text-white">Live Auction Ledger</h3>
                <p className="text-xs text-gray-400">Real-time ledger of retentions, bids & sales</p>
              </div>
              <button
                onClick={exportPDF}
                className="px-4 py-2 bg-yellow-500 hover:bg-yellow-400 text-black font-extrabold rounded-xl text-xs transition-all shadow-md"
              >
                📄 Download Summary PDF
              </button>
            </div>

            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="bg-gray-800 text-gray-400 text-xs uppercase">
                  <th className="p-2.5 rounded-l-lg">Player</th>
                  <th className="p-2.5">Role</th>
                  <th className="p-2.5">Base Price</th>
                  <th className="p-2.5">Sold Price</th>
                  <th className="p-2.5 rounded-r-lg">Sold To / Outcome</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/80">
                {auctionLog.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-800/40 transition-colors">
                    <td className="p-2.5 flex items-center gap-2">
                      <img
                        src={log.image || FALLBACK_IMAGE}
                        alt={log.name}
                        className="w-7 h-7 rounded-full object-cover border border-gray-600"
                      />
                      <span className="font-semibold text-white">{log.name}</span>
                    </td>
                    <td className="p-2.5 text-xs text-gray-300">{log.role}</td>
                    <td className="p-2.5 text-xs text-gray-400 font-mono">
                      ₹{log.basePrice.toFixed(2)}Cr
                    </td>
                    <td className="p-2.5 text-xs font-bold font-mono text-green-400">
                      ₹{log.soldPrice.toFixed(2)}Cr
                    </td>
                    <td className="p-2.5">
                      <span
                        className={`text-xs px-2.5 py-1 rounded-full font-semibold border ${
                          log.soldTo === "Unsold"
                            ? "bg-red-950/60 border-red-800 text-red-300"
                            : log.status === "Retained"
                            ? "bg-yellow-950/60 border-yellow-700 text-yellow-300"
                            : "bg-green-950/60 border-green-800 text-green-300"
                        }`}
                      >
                        {log.soldTo}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        </main>
      )}

      {/* Auction Concluded Screen */}
      {auctionEnded && (
        <div className="w-full max-w-5xl text-center py-10">
          <div className="inline-block px-4 py-1.5 bg-green-500/20 border border-green-500 rounded-full text-green-400 font-black text-sm uppercase tracking-widest mb-3">
            🏆 Mega Auction Concluded
          </div>
          <h2 className="text-4xl font-black text-white mb-2">
            IPL Mega Auction Complete!
          </h2>
          <p className="text-gray-400 text-sm mb-6 max-w-lg mx-auto">
            All sets and accelerated rounds have concluded. All 10 franchises have built their squads.
          </p>

          <div className="flex flex-wrap justify-center gap-3 mb-8">
            <button
              onClick={() => {
                setSelectedXITeamId(userTeamId || 1);
                setShowPlayingXIModal(true);
              }}
              className="px-6 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-black rounded-xl shadow-lg shadow-blue-500/20 transition-all text-sm flex items-center gap-2"
            >
              🏏 Build Playing XI & Chemistry
            </button>
            <button
              onClick={() => {
                setInitialTournamentTeamId(userTeamId || 1);
                setShowTournamentModal(true);
              }}
              className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black rounded-xl shadow-lg shadow-emerald-500/20 transition-all text-sm flex items-center gap-2"
            >
              🏆 Simulate IPL Season & Playoffs
            </button>
            <button
              onClick={exportPDF}
              className="px-6 py-3 bg-yellow-500 hover:bg-yellow-400 text-black font-black rounded-xl shadow-lg shadow-yellow-500/30 transition-all text-sm"
            >
              📄 Download Official Auction PDF Report
            </button>
            <button
              onClick={() => {
                clearSavedState();
                setShowStarterPage(true);
                setAuctionStarted(false);
                setAuctionEnded(false);
                setUserTeamId(null);
              }}
              className="px-6 py-3 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-black font-extrabold rounded-xl shadow-lg transition-all text-sm flex items-center gap-1.5"
            >
              🏠 Return to Starter Page
            </button>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-gray-800 hover:bg-gray-700 text-white font-bold rounded-xl border border-gray-700 transition-all text-sm"
            >
              ↺ Start New Auction Simulation
            </button>
          </div>

          {/* Roster overview after conclusion */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
            {teams.map((t) => (
              <div
                key={t.id}
                onClick={() => setShowRosterModal(t.id)}
                className={`p-4 rounded-2xl border-2 ${t.color} bg-gray-900 cursor-pointer hover:bg-gray-850`}
              >
                <div className="flex justify-between items-center mb-2">
                  <h4 className="font-bold text-white text-base">{t.name}</h4>
                  <span className="text-xs text-green-400 font-bold">
                    Left: ₹{t.budget.toFixed(2)}Cr
                  </span>
                </div>
                <p className="text-xs text-gray-400">
                  Total Players Signed: <span className="text-white font-bold">{t.players.length}</span> (
                  {t.players.filter((p) => p.nationality !== "Indian").length} Overseas)
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* RTM Modals */}
      {rtmState && rtmState.stage === "RTM_INQUIRY" && (
        <RTMInquiryModal
          player={rtmState.player}
          winningTeam={rtmState.winningTeam}
          winningBid={rtmState.currentBid}
          userTeam={rtmState.prevTeam}
          onAccept={() => {
            // User exercises RTM! Now winning bidder gets final raise chance
            if (rtmState.winningTeam.id === userTeamId) {
              // (Should not happen since winning team is not user team in inquiry)
            } else {
              // AI winning team decides whether to raise
              let aiRaise = 0;
              if (
                rtmState.player.rating >= 88 &&
                rtmState.winningTeam.budget >= rtmState.currentBid + 6.0
              ) {
                aiRaise = Math.random() < 0.6 ? 1.0 : 0.5;
              }
              const finalRaisedBid = parseFloat((rtmState.currentBid + aiRaise).toFixed(2));
              if (aiRaise > 0) {
                triggerBidToast(
                  `${rtmState.winningTeam.name} raised their challenge bid to ₹${finalRaisedBid.toFixed(2)}Cr!`,
                  rtmState.winningTeam.id
                );
              }
              setRtmState((prev) => ({
                ...prev,
                stage: "FINAL_DECISION",
                finalBid: finalRaisedBid,
              }));
            }
          }}
          onDecline={() => {
            // User declines RTM, sell to winning team
            finalizeSale(rtmState.winningTeam, rtmState.currentBid, false, null);
          }}
        />
      )}

      {rtmState && rtmState.stage === "FINAL_RAISE" && (
        <RTMFinalRaiseModal
          player={rtmState.player}
          rtmTeam={rtmState.prevTeam}
          currentBid={rtmState.currentBid}
          maxAllowedBid={userMaxBid}
          onConfirmFinalBid={(finalBidAmount) => {
            // User set final bid. Now AI RTM team decides whether to match
            const aiCanAfford = rtmState.prevTeam.budget >= finalBidAmount;
            const aiWantsToMatch =
              aiCanAfford &&
              (rtmState.player.rating >= 84 || Math.random() < 0.65);

            if (aiWantsToMatch) {
              finalizeSale(rtmState.winningTeam, finalBidAmount, true, rtmState.prevTeam);
            } else {
              finalizeSale(rtmState.winningTeam, finalBidAmount, false, null);
            }
          }}
        />
      )}

      {rtmState && rtmState.stage === "FINAL_DECISION" && (
        <RTMMatchDecisionModal
          player={rtmState.player}
          winningTeam={rtmState.winningTeam}
          finalBid={rtmState.finalBid}
          userTeam={rtmState.prevTeam}
          onMatch={() => {
            // User matches final bid!
            finalizeSale(rtmState.winningTeam, rtmState.finalBid, true, rtmState.prevTeam);
          }}
          onPass={() => {
            // User declines to match final bid
            finalizeSale(rtmState.winningTeam, rtmState.finalBid, false, null);
          }}
        />
      )}

      {/* Catalog & Sets Modal */}
      {showSetsModal && (
        <AuctionSetsModal
          sets={auctionSets}
          currentSetIndex={currentSetIndex}
          currentPlayerId={currentPlayer?.id}
          auctionLog={auctionLog}
          onClose={() => setShowSetsModal(false)}
        />
      )}

      {/* Set Completion Interstitial Modal */}
      {setCompletedModalData && (
        <SetCompletionModal
          completedSet={setCompletedModalData.completedSet}
          nextSet={setCompletedModalData.nextSet}
          auctionLog={auctionLog}
          onProceed={() => {
            const nextIdx = currentSetIndex + 1;
            setSetCompletedModalData(null);
            if (nextIdx < auctionSets.length) {
              setCurrentSetIndex(nextIdx);
              setCurrentSetPlayerIndex(0);
              const nextPlayer = auctionSets[nextIdx].players[0];
              setCurrentBid(nextPlayer.basePrice);
              setCurrentBidderIndex(null);
              setLastBidders([]);
              setPassedTeams([]);
              resetTimer();
            } else {
              // Regular sets finished! Check unsold players
              const unsolds = auctionLog.filter((p) => p.soldTo === "Unsold");
              if (unsolds.length > 0 && !isAcceleratedRound) {
                setShowAcceleratedModal(true);
              } else {
                setAuctionEnded(true);
              }
            }
          }}
        />
      )}

      {/* Accelerated Round Modal */}
      {showAcceleratedModal && (
        <AcceleratedRoundModal
          unsoldPlayers={auctionLog
            .filter((p) => p.soldTo === "Unsold")
            .map((p) => {
              const fullPlayer = playersData.find((orig) => orig.id === p.id);
              return {
                ...fullPlayer,
                ...p,
                basePrice: p.basePrice,
              };
            })}
          teams={teams}
          userTeamId={userTeamId}
          onStartAccelerated={handleStartAccelerated}
          onSkipToEnd={() => {
            setShowAcceleratedModal(false);
            setAuctionEnded(true);
          }}
        />
      )}

      {/* Team Needs & AI Intelligence Modal */}
      {showTeamNeedsModal && (
        <TeamNeedsModal
          isOpen={showTeamNeedsModal}
          onClose={() => setShowTeamNeedsModal(false)}
          teams={teams}
          userTeamId={userTeamId}
          initialTeamId={selectedNeedsTeamId}
          currentLeaderTeamId={currentBidderTeam?.id}
        />
      )}

      {/* Team Roster Modal */}
      {showRosterModal && (
        <TeamRosterModal
          team={teams.find((t) => t.id === showRosterModal)}
          onClose={() => setShowRosterModal(null)}
          onDragEnd={onDragEnd}
          onOpenPlayingXI={(teamId) => {
            setSelectedXITeamId(teamId);
            setShowPlayingXIModal(true);
          }}
        />
      )}

      {/* Playing XI & Squad Chemistry Modal */}
      {showPlayingXIModal && (
        <PlayingXIModal
          isOpen={showPlayingXIModal}
          onClose={() => setShowPlayingXIModal(false)}
          teams={teams}
          initialTeamId={selectedXITeamId}
          userTeamId={userTeamId}
          onOpenMatchSimulator={(teamId) => {
            setInitialTournamentTeamId(teamId);
            setShowTournamentModal(true);
          }}
        />
      )}

      {/* IPL Tournament & Match Simulator Modal */}
      {showTournamentModal && (
        <TournamentSimulatorModal
          isOpen={showTournamentModal}
          onClose={() => setShowTournamentModal(false)}
          teams={teams}
          userTeamId={userTeamId}
          initialMatchTeamId={initialTournamentTeamId}
        />
      )}

      {/* Player Stats Modal */}
      {showPlayerStats && (
        <PlayerStatsModal
          player={showPlayerStats}
          onClose={() => setShowPlayerStats(null)}
        />
      )}

      {/* Audio & Sound Settings Modal */}
      <AudioSettingsModal
        isOpen={showAudioSettingsModal}
        onClose={() => setShowAudioSettingsModal(false)}
      />

      {/* Phase 5: Multiplayer & Pass-and-Play Settings Modal */}
      <MultiplayerSettingsModal
        isOpen={showMultiplayerModal}
        onClose={() => setShowMultiplayerModal(false)}
        teams={teams}
        humanTeamIds={humanTeamIds}
        onUpdateHumanTeams={(newIds) => {
          setHumanTeamIds(newIds);
          if (!newIds.includes(activeHumanTeamId)) {
            setActiveHumanTeamId(newIds[0] || 1);
          }
          toast.info(`Updated: ${newIds.length} Human Franchise(s)`);
        }}
        managerNames={managerNames}
        onUpdateManagerName={(teamId, name) => {
          setManagerNames((prev) => ({ ...prev, [teamId]: name }));
        }}
        activePaddleTeamId={activeHumanTeamId}
        onChangeActivePaddle={(teamId) => {
          setActiveHumanTeamId(teamId);
          toast.info(`Active Paddle: ${teams.find((t) => t.id === teamId)?.name}`);
        }}
      />

      {/* Phase 5: Custom Rosters & Database Studio Modal */}
      <PlayerEditorModal
        isOpen={showPlayerEditorModal}
        onClose={() => setShowPlayerEditorModal(false)}
        allPlayers={activePlayerPool}
        onSavePlayers={handleSavePlayers}
        activeRosterPreset={activeRosterPreset}
        onSelectPreset={handleSelectPreset}
      />

      <ToastContainer position="top-center" newestOnTop limit={4} />
    </div>
  );
}
