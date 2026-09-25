// src/components/CommunityRosterHubModal.jsx
import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";

const CURATED_COMMUNITY_ROSTERS = [
  {
    id: "rcb_2016",
    title: "RCB 2016 Peak Dynasty",
    author: "ViratForever18",
    rating: 96,
    era: "Historic 2016",
    description: "The most destructive batting lineup in IPL history with Kohli's 973-run record season, Gayle storm, and AB 360 magic.",
    color: "#d90429",
    players: [
      { name: "Virat Kohli", role: "Batsman", price: 18, country: "India" },
      { name: "Chris Gayle", role: "Batsman", price: 12, country: "West Indies" },
      { name: "AB de Villiers", role: "Batsman", price: 16, country: "South Africa" },
      { name: "KL Rahul", role: "Wicketkeeper", price: 8, country: "India" },
      { name: "Shane Watson", role: "All-Rounder", price: 9.5, country: "Australia" },
      { name: "Stuart Binny", role: "All-Rounder", price: 2, country: "India" },
      { name: "Sachin Baby", role: "Batsman", price: 1.5, country: "India" },
      { name: "Chris Jordan", role: "Bowler", price: 4, country: "England" },
      { name: "Yuzvendra Chahal", role: "Bowler", price: 7.5, country: "India" },
      { name: "Sreenath Aravind", role: "Bowler", price: 2, country: "India" },
      { name: "Varun Aaron", role: "Bowler", price: 2.5, country: "India" },
    ],
  },
  {
    id: "mi_2020",
    title: "MI 2020 Juggernaut",
    author: "PaltanHQ",
    rating: 98,
    era: "Historic 2020",
    description: "The undisputed most balanced T20 franchise squad ever assembled, lifting the trophy in dominating fashion in the UAE.",
    color: "#004ba0",
    players: [
      { name: "Rohit Sharma", role: "Batsman", price: 16, country: "India" },
      { name: "Quinton de Kock", role: "Wicketkeeper", price: 12, country: "South Africa" },
      { name: "Suryakumar Yadav", role: "Batsman", price: 14, country: "India" },
      { name: "Ishan Kishan", role: "Wicketkeeper", price: 10, country: "India" },
      { name: "Kieron Pollard", role: "All-Rounder", price: 9, country: "West Indies" },
      { name: "Hardik Pandya", role: "All-Rounder", price: 15, country: "India" },
      { name: "Krunal Pandya", role: "All-Rounder", price: 6, country: "India" },
      { name: "Rahul Chahar", role: "Bowler", price: 4, country: "India" },
      { name: "James Pattinson", role: "Bowler", price: 3, country: "Australia" },
      { name: "Trent Boult", role: "Bowler", price: 12, country: "New Zealand" },
      { name: "Jasprit Bumrah", role: "Bowler", price: 18, country: "India" },
    ],
  },
  {
    id: "csk_2018",
    title: "CSK 2018 Dad's Army Champions",
    author: "WhistlePoduOfficial",
    rating: 94,
    era: "Historic 2018",
    description: "Written off as veterans, Dhoni's yellow brigade returned from exile to storm to the IPL crown in fairytale style.",
    color: "#facc15",
    players: [
      { name: "Shane Watson", role: "All-Rounder", price: 9, country: "Australia" },
      { name: "Ambati Rayudu", role: "Batsman", price: 7, country: "India" },
      { name: "Suresh Raina", role: "Batsman", price: 11, country: "India" },
      { name: "MS Dhoni", role: "Wicketkeeper", price: 15, country: "India" },
      { name: "Faf du Plessis", role: "Batsman", price: 8, country: "South Africa" },
      { name: "Dwayne Bravo", role: "All-Rounder", price: 9, country: "West Indies" },
      { name: "Ravindra Jadeja", role: "All-Rounder", price: 12, country: "India" },
      { name: "Deepak Chahar", role: "Bowler", price: 5, country: "India" },
      { name: "Harbhajan Singh", role: "Bowler", price: 3, country: "India" },
      { name: "Shardul Thakur", role: "Bowler", price: 4, country: "India" },
      { name: "Lungi Ngidi", role: "Bowler", price: 3.5, country: "South Africa" },
    ],
  },
  {
    id: "all_time_goats",
    title: "All-Time IPL GOATs XI",
    author: "CricMaster",
    rating: 99,
    era: "Fantasy Legends",
    description: "The absolute statistical titans and match-winners across 17 years of IPL cricket.",
    color: "#8b5cf6",
    players: [
      { name: "Chris Gayle", role: "Batsman", price: 15, country: "West Indies" },
      { name: "David Warner", role: "Batsman", price: 14, country: "Australia" },
      { name: "Virat Kohli", role: "Batsman", price: 18, country: "India" },
      { name: "Suresh Raina", role: "Batsman", price: 12, country: "India" },
      { name: "AB de Villiers", role: "Batsman", price: 16, country: "South Africa" },
      { name: "MS Dhoni", role: "Wicketkeeper", price: 15, country: "India" },
      { name: "Andre Russell", role: "All-Rounder", price: 14, country: "West Indies" },
      { name: "Ravindra Jadeja", role: "All-Rounder", price: 12, country: "India" },
      { name: "Rashid Khan", role: "Bowler", price: 16, country: "Afghanistan" },
      { name: "Lasith Malinga", role: "Bowler", price: 15, country: "Sri Lanka" },
      { name: "Jasprit Bumrah", role: "Bowler", price: 18, country: "India" },
    ],
  },
];

export default function CommunityRosterHubModal({
  isOpen,
  onClose,
  userTeams,
  onLoadRosterIntoSimulation,
}) {
  const [rosters] = useState(CURATED_COMMUNITY_ROSTERS);
  const [selectedRoster, setSelectedRoster] = useState(CURATED_COMMUNITY_ROSTERS[0]);
  const [savedUserSquads, setSavedUserSquads] = useState([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("ipl_saved_community_squads");
      if (stored) {
        const parsed = JSON.parse(stored);
        setSavedUserSquads(parsed);
      }
    } catch (e) {
      console.warn("Could not read saved squads:", e);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSaveCurrentSquadToHub = (team) => {
    if (!team || !team.players || team.players.length === 0) {
      toast.error("Team has no players to save.");
      return;
    }

    const newSquad = {
      id: `user_squad_${Date.now()}`,
      title: `${team.name} Auction Draft`,
      author: "Local Manager",
      rating: Math.min(99, Math.round(75 + team.players.length * 1.2)),
      era: "My Campaign",
      description: `Custom drafted roster with ${team.players.length} players and ₹${team.spent} Cr spent.`,
      color: "#10b981",
      players: team.players.slice(0, 15),
    };

    const updated = [newSquad, ...savedUserSquads];
    setSavedUserSquads(updated);
    try {
      localStorage.setItem("ipl_saved_community_squads", JSON.stringify(updated));
      toast.success(`Saved ${team.name} to your Community Hub roster gallery! 💾`);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCopyJson = (squad) => {
    navigator.clipboard.writeText(JSON.stringify(squad, null, 2));
    toast.success("Roster JSON copied!");
  };

  const allDisplayRosters = [...savedUserSquads, ...rosters];

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 animate-fadeIn">
      <div className="bg-gray-900 border border-gray-700 w-full max-w-5xl rounded-3xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden">
        {/* Header */}
        <div className="p-4 bg-gradient-to-r from-purple-950 via-gray-900 to-indigo-950 border-b border-gray-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl p-2 rounded-2xl bg-purple-500/20 border border-purple-500/40">🏛️</span>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg md:text-xl font-black text-white">Community Roster Hub</h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-purple-950 text-purple-300 border border-purple-500/40">
                  Dream Squads & Legacies
                </span>
              </div>
              <p className="text-xs text-gray-400">
                Explore legendary all-time IPL rosters, community creations, or publish your own squad.
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

        {/* Content Body */}
        <div className="p-4 md:p-6 overflow-y-auto space-y-6 flex-1 grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Left Column: Roster Catalog */}
          <div className="md:col-span-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Available Rosters</span>
              <span className="text-xs text-purple-400 font-bold">{allDisplayRosters.length} Squads</span>
            </div>

            <div className="space-y-2.5 max-h-[460px] overflow-y-auto pr-1">
              {allDisplayRosters.map((squad) => (
                <div
                  key={squad.id}
                  onClick={() => setSelectedRoster(squad)}
                  className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                    selectedRoster.id === squad.id
                      ? "bg-purple-950/40 border-purple-500 shadow-lg"
                      : "bg-gray-950 border-gray-800 hover:bg-gray-900"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="text-xs font-black text-white">{squad.title}</h4>
                    <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded bg-purple-900/60 text-purple-300">
                      ★ {squad.rating} OVR
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-400 line-clamp-2 mb-2">{squad.description}</p>
                  <div className="flex items-center justify-between text-[10px] text-gray-500">
                    <span>By: {squad.author}</span>
                    <span className="font-semibold text-gray-400">{squad.era}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Save Current User Franchise to Hub */}
            {userTeams && userTeams.length > 0 && (
              <div className="p-3 bg-gray-950 rounded-2xl border border-gray-800 space-y-2">
                <span className="text-[11px] font-bold text-gray-300 block">Publish Current Team to Hub:</span>
                <div className="flex gap-2">
                  <select
                    id="saveTeamSelect"
                    className="flex-1 bg-gray-900 border border-gray-700 px-2 py-1.5 rounded-xl text-xs text-white"
                  >
                    {userTeams.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name} ({(t.players || []).length} players)
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={() => {
                      const select = document.getElementById("saveTeamSelect");
                      const team = userTeams.find((t) => t.id === select?.value);
                      handleSaveCurrentSquadToHub(team);
                    }}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl transition"
                  >
                    Save
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Selected Roster Detail */}
          <div className="md:col-span-7 bg-gray-950 p-4 md:p-5 rounded-2xl border border-gray-800 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-start justify-between border-b border-gray-800 pb-3">
                <div>
                  <h3 className="text-base md:text-lg font-black text-white">{selectedRoster.title}</h3>
                  <p className="text-xs text-gray-400 mt-1">{selectedRoster.description}</p>
                </div>
                <div className="text-right shrink-0 ml-3">
                  <span className="text-2xl font-black text-yellow-400 block">{selectedRoster.rating}</span>
                  <span className="text-[10px] text-gray-400 uppercase font-bold">Overall Rating</span>
                </div>
              </div>

              {/* Player Lineup Roster */}
              <div>
                <span className="text-xs font-bold text-gray-300 uppercase tracking-wider block mb-2">
                  Roster Lineup ({selectedRoster.players.length} Players)
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[300px] overflow-y-auto pr-1">
                  {selectedRoster.players.map((p, idx) => (
                    <div
                      key={idx}
                      className="p-2 rounded-xl bg-gray-900 border border-gray-800/80 flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-2 truncate">
                        <span className="text-[10px] font-mono text-gray-500 w-4">{idx + 1}</span>
                        <div className="truncate">
                          <span className="font-extrabold text-white block truncate">{p.name}</span>
                          <span className="text-[10px] text-gray-400">{p.role} · {p.country}</span>
                        </div>
                      </div>
                      <span className="font-black text-yellow-400 text-xs shrink-0 ml-2">₹{p.price} Cr</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="pt-4 border-t border-gray-800 flex flex-wrap items-center justify-between gap-2 mt-4">
              <button
                onClick={() => handleCopyJson(selectedRoster)}
                className="px-3 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 font-bold text-xs rounded-xl transition"
              >
                📋 Copy Roster JSON
              </button>

              <button
                onClick={() => {
                  if (onLoadRosterIntoSimulation) {
                    onLoadRosterIntoSimulation(selectedRoster);
                  }
                  toast.success(`Loaded "${selectedRoster.title}" into Tournament Simulator! 🏏`);
                }}
                className="px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-black text-xs rounded-xl shadow-lg transition"
              >
                🎮 Load Into Match Simulator
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 bg-gray-950 border-t border-gray-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-gray-800 hover:bg-gray-700 text-white font-bold text-xs rounded-xl transition"
          >
            Close Hub
          </button>
        </div>
      </div>
    </div>
  );
}
