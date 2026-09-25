// Pitch types and their characteristic modifiers
export const PITCH_CONDITIONS = [
  {
    id: "balanced",
    name: "Balanced Surface",
    venue: "Narendra Modi Stadium, Ahmedabad",
    description: "Even bounce, fair contest between bat and ball.",
    parScore: 175,
    batModifier: 1.0,
    bowlModifier: 1.0,
    spinModifier: 1.0,
    paceModifier: 1.0,
  },
  {
    id: "batting_paradise",
    name: "Batting Paradise",
    venue: "M. Chinnaswamy Stadium, Bengaluru",
    description: "Short boundaries, lightning outfield, high six-hitting rate.",
    parScore: 205,
    batModifier: 1.25,
    bowlModifier: 0.82,
    spinModifier: 0.85,
    paceModifier: 0.8,
  },
  {
    id: "spin_track",
    name: "Turning Track",
    venue: "MA Chidambaram Stadium (Chepauk), Chennai",
    description: "Dry, gripped pitch offering sharp turn for spinners.",
    parScore: 155,
    batModifier: 0.88,
    bowlModifier: 1.18,
    spinModifier: 1.35,
    paceModifier: 0.9,
  },
  {
    id: "pace_bounce",
    name: "Pace & Bounce",
    venue: "Wankhede Stadium, Mumbai",
    description: "True carry and swing under lights with late dew factor.",
    parScore: 188,
    batModifier: 1.1,
    bowlModifier: 1.05,
    spinModifier: 0.92,
    paceModifier: 1.22,
  },
];

/**
 * Check if a player is an overseas player
 */
export function isOverseas(player) {
  if (!player || !player.nationality) return false;
  return player.nationality.toLowerCase().trim() !== "indian";
}

/**
 * Compute batting rating (0-100) for an individual player
 */
export function getPlayerBattingRating(player) {
  if (!player) return 40;
  const avg = player.battingAverage || 0;
  const sr = player.battingStrikeRate || 0;
  const runs = player.runs || 0;
  const role = player.role || "";

  let base = 45;
  if (role === "Batsman") base = 65;
  else if (role === "Wicketkeeper") base = 60;
  else if (role === "All-Rounder") base = 55;
  else base = 25;

  // Average factor
  const avgPoints = Math.min(25, (avg / 45) * 25);
  // Strike rate factor
  const srPoints = Math.min(25, (sr / 160) * 25);
  // Experience/runs factor
  const expPoints = Math.min(10, (runs / 3000) * 10);

  const total = Math.min(99, Math.round(base * 0.4 + avgPoints + srPoints + expPoints));
  return Math.max(30, total);
}

/**
 * Compute bowling rating (0-100) for an individual player
 */
export function getPlayerBowlingRating(player) {
  if (!player) return 30;
  const wickets = player.wickets || 0;
  const economy = player.bowlingEconomy || 0;
  const avg = player.bowlingAverage || 0;
  const role = player.role || "";

  let base = 35;
  if (role === "Bowler") base = 65;
  else if (role === "All-Rounder") base = 55;
  else base = 15;

  if (wickets === 0 && economy === 0) {
    return role === "Bowler" ? 50 : 25;
  }

  // Economy factor (lower is better, e.g. 7.0 is elite)
  let econPoints = 15;
  if (economy > 0) {
    if (economy <= 7.2) econPoints = 25;
    else if (economy <= 8.2) econPoints = 20;
    else if (economy <= 9.0) econPoints = 14;
    else econPoints = 8;
  }

  // Wickets factor
  const wicketPoints = Math.min(20, (wickets / 120) * 20);

  // Bowling avg factor (< 22 is elite)
  let avgPoints = 10;
  if (avg > 0) {
    if (avg <= 22) avgPoints = 20;
    else if (avg <= 28) avgPoints = 15;
    else avgPoints = 8;
  }

  const total = Math.min(99, Math.round(base * 0.4 + econPoints + wicketPoints + avgPoints));
  return Math.max(25, total);
}

/**
 * Check if a player can bowl viable overs in a match
 */
export function canBowl(player) {
  if (!player) return false;
  if (player.role === "Bowler") return true;
  if (player.role === "All-Rounder") return true;
  return (player.wickets || 0) > 5;
}

/**
 * Validates a Playing XI against IPL official formation rules
 */
export function validatePlayingXI(playingXI = []) {
  const errors = [];
  const warnings = [];

  const total = playingXI.length;
  const overseasList = playingXI.filter(isOverseas);
  const keepers = playingXI.filter((p) => p.role === "Wicketkeeper");
  const bowlers = playingXI.filter((p) => p.role === "Bowler");
  const allRounders = playingXI.filter((p) => p.role === "All-Rounder");
  const pureBatters = playingXI.filter((p) => p.role === "Batsman");
  const bowlingOptions = playingXI.filter(canBowl);

  if (total !== 11) {
    errors.push(`Playing XI must have exactly 11 players (currently ${total})`);
  }

  if (overseasList.length > 4) {
    errors.push(`Maximum 4 overseas players allowed in Playing XI (currently ${overseasList.length})`);
  }

  if (keepers.length < 1) {
    errors.push("Must have at least 1 designated Wicketkeeper in Playing XI");
  }

  if (bowlingOptions.length < 5) {
    errors.push(`Must have at least 5 bowling options (currently ${bowlingOptions.length})`);
  } else if (bowlingOptions.length === 5) {
    warnings.push("Only 5 bowling options: no backup bowler in case of an expensive spell.");
  }

  if (pureBatters.length + keepers.length + allRounders.length < 6) {
    warnings.push("Batting depth appears thin (fewer than 6 specialist/all-rounder batters).");
  }

  const isValid = errors.length === 0;

  return {
    isValid,
    errors,
    warnings,
    stats: {
      total,
      overseas: overseasList.length,
      wicketKeepers: keepers.length,
      pureBatters: pureBatters.length,
      allRounders: allRounders.length,
      bowlers: bowlers.length,
      bowlingOptions: bowlingOptions.length,
    },
  };
}

/**
 * Intelligently auto-selects the optimal Playing XI from a squad
 */
export function autoSelectBestXI(squad = []) {
  if (!squad || squad.length === 0) return [];
  if (squad.length <= 11) return [...squad];

  // Separate pools
  const pool = squad.map((p) => ({
    ...p,
    batScore: getPlayerBattingRating(p),
    bowlScore: getPlayerBowlingRating(p),
    ovr: p.rating || 75,
    isOverseas: isOverseas(p),
  }));

  const selected = [];
  let overseasCount = 0;

  // 1. Pick the best Wicketkeeper
  const keepers = pool
    .filter((p) => p.role === "Wicketkeeper")
    .sort((a, b) => b.batScore - a.batScore);

  if (keepers.length > 0) {
    // Prefer domestic keeper if overseas pool is tight, unless keeper is world-class
    const bestKeeper = keepers.find((k) => !k.isOverseas) || keepers[0];
    selected.push(bestKeeper);
    if (bestKeeper.isOverseas) overseasCount++;
  }

  // 2. Pick top 4 Bowling Options (Bowlers & high-rating All-Rounders)
  const bowlingCandidates = pool
    .filter((p) => !selected.some((s) => s.id === p.id) && canBowl(p))
    .sort((a, b) => b.bowlScore - a.bowlScore);

  let bowlersAdded = 0;
  for (const b of bowlingCandidates) {
    if (bowlersAdded >= 4) break;
    if (b.isOverseas && overseasCount >= 4) continue;
    selected.push(b);
    if (b.isOverseas) overseasCount++;
    bowlersAdded++;
  }

  // 3. Fill the remaining spots with best overall batters and all-rounders
  const remainingCandidates = pool
    .filter((p) => !selected.some((s) => s.id === p.id))
    .sort((a, b) => {
      // Prioritize pure batting for top order if needed
      const scoreA = a.role === "Bowler" ? a.bowlScore : a.batScore * 1.1 + a.ovr * 0.2;
      const scoreB = b.role === "Bowler" ? b.bowlScore : b.batScore * 1.1 + b.ovr * 0.2;
      return scoreB - scoreA;
    });

  for (const p of remainingCandidates) {
    if (selected.length >= 11) break;
    if (p.isOverseas && overseasCount >= 4) continue;
    selected.push(p);
    if (p.isOverseas) overseasCount++;
  }

  // If still under 11 (e.g. overseas limit blocked some), fill with any domestic remaining
  if (selected.length < 11) {
    for (const p of pool) {
      if (selected.length >= 11) break;
      if (!selected.some((s) => s.id === p.id)) {
        selected.push(p);
      }
    }
  }

  // Order logically: Openers & Top order (1-3), Middle order (4-6), All-rounder/Finisher (7), Bowlers (8-11)
  return orderPlayingXI(selected);
}

/**
 * Organizes an 11-player lineup into a realistic cricket batting order
 */
export function orderPlayingXI(eleven = []) {
  const keepers = [];
  const pureBatters = [];
  const allRounders = [];
  const pureBowlers = [];

  eleven.forEach((p) => {
    if (p.role === "Wicketkeeper") keepers.push(p);
    else if (p.role === "Batsman") pureBatters.push(p);
    else if (p.role === "All-Rounder") allRounders.push(p);
    else pureBowlers.push(p);
  });

  // Sort batters by strike rate & average
  pureBatters.sort((a, b) => (b.battingAverage || 0) - (a.battingAverage || 0));
  allRounders.sort((a, b) => (b.battingStrikeRate || 0) - (a.battingStrikeRate || 0));
  pureBowlers.sort((a, b) => (b.wickets || 0) - (a.wickets || 0));

  const ordered = [];

  // Top 3-4 batters
  ordered.push(...pureBatters.slice(0, 3));

  // Wicketkeeper usually at 3, 4, or 5
  if (keepers.length > 0) {
    ordered.push(keepers[0]);
  }

  // Rest of batters
  ordered.push(...pureBatters.slice(3));

  // Rest of keepers if any
  if (keepers.length > 1) {
    ordered.push(...keepers.slice(1));
  }

  // All rounders (positions 6-8)
  ordered.push(...allRounders);

  // Bowlers (positions 8-11)
  ordered.push(...pureBowlers);

  // Ensure we maintain unique players and length
  return ordered.slice(0, 11);
}

/**
 * Calculates Team Chemistry & Ratings (Batting, Bowling, Balance, Experience, OVR)
 */
export function calculateTeamRatings(team, playingXI = null) {
  const squad = team?.players || [];
  const xi = playingXI && playingXI.length > 0 ? playingXI : autoSelectBestXI(squad);

  // If even XI is empty, fallback
  if (!xi || xi.length === 0) {
    return {
      battingRating: 50,
      bowlingRating: 50,
      balanceRating: 50,
      experienceRating: 50,
      overallRating: 50,
      tier: "🌱 Rebuilding Squad",
      tierColor: "text-gray-400",
      formationValid: false,
      validation: validatePlayingXI([]),
    };
  }

  const validation = validatePlayingXI(xi);

  // 1. Batting Rating
  const batRatings = xi.map(getPlayerBattingRating);
  // Weight top 7 heavily
  let batSum = 0;
  let batWeights = 0;
  batRatings.forEach((rating, idx) => {
    const weight = idx < 3 ? 1.4 : idx < 6 ? 1.2 : idx < 8 ? 0.9 : 0.4;
    batSum += rating * weight;
    batWeights += weight;
  });
  let battingRating = Math.round(batSum / batWeights);

  // 2. Bowling Rating
  const bowlingOptions = xi.filter(canBowl).map(getPlayerBowlingRating);
  bowlingOptions.sort((a, b) => b - a);
  let bowlSum = 0;
  let bowlWeights = 0;
  const topBowlers = bowlingOptions.slice(0, 5);
  topBowlers.forEach((rating, idx) => {
    const weight = 1.3 - idx * 0.1; // 1.3, 1.2, 1.1, 1.0, 0.9
    bowlSum += rating * weight;
    bowlWeights += weight;
  });
  let bowlingRating = topBowlers.length >= 5 ? Math.round(bowlSum / bowlWeights) : 52;
  if (topBowlers.length < 5) bowlingRating = Math.max(35, bowlingRating - 15);

  // 3. Balance Rating
  const arCount = xi.filter((p) => p.role === "All-Rounder").length;
  const wkCount = xi.filter((p) => p.role === "Wicketkeeper").length;
  let balanceRating = 70;
  if (arCount >= 2 && arCount <= 4) balanceRating += 12;
  else if (arCount === 1) balanceRating += 4;
  else if (arCount > 4) balanceRating -= 4;

  if (wkCount >= 1) balanceRating += 8;
  else balanceRating -= 20;

  if (validation.stats.bowlingOptions >= 6) balanceRating += 6;
  if (validation.stats.overseas <= 4) balanceRating += 4;
  else balanceRating -= 18;
  balanceRating = Math.min(98, Math.max(35, balanceRating));

  // 4. Experience Rating
  let totalMatches = 0;
  let cappedCount = 0;
  xi.forEach((p) => {
    totalMatches += p.matches || 0;
    if (p.isCapped) cappedCount++;
  });
  const avgMatches = totalMatches / xi.length;
  let experienceRating = Math.min(98, Math.round(45 + (avgMatches / 100) * 35 + (cappedCount / 11) * 20));

  // 5. Overall Chemistry Score
  let overallRating = Math.round(
    battingRating * 0.35 + bowlingRating * 0.35 + balanceRating * 0.15 + experienceRating * 0.15
  );

  // Penalize broken formation
  if (!validation.isValid) {
    overallRating = Math.max(35, overallRating - 10);
  }

  let tier = "⚔️ Playoff Contender";
  let tierColor = "text-yellow-400";
  if (overallRating >= 88) {
    tier = "🏆 Title Contender";
    tierColor = "text-amber-400";
  } else if (overallRating >= 82) {
    tier = "⚡ Playoff Lock";
    tierColor = "text-cyan-400";
  } else if (overallRating < 75) {
    tier = "🌱 Rebuilding / Dark Horse";
    tierColor = "text-purple-400";
  }

  return {
    battingRating,
    bowlingRating,
    balanceRating,
    experienceRating,
    overallRating,
    tier,
    tierColor,
    formationValid: validation.isValid,
    validation,
  };
}

/**
 * T20 Match Simulator with Impact Player (12th Man) Substitution Rule
 * Simulates a realistic 20-over match between two teams
 */
export function simulateT20Match(
  teamA,
  teamB,
  xiA = null,
  xiB = null,
  pitchId = "balanced",
  options = {}
) {
  const pitch = PITCH_CONDITIONS.find((p) => p.id === pitchId) || PITCH_CONDITIONS[0];

  const actualXiA = xiA && xiA.length === 11 ? [...xiA] : autoSelectBestXI(teamA.players || []);
  const actualXiB = xiB && xiB.length === 11 ? [...xiB] : autoSelectBestXI(teamB.players || []);

  // Bench for Impact Player candidates
  const xiIdsA = new Set(actualXiA.map((p) => p.id));
  const xiIdsB = new Set(actualXiB.map((p) => p.id));
  const benchA = (teamA.players || []).filter((p) => !xiIdsA.has(p.id));
  const benchB = (teamB.players || []).filter((p) => !xiIdsB.has(p.id));

  const candidateA = options.impactPlayerA || benchA[0] || null;
  const candidateB = options.impactPlayerB || benchB[0] || null;

  const ratingsA = calculateTeamRatings(teamA, actualXiA);
  const ratingsB = calculateTeamRatings(teamB, actualXiB);

  // Coin Toss
  const tossWinner = Math.random() < 0.5 ? teamA : teamB;
  const tossChoice = Math.random() < 0.65 ? "bowl" : "bat"; // T20 meta prefers chasing
  const battingFirstTeam = tossChoice === "bat" ? tossWinner : tossWinner.id === teamA.id ? teamB : teamA;
  const bowlingFirstTeam = battingFirstTeam.id === teamA.id ? teamB : teamA;

  let xi1st = battingFirstTeam.id === teamA.id ? [...actualXiA] : [...actualXiB];
  let xi2nd = battingFirstTeam.id === teamA.id ? [...actualXiB] : [...actualXiA];
  const ratings1st = battingFirstTeam.id === teamA.id ? ratingsA : ratingsB;
  const ratings2nd = battingFirstTeam.id === teamA.id ? ratingsB : ratingsA;

  const impactCandidate1st = battingFirstTeam.id === teamA.id ? candidateA : candidateB;
  const impactCandidate2nd = battingFirstTeam.id === teamA.id ? candidateB : candidateA;

  const impactSubstitutions = [];

  // Tactical Impact Player activation for 1st Innings (Batting reinforcement)
  if (impactCandidate1st && xi1st.length === 11) {
    const replacedPlayer = xi1st[10]; // replace lowest order player with impact batter
    xi1st[10] = impactCandidate1st;
    impactSubstitutions.push({
      team: battingFirstTeam,
      playerIn: impactCandidate1st,
      playerOut: replacedPlayer,
      innings: 1,
      role: impactCandidate1st.role,
      reason: "Tactical Batting Firepower (Middle-Order Reinforcement)",
    });
  }

  // Simulate 1st Innings
  const inn1 = simulateInnings({
    battingTeam: battingFirstTeam,
    bowlingTeam: bowlingFirstTeam,
    batters: xi1st,
    bowlers: xi2nd.filter(canBowl),
    batRating: ratings1st.battingRating,
    bowlRating: ratings2nd.bowlingRating,
    pitch,
    target: null,
  });

  // Target for 2nd innings
  const target = inn1.totalRuns + 1;

  // Tactical Impact Player activation for 2nd Innings (Fielding/Bowling or Chasing reinforcement)
  if (impactCandidate2nd && xi2nd.length === 11) {
    const replacedPlayer = xi2nd[10];
    xi2nd[10] = impactCandidate2nd;
    impactSubstitutions.push({
      team: bowlingFirstTeam,
      playerIn: impactCandidate2nd,
      playerOut: replacedPlayer,
      innings: 2,
      role: impactCandidate2nd.role,
      reason: "Tactical Bowling Specialist (Target Defense & Wicket Threat)",
    });
  }

  // Simulate 2nd Innings
  const inn2 = simulateInnings({
    battingTeam: bowlingFirstTeam,
    bowlingTeam: battingFirstTeam,
    batters: xi2nd,
    bowlers: xi1st.filter(canBowl),
    batRating: ratings2nd.battingRating,
    bowlRating: ratings1st.bowlingRating,
    pitch,
    target,
  });

  // Outcome
  let winner = null;
  let margin = "";
  if (inn2.totalRuns >= target) {
    winner = bowlingFirstTeam;
    const wicketsLeft = 10 - inn2.wickets;
    const ballsRemaining = 120 - inn2.legalBalls;
    margin = `won by ${wicketsLeft} wicket${wicketsLeft > 1 ? "s" : ""} (${ballsRemaining} balls left)`;
  } else if (inn2.totalRuns < inn1.totalRuns) {
    winner = battingFirstTeam;
    const runDiff = inn1.totalRuns - inn2.totalRuns;
    margin = `won by ${runDiff} run${runDiff > 1 ? "s" : ""}`;
  } else {
    // Super Over / Tie
    winner = Math.random() < 0.5 ? battingFirstTeam : bowlingFirstTeam;
    margin = "won the Super Over thriller!";
  }

  // Player of the Match Evaluation
  const allPerformances = [];
  inn1.batterCards.forEach((b) => {
    allPerformances.push({
      player: b.player,
      team: battingFirstTeam,
      score: b.runs * 1.1 + (b.runs > 50 ? 20 : 0) + (b.runs > 80 ? 30 : 0),
      label: `${b.runs} off ${b.balls} (${b.fours}x4, ${b.sixes}x6)`,
    });
  });
  inn1.bowlerCards.forEach((b) => {
    allPerformances.push({
      player: b.player,
      team: bowlingFirstTeam,
      score: b.wickets * 28 + Math.max(0, (9.0 - b.economy) * 6),
      label: `${b.wickets}/${b.runs} (${b.overs} ov, Econ: ${b.economy.toFixed(1)})`,
    });
  });
  inn2.batterCards.forEach((b) => {
    allPerformances.push({
      player: b.player,
      team: bowlingFirstTeam,
      score: b.runs * 1.1 + (b.runs > 50 ? 20 : 0) + (b.runs > 80 ? 30 : 0),
      label: `${b.runs} off ${b.balls} (${b.fours}x4, ${b.sixes}x6)`,
    });
  });
  inn2.bowlerCards.forEach((b) => {
    allPerformances.push({
      player: b.player,
      team: battingFirstTeam,
      score: b.wickets * 28 + Math.max(0, (9.0 - b.economy) * 6),
      label: `${b.wickets}/${b.runs} (${b.overs} ov, Econ: ${b.economy.toFixed(1)})`,
    });
  });

  // Favor winner slightly for POTM
  allPerformances.sort((a, b) => {
    const bonusA = a.team.id === winner.id ? 15 : 0;
    const bonusB = b.team.id === winner.id ? 15 : 0;
    return b.score + bonusB - (a.score + bonusA);
  });

  const potm = allPerformances[0] || {
    player: actualXiA[0],
    team: winner,
    label: "Match-winning leadership",
  };

  return {
    toss: {
      winner: tossWinner,
      decision: tossChoice,
    },
    pitch,
    teamA,
    teamB,
    battingFirstTeam,
    bowlingFirstTeam,
    inn1,
    inn2,
    winner,
    margin,
    potm,
    impactSubstitutions,
  };
}

/**
 * Helper to simulate one 20-over T20 innings
 */
function simulateInnings({ batters, bowlers, batRating, bowlRating, pitch, target }) {
  let totalRuns = 0;
  let wickets = 0;
  let legalBalls = 0;
  const overLog = [];

  // Setup batter scorecards
  const batterCards = batters.map((p) => ({
    player: p,
    runs: 0,
    balls: 0,
    fours: 0,
    sixes: 0,
    isOut: false,
    dismissal: "not out",
  }));

  let strikerIdx = 0;
  let nonStrikerIdx = 1;

  // Setup bowlers (assign overs: max 4 per bowler)
  const activeBowlers = (bowlers.length >= 5 ? bowlers.slice(0, 6) : batters.slice(5, 11)).map((b) => ({
    player: b,
    overs: 0,
    maidens: 0,
    runs: 0,
    wickets: 0,
    economy: 0,
  }));

  // Play 20 overs
  for (let overNum = 1; overNum <= 20; overNum++) {
    if (wickets >= 10) break;
    if (target && totalRuns >= target) break;

    // Pick bowler for this over (rotate)
    const eligibleBowlers = activeBowlers.filter((b) => b.overs < 4);
    if (eligibleBowlers.length === 0) break;
    const currentBowler = eligibleBowlers[(overNum - 1) % eligibleBowlers.length];

    let overRuns = 0;
    let overWickets = 0;
    const ballOutcomes = [];

    // Phase modifiers
    let phaseMultiplier = 1.0;
    if (overNum <= 6) phaseMultiplier = 1.1; // Powerplay
    else if (overNum >= 16) phaseMultiplier = 1.35; // Death overs
    else phaseMultiplier = 0.95; // Middle overs

    const batStrength = (batRating / 80) * pitch.batModifier * phaseMultiplier;
    const bowlStrength = (bowlRating / 80) * pitch.bowlModifier;

    for (let ball = 1; ball <= 6; ball++) {
      if (wickets >= 10 || (target && totalRuns >= target)) break;

      legalBalls++;
      const currentStriker = batterCards[strikerIdx];
      currentStriker.balls++;

      // Probability of wicket
      const wicketProb = Math.max(0.035, 0.075 * (bowlStrength / batStrength));
      const rand = Math.random();

      if (rand < wicketProb) {
        // Wicket!
        wickets++;
        overWickets++;
        currentBowler.wickets++;
        currentStriker.isOut = true;
        const dismissalModes = [
          `c & b ${currentBowler.player.name}`,
          `b ${currentBowler.player.name}`,
          `c keeper b ${currentBowler.player.name}`,
          `lbw b ${currentBowler.player.name}`,
          `c substitute b ${currentBowler.player.name}`,
        ];
        currentStriker.dismissal = dismissalModes[Math.floor(Math.random() * dismissalModes.length)];
        ballOutcomes.push("W");

        // Next batter in
        const nextIdx = Math.max(strikerIdx, nonStrikerIdx) + 1;
        if (nextIdx < batterCards.length) {
          strikerIdx = nextIdx;
        }
      } else {
        // Runs scored on ball
        let runsScored = 0;
        const shotProb = Math.random() * batStrength;

        if (shotProb > 1.3) {
          runsScored = 6;
          currentStriker.sixes++;
          ballOutcomes.push("6");
        } else if (shotProb > 0.95) {
          runsScored = 4;
          currentStriker.fours++;
          ballOutcomes.push("4");
        } else if (shotProb > 0.65) {
          runsScored = 2;
          ballOutcomes.push("2");
        } else if (shotProb > 0.35) {
          runsScored = 1;
          ballOutcomes.push("1");
        } else {
          runsScored = 0;
          ballOutcomes.push("•");
        }

        currentStriker.runs += runsScored;
        overRuns += runsScored;
        totalRuns += runsScored;
        currentBowler.runs += runsScored;

        // Strike rotation on singles/threes
        if (runsScored === 1 || runsScored === 3) {
          const temp = strikerIdx;
          strikerIdx = nonStrikerIdx;
          nonStrikerIdx = temp;
        }
      }
    }

    currentBowler.overs++;
    currentBowler.economy = currentBowler.runs / currentBowler.overs;
    if (overRuns === 0) currentBowler.maidens++;

    overLog.push({
      over: overNum,
      bowler: currentBowler.player.name,
      runs: overRuns,
      wickets: overWickets,
      totalRuns,
      totalWickets: wickets,
      balls: ballOutcomes.join(" "),
    });

    // End of over: switch strike
    const temp = strikerIdx;
    strikerIdx = nonStrikerIdx;
    nonStrikerIdx = temp;
  }

  const completedOvers = Math.floor(legalBalls / 6);
  const remBalls = legalBalls % 6;
  const oversFormatted = `${completedOvers}.${remBalls}`;
  const runRate = legalBalls > 0 ? (totalRuns / (legalBalls / 6)).toFixed(2) : "0.00";

  return {
    totalRuns,
    wickets,
    oversFormatted,
    legalBalls,
    runRate,
    batterCards: batterCards.filter((b) => b.balls > 0 || !b.isOut),
    bowlerCards: activeBowlers.filter((b) => b.overs > 0),
    overLog,
  };
}

/**
 * Generates a full 10-team IPL Season Schedule
 * Each team plays every other team once in the league stage (45 league matches)
 */
export function generateSeasonSchedule(teams) {
  const matches = [];
  let matchId = 1;

  for (let i = 0; i < teams.length; i++) {
    for (let j = i + 1; j < teams.length; j++) {
      const pitch = PITCH_CONDITIONS[matchId % PITCH_CONDITIONS.length];
      matches.push({
        id: matchId++,
        round: Math.ceil((matchId - 1) / 5),
        teamA: teams[i],
        teamB: teams[j],
        pitch,
        status: "UPCOMING", // 'UPCOMING' | 'COMPLETED'
        result: null,
      });
    }
  }

  // Shuffle slightly so teams don't play back to back
  return matches;
}

/**
 * Initializes Points Table for 10 Franchises
 */
export function initPointsTable(teams) {
  return teams.map((team) => ({
    teamId: team.id,
    teamName: team.name,
    shortName: team.shortName,
    played: 0,
    won: 0,
    lost: 0,
    nr: 0,
    points: 0,
    runsScored: 0,
    oversFaced: 0,
    runsConceded: 0,
    oversBowled: 0,
    nrr: "+0.000",
    form: [], // last 5 results: ['W', 'L', 'W']
  }));
}

/**
 * Recalculates Points Table given completed matches
 */
export function updatePointsTable(prevTable, completedMatches) {
  const tableMap = {};
  prevTable.forEach((row) => {
    tableMap[row.teamId] = {
      ...row,
      played: 0,
      won: 0,
      lost: 0,
      nr: 0,
      points: 0,
      runsScored: 0,
      ballsFaced: 0,
      runsConceded: 0,
      ballsBowled: 0,
      form: [],
    };
  });

  completedMatches.forEach((m) => {
    if (!m.result) return;
    const { teamA, teamB, winner, inn1, inn2 } = m.result;

    const rowA = tableMap[teamA.id];
    const rowB = tableMap[teamB.id];
    if (!rowA || !rowB) return;

    rowA.played++;
    rowB.played++;

    const isAWinner = winner.id === teamA.id;
    if (isAWinner) {
      rowA.won++;
      rowA.points += 2;
      rowA.form.push("W");
      rowB.lost++;
      rowB.form.push("L");
    } else {
      rowB.won++;
      rowB.points += 2;
      rowB.form.push("W");
      rowA.lost++;
      rowA.form.push("L");
    }

    // Runs and overs tracking for NRR
    const aWasBattingFirst = m.result.battingFirstTeam.id === teamA.id;
    const innA = aWasBattingFirst ? inn1 : inn2;
    const innB = aWasBattingFirst ? inn2 : inn1;

    rowA.runsScored += innA.totalRuns;
    rowA.ballsFaced += innA.legalBalls;
    rowA.runsConceded += innB.totalRuns;
    rowA.ballsBowled += innB.legalBalls;

    rowB.runsScored += innB.totalRuns;
    rowB.ballsFaced += innB.legalBalls;
    rowB.runsConceded += innA.totalRuns;
    rowB.ballsBowled += innA.legalBalls;
  });

  // Calculate NRR: (Runs Scored / Overs Faced) - (Runs Conceded / Overs Bowled)
  const rows = Object.values(tableMap).map((row) => {
    const oversFaced = row.ballsFaced / 6;
    const oversBowled = row.ballsBowled / 6;
    const runRateFor = oversFaced > 0 ? row.runsScored / oversFaced : 0;
    const runRateAgainst = oversBowled > 0 ? row.runsConceded / oversBowled : 0;
    const nrrValue = runRateFor - runRateAgainst;

    const sign = nrrValue >= 0 ? "+" : "";
    return {
      ...row,
      nrr: `${sign}${nrrValue.toFixed(3)}`,
      nrrRaw: nrrValue,
      form: row.form.slice(-5), // keep last 5
    };
  });

  // Sort by Points DESC, then NRR DESC, then Won DESC
  rows.sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    return b.nrrRaw - a.nrrRaw;
  });

  return rows;
}
