import React, { useState, useEffect } from "react";
import players from "./data/players.json";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { jsPDF } from "jspdf";
import "./index.css";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";

// === IPL Teams ===
const iplTeams = [
  {
    id: 1,
    name: "Mumbai Indians",
    color: "border-blue-600",
    budget: 100,
    players: [],
  },
  {
    id: 2,
    name: "Chennai Super Kings",
    color: "border-yellow-400",
    budget: 100,
    players: [],
  },
  {
    id: 3,
    name: "Royal Challengers Bangalore",
    color: "border-red-700",
    budget: 100,
    players: [],
  },
  {
    id: 4,
    name: "Kolkata Knight Riders",
    color: "border-purple-800",
    budget: 100,
    players: [],
  },
  {
    id: 5,
    name: "Delhi Capitals",
    color: "border-sky-600",
    budget: 100,
    players: [],
  },
  {
    id: 6,
    name: "Sunrisers Hyderabad",
    color: "border-orange-500",
    budget: 100,
    players: [],
  },
  {
    id: 7,
    name: "Rajasthan Royals",
    color: "border-pink-400",
    budget: 100,
    players: [],
  },
  {
    id: 8,
    name: "Lucknow Super Giants",
    color: "border-cyan-400",
    budget: 100,
    players: [],
  },
  {
    id: 9,
    name: "Gujarat Titans",
    color: "border-blue-900",
    budget: 100,
    players: [],
  },
  {
    id: 10,
    name: "Punjab Kings",
    color: "border-red-500",
    budget: 100,
    players: [],
  },
];

// === Role images ===
const roleImages = {
  Batsman: "/images/roles/Batsman.png",
  Bowler: "/images/roles/Bowler.png",
  Wicketkeeper: "/images/roles/Wicketkeeper.png",
  "All-Rounder": "/images/roles/All-Rounder.png",
};

function App() {
  // === State ===
  const [teams, setTeams] = useState(iplTeams);
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
  const [currentBid, setCurrentBid] = useState(players[0].basePrice);
  const [currentBidderIndex, setCurrentBidderIndex] = useState(0);
  const [lastBidders, setLastBidders] = useState([]);
  const [auctionEnded, setAuctionEnded] = useState(false);
  const [showRosterModal, setShowRosterModal] = useState(null);
  const [showPlayerStats, setShowPlayerStats] = useState(null);
  const [passedTeams, setPassedTeams] = useState([]);
  const [userTeamId, setUserTeamId] = useState(null);
  const [auctionStarted, setAuctionStarted] = useState(false);

  const [auctionLog, setAuctionLog] = useState(
    players.map((p) => ({
      id: p.id,
      name: p.name,
      basePrice: p.basePrice,
      soldPrice: p.basePrice,
      soldTo: "Unsold",
      role: p.role,
      image: p.image,
    }))
  );

  const currentPlayer = players[currentPlayerIndex];

  // === Helper Functions ===
  const getIncrement = () =>
    currentBid < 1 ? 0.05 : currentBid < 2 ? 0.1 : 0.2;

  const triggerBidToast = (msg, teamId = null, type = "info") => {
    const options = {
      autoClose: 3000,
      pauseOnHover: true,
      position: "top-center",
      className: "blink-toast",
    };
    if (type === "success") toast.success(msg, options);
    else if (type === "warning") toast.warning(msg, options);
    else toast.info(msg, options);

    if (teamId !== null)
      setLastBidders((prev) => [teamId, ...prev].slice(0, 2));
  };

  const isImportantPlayer = (player) =>
    player.rating >= 85 || player.basePrice >= 2;

  // === Manual Bid (User Only) ===
  const handleBid = (teamId) => {
    if (teamId - 1 === currentBidderIndex) return;
    const newBid = parseFloat((currentBid + getIncrement()).toFixed(2));
    setCurrentBid(newBid);
    setCurrentBidderIndex(teamId - 1);
    triggerBidToast(
      `${teams[teamId - 1].name} bids ₹${newBid.toFixed(2)}Cr`,
      teamId
    );
  };

  // === Manual Pass (User Only) ===
  const handlePass = () => {
    // Ensure it's the user's turn
    if (userTeamId - 1 !== currentBidderIndex) return;

    // Add to passed teams
    setPassedTeams((prev) => [...prev, userTeamId]);

    triggerBidToast(
      `${teams[userTeamId - 1].name} passed!`,
      userTeamId,
      "warning"
    );

    // Move to next active bidder
    let nextBidderIndex = (currentBidderIndex + 1) % teams.length;
    const activeBidders = teams
      .map((t, idx) => idx)
      .filter(
        (idx) =>
          !passedTeams.includes(idx + 1) && // idx+1 because passedTeams stores 1-based IDs
          idx !== currentBidderIndex // skip current
      );

    if (activeBidders.length) {
      nextBidderIndex = activeBidders[0];
      setCurrentBidderIndex(nextBidderIndex);
    }
  };

  // === Sell Player ===
  const sellPlayer = () => {
    if (!currentPlayer) return;
    const updatedTeams = [...teams];
    const winner = updatedTeams[currentBidderIndex];

    const totalPlayersInTeams = updatedTeams.reduce(
      (sum, t) => sum + t.players.length,
      0
    );
    const maxSlots = 10 * 25;

    if (!isImportantPlayer(currentPlayer) && totalPlayersInTeams >= maxSlots) {
      if (Math.random() < 0.4) {
        setAuctionLog((prev) =>
          prev.map((p) =>
            p.id === currentPlayer.id
              ? { ...p, soldPrice: 0, soldTo: "Unsold" }
              : p
          )
        );
        triggerBidToast(
          `❌ ${currentPlayer.name} remained UNSOLD (slots full)`,
          null,
          "warning"
        );
        const nextIndex = currentPlayerIndex + 1;
        setCurrentPlayerIndex(nextIndex);
        setCurrentBid(players[nextIndex]?.basePrice || 0);
        setCurrentBidderIndex(0);
        setLastBidders([]);
        return;
      }
    }

    if (winner) {
      winner.players.push({ ...currentPlayer, bidPrice: currentBid });
      winner.budget -= currentBid;
      setTeams(updatedTeams);

      setAuctionLog((prev) =>
        prev.map((p) =>
          p.id === currentPlayer.id
            ? { ...p, soldPrice: currentBid, soldTo: winner.name }
            : p
        )
      );

      triggerBidToast(
        `🔥 ${currentPlayer.name} SOLD to ${
          winner.name
        } for ₹${currentBid.toFixed(2)}Cr 🔥`,
        winner.id,
        "success"
      );
    }

    const nextIndex = currentPlayerIndex + 1;
    if (nextIndex >= players.length) {
      const incompleteTeams = teams.filter((team) => team.players.length < 18);
      if (incompleteTeams.length > 0) {
        incompleteTeams.forEach((team) =>
          triggerBidToast(
            `⚠️ ${team.name} has less than 18 players! Add more before ending auction.`,
            team.id,
            "warning"
          )
        );
        return;
      }
      setAuctionEnded(true);
    } else {
      setCurrentPlayerIndex(nextIndex);
      setCurrentBid(players[nextIndex].basePrice);
      setCurrentBidderIndex(0);
      setLastBidders([]);
      setPassedTeams([]); // Reset passed teams for next player
    }
  };

  // === AI Auto-sell Warning Sequence ===
  useEffect(() => {
    if (auctionEnded || !currentPlayer) return;

    // Clear previous timer
    let timer = null;

    // Set new timer
    timer = setTimeout(() => {
      // Trigger warning first
      triggerBidToast("⏳ Any more bids? Fair warning!", null, "warning");

      // After 10 sec, final warning
      setTimeout(() => {
        triggerBidToast(
          "⚠️ Last chance for bidding! Make it count!",
          null,
          "warning"
        );
      }, 10000);

      // After 10 sec, auto-sell player
      setTimeout(() => {
        sellPlayer();
      }, 10000);
    }, 10000); // 10 seconds of inactivity

    // Cleanup on next bid or pass
    return () => clearTimeout(timer);
  }, [currentBid, currentPlayer]);

  // === AI Bidding ===
  useEffect(() => {
    if (!currentPlayer || auctionEnded) return;

    const timer = setTimeout(() => {
      const activeTeams = teams
        .map((t, idx) => ({ team: t, idx }))
        .filter(
          ({ team, idx }) =>
            team.budget >= currentBid + getIncrement() &&
            idx !== currentBidderIndex &&
            idx + 1 !== userTeamId
        );

      if (!activeTeams.length) {
        autoSellSequence();
        return;
      }

      const scoredTeams = activeTeams.map(({ team }) => {
        const roleCount = team.players.filter(
          (p) => p.role === currentPlayer.role
        ).length;
        const overseasCount = team.players.filter(
          (p) => p.nationality !== "Indian"
        ).length;
        let score = team.budget;
        if (roleCount >= 8) score -= 50;
        if (currentPlayer.nationality !== "Indian" && overseasCount >= 8)
          score -= 50;
        if (currentPlayer.rating >= 90) score += 20;
        score *= 0.9 + Math.random() * 0.2;
        return { team, score };
      });

      scoredTeams.sort((a, b) => b.score - a.score);
      const aiTeam = scoredTeams[0].team;

      if (Math.random() < 0.2) {
        // AI passes automatically
        setPassedTeams((prev) => [...prev, aiTeam.id]);
        triggerBidToast(`${aiTeam.name} passed!`, aiTeam.id, "warning");
        return;
      }

      const newBid = parseFloat((currentBid + getIncrement()).toFixed(2));
      setCurrentBid(newBid);
      setCurrentBidderIndex(aiTeam.id - 1);
      triggerBidToast(`${aiTeam.name} bids ₹${newBid.toFixed(2)}Cr`, aiTeam.id);
    }, 3500);

    return () => clearTimeout(timer);
  }, [currentBid, currentPlayer, teams, auctionEnded]);

  // === PDF Export ===
  const exportPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text("IPL Auction Sheet", 14, 22);
    let y = 30;
    auctionLog.forEach((p) => {
      doc.setFontSize(12);
      doc.text(
        `${p.name} (${p.role}) - ₹${p.soldPrice}Cr -> ${p.soldTo}`,
        14,
        y
      );
      y += 10;
    });
    doc.save("auction-sheet.pdf");
  };

  // === Drag-and-Drop ===
  const onDragEnd = (result) => {
    const { source, destination } = result;
    if (!destination) return;
    const sourceTeam = teams.find((t) => t.id === parseInt(source.droppableId));
    const destTeam = teams.find(
      (t) => t.id === parseInt(destination.droppableId)
    );
    const draggedPlayer = sourceTeam.players[source.index];
    sourceTeam.players.splice(source.index, 1);
    destTeam.players.splice(destination.index, 0, draggedPlayer);
    setTeams([...teams]);
  };

  // === Rendering Modals and Player Cards ===
  const PlayerCard = ({ player, currentBid }) => {
    const isOverseas = player.nationality !== "Indian";
    return (
      <div
        className="bg-gradient-to-tr from-gray-800 via-gray-900 to-black rounded-3xl shadow-2xl w-full md:w-96 p-6 text-center border-2 border-indigo-500 hover:border-yellow-400 ring-2 ring-indigo-600 hover:ring-yellow-500 backdrop-blur-md transition-all duration-500 mb-6 cursor-pointer"
        onClick={() => setShowPlayerStats(player)}
      >
        <div className="relative w-32 h-32 mx-auto mb-5">
          <img
            src={player.image}
            alt={player.name}
            className="w-full h-full rounded-full border-4 border-indigo-500 shadow-2xl object-cover"
          />
          <img
            src={roleImages[player.role]}
            alt={player.role}
            title={player.role}
            className="w-8 h-8 absolute bottom-0 right-0 border-2 border-white rounded-full shadow-lg"
          />
        </div>
        <h2 className="text-2xl md:text-3xl font-extrabold text-yellow-300 mb-1">
          {player.name}
        </h2>
        <p className="text-gray-300 text-sm md:text-base mb-4">
          {player.role} {isOverseas && "(🌏 Overseas)"}
        </p>
        <div className="flex justify-center gap-6 text-white mb-5">
          <p className="text-gray-400 text-sm md:text-base">
            Base: ₹{player.basePrice.toFixed(2)}Cr
          </p>
          <p className="font-semibold text-lg md:text-xl text-green-400">
            Bid: ₹{currentBid.toFixed(2)}Cr
          </p>
        </div>
      </div>
    );
  };

  // === Player Stats Modal ===
  const PlayerStatsModal = ({ player }) => (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50">
      <div className="bg-gray-900 p-6 rounded-2xl shadow-2xl w-11/12 md:w-1/2 text-white relative overflow-y-auto max-h-[80vh]">
        <button
          className="absolute top-3 right-3 text-red-500 font-bold"
          onClick={() => setShowPlayerStats(null)}
        >
          X
        </button>
        <h2 className="text-2xl font-bold mb-3">{player.name} Stats</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-gray-200 text-sm md:text-base">
          <p>
            <span className="font-semibold">Role:</span> {player.role}
          </p>
          <p>
            <span className="font-semibold">Age:</span> {player.age}
          </p>
          <p>
            <span className="font-semibold">Nationality:</span>{" "}
            {player.nationality}
          </p>
          <p>
            <span className="font-semibold">Matches:</span> {player.matches}
          </p>
          <p>
            <span className="font-semibold">Runs:</span> {player.runs}
          </p>
          <p>
            <span className="font-semibold">Highest Score:</span>{" "}
            {player.highestScore}
          </p>
          <p>
            <span className="font-semibold">Batting Average:</span>{" "}
            {player.battingAverage}
          </p>
          <p>
            <span className="font-semibold">Batting Strike Rate:</span>{" "}
            {player.battingStrikeRate}
          </p>
          <p>
            <span className="font-semibold">Wickets:</span> {player.wickets}
          </p>
          <p>
            <span className="font-semibold">Best Bowling:</span>{" "}
            {player.bestBowling}
          </p>
          <p>
            <span className="font-semibold">Bowling Average:</span>{" "}
            {player.bowlingAverage}
          </p>
          <p>
            <span className="font-semibold">Bowling Economy:</span>{" "}
            {player.bowlingEconomy}
          </p>
          <p>
            <span className="font-semibold">Bowling Strike Rate:</span>{" "}
            {player.bowlingStrikeRate}
          </p>
        </div>
      </div>
    </div>
  );

  // === Team Dashboard Data ===
  const getTeamStats = (team) => {
    const totalSpent = 100 - team.budget;
    const overseasPlayers = team.players.filter(
      (p) => p.nationality !== "Indian"
    ).length;

    const roleDistribution = team.players.reduce((acc, player) => {
      acc[player.role] = (acc[player.role] || 0) + 1;
      return acc;
    }, {});

    return { totalSpent, overseasPlayers, roleDistribution };
  };

  // === Team Roster Modal ===
  const TeamRosterModal = ({ team }) => (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50">
      <div className="bg-gray-900 p-6 rounded-2xl shadow-2xl w-11/12 md:w-1/2 text-white relative overflow-y-auto max-h-[80vh]">
        <button
          className="absolute top-3 right-3 text-red-500 font-bold"
          onClick={() => setShowRosterModal(null)}
        >
          X
        </button>
        <h2 className="text-2xl font-bold mb-3">{team.name} Roster</h2>
        <p className="mb-3">
          Total Spent: ₹{(100 - team.budget).toFixed(2)}Cr | Budget Left: ₹
          {team.budget.toFixed(2)}Cr
        </p>
        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId={`${team.id}`}>
            {(provided) => (
              <table
                ref={provided.innerRef}
                {...provided.droppableProps}
                className="w-full mt-2 table-auto border-collapse border border-gray-500 text-sm md:text-base"
              >
                <thead>
                  <tr className="bg-gray-700">
                    <th className="border px-3 py-1">Player</th>
                    <th className="border px-3 py-1">Role</th>
                    <th className="border px-3 py-1">Price (Cr)</th>
                  </tr>
                </thead>
                <tbody>
                  {team.players.map((p, idx) => (
                    <Draggable key={p.id} draggableId={`${p.id}`} index={idx}>
                      {(provided) => (
                        <tr
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          className="hover:bg-gray-800 transition-all"
                        >
                          <td className="border px-3 py-1 flex items-center gap-2">
                            <img
                              src={p.image}
                              className="w-6 h-6 rounded-full"
                            />
                            {p.name}
                          </td>
                          <td className="border px-3 py-1">{p.role}</td>
                          <td className="border px-3 py-1">
                            {p.bidPrice.toFixed(2)}
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
      </div>
    </div>
  );

  // === Auction Sheet ===
  const AuctionSheet = () => (
    <div className="w-full mt-8 bg-gray-800 p-6 rounded-2xl shadow-2xl text-white overflow-x-auto">
      <h2 className="text-2xl font-bold mb-4">Auction Sheet</h2>
      <button
        onClick={exportPDF}
        className="mb-4 px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-black rounded"
      >
        Download PDF
      </button>
      <table className="table-auto w-full border-collapse border border-gray-500 text-sm md:text-base">
        <thead>
          <tr className="bg-gray-700">
            <th className="border px-3 py-1">Player</th>
            <th className="border px-3 py-1">Role</th>
            <th className="border px-3 py-1">Base Price (Cr)</th>
            <th className="border px-3 py-1">Sold Price (Cr)</th>
            <th className="border px-3 py-1">Sold To</th>
          </tr>
        </thead>
        <tbody>
          {auctionLog.map((p) => (
            <tr key={p.id} className="hover:bg-gray-800 transition-all">
              <td className="border px-3 py-1 flex items-center gap-2">
                <img
                  src={p.image}
                  alt={p.name}
                  className="w-8 h-8 rounded-full"
                />
                <img
                  src={roleImages[p.role]}
                  alt={p.role}
                  title={p.role}
                  className="w-5 h-5"
                />
                {p.name}
              </td>
              <td className="border px-3 py-1">{p.role}</td>
              <td className="border px-3 py-1">{p.basePrice.toFixed(2)}</td>
              <td className="border px-3 py-1">{p.soldPrice.toFixed(2)}</td>
              <td className="border px-3 py-1">{p.soldTo}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  // === Team Selection Modal ===

  const TeamSelectionModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex justify-center items-center z-50">
      <div className="bg-gray-900 p-6 rounded-2xl shadow-2xl w-11/12 md:w-1/2 text-white text-center">
        <h2 className="text-2xl font-bold mb-4">Select Your Team</h2>
        <div className="grid grid-cols-2 gap-4">
          {teams.map((team) => (
            <button
              key={team.id}
              className="px-4 py-2 bg-blue-700 hover:bg-blue-800 rounded text-white"
              onClick={() => {
                setUserTeamId(team.id);
                setAuctionStarted(true);
              }}
            >
              {team.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  // === Render App ===
  if (!auctionStarted) return <TeamSelectionModal />;

  if (auctionEnded) {
    return (
      <div className="min-h-screen p-5 bg-gray-900">
        <h1 className="text-4xl font-bold text-center mb-5 text-white">
          Auction Ended
        </h1>
        <AuctionSheet />
        <ToastContainer position="top-center" newestOnTop limit={2} />
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center min-h-screen p-5 relative bg-gray-900">
      <h1 className="text-4xl font-bold text-center mb-5 text-white">
        IPL-Style Cricket Auction
      </h1>

      <PlayerCard player={currentPlayer} currentBid={currentBid} />

      {/* Bid Buttons */}
      <div className="flex flex-wrap gap-3 mb-6 justify-center">
        {teams.map((team) => {
          const overseasCount = team.players.filter(
            (p) => p.nationality !== "Indian"
          ).length;
          const isOverseas = currentPlayer.nationality !== "Indian";
          const maxPlayersReached = team.players.length >= 25;
          const overseasLimitReached = isOverseas && overseasCount >= 8;
          const insufficientBudget = team.budget < currentBid + getIncrement();
          const disabled =
            team.id !== userTeamId ||
            maxPlayersReached ||
            overseasLimitReached ||
            insufficientBudget ||
            passedTeams.includes(team.id); // only user team checks

          return (
            <button
              key={team.id}
              className={`px-4 py-2 rounded text-white transition-all ${
                disabled
                  ? "bg-gray-600 cursor-not-allowed"
                  : "bg-blue-700 hover:bg-blue-800"
              }`}
              onClick={() => handleBid(team.id)}
              disabled={disabled}
            >
              {team.name}
            </button>
          );
        })}
        <button
          onClick={handlePass}
          className="px-4 py-2 bg-red-700 hover:bg-red-800 text-white rounded transition-all"
        >
          Pass
        </button>
        <button
          onClick={sellPlayer}
          className="px-4 py-2 bg-green-700 hover:bg-green-800 text-white rounded transition-all"
        >
          Sold
        </button>
      </div>

      {/* Teams Panel */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-5 mt-5 w-full">
        {teams.map((team) => {
          const budgetPercent = (team.budget / 100) * 100;

          // Calculate team stats
          const totalSpent = 100 - team.budget;
          const overseasPlayers = team.players.filter(
            (p) => p.nationality !== "Indian"
          ).length;
          const roleDistribution = team.players.reduce((acc, p) => {
            acc[p.role] = (acc[p.role] || 0) + 1;
            return acc;
          }, {});

          return (
            <div
              key={team.id}
              className={`border-4 ${
                team.color
              } rounded p-4 shadow-lg transition-all duration-500 ${
                lastBidders.includes(team.id)
                  ? "ring-4 ring-yellow-400 animate-pulse"
                  : ""
              }`}
              onClick={() => setShowRosterModal(team.id)}
            >
              <h3 className="font-bold text-lg text-white">{team.name}</h3>

              {/* Stats */}
              <p className="text-white">
                Budget Left: ₹{team.budget.toFixed(2)}Cr
              </p>
              <p className="text-white">
                Total Spent: ₹{totalSpent.toFixed(2)}Cr
              </p>
              <p className="text-white">Overseas Players: {overseasPlayers}</p>
              <p className="text-white">
                Roles:{" "}
                {Object.entries(roleDistribution)
                  .map(([role, count]) => `${role}: ${count}`)
                  .join(", ")}
              </p>

              {/* Budget Bar */}
              <div className="bg-gray-700 h-4 rounded mt-2">
                <div
                  className="bg-green-500 h-4 rounded transition-all duration-500"
                  style={{ width: `${budgetPercent}%` }}
                ></div>
              </div>
            </div>
          );
        })}
      </div>

      <AuctionSheet />
      {showRosterModal && (
        <TeamRosterModal team={teams.find((t) => t.id === showRosterModal)} />
      )}
      {showPlayerStats && <PlayerStatsModal player={showPlayerStats} />}
      <ToastContainer position="top-center" newestOnTop limit={2} />
    </div>
  );
}

export default App;
