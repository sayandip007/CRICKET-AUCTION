// Auction Rules, Squad Constraints, Scoring & Set Organization for IPL Cricket Auction

export const TOTAL_RETENTION_FUNDS = 120; // in Crores
export const MIN_SQUAD_SIZE = 18;
export const MAX_SQUAD_SIZE = 25;
export const MAX_OVERSEAS_PLAYERS = 8;
export const MIN_UNRESERVED_PLAYER_PRICE = 0.30; // 30 Lakhs base price for minimum reserve calculation
export const CAPPED_INTERNATIONAL_COSTS = [18, 14, 11, 18, 14];
export const UNCAPPED_COST = 4;
export const FALLBACK_IMAGE = "/images/players/fallback.png";

/**
 * Dynamic bid increments based on current bid level
 * < 1.00 Cr -> +0.05 Cr (5L)
 * 1.00 - 1.99 Cr -> +0.10 Cr (10L)
 * 2.00 - 4.99 Cr -> +0.20 Cr (20L)
 * >= 5.00 Cr -> +0.50 Cr (50L)
 */
export const getIncrement = (currentBid) => {
  if (currentBid < 1.0) return 0.05;
  if (currentBid < 2.0) return 0.10;
  if (currentBid < 5.0) return 0.20;
  return 0.50;
};

/**
 * Calculates a player's dynamic IPL rating (65 - 99) based on their career statistics
 */
export const calculatePlayerRating = (player) => {
  if (player.rating && player.rating > 0) return player.rating;

  let base = 65;
  // Base price contribution
  if (player.basePrice >= 2.0) base += 14;
  else if (player.basePrice >= 1.5) base += 10;
  else if (player.basePrice >= 1.0) base += 7;
  else if (player.basePrice >= 0.5) base += 4;

  // Batting stats
  const batAvg = player.battingAverage || 0;
  const batSR = player.battingStrikeRate || 0;
  const runs = player.runs || 0;

  if (batAvg >= 38) base += 6;
  else if (batAvg >= 30) base += 4;
  else if (batAvg >= 25) base += 2;

  if (batSR >= 150) base += 6;
  else if (batSR >= 135) base += 4;
  else if (batSR >= 125) base += 2;

  if (runs >= 2000) base += 5;
  else if (runs >= 1000) base += 3;

  // Bowling stats
  const wickets = player.wickets || 0;
  const econ = player.bowlingEconomy || 0;
  const bowlAvg = player.bowlingAverage || 0;

  if (wickets >= 80) base += 6;
  else if (wickets >= 40) base += 4;
  else if (wickets >= 15) base += 2;

  if (econ > 0 && econ <= 7.5) base += 5;
  else if (econ > 0 && econ <= 8.5) base += 3;

  if (bowlAvg > 0 && bowlAvg <= 22) base += 4;

  // International / capped experience
  if (player.matches >= 60) base += 3;

  return Math.min(98, Math.max(68, Math.round(base)));
};

/**
 * Calculate maximum allowable single bid for a team, strictly enforcing
 * the reserve needed to buy remaining players to reach the minimum 18-player squad.
 * Formula:
 * Reserve = max(0, 18 - (squadSize + 1)) * 0.30 Cr
 * Max Bid = max(0, budget - Reserve)
 */
export const calculateMaxAllowedBid = (team, minReservePrice = MIN_UNRESERVED_PLAYER_PRICE) => {
  const currentSquadSize = team.players ? team.players.length : 0;
  if (currentSquadSize >= MAX_SQUAD_SIZE) return 0;

  const slotsNeededAfterThis = Math.max(0, MIN_SQUAD_SIZE - (currentSquadSize + 1));
  const reserveNeeded = slotsNeededAfterThis * minReservePrice;
  const maxBid = Math.max(0, team.budget - reserveNeeded);

  return parseFloat(maxBid.toFixed(2));
};

/**
 * Check if a team is legally permitted to bid a target amount on a player
 */
export const canTeamBid = (team, player, targetBid) => {
  const currentSquadSize = team.players ? team.players.length : 0;

  // Rule 1: Max squad size limit (25)
  if (currentSquadSize >= MAX_SQUAD_SIZE) {
    return { allowed: false, reason: `Squad limit reached (${MAX_SQUAD_SIZE}/${MAX_SQUAD_SIZE})` };
  }

  // Rule 2: Max overseas limit (8)
  const isOverseas = player.nationality && player.nationality.toLowerCase().trim() !== "indian";
  const overseasCount = team.players
    ? team.players.filter(p => p.nationality && p.nationality.toLowerCase().trim() !== "indian").length
    : 0;

  if (isOverseas && overseasCount >= MAX_OVERSEAS_PLAYERS) {
    return { allowed: false, reason: `Overseas cap reached (${MAX_OVERSEAS_PLAYERS}/${MAX_OVERSEAS_PLAYERS})` };
  }

  // Rule 3: Minimum purse reserve for 18-player squad
  const maxBid = calculateMaxAllowedBid(team);
  if (targetBid > maxBid) {
    return {
      allowed: false,
      reason: `Exceeds max bid ₹${maxBid.toFixed(2)}Cr (Must reserve purse to reach 18 players)`
    };
  }

  // Rule 4: Total budget check
  if (team.budget < targetBid) {
    return { allowed: false, reason: `Insufficient purse (₹${team.budget.toFixed(2)}Cr remaining)` };
  }

  return { allowed: true };
};

/**
 * Recursively flatten previous teams structure from previous.json
 */
export const flattenPreviousTeams = (arr) => {
  return arr.reduce((acc, item) => {
    if (Array.isArray(item)) {
      acc.push(...flattenPreviousTeams(item));
    } else if (item && typeof item === "object" && item.teamId) {
      acc.push(item);
    }
    return acc;
  }, []);
};

/**
 * Create a lookup map for previous teams by playerId and playerName
 */
export const buildPreviousPlayersMap = (previousData) => {
  const teams = flattenPreviousTeams(previousData);
  const mapById = {};
  const mapByName = {};

  teams.forEach((t) => {
    t.players.forEach((p) => {
      const info = {
        teamId: t.teamId,
        teamName: t.teamName,
        isCapped: p.isCapped,
        playerObj: p,
      };
      mapById[p.id] = info;
      if (p.name) {
        mapByName[p.name.toLowerCase().trim()] = info;
      }
    });
  });

  return { mapById, mapByName };
};

/**
 * Generate default authentic retentions for AI teams
 * Retains 2 to 4 top stars for each franchise, deducts standard retention costs,
 * and sets initial RTM count = 6 - retainedCount
 */
export const getAIRetentions = (userTeamId, teams, previousData) => {
  const normalizedPrevious = flattenPreviousTeams(previousData);
  const aiRetentionsMap = {};
  const isHumanTeam = (id) =>
    Array.isArray(userTeamId) ? userTeamId.includes(id) : id === userTeamId;

  teams.forEach((team) => {
    if (isHumanTeam(team.id)) return; // Human handles own retentions

    const prevTeam = normalizedPrevious.find((pt) => pt.teamId === team.id);
    if (!prevTeam || !prevTeam.players || prevTeam.players.length === 0) {
      aiRetentionsMap[team.id] = { players: [], totalCost: 0, rtmCount: 6 };
      return;
    }

    // Pick top 2 to 4 eligible players (prioritize high base price, capped stars)
    const eligible = [...prevTeam.players];
    eligible.sort((a, b) => {
      // Prioritize capped and higher base price
      if (a.isCapped !== b.isCapped) return b.isCapped ? 1 : -1;
      return (b.basePrice || 0) - (a.basePrice || 0);
    });

    // Select 3 players for AI teams
    const selected = eligible.slice(0, 3);
    let spent = 0;
    let cappedIndex = 0;

    const retainedWithPrices = selected.map((p) => {
      let cost = UNCAPPED_COST;
      if (p.isCapped) {
        cost = CAPPED_INTERNATIONAL_COSTS[cappedIndex] || 14;
        cappedIndex++;
      }
      spent += cost;
      return {
        ...p,
        bidPrice: cost,
        retained: true,
      };
    });

    const rtmCount = Math.max(0, 6 - retainedWithPrices.length);

    aiRetentionsMap[team.id] = {
      players: retainedWithPrices,
      totalCost: spent,
      rtmCount,
    };
  });

  return aiRetentionsMap;
};

/**
 * Categorizes the auction pool into authentic IPL Sets
 */
export const buildAuctionSets = (allPlayers, retainedPlayerIds, prevMap) => {
  const retainedSet = new Set(retainedPlayerIds);

  // Filter out retained players
  const availablePlayers = allPlayers
    .filter((p) => !retainedSet.has(p.id))
    .map((p) => {
      const prevInfo = prevMap.mapById[p.id] || prevMap.mapByName[p.name.toLowerCase().trim()];
      const isCapped = prevInfo ? prevInfo.isCapped : (p.basePrice >= 0.5 || p.matches > 5 || p.nationality !== "Indian");
      const rating = calculatePlayerRating(p);
      return {
        ...p,
        previousTeamId: prevInfo ? prevInfo.teamId : null,
        previousTeamName: prevInfo ? prevInfo.teamName : null,
        isCapped,
        rating,
      };
    });

  // Sort candidates
  const marqueeCandidates = availablePlayers.filter((p) => p.rating >= 88 || p.basePrice >= 2.0);

  // Split into Marquee Set 1 (first 8) and Marquee Set 2 (next 8)
  const marquee1 = marqueeCandidates.slice(0, 8);
  const marquee2 = marqueeCandidates.slice(8, 16);
  const marqueeSetIds = new Set([...marquee1, ...marquee2].map((p) => p.id));

  const remaining = availablePlayers.filter((p) => !marqueeSetIds.has(p.id));

  // Partition by role and capped status
  const cappedBatters = remaining.filter((p) => p.role === "Batsman" && p.isCapped);
  const cappedAllRounders = remaining.filter((p) => p.role === "All-Rounder" && p.isCapped);
  const cappedKeepers = remaining.filter((p) => p.role === "Wicketkeeper" && p.isCapped);
  const cappedPacers = remaining.filter((p) => p.role === "Bowler" && p.isCapped);
  const cappedSpinners = remaining.filter((p) => p.role === "Bowler" && p.isCapped && p.bowlingEconomy < 8.0);

  const uncappedBatters = remaining.filter((p) => p.role === "Batsman" && !p.isCapped);
  const uncappedAllRounders = remaining.filter((p) => p.role === "All-Rounder" && !p.isCapped);
  const uncappedKeepers = remaining.filter((p) => p.role === "Wicketkeeper" && !p.isCapped);
  const uncappedBowlers = remaining.filter((p) => p.role === "Bowler" && !p.isCapped);

  const sets = [
    {
      id: "SET_M1",
      code: "M1",
      name: "Marquee Players Set 1",
      description: "Iconic match-winners & franchise superstars",
      category: "Marquee",
      players: marquee1,
    },
    {
      id: "SET_M2",
      code: "M2",
      name: "Marquee Players Set 2",
      description: "World-class elite cricketers",
      category: "Marquee",
      players: marquee2,
    },
    {
      id: "SET_BA1",
      code: "BA1",
      name: "Capped Batters Set 1",
      description: "Established international & domestic specialist batsmen",
      category: "Capped Batters",
      players: cappedBatters.slice(0, 8),
    },
    {
      id: "SET_AL1",
      code: "AL1",
      name: "Capped All-Rounders Set 1",
      description: "High-impact dual-threat match winners",
      category: "Capped All-Rounders",
      players: cappedAllRounders.slice(0, 8),
    },
    {
      id: "SET_WK1",
      code: "WK1",
      name: "Capped Wicketkeepers Set 1",
      description: "Stumpers and middle-order finishers",
      category: "Capped Wicketkeepers",
      players: cappedKeepers.slice(0, 8),
    },
    {
      id: "SET_FA1",
      code: "FA1",
      name: "Capped Fast Bowlers Set 1",
      description: "Express pacers and death-over specialists",
      category: "Capped Fast Bowlers",
      players: cappedPacers.slice(0, 8),
    },
    {
      id: "SET_SP1",
      code: "SP1",
      name: "Capped Spinners Set 1",
      description: "Mystery spinners and turn masters",
      category: "Capped Spinners",
      players: cappedSpinners.slice(0, 8),
    },
    {
      id: "SET_UBA1",
      code: "UBA1",
      name: "Uncapped Batters Set 1",
      description: "Explosive young domestic batting talents",
      category: "Uncapped Batters",
      players: uncappedBatters.slice(0, 8),
    },
    {
      id: "SET_UAL1",
      code: "UAL1",
      name: "Uncapped All-Rounders Set 1",
      description: "Emerging domestic dynamic all-rounders",
      category: "Uncapped All-Rounders",
      players: uncappedAllRounders.slice(0, 8),
    },
    {
      id: "SET_UWK1",
      code: "UWK1",
      name: "Uncapped Wicketkeepers Set 1",
      description: "Next-generation glovemen",
      category: "Uncapped Wicketkeepers",
      players: uncappedKeepers.slice(0, 8),
    },
    {
      id: "SET_UBOW1",
      code: "UBOW1",
      name: "Uncapped Bowlers Set 1",
      description: "Raw pace and spin prospects from domestic circuits",
      category: "Uncapped Bowlers",
      players: uncappedBowlers.slice(0, 8),
    },
  ];

  // Filter out any sets that have 0 players
  return sets.filter((s) => s.players && s.players.length > 0);
};
