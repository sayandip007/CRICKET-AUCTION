// src/components/AuctionControlCenter.jsx
import React, { useState, useRef, useEffect } from "react";
import { BROADCAST_THEMES } from "../utils/themeStyles";

export default function AuctionControlCenter({
  userTeam,
  humanTeamIds,
  currentSeason,
  socialFeedLength,
  activeRoomId,
  activeLeague,
  activeThemeKey,
  onSelectTheme,
  // Modal openers
  onOpenMultiManager,
  onOpenRosterStudio,
  onOpenSets,
  onOpenNeeds,
  onOpenPlayingXI,
  onOpenTournament,
  onOpenTrades,
  onOpenMiniAuction,
  onOpenH2H,
  onOpenSocial,
  onOpenRoomLobby,
  onOpenHostPodium,
  onOpenSquadCards,
  onOpenRosterHub,
  onOpenGlobalLeagues,
  onOpenAudioSettings,
  onSave,
  onReset,
}) {
  const [activeCategory, setActiveCategory] = useState(null); // 'matchday' | 'multiplayer' | 'intel' | 'settings' | 'all_features'
  const [isBeginnerMode, setIsBeginnerMode] = useState(false);
  const dropdownRef = useRef(null);

  // Close popover when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setActiveCategory(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const activeTheme = BROADCAST_THEMES[activeThemeKey] || BROADCAST_THEMES.modern_dark;

  const toggleCategory = (cat) => {
    setActiveCategory((prev) => (prev === cat ? null : cat));
  };

  const handleActionClick = (actionFn) => {
    setActiveCategory(null);
    if (actionFn) actionFn();
  };

  return (
    <div ref={dropdownRef} className="w-full max-w-7xl flex flex-col gap-3 mb-6 relative z-30 transition-all">
      {/* Top Telemetry & HUD Bar */}
      <div className={`w-full ${activeTheme.headerBg} p-3 md:p-4 rounded-3xl border flex flex-wrap items-center justify-between gap-4 transition-all duration-300 shadow-xl`}>
        {/* Left: Active Franchise HUD */}
        <div className="flex flex-wrap items-center gap-3">
          {userTeam ? (
            <div className="flex items-center gap-3">
              <div
                className={`w-12 h-12 rounded-2xl ${
                  userTeam.headerColor || "bg-yellow-500"
                } flex items-center justify-center font-black text-black text-lg shadow-lg border-2 border-white/30 transform hover:scale-105 transition-transform`}
              >
                {userTeam.shortName}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm md:text-base font-black text-white tracking-wide">
                    {userTeam.name}
                  </span>
                  {humanTeamIds && humanTeamIds.length > 1 && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-indigo-500/25 text-indigo-300 border border-indigo-400/40">
                      👥 {humanTeamIds.length} Teams
                    </span>
                  )}
                  {activeLeague && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-yellow-400/20 text-yellow-300 border border-yellow-400/40">
                      {activeLeague.badge || "🏏"} {activeLeague.name.split(" ")[0]}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 md:gap-3 text-xs mt-0.5">
                  <span className="text-gray-300">
                    Purse: <span className="font-black text-emerald-400">₹{userTeam.budget.toFixed(2)}Cr</span>
                  </span>
                  <span className="text-gray-500">·</span>
                  <span className="text-gray-300">
                    Squad: <span className="font-extrabold text-white">{(userTeam.players || []).length}/25</span>
                  </span>
                  <span className="text-gray-500">·</span>
                  <span className="text-yellow-400 font-extrabold flex items-center gap-1">
                    <span>⚡</span> {userTeam.rtmCount} RTMs
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-sm font-bold text-gray-400">No Franchise Selected</div>
          )}
        </div>

        {/* Center: Quick TV Broadcast Watermark Indicator */}
        <div className="hidden lg:flex items-center gap-2">
          <div className={`px-3 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider border ${activeTheme.watermarkColor} shadow-md flex items-center gap-2`}>
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
            <span>{activeTheme.tvWatermark}</span>
          </div>
        </div>

        {/* Right: Beginner-Friendly Option Clusters */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Simple Mode Toggle */}
          <button
            onClick={() => setIsBeginnerMode(!isBeginnerMode)}
            className={`px-2.5 py-1.5 rounded-xl text-[11px] font-black transition-all flex items-center gap-1 border ${
              isBeginnerMode
                ? "bg-emerald-500/20 text-emerald-300 border-emerald-400/60 ring-1 ring-emerald-400/40"
                : "bg-gray-800/80 text-gray-400 border-gray-700 hover:text-white"
            }`}
            title="Toggle between simple 4-button view and full deck"
          >
            <span>💡</span>
            <span>{isBeginnerMode ? "Simple: ON" : "Simple"}</span>
          </button>

          {/* Quick Essential: Sets */}
          <button
            onClick={onOpenSets}
            className="px-3.5 py-2 bg-gray-800/90 hover:bg-gray-700 border border-gray-600/70 hover:border-gray-400 text-white rounded-xl text-xs font-black transition-all shadow flex items-center gap-1.5 active:scale-95"
            title="Browse Auction Sets (Marquee, Capped & Uncapped)"
          >
            <span className="text-sm">📋</span>
            <span>Sets</span>
          </button>

          {/* Quick Essential: Needs */}
          <button
            onClick={onOpenNeeds}
            className="px-3.5 py-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-black font-black rounded-xl text-xs transition-all shadow-md flex items-center gap-1.5 active:scale-95"
            title="Franchise Positional Needs & Target Radar"
          >
            <span className="text-sm">🎯</span>
            <span>Needs</span>
          </button>

          {/* Quick Essential: Playing XI */}
          <button
            onClick={onOpenPlayingXI}
            className="px-3.5 py-2 bg-cyan-600/80 hover:bg-cyan-500 text-white border border-cyan-400/50 rounded-xl text-xs font-black transition-all shadow flex items-center gap-1.5 active:scale-95"
            title="Build & validate Playing XI Lineup"
          >
            <span className="text-sm">🏏</span>
            <span className="hidden sm:inline">Playing XI</span>
          </button>

          {/* If in Beginner Mode, show quick Match Sim button */}
          {isBeginnerMode && (
            <button
              onClick={onOpenTournament}
              className="px-3.5 py-2 bg-emerald-600/80 hover:bg-emerald-500 text-white border border-emerald-400/50 rounded-xl text-xs font-black transition-all shadow flex items-center gap-1.5 active:scale-95"
              title="Simulate 45-match season & playoffs"
            >
              <span className="text-sm">🏆</span>
              <span>Sim Season</span>
            </button>
          )}

          {/* Categories: Shown when not in strict beginner mode */}
          {!isBeginnerMode && (
            <>
              {/* Category Hub 1: 🎮 Matchday Hub */}
              <div className="relative">
                <button
                  onClick={() => toggleCategory("matchday")}
                  className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all shadow-md flex items-center gap-1.5 border ${
                    activeCategory === "matchday"
                      ? "bg-blue-500 text-white border-blue-300 ring-2 ring-blue-400/50"
                      : "bg-gray-800/90 hover:bg-gray-700/90 text-blue-300 border-blue-500/40"
                  }`}
                >
                  <span>🎮</span>
                  <span>Matchday</span>
                  <span className="text-[10px] opacity-70">▼</span>
                </button>

                {activeCategory === "matchday" && (
                  <div className="absolute right-0 top-full mt-2 w-72 bg-gray-950 border border-blue-500/50 rounded-2xl p-2.5 shadow-2xl z-50 animate-fadeIn space-y-1.5">
                    <div className="px-2 py-1 text-[11px] font-black uppercase tracking-wider text-blue-400 border-b border-gray-800 flex items-center justify-between">
                      <span>Matchday & Gameplay</span>
                      <span className="text-[10px] text-gray-500 font-normal">Pick an option</span>
                    </div>
                    <div className="grid grid-cols-1 gap-1">
                      <button
                        onClick={() => handleActionClick(onOpenPlayingXI)}
                        className="w-full text-left p-2 rounded-xl hover:bg-blue-950/50 hover:border-blue-500/50 border border-transparent transition flex items-center gap-2.5 group"
                      >
                        <span className="w-8 h-8 rounded-lg bg-blue-500/20 text-blue-300 flex items-center justify-center text-sm font-bold shrink-0">🏏</span>
                        <div className="truncate">
                          <div className="font-black text-white text-xs group-hover:text-blue-300 truncate">Playing XI & Impact Sub</div>
                          <div className="text-[10px] text-gray-400">Set captain, order & 12th man</div>
                        </div>
                      </button>

                      <button
                        onClick={() => handleActionClick(onOpenTournament)}
                        className="w-full text-left p-2 rounded-xl hover:bg-emerald-950/50 hover:border-emerald-500/50 border border-transparent transition flex items-center gap-2.5 group"
                      >
                        <span className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-300 flex items-center justify-center text-sm font-bold shrink-0">🏆</span>
                        <div className="truncate">
                          <div className="font-black text-white text-xs group-hover:text-emerald-300 truncate">Match & Season Simulator</div>
                          <div className="text-[10px] text-gray-400">45-match season, NRR & Playoffs</div>
                        </div>
                      </button>

                      <button
                        onClick={() => handleActionClick(onOpenH2H)}
                        className="w-full text-left p-2 rounded-xl hover:bg-indigo-950/50 hover:border-indigo-500/50 border border-transparent transition flex items-center gap-2.5 group"
                      >
                        <span className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-300 flex items-center justify-center text-sm font-bold shrink-0">⚔️</span>
                        <div className="truncate">
                          <div className="font-black text-white text-xs group-hover:text-indigo-300 truncate">Batter vs Bowler Matchups</div>
                          <div className="text-[10px] text-gray-400">Kohli vs Bumrah rivalry stats</div>
                        </div>
                      </button>

                      <button
                        onClick={() => handleActionClick(onOpenTrades)}
                        className="w-full text-left p-2 rounded-xl hover:bg-purple-950/50 hover:border-purple-500/50 border border-transparent transition flex items-center gap-2.5 group"
                      >
                        <span className="w-8 h-8 rounded-lg bg-purple-500/20 text-purple-300 flex items-center justify-center text-sm font-bold shrink-0">🔄</span>
                        <div className="truncate">
                          <div className="font-black text-white text-xs group-hover:text-purple-300 truncate">Mid-Season Player Trades</div>
                          <div className="text-[10px] text-gray-400">Propose player swaps & cash deals</div>
                        </div>
                      </button>

                      <button
                        onClick={() => handleActionClick(onOpenMiniAuction)}
                        className="w-full text-left p-2 rounded-xl hover:bg-amber-950/50 hover:border-amber-500/50 border border-transparent transition flex items-center gap-2.5 group"
                      >
                        <span className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-300 flex items-center justify-center text-sm font-bold shrink-0">🚀</span>
                        <div className="truncate">
                          <div className="font-black text-white text-xs group-hover:text-amber-300 truncate">Season {currentSeason + 1} Mini-Auction</div>
                          <div className="text-[10px] text-gray-400">Advance year & draft rookies</div>
                        </div>
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Category Hub 2: 🌐 Multiplayer & Hub */}
              <div className="relative">
                <button
                  onClick={() => toggleCategory("multiplayer")}
                  className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all shadow-md flex items-center gap-1.5 border ${
                    activeCategory === "multiplayer"
                      ? "bg-purple-500 text-white border-purple-300 ring-2 ring-purple-400/50"
                      : "bg-gray-800/90 hover:bg-gray-700/90 text-purple-300 border-purple-500/40"
                  }`}
                >
                  <span>🌐</span>
                  <span>Multiplayer</span>
                  {activeRoomId && <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />}
                  <span className="text-[10px] opacity-70">▼</span>
                </button>

                {activeCategory === "multiplayer" && (
                  <div className="absolute right-0 top-full mt-2 w-72 bg-gray-950 border border-purple-500/50 rounded-2xl p-2.5 shadow-2xl z-50 animate-fadeIn space-y-1.5">
                    <div className="px-2 py-1 text-[11px] font-black uppercase tracking-wider text-purple-400 border-b border-gray-800 flex items-center justify-between">
                      <span>Multiplayer & Community</span>
                      {activeRoomId && <span className="text-emerald-400 font-mono text-[10px]">#{activeRoomId}</span>}
                    </div>
                    <div className="grid grid-cols-1 gap-1">
                      <button
                        onClick={() => handleActionClick(onOpenRoomLobby)}
                        className="w-full text-left p-2 rounded-xl hover:bg-purple-950/50 hover:border-purple-500/50 border border-transparent transition flex items-center gap-2.5 group"
                      >
                        <span className="w-8 h-8 rounded-lg bg-blue-500/20 text-blue-300 flex items-center justify-center text-sm font-bold shrink-0">🌐</span>
                        <div className="truncate">
                          <div className="font-black text-white text-xs group-hover:text-blue-300 truncate">Online Cloud Rooms</div>
                          <div className="text-[10px] text-gray-400">Play with friends via Room Code</div>
                        </div>
                      </button>

                      <button
                        onClick={() => handleActionClick(onOpenHostPodium)}
                        className="w-full text-left p-2 rounded-xl hover:bg-amber-950/50 hover:border-amber-500/50 border border-transparent transition flex items-center gap-2.5 group"
                      >
                        <span className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-300 flex items-center justify-center text-sm font-bold shrink-0">🔨</span>
                        <div className="truncate">
                          <div className="font-black text-white text-xs group-hover:text-amber-300 truncate">Auctioneer Host Podium</div>
                          <div className="text-[10px] text-gray-400">Live gavel strikes & pacing control</div>
                        </div>
                      </button>

                      <button
                        onClick={() => handleActionClick(onOpenMultiManager)}
                        className="w-full text-left p-2 rounded-xl hover:bg-indigo-950/50 hover:border-indigo-500/50 border border-transparent transition flex items-center gap-2.5 group"
                      >
                        <span className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-300 flex items-center justify-center text-sm font-bold shrink-0">👥</span>
                        <div className="truncate">
                          <div className="font-black text-white text-xs group-hover:text-indigo-300 truncate">Pass-and-Play (1-10 Teams)</div>
                          <div className="text-[10px] text-gray-400">Manage multiple teams on 1 device</div>
                        </div>
                      </button>

                      <button
                        onClick={() => handleActionClick(onOpenSquadCards)}
                        className="w-full text-left p-2 rounded-xl hover:bg-emerald-950/50 hover:border-emerald-500/50 border border-transparent transition flex items-center gap-2.5 group"
                      >
                        <span className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-300 flex items-center justify-center text-sm font-bold shrink-0">🖼️</span>
                        <div className="truncate">
                          <div className="font-black text-white text-xs group-hover:text-emerald-300 truncate">HD Squad Poster Studio</div>
                          <div className="text-[10px] text-gray-400">Download high-res squad cards</div>
                        </div>
                      </button>

                      <button
                        onClick={() => handleActionClick(onOpenRosterHub)}
                        className="w-full text-left p-2 rounded-xl hover:bg-pink-950/50 hover:border-pink-500/50 border border-transparent transition flex items-center gap-2.5 group"
                      >
                        <span className="w-8 h-8 rounded-lg bg-pink-500/20 text-pink-300 flex items-center justify-center text-sm font-bold shrink-0">🏛️</span>
                        <div className="truncate">
                          <div className="font-black text-white text-xs group-hover:text-pink-300 truncate">Community Roster Hub</div>
                          <div className="text-[10px] text-gray-400">RCB 2016, MI 2020 & All-Time Legends</div>
                        </div>
                      </button>

                      <button
                        onClick={() => handleActionClick(onOpenGlobalLeagues)}
                        className="w-full text-left p-2 rounded-xl hover:bg-yellow-950/50 hover:border-yellow-500/50 border border-transparent transition flex items-center gap-2.5 group"
                      >
                        <span className="w-8 h-8 rounded-lg bg-yellow-500/20 text-yellow-300 flex items-center justify-center text-sm font-bold shrink-0">🌍</span>
                        <div className="truncate">
                          <div className="font-black text-white text-xs group-hover:text-yellow-300 truncate">Global Leagues & World Cup</div>
                          <div className="text-[10px] text-gray-400">BBL, SA20, MLC, PSL, CPL & Custom rules</div>
                        </div>
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Category Hub 3: 📊 Intel & Analysis */}
              <div className="relative">
                <button
                  onClick={() => toggleCategory("intel")}
                  className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all shadow-md flex items-center gap-1.5 border ${
                    activeCategory === "intel"
                      ? "bg-amber-400 text-black border-amber-300 ring-2 ring-amber-400/50"
                      : "bg-gray-800/90 hover:bg-gray-700/90 text-amber-300 border-amber-500/40"
                  }`}
                >
                  <span>📊</span>
                  <span>Intel</span>
                  {socialFeedLength > 0 && <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />}
                  <span className="text-[10px] opacity-70">▼</span>
                </button>

                {activeCategory === "intel" && (
                  <div className="absolute right-0 top-full mt-2 w-64 bg-gray-950 border border-amber-500/50 rounded-2xl p-2.5 shadow-2xl z-50 animate-fadeIn space-y-1.5">
                    <div className="px-2 py-1 text-[11px] font-black uppercase tracking-wider text-amber-400 border-b border-gray-800">
                      Scouting & Media Intel
                    </div>
                    <div className="grid grid-cols-1 gap-1">
                      <button
                        onClick={() => handleActionClick(onOpenSocial)}
                        className="w-full text-left p-2 rounded-xl hover:bg-amber-950/50 hover:border-amber-500/50 border border-transparent transition flex items-center gap-2.5 group"
                      >
                        <span className="w-8 h-8 rounded-lg bg-yellow-500/20 text-yellow-300 flex items-center justify-center text-sm font-bold shrink-0">📰</span>
                        <div className="truncate">
                          <div className="font-black text-white text-xs group-hover:text-yellow-300 truncate">Pundits & Report Cards</div>
                          <div className="text-[10px] text-gray-400">Live social wire & franchise grades</div>
                        </div>
                      </button>

                      <button
                        onClick={() => handleActionClick(onOpenRosterStudio)}
                        className="w-full text-left p-2 rounded-xl hover:bg-violet-950/50 hover:border-violet-500/50 border border-transparent transition flex items-center gap-2.5 group"
                      >
                        <span className="w-8 h-8 rounded-lg bg-violet-500/20 text-violet-300 flex items-center justify-center text-sm font-bold shrink-0">✏️</span>
                        <div className="truncate">
                          <div className="font-black text-white text-xs group-hover:text-violet-300 truncate">Custom Player Studio</div>
                          <div className="text-[10px] text-gray-400">Edit ratings, prices & export JSON</div>
                        </div>
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Category Hub 4: ⚙️ Settings & System */}
              <div className="relative">
                <button
                  onClick={() => toggleCategory("settings")}
                  className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all shadow-md flex items-center gap-1.5 border ${
                    activeCategory === "settings"
                      ? "bg-gray-600 text-white border-gray-400 ring-2 ring-gray-400/50"
                      : "bg-gray-800/90 hover:bg-gray-700/90 text-gray-300 border-gray-700"
                  }`}
                >
                  <span>⚙️</span>
                  <span className="hidden sm:inline">Settings</span>
                  <span className="text-[10px] opacity-70">▼</span>
                </button>

                {activeCategory === "settings" && (
                  <div className="absolute right-0 top-full mt-2 w-72 bg-gray-950 border border-gray-700 rounded-2xl p-3 shadow-2xl z-50 animate-fadeIn space-y-2.5">
                    <div className="px-1 text-[11px] font-black uppercase tracking-wider text-gray-400 border-b border-gray-800 pb-1.5 flex items-center justify-between">
                      <span>Audio & Storage Settings</span>
                    </div>

                    <button
                      onClick={() => handleActionClick(onOpenAudioSettings)}
                      className="w-full text-left p-2.5 rounded-xl bg-gray-900 hover:bg-gray-800 border border-gray-800 flex items-center gap-2.5 transition text-xs"
                    >
                      <span className="text-lg">🎙️</span>
                      <div>
                        <span className="font-black text-white block">Audio & Voice Commentary</span>
                        <span className="text-[10px] text-gray-400">Speech synthesizer, gavel volume & ticks</span>
                      </div>
                    </button>

                    <div className="grid grid-cols-2 gap-2 pt-1 border-t border-gray-800">
                      <button
                        onClick={() => handleActionClick(onSave)}
                        className="p-2.5 bg-gray-900 hover:bg-gray-800 border border-gray-700 text-gray-200 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5"
                      >
                        <span>💾</span>
                        <span>Save State</span>
                      </button>
                      <button
                        onClick={() => handleActionClick(onReset)}
                        className="p-2.5 bg-rose-950/40 hover:bg-rose-900/60 border border-rose-800/40 text-rose-300 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5"
                      >
                        <span>🔄</span>
                        <span>Reset All</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}

          {/* All 19 Features Modal Launcher */}
          <button
            onClick={() => toggleCategory("all_features")}
            className="px-3.5 py-2 bg-gradient-to-r from-yellow-400 to-amber-400 hover:from-yellow-300 hover:to-amber-300 text-black font-black rounded-xl text-xs shadow-md transition flex items-center gap-1.5 active:scale-95"
            title="Browse Complete Directory of 19 Features"
          >
            <span>⚡</span>
            <span>All Features</span>
          </button>
        </div>
      </div>

      {/* Prominent, 1-Click Broadcast TV Theme Switcher Ribbon */}
      <div className="w-full flex flex-wrap items-center justify-between gap-3 px-1 py-1">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-xs font-black uppercase tracking-wider text-gray-400 flex items-center gap-1">
            <span>📺</span> Broadcast Theme:
          </span>
          <div className="flex flex-wrap items-center gap-1 bg-black/40 border border-gray-800/80 p-1 rounded-2xl backdrop-blur-sm">
            {Object.values(BROADCAST_THEMES).map((th) => (
              <button
                key={th.id}
                onClick={() => onSelectTheme(th.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  activeThemeKey === th.id
                    ? `${th.tabActive} ring-2 ring-white/20 transform scale-[1.03]`
                    : "text-gray-400 hover:text-white hover:bg-gray-850"
                }`}
                title={th.description}
              >
                <span className="text-sm">{th.badge}</span>
                <span className="font-extrabold">{th.shortName}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Beginner Help Tip Indicator */}
        <div className="text-xs text-gray-400 hidden xl:flex items-center gap-1.5 bg-gray-900/60 border border-gray-800 px-3 py-1 rounded-xl">
          <span className="text-yellow-400">💡 Tip:</span>
          <span>Click theme to instantly change the entire broadcast skin!</span>
        </div>
      </div>

      {/* Full Modal Command Center (When clicking "⚡ All Features") */}
      {activeCategory === "all_features" && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-gray-950 border border-gray-700 w-full max-w-4xl rounded-3xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
            <div className="p-4 bg-gradient-to-r from-gray-900 via-indigo-950 to-gray-900 border-b border-gray-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-2xl p-2 rounded-2xl bg-yellow-400/20 text-yellow-400">⚡</span>
                <div>
                  <h3 className="text-lg font-black text-white">Cricket Auction Feature Hub</h3>
                  <p className="text-xs text-gray-400">
                    Clean, organized directory of all 19 tools. Click any card to launch immediately.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setActiveCategory(null)}
                className="w-8 h-8 rounded-full bg-gray-800 text-gray-300 hover:text-white flex items-center justify-center transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="p-5 overflow-y-auto space-y-5 flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Category 1: Matchday & Simulation */}
              <div className="p-4 bg-gray-900/80 rounded-2xl border border-blue-500/30 space-y-3">
                <div className="flex items-center justify-between border-b border-gray-800 pb-2">
                  <h4 className="text-xs font-black text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
                    <span>🎮</span> Matchday & Season Gameplay
                  </h4>
                  <span className="text-[10px] text-gray-500">5 tools</span>
                </div>
                <div className="space-y-1.5">
                  <button
                    onClick={() => handleActionClick(onOpenPlayingXI)}
                    className="w-full p-2.5 rounded-xl bg-gray-950 hover:bg-blue-950/40 border border-gray-800 text-left flex items-center justify-between text-xs transition group"
                  >
                    <div>
                      <span className="font-extrabold text-white block group-hover:text-cyan-300">🏏 Playing XI & Impact Player</span>
                      <span className="text-[10px] text-gray-400">Formation validator, captaincy & tactical 12th man</span>
                    </div>
                    <span className="text-cyan-400 font-bold">Open →</span>
                  </button>

                  <button
                    onClick={() => handleActionClick(onOpenTournament)}
                    className="w-full p-2.5 rounded-xl bg-gray-950 hover:bg-emerald-950/40 border border-gray-800 text-left flex items-center justify-between text-xs transition group"
                  >
                    <div>
                      <span className="font-extrabold text-white block group-hover:text-emerald-300">🏆 45-Match Season & Playoffs</span>
                      <span className="text-[10px] text-gray-400">Points Table, NRR, Worm & Manhattan charts</span>
                    </div>
                    <span className="text-emerald-400 font-bold">Simulate →</span>
                  </button>

                  <button
                    onClick={() => handleActionClick(onOpenH2H)}
                    className="w-full p-2.5 rounded-xl bg-gray-950 hover:bg-indigo-950/40 border border-gray-800 text-left flex items-center justify-between text-xs transition group"
                  >
                    <div>
                      <span className="font-extrabold text-white block group-hover:text-indigo-300">⚔️ Batter vs Bowler H2H Matrix</span>
                      <span className="text-[10px] text-gray-400">Kohli vs Bumrah, Rohit vs Boult strike rates</span>
                    </div>
                    <span className="text-indigo-400 font-bold">Inspect →</span>
                  </button>

                  <button
                    onClick={() => handleActionClick(onOpenTrades)}
                    className="w-full p-2.5 rounded-xl bg-gray-950 hover:bg-purple-950/40 border border-gray-800 text-left flex items-center justify-between text-xs transition group"
                  >
                    <div>
                      <span className="font-extrabold text-white block group-hover:text-purple-300">🔄 Player Trades & Transfer Window</span>
                      <span className="text-[10px] text-gray-400">Propose swaps and cash deals with AI franchises</span>
                    </div>
                    <span className="text-purple-400 font-bold">Trade →</span>
                  </button>

                  <button
                    onClick={() => handleActionClick(onOpenMiniAuction)}
                    className="w-full p-2.5 rounded-xl bg-gray-950 hover:bg-amber-950/40 border border-gray-800 text-left flex items-center justify-between text-xs transition group"
                  >
                    <div>
                      <span className="font-extrabold text-white block group-hover:text-amber-300">🚀 Season {currentSeason + 1} Mini-Auction</span>
                      <span className="text-[10px] text-gray-400">Multi-year progression, retentions & rookie draft</span>
                    </div>
                    <span className="text-amber-400 font-bold">Advance →</span>
                  </button>
                </div>
              </div>

              {/* Category 2: Online & Multiplayer */}
              <div className="p-4 bg-gray-900/80 rounded-2xl border border-purple-500/30 space-y-3">
                <div className="flex items-center justify-between border-b border-gray-800 pb-2">
                  <h4 className="text-xs font-black text-purple-400 uppercase tracking-wider flex items-center gap-1.5">
                    <span>🌐</span> Multiplayer & Community
                  </h4>
                  <span className="text-[10px] text-gray-500">6 tools</span>
                </div>
                <div className="space-y-1.5">
                  <button
                    onClick={() => handleActionClick(onOpenRoomLobby)}
                    className="w-full p-2.5 rounded-xl bg-gray-950 hover:bg-purple-950/40 border border-gray-800 text-left flex items-center justify-between text-xs transition group"
                  >
                    <div>
                      <span className="font-extrabold text-white block group-hover:text-purple-300">🌐 Real-Time Cloud Rooms</span>
                      <span className="text-[10px] text-gray-400">Sync rooms across tabs & devices with live chat</span>
                    </div>
                    <span className="text-purple-400 font-bold">Join →</span>
                  </button>

                  <button
                    onClick={() => handleActionClick(onOpenHostPodium)}
                    className="w-full p-2.5 rounded-xl bg-gray-950 hover:bg-amber-950/40 border border-gray-800 text-left flex items-center justify-between text-xs transition group"
                  >
                    <div>
                      <span className="font-extrabold text-white block group-hover:text-amber-300">🔨 Auctioneer Host Podium</span>
                      <span className="text-[10px] text-gray-400">Fair warning, SOLD gavel triggers & clock speed</span>
                    </div>
                    <span className="text-yellow-400 font-bold">Podium →</span>
                  </button>

                  <button
                    onClick={() => handleActionClick(onOpenMultiManager)}
                    className="w-full p-2.5 rounded-xl bg-gray-950 hover:bg-indigo-950/40 border border-gray-800 text-left flex items-center justify-between text-xs transition group"
                  >
                    <div>
                      <span className="font-extrabold text-white block group-hover:text-indigo-300">👥 Pass-and-Play Multi-Manager</span>
                      <span className="text-[10px] text-gray-400">Control multiple franchises on 1 device</span>
                    </div>
                    <span className="text-indigo-400 font-bold">Setup →</span>
                  </button>

                  <button
                    onClick={() => handleActionClick(onOpenSquadCards)}
                    className="w-full p-2.5 rounded-xl bg-gray-950 hover:bg-emerald-950/40 border border-gray-800 text-left flex items-center justify-between text-xs transition group"
                  >
                    <div>
                      <span className="font-extrabold text-white block group-hover:text-emerald-300">🖼️ Graphical Squad Cards Studio</span>
                      <span className="text-[10px] text-gray-400">Generate 300 DPI HD PNG posters for social sharing</span>
                    </div>
                    <span className="text-emerald-400 font-bold">Create →</span>
                  </button>

                  <button
                    onClick={() => handleActionClick(onOpenRosterHub)}
                    className="w-full p-2.5 rounded-xl bg-gray-950 hover:bg-pink-950/40 border border-gray-800 text-left flex items-center justify-between text-xs transition group"
                  >
                    <div>
                      <span className="font-extrabold text-white block group-hover:text-pink-300">🏛️ Community Roster Hub</span>
                      <span className="text-[10px] text-gray-400">RCB 2016, MI 2020, CSK 2018 & All-Time GOATs</span>
                    </div>
                    <span className="text-pink-400 font-bold">Explore →</span>
                  </button>

                  <button
                    onClick={() => handleActionClick(onOpenGlobalLeagues)}
                    className="w-full p-2.5 rounded-xl bg-gray-950 hover:bg-yellow-950/40 border border-gray-800 text-left flex items-center justify-between text-xs transition group"
                  >
                    <div>
                      <span className="font-extrabold text-white block group-hover:text-yellow-300">🌍 Global Leagues & Custom Sandbox</span>
                      <span className="text-[10px] text-gray-400">BBL, SA20, MLC, PSL, CPL, World Cup & Rules</span>
                    </div>
                    <span className="text-yellow-400 font-bold">Switch →</span>
                  </button>
                </div>
              </div>

              {/* Category 3: Intel & Strategy */}
              <div className="p-4 bg-gray-900/80 rounded-2xl border border-amber-500/30 space-y-3">
                <div className="flex items-center justify-between border-b border-gray-800 pb-2">
                  <h4 className="text-xs font-black text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                    <span>📊</span> Strategy & Intel
                  </h4>
                  <span className="text-[10px] text-gray-500">4 tools</span>
                </div>
                <div className="space-y-1.5">
                  <button
                    onClick={() => handleActionClick(onOpenSets)}
                    className="w-full p-2.5 rounded-xl bg-gray-950 hover:bg-amber-950/40 border border-gray-800 text-left flex items-center justify-between text-xs transition group"
                  >
                    <div>
                      <span className="font-extrabold text-white block group-hover:text-yellow-300">📋 11+ Auction Sets Catalog</span>
                      <span className="text-[10px] text-gray-400">Marquee, capped, uncapped & accelerated sets</span>
                    </div>
                    <span className="text-yellow-400 font-bold">View →</span>
                  </button>

                  <button
                    onClick={() => handleActionClick(onOpenNeeds)}
                    className="w-full p-2.5 rounded-xl bg-gray-950 hover:bg-amber-950/40 border border-gray-800 text-left flex items-center justify-between text-xs transition group"
                  >
                    <div>
                      <span className="font-extrabold text-white block group-hover:text-orange-300">🎯 Target-Aware Needs & RTM Radar</span>
                      <span className="text-[10px] text-gray-400">Scout all 10 franchises positional deficits</span>
                    </div>
                    <span className="text-amber-400 font-bold">Radar →</span>
                  </button>

                  <button
                    onClick={() => handleActionClick(onOpenSocial)}
                    className="w-full p-2.5 rounded-xl bg-gray-950 hover:bg-orange-950/40 border border-gray-800 text-left flex items-center justify-between text-xs transition group"
                  >
                    <div>
                      <span className="font-extrabold text-white block group-hover:text-orange-300">📰 Pundit Studio & Expert Grades</span>
                      <span className="text-[10px] text-gray-400">Social reaction wire & report cards (A+ to F)</span>
                    </div>
                    <span className="text-orange-400 font-bold">Feed →</span>
                  </button>

                  <button
                    onClick={() => handleActionClick(onOpenRosterStudio)}
                    className="w-full p-2.5 rounded-xl bg-gray-950 hover:bg-violet-950/40 border border-gray-800 text-left flex items-center justify-between text-xs transition group"
                  >
                    <div>
                      <span className="font-extrabold text-white block group-hover:text-violet-300">✏️ Custom Player Studio</span>
                      <span className="text-[10px] text-gray-400">Add players, adjust ratings, import/export JSON</span>
                    </div>
                    <span className="text-violet-400 font-bold">Edit →</span>
                  </button>
                </div>
              </div>

              {/* Category 4: Immersion & Settings */}
              <div className="p-4 bg-gray-900/80 rounded-2xl border border-rose-500/30 space-y-3">
                <div className="flex items-center justify-between border-b border-gray-800 pb-2">
                  <h4 className="text-xs font-black text-rose-400 uppercase tracking-wider flex items-center gap-1.5">
                    <span>⚙️</span> Immersion & Audio
                  </h4>
                  <span className="text-[10px] text-gray-500">4 tools</span>
                </div>
                <div className="space-y-1.5">
                  <button
                    onClick={() => handleActionClick(onOpenAudioSettings)}
                    className="w-full p-2.5 rounded-xl bg-gray-950 hover:bg-rose-950/40 border border-gray-800 text-left flex items-center justify-between text-xs transition group"
                  >
                    <div>
                      <span className="font-extrabold text-white block group-hover:text-rose-300">🎙️ Procedural Audio & Voice</span>
                      <span className="text-[10px] text-gray-400">Hardwood gavel, tension clock, commentary voice</span>
                    </div>
                    <span className="text-rose-400 font-bold">Audio →</span>
                  </button>

                  <button
                    onClick={() => handleActionClick(onSave)}
                    className="w-full p-2.5 rounded-xl bg-gray-950 hover:bg-emerald-950/40 border border-gray-800 text-left flex items-center justify-between text-xs transition group"
                  >
                    <div>
                      <span className="font-extrabold text-white block group-hover:text-emerald-300">💾 Save Auction Checkpoint</span>
                      <span className="text-[10px] text-gray-400">Store current state to browser local storage</span>
                    </div>
                    <span className="text-emerald-400 font-bold">Save →</span>
                  </button>

                  <button
                    onClick={() => handleActionClick(onReset)}
                    className="w-full p-2.5 rounded-xl bg-rose-950/30 hover:bg-rose-900/50 border border-rose-800/40 text-left flex items-center justify-between text-xs transition text-rose-300"
                  >
                    <div>
                      <span className="font-extrabold text-rose-200 block">🔄 Clean Reset Auction</span>
                      <span className="text-[10px] text-rose-400">Clear saved checkpoints and start brand new</span>
                    </div>
                    <span className="text-rose-400 font-bold">Reset →</span>
                  </button>
                </div>
              </div>
            </div>

            <div className="p-3 bg-gray-900 border-t border-gray-800 flex justify-end">
              <button
                onClick={() => setActiveCategory(null)}
                className="px-5 py-2 bg-gray-800 hover:bg-gray-700 text-white font-bold text-xs rounded-xl"
              >
                Close Directory
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
