// AI Intelligence, Team Needs Matrix, Purse Pacing & Rivalries for IPL Cricket Auction

/**
 * Authentic IPL Franchises Strategic Personas
 */
export const FRANCHISE_PERSONAS = {
  1: { // CSK
    tagline: "The Experience & All-Rounder Core",
    description: "Prioritizes high-match experience, reliable spin bowlers, and deep batting all-rounders.",
    archetype: "Tactical Veterans",
    priorityRoles: ["All-Rounder", "Bowler"],
    preferredSpecialties: ["Mystery Spin", "Spin Master", "Anchor Batter", "Finishing All-Rounder"],
    experienceWeight: 1.3,
    uncappedTolerance: 0.7,
    pacingStyle: "Balanced",
    archRivalIds: [8, 5, 2], // MI (El Clásico), RCB (Southern Derby), RR (2008 Finalists)
    rivalryMultiplier: 1.25,
  },
  2: { // RR
    tagline: "The Moneyball & Spin Enigma",
    description: "Scouts high-value domestic prospects, world-class leg spinners, and tactical uncapped gems.",
    archetype: "Moneyball & Spin",
    priorityRoles: ["Bowler", "Batsman"],
    preferredSpecialties: ["Mystery Spin", "Spin Master", "Top-Order Batter", "Death Bowler"],
    experienceWeight: 0.9,
    uncappedTolerance: 1.4,
    pacingStyle: "Value Hunter",
    archRivalIds: [1, 7, 10], // CSK, PBKS (thriller matches), LSG
    rivalryMultiplier: 1.18,
  },
  3: { // KKR
    tagline: "The Mystery Spin & Caribbean Power",
    description: "Relies heavily on explosive boundary-hitters, aggressive all-rounders, and mystery spinners.",
    archetype: "Power & Spin",
    priorityRoles: ["All-Rounder", "Bowler"],
    preferredSpecialties: ["Mystery Spin", "Finishing All-Rounder", "Express Pacer"],
    experienceWeight: 1.0,
    uncappedTolerance: 1.0,
    pacingStyle: "Aggressive",
    archRivalIds: [5, 4, 8], // RCB (Historic Opener derby), SRH, MI
    rivalryMultiplier: 1.25,
  },
  4: { // SRH
    tagline: "The Lethal Bowling & Firepower Pace",
    description: "Builds fiery bowling attacks with express pacers and aggressive overseas openers.",
    archetype: "Pace Battery",
    priorityRoles: ["Bowler", "Batsman"],
    preferredSpecialties: ["Express Pacer", "Death Bowler", "Powerplay Batter"],
    experienceWeight: 1.0,
    uncappedTolerance: 1.1,
    pacingStyle: "Aggressive",
    archRivalIds: [3, 1, 5], // KKR, CSK, RCB
    rivalryMultiplier: 1.2,
  },
  5: { // RCB
    tagline: "The Superstar Batting Machine",
    description: "Loves high-profile marquee batters and explosive game-changers, willing to bid heavily.",
    archetype: "Superstar Centric",
    priorityRoles: ["Batsman", "Wicketkeeper"],
    preferredSpecialties: ["Top-Order Batter", "Powerplay Batter", "Stumper Finisher", "Death Bowler"],
    experienceWeight: 1.2,
    uncappedTolerance: 0.8,
    pacingStyle: "Aggressive Splurge",
    archRivalIds: [3, 1, 8], // KKR (Derby), CSK (Southern Derby), MI
    rivalryMultiplier: 1.3,
  },
  6: { // DC
    tagline: "The Young Indian Core",
    description: "Focuses on emerging Indian stars, versatile wicketkeepers, and sharp young fast bowlers.",
    archetype: "Indian Core Builder",
    priorityRoles: ["Wicketkeeper", "Batsman", "Bowler"],
    preferredSpecialties: ["Stumper Finisher", "Top-Order Batter", "Express Pacer"],
    experienceWeight: 0.85,
    uncappedTolerance: 1.3,
    pacingStyle: "Balanced",
    archRivalIds: [7, 9, 8], // PBKS (Northern Derby), GT, MI
    rivalryMultiplier: 1.2,
  },
  7: { // PBKS
    tagline: "The High-Purse Disruptors",
    description: "Enters the auction with massive purse ambition, fearless bidding, and aggressive counter-attacks.",
    archetype: "Purse Disruptor",
    priorityRoles: ["All-Rounder", "Bowler", "Batsman"],
    preferredSpecialties: ["Death Bowler", "Powerplay Batter", "Finishing All-Rounder"],
    experienceWeight: 1.0,
    uncappedTolerance: 1.2,
    pacingStyle: "High Splurge",
    archRivalIds: [6, 2, 5], // DC (Northern Derby), RR, RCB
    rivalryMultiplier: 1.22,
  },
  8: { // MI
    tagline: "The Pace Fortress & Championship Pedigree",
    description: "Prioritizes lethal death-bowling units, aggressive stroke-makers, and tactical match-winners.",
    archetype: "Championship Core",
    priorityRoles: ["Bowler", "Batsman"],
    preferredSpecialties: ["Death Bowler", "Express Pacer", "Top-Order Batter", "Finishing All-Rounder"],
    experienceWeight: 1.2,
    uncappedTolerance: 1.1,
    pacingStyle: "Calculated Heavy",
    archRivalIds: [1, 5, 3], // CSK (El Clásico), RCB (Battle of Titans), KKR
    rivalryMultiplier: 1.3,
  },
  9: { // GT
    tagline: "The Methodical Engine",
    description: "Emphasizes tactical squad balance, economical seamers, and high batting-average anchors.",
    archetype: "Systematic Balance",
    priorityRoles: ["All-Rounder", "Bowler"],
    preferredSpecialties: ["Finishing All-Rounder", "Death Bowler", "Anchor Batter"],
    experienceWeight: 1.0,
    uncappedTolerance: 1.0,
    pacingStyle: "Balanced",
    archRivalIds: [10, 6, 8], // LSG (2022 Debutants Derby), DC, MI
    rivalryMultiplier: 1.2,
  },
  10: { // LSG
    tagline: "The Multi-Utility Contingent",
    description: "Focuses on flexible all-rounders, agile wicketkeepers, and versatile middle-order buffers.",
    archetype: "Multi-Utility",
    priorityRoles: ["Wicketkeeper", "All-Rounder"],
    preferredSpecialties: ["Stumper Finisher", "Finishing All-Rounder", "Express Pacer"],
    experienceWeight: 1.0,
    uncappedTolerance: 1.0,
    pacingStyle: "Balanced",
    archRivalIds: [9, 5, 2], // GT (2022 Derby), RCB, RR
    rivalryMultiplier: 1.2,
  },
};

/**
 * Traditional IPL Rivalry Matchups
 */
export const RIVALRY_MATCHUPS = [
  {
    teams: [1, 8], // CSK vs MI
    name: "El Clásico of IPL",
    tagline: "9 IPL Titles between them • Fiercest Rivalry in T20 Cricket",
    badge: "⚔️ EL CLÁSICO",
  },
  {
    teams: [3, 5], // KKR vs RCB
    name: "Kolkata-Bengaluru Derby",
    tagline: "The Historic 2008 IPL Opener Rivalry (McCullum 158 vs 49 All Out)",
    badge: "🔥 DERBY CLASH",
  },
  {
    teams: [1, 5], // CSK vs RCB
    name: "Southern Derby",
    tagline: "Kaveri Derby • Yellow Army vs Bold Army",
    badge: "⚡ SOUTHERN DERBY",
  },
  {
    teams: [5, 8], // RCB vs MI
    name: "Battle of Titans",
    tagline: "Mega-City Showdown • High Octane Bidding Wars",
    badge: "👑 TITANS CLASH",
  },
  {
    teams: [6, 7], // DC vs PBKS
    name: "Northern Derby",
    tagline: "Capital vs Punjab • North India Supremacy",
    badge: "🛡️ NORTHERN DERBY",
  },
  {
    teams: [9, 10], // GT vs LSG
    name: "Class of 2022 Derby",
    tagline: "The Expansion Clash • Hardik Pandya vs KL Rahul Heritage",
    badge: "⚡ 2022 DEBUTANTS",
  },
  {
    teams: [3, 4], // KKR vs SRH
    name: "Eastern Showdown",
    tagline: "Playoff Titans • Orange Army vs Purple & Gold",
    badge: "⚔️ EASTERN SHOWDOWN",
  },
  {
    teams: [1, 2], // CSK vs RR
    name: "Inaugural Finalists Clash",
    tagline: "2008 Final Rematch • The Original Contenders",
    badge: "🏆 2008 RIVALS",
  },
];

/**
 * Check if two teams share an arch-rivalry
 */
export const getRivalryDetails = (teamAId, teamBId) => {
  if (!teamAId || !teamBId || teamAId === teamBId) return null;
  const match = RIVALRY_MATCHUPS.find(
    (r) =>
      (r.teams[0] === teamAId && r.teams[1] === teamBId) ||
      (r.teams[1] === teamAId && r.teams[0] === teamBId)
  );

  if (match) return match;

  // Check if teamA has teamB in archRivals list
  const personaA = FRANCHISE_PERSONAS[teamAId];
  if (personaA && personaA.archRivalIds.includes(teamBId)) {
    return {
      name: "Franchise Rivalry",
      tagline: "Historic competitive friction at the auction table",
      badge: "⚔️ RIVALRY DUEL",
    };
  }

  return null;
};

/**
 * Identifies player specializations based on stats and role
 */
export const getPlayerSpecializations = (player) => {
  if (!player) return [];
  const specs = [];
  const role = player.role;
  const batAvg = player.battingAverage || 0;
  const batSR = player.battingStrikeRate || 0;
  const wickets = player.wickets || 0;
  const econ = player.bowlingEconomy || 0;
  const bowlAvg = player.bowlingAverage || 0;

  if (role === "Wicketkeeper") {
    if (batSR >= 135 || batAvg >= 28) specs.push("Stumper Finisher");
    else specs.push("Specialist Wicketkeeper");
  }

  if (role === "Batsman" || role === "All-Rounder") {
    if (batSR >= 145) specs.push("Powerplay Batter");
    if (batAvg >= 36) specs.push("Anchor Batter");
    if (batSR >= 150 && wickets > 5) specs.push("Finishing All-Rounder");
    if (role === "Batsman" && !specs.length) specs.push("Top-Order Batter");
  }

  if (role === "Bowler" || role === "All-Rounder") {
    if (econ > 0 && econ <= 8.2 && (bowlAvg > 0 && bowlAvg <= 24 || wickets >= 40)) {
      specs.push("Death Bowler");
    }
    if (econ > 0 && econ <= 7.4) {
      specs.push(wickets >= 30 ? "Mystery Spin" : "Spin Master");
    }
    if (wickets >= 50 || (player.basePrice >= 1.5 && role === "Bowler")) {
      specs.push("Express Pacer");
    }
    if (role === "Bowler" && !specs.length) specs.push("Strike Bowler");
  }

  return specs.length > 0 ? specs : ["Tactical Squad Option"];
};

/**
 * Target ideal squad distribution for IPL
 */
export const IDEAL_SQUAD_REQUIREMENTS = {
  Batsman: { min: 4, ideal: 6, max: 8 },
  Wicketkeeper: { min: 2, ideal: 2, max: 4 },
  "All-Rounder": { min: 3, ideal: 5, max: 7 },
  Bowler: { min: 5, ideal: 7, max: 9 },
};

/**
 * Analyzes team roster needs and deficit scores
 */
export const analyzeTeamNeeds = (team) => {
  const players = team.players || [];
  const roleCounts = {
    Batsman: 0,
    Wicketkeeper: 0,
    "All-Rounder": 0,
    Bowler: 0,
  };

  let deathBowlersCount = 0;
  let spinMastersCount = 0;
  let overseasCount = 0;

  players.forEach((p) => {
    if (roleCounts[p.role] !== undefined) {
      roleCounts[p.role]++;
    }
    if (p.nationality && p.nationality.toLowerCase().trim() !== "indian") {
      overseasCount++;
    }
    const specs = getPlayerSpecializations(p);
    if (specs.includes("Death Bowler")) deathBowlersCount++;
    if (specs.includes("Mystery Spin") || specs.includes("Spin Master")) spinMastersCount++;
  });

  const needs = {};
  let highestDeficitRole = null;
  let highestDeficitScore = -1;

  Object.entries(IDEAL_SQUAD_REQUIREMENTS).forEach(([role, req]) => {
    const current = roleCounts[role] || 0;
    let score = 0;
    let status = "BALANCED";

    if (current < req.min) {
      // Critical deficit
      score = role === "Wicketkeeper" ? 100 : 85;
      status = current === 0 ? "CRITICAL" : "URGENT";
    } else if (current < req.ideal) {
      score = 50 + (req.ideal - current) * 15;
      status = "MODERATE";
    } else if (current >= req.max) {
      score = -20;
      status = "SURPLUS";
    } else {
      score = 20;
      status = "FILLED";
    }

    needs[role] = {
      current,
      min: req.min,
      ideal: req.ideal,
      max: req.max,
      score,
      status,
    };

    if (score > highestDeficitScore) {
      highestDeficitScore = score;
      highestDeficitRole = role;
    }
  });

  // Special checks for specialist positions
  const deathBowlerNeed = deathBowlersCount === 0 ? "CRITICAL" : deathBowlersCount === 1 ? "MODERATE" : "FILLED";
  const spinMasterNeed = spinMastersCount === 0 ? "URGENT" : spinMastersCount === 1 ? "MODERATE" : "FILLED";

  return {
    roleCounts,
    needs,
    deathBowlersCount,
    spinMastersCount,
    deathBowlerNeed,
    spinMasterNeed,
    overseasCount,
    highestDeficitRole,
    highestDeficitScore,
    totalPlayers: players.length,
  };
};

/**
 * Calculates purse pacing status:
 * - How much purse per remaining slot to 18 (and to 22)
 * - Pacing stage: "SPLURGE", "BALANCED", "CONSERVING", "CRITICAL_SAFETY"
 */
export const calculatePursePacing = (team) => {
  const currentCount = team.players ? team.players.length : 0;
  const budget = team.budget || 0;
  const slotsTo18 = Math.max(1, 18 - currentCount);
  const slotsTo22 = Math.max(1, 22 - currentCount);

  const pursePerSlot18 = budget / slotsTo18;
  const pursePerSlot22 = budget / slotsTo22;

  let pacingStage = "BALANCED";
  let description = "Normal calculated bidding pace";

  if (pursePerSlot18 >= 5.5) {
    pacingStage = "SPLURGE";
    description = "High purse surplus — can aggressively target superstars";
  } else if (pursePerSlot18 >= 3.0) {
    pacingStage = "BALANCED";
    description = "Comfortable purse — will bid firmly on team needs";
  } else if (pursePerSlot18 >= 1.5) {
    pacingStage = "CONSERVING";
    description = "Budget tightening — prioritizing essential slots and value picks";
  } else {
    pacingStage = "CRITICAL_SAFETY";
    description = "Purse critical — near minimum reserve limit (₹0.30Cr/slot)";
  }

  return {
    slotsTo18,
    slotsTo22,
    pursePerSlot18: parseFloat(pursePerSlot18.toFixed(2)),
    pursePerSlot22: parseFloat(pursePerSlot22.toFixed(2)),
    pacingStage,
    description,
  };
};

/**
 * Sophisticated AI Bid Evaluation Engine
 * Evaluates whether an AI team should place the next bid on a player.
 * Factors:
 * 1. Role Need Matrix & Specific Deficits (Wicketkeeper, Death Bowler, Spin)
 * 2. Franchise Persona & Archetype
 * 3. Purse Pacing & Spend Ceiling
 * 4. Rivalry Escalation & Counter-bids
 */
export const evaluateAIBid = (
  team,
  player,
  currentBid,
  nextBid,
  currentLeaderTeam
) => {
  const persona = FRANCHISE_PERSONAS[team.id] || {
    pacingStyle: "Balanced",
    priorityRoles: [],
    preferredSpecialties: [],
    archRivalIds: [],
    rivalryMultiplier: 1.15,
  };

  const needsData = analyzeTeamNeeds(team);
  const pacingData = calculatePursePacing(team);
  const specs = getPlayerSpecializations(player);
  const rating = player.rating || 80;

  // 1. Calculate Maximum Valuation AI is willing to pay for this player
  let baseValuation = (rating / 10) * 1.35; // e.g. 90 rating -> ~12.15 Cr
  if (player.basePrice >= 2.0) baseValuation += 2.0;

  // Role need bonus to valuation
  const roleNeed = needsData.needs[player.role];
  if (roleNeed) {
    if (roleNeed.status === "CRITICAL") baseValuation *= 1.45;
    else if (roleNeed.status === "URGENT") baseValuation *= 1.25;
    else if (roleNeed.status === "MODERATE") baseValuation *= 1.1;
    else if (roleNeed.status === "SURPLUS") baseValuation *= 0.6;
  }

  // Specialty bonus (Death bowler / Mystery spin)
  const isDeathBowler = specs.includes("Death Bowler");
  const isSpinMaster = specs.includes("Mystery Spin") || specs.includes("Spin Master");
  const isWicketkeeper = player.role === "Wicketkeeper";

  if (isDeathBowler && needsData.deathBowlerNeed === "CRITICAL") {
    baseValuation *= 1.35;
  }
  if (isSpinMaster && needsData.spinMasterNeed === "URGENT") {
    baseValuation *= 1.25;
  }
  if (isWicketkeeper && needsData.needs.Wicketkeeper.current === 0) {
    baseValuation *= 1.4; // Desperate for at least one WK
  }

  // Franchise Persona alignment
  if (persona.priorityRoles.includes(player.role)) {
    baseValuation *= 1.15;
  }
  const hasPreferredSpecialty = specs.some((s) => persona.preferredSpecialties.includes(s));
  if (hasPreferredSpecialty) {
    baseValuation *= 1.18;
  }

  // Purse pacing adjustment
  if (pacingData.pacingStage === "SPLURGE") {
    baseValuation *= 1.2;
  } else if (pacingData.pacingStage === "CONSERVING") {
    baseValuation *= 0.75;
  } else if (pacingData.pacingStage === "CRITICAL_SAFETY") {
    baseValuation *= 0.45;
  }

  // 2. Rivalry & Bidding War Escalation
  let isRivalryEscalation = false;
  let rivalryInfo = null;

  if (currentLeaderTeam && currentLeaderTeam.id !== team.id) {
    rivalryInfo = getRivalryDetails(team.id, currentLeaderTeam.id);
    if (rivalryInfo) {
      isRivalryEscalation = true;
      // Arch rivals inflate their valuation ceiling to outmuscle opponent on marquee/high-rated stars
      const multiplier = persona.rivalryMultiplier || 1.2;
      baseValuation *= multiplier;
    }
  }

  // Cap valuation to allowable bid
  const valuationCap = parseFloat(baseValuation.toFixed(2));

  // 3. Compute Bidding Appetite Score (0 to 100)
  let score = 50;

  // Rating impact
  score += (rating - 75) * 1.5;

  // Role need impact
  if (roleNeed) {
    score += roleNeed.score * 0.45;
  }

  // Specialist needs
  if (isDeathBowler && needsData.deathBowlerNeed === "CRITICAL") score += 30;
  if (isWicketkeeper && needsData.needs.Wicketkeeper.current === 0) score += 35;

  // Persona bonus
  if (hasPreferredSpecialty) score += 15;

  // Rivalry adrenaline rush!
  if (isRivalryEscalation) {
    score += 28;
  }

  // Bid cost resistance: as nextBid approaches valuationCap, score decreases
  if (nextBid > valuationCap) {
    score -= (nextBid - valuationCap) * 20;
  } else {
    score += (valuationCap - nextBid) * 2.5;
  }

  // Safety discount if budget is low
  if (pacingData.pacingStage === "CONSERVING" && nextBid > 4.0) {
    score -= 35;
  }
  if (pacingData.pacingStage === "CRITICAL_SAFETY" && nextBid > 1.5) {
    score -= 60;
  }

  // Random tactical hesitation
  score *= 0.88 + Math.random() * 0.24;

  const willBid = nextBid <= valuationCap && score >= 42;

  // Generate dynamic tactical explanation for UI intelligence
  let reason = "";
  if (isRivalryEscalation) {
    reason = `Arch-Rival Clash against ${currentLeaderTeam.shortName}! Willing to stretch budget to ₹${valuationCap.toFixed(2)}Cr.`;
  } else if (isWicketkeeper && needsData.needs.Wicketkeeper.current === 0) {
    reason = `Critical Need: 0 Wicketkeepers in squad. Aggressively contesting up to ₹${valuationCap.toFixed(2)}Cr.`;
  } else if (isDeathBowler && needsData.deathBowlerNeed === "CRITICAL") {
    reason = `Lacks death-over specialist. Valued at ₹${valuationCap.toFixed(2)}Cr.`;
  } else if (roleNeed && roleNeed.status === "URGENT") {
    reason = `Urgent need for ${player.role} (${roleNeed.current}/${roleNeed.ideal}). Willing to bid up to ₹${valuationCap.toFixed(2)}Cr.`;
  } else if (hasPreferredSpecialty) {
    reason = `Matches ${persona.archetype} tactical preference (${specs.join(", ")}).`;
  } else if (pacingData.pacingStage === "SPLURGE") {
    reason = `Purse surplus (${pacingData.pacingStage}). Driving high market pressure.`;
  } else {
    reason = `Squad depth recruitment (valuation cap: ₹${valuationCap.toFixed(2)}Cr).`;
  }

  return {
    willBid,
    score: Math.round(score),
    valuationCap,
    reason,
    isRivalryEscalation,
    rivalryInfo,
    needsData,
    pacingData,
    specs,
  };
};
