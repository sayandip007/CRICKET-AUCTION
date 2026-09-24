import React, { useState, useMemo } from "react";
import { FALLBACK_IMAGE } from "../utils/constants";
import { calculatePlayerRating } from "../utils/auctionRules";

export const PlayerEditorModal = ({
  isOpen,
  onClose,
  allPlayers,
  onSavePlayers,
  activeRosterPreset,
  onSelectPreset,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRole, setSelectedRole] = useState("ALL");
  const [editingPlayer, setEditingPlayer] = useState(null);
  const [isAddingNew, setIsAddingNew] = useState(false);

  // New Player Form State
  const [newPlayer, setNewPlayer] = useState({
    name: "",
    role: "Batsman",
    age: 25,
    nationality: "Indian",
    basePrice: 1.0,
    matches: 30,
    runs: 650,
    highestScore: 78,
    wickets: 0,
    bestBowling: "-/-",
    battingAverage: 32.5,
    battingStrikeRate: 135.0,
    bowlingAverage: 0,
    bowlingEconomy: 0,
    bowlingStrikeRate: 0,
    isCapped: true,
    rating: 85,
    image: FALLBACK_IMAGE,
  });

  const filteredPlayers = useMemo(() => {
    return allPlayers.filter((p) => {
      const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesRole = selectedRole === "ALL" || p.role === selectedRole;
      return matchesSearch && matchesRole;
    });
  }, [allPlayers, searchTerm, selectedRole]);

  if (!isOpen) return null;

  const handleAddSubmit = (e) => {
    e.preventDefault();
    if (!newPlayer.name.trim()) return;

    const rating = newPlayer.rating || calculatePlayerRating(newPlayer);
    const created = {
      ...newPlayer,
      id: Date.now(),
      basePrice: parseFloat(newPlayer.basePrice) || 0.3,
      rating,
    };

    onSavePlayers([created, ...allPlayers]);
    setIsAddingNew(false);
    setNewPlayer({
      name: "",
      role: "Batsman",
      age: 25,
      nationality: "Indian",
      basePrice: 1.0,
      matches: 30,
      runs: 650,
      highestScore: 78,
      wickets: 0,
      bestBowling: "-/-",
      battingAverage: 32.5,
      battingStrikeRate: 135.0,
      bowlingAverage: 0,
      bowlingEconomy: 0,
      bowlingStrikeRate: 0,
      isCapped: true,
      rating: 85,
      image: FALLBACK_IMAGE,
    });
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();
    if (!editingPlayer) return;

    const rating = editingPlayer.rating || calculatePlayerRating(editingPlayer);
    const updated = {
      ...editingPlayer,
      basePrice: parseFloat(editingPlayer.basePrice) || 0.3,
      rating,
    };

    onSavePlayers(allPlayers.map((p) => (p.id === updated.id ? updated : p)));
    setEditingPlayer(null);
  };

  const handleDeletePlayer = (playerId) => {
    if (window.confirm("Are you sure you want to remove this player from the auction pool?")) {
      onSavePlayers(allPlayers.filter((p) => p.id !== playerId));
    }
  };

  const handleExportJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(allPlayers, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `cricket_auction_roster_${activeRosterPreset}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleImportJSON = (e) => {
    const fileReader = new FileReader();
    if (e.target.files && e.target.files[0]) {
      fileReader.readAsText(e.target.files[0], "UTF-8");
      fileReader.onload = (event) => {
        try {
          const parsed = JSON.parse(event.target.result);
          if (Array.isArray(parsed) && parsed.length > 0) {
            onSavePlayers(parsed);
            alert(`Successfully imported ${parsed.length} players!`);
          } else {
            alert("Invalid JSON format. Expected an array of player objects.");
          }
        } catch (err) {
          console.error("Failed to parse JSON file:", err);
          alert("Error parsing JSON file. Please ensure it is valid JSON.");
        }
      };
    }
  };

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-md flex justify-center items-center z-50 p-4">
      <div className="bg-gradient-to-b from-gray-900 via-gray-900 to-black border-2 border-indigo-500/80 p-6 md:p-8 rounded-3xl shadow-2xl max-w-4xl w-full text-white relative max-h-[92vh] flex flex-col">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-8 h-8 rounded-full bg-gray-800 hover:bg-red-600 text-white font-bold flex items-center justify-center transition-colors"
        >
          ✕
        </button>

        {/* Modal Header */}
        <div className="mb-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-500/20 border border-indigo-400/50 rounded-full text-indigo-400 font-extrabold text-xs uppercase tracking-wider mb-2">
            <span>✏️ Custom Rosters & Player Editor</span>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-2xl md:text-3xl font-black text-white">
                Roster & Database Studio
              </h2>
              <p className="text-gray-400 text-xs md:text-sm mt-0.5">
                Load authentic vintage rosters, create custom superstars, edit base prices, or import/export JSON.
              </p>
            </div>

            {/* Import / Export & Add Buttons */}
            <div className="flex items-center gap-2">
              <label className="cursor-pointer px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-300 border border-gray-700 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-md">
                <span>📤 Import JSON</span>
                <input
                  type="file"
                  accept=".json"
                  className="hidden"
                  onChange={handleImportJSON}
                />
              </label>

              <button
                onClick={handleExportJSON}
                className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-300 border border-gray-700 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-md"
              >
                📥 Export JSON
              </button>

              <button
                onClick={() => {
                  setIsAddingNew(!isAddingNew);
                  setEditingPlayer(null);
                }}
                className="px-3.5 py-1.5 bg-yellow-500 hover:bg-yellow-400 text-black font-extrabold rounded-xl text-xs transition-all shadow-md flex items-center gap-1"
              >
                {isAddingNew ? "✕ Cancel" : "➕ Add Player"}
              </button>
            </div>
          </div>
        </div>

        {/* Roster Preset Selector Tabs */}
        <div className="bg-gray-950/80 p-2 rounded-2xl border border-gray-800 mb-4 flex flex-wrap items-center gap-2">
          <span className="text-xs text-gray-400 font-bold px-2">Preset Database:</span>
          <button
            onClick={() => onSelectPreset("2025_mega")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeRosterPreset === "2025_mega"
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                : "bg-gray-800/80 text-gray-400 hover:text-white"
            }`}
          >
            🏏 2025 Mega Auction (Default 500+)
          </button>
          <button
            onClick={() => onSelectPreset("2008_vintage")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeRosterPreset === "2008_vintage"
                ? "bg-yellow-500 text-black font-black shadow-md shadow-yellow-500/30"
                : "bg-gray-800/80 text-gray-400 hover:text-white"
            }`}
          >
            🕰️ 2008 Historic Inaugural (Tendulkar, Warne, Dhoni)
          </button>
          <button
            onClick={() => onSelectPreset("legends")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeRosterPreset === "legends"
                ? "bg-gradient-to-r from-amber-500 to-red-500 text-white font-black shadow-md"
                : "bg-gray-800/80 text-gray-400 hover:text-white"
            }`}
          >
            ⭐ All-Time Legends & T20 Titans
          </button>
        </div>

        {/* Add New Player Form Drawer */}
        {isAddingNew && (
          <form
            onSubmit={handleAddSubmit}
            className="mb-4 bg-gray-950/90 border-2 border-yellow-500/60 p-4 rounded-2xl shadow-xl flex flex-col gap-3 animate-fadeIn"
          >
            <div className="flex items-center justify-between border-b border-gray-800 pb-2">
              <h3 className="font-extrabold text-sm text-yellow-400">
                ➕ Create & Inject Custom Player into Pool
              </h3>
              <span className="text-xs text-gray-400 font-mono">
                Calculated Rating: ★ {newPlayer.rating || 85}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
              <div>
                <label className="text-gray-400 block mb-1">Player Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Liam Livingstone"
                  value={newPlayer.name}
                  onChange={(e) => setNewPlayer({ ...newPlayer, name: e.target.value })}
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg p-2 text-white text-xs focus:border-yellow-400 outline-none"
                />
              </div>

              <div>
                <label className="text-gray-400 block mb-1">Role</label>
                <select
                  value={newPlayer.role}
                  onChange={(e) => setNewPlayer({ ...newPlayer, role: e.target.value })}
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg p-2 text-white text-xs focus:border-yellow-400 outline-none"
                >
                  <option value="Batsman">Batsman</option>
                  <option value="Bowler">Bowler</option>
                  <option value="All-Rounder">All-Rounder</option>
                  <option value="Wicketkeeper">Wicketkeeper</option>
                </select>
              </div>

              <div>
                <label className="text-gray-400 block mb-1">Base Price (₹ Cr)</label>
                <input
                  type="number"
                  step="0.1"
                  min="0.3"
                  max="2.0"
                  value={newPlayer.basePrice}
                  onChange={(e) => setNewPlayer({ ...newPlayer, basePrice: parseFloat(e.target.value) || 0.3 })}
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg p-2 text-white text-xs focus:border-yellow-400 outline-none"
                />
              </div>

              <div>
                <label className="text-gray-400 block mb-1">Nationality</label>
                <input
                  type="text"
                  placeholder="Indian / Australian etc."
                  value={newPlayer.nationality}
                  onChange={(e) => setNewPlayer({ ...newPlayer, nationality: e.target.value })}
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg p-2 text-white text-xs focus:border-yellow-400 outline-none"
                />
              </div>

              <div>
                <label className="text-gray-400 block mb-1">Rating (50 - 99)</label>
                <input
                  type="number"
                  min="50"
                  max="99"
                  value={newPlayer.rating}
                  onChange={(e) => setNewPlayer({ ...newPlayer, rating: parseInt(e.target.value) || 85 })}
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg p-2 text-white text-xs focus:border-yellow-400 outline-none"
                />
              </div>

              <div>
                <label className="text-gray-400 block mb-1">Career Matches</label>
                <input
                  type="number"
                  value={newPlayer.matches}
                  onChange={(e) => setNewPlayer({ ...newPlayer, matches: parseInt(e.target.value) || 0 })}
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg p-2 text-white text-xs focus:border-yellow-400 outline-none"
                />
              </div>

              <div>
                <label className="text-gray-400 block mb-1">Batting Strike Rate</label>
                <input
                  type="number"
                  step="0.1"
                  value={newPlayer.battingStrikeRate}
                  onChange={(e) => setNewPlayer({ ...newPlayer, battingStrikeRate: parseFloat(e.target.value) || 0 })}
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg p-2 text-white text-xs focus:border-yellow-400 outline-none"
                />
              </div>

              <div>
                <label className="text-gray-400 block mb-1">Wickets</label>
                <input
                  type="number"
                  value={newPlayer.wickets}
                  onChange={(e) => setNewPlayer({ ...newPlayer, wickets: parseInt(e.target.value) || 0 })}
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg p-2 text-white text-xs focus:border-yellow-400 outline-none"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsAddingNew(false)}
                className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs font-semibold rounded-lg"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 bg-green-500 hover:bg-green-400 text-black font-extrabold text-xs rounded-lg shadow-md"
              >
                💾 Save & Add to Auction Pool
              </button>
            </div>
          </form>
        )}

        {/* Edit Player Form Drawer */}
        {editingPlayer && (
          <form
            onSubmit={handleEditSubmit}
            className="mb-4 bg-gray-950/90 border-2 border-indigo-500/60 p-4 rounded-2xl shadow-xl flex flex-col gap-3 animate-fadeIn"
          >
            <div className="flex items-center justify-between border-b border-gray-800 pb-2">
              <h3 className="font-extrabold text-sm text-indigo-300">
                ✏️ Edit Player: {editingPlayer.name}
              </h3>
              <span className="text-xs text-gray-400 font-mono">ID: {editingPlayer.id}</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
              <div>
                <label className="text-gray-400 block mb-1">Player Name</label>
                <input
                  type="text"
                  required
                  value={editingPlayer.name}
                  onChange={(e) => setEditingPlayer({ ...editingPlayer, name: e.target.value })}
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg p-2 text-white text-xs focus:border-indigo-400 outline-none"
                />
              </div>

              <div>
                <label className="text-gray-400 block mb-1">Role</label>
                <select
                  value={editingPlayer.role}
                  onChange={(e) => setEditingPlayer({ ...editingPlayer, role: e.target.value })}
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg p-2 text-white text-xs focus:border-indigo-400 outline-none"
                >
                  <option value="Batsman">Batsman</option>
                  <option value="Bowler">Bowler</option>
                  <option value="All-Rounder">All-Rounder</option>
                  <option value="Wicketkeeper">Wicketkeeper</option>
                </select>
              </div>

              <div>
                <label className="text-gray-400 block mb-1">Base Price (₹ Cr)</label>
                <input
                  type="number"
                  step="0.1"
                  min="0.3"
                  max="2.0"
                  value={editingPlayer.basePrice}
                  onChange={(e) => setEditingPlayer({ ...editingPlayer, basePrice: parseFloat(e.target.value) || 0.3 })}
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg p-2 text-white text-xs focus:border-indigo-400 outline-none"
                />
              </div>

              <div>
                <label className="text-gray-400 block mb-1">Rating (50 - 99)</label>
                <input
                  type="number"
                  min="50"
                  max="99"
                  value={editingPlayer.rating || 85}
                  onChange={(e) => setEditingPlayer({ ...editingPlayer, rating: parseInt(e.target.value) || 85 })}
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg p-2 text-white text-xs focus:border-indigo-400 outline-none"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setEditingPlayer(null)}
                className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs font-semibold rounded-lg"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs rounded-lg shadow-md"
              >
                Update Player
              </button>
            </div>
          </form>
        )}

        {/* Search & Filter Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-2 flex-1 max-w-sm">
            <input
              type="text"
              placeholder="Search player by name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-gray-950 border border-gray-800 rounded-xl px-3.5 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="flex items-center gap-1.5 text-xs">
            {["ALL", "Batsman", "Bowler", "All-Rounder", "Wicketkeeper"].map((role) => (
              <button
                key={role}
                onClick={() => setSelectedRole(role)}
                className={`px-2.5 py-1 rounded-lg font-semibold transition-all ${
                  selectedRole === role
                    ? "bg-indigo-600 text-white font-bold"
                    : "bg-gray-800/80 text-gray-400 hover:text-white"
                }`}
              >
                {role === "ALL" ? "All Roles" : role}
              </button>
            ))}
          </div>
        </div>

        {/* Players List Table */}
        <div className="flex-1 overflow-y-auto pr-1 border border-gray-800 rounded-2xl bg-gray-950/60">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-gray-900/90 text-gray-400 text-[11px] uppercase tracking-wider sticky top-0 z-10 border-b border-gray-800">
                <th className="p-3">Player</th>
                <th className="p-3">Role</th>
                <th className="p-3">Rating</th>
                <th className="p-3">Base Price</th>
                <th className="p-3">Nationality</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/60">
              {filteredPlayers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-10 text-gray-500">
                    No players matching criteria.
                  </td>
                </tr>
              ) : (
                filteredPlayers.slice(0, 150).map((player) => (
                  <tr key={player.id} className="hover:bg-gray-800/50 transition-colors">
                    <td className="p-3 flex items-center gap-2.5">
                      <img
                        src={player.image || FALLBACK_IMAGE}
                        alt={player.name}
                        className="w-7 h-7 rounded-full object-cover border border-gray-700"
                      />
                      <span className="font-bold text-white truncate max-w-[180px]">
                        {player.name}
                      </span>
                    </td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded bg-gray-800 text-gray-300 font-medium">
                        {player.role}
                      </span>
                    </td>
                    <td className="p-3 font-mono font-bold text-yellow-400">
                      ★ {player.rating || 85}
                    </td>
                    <td className="p-3 font-mono font-bold text-green-400">
                      ₹{player.basePrice?.toFixed(2)}Cr
                    </td>
                    <td className="p-3 text-gray-300">
                      {player.nationality || "Indian"}
                    </td>
                    <td className="p-3 text-right space-x-1.5">
                      <button
                        onClick={() => {
                          setEditingPlayer(player);
                          setIsAddingNew(false);
                        }}
                        className="px-2.5 py-1 rounded bg-indigo-950 border border-indigo-600/50 text-indigo-300 hover:bg-indigo-900 font-bold transition-all"
                        title="Edit Player"
                      >
                        ✏️ Edit
                      </button>
                      <button
                        onClick={() => handleDeletePlayer(player.id)}
                        className="px-2.5 py-1 rounded bg-red-950/60 border border-red-700/50 text-red-300 hover:bg-red-900 font-bold transition-all"
                        title="Delete Player"
                      >
                        🗑️
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Modal Footer */}
        <div className="mt-4 pt-3 border-t border-gray-800 flex flex-wrap items-center justify-between gap-3 text-xs">
          <span className="text-gray-400 font-mono">
            Total Players in Active Pool:{" "}
            <span className="text-yellow-400 font-black">{allPlayers.length}</span>{" "}
            (Showing {filteredPlayers.length} filtered)
          </span>

          <button
            onClick={onClose}
            className="px-6 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs rounded-xl shadow-lg transition-all"
          >
            Done & Apply Pool
          </button>
        </div>
      </div>
    </div>
  );
};
