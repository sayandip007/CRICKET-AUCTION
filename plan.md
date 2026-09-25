# Cricket Auction Simulator — Product Plan & Roadmap

## 1. Executive Summary
The **Cricket Auction Simulator** is an interactive, broadcast-grade IPL mega-auction simulation web application built with React 18, Vite, and Tailwind CSS. It accurately recreates the high-intensity atmosphere of a real Indian Premier League player auction with authentic multi-stage retention deduction slabs, dynamic incremental bidding, target-aware AI competitor personas, Right to Match (RTM) card challenge duels, procedural Web Audio gavel strikes, live speech commentary, squad chemistry evaluation, full 45-match tournament simulations, pass-and-play multiplayer, custom roster editing, and local state persistence.

---

## 2. Completed Features & Capabilities (Phase-Wise Breakdown)

### Phase 0: Core Foundation & Franchise Infrastructure
- **10 Official IPL Franchises**:
  - Chennai Super Kings (CSK), Mumbai Indians (MI), Royal Challengers Bengaluru (RCB), Kolkata Knight Riders (KKR), Delhi Capitals (DC), Rajasthan Royals (RR), Sunrisers Hyderabad (SRH), Punjab Kings (PBKS), Gujarat Titans (GT), Lucknow Super Giants (LSG).
- **Starting Budgets**:
  - ₹120.00 Crore base purse per franchise.
  - Real-time purse tracking, spent amount, remaining balance, and visual progress gauges.
- **Official Retention Deduction Slabs**:
  - Capped Retention Slabs: Slot 1 (₹18 Cr), Slot 2 (₹14 Cr), Slot 3 (₹11 Cr), Slot 4 (₹18 Cr), Slot 5 (₹14 Cr).
  - Uncapped Retention Slab: ₹4 Cr flat.
  - Retention caps: Maximum 6 retentions (max 5 capped, max 2 uncapped).
- **Interactive Team Roster (Drag-and-Drop)**:
  - Powered by `react-beautiful-dnd` to arrange batting order and bench order.
  - Visual breakdown by player role and overseas vs. domestic composition.
- **PDF Export via `jspdf`**:
  - Downloadable official summary report of all 10 squads, budgets, and auction ledger.

---

### Phase 1: Authentic Auction Rules, Sets & Tactical Mechanics
- **Right to Match (RTM) Card Suite (`RTMModals.jsx`)**:
  - Automatic RTM allocation formula: $\text{RTM Count} = \max(0, 6 - \text{Retained Players})$.
  - **3-Stage RTM Workflow**:
    1. *Stage 1 (Inquiry)*: Former team asked whether they wish to invoke their RTM card.
    2. *Stage 2 (Final Raise Challenge)*: Winning bidder granted one final chance to raise the bid to deter the RTM.
    3. *Stage 3 (Match Decision)*: Former team decides whether to match the raised price or let the player go.
- **11+ Structured Categorized Sets (`AuctionSetsModal.jsx` & `auctionRules.js`)**:
  - Marquee Set 1 (M1), Marquee Set 2 (M2), Capped Batsmen (BA1), Capped All-Rounders (AL1), Capped Wicketkeepers (WK1), Capped Fast Bowlers (FA1), Capped Spinners (SP1), and Uncapped Sets (UBA, UAL, UWK, UFA, USP).
  - Full set catalog viewer with player status badges (Sold, Unsold, Retained, Under Hammer).
- **Set Completion Interstitial (`SetCompletionModal.jsx`)**:
  - Modal transition after every set summarizing total spending, top buy, overseas count, and previewing the upcoming set.
- **Accelerated Round for Unsold Players (`AcceleratedRoundModal.jsx`)**:
  - Automatically activated when all regular sets conclude.
  - Unsold player recall shortlist with 50% base price discount and rapid 5-second countdown timer.
- **Official Squad Limits & Reserve Fund Protection**:
  - Squad ceiling of 18 to 25 players strictly enforced.
  - Maximum 8 overseas players limit strictly checked before every bid.
  - Purse reserve logic prevents teams from placing bids that would leave them unable to fill the 18-player minimum at base price (₹30 Lakhs).

---

### Phase 2: Target-Aware AI Intelligence & Rivalry Bidding Wars
- **Positional Need Matrices (`aiIntelligence.js`)**:
  - Real-time squad auditing tracking positional deficits: Openers, Middle Order, Finishers, Wicketkeepers, Pace All-Rounders, Spin All-Rounders, Death Bowlers, Powerplay Bowlers, and Mystery Spinners.
  - Urgency rating classification: *Critical, Urgent, Moderate, Filled, Surplus*.
- **Specialist Player Tagging**:
  - Identifies death-over specialists, mystery spinners, and stumper-finishers to trigger priority AI bidding.
- **Purse-Pacing Algorithm**:
  - Computes dynamic ₹/slot pacing status (*Splurge, Balanced, Conserving, Critical Safety*) to prevent AI teams from overspending early.
- **10 Authentic Franchise Strategic Personas**:
  - Distinct archetypes for each team (e.g. CSK veteran loyalty, MI superstar aggressive bidding, RR data-driven scouting, SRH bowling depth, PBKS purse flex).
- **IPL Rivalry Matrix & Dynamic Bidding Wars (`BiddingWarBanner.jsx`)**:
  - Historic rivalry pairs (CSK vs MI, KKR vs RCB, CSK vs RCB, MI vs DC) trigger high-tempo Bidding Wars.
  - Dynamic tempo acceleration, rapid counter-bids, valuation markups, animated neon banners, and warning sound cues.
- **Live AI Scouting Wire & Team Needs Modal (`TeamNeedsModal.jsx`)**:
  - Real-time tactical insight ticker beneath the player showcase card.
  - Comprehensive 10-franchise needs dashboard accessible from the top header.

---

### Phase 3: Squad Chemistry, Playing XI Builder & Match Simulator
- **Playing XI Builder (`PlayingXIModal.jsx`)**:
  - Interactive 11-player lineup selection with designated Captain (C) and Vice-Captain (VC).
  - Batting order configuration (Slots 1 to 11).
  - Enforces official match regulations: $\le 4$ overseas players, $\ge 1$ wicketkeeper, $\ge 5$ bowling options, and exactly 11 players.
- **Squad Chemistry Rating System ($0\text{–}100$)**:
  - Multi-dimensional rating calculating **Batting Power**, **Bowling Penetration**, **Balance & Versatility**, and **Big-Match Experience**.
  - Tier classification medals: **S-Tier (Championship Contender)**, **A-Tier (Playoff Contender)**, and **B/C-Tier (Rebuilding Squad)**.
- **Full 45-Match IPL Season & Tournament Simulator (`TournamentSimulatorModal.jsx`)**:
  - Realistic ball-by-ball probabilistic T20 match engine factoring powerplay, middle, and death phases.
  - Live 10-team Points Table with Matches Played, Won, Lost, Points, and Net Run Rate (NRR).
  - 4-Stage IPL Playoffs: Qualifier 1, Eliminator, Qualifier 2, and Grand Final.
  - Victory ceremony with championship trophy and celebratory confetti animations.
- **Single Exhibition Match**:
  - Custom head-to-head match simulation against any rival franchise across 4 distinct pitch conditions (*Batting Paradise, Spinners Web, Green Top Pace, Balanced Sporting Pitch*) with full scorecards and Player of the Match honors.

---

### Phase 4: Audio FX, 3D Gavel & Immersion
- **Procedural Web Audio Engine (`audioEffects.js`)**:
  - Zero external MP3 dependencies; generated entirely client-side via Web Audio API nodes.
  - Hardwood gavel strike: transient click + wooden cavity bandpass resonance + sub-bass body thump.
  - 3-stage countdown tension clock ticks (3s, 2s, 1s) with rising pitch frequencies.
  - Distinct sound cues for bid paddle pops, high-bid chimes, rivalry war horns, and sold applause.
- **Synthesized Voice Commentary**:
  - Live auctioneer voice commentary powered by the browser SpeechSynthesis API.
  - Calls out bid raises, "Going once... Going twice...", "SOLD!", and RTM invocations.
  - Phonetic normalization ensuring crisp Indian English pronunciation of crore values and player names.
- **3D Animated Gavel Podium (`GavelPodium.jsx`)**:
  - Wooden block and brass gavel with dynamic tilt angles ($-24^\circ, -48^\circ, -72^\circ, +18^\circ$).
  - Sound wave visualizer bars, impact shockwave rings, and 3-stage tension lamps.
- **Audio Settings Suite (`AudioSettingsModal.jsx`)**:
  - Master volume slider, SFX toggle, speech commentary toggle, voice persona selector, speech rate slider, and 6-button sound test pad.

---

### Phase 5: Multiplayer, Custom Rosters, Persistence & Onboarding
- **Pass-and-Play Multi-Manager Mode (`MultiplayerSettingsModal.jsx`)**:
  - Supports 1 to 10 human franchise managers playing locally on one device.
  - Sequential pre-auction retention queue with step indicator.
  - Active Paddle Selector and dedicated direct multi-franchise bid buttons.
  - Human vs. Human and Human vs. AI Right to Match (RTM) duels.
- **Custom Player Studio & JSON Import/Export (`PlayerEditorModal.jsx`)**:
  - Create new custom players with custom roles, base prices, ratings, and IPL stats.
  - Edit existing player attributes, valuations, or remove players from the active pool.
  - One-click JSON export and import of custom roster databases.
- **Authentic Vintage & Dream Presets (`vintageRosters.js`)**:
  - **2025 Official Mega Auction**: Modern pool of 500+ cricketers.
  - **1998–2008 Historic Inaugural Auction**: MS Dhoni, Sachin Tendulkar, Shane Warne, Adam Gilchrist, Glenn McGrath, Sanath Jayasuriya, etc.
  - **All-Time Legends & T20 Titans**: Chris Gayle, AB de Villiers, Lasith Malinga, Kieron Pollard, Suresh Raina, etc.
- **LocalStorage State Persistence & Checkpoint Recovery (`storageUtils.js`)**:
  - Real-time debounced auto-saving of all teams, squads, current bid, auction sets, timers, and ledgers.
  - Automatic detection of saved sessions with a one-click **"▶ Resume Saved Auction"** restore banner.
  - Manual save (`💾 Save`) and clean reset (`🔄 Reset`) controls.
- **Welcome Starter Page & Onboarding Hub (`StarterPage.jsx`)**:
  - High-impact landing page with stadium lighting, franchise preview marquee, and feature breakdown cards.
  - Direct CTA routing for **"🚀 Enter Auction Arena"** (Solo mode) and **"👥 Pass & Play Mode"** (Multiplayer mode).
  - Smooth back-navigation (`← Back to Welcome`) from the team selection modal.
  - Built-in **"📖 How to Play"** quick-reference modal for instant rule and increment lookup.
- **Comprehensive User Manual (`document.md`)**:
  - Standalone 15-chapter handbook detailing every rule, slab, dynamic bracket, RTM scenario, and winning strategy for new players.

---

### Phase 6: Strategic Franchise Management & In-Game Rules (Completed)
- **Impact Player Rule (12th Man Substitution) (`PlayingXIModal.jsx` & `squadSimulator.js`)**:
  - Nominate up to 5 substitutes and a designated 12th Man Impact Player from bench reserves before matches.
  - Situational mid-innings tactical swaps: 1st innings batting firepower reinforcement and 2nd innings death-over bowling defense.
  - Full match substitution telemetry logging in match scorecards.
- **Mid-Season Transfer Window & Player Trades (`TradeCenterModal.jsx`)**:
  - Dedicated multi-franchise trade console accessible from top bar, tournament simulator, and post-auction screen.
  - Player-for-player swaps and cash-plus-player transactions with dynamic budget adjustments.
  - Strict regulatory enforcement: 18–25 squad limits, 8 overseas ceiling, and budget solvency.
  - 3-factor algorithmic AI evaluation engine (talent score balance, positional squad need synergy, and financial value).
- **Dynamic Player Form Streaks & Fitness Fatigue Engine (`playerFormUtils.js`)**:
  - 5 dynamic tiers: 🔥 On Fire (+15%), ⚡ In Form (+8%), ⚪ Standard (1.0x), ❄️ Slump (-10%), and ⚠️ Fatigued (-14%).
  - Fast-bowler fatigue accumulation across consecutive 4-over spells; stamina restoration when rested on the bench.
  - Real-time rating adjustments and visual badges across Playing XI and match simulator.
- **Multi-Year Franchise Mode & Annual Mini-Auctions (`MiniAuctionModal.jsx`)**:
  - Year-over-year progression (Season 1 → Season 2 → Season 3) carrying existing squads forward.
  - Squad retention & release window: release underperforming players to recover contract funds into the purse.
  - Injection of high-potential rookie draft talents (Arjun Verma, Kwena Maphaka, Sameer Rizvi, Cooper Connolly, Allah Ghazanfar, Musheer Khan).
  - Fast-paced live mini-auction floor with AI purse pacing and instant roster signing.

---

### Phase 7: Advanced Visuals, Broadcast Overlays & Social Media Reactions (Completed)
- **Broadcast Television Skin Themes (`src/utils/themeStyles.js`)**:
  - 4 authentic television skins: *Star Sports Ultra Gold*, *JioCinema Neon Night*, *Vintage 2008 Retro CRT*, and *IPL Dark Broadcast*.
  - Instant toggle button group in the header toolbar with dynamic theme badges and descriptions.
- **Interactive Match Worm & Manhattan Analytics Charts (`src/components/MatchWormChart.jsx`)**:
  - Vector SVG run-rate worm curve comparing Team 1 vs. Team 2 cumulative progression across 20 overs.
  - Interactive 20-over Manhattan bar charts displaying over-by-over runs and red dot wicket markers.
  - Fully embedded in `TournamentSimulatorModal.jsx` across both season league matches and quick exhibition matches.
- **Simulated Social Media Wire & Expert Franchise Report Cards (`src/utils/socialReactions.js` & `src/components/SocialFeedAndGradesModal.jsx`)**:
  - Live analyst and fan tweet ticker beneath the player showcase card with reactions to blockbuster bids, bargains, RTMs, and unsolds.
  - Pundit studio modal with 5 distinct commentator personas (Harsha B., Ian B., Aakash C., Simon D., CricFanatic).
  - Post-auction franchise report cards grading all 10 teams from **A+ to F** based on squad ratings, balance, and purse efficiency.
- **Head-to-Head Batter vs. Bowler Matchup Matrix (`src/data/headToHeadData.js` & `src/components/HeadToHeadModal.jsx`)**:
  - Curated face-off records between marquee IPL titans (Kohli vs Bumrah, Rohit vs Boult, Dhoni vs Narine, Klaasen vs Rashid, etc.).
  - Deterministic matchup generator (`synthesizeH2H`) capable of creating realistic head-to-head stats for any batter and bowler.
  - Strike rates, balls, dismissals, dot balls, boundary tallies, tactical tips, and expert verdicts.

---

### Phase 8: Real-Time Online Multiplayer & Cloud Rooms (Completed)
- **WebRTC / BroadcastChannel Cloud Auction Rooms (`src/utils/multiplayerSync.js` & `src/components/MultiplayerRoomModal.jsx`)**:
  - Real-time room synchronization via native `BroadcastChannel` (zero-latency multi-tab sync) and encrypted WebRTC DataChannel (cross-device P2P).
  - Join via custom room codes (`IPL-2025`), select roles (Auctioneer Host, Franchise Manager, or Spectator), and engage in the live banter & sledge box.
- **Dedicated Host / Auctioneer Gavel Mode (`src/components/AuctioneerHostModal.jsx`)**:
  - Live Auctioneer podium with gavel knockdown controls (Going Once, Going Twice, SOLD, UNSOLD).
  - Pacing governor with customizable timer countdown speeds (Manual host control, 3s Blitz, 5s Standard, 10s Tactical) and auction clock pause.
  - Interactive soundboard FX matrix (Gavel knock, tension ticks, warning gongs, outbid bells, sold fanfares).
- **Graphical Squad Cards & Social Share Studio (`src/components/SquadCardStudioModal.jsx`)**:
  - Broadcast-quality 300 DPI canvas-rendered team poster cards with official franchise colors, metrics, and full squad rosters.
  - Formats for 4:5 Instagram/Twitter portrait and 16:9 landscape wallpapers with direct PNG download and clipboard copy.
- **Community Roster Hub & Dream Squad Gallery (`src/components/CommunityRosterHubModal.jsx`)**:
  - Curated legendary squads (RCB 2016, MI 2020, CSK 2018, All-Time GOATs).
  - User custom squad publishing and direct loading into the tournament match simulator.

---

### Phase 9: Global T20 Leagues & Custom Tournament Creator (Completed)
- **Global T20 Franchise League Presets (`src/data/globalLeaguesData.js` & `src/components/GlobalLeaguesModal.jsx`)**:
  - Authentic presets for 5 global leagues:
    - 🇦🇺 **Big Bash League (BBL)**: 8 teams, A$20M purse, 4 overseas limit.
    - 🇿🇦 **SA20**: 6 teams, R40M purse, 5 overseas limit.
    - 🇺🇸 **Major League Cricket (MLC USA)**: 6 teams, $15M purse, 6 overseas limit.
    - 🇵🇰 **Pakistan Super League (PSL)**: 6 teams, $18M purse, 4 overseas limit.
    - 🏝️ **Caribbean Premier League (CPL)**: 6 teams, $12M purse, 4 overseas limit.
  - Enriched player pool with international superstars (Babar Azam, Shaheen Afridi, Glenn Maxwell, Heinrich Klaasen, Nicholas Pooran, Saurabh Netravalkar).
- **International T20 World Cup Draft Mode**:
  - 10 full international squads (India, Australia, England, South Africa, Pakistan, New Zealand, West Indies, Afghanistan, Sri Lanka, USA).
  - $100M draft cap with unrestricted international drafting and World Cup championship tournament simulation.
- **Custom Tournament & Rule Sandbox Builder**:
  - Total sandbox control: Custom tournament name, 4 to 10 teams, multi-currency ($ / £ / ₹ / R / A$), purse slider (30 to 200), overseas player quotas (0 to 11), squad limits, and timer speed governors.

---

## 3. Future Roadmap & Potential Next Features (What We Can Add)

With the core auction simulation, tactical AI, matchday engine, multiplayer, franchise progression, broadcast visuals, real-time cloud rooms, squad poster studio, global leagues, and custom rule sandbox fully operational, here are potential future ideas:

---

### Phase 10: Historical Replay Mode & Regional Broadcast Audio
1. **Historical Draft Replay Engine (2008–2024)**:
   - Relive pivotal auction moments from past seasons (e.g. 2011 Mega Auction, 2018 Comeback, 2022 Mega Auction).
2. **Multi-Language Commentary Synthesizer**:
   - Synthesized voice announcements in Hindi, English, and regional cricket dialects.
3. **Fantasy League Point Tracker**:
   - Calculate fantasy points for drafted players based on simulated tournament match performances.

---

## 4. Comprehensive Feature Status & Prioritization Matrix

| Phase | Feature / Capability | Category | Impact | Complexity | Status |
| :---: | :--- | :--- | :---: | :---: | :---: |
| **0** | 10 Official Franchises & ₹120 Cr Purses | Core | Very High | Low | **Completed** |
| **0** | Pre-Auction Retention Deduction Slabs | Core | Very High | Low | **Completed** |
| **0** | Drag-and-Drop Roster Management | Core | High | Low | **Completed** |
| **0** | Official Post-Auction PDF Report | Core | Medium | Low | **Completed** |
| **1** | Right to Match (RTM) 3-Stage Challenge Suite | Rules | Very High | Medium | **Completed** |
| **1** | 11+ Categorized Sets & Progression Catalog | Rules | High | Medium | **Completed** |
| **1** | Accelerated Round for Unsold Players (50% Off) | Rules | Medium | Medium | **Completed** |
| **1** | Strict Squad Limits (18–25) & 8 Overseas Cap | Rules | High | Low | **Completed** |
| **2** | Target-Aware AI Positional Need Matrices | AI | Very High | High | **Completed** |
| **2** | Specialist Tracking & ₹/Slot Purse Pacing | AI | High | Medium | **Completed** |
| **2** | 10 Authentic Franchise AI Personas | AI | High | Medium | **Completed** |
| **2** | IPL Rivalry Matrix & Dynamic Bidding Wars | AI | High | Medium | **Completed** |
| **3** | Playing XI Builder & Formation Rules | Gameplay | High | Medium | **Completed** |
| **3** | Squad Chemistry Rating Engine (0–100) | Gameplay | High | Medium | **Completed** |
| **3** | Full 45-Match IPL Season & Playoffs Simulator | Gameplay | Very High | High | **Completed** |
| **3** | Single Exhibition Match with 4 Pitch Types | Gameplay | Medium | Medium | **Completed** |
| **4** | Procedural Web Audio Oak Gavel & Tension Ticks | Immersion | High | Medium | **Completed** |
| **4** | Synthesized Auctioneer Voice Commentary | Immersion | High | Medium | **Completed** |
| **4** | 3D Animated Gavel Podium & Visualizer | Immersion | Medium | Medium | **Completed** |
| **4** | Comprehensive Audio Settings Suite | Immersion | Medium | Low | **Completed** |
| **5** | Pass-and-Play Multi-Manager Mode (1–10 Teams) | Multiplayer | Very High | Medium | **Completed** |
| **5** | Custom Player Studio & JSON Import/Export | Customization | High | Medium | **Completed** |
| **5** | 2008 Vintage & All-Time Legends Presets | Content | High | Low | **Completed** |
| **5** | LocalStorage Checkpoints & Session Recovery | Persistence | High | Low | **Completed** |
| **5** | Welcome Starter Page with Direct Navigation | Onboarding | High | Low | **Completed** |
| **5** | In-App Quick Guide & Standalone `document.md` | Documentation | High | Low | **Completed** |
| **6** | Impact Player Rule (12th Man Substitution) | Advanced Rules | High | Medium | **Completed** |
| **6** | Mid-Season Player Trades & Transfer Window | Advanced Rules | High | High | **Completed** |
| **6** | Dynamic Player Form Streaks & Fitness Fatigue | Simulation | Medium | Medium | **Completed** |
| **6** | Multi-Year Franchise Mode & Annual Mini-Auctions | Progression | Very High | Very High | **Completed** |
| **7** | TV Broadcast Graphic Skins (Star Sports/Jio) | Visuals | Medium | Low | **Completed** |
| **7** | Interactive Match Worm & Manhattan Charts | Analytics | Medium | Medium | **Completed** |
| **7** | Simulated Social Media Reaction Feed & Grades | Immersion | High | Low | **Completed** |
| **7** | Batter vs. Bowler Head-to-Head Matchup Matrix | Analytics | Medium | Medium | **Completed** |
| **8** | WebRTC / WebSocket Real-Time Online Multiplayer | Multiplayer | Very High | High | **Completed** |
| **8** | Dedicated Host / Auctioneer Gavel Mode | Multiplayer | High | Medium | **Completed** |
| **8** | Shareable Graphical Squad Cards (PNG) | Community | Medium | Low | **Completed** |
| **8** | Community Roster Hub & Dream Squad Gallery | Community | High | Medium | **Completed** |
| **9** | Global T20 Leagues Presets (BBL, PSL, CPL, SA20) | Content | High | Medium | **Completed** |
| **9** | International T20 World Cup Draft Mode | Content | High | Medium | **Completed** |
| **9** | Custom Tournament & Rule Sandbox Builder | Sandbox | High | High | **Completed** |
| **10** | Historical Draft Replay Mode (2008–2024) | Content | High | High | *Planned (P2)* |
| **10** | Multi-Language Commentary Synthesizer | Immersion | Medium | Medium | *Planned (P3)* |
| **10** | Fantasy Points & Performance Leaderboard | Gameplay | Medium | Low | *Planned (P3)* |
