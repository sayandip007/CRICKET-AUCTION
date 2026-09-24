import React from "react";

export const MultiplayerSettingsModal = ({
  isOpen,
  onClose,
  teams,
  humanTeamIds,
  onUpdateHumanTeams,
  managerNames,
  onUpdateManagerName,
  activePaddleTeamId,
  onChangeActivePaddle,
}) => {
  if (!isOpen) return null;

  const isHuman = (id) => humanTeamIds.includes(id);

  const toggleTeam = (id) => {
    if (isHuman(id)) {
      if (humanTeamIds.length <= 1) {
        return; // At least one human team must remain
      }
      onUpdateHumanTeams(humanTeamIds.filter((tId) => tId !== id));
    } else {
      onUpdateHumanTeams([...humanTeamIds, id]);
    }
  };

  const handleSelectPreset = (type) => {
    if (type === "solo") {
      onUpdateHumanTeams([humanTeamIds[0] || 1]);
    } else if (type === "derby") {
      // Pick 2 classic rivals e.g. CSK & MI
      onUpdateHumanTeams([1, 6]); // CSK & MI
    } else if (type === "quad") {
      onUpdateHumanTeams([1, 6, 9, 4]); // CSK, MI, RCB, KKR
    } else if (type === "all") {
      onUpdateHumanTeams(teams.map((t) => t.id));
    }
  };

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-md flex justify-center items-center z-50 p-4">
      <div className="bg-gradient-to-b from-gray-900 via-gray-900 to-black border-2 border-yellow-500/80 p-6 md:p-8 rounded-3xl shadow-2xl max-w-3xl w-full text-white relative max-h-[90vh] flex flex-col">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-8 h-8 rounded-full bg-gray-800 hover:bg-red-600 text-white font-bold flex items-center justify-center transition-colors"
        >
          ✕
        </button>

        {/* Modal Header */}
        <div className="mb-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-yellow-500/20 border border-yellow-400/50 rounded-full text-yellow-400 font-extrabold text-xs uppercase tracking-wider mb-2">
            <span>👥 Pass-and-Play & Multi-Manager</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-black text-white">
            Franchise Control & Multiplayer
          </h2>
          <p className="text-gray-400 text-xs md:text-sm mt-1">
            Choose which franchises are managed by human players versus automated AI. Pass the paddle with friends or run a full multi-user war room!
          </p>
        </div>

        {/* Quick Presets */}
        <div className="flex flex-wrap items-center gap-2 mb-6">
          <span className="text-xs text-gray-400 font-semibold mr-1">Quick Presets:</span>
          <button
            onClick={() => handleSelectPreset("solo")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
              humanTeamIds.length === 1
                ? "bg-yellow-500 text-black border-yellow-400 shadow-md shadow-yellow-500/20"
                : "bg-gray-800/80 text-gray-300 border-gray-700 hover:bg-gray-700"
            }`}
          >
            👤 Solo Manager (1 Team)
          </button>
          <button
            onClick={() => handleSelectPreset("derby")}
            className="px-3 py-1.5 bg-gray-800/80 hover:bg-gray-700 text-gray-300 border border-gray-700 rounded-xl text-xs font-bold transition-all"
          >
            ⚔️ El Clásico Derby (CSK vs MI)
          </button>
          <button
            onClick={() => handleSelectPreset("quad")}
            className="px-3 py-1.5 bg-gray-800/80 hover:bg-gray-700 text-gray-300 border border-gray-700 rounded-xl text-xs font-bold transition-all"
          >
            🔥 Big 4 Rivals (CSK, MI, RCB, KKR)
          </button>
          <button
            onClick={() => handleSelectPreset("all")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
              humanTeamIds.length === 10
                ? "bg-green-500 text-black border-green-400 shadow-md shadow-green-500/20"
                : "bg-gray-800/80 text-gray-300 border-gray-700 hover:bg-gray-700"
            }`}
          >
            🏟️ All 10 Teams Human
          </button>
        </div>

        {/* Franchises Control Grid */}
        <div className="flex-1 overflow-y-auto pr-1 space-y-2.5">
          {teams.map((team) => {
            const human = isHuman(team.id);
            const isActivePaddle = activePaddleTeamId === team.id;
            const managerName = managerNames[team.id] || "";

            return (
              <div
                key={team.id}
                className={`p-3.5 rounded-2xl border transition-all flex flex-wrap items-center justify-between gap-3 ${
                  human
                    ? `${team.color} bg-gray-800/90 shadow-lg`
                    : "border-gray-800 bg-gray-950/70 opacity-75"
                }`}
              >
                {/* Team Info */}
                <div className="flex items-center gap-3 min-w-[200px]">
                  <div
                    className={`w-3.5 h-3.5 rounded-full ${
                      human ? "bg-green-400 ring-4 ring-green-400/20" : "bg-gray-600"
                    }`}
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-white text-sm">
                        {team.name}
                      </span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-black/40 text-gray-300 font-mono">
                        {team.shortName}
                      </span>
                    </div>
                    <p className="text-[11px] text-gray-400">
                      Purse: ₹{team.budget.toFixed(2)}Cr • Squad: {team.players.length}/25
                    </p>
                  </div>
                </div>

                {/* Manager Name Input */}
                <div className="flex items-center gap-2 flex-1 max-w-xs">
                  {human ? (
                    <input
                      type="text"
                      placeholder={`Manager Name (e.g. Player ${team.id})`}
                      value={managerName}
                      onChange={(e) => onUpdateManagerName(team.id, e.target.value)}
                      className="w-full bg-gray-900 border border-gray-700 rounded-xl px-3 py-1.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-yellow-400"
                    />
                  ) : (
                    <span className="text-xs text-gray-500 italic">Automated AI Analyst</span>
                  )}
                </div>

                {/* Controls */}
                <div className="flex items-center gap-2">
                  {human && (
                    <button
                      onClick={() => onChangeActivePaddle(team.id)}
                      className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                        isActivePaddle
                          ? "bg-yellow-400 text-black shadow-md shadow-yellow-500/30"
                          : "bg-gray-700 hover:bg-gray-600 text-gray-300"
                      }`}
                      title="Set as primary active paddle"
                    >
                      {isActivePaddle ? "⭐ Active Paddle" : "Make Active"}
                    </button>
                  )}

                  <button
                    onClick={() => toggleTeam(team.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all ${
                      human
                        ? "bg-green-500/20 border border-green-500 text-green-300 hover:bg-red-500/20 hover:border-red-500 hover:text-red-300"
                        : "bg-gray-800 hover:bg-blue-600/30 border border-gray-700 hover:border-blue-500 text-gray-400 hover:text-blue-300"
                    }`}
                  >
                    {human ? "👤 Human (Assigned)" : "🤖 AI Controlled"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Modal Footer */}
        <div className="mt-6 pt-4 border-t border-gray-800 flex flex-wrap items-center justify-between gap-3 text-xs">
          <span className="text-gray-400">
            Total Human Managers:{" "}
            <span className="text-yellow-400 font-extrabold">{humanTeamIds.length} of 10</span>{" "}
            ({10 - humanTeamIds.length} AI Teams)
          </span>

          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-yellow-500 hover:bg-yellow-400 text-black font-black text-xs rounded-xl shadow-lg transition-all"
          >
            Apply & Return to Auction
          </button>
        </div>
      </div>
    </div>
  );
};
