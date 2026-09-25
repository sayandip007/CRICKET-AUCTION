// Player Form Streaks & Fitness Fatigue Utility Engine for Cricket Auction Simulator

export const FORM_STATUS = {
  ON_FIRE: {
    key: "ON_FIRE",
    label: "On Fire",
    badge: "🔥",
    color: "text-amber-400 bg-amber-950/80 border-amber-500",
    multiplier: 1.15, // +15% performance boost
    description: "Exceptional form! Scored 50+ or took 3+ wickets recently.",
  },
  IN_FORM: {
    key: "IN_FORM",
    label: "In Form",
    badge: "⚡",
    color: "text-green-400 bg-green-950/80 border-green-500",
    multiplier: 1.08, // +8% performance boost
    description: "Consistent solid performances.",
  },
  NORMAL: {
    key: "NORMAL",
    label: "Standard",
    badge: "⚪",
    color: "text-gray-300 bg-gray-900 border-gray-700",
    multiplier: 1.0,
    description: "Stable baseline performance.",
  },
  SLUMP: {
    key: "SLUMP",
    label: "In Slump",
    badge: "❄️",
    color: "text-cyan-300 bg-cyan-950/80 border-cyan-500",
    multiplier: 0.9, // -10% penalty
    description: "Under pressure. Struggled in recent matches.",
  },
  FATIGUED: {
    key: "FATIGUED",
    label: "Fatigued",
    badge: "⚠️",
    color: "text-rose-400 bg-rose-950/80 border-rose-500",
    multiplier: 0.86, // -14% fatigue penalty
    description: "High bowling workload. Rest on the bench to recover!",
  },
};

/**
 * Initializes form and fatigue for a list of players
 */
export function initPlayersForm(players = []) {
  const formMap = {};
  players.forEach((p) => {
    formMap[p.id] = {
      playerId: p.id,
      status: "NORMAL",
      consecutiveHighScores: 0,
      consecutiveLowScores: 0,
      consecutiveMatchesPlayed: 0,
      recentOversBowled: 0,
      matchesRested: 0,
      history: [], // recent match ratings
    };
  });
  return formMap;
}

/**
 * Returns player adjusted batting and bowling rating given their current form
 */
export function getAdjustedRatings(player, formState) {
  if (!player) return { battingRating: 50, bowlingRating: 50, form: FORM_STATUS.NORMAL };

  const pForm = formState?.[player.id] || { status: "NORMAL" };
  const formConfig = FORM_STATUS[pForm.status] || FORM_STATUS.NORMAL;

  const baseBat = player.rating || 75;
  const baseBowl = player.role === "Bowler" || player.role === "All-Rounder" ? (player.rating || 70) : 35;

  const adjustedBat = Math.min(99, Math.max(30, Math.round(baseBat * formConfig.multiplier)));
  const adjustedBowl = Math.min(99, Math.max(25, Math.round(baseBowl * formConfig.multiplier)));

  return {
    battingRating: adjustedBat,
    bowlingRating: adjustedBowl,
    form: formConfig,
  };
}

/**
 * Updates form and fatigue for both teams following a completed match
 */
export function updateFormAfterMatch(matchResult, currentFormMap = {}) {
  const nextForm = { ...currentFormMap };
  if (!matchResult || !matchResult.inn1 || !matchResult.inn2) return nextForm;

  const allBatters = [...matchResult.inn1.batterCards, ...matchResult.inn2.batterCards];
  const allBowlers = [...matchResult.inn1.bowlerCards, ...matchResult.inn2.bowlerCards];

  // Process batters
  allBatters.forEach((card) => {
    const pId = card.player.id;
    const entry = nextForm[pId] || {
      playerId: pId,
      status: "NORMAL",
      consecutiveHighScores: 0,
      consecutiveLowScores: 0,
      consecutiveMatchesPlayed: 0,
      recentOversBowled: 0,
      matchesRested: 0,
      history: [],
    };

    entry.consecutiveMatchesPlayed++;
    entry.matchesRested = 0;

    if (card.runs >= 50 || (card.runs >= 35 && card.runs / Math.max(1, card.balls) >= 1.8)) {
      entry.consecutiveHighScores++;
      entry.consecutiveLowScores = 0;
      entry.status = "ON_FIRE";
    } else if (card.runs >= 25) {
      entry.consecutiveLowScores = 0;
      entry.status = entry.status === "ON_FIRE" ? "ON_FIRE" : "IN_FORM";
    } else if (card.runs < 10 && card.balls >= 6) {
      entry.consecutiveLowScores++;
      entry.consecutiveHighScores = 0;
      if (entry.consecutiveLowScores >= 2) {
        entry.status = "SLUMP";
      } else {
        entry.status = "NORMAL";
      }
    }

    entry.history.push({ type: "BAT", runs: card.runs, balls: card.balls });
    nextForm[pId] = entry;
  });

  // Process bowlers and track workload fatigue
  allBowlers.forEach((card) => {
    const pId = card.player.id;
    const entry = nextForm[pId] || {
      playerId: pId,
      status: "NORMAL",
      consecutiveHighScores: 0,
      consecutiveLowScores: 0,
      consecutiveMatchesPlayed: 0,
      recentOversBowled: 0,
      matchesRested: 0,
      history: [],
    };

    entry.recentOversBowled = (entry.recentOversBowled || 0) + card.overs;

    if (card.wickets >= 3 || (card.wickets >= 2 && card.economy <= 6.5)) {
      entry.status = "ON_FIRE";
    } else if (card.wickets >= 1 && card.economy <= 8.0) {
      if (entry.status !== "ON_FIRE") entry.status = "IN_FORM";
    } else if (card.wickets === 0 && card.economy >= 11.5) {
      entry.status = "SLUMP";
    }

    // Fatigue threshold: Bowler who bowled 10+ overs in recent matches without rest
    if (entry.recentOversBowled >= 10 && entry.consecutiveMatchesPlayed >= 3) {
      entry.status = "FATIGUED";
    }

    entry.history.push({ type: "BOWL", wickets: card.wickets, econ: card.economy });
    nextForm[pId] = entry;
  });

  return nextForm;
}

/**
 * Recovers rested bench players
 */
export function restBenchPlayers(benchPlayerIds = [], currentFormMap = {}) {
  const nextForm = { ...currentFormMap };
  benchPlayerIds.forEach((pId) => {
    if (nextForm[pId]) {
      const entry = { ...nextForm[pId] };
      entry.matchesRested = (entry.matchesRested || 0) + 1;
      entry.consecutiveMatchesPlayed = 0;
      entry.recentOversBowled = Math.max(0, (entry.recentOversBowled || 0) - 4);

      // Resting cures fatigue and resets slump
      if (entry.status === "FATIGUED") {
        entry.status = "IN_FORM";
      } else if (entry.status === "SLUMP") {
        entry.status = "NORMAL";
      }

      nextForm[pId] = entry;
    }
  });
  return nextForm;
}
