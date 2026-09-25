// src/components/GlobalLeaguesModal.jsx
import React, { useState } from "react";
import { GLOBAL_LEAGUES } from "../data/globalLeaguesData";
import { toast } from "react-toastify";

export default function GlobalLeaguesModal({
  isOpen,
  onClose,
  activeLeagueId = "ipl",
  onSelectLeague,
  onDeployCustomTournament,
}) {
  const [activeTab, setActiveTab] = useState("leagues"); // 'leagues' | 'world_cup' | 'sandbox'
  const [selectedLeague, setSelectedLeague] = useState(GLOBAL_LEAGUES[activeLeagueId] || GLOBAL_LEAGUES.ipl);

  // Custom Tournament Sandbox State
  const [customName, setCustomName] = useState("World Super League 2026");
  const [customTeamsCount, setCustomTeamsCount] = useState(6);
  const [customCurrency, setCustomCurrency] = useState("₹");
  const [customPurse, setCustomPurse] = useState(100);
  const [customOverseasLimit, setCustomOverseasLimit] = useState(6);
  const [customSquadMin, setCustomSquadMin] = useState(16);
  const [customSquadMax, setCustomSquadMax] = useState(22);
  const [customRtmCount, setCustomRtmCount] = useState(4);
  const [customTimerSpeed, setCustomTimerSpeed] = useState("standard");

  if (!isOpen) return null;

  const handleApplyLeague = (league) => {
    if (onSelectLeague) {
      onSelectLeague(league);
    }
    toast.success(`Switched active league to ${league.name}! 🌍`);
    onClose();
  };

  const handleLaunchSandbox = (e) => {
    e?.preventDefault();
    if (!customName.trim()) {
      toast.error("Please enter a tournament name.");
      return;
    }

    const defaultColors = [
      { color: "border-blue-500", headerColor: "bg-blue-600" },
      { color: "border-yellow-400", headerColor: "bg-yellow-500" },
      { color: "border-red-600", headerColor: "bg-red-700" },
      { color: "border-emerald-500", headerColor: "bg-emerald-600" },
      { color: "border-purple-600", headerColor: "bg-purple-700" },
      { color: "border-cyan-500", headerColor: "bg-cyan-600" },
      { color: "border-orange-500", headerColor: "bg-orange-600" },
      { color: "border-pink-500", headerColor: "bg-pink-600" },
    ];

    const generatedTeams = Array.from({ length: customTeamsCount }, (_, i) => ({
      id: i + 1,
      name: `Franchise ${i + 1}`,
      shortName: `FR${i + 1}`,
      color: defaultColors[i % defaultColors.length].color,
      headerColor: defaultColors[i % defaultColors.length].headerColor,
      budget: customPurse,
      rtmCount: customRtmCount,
      players: [],
    }));

    const customLeagueConfig = {
      id: "custom_" + Date.now(),
      name: customName.trim(),
      country: "Custom Sandbox",
      currency: customCurrency,
      currencyUnit: customCurrency === "₹" ? "Cr" : "M",
      purse: customPurse,
      squadMin: customSquadMin,
      squadMax: customSquadMax,
      overseasLimit: customOverseasLimit,
      badge: "🛠️",
      description: `Custom Sandbox Tournament with ${customTeamsCount} teams and ${customCurrency}${customPurse} purse.`,
      teams: generatedTeams,
      timerSpeed: customTimerSpeed,
    };

    if (onDeployCustomTournament) {
      onDeployCustomTournament(customLeagueConfig);
    }
    toast.success(`Launched Custom Tournament: "${customName.trim()}"! 🚀`);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 animate-fadeIn">
      <div className="bg-gray-900 border border-gray-700 w-full max-w-5xl rounded-3xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden">
        {/* Header */}
        <div className="p-4 md:p-5 bg-gradient-to-r from-blue-950 via-gray-900 to-indigo-950 border-b border-gray-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-3xl p-2 rounded-2xl bg-blue-500/20 border border-blue-500/40">🌍</span>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg md:text-xl font-black text-white">Global T20 Leagues & Tournament Sandbox</h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-blue-950 text-blue-300 border border-blue-500/40">
                  Phase 9 Global
                </span>
              </div>
              <p className="text-xs text-gray-400">
                Switch between international franchise leagues, draft in the T20 World Cup, or build a custom rule sandbox.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white flex items-center justify-center transition"
          >
            ✕
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-gray-800 px-5 pt-2 gap-2 bg-gray-950/60">
          <button
            onClick={() => setActiveTab("leagues")}
            className={`px-4 py-2.5 text-xs font-black rounded-t-xl transition-all ${
              activeTab === "leagues"
                ? "bg-gray-900 text-yellow-400 border-t-2 border-yellow-400"
                : "text-gray-400 hover:text-white"
            }`}
          >
            🏏 Global Franchise Leagues
          </button>
          <button
            onClick={() => setActiveTab("world_cup")}
            className={`px-4 py-2.5 text-xs font-black rounded-t-xl transition-all ${
              activeTab === "world_cup"
                ? "bg-gray-900 text-cyan-400 border-t-2 border-cyan-400"
                : "text-gray-400 hover:text-white"
            }`}
          >
            🏆 International T20 World Cup
          </button>
          <button
            onClick={() => setActiveTab("sandbox")}
            className={`px-4 py-2.5 text-xs font-black rounded-t-xl transition-all ${
              activeTab === "sandbox"
                ? "bg-gray-900 text-purple-400 border-t-2 border-purple-400"
                : "text-gray-400 hover:text-white"
            }`}
          >
            🛠️ Custom Rule Sandbox
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 md:p-6 overflow-y-auto space-y-6 flex-1">
          {/* Tab 1: Global Leagues */}
          {activeTab === "leagues" && (
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              {/* League Cards */}
              <div className="md:col-span-5 space-y-2.5 max-h-[460px] overflow-y-auto pr-1">
                {Object.values(GLOBAL_LEAGUES)
                  .filter((l) => l.id !== "t20_world_cup")
                  .map((league) => (
                    <div
                      key={league.id}
                      onClick={() => setSelectedLeague(league)}
                      className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                        selectedLeague.id === league.id
                          ? "bg-blue-950/40 border-blue-500 shadow-lg"
                          : "bg-gray-950 border-gray-800 hover:bg-gray-900"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xl">{league.badge}</span>
                          <h4 className="text-xs font-black text-white">{league.name}</h4>
                        </div>
                        <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded bg-blue-900/60 text-blue-300">
                          {league.teams.length} Teams
                        </span>
                      </div>
                      <p className="text-[11px] text-gray-400 line-clamp-2 mb-2">{league.description}</p>
                      <div className="flex items-center justify-between text-[10px] text-gray-500 font-semibold">
                        <span>Purse: {league.currency}{league.purse} {league.currencyUnit}</span>
                        <span>Max Overseas: {league.overseasLimit}</span>
                      </div>
                    </div>
                  ))}
              </div>

              {/* Selected League Detail */}
              <div className="md:col-span-7 bg-gray-950 p-5 rounded-2xl border border-gray-800 flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="flex items-start justify-between border-b border-gray-800 pb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{selectedLeague.badge}</span>
                        <h3 className="text-lg font-black text-white">{selectedLeague.name}</h3>
                      </div>
                      <p className="text-xs text-gray-400 mt-1">{selectedLeague.description}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-2xl font-black text-yellow-400">
                        {selectedLeague.currency}{selectedLeague.purse} {selectedLeague.currencyUnit}
                      </span>
                      <span className="text-[10px] text-gray-400 block font-bold uppercase">Team Purse</span>
                    </div>
                  </div>

                  {/* League Rules Metric Bar */}
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="p-2.5 bg-gray-900 rounded-xl border border-gray-800">
                      <span className="text-[10px] text-gray-400 block font-semibold uppercase">Squad Size</span>
                      <span className="text-sm font-black text-white">{selectedLeague.squadMin} - {selectedLeague.squadMax}</span>
                    </div>
                    <div className="p-2.5 bg-gray-900 rounded-xl border border-gray-800">
                      <span className="text-[10px] text-gray-400 block font-semibold uppercase">Overseas Cap</span>
                      <span className="text-sm font-black text-cyan-300">{selectedLeague.overseasLimit} Players</span>
                    </div>
                    <div className="p-2.5 bg-gray-900 rounded-xl border border-gray-800">
                      <span className="text-[10px] text-gray-400 block font-semibold uppercase">Teams</span>
                      <span className="text-sm font-black text-yellow-400">{selectedLeague.teams.length} Franchises</span>
                    </div>
                  </div>

                  {/* Teams List */}
                  <div>
                    <span className="text-xs font-bold text-gray-300 uppercase tracking-wider block mb-2">
                      Participating Franchises ({selectedLeague.teams.length})
                    </span>
                    <div className="grid grid-cols-2 gap-2 max-h-[220px] overflow-y-auto pr-1">
                      {selectedLeague.teams.map((t) => (
                        <div
                          key={t.id}
                          className="p-2 rounded-xl bg-gray-900 border border-gray-800/80 flex items-center justify-between text-xs"
                        >
                          <span className="font-extrabold text-white truncate">{t.name}</span>
                          <span className="px-1.5 py-0.5 rounded bg-gray-800 text-[10px] font-mono text-yellow-400 font-bold ml-2">
                            {t.shortName}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Apply Button */}
                <div className="pt-4 border-t border-gray-800 flex items-center justify-between mt-4">
                  <span className="text-[11px] text-gray-400">
                    {activeLeagueId === selectedLeague.id ? "🟢 Currently Active League" : "Ready to switch tournament format"}
                  </span>
                  <button
                    onClick={() => handleApplyLeague(selectedLeague)}
                    className="px-5 py-2.5 bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-400 hover:to-amber-400 text-black font-black text-xs rounded-xl shadow-lg transition"
                  >
                    🚀 Load {selectedLeague.name}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Tab 2: T20 World Cup */}
          {activeTab === "world_cup" && (
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-blue-950/60 to-indigo-950/60 border border-blue-500/40 p-5 rounded-2xl flex flex-wrap items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-3xl">🏆</span>
                    <h3 className="text-lg font-black text-white">ICC T20 World Cup International Draft</h3>
                  </div>
                  <p className="text-xs text-gray-300 mt-1 max-w-xl leading-relaxed">
                    Lead one of 10 international nations (India, Australia, England, South Africa, Pakistan, New Zealand, West Indies, Afghanistan, Sri Lanka, USA) through a World T20 draft and championship tournament.
                  </p>
                </div>
                <button
                  onClick={() => handleApplyLeague(GLOBAL_LEAGUES.t20_world_cup)}
                  className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black text-xs rounded-xl shadow-lg transition"
                >
                  🌐 Launch World Cup Mode
                </button>
              </div>

              {/* National Teams Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                {GLOBAL_LEAGUES.t20_world_cup.teams.map((team) => (
                  <div
                    key={team.id}
                    className="p-3 bg-gray-950 border border-gray-800 rounded-2xl text-center space-y-1 hover:border-blue-500/50 transition"
                  >
                    <div className="w-8 h-8 rounded-full bg-blue-500/20 text-blue-300 font-black text-xs flex items-center justify-center mx-auto">
                      {team.shortName}
                    </div>
                    <h5 className="font-extrabold text-xs text-white truncate">{team.name}</h5>
                    <span className="text-[10px] text-gray-400 block">$100M Draft Cap</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tab 3: Custom Sandbox */}
          {activeTab === "sandbox" && (
            <form onSubmit={handleLaunchSandbox} className="space-y-5 max-w-3xl mx-auto">
              <div className="bg-gray-950 p-5 rounded-2xl border border-gray-800 space-y-4">
                <h4 className="text-xs font-black text-purple-300 uppercase tracking-wider flex items-center gap-2">
                  <span>🛠️</span> Custom Tournament Rule Sandbox
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[11px] font-bold text-gray-300 block mb-1">Tournament Name</label>
                    <input
                      type="text"
                      value={customName}
                      onChange={(e) => setCustomName(e.target.value)}
                      placeholder="e.g. Champions Super League"
                      className="w-full bg-gray-900 border border-gray-700 px-3 py-2 rounded-xl text-xs text-white font-bold focus:outline-none focus:border-purple-500"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-gray-300 block mb-1">Number of Teams</label>
                    <select
                      value={customTeamsCount}
                      onChange={(e) => setCustomTeamsCount(Number(e.target.value))}
                      className="w-full bg-gray-900 border border-gray-700 px-3 py-2 rounded-xl text-xs text-white font-bold focus:outline-none focus:border-purple-500"
                    >
                      <option value={4}>4 Teams (Mini Tournament)</option>
                      <option value={6}>6 Teams (Standard League)</option>
                      <option value={8}>8 Teams (Premier League)</option>
                      <option value={10}>10 Teams (Mega Championship)</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-gray-300 block mb-1">Currency Symbol</label>
                    <div className="grid grid-cols-4 gap-1.5">
                      {["₹", "$", "A$", "R"].map((cur) => (
                        <button
                          key={cur}
                          type="button"
                          onClick={() => setCustomCurrency(cur)}
                          className={`py-1.5 rounded-lg text-xs font-bold border transition ${
                            customCurrency === cur
                              ? "bg-purple-600 text-white border-purple-400"
                              : "bg-gray-900 text-gray-400 border-gray-800"
                          }`}
                        >
                          {cur}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-gray-300 block mb-1">
                      Team Purse Cap: <span className="text-yellow-400 font-mono font-extrabold">{customCurrency}{customPurse} {customCurrency === "₹" ? "Cr" : "M"}</span>
                    </label>
                    <input
                      type="range"
                      min={30}
                      max={200}
                      step={5}
                      value={customPurse}
                      onChange={(e) => setCustomPurse(Number(e.target.value))}
                      className="w-full accent-yellow-400 cursor-pointer"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-gray-300 block mb-1">
                      Overseas Player Quota: <span className="text-cyan-300 font-mono font-extrabold">{customOverseasLimit}</span>
                    </label>
                    <input
                      type="range"
                      min={0}
                      max={11}
                      value={customOverseasLimit}
                      onChange={(e) => setCustomOverseasLimit(Number(e.target.value))}
                      className="w-full accent-cyan-400 cursor-pointer"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-gray-300 block mb-1">
                      Squad Size Range: <span className="text-purple-300 font-mono font-extrabold">{customSquadMin} to {customSquadMax}</span>
                    </label>
                    <div className="flex gap-2 items-center">
                      <input
                        type="number"
                        min={12}
                        max={customSquadMax}
                        value={customSquadMin}
                        onChange={(e) => setCustomSquadMin(Number(e.target.value))}
                        className="w-1/2 bg-gray-900 border border-gray-700 p-2 rounded-xl text-xs text-white"
                      />
                      <span className="text-gray-500">to</span>
                      <input
                        type="number"
                        min={customSquadMin}
                        max={30}
                        value={customSquadMax}
                        onChange={(e) => setCustomSquadMax(Number(e.target.value))}
                        className="w-1/2 bg-gray-900 border border-gray-700 p-2 rounded-xl text-xs text-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-gray-300 block mb-1">
                      RTM Cards per Team: <span className="text-amber-400 font-mono font-extrabold">{customRtmCount}</span>
                    </label>
                    <input
                      type="range"
                      min={0}
                      max={6}
                      value={customRtmCount}
                      onChange={(e) => setCustomRtmCount(Number(e.target.value))}
                      className="w-full accent-amber-400 cursor-pointer"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-gray-300 block mb-1">Auction Timer Speed</label>
                    <select
                      value={customTimerSpeed}
                      onChange={(e) => setCustomTimerSpeed(e.target.value)}
                      className="w-full bg-gray-900 border border-gray-700 px-3 py-2 rounded-xl text-xs text-white font-bold focus:outline-none focus:border-purple-500"
                    >
                      <option value="blitz">⚡ 3s Blitz</option>
                      <option value="standard">⏱️ 5s Standard</option>
                      <option value="tactical">🧠 10s Tactical</option>
                      <option value="manual">🔨 Manual Host Control</option>
                    </select>
                  </div>
                </div>

                <div className="pt-3 border-t border-gray-800 flex justify-end">
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-black text-xs rounded-xl shadow-lg transition"
                  >
                    🚀 Deploy Custom Tournament
                  </button>
                </div>
              </div>
            </form>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-gray-950 border-t border-gray-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-gray-800 hover:bg-gray-700 text-white font-bold text-xs rounded-xl transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
