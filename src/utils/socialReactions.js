// Social Media Fan Reaction Feed and Expert Auction Grades Engine

export const PUNDIT_PERSONAS = [
  { name: "Harsha B.", handle: "@bhogle_voice", avatar: "🎙️", role: "Chief Voice of Cricket" },
  { name: "Ian B.", handle: "@bishop_broadcast", avatar: "📻", role: "Senior West Indies Analyst" },
  { name: "Aakash C.", handle: "@aakash_insights", avatar: "🏏", role: "Tactical Strategist" },
  { name: "Simon D.", handle: "@doull_analysis", avatar: "⚡", role: "Pace & Bounce Expert" },
  { name: "CricFanatic", handle: "@IPL_Pulse24", avatar: "🔥", role: "Ultra Fan Community" },
];

/**
 * Generate simulated social media reaction post following an auction event
 */
export function generateSocialReaction(player, outcomeType, team = null, price = 0) {
  const author = PUNDIT_PERSONAS[Math.floor(Math.random() * PUNDIT_PERSONAS.length)];
  const time = "Just now";
  let content = "";
  let sentiment = "positive"; // 'positive' | 'negative' | 'hype' | 'shock'

  if (outcomeType === "SOLD") {
    if (price >= 15.0) {
      sentiment = "shock";
      const shockPosts = [
        `🚨 BLOCKBUSTER ALERT! ₹${price.toFixed(2)}Cr for ${player.name} to ${team?.shortName}! Absolute pandemonium on the auction floor! 🤯💥 #IPLAuction`,
        `MASSIVE! ${team?.shortName} shatter the ceiling for ${player.name} at ₹${price.toFixed(2)}Cr. High risk, colossal reward! Is this the winning signing of 2025? 🔥`,
        `Bank = Broken! ₹${price.toFixed(2)}Cr dropped by ${team?.shortName} for ${player.name}. The owner's paddle did not waver once! Pure conviction! 🏏💰`,
      ];
      content = shockPosts[Math.floor(Math.random() * shockPosts.length)];
    } else if (price <= (player.basePrice || 2.0) * 1.5 && (player.rating || 80) >= 86) {
      sentiment = "hype";
      const stealPosts = [
        `STEAL OF THE AUCTION! How did ${team?.shortName} manage to snap up ${player.name} for just ₹${price.toFixed(2)}Cr?! Masterclass purse management! 👏🎯`,
        `Tactical genius from ${team?.shortName}! Getting a premier match-winner like ${player.name} at ₹${price.toFixed(2)}Cr is robbery in broad daylight! 🕶️🔥`,
      ];
      content = stealPosts[Math.floor(Math.random() * stealPosts.length)];
    } else {
      sentiment = "positive";
      const normalPosts = [
        `${team?.shortName} secure ${player.name} for ₹${price.toFixed(2)}Cr. Fills an essential slot in their lineup balance perfectly. Solid business! 👍`,
        `Welcome to ${team?.shortName}, ${player.name}! Looking forward to seeing this squad take shape on the field! 🏏✨ #IPL2025`,
        `Clean, decisive bidding from ${team?.shortName}. ₹${price.toFixed(2)}Cr for ${player.name} fits their remaining budget trajectory nicely.`,
      ];
      content = normalPosts[Math.floor(Math.random() * normalPosts.length)];
    }
  } else if (outcomeType === "RTM") {
    sentiment = "hype";
    const rtmPosts = [
      `⚡ RTM DRAMA! ${team?.shortName} pull out their Right-To-Match card to keep ${player.name} in their fortress! You love to see the loyalty! 🛡️💛`,
      `INCREDIBLE RTM CHALLENGE! ${team?.shortName} match the rival bid and bring ${player.name} right back home! Iconic scenes! 🏏🎉`,
    ];
    content = rtmPosts[Math.floor(Math.random() * rtmPosts.length)];
  } else if (outcomeType === "UNSOLD") {
    sentiment = "negative";
    const unsoldPosts = [
      `Shock silence in the auditorium... ${player.name} goes UNSOLD! Guaranteed to be recalled in the Accelerated Round with big interest! ❌👀`,
      `Can't believe nobody raised a paddle for ${player.name}! Teams are saving their purse for the uncapped pacers later. What a gamble! 🤔`,
    ];
    content = unsoldPosts[Math.floor(Math.random() * unsoldPosts.length)];
  } else if (outcomeType === "RETAINED") {
    sentiment = "positive";
    content = `Official: ${team?.shortName} retain their talisman ${player.name} ahead of the hammer drops! Core foundation secured! 🔒🏆`;
  }

  return {
    id: Date.now() + Math.random(),
    author: author.name,
    handle: author.handle,
    avatar: author.avatar,
    role: author.role,
    time,
    content,
    sentiment,
    likes: Math.floor(Math.random() * 2400) + 120,
    retweets: Math.floor(Math.random() * 600) + 30,
  };
}

/**
 * Calculate post-auction expert grades (A+ to F) for each franchise
 */
export function calculateFranchiseGrades(teams = []) {
  return teams.map((team) => {
    const players = team.players || [];
    const count = players.length;
    const overseas = players.filter((p) => p.nationality && p.nationality.toLowerCase().trim() !== "indian").length;
    
    // Squad ratings
    const avgRating = count > 0 
      ? players.reduce((s, p) => s + (p.rating || 75), 0) / count 
      : 50;

    // Purse utilization efficiency
    const remainingBudget = team.budget;
    const initialBudget = 120.0;
    const spentBudget = initialBudget - remainingBudget;
    const purseEfficiency = Math.min(100, Math.max(30, (spentBudget / initialBudget) * 100));

    // Role balance check
    const batters = players.filter((p) => p.role === "Batsman").length;
    const bowlers = players.filter((p) => p.role === "Bowler").length;
    const allRounders = players.filter((p) => p.role === "All-Rounder").length;
    const keepers = players.filter((p) => p.role === "Wicketkeeper").length;

    let balanceScore = 80;
    if (keepers < 1) balanceScore -= 25;
    if (bowlers < 5) balanceScore -= 15;
    if (batters < 4) balanceScore -= 15;
    if (allRounders < 2) balanceScore -= 10;
    if (count < 18) balanceScore -= 30; // Squad deficiency
    if (overseas > 8) balanceScore -= 30; // Quota violation

    // Weighted composite score (0-100)
    const compositeScore = Math.round(avgRating * 0.45 + balanceScore * 0.35 + (purseEfficiency * 0.2));

    let grade = "B";
    let gradeColor = "text-yellow-400 border-yellow-500 bg-yellow-500/10";
    let verdict = "Solid, balanced squad capable of reaching playoffs.";

    if (compositeScore >= 88) {
      grade = "A+";
      gradeColor = "text-emerald-400 border-emerald-500 bg-emerald-500/20";
      verdict = "Championship caliber squad! Elite superstar depth and perfect balance.";
    } else if (compositeScore >= 82) {
      grade = "A";
      gradeColor = "text-green-400 border-green-500 bg-green-500/10";
      verdict = "Formidable auction execution. Potent bowling attack and formidable batting lineup.";
    } else if (compositeScore >= 75) {
      grade = "B+";
      gradeColor = "text-cyan-400 border-cyan-500 bg-cyan-500/10";
      verdict = "Strong core group. Needs impact players to fire consistently in tight finishes.";
    } else if (compositeScore >= 68) {
      grade = "B";
      gradeColor = "text-yellow-400 border-yellow-500 bg-yellow-500/10";
      verdict = "Competitive roster with clear strengths, though death bowling could be tested.";
    } else if (compositeScore >= 60) {
      grade = "C+";
      gradeColor = "text-orange-400 border-orange-500 bg-orange-500/10";
      verdict = "Decent starting XI, but thin bench reserves if injuries strike.";
    } else {
      grade = "D";
      gradeColor = "text-rose-400 border-rose-500 bg-rose-500/20";
      verdict = "Sub-optimal auction strategy: left too much purse or missed key specialist roles.";
    }

    return {
      team,
      count,
      overseas,
      avgRating: parseFloat(avgRating.toFixed(1)),
      spentBudget: parseFloat(spentBudget.toFixed(2)),
      remainingBudget: parseFloat(remainingBudget.toFixed(2)),
      compositeScore,
      grade,
      gradeColor,
      verdict,
      roles: { batters, bowlers, allRounders, keepers },
    };
  });
}
