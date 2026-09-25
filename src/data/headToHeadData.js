// Head-to-Head Batter vs. Bowler Matchup Matrix
// Provides historical and simulated rivalry dynamics between elite T20 batsmen and bowlers

export const HEAD_TO_HEAD_PAIRS = [
  {
    batter: "Virat Kohli",
    bowler: "Jasprit Bumrah",
    balls: 92,
    runs: 140,
    dismissals: 4,
    strikeRate: 152.17,
    dots: 38,
    fours: 15,
    sixes: 5,
    tacticalTip: "Kohli attacks Bumrah in powerplay overs, but Bumrah dominates the death overs with pinpoint yorkers.",
    verdict: "High-voltage stalemate: Bumrah strikes at the death, but Kohli capitalizes early.",
  },
  {
    batter: "Rohit Sharma",
    bowler: "Trent Boult",
    balls: 58,
    runs: 69,
    dismissals: 4,
    strikeRate: 118.96,
    dots: 31,
    fours: 8,
    sixes: 2,
    tacticalTip: "Boult attacks the pads with swinging inswingers in the 1st over; Rohit tends to play across the line.",
    verdict: "Boult has the distinct upper hand with early swinging traps.",
  },
  {
    batter: "MS Dhoni",
    bowler: "Sunil Narine",
    balls: 81,
    runs: 49,
    dismissals: 1,
    strikeRate: 60.49,
    dots: 45,
    fours: 2,
    sixes: 0,
    tacticalTip: "Narine chokes Dhoni's boundary options with tight off-stump angles and deceptive carrom balls.",
    verdict: "Narine chokes Dhoni's boundary scoring; 0 sixes conceded across their IPL history.",
  },
  {
    batter: "Rishabh Pant",
    bowler: "Rashid Khan",
    balls: 79,
    runs: 97,
    dismissals: 2,
    strikeRate: 122.78,
    dots: 32,
    fours: 7,
    sixes: 4,
    tacticalTip: "Pant sweeps aggressively against Rashid's quick googly, looking to disrupt the spinner's line.",
    verdict: "Balanced battle with high risk-reward sweeps and googly traps.",
  },
  {
    batter: "Suryakumar Yadav",
    bowler: "Yuzvendra Chahal",
    balls: 65,
    runs: 104,
    dismissals: 3,
    strikeRate: 160.00,
    dots: 20,
    fours: 11,
    sixes: 5,
    tacticalTip: "SKY utilizes 360-degree scoops over fine leg, but Chahal's wide outside-off floaters produce catches.",
    verdict: "High-scoring clash: SKY scores rapidly, but Chahal snares him with bait balls.",
  },
  {
    batter: "Heinrich Klaasen",
    bowler: "Rashid Khan",
    balls: 52,
    runs: 112,
    dismissals: 1,
    strikeRate: 215.38,
    dots: 14,
    fours: 6,
    sixes: 10,
    tacticalTip: "Klaasen stands deep in his crease and hammers length deliveries over wide long-on.",
    verdict: "Klaasen completely dominates, boasting a 200+ strike rate against elite leg-spin.",
  },
  {
    batter: "KL Rahul",
    bowler: "Mohammed Shami",
    balls: 70,
    runs: 108,
    dismissals: 2,
    strikeRate: 154.28,
    dots: 28,
    fours: 12,
    sixes: 4,
    tacticalTip: "Rahul's high backlift allows punchy backfoot drives against Shami's seam movement.",
    verdict: "Rahul manages Shami's upright seam with textbook timing.",
  },
  {
    batter: "Andre Russell",
    bowler: "Jasprit Bumrah",
    balls: 46,
    runs: 54,
    dismissals: 4,
    strikeRate: 117.39,
    dots: 25,
    fours: 3,
    sixes: 3,
    tacticalTip: "Bumrah cramps Russell with hostile 145km/h rib-cage bouncers and toe-crushers.",
    verdict: "Bumrah decisively pins Russell down in death over face-offs.",
  },
  {
    batter: "Shubman Gill",
    bowler: "Kagiso Rabada",
    balls: 60,
    runs: 84,
    dismissals: 2,
    strikeRate: 140.00,
    dots: 24,
    fours: 9,
    sixes: 3,
    tacticalTip: "Gill plays through the line on true bounce tracks; Rabada relies on back-of-a-length heat.",
    verdict: "Evenly poised contest of classical timing vs raw South African pace.",
  },
  {
    batter: "Glenn Maxwell",
    bowler: "Ravindra Jadeja",
    balls: 54,
    runs: 72,
    dismissals: 6,
    strikeRate: 133.33,
    dots: 21,
    fours: 6,
    sixes: 3,
    tacticalTip: "Jadeja darts deliveries into the leg stump at 98km/h, trapping Maxwell lbw on the reverse sweep.",
    verdict: "Jadeja is Maxwell's kryptonite: 6 dismissals in under 55 balls!",
  },
  {
    batter: "David Warner",
    bowler: "Ravichandran Ashwin",
    balls: 134,
    runs: 172,
    dismissals: 5,
    strikeRate: 128.36,
    dots: 52,
    fours: 18,
    sixes: 4,
    tacticalTip: "Ashwin comes round the wicket with carrom balls drifting into the left-hander.",
    verdict: "Epic marathon duel: Ashwin regularly challenges Warner's outside edge.",
  },
  {
    batter: "Sanju Samson",
    bowler: "Varun Chakaravarthy",
    balls: 42,
    runs: 63,
    dismissals: 3,
    strikeRate: 150.00,
    dots: 16,
    fours: 5,
    sixes: 4,
    tacticalTip: "Samson steps out to hit straight over the bowler's head, risking being beaten by googly drift.",
    verdict: "Thrilling all-or-nothing duel with maximums and frequent bowled dismissals.",
  },
];

/**
 * Searches for head to head battle record between two players
 */
export function getHeadToHead(playerAName, playerBName) {
  if (!playerAName || !playerBName) return null;
  const pA = playerAName.toLowerCase().trim();
  const pB = playerBName.toLowerCase().trim();

  // Search exact or partial matches in catalog
  const match = HEAD_TO_HEAD_PAIRS.find(
    (item) =>
      (item.batter.toLowerCase().includes(pA) || pA.includes(item.batter.toLowerCase())) &&
      (item.bowler.toLowerCase().includes(pB) || pB.includes(item.bowler.toLowerCase()))
  );
  if (match) return match;

  // Search reverse
  const reverseMatch = HEAD_TO_HEAD_PAIRS.find(
    (item) =>
      (item.batter.toLowerCase().includes(pB) || pB.includes(item.batter.toLowerCase())) &&
      (item.bowler.toLowerCase().includes(pA) || pA.includes(item.bowler.toLowerCase()))
  );
  if (reverseMatch) return reverseMatch;

  // Synthesize realistic match-up stats dynamically if not hardcoded
  return synthesizeH2H(playerAName, playerBName);
}

/**
 * Algorithmic generator for any custom batter vs bowler pair
 */
export function synthesizeH2H(batterName, bowlerName) {
  // Deterministic seed from names
  const combined = `${batterName}_vs_${bowlerName}`;
  let hash = 0;
  for (let i = 0; i < combined.length; i++) {
    hash = (hash << 5) - hash + combined.charCodeAt(i);
    hash |= 0;
  }
  const seed = Math.abs(hash);

  const balls = 24 + (seed % 65);
  const strikeRate = 110 + (seed % 65);
  const runs = Math.round((balls * strikeRate) / 100);
  const dismissals = (seed % 4);
  const dots = Math.round(balls * 0.38);
  const fours = Math.round((runs * 0.45) / 4);
  const sixes = Math.round((runs * 0.35) / 6);

  let verdict = "Intense competitive standoff across recent league encounters.";
  if (strikeRate > 155) verdict = `${batterName} holds the edge, punishing loose length balls.`;
  else if (dismissals >= 3) verdict = `${bowlerName} has mastered this matchup with consistent breakthroughs.`;

  return {
    batter: batterName,
    bowler: bowlerName,
    balls,
    runs,
    dismissals,
    strikeRate: parseFloat(strikeRate.toFixed(1)),
    dots,
    fours,
    sixes,
    tacticalTip: `Key tactical duel in the middle overs: ${bowlerName} aims for stumps while ${batterName} looks to clear the ropes.`,
    verdict,
    isGenerated: true,
  };
}
